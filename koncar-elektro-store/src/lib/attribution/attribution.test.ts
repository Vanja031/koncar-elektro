import { describe, expect, it } from 'vitest';
import { applyTouch, resolveTouch } from './shared';
import { buildAttributionMeta } from './server';

const base = { userAgent: 'Mozilla/5.0 (Windows NT 10.0) Chrome/120', referrer: '' };
const r = (url: string, extra: Partial<Parameters<typeof resolveTouch>[0]> = {}) =>
  resolveTouch({ ...base, url: `https://koncarelektro.rs${url}`, ...extra });

describe('resolveTouch', () => {
  it('UTM wins over referrer', () => {
    const t = r('/?utm_source=Instagram&utm_medium=Social&utm_campaign=Leto', {
      referrer: 'https://www.google.com/',
    });
    expect(t).toMatchObject({ type: 'utm', source: 'instagram', medium: 'social', campaign: 'Leto' });
  });
  it('google referrer is organic', () => {
    expect(r('/', { referrer: 'https://www.google.rs/' })).toMatchObject({ type: 'organic', source: 'google' });
  });
  it('facebook link referrer is social referral', () => {
    expect(r('/', { referrer: 'https://l.facebook.com/l.php?u=x' })).toMatchObject({
      type: 'referral',
      source: 'facebook',
    });
  });
  it('fbclid with Instagram in-app UA and no referrer -> instagram', () => {
    const t = r('/?fbclid=abc', { userAgent: 'Mozilla/5.0 (iPhone) Instagram 300.0' });
    expect(t).toMatchObject({ type: 'referral', source: 'instagram' });
  });
  it('in-app browser without referrer or params is still detected', () => {
    expect(r('/', { userAgent: 'Mozilla/5.0 [FBAN/FBIOS;FBAV/400]' })).toMatchObject({ source: 'facebook' });
  });
  it('gclid is google cpc', () => {
    expect(r('/?gclid=1')).toMatchObject({ type: 'utm', source: 'google', medium: 'cpc' });
  });
  it('other site is referral by hostname', () => {
    expect(r('/', { referrer: 'https://www.blog.rs/post' })).toMatchObject({ type: 'referral', source: 'blog.rs' });
  });
  it('own site, bank return and direct yield no touch', () => {
    expect(r('/proizvodi', { referrer: 'https://koncarelektro.rs/' })).toBeNull();
    expect(r('/proizvodi', { referrer: 'https://cms.koncarelektro.rs/' })).toBeNull();
    expect(r('/placanje-odjava/rezultat?status=success', { referrer: 'https://x.raiaccept.com/' })).toBeNull();
    expect(r('/proizvodi', { referrer: 'https://pay.raiaccept.com/' })).toBeNull();
    expect(r('/')).toBeNull();
  });
});

describe('applyTouch', () => {
  const now = new Date('2026-10-05T10:00:00Z');
  it('first direct visit is recorded as direct', () => {
    expect(applyTouch(null, null, '/', now).last).toMatchObject({ type: 'typein', source: '(direct)' });
  });
  it('direct return never overwrites a known source; new source becomes last, first stays', () => {
    const insta = r('/?utm_source=instagram')!;
    const rec = applyTouch(null, insta, '/', now);
    expect(applyTouch(rec, null, '/', now)).toBe(rec);
    const google = r('/', { referrer: 'https://google.com/' })!;
    const next = applyTouch(rec, google, '/', now);
    expect(next.first.source).toBe('instagram');
    expect(next.last.source).toBe('google');
  });
});

describe('buildAttributionMeta', () => {
  const now = new Date('2026-10-05T10:00:00Z');
  const record = applyTouch(null, r('/?utm_source=instagram&utm_medium=social')!, '/', now);
  const get = (m: ReturnType<typeof buildAttributionMeta>, k: string) => m.find((x) => x.key === k)?.value;

  it('maps to WC Order Attribution keys', () => {
    const m = buildAttributionMeta(record, 'Mozilla/5.0 (iPhone; Mobile)');
    expect(get(m, '_wc_order_attribution_source_type')).toBe('utm');
    expect(get(m, '_wc_order_attribution_utm_source')).toBe('instagram');
    expect(get(m, '_wc_order_attribution_device_type')).toBe('Mobile');
    expect(get(m, '_wc_order_attribution_session_start_time')).toBe('2026-10-05 10:00:00');
  });
  it('typein uses (direct)', () => {
    const m = buildAttributionMeta(applyTouch(null, null, '/', now), null);
    expect(get(m, '_wc_order_attribution_source_type')).toBe('typein');
    expect(get(m, '_wc_order_attribution_utm_source')).toBe('(direct)');
  });
  it('garbage / hostile input never throws and writes no source', () => {
    for (const bad of [undefined, null, 'x', 5, { first: 1 }, { first: { type: 'evil', source: 'a' }, last: {} }]) {
      const m = buildAttributionMeta(bad, 'ua');
      expect(get(m, '_wc_order_attribution_source_type')).toBeUndefined();
    }
  });
  it('caps lengths and strips control chars', () => {
    const evil = { ...record, last: { ...record.last, source: 'a\u0000b' + 'x'.repeat(500) } };
    const v = get(buildAttributionMeta(evil, null), '_wc_order_attribution_utm_source')!;
    expect(v.length).toBeLessThanOrEqual(200);
    expect(v.includes(String.fromCharCode(0))).toBe(false);
  });
});
