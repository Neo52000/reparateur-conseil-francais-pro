import { describe, it, expect } from 'vitest';
import { sanitizeHtmlContent, sanitizeReceiptHtml, sanitizeStaticPageContent } from './htmlSanitizer';

describe('htmlSanitizer', () => {
  describe('sanitizeHtmlContent', () => {
    it('allows safe HTML tags', () => {
      const input = '<p>Hello <strong>world</strong></p>';
      expect(sanitizeHtmlContent(input)).toBe(input);
    });

    it('strips script tags (XSS prevention)', () => {
      const input = '<p>Hello</p><script>alert("xss")</script>';
      expect(sanitizeHtmlContent(input)).toBe('<p>Hello</p>');
    });

    it('strips event handlers (XSS prevention)', () => {
      const input = '<p onclick="alert(1)">Click me</p>';
      expect(sanitizeHtmlContent(input)).toBe('<p>Click me</p>');
    });

    it('strips javascript: URLs', () => {
      const input = '<a href="javascript:alert(1)">Link</a>';
      const result = sanitizeHtmlContent(input);
      expect(result).not.toContain('javascript:');
    });

    it('allows safe links', () => {
      const input = '<a href="https://example.com" target="_blank" rel="noopener">Link</a>';
      expect(sanitizeHtmlContent(input)).toBe(input);
    });

    it('strips data attributes', () => {
      const input = '<div data-evil="payload">Content</div>';
      expect(sanitizeHtmlContent(input)).toBe('<div>Content</div>');
    });

    it('allows images with safe attributes', () => {
      const input = '<img src="https://example.com/img.png" alt="photo">';
      expect(sanitizeHtmlContent(input)).toBe('<img src="https://example.com/img.png" alt="photo">');
    });
  });

  describe('sanitizeReceiptHtml', () => {
    it('strips links from receipts', () => {
      const input = '<div><a href="https://evil.com">Click</a></div>';
      expect(sanitizeReceiptHtml(input)).toBe('<div>Click</div>');
    });

    it('allows table elements', () => {
      const input = '<table><tbody><tr><td>Item</td><td>Price</td></tr></tbody></table>';
      expect(sanitizeReceiptHtml(input)).toBe(input);
    });
  });

  describe('sanitizeStaticPageContent', () => {
    it('strips script tags', () => {
      const input = '<h1>Title</h1><script>alert(1)</script>';
      expect(sanitizeStaticPageContent(input)).toBe('<h1>Title</h1>');
    });

    it('allows heading and list elements', () => {
      const input = '<h2>Section</h2><ul><li>Item 1</li><li>Item 2</li></ul>';
      expect(sanitizeStaticPageContent(input)).toBe(input);
    });
  });
});
