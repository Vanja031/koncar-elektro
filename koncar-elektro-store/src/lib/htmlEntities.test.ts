import { describe, expect, it } from 'vitest';
import { decodeHtmlEntities, decodeWcCategory, stripHtmlToText } from '@/lib/htmlEntities';

describe('decodeHtmlEntities', () => {
  it('decodes numeric en-dash used in WC category names', () => {
    expect(decodeHtmlEntities('ELEKTRIČNI OŠTRAČI &#8211; TOCILA')).toBe(
      'ELEKTRIČNI OŠTRAČI – TOCILA',
    );
    expect(decodeHtmlEntities('GLODALICE &#8211; FREZERI')).toBe('GLODALICE – FREZERI');
    expect(decodeHtmlEntities('MEŠAČI &#8211; MIKSERI')).toBe('MEŠAČI – MIKSERI');
  });

  it('decodes named, hex, and multiplication entities', () => {
    expect(decodeHtmlEntities('A &ndash; B')).toBe('A – B');
    expect(decodeHtmlEntities('2&#215;4,0Ah')).toBe('2×4,0Ah');
    expect(decodeHtmlEntities('3/4&#8243;')).toBe('3/4″');
    expect(decodeHtmlEntities('foo &#x2013; bar')).toBe('foo – bar');
  });

  it('handles double-encoded entities', () => {
    expect(decodeHtmlEntities('A &amp;#8211; B')).toBe('A – B');
  });

  it('leaves already-decoded text unchanged', () => {
    expect(decodeHtmlEntities('ELEKTRIČNI OŠTRAČI – TOCILA')).toBe(
      'ELEKTRIČNI OŠTRAČI – TOCILA',
    );
  });
});

describe('stripHtmlToText', () => {
  it('strips tags then decodes entities', () => {
    expect(stripHtmlToText('<p>Stona testera &#8211; bansek</p>')).toBe(
      'Stona testera – bansek',
    );
  });
});

describe('decodeWcCategory', () => {
  it('decodes name and description', () => {
    expect(
      decodeWcCategory({
        name: 'GLODALICE &#8211; FREZERI',
        description: 'Alati &amp; pribor',
      }),
    ).toEqual({
      name: 'GLODALICE – FREZERI',
      description: 'Alati & pribor',
    });
  });
});
