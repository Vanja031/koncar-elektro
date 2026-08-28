import { fetchJson } from '@/lib/api/client';
import { serverWpApiBase } from '@/lib/api/server-config';
import { stripHtmlToText } from '@/lib/htmlEntities';

export type WpPost = {
  id: number;
  date: string;
  slug: string;
  link: string;
  title: { rendered: string };
  excerpt: { rendered: string };
};

export type NewsPost = {
  id: number;
  date: string;
  slug: string;
  title: string;
  excerpt: string;
};

function mapPost(post: WpPost): NewsPost {
  return {
    id: post.id,
    date: post.date,
    slug: post.slug,
    title: stripHtmlToText(post.title?.rendered ?? ''),
    excerpt: stripHtmlToText(post.excerpt?.rendered ?? ''),
  };
}

/** WordPress posts (read-only). Returns [] if WP has no posts or the request fails. */
export async function getWpPosts(perPage = 20): Promise<NewsPost[]> {
  try {
    const posts = await fetchJson<WpPost[]>(serverWpApiBase, '/wp/v2/posts', {
      searchParams: {
        per_page: perPage,
        status: 'publish',
        orderby: 'date',
        order: 'desc',
      },
      next: { revalidate: 300 },
    });
    return (posts ?? []).map(mapPost);
  } catch {
    return [];
  }
}
