const { isMediumLink, convertToFreedium, extractArticleTitle } = require('../linkHandler');

describe('convertToFreedium', () => {
  it('converts a standard Medium URL', () => {
    expect(convertToFreedium('https://medium.com/@user/my-article-123abc'))
      .toBe('https://freedium-mirror.cfd/https://medium.com/@user/my-article-123abc');
  });

  it('strips trailing slash before converting', () => {
    expect(convertToFreedium('https://medium.com/@user/my-article/'))
      .toBe('https://freedium-mirror.cfd/https://medium.com/@user/my-article');
  });

  it('converts a custom domain Medium URL', () => {
    expect(convertToFreedium('https://blog.example.com/my-article'))
      .toBe('https://freedium-mirror.cfd/https://blog.example.com/my-article');
  });

  it('returns empty string for null/undefined input', () => {
    expect(convertToFreedium(null)).toBe('');
    expect(convertToFreedium(undefined)).toBe('');
    expect(convertToFreedium('')).toBe('');
  });
});

describe('extractArticleTitle', () => {
  it('extracts and formats a dash-separated title', () => {
    expect(extractArticleTitle('https://medium.com/@user/my-great-article-123abc'))
      .toBe('My Great Article 123abc');
  });

  it('handles a single-word path', () => {
    expect(extractArticleTitle('https://medium.com/topic'))
      .toBe('Topic');
  });

  it('handles deeply nested paths', () => {
    expect(extractArticleTitle('https://medium.com/publication/category/the-real-title-abc123'))
      .toBe('The Real Title Abc123');
  });

  it('returns "Article" for null/undefined input', () => {
    expect(extractArticleTitle(null)).toBe('Article');
    expect(extractArticleTitle(undefined)).toBe('Article');
  });

  it('returns "Medium Article" for a URL with no path', () => {
    expect(extractArticleTitle('https://medium.com')).toBe('Medium Article');
    expect(extractArticleTitle('https://medium.com/')).toBe('Medium Article');
  });

  it('returns "Medium Article" for an invalid URL', () => {
    expect(extractArticleTitle('not-a-url')).toBe('Medium Article');
  });

  it('handles Freedium-wrapped URLs', () => {
    const result = extractArticleTitle('https://freedium-mirror.cfd/https://medium.com/@user/some-title-abc');
    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
  });
});

describe('isMediumLink', () => {
  it('matches standard medium.com URLs', () => {
    expect(isMediumLink('https://medium.com/@user/article')).toBe(true);
    expect(isMediumLink('https://medium.com/publication/article')).toBe(true);
  });

  it('matches medium.com subdomains', () => {
    expect(isMediumLink('https://blog.medium.com/article')).toBe(true);
  });

  it('matches custom domain Medium articles', () => {
    expect(isMediumLink('https://betterprogramming.pub/my-article')).toBe(true);
    expect(isMediumLink('https://towardsdatascience.com/my-article')).toBe(true);
  });

  it('returns false for null/undefined/empty input', () => {
    expect(isMediumLink(null)).toBe(false);
    expect(isMediumLink(undefined)).toBe(false);
    expect(isMediumLink('')).toBe(false);
  });
});
