/** Maps internal app slugs ↔ WooCommerce URL slugs from koncarelektro.rs. */

const INTERNAL_TO_WC_PARENT: Record<string, string> = {
  'aku-alat': 'akumulatorski-alat',
  'kosacice-i-trimeri': 'kosacice-i-trimeri-dobra',
  'rucni-alat': 'rucni-alat-i-pribor',
  kompresori: 'kompresori-i-pneumatski-alati',
  'poljoprivredni-program': 'poljoprivredni-alati-i-oprema',
  'potrosni-materijal': 'pribor',
};

/**
 * Extra WC slugs to try when the preferred remap is missing (e.g. staging vs live).
 * Preferred remap from INTERNAL_TO_WC_PARENT is always tried first.
 */
const WC_PARENT_SLUG_FALLBACKS: Record<string, string[]> = {
  'kosacice-i-trimeri': ['kosacice-i-trimeri'],
  'potrosni-materijal': ['pribor-i-potrosni-materijal'],
};

/** WC parent slugs that match internal slug 1:1 (no remap entry needed). */
const WC_DIRECT_ALATI_PARENTS = [
  'elektricni-alat',
  'agregati',
  'htz-oprema',
  'aparati-za-varenje',
  'oprema-za-dvoriste',
  'kosacice-i-trimeri',
] as const;

const WC_TO_INTERNAL_PARENT: Record<string, string> = Object.fromEntries(
  Object.entries(INTERNAL_TO_WC_PARENT).map(([internal, wc]) => [wc, internal]),
);

// Staging/live may use the unmapped slug while INTERNAL_TO_WC_PARENT points at a rename.
for (const [internal, fallbacks] of Object.entries(WC_PARENT_SLUG_FALLBACKS)) {
  for (const slug of fallbacks) {
    if (!(slug in WC_TO_INTERNAL_PARENT)) {
      WC_TO_INTERNAL_PARENT[slug] = internal;
    }
  }
}

const PROGRAM_TO_WC: Record<string, string> = {
  elektromaterijal: 'elektromaterijal-i-oprema',
  rasveta: 'rasveta',
  solarne: 'solarna-elektrana',
};

const WC_TO_PROGRAM: Record<string, string> = {
  'elektromaterijal-i-oprema': 'elektromaterijal',
  rasveta: 'rasveta',
  'solarna-elektrana': 'solarne',
};

export const PROGRAM_SLUGS = new Set(['elektromaterijal', 'rasveta', 'solarne']);

export const PROGRAM_WC_SLUGS = new Set(Object.values(PROGRAM_TO_WC));

/** All valid WC parent slugs under the Alati program branch. */
export const WC_ALATI_PARENT_SLUGS = new Set<string>([
  ...Object.values(INTERNAL_TO_WC_PARENT),
  ...WC_DIRECT_ALATI_PARENTS,
  ...Object.values(WC_PARENT_SLUG_FALLBACKS).flat(),
]);

export const toWcParentSlug = (internalSlug: string): string =>
  INTERNAL_TO_WC_PARENT[internalSlug] ?? internalSlug;

/**
 * Ordered WC parent slug candidates for an internal hub slug.
 * Prefer the production remap, then staging/live aliases, then the internal slug itself.
 */
export function wcParentSlugCandidates(internalSlug: string): string[] {
  const preferred = toWcParentSlug(internalSlug);
  const program = PROGRAM_TO_WC[internalSlug];
  const fallbacks = WC_PARENT_SLUG_FALLBACKS[internalSlug] ?? [];
  return [...new Set([preferred, program, ...fallbacks, internalSlug].filter(Boolean) as string[])];
}

export const toInternalParentSlug = (wcSlug: string): string =>
  WC_TO_INTERNAL_PARENT[wcSlug] ?? wcSlug;

/** Whether a URL segment is a known WooCommerce parent category for Alati. */
export const isKnownWcAlatiParent = (wcSlug: string): boolean =>
  WC_ALATI_PARENT_SLUGS.has(wcSlug);

export const programToWcSlug = (programId: string): string =>
  PROGRAM_TO_WC[programId] ?? programId;

export const wcToProgramSlug = (wcSlug: string): string | undefined =>
  WC_TO_PROGRAM[wcSlug];

/** WC category slug for Store API `category` filter from route segments. */
export function resolveListingCategorySlug(
  parentSlug: string,
  listingSlug?: string,
): string {
  if (listingSlug) {
    const segments = listingSlug.split('/').filter(Boolean);
    return segments[segments.length - 1] ?? listingSlug;
  }
  return toWcParentSlug(parentSlug);
}
