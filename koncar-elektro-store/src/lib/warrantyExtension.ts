export type WarrantyExtensionOffer = {
  href: string;
  label: string;
  hint: string;
  external: boolean;
};

/** Brendovi sa online registracijom za produženu garanciju (alat). */
const BRAND_WARRANTY_OFFERS: Record<string, Omit<WarrantyExtensionOffer, 'external'>> = {
  MAKITA: {
    href: 'https://www.makitapromotion.eu/rs-RS',
    label: 'Produži garanciju',
    hint: 'Besplatna registracija na sajtu Makita',
  },
  BOSCH: {
    href: 'https://www.bosch-professional.com/rs/sr/professional360/',
    label: 'Produži garanciju',
    hint: 'Registracija preko Bosch Professional360',
  },
  METABO: {
    href: 'https://www.metabo.com/rs/rs/',
    label: 'Produži garanciju',
    hint: 'Registracija alata na Metabo portalu',
  },
  EINHELL: {
    href: 'https://www.einhell.com/rs-rs/customer-service/warranty-extension.html',
    label: 'Produži garanciju',
    hint: 'Einhell produžena garancija online',
  },
  DEWALT: {
    href: 'https://www.dewalt.rs/registracija-alata',
    label: 'Produži garanciju',
    hint: 'DeWalt registracija alata',
  },
};

export const getWarrantyExtensionOffer = (brand: string): WarrantyExtensionOffer | null => {
  const offer = BRAND_WARRANTY_OFFERS[brand.toUpperCase()];
  if (!offer) return null;

  return {
    ...offer,
    external: true,
  };
};
