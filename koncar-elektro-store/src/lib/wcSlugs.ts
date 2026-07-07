/** Maps internal app slugs ↔ WooCommerce URL slugs from koncarelektro.rs. */

const INTERNAL_TO_WC_PARENT: Record<string, string> = {
  'aku-alat': 'akumulatorski-alat',
  'kosacice-i-trimeri': 'kosacice-i-trimeri-dobra',
  'rucni-alat': 'rucni-alat-i-pribor',
  kompresori: 'kompresori-i-pneumatski-alati',
  'poljoprivredni-program': 'poljoprivredni-alati-i-oprema',
  'potrosni-materijal': 'pribor',
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
]);

export const toWcParentSlug = (internalSlug: string): string =>
  INTERNAL_TO_WC_PARENT[internalSlug] ?? internalSlug;

export const toInternalParentSlug = (wcSlug: string): string =>
  WC_TO_INTERNAL_PARENT[wcSlug] ?? wcSlug;

/** Whether a URL segment is a known WooCommerce parent category for Alati. */
export const isKnownWcAlatiParent = (wcSlug: string): boolean =>
  WC_ALATI_PARENT_SLUGS.has(wcSlug);

export const programToWcSlug = (programId: string): string =>
  PROGRAM_TO_WC[programId] ?? programId;

export const wcToProgramSlug = (wcSlug: string): string | undefined =>
  WC_TO_PROGRAM[wcSlug];
