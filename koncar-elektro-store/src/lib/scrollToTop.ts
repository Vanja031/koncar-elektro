/** Reliable window scroll-to-top (smooth scroll often aborts when listing reflows). */
export function scrollWindowToTop() {
  if (typeof window === 'undefined') return;
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

function runScheduled(scrollFn: () => void) {
  scrollFn();
  if (typeof window === 'undefined') return;
  requestAnimationFrame(() => {
    scrollFn();
    window.setTimeout(scrollFn, 80);
    window.setTimeout(scrollFn, 280);
  });
}

/** Scroll now + again after layout/fetch so filter apply always lands at top. */
export function scheduleScrollToTop() {
  runScheduled(scrollWindowToTop);
}

const MOBILE_LISTING_MQ = '(max-width: 1023px)'; // matches `lg:` catalog breakpoint
const LISTING_SELECTOR = '[data-catalog-listing]';

/** Mobile: scroll to listing (below breadcrumbs hero). Desktop: page top. */
export function scheduleScrollAfterFilterApply() {
  if (typeof window === 'undefined') return;

  const isMobile = window.matchMedia(MOBILE_LISTING_MQ).matches;
  if (!isMobile) {
    scheduleScrollToTop();
    return;
  }

  const scrollToListing = () => {
    const el = document.querySelector(LISTING_SELECTOR);
    if (!el) {
      scrollWindowToTop();
      return;
    }
    const headerOffset = 8;
    const top = el.getBoundingClientRect().top + window.scrollY - headerOffset;
    window.scrollTo({ top: Math.max(0, top), left: 0, behavior: 'auto' });
  };

  runScheduled(scrollToListing);
}
