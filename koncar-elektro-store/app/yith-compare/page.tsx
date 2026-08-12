import { permanentRedirect } from 'next/navigation';

/** Legacy YITH compare page → canonical `/uporedite`. */
export default function YithCompareRedirect() {
  permanentRedirect('/uporedite');
}
