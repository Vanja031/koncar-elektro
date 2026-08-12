import { permanentRedirect } from 'next/navigation';
import { getAttributeArchiveSearchUrl } from '@/lib/catalogUrls';

type Props = { params: { slug: string } };

/** Old-site `/zemlja-porekla/{slug}` → filtered search. */
export default function ZemljaPoreklaArchiveRedirect({ params }: Props) {
  permanentRedirect(getAttributeArchiveSearchUrl('zemlja-porekla', params.slug));
}
