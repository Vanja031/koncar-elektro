import { redirect } from 'next/navigation';

/** Legacy YITH compare page → canonical `/uporedite`. */
export default function YithCompareRedirect() {
  redirect('/uporedite');
}
