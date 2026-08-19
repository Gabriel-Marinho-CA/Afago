if (!customElements.get('variant-kits')) {
  customElements.define(
    'variant-kits',
    class VariantKits extends HTMLElement {
      constructor() {
        super();
        this.onChange = this.onChange.bind(this);
        this.onFormSubmit = this.onFormSubmit.bind(this);
        this.onPickerPointerDown = this.onPickerPointerDown.bind(this);
        this.onPickerClick = this.onPickerClick.bind(this);
        this.restoreMainVariant = this.restoreMainVariant.bind(this);
      }

      connectedCallback() {
        this.sectionId = this.dataset.sectionId;
        this.productFormId = this.dataset.productFormId;
        this.includeMainProduct = this.dataset.includeMainProduct === 'true';
        this.shouldUpdatePrice = this.dataset.updatePrice !== 'false';
        this.basePrice = parseInt(this.dataset.basePrice, 10) || 0;
        this.baseComparePrice = parseInt(this.dataset.baseComparePrice, 10) || 0;
        this.baseAvailable = this.dataset.baseAvailable === 'true';
        this.allowMainDeselect = this.dataset.allowMainDeselect === 'true';
        this.mainDeselected = false;
        this.totalElement = this.querySelector('[data-kit-total]');
        this.mainNotice = this.querySelector('[data-kit-main]');

        this.items = Array.from(this.querySelectorAll('[data-kit-item]')).map((element) => {
          const json = element.querySelector('[data-kit-variants]');
          let variants = [];

          try {
            variants = JSON.parse(json.textContent);
          } catch (error) {
            console.error('variant-kits: invalid variant JSON', error);
          }

          return {
            element,
            variants,
            // An item without a single available variant can never be
            // completed, so it is dropped instead of locking the buy button.
            hasStock: variants.some((variant) => variant.available),
            priceElement: element.querySelector('[data-kit-item-price]'),
            stockElement: element.querySelector('[data-kit-item-stock]'),
            optionFieldsets: Array.from(element.querySelectorAll('[data-kit-option]')),
            selectedVariant: null,
          };
        });

        this.items.forEach((item) => {
          if (!item.hasStock) item.element.hidden = true;
        });

        this.items = this.items.filter((item) => item.hasStock);

        this.addEventListener('change', this.onChange);
        document.addEventListener('submit', this.onFormSubmit, true);
        this.setupMainProductToggle();

        if (typeof subscribe === 'function') {
          this.variantChangeUnsubscriber = subscribe(PUB_SUB_EVENTS.variantChange, (event) => {
            if (event.data.sectionId !== this.sectionId) return;
            // Any real option change re-selects the main product.
            this.setMainDeselected(false);
            this.baseAvailable = !!event.data.variant && event.data.variant.available !== false;
            if (this.includeMainProduct) {
              this.basePrice = event.data.variant ? event.data.variant.price : 0;
              this.baseComparePrice = event.data.variant ? event.data.variant.compare_at_price || 0 : 0;
            }
            this.update();
          });
        }

        this.update();
      }

      disconnectedCallback() {
        document.removeEventListener('submit', this.onFormSubmit, true);
        this.productInfo?.removeEventListener('pointerdown', this.onPickerPointerDown, true);
        this.productInfo?.removeEventListener('click', this.onPickerClick);
        this.variantChangeUnsubscriber?.();
      }

      onChange() {
        this.update();
      }

      /* ------------------------------------------------------------------ */
      /* Main product opt-out                                               */
      /* ------------------------------------------------------------------ */

      // Clicking the already selected option of the main product unselects it,
      // so the customer can buy only the kit items. Listeners live on
      // <product-info> because the variant picker markup is replaced on every
      // variant change.
      setupMainProductToggle() {
        if (!this.allowMainDeselect) return;

        this.productInfo = this.closest('product-info');
        if (!this.productInfo) return;

        this.productInfo.addEventListener('pointerdown', this.onPickerPointerDown, true);
        this.productInfo.addEventListener('click', this.onPickerClick);
        this.querySelector('[data-kit-main-restore]')?.addEventListener('click', this.restoreMainVariant);
      }

      // Resolves the radio input behind a pointerdown on either the input or its label.
      mainPickerInput(target) {
        if (!(target instanceof Element)) return null;

        const selects = target.closest('variant-selects');
        if (!selects || selects.dataset.section !== this.sectionId) return null;

        if (target instanceof HTMLInputElement && target.type === 'radio') return target;

        const label = target.closest('label[for]');
        return label ? document.getElementById(label.htmlFor) : null;
      }

      // The checked state is already flipped by the time `click` fires, so the
      // previous state has to be captured beforehand.
      onPickerPointerDown(event) {
        const input = this.mainPickerInput(event.target);
        this.pointerWasChecked = !!input && input.checked;
      }

      onPickerClick(event) {
        const target = event.target;
        // Clicking a label also dispatches a click on its input; only the input
        // click may consume the pointer state, which pointerdown always resets.
        if (!(target instanceof HTMLInputElement) || target.type !== 'radio') return;

        const selects = target.closest('variant-selects');
        if (!selects || selects.dataset.section !== this.sectionId) return;

        const wasChecked = this.pointerWasChecked;
        this.pointerWasChecked = false;
        if (!wasChecked) return;

        // Unchecking programmatically fires no `change`, so the theme does not
        // re-render the section with the default variant.
        target.checked = false;
        setTimeout(() => {
          target.checked = false;
        });

        const selectedValue = target.closest('.product-form__input')?.querySelector('[data-selected-value]');
        if (selectedValue) {
          selectedValue.dataset.kitPreviousValue = selectedValue.textContent;
          selectedValue.textContent = '';
        }

        this.lastDeselectedInputId = target.id;
        this.setMainDeselected(true);
        this.update();
      }

      restoreMainVariant() {
        const input = this.lastDeselectedInputId ? document.getElementById(this.lastDeselectedInputId) : null;

        if (input) {
          input.checked = true;
          input.dispatchEvent(new Event('change', { bubbles: true }));
          return;
        }

        this.setMainDeselected(false);
        this.update();
      }

      setMainDeselected(value) {
        if (this.mainDeselected === value) return;

        this.mainDeselected = value;
        this.classList.toggle('variant-kits--main-removed', value);
        if (this.mainNotice) this.mainNotice.hidden = !value;

        const variantInput = this.form?.querySelector('[name="id"]');
        if (variantInput) variantInput.disabled = value;

        if (!value) {
          const selectedValue = document.querySelector(
            `variant-selects[data-section="${this.sectionId}"] [data-selected-value][data-kit-previous-value]`
          );
          if (selectedValue) {
            selectedValue.textContent = selectedValue.dataset.kitPreviousValue;
            delete selectedValue.dataset.kitPreviousValue;
          }
        }
      }

      get mainProductIncluded() {
        return this.includeMainProduct && !this.mainDeselected;
      }

      /* ------------------------------------------------------------------ */
      /* State                                                              */
      /* ------------------------------------------------------------------ */

      update() {
        this.items.forEach((item) => {
          item.selectedVariant = this.resolveVariant(item);
          this.updateOptionAvailability(item);
          this.updateSelectedValueLabels(item);
          this.updateItemInfo(item);
        });

        this.updatePrices();
        this.updateSubmitButton();
      }

      get isComplete() {
        if (this.items.length === 0) return false;
        if (this.mainProductIncluded && !this.baseAvailable) return false;

        return this.items.every((item) => item.selectedVariant && item.selectedVariant.available);
      }

      selectedValues(item) {
        return item.optionFieldsets.map((fieldset) => {
          const checked = fieldset.querySelector('input[type="radio"]:checked');
          return checked ? checked.value : null;
        });
      }

      resolveVariant(item) {
        // Products with a single default variant need no selection.
        if (item.optionFieldsets.length === 0) return item.variants[0] || null;

        const values = this.selectedValues(item);
        if (values.some((value) => value === null)) return null;

        return item.variants.find((variant) => values.every((value, index) => variant.options[index] === value)) || null;
      }

      // Greys out option values that cannot lead to an available variant, taking
      // the already selected values of the other options into account.
      updateOptionAvailability(item) {
        if (item.optionFieldsets.length < 2) return;

        const values = this.selectedValues(item);

        item.optionFieldsets.forEach((fieldset, fieldsetIndex) => {
          fieldset.querySelectorAll('input[type="radio"]').forEach((input) => {
            const candidate = values.slice();
            candidate[fieldsetIndex] = input.value;

            const available = item.variants.some(
              (variant) =>
                variant.available &&
                candidate.every((value, index) => value === null || variant.options[index] === value)
            );

            input.classList.toggle('disabled', !available);
          });
        });
      }

      // Mirrors the "COR: AZUL CLARO" legend of the main variant picker.
      updateSelectedValueLabels(item) {
        item.optionFieldsets.forEach((fieldset) => {
          const label = fieldset.querySelector('[data-kit-selected-value]');
          if (!label) return;

          const checked = fieldset.querySelector('input[type="radio"]:checked');
          label.textContent = checked ? `: ${checked.value}` : '';
        });
      }

      updateItemInfo(item) {
        const variant = item.selectedVariant;

        if (item.priceElement && variant) {
          item.priceElement.textContent = this.formatMoney(variant.price);
        }

        if (!item.stockElement) return;

        if (variant && variant.available && variant.inventory_managed && variant.inventory_quantity > 0 && variant.inventory_quantity < 3) {
          item.stockElement.textContent = 'Poucas unidades';
          item.stockElement.hidden = false;
        } else if (variant && !variant.available) {
          item.stockElement.textContent = 'Indisponível';
          item.stockElement.hidden = false;
        } else {
          item.stockElement.hidden = true;
        }
      }

      /* ------------------------------------------------------------------ */
      /* Price                                                              */
      /* ------------------------------------------------------------------ */

      get totalPrice() {
        return this.items.reduce(
          (total, item) => total + (item.selectedVariant ? item.selectedVariant.price : 0),
          this.mainProductIncluded ? this.basePrice : 0
        );
      }

      get totalComparePrice() {
        return this.items.reduce((total, item) => {
          if (!item.selectedVariant) return total;
          return total + (item.selectedVariant.compare_at_price || item.selectedVariant.price);
        }, this.mainProductIncluded ? this.baseComparePrice || this.basePrice : 0);
      }

      updatePrices() {
        const total = this.totalPrice;

        if (this.totalElement) {
          this.totalElement.textContent = this.isComplete ? this.formatMoney(total) : '—';
        }

        if (!this.shouldUpdatePrice || !this.isComplete) return;

        const priceContainer = document.getElementById(`price-${this.sectionId}`);
        if (!priceContainer) return;

        const spotPrice = priceContainer.querySelector('.spot-price');
        const comparePrice = priceContainer.querySelector('.compare-price');
        const installments = priceContainer.querySelector('.installments');
        const compareTotal = this.totalComparePrice;

        if (spotPrice) spotPrice.textContent = this.formatMoney(total);

        if (comparePrice) {
          if (compareTotal > total) {
            comparePrice.textContent = this.formatMoney(compareTotal);
            comparePrice.hidden = false;
          } else {
            comparePrice.hidden = true;
          }
        }

        if (installments) {
          installments.textContent = `ou 6× de ${this.formatMoney(Math.round(total / 6))} sem juros`;
        }
      }

      formatMoney(cents) {
        const currency = (window.Shopify && window.Shopify.currency && window.Shopify.currency.active) || 'BRL';

        try {
          return new Intl.NumberFormat(document.documentElement.lang || 'pt-BR', {
            style: 'currency',
            currency,
          }).format(cents / 100);
        } catch (error) {
          return (cents / 100).toFixed(2);
        }
      }

      /* ------------------------------------------------------------------ */
      /* Add to cart                                                        */
      /* ------------------------------------------------------------------ */

      get form() {
        return document.getElementById(this.productFormId);
      }

      get submitButton() {
        return document.getElementById(`ProductSubmitButton-${this.sectionId}`);
      }

      get cart() {
        return document.querySelector('cart-notification') || document.querySelector('cart-drawer');
      }

      updateSubmitButton() {
        const button = this.submitButton;
        if (!button) return;

        // The main variant is sold out: leave the theme's own sold-out state alone.
        if (this.mainProductIncluded && !this.baseAvailable) return;

        const text = button.querySelector('span');
        if (text && this.defaultButtonText === undefined) this.defaultButtonText = text.textContent;

        if (this.isComplete) {
          button.removeAttribute('disabled');
          button.removeAttribute('aria-disabled');
          if (text && this.defaultButtonText !== undefined) text.textContent = this.defaultButtonText;
        } else {
          button.setAttribute('disabled', 'disabled');
          if (text) text.textContent = this.dataset.incompleteText;
        }
      }

      onFormSubmit(event) {
        const form = event.target;
        if (!(form instanceof HTMLFormElement) || form.id !== this.productFormId) return;

        event.preventDefault();
        event.stopPropagation();

        if (!this.isComplete) return;

        this.addKitToCart(form);
      }

      buildItems(form) {
        const quantityInput = form.querySelector('[name="quantity"]');
        const quantity = Math.max(parseInt(quantityInput?.value, 10) || 1, 1);
        const items = [];

        if (this.mainProductIncluded) {
          const variantInput = form.querySelector('[name="id"]');
          if (variantInput && variantInput.value) {
            items.push({ id: Number(variantInput.value), quantity });
          }
        }

        this.items.forEach((item) => {
          items.push({ id: item.selectedVariant.id, quantity });
        });

        return items;
      }

      addKitToCart(form) {
        const button = this.submitButton;
        const productForm = form.closest('product-form');
        const spinner = productForm?.querySelector('.loading__spinner');
        const cart = this.cart;

        button?.setAttribute('aria-disabled', 'true');
        button?.classList.add('loading');
        spinner?.classList.remove('hidden');
        this.showError(productForm, false);

        const body = { items: this.buildItems(form) };

        if (cart) {
          body.sections = cart.getSectionsToRender().map((section) => section.id);
          body.sections_url = window.location.pathname;
          cart.setActiveElement?.(document.activeElement);
        }

        const config = fetchConfig('javascript');
        config.headers['X-Requested-With'] = 'XMLHttpRequest';
        config.body = JSON.stringify(body);

        fetch(`${routes.cart_add_url}`, config)
          .then((response) => response.json())
          .then((response) => {
            if (response.status) {
              this.showError(productForm, response.description || response.message);

              if (typeof publish === 'function') {
                publish(PUB_SUB_EVENTS.cartError, {
                  source: 'variant-kits',
                  errors: response.errors || response.description,
                  message: response.message,
                });
              }
              return;
            }

            if (!cart) {
              window.location = window.routes.cart_url;
              return;
            }

            if (typeof publish === 'function') {
              publish(PUB_SUB_EVENTS.cartUpdate, {
                source: 'variant-kits',
                cartData: response,
              });
            }

            // A multi-item add returns `{ items: [...] }` instead of a single
            // line item, but cart-notification expects `key`/`id` at the root.
            if (Array.isArray(response.items) && response.items.length > 0) {
              cart.renderContents({ ...response.items[0], ...response });
            } else {
              cart.renderContents(response);
            }
          })
          .catch((error) => {
            console.error(error);
          })
          .finally(() => {
            button?.classList.remove('loading');
            button?.removeAttribute('aria-disabled');
            spinner?.classList.add('hidden');
            if (cart && cart.classList.contains('is-empty')) cart.classList.remove('is-empty');
          });
      }

      showError(productForm, message) {
        const wrapper = productForm?.querySelector('.product-form__error-message-wrapper');
        if (!wrapper) return;

        wrapper.toggleAttribute('hidden', !message);
        if (message) {
          wrapper.querySelector('.product-form__error-message').textContent = message;
        }
      }
    }
  );
}
