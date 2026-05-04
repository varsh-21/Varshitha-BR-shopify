document.addEventListener('DOMContentLoaded', function () {
  (function () {
    'use strict';

    /* ── DOM ── */
    const section       = document.getElementById('tisso-grid');
    const modal         = document.getElementById('tisso-modal');
    const modalImg      = document.getElementById('tisso-modal-img');
    const modalTitle    = document.getElementById('tisso-modal-title');
    const modalPrice    = document.getElementById('tisso-modal-price');
    const modalDesc     = document.getElementById('tisso-modal-desc');
    const modalVariants = document.getElementById('tisso-modal-variants');
    const modalAtc      = document.getElementById('tisso-modal-atc');
    const modalAtcLabel = document.getElementById('tisso-modal-atc-label');
    const modalStatus   = document.getElementById('tisso-modal-status');

    if (!section || !modal) {
      console.log("❌ modal not found");
      return;
    }
  // const JACKET_VARIANT_ID = 47582095671526;
  // const softJacketVariantId = JACKET_VARIANT_ID;
  
// Dynamics VariantId extraction
const softJacketVariantId = Number(section.dataset.softJacketVariant);

    console.log("Jacket Variant ID:", softJacketVariantId);

  console.log(typeof softJacketVariantId, softJacketVariantId);
    /* ── STATE ── */
    let state = {
      variants: [],
      options: [],
      selectedOptions: [],
      currentVariant: null
    };

    /* =============================================
      COLOR → CSS VALUE MAP
      Maps common color names to their CSS color
      so the left border shows the actual color.
      ============================================= */
    const COLOR_MAP = {
      'white':       '#ffffff',
      'black':       '#1a1a1a',
      'grey':        '#AFAFB7',
      'gray':        '#9e9e9e',
      'red':         '#B20F36',
      'blue':        '#0D499F',
      'navy':        '#1a237e',
      'green':       '#43a047',
      'yellow':      '#fdd835',
      'orange':      '#fb8c00',
      'pink':        '#e91e63',
      'purple':      '#8e24aa',
      'brown':       '#795548',
      'beige':       '#f5f0e8',
      'cream':       '#fffdd0',
      'olive':       '#808000',
      'teal':        '#00897b',
      'coral':       '#ff6b6b',
      'maroon':      '#800000',
      'gold':        '#ffc107',
      'silver':      '#bdbdbd',
      'charcoal':    '#37474f',
      'khaki':       '#c8b26a',
      'light blue':  '#90caf9',
      'dark blue':   '#1565c0',
      'light grey':  '#e0e0e0',
      'dark grey':   '#616161',
    };

    /**
     * Gets the CSS color value for a given color name.
     * Falls back to a mid-grey if unknown.
     * @param {string} colorName
     * @returns {string} CSS color string
     */
    function getColorValue(colorName) {
      const key = colorName.trim().toLowerCase();
      return COLOR_MAP[key] || colorName; // try direct CSS color name too
    }

    /* =============================================
      OPEN MODAL
      ============================================= */
    function openModal(item) {
      const title    = item.dataset.productTitle    || '';
      const price    = item.dataset.productPrice    || '';
      const desc     = item.dataset.productDescription || '';
      const image    = item.dataset.productImage    || '';
      const variants = JSON.parse(decodeURIComponent(item.dataset.productVariants || '%5B%5D'));
      const options  = JSON.parse(decodeURIComponent(item.dataset.productOptions  || '%5B%5D'));

      /* Populate static fields */
      modalImg.src           = image;
      modalImg.alt           = title;
      modalTitle.textContent = title;
      modalPrice.textContent = price;
      modalDesc.textContent  = desc;

      /* Reset state */console.log("Trigger check:", needsSoftJacket(state.currentVariant));
      state = {
        variants,
        options,
        selectedOptions: options.map(() => ''),
        currentVariant: null
      };

      /* Build variant UI */
      renderVariants(options, variants);

      /* Reset ATC */
      setAtc(false, 'ADD TO CART');
      clearStatus();

      /* Open */
      modal.setAttribute('aria-hidden', 'false');
      modal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      modal.querySelector('.tisso-modal__close').focus();
    }

    /* =============================================
      CLOSE MODAL
      ============================================= */
    function closeModal() {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    /* =============================================
      RENDER VARIANT SELECTORS
      ============================================= */
    function renderVariants(options, variants) {
      modalVariants.innerHTML = '';

      options.forEach((option, idx) => {
        const wrap = document.createElement('div');
        wrap.className = 'tisso-modal__option';

        /* Label */
        const label = document.createElement('p');
        label.className = 'tisso-modal__option-label';
        label.textContent = option.name;
        wrap.appendChild(label);

        const isColor = /colou?r/i.test(option.name);

        if (isColor) {
          /* ── COLOR SWATCHES with left border color ── */
          const list = document.createElement('ul');
          list.className = 'tisso-modal__swatches';

          option.values.forEach((value) => {
            const li  = document.createElement('li');
            li.style.listStyle = 'none';

            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'tisso-modal__swatch';
            btn.textContent = value;

            /* Set left border to the actual color */
            const cssColor = getColorValue(value);
            btn.style.borderLeftColor = cssColor;

            /* Add white outline to white swatch so it's visible */
            if (cssColor === '#ffffff' || cssColor === 'white') {
              btn.style.borderLeftColor = '#cccccc';
            }

            btn.dataset.optionIndex = idx;
            btn.dataset.value = value;

            btn.addEventListener('click', () => {
              list.querySelectorAll('.tisso-modal__swatch').forEach(s => s.classList.remove('is-selected'));
              btn.classList.add('is-selected');
              state.selectedOptions[idx] = value;
              updateVariant();
            });

            li.appendChild(btn);
            list.appendChild(li);
          });

          wrap.appendChild(list);

        } else {
          /* ── SIZE DROPDOWN ── */
          const selectWrap = document.createElement('div');
          selectWrap.className = 'tisso-modal__select-wrap';

          const select = document.createElement('select');
          select.className = 'tisso-modal__size-select';
          select.dataset.optionIndex = idx;

          const placeholder = new Option('Choose your size', '', true, true);
          placeholder.disabled = true;
          select.appendChild(placeholder);

          option.values.forEach((value) => {
            select.appendChild(new Option(value, value));
          });

          select.addEventListener('change', () => {
            state.selectedOptions[idx] = select.value;
            updateVariant();
          });

          selectWrap.appendChild(select);
          wrap.appendChild(selectWrap);
        }

        modalVariants.appendChild(wrap);
      });
    }

    /* =============================================
      MATCH SELECTED OPTIONS → VARIANT
      ============================================= */
    function updateVariant() {
      const { variants, options, selectedOptions } = state;
      const allPicked = selectedOptions.every(v => v !== '');

      if (!allPicked) {
        state.currentVariant = null;
        setAtc(false, 'ADD TO CART');
        return;
      }

      const match = variants.find(v =>
        options.every((_, i) => v['option' + (i + 1)] === selectedOptions[i])
      );

      state.currentVariant = match || null;

      if (match) {
        modalPrice.textContent = match.price;
        setAtc(match.available, match.available ? 'ADD TO CART' : 'SOLD OUT');
      } else {
        setAtc(false, 'UNAVAILABLE');
      }
      console.log("Trigger check:", needsSoftJacket(state.currentVariant));
    }

    /* =============================================
      ATC HELPERS
      ============================================= */
    function setAtc(enabled, label) {
      modalAtc.disabled = !enabled;
      modalAtcLabel.textContent = label;
    }

    function clearStatus() {
      modalStatus.textContent = '';
      modalStatus.className = 'tisso-modal__status';
    }

    /* =============================================
      CHECK AUTO-ADD RULE
      Black + Medium → add Soft Winter Jacket
      ============================================= */

  /* =============================================
    CHECK AUTO-ADD RULE
    Black + Medium → add Soft Winter Jacket
    (matches by option NAME, not position)
    ============================================= */
  function needsSoftJacket(variant) {
    if (!variant || !softJacketVariantId) return false;  // 0 is falsy, so this still guards correctly

    const optionValueMap = {};
    state.options.forEach((opt, i) => {
      optionValueMap[opt.name.toLowerCase().trim()] = (variant['option' + (i + 1)] || '').toLowerCase().trim();
    });

    const colorVal = optionValueMap['color'] || optionValueMap['colour'] || '';
    const sizeVal  = optionValueMap['size']  || '';

    console.log('🎨 color:', colorVal, '📐 size:', sizeVal, '🧥 jacketId:', softJacketVariantId);

    return colorVal === 'black' && (sizeVal === 'm' || sizeVal === 'medium');
  }
    /* =============================================
      AJAX ADD TO CART
      ============================================= */
    async function addToCart(items) {
      const res = await fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.description || 'Could not add to cart');
      }
      return res.json();
      console.log("Current Variant:", currentVariant);
    }

    /* ATC click */
    modalAtc.addEventListener('click', async () => {
      const { currentVariant } = state;
  if (!currentVariant) return; // ✅ prevent null error

  const items = [{ id: currentVariant.id, quantity: 1 }];

  // DEBUG
  console.log("Selected Variant:", currentVariant);

  if (needsSoftJacket(currentVariant)) {
    console.log("🎁 Jacket condition matched!");
    items.push({ id: softJacketVariantId, quantity: 1 });
  }

  console.log("Soft Jacket Variant ID:", softJacketVariantId);
  console.log("Items being added:", items);

  try {
    await addToCart(items);

    /* Refresh cart bubble */
    document.dispatchEvent(new CustomEvent('tisso:cart:refresh'));

    const extra = items.length > 1 ? ' + Soft Winter Jacket added!' : '';
    modalStatus.textContent = 'Added to cart!' + extra;
    modalStatus.classList.add('is-success');
    setAtc(true, 'ADD TO CART');

  } catch (err) {
    console.error("Add to cart error:", err);

    modalStatus.textContent = err.message || 'Something went wrong.';
    modalStatus.classList.add('is-error');
    setAtc(true, 'ADD TO CART');
  }
      console.log("Current Variant:", currentVariant);
    });

    /* =============================================
      CART BUBBLE REFRESH
      ============================================= */
    document.addEventListener('tisso:cart:refresh', async () => {
      try {
        const res  = await fetch('/cart.js');
        const data = await res.json();
        document.querySelectorAll(
          '.cart-count-bubble span[aria-hidden="true"], .cart-count-bubble span:not([aria-hidden])'
        ).forEach(el => { el.textContent = data.item_count; });
      } catch (_) {}
    });

    /* =============================================
      EVENT DELEGATION — open / close
      ============================================= */
    section.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-open-modal]');
      if (!btn) return;
      const item = btn.closest('[data-product-id]');
      if (item) openModal(item);
    });

    modal.addEventListener('click', (e) => {
      if (e.target.closest('[data-modal-close]')) closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
    });

  })();
});

