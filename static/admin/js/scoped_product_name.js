/* Narrow the Product name dropdown to the chosen category.
 *
 * The category isn't known when the add form first renders, so this filters
 * the <select> live. The allowed ids per category are embedded by the admin
 * as a JSON script tag, avoiding an extra request.
 */
(function () {
  'use strict';

  function init() {
    var dataEl = document.getElementById('category-product-names');
    var category = document.getElementById('id_category');
    var name = document.getElementById('id_product_name');
    if (!dataEl || !category || !name) { return; }

    var allowed;
    try { allowed = JSON.parse(dataEl.textContent); } catch (e) { return; }

    // Keep every option so we can restore them when the category changes.
    var all = Array.prototype.map.call(name.options, function (o) {
      return { value: o.value, text: o.text };
    });

    function apply() {
      var ids = allowed[category.value] || null;
      var previous = name.value;
      name.innerHTML = '';
      all.forEach(function (opt) {
        // '' is the empty "---------" choice and must always remain.
        if (opt.value === '' || ids === null || ids.indexOf(Number(opt.value)) !== -1) {
          name.add(new Option(opt.text, opt.value, false, opt.value === previous));
        }
      });
      // If the old selection is no longer valid, fall back to blank.
      if (name.value !== previous) { name.value = ''; }
    }

    category.addEventListener('change', apply);
    apply();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
