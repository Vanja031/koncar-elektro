import { permanentRedirect } from 'next/navigation';

/** Legacy thank-you URL → order-received. */
export default function PlacanjeHvalaRedirect() {
  permanentRedirect('/placanje-odjava/order-received');
}
