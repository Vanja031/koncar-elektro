'use client';

import { InfoPageShell } from '@/components/static/InfoPageShell';
import { CatalogStateMessage } from '@/components/catalog/CatalogStateMessage';
import type { NewsPost } from '@/lib/api/wp/posts';

const breadcrumbs = [{ label: 'Početna', href: '/' }, { label: 'Novosti' }];

function formatPostDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('sr-RS', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(iso));
  } catch {
    return iso.slice(0, 10);
  }
}

type Props = {
  posts: NewsPost[];
};

const NovostiPage = ({ posts }: Props) => (
  <InfoPageShell
    breadcrumbs={breadcrumbs}
    title="Novosti"
    subtitle="Vesti i obaveštenja iz Končar Elektro."
  >
    {posts.length === 0 ? (
      <CatalogStateMessage
        variant="empty"
        title="Trenutno nema novosti"
        description="Kada objavimo vesti, pojaviće se ovde."
      />
    ) : (
      <ul className="space-y-6 max-w-3xl">
        {posts.map((post) => (
          <li key={post.id} className="border-b border-border pb-6 last:border-0">
            <time dateTime={post.date} className="text-xs text-muted-foreground">
              {formatPostDate(post.date)}
            </time>
            <h2 className="mt-1 font-display text-lg font-semibold text-foreground">{post.title}</h2>
            {post.excerpt ? (
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{post.excerpt}</p>
            ) : null}
          </li>
        ))}
      </ul>
    )}
  </InfoPageShell>
);

export default NovostiPage;
