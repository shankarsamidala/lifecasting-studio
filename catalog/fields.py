"""Image handling for admin uploads.

Everything the studio uploads through Django admin passes through
``OptimizedImageField``, which converts it to WebP, caps its dimensions and
strips camera metadata before it reaches storage. Nothing downstream has to
remember to do it.

Why each step matters here:

* **EXIF orientation is applied before metadata is dropped.** Phone cameras
  record rotation as a metadata tag rather than rotating the pixels. Strip the
  metadata first and portrait photos silently come out sideways — the classic
  version of this bug.
* **Metadata is stripped.** Phone photos carry GPS coordinates. This studio
  photographs newborns, often in customers' homes; publishing the location a
  baby photo was taken is a privacy problem, not a file-size one.
* **Failures keep the original.** If Pillow can't read an upload, the original
  file is stored unchanged. An oversized image is a small problem; a lost
  upload is a real one.
"""

from io import BytesIO
import os

from django.core.files.base import ContentFile
from django.db.models import ImageField
from PIL import Image, ImageOps

# Long edge in pixels. The largest place any of these renders is the mobile
# hero carousel at roughly 310 CSS px, which needs ~930px at 3x device pixel
# ratio. 1600 leaves headroom for re-cropping later without a re-upload.
MAX_EDGE = 1600
QUALITY = 82


def optimize_image(file_obj, max_edge=MAX_EDGE, quality=QUALITY):
    """Return ``(ContentFile, filename)`` for a WebP copy, or ``None``.

    ``None`` means "store the original unchanged" — either the upload isn't a
    readable image, or converting it would make it bigger.
    """
    try:
        file_obj.seek(0)
        img = Image.open(file_obj)

        # Rotate the pixels to match the EXIF orientation tag, while we still
        # have the tag. Everything after this point can safely discard it.
        img = ImageOps.exif_transpose(img)

        has_alpha = img.mode in ("RGBA", "LA") or (
            img.mode == "P" and "transparency" in img.info
        )
        img = img.convert("RGBA" if has_alpha else "RGB")

        if max(img.size) > max_edge:
            scale = max_edge / max(img.size)
            img = img.resize(
                (round(img.width * scale), round(img.height * scale)),
                Image.LANCZOS,
            )

        buffer = BytesIO()
        # Pillow writes no EXIF unless asked, so the GPS and device tags are
        # dropped here simply by not carrying them over.
        img.save(buffer, "WEBP", quality=quality, method=6)
        data = buffer.getvalue()
    except Exception:
        # Unreadable, corrupt, or an unsupported format — keep what was sent.
        return None

    original_size = getattr(file_obj, "size", None)
    if original_size and len(data) >= original_size:
        # Already smaller than anything we'd produce (a tuned WebP or a tiny
        # asset). Re-encoding would only lose quality.
        return None

    stem = os.path.splitext(os.path.basename(file_obj.name))[0]
    return ContentFile(data), f"{stem}.webp"


class OptimizedImageField(ImageField):
    """``ImageField`` that optimizes on the way in.

    Behaves exactly like ``ImageField`` in migrations and forms; the only
    difference is what lands in storage.
    """

    def pre_save(self, model_instance, add):
        file = getattr(model_instance, self.attname)

        # This must happen BEFORE FileField.pre_save runs. That method writes
        # the file to storage itself and flips ``_committed`` to True, so any
        # work done after calling super() would be optimizing a file that had
        # already been saved — and the original would stay on disk.
        #
        # ``_committed`` is False only for a freshly uploaded file, so editing
        # a row without touching its image is left alone.
        if file and not file._committed:
            result = optimize_image(file)
            if result is not None:
                content, name = result
                # Swapping these makes super() commit the optimized bytes
                # under the .webp name, in a single write.
                file.file = content
                file.name = name

        return super().pre_save(model_instance, add)
