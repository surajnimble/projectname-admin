import { describe, expect, it } from 'vitest';
import { isImageUrl, safeExternalUrl } from './external-url';

describe('safeExternalUrl', () => {
  it('accepts absolute HTTP and HTTPS URLs', () => {
    expect(safeExternalUrl('https://cdn.example.test/file.pdf')).toBe('https://cdn.example.test/file.pdf');
    expect(safeExternalUrl('http://tracking.example.test/awb/123')).toBe('http://tracking.example.test/awb/123');
  });

  it.each(['javascript:alert(1)', 'data:text/html,hello', '//example.test/path', '/relative/path', '', null, 42])(
    'rejects unsafe or non-absolute URL values: %s',
    (value) => {
      expect(safeExternalUrl(value)).toBeNull();
    },
  );
});


describe('isImageUrl', () => {
  it.each([
    'https://cdn.example.test/photo.jpg',
    'https://cdn.example.test/photo.webp?token=abc',
    'http://cdn.example.test/photo.png',
  ])('recognizes safe image URLs: %s', (value) => {
    expect(isImageUrl(value)).toBe(true);
  });

  it.each([
    'https://cdn.example.test/document.pdf',
    'https://cdn.example.test/download',
    'javascript:alert(1)',
    '/images/photo.jpg',
    null,
  ])('rejects non-image or unsafe URLs: %s', (value) => {
    expect(isImageUrl(value)).toBe(false);
  });
});
