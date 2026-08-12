import type { Metadata } from 'next';
import { metadataForStaticPath } from '@/lib/seo/metadata';
import { getWpPosts } from '@/lib/api/wp/posts';
import NovostiPage from '@/views/NovostiPage';

export const metadata: Metadata = metadataForStaticPath('/novosti/');

export default async function NovostiRoute() {
  const posts = await getWpPosts();
  return <NovostiPage posts={posts} />;
}
