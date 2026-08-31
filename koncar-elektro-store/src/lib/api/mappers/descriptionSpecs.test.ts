import { describe, expect, it } from 'vitest';
import { extractSpecsFromDescriptionHtml } from '@/lib/api/mappers/descriptionSpecs';

describe('extractSpecsFromDescriptionHtml', () => {
  it('parses a standard "Tehničke karakteristike" bullet list', () => {
    const html = `
      <p><strong>M9203B Električna vibraciona šlajferica 190W 92 x 185mm Makita</strong></p>
      <p><strong>Opis proizvoda:</strong> neki opis...</p>
      <p><strong>Tehničke karakteristike proizvoda:</strong></p>
      <ul>
        <li>Brend: Makita</li>
        <li>Model: M9203B</li>
        <li>Snaga: 190 W</li>
        <li>Nivo zvučnog pritiska: 75 dB(A)</li>
        <li>Dužina kabla: 2,0 m</li>
        <li>Dimenzije (Dužina x Širina x Visina): 252 x 92 x 154 mm</li>
        <li>Težina: 1,4 kg.</li>
      </ul>
      <p><strong>Obim isporuke proizvoda:</strong></p>
      <ul>
        <li>M9203B Električna vibraciona šlajferica 190W 92 x 185mm Makita</li>
        <li>Uputstvo za upotrebu proizvoda</li>
      </ul>
    `;

    expect(extractSpecsFromDescriptionHtml(html)).toEqual([
      { label: 'Brend', value: 'Makita' },
      { label: 'Model', value: 'M9203B' },
      { label: 'Snaga', value: '190 W' },
      { label: 'Nivo zvučnog pritiska', value: '75 dB(A)' },
      { label: 'Dužina kabla', value: '2,0 m' },
      { label: 'Dimenzije (Dužina x Širina x Visina)', value: '252 x 92 x 154 mm' },
      { label: 'Težina', value: '1,4 kg.' },
    ]);
  });

  it('does not spill over into the unrelated "Obim isporuke" list', () => {
    const html = `
      <p><strong>Tehničke karakteristike proizvoda:</strong></p>
      <ul><li>Snaga: 100 W</li></ul>
      <p><strong>Obim isporuke proizvoda:</strong></p>
      <ul><li>Kartonsko pakovanje</li></ul>
    `;
    const specs = extractSpecsFromDescriptionHtml(html);
    expect(specs).toEqual([{ label: 'Snaga', value: '100 W' }]);
  });

  it('tolerates the common WP typo "karkteristike"', () => {
    const html = `
      <p><strong>Tehničke karkteristike proizvoda:</strong></p>
      <ul>
        <li>Brend: SUPER INGCO</li>
        <li>Model: FBCPK1012E</li>
        <li>Napon: 20V</li>
        <li>Set sadrži:</li>
        <li>1 kom litijum-jonske baterije (FBLI2002)</li>
      </ul>
    `;

    expect(extractSpecsFromDescriptionHtml(html)).toEqual([
      { label: 'Brend', value: 'SUPER INGCO' },
      { label: 'Model', value: 'FBCPK1012E' },
      { label: 'Napon', value: '20V' },
    ]);
  });

  it('skips bullets without a "Label: value" shape and bullets with an empty value', () => {
    const html = `
      <p><strong>Tehničke karakteristike proizvoda:</strong></p>
      <ul>
        <li>Sto plastični na preklapanje</li>
        <li><strong>Maksimalna preporučena nosivost 230 kg.</strong></li>
        <li>Dimenzije: 180 x 75 x 74 x 4,3 cm.</li>
        <li>Napon:</li>
      </ul>
    `;

    expect(extractSpecsFromDescriptionHtml(html)).toEqual([
      { label: 'Dimenzije', value: '180 x 75 x 74 x 4,3 cm.' },
    ]);
  });

  it('falls back to a bare "Karakteristike proizvoda" heading when "Tehničke" is missing', () => {
    const html = `
      <p><strong>Opis proizvoda:</strong></p>
      <p>Hyundai Električna aligator testera 710W...</p>
      <h4>Karakteristike proizvoda:</h4>
      <ul>
        <li>Snaga: 710 W</li>
        <li>Težina:  2,6 kg</li>
      </ul>
      <h4>Obim isporuke:</h4>
      <ul><li>Kartonska kutija</li></ul>
    `;

    expect(extractSpecsFromDescriptionHtml(html)).toEqual([
      { label: 'Snaga', value: '710 W' },
      { label: 'Težina', value: '2,6 kg' },
    ]);
  });

  it('returns an empty array when there is no "Tehničke karakteristike" section', () => {
    const html = `
      <p><strong>Opis proizvoda:</strong></p>
      <ul><li>Neki opis bez tehničkih podataka</li></ul>
    `;
    expect(extractSpecsFromDescriptionHtml(html)).toEqual([]);
  });

  it('returns an empty array for missing/empty html', () => {
    expect(extractSpecsFromDescriptionHtml(undefined)).toEqual([]);
    expect(extractSpecsFromDescriptionHtml(null)).toEqual([]);
    expect(extractSpecsFromDescriptionHtml('')).toEqual([]);
  });

  it('ignores a heading that is not followed by a list within the expected window', () => {
    const html = `
      <p><strong>Tehničke karakteristike</strong> su dostupne u uputstvu za upotrebu.</p>
      <p>${'x'.repeat(500)}</p>
      <ul><li>Nepovezano: vrednost</li></ul>
    `;
    expect(extractSpecsFromDescriptionHtml(html)).toEqual([]);
  });

  it('de-duplicates repeated labels, keeping the first occurrence', () => {
    const html = `
      <p><strong>Tehničke karakteristike proizvoda:</strong></p>
      <ul>
        <li>Snaga: 100 W</li>
        <li>Snaga: 200 W</li>
      </ul>
    `;
    expect(extractSpecsFromDescriptionHtml(html)).toEqual([{ label: 'Snaga', value: '100 W' }]);
  });
});
