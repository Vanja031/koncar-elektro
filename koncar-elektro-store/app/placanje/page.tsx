import { permanentRedirect } from 'next/navigation';

/** Legacy checkout URL → canonical `/placanje-odjava`. */
export default function PlacanjeRedirect() {
  permanentRedirect('/placanje-odjava');
}
