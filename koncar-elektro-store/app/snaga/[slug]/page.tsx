import { permanentRedirect } from 'next/navigation';
import { getAttributeArchiveSearchUrl } from '@/lib/catalogUrls';

type Props = { params: { slug: string } };

/** Old-site `/snaga/{slug}` → filtered search. */
export default function SnagaArchiveRedirect({ params }: Props) {
  permanentRedirect(getAttributeArchiveSearchUrl('snaga', params.slug));
}
