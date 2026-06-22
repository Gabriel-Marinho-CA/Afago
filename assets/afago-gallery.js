/*
 * Galeria de mídia customizada da Afago.
 *
 * Define um custom element próprio <afago-gallery> (em vez de reusar o
 * <media-gallery> do Dawn, evitando colisão com quick-add/featured-product).
 * Mantém a API que o product-info.js usa:
 *   - estrutura: <afago-gallery> > ul[data-gallery-media] > li[data-media-id]
 *   - método: setActiveMedia(mediaId, scroll)
 *
 * Também faz o filtro de cor por `data-group-color` (lido do alt da imagem),
 * substituindo o antigo <tp-color-gallery>.
 */
if (!customElements.get('afago-gallery')) {
  customElements.define(
    'afago-gallery',
    class AfagoGallery extends HTMLElement {
      connectedCallback() {
        this.sectionId = this.dataset.section;
        this.colorIndex =
          this.dataset.colorIndex !== undefined && this.dataset.colorIndex !== ''
            ? parseInt(this.dataset.colorIndex, 10)
            : null;

        this.stage = this.querySelector('[data-gallery-media]');
        // Estrutura diferente da nossa (ex.: galeria padrão do Dawn em outra seção): não faz nada.
        if (!this.stage) return;

        this.thumbList = this.querySelector('[data-gallery-thumbs]');
        this.mobileQuery = window.matchMedia('(max-width: 749px)');

        this.bindThumbs();
        this.observeScroll();

        if (this.colorIndex !== null) {
          this.bindColorChange();
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.filterByColor(this.currentColor()), {
              once: true,
            });
          } else {
            this.filterByColor(this.currentColor());
          }
        }
      }

      get slides() {
        return Array.from(this.stage.querySelectorAll('[data-media-id]'));
      }

      get thumbs() {
        return this.thumbList ? Array.from(this.thumbList.querySelectorAll('[data-target]')) : [];
      }

      get isMobile() {
        return this.mobileQuery.matches;
      }

      normalize(value) {
        return (value || '').toLowerCase().trim().replace(/\s+/g, '-');
      }

      /* ----- Thumbnails ----- */
      bindThumbs() {
        if (!this.thumbList) return;
        // Delegação para sobreviver a alterações de DOM (troca de variante).
        this.thumbList.addEventListener('click', (event) => {
          const thumb = event.target.closest('[data-target]');
          if (!thumb) return;
          event.preventDefault();
          this.setActiveMedia(thumb.dataset.target, false);
        });
      }

      /* ----- Estado ativo ----- */
      markActive(mediaId) {
        const target = this.slides.find((slide) => slide.dataset.mediaId === mediaId);
        if (!target) return null;

        this.slides.forEach((slide) => slide.classList.toggle('is-active', slide === target));
        this.thumbs.forEach((thumb) => {
          const active = thumb.dataset.target === mediaId;
          thumb.classList.toggle('is-active', active);
          const button = thumb.querySelector('button') || thumb;
          if (active) {
            button.setAttribute('aria-current', 'true');
          } else {
            button.removeAttribute('aria-current');
          }
        });

        this.pauseInactiveMedia(target);
        return target;
      }

      // Assinatura compatível com product-info.js: setActiveMedia(mediaId, scroll)
      setActiveMedia(mediaId, scroll) {
        const target = this.markActive(mediaId);
        if (!target) {
          this.activateFirstVisible();
          return;
        }

        if (this.isMobile) {
          this.stage.scrollTo({
            left: target.offsetLeft - this.stage.offsetLeft,
            behavior: scroll ? 'smooth' : 'auto',
          });
        }
      }

      activateFirstVisible() {
        const first = this.slides.find((slide) => !slide.classList.contains('is-hidden'));
        if (first) this.setActiveMedia(first.dataset.mediaId, false);
      }

      pauseInactiveMedia(activeSlide) {
        this.slides.forEach((slide) => {
          if (slide === activeSlide) return;
          slide.querySelectorAll('video').forEach((video) => video.pause());
          const deferred = slide.querySelector('deferred-media');
          if (deferred) {
            const iframe = deferred.querySelector('iframe');
            if (iframe) deferred.replaceChild(iframe.cloneNode(false), iframe);
          }
        });
      }

      /* ----- Sincroniza estado ativo com o scroll no mobile ----- */
      observeScroll() {
        if (!('IntersectionObserver' in window)) return;
        this.observer = new IntersectionObserver(
          (entries) => {
            if (!this.isMobile) return;
            entries.forEach((entry) => {
              if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
                this.markActive(entry.target.dataset.mediaId);
              }
            });
          },
          { root: this.stage, threshold: [0.6] }
        );
        this.slides.forEach((slide) => this.observer.observe(slide));
      }

      /* ----- Filtro por cor (via alt -> data-group-color) ----- */
      currentColor() {
        const picker = document.querySelector('variant-radios, variant-selects');
        if (!picker) return '';
        const fieldset = picker.querySelectorAll('fieldset')[this.colorIndex];
        if (fieldset) {
          const checked = fieldset.querySelector('input:checked');
          if (checked) return checked.value;
        }
        const select = picker.querySelectorAll('select')[this.colorIndex];
        if (select) return select.value;
        return '';
      }

      bindColorChange() {
        document.addEventListener('change', (event) => {
          const picker = document.querySelector('variant-radios, variant-selects');
          if (!picker) return;
          const fieldset = picker.querySelectorAll('fieldset')[this.colorIndex];
          const select = picker.querySelectorAll('select')[this.colorIndex];
          if ((fieldset && fieldset.contains(event.target)) || (select && select === event.target)) {
            this.filterByColor(this.currentColor());
          }
        });
      }

      filterByColor(color) {
        if (!color) return;
        const target = this.normalize(color);

        const matches = (element) => {
          const group = element.dataset.groupColor;
          return !group || this.normalize(group) === target;
        };

        this.slides.forEach((slide) => slide.classList.toggle('is-hidden', !matches(slide)));
        this.thumbs.forEach((thumb) => thumb.classList.toggle('is-hidden', !matches(thumb)));

        const active = this.slides.find((slide) => slide.classList.contains('is-active'));
        if (!active || active.classList.contains('is-hidden')) {
          this.activateFirstVisible();
        }
      }
    }
  );
}
