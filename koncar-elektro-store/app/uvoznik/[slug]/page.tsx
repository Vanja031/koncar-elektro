import { redirect } from 'next/navigation';
import { getAttributeArchiveSearchUrl } from '@/lib/catalogUrls';

type Props = { params: { slug: string } };

/** Old-site `/uvoznik/{slug}` → filtered search. */
export default function UvoznikArchiveRedirect({ params }: Props) {
  redirect(getAttributeArchiveSearchUrl('uvoznik', params.slug));
}
