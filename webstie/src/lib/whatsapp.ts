export function buildWhatsAppLink(whatsappNumber: string, message: string): string {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
}

/** Fills a booking message template (from SiteSettings) with the given values. */
export function renderBookingMessage(
  template: string,
  vars: { modelLabel: string; categoryLabel: string; imageUrl?: string },
): string {
  return template
    .replaceAll('{{modelLabel}}', vars.modelLabel)
    .replaceAll('{{categoryLabel}}', vars.categoryLabel)
    .replaceAll('{{imageUrl}}', vars.imageUrl ?? '')
}

export function buildBookingLink(
  whatsappNumber: string,
  template: string,
  vars: { modelLabel: string; categoryLabel: string; imageUrl?: string },
): string {
  return buildWhatsAppLink(whatsappNumber, renderBookingMessage(template, vars))
}
