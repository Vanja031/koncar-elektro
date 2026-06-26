/** Maps internal app slugs ↔ WooCommerce URL slugs from koncarelektro.rs. */

const INTERNAL_TO_WC_PARENT: Record<string, string> = {
  'aku-alat': 'akumulatorski-alat',
  'kosacice-i-trimeri': 'kosacice-i-trimeri-dobra',
};

const WC_TO_INTERNAL_PARENT: Record<string, string> = Object.fromEntries(
  Object.entries(INTERNAL_TO_WC_PARENT).map(([internal, wc]) => [wc, internal]),
);

const PROGRAM_TO_WC: Record<string, string> = {
  elektromaterijal: 'elektromaterijal-i-oprema',
  rasveta: 'rasveta',
  solarne: 'solarne',
};

const WC_TO_PROGRAM: Record<string, string> = {
  'elektromaterijal-i-oprema': 'elektromaterijal',
  rasveta: 'rasveta',
  solarne: 'solarne',
};

export const PROGRAM_SLUGS = new Set(['elektromaterijal', 'rasveta', 'solarne']);

export const PROGRAM_WC_SLUGS = new Set(Object.values(PROGRAM_TO_WC));

export const toWcParentSlug = (internalSlug: string): string =>
  INTERNAL_TO_WC_PARENT[internalSlug] ?? internalSlug;

export const toInternalParentSlug = (wcSlug: string): string =>
  WC_TO_INTERNAL_PARENT[wcSlug] ?? wcSlug;

export const programToWcSlug = (programId: string): string =>
  PROGRAM_TO_WC[programId] ?? programId;

export const wcToProgramSlug = (wcSlug: string): string | undefined =>
  WC_TO_PROGRAM[wcSlug];
