import { fetchJsonPaginated } from '@/lib/api/client';
import { wcV3ApiBase } from '@/lib/api/config';

export type WcV3Attribute = {
  id: number;
  name: string;
  slug: string;
  type: string;
  order_by: string;
  has_archives: boolean;
};

export type WcV3AttributeTerm = {
  id: number;
  name: string;
  slug: string;
  count: number;
};

export async function fetchWcAttributes(): Promise<WcV3Attribute[]> {
  const { data } = await fetchJsonPaginated<WcV3Attribute>(wcV3ApiBase, '/products/attributes', {
    searchParams: { per_page: 100 },
    wcAuth: true,
  });
  return data;
}

export async function fetchWcAttributeTerms(attributeId: number): Promise<WcV3AttributeTerm[]> {
  const { data } = await fetchJsonPaginated<WcV3AttributeTerm>(
    wcV3ApiBase,
    `/products/attributes/${attributeId}/terms`,
    { searchParams: { per_page: 100 }, wcAuth: true },
  );
  return data;
}
