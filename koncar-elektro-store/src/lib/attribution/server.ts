import { parseRecord, type Touch } from './shared';

export type OrderMeta = { key: string; value: string };

/** Same keys WooCommerce Order Attribution writes, so wp-admin "Origin" works unchanged. */
const WC = '_wc_order_attribution_';

const wcDate = (iso: string): string | null => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 19).replace('T', ' ');
};

function deviceType(ua: string): string {
  if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) return 'Tablet';
  if (/mobi|iphone|ipod|android/i.test(ua)) return 'Mobile';
  return 'Desktop';
}

/**
 * Builds the order meta for a checkout. Input is untrusted (it came from the
 * browser), so everything is re-validated and length-capped. Never throws:
 * on any problem we return only what is safe, and the order proceeds.
 */
export function buildAttributionMeta(raw: unknown, userAgent: string | null): OrderMeta[] {
  const meta: OrderMeta[] = [];
  const add = (key: string, value: string | number | undefined) => {
    if (value === undefined || value === '') return;
    meta.push({ key, value: String(value) });
  };

  try {
    // eslint-disable-next-line no-control-regex
    const ua = (userAgent ?? '').replace(/[\u0000-\u001f\u007f]/g, '').slice(0, 250);
    const record = parseRecord(raw);

    if (!record) {
      // Nothing captured (blocked storage, API call from elsewhere, …) — be
      // honest: leave attribution empty rather than invent "Direct".
      add(`${WC}user_agent`, ua);
      add(`${WC}device_type`, ua ? deviceType(ua) : undefined);
      return meta;
    }

    const t: Touch = record.last;
    add(`${WC}source_type`, t.type);
    add(`${WC}referrer`, t.referrer);
    add(`${WC}utm_source`, t.source);
    add(`${WC}utm_medium`, t.medium ?? (t.type === 'typein' ? '(none)' : undefined));
    add(`${WC}utm_campaign`, t.campaign);
    add(`${WC}utm_content`, t.content);
    add(`${WC}utm_term`, t.term);
    add(`${WC}utm_id`, t.id);
    add(`${WC}session_entry`, t.entry);
    add(`${WC}session_start_time`, wcDate(record.startedAt) ?? undefined);
    add(`${WC}session_pages`, record.pages);
    add(`${WC}session_count`, record.sessions);
    add(`${WC}user_agent`, ua);
    add(`${WC}device_type`, ua ? deviceType(ua) : undefined);

    // First touch kept separately: last-touch answers "who closed the sale",
    // this answers "who brought them to us".
    const f = record.first;
    add('_koncar_first_touch_type', f.type);
    add('_koncar_first_touch_source', f.source);
    add('_koncar_first_touch_medium', f.medium);
    add('_koncar_first_touch_campaign', f.campaign);
    add('_koncar_first_touch_at', f.at);
    add('_koncar_attribution_version', '1');
  } catch {
    // swallow — attribution must never fail an order
  }
  return meta;
}
