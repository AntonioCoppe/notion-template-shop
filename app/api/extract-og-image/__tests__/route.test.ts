import { POST } from '../route';
import { NextRequest } from 'next/server';
import * as cheerio from 'cheerio';

global.fetch = jest.fn();

jest.mock('cheerio');

describe('POST /api/extract-og-image', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function mockRequest(body: Record<string, unknown>): NextRequest {
    // Add minimal required properties for NextRequest
    return {
      json: () => Promise.resolve(body),
      headers: new Map(),
      // Add any other required properties if needed
    } as unknown as NextRequest;
  }

  it('returns 400 if url missing', async () => {
    const res = await POST(mockRequest({}));
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.error).toMatch(/No URL provided/);
  });

  it('returns 500 on fetch error', async () => {
    (fetch as jest.Mock).mockRejectedValue(new Error('fail'));
    const res = await POST(mockRequest({ url: 'http://test.com' }));
    const json = await res.json();
    expect(res.status).toBe(500);
    expect(json.error).toMatch(/Failed to fetch/);
  });

  it('returns 404 if no og:image found', async () => {
    (fetch as jest.Mock).mockResolvedValue({ text: () => Promise.resolve('<html></html>') });
    (cheerio.load as jest.Mock).mockReturnValue({
      $: () => ({ attr: () => undefined }),
      attr: () => undefined,
      find: () => ({ attr: () => undefined }),
      // Simulate cheerio API
      'meta[property="og:image"]': { attr: () => undefined },
    });
    const res = await POST(mockRequest({ url: 'http://test.com' }));
    const json = await res.json();
    expect(res.status).toBe(404);
    expect(json.error).toMatch(/No OG image found/);
  });

  it('returns og:image on success', async () => {
    (fetch as jest.Mock).mockResolvedValue({ text: () => Promise.resolve('<html></html>') });
    (cheerio.load as jest.Mock).mockReturnValue({
      $: () => ({ attr: () => 'http://img.com/og.png' }),
      attr: () => 'http://img.com/og.png',
      find: () => ({ attr: () => 'http://img.com/og.png' }),
      // Simulate cheerio API
      'meta[property="og:image"]': { attr: () => 'http://img.com/og.png' },
    });
    const res = await POST(mockRequest({ url: 'http://test.com' }));
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.image).toBe('http://img.com/og.png');
  });
}); 