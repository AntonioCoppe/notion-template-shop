import { GET as getTemplates } from '../route';
import { GET as getTemplatesByIds } from '../by-ids/route';
import { NextRequest } from 'next/server';
import { getSupabase } from '@/lib/supabase';

jest.mock('@/lib/supabase');

describe('GET /api/templates', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function mockRequest(url: string): Request {
    return { url } as Request;
  }

  it('returns templates with pagination', async () => {
    (getSupabase as jest.Mock).mockReturnValue({
      from: () => ({
        select: () => ({
          not: () => ({
            order: () => ({
              range: () => Promise.resolve({
                data: [
                  { id: '1', title: 'A', price: 10, img: 'img1', notion_url: 'url1' },
                  { id: '2', title: 'B', price: 20, img: 'img2', notion_url: 'url2' },
                ],
                error: null,
                count: 2,
              }),
            }),
          }),
        }),
      }),
    });
    const url = 'http://localhost/api/templates?page=1&perPage=2';
    const res = await getTemplates(mockRequest(url));
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.length).toBe(2);
    expect(json.total).toBe(2);
    expect(json.page).toBe(1);
    expect(json.perPage).toBe(2);
  });

  it('returns a single template by id', async () => {
    (getSupabase as jest.Mock).mockReturnValue({
      from: () => ({
        select: () => ({
          not: () => ({
            order: () => ({
              eq: () => Promise.resolve({
                data: [
                  { id: '1', title: 'A', price: 10, img: 'img1', notion_url: 'url1' },
                ],
                error: null,
                count: 1,
              }),
            }),
          }),
        }),
      }),
    });
    const url = 'http://localhost/api/templates?id=1';
    const res = await getTemplates(mockRequest(url));
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.id).toBe('1');
    expect(json.title).toBe('A');
  });

  it('returns filtered templates', async () => {
    (getSupabase as jest.Mock).mockReturnValue({
      from: () => ({
        select: () => ({
          not: () => ({
            order: () => ({
              ilike: () => ({
                gte: () => ({
                  lte: () => ({
                    range: () => Promise.resolve({
                      data: [
                        { id: '2', title: 'B', price: 20, img: 'img2', notion_url: 'url2' },
                      ],
                      error: null,
                      count: 1,
                    }),
                  }),
                }),
              }),
            }),
          }),
        }),
      }),
    });
    const url = 'http://localhost/api/templates?search=B&minPrice=10&maxPrice=30&page=1&perPage=1';
    const res = await getTemplates(mockRequest(url));
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.data.length).toBe(1);
    expect(json.data[0].title).toBe('B');
  });

  it('returns 500 on supabase error', async () => {
    (getSupabase as jest.Mock).mockReturnValue({
      from: () => ({
        select: () => ({
          not: () => ({
            order: () => ({
              range: () => Promise.resolve({ data: null, error: { message: 'fail' }, count: 0 }),
            }),
          }),
        }),
      }),
    });
    const url = 'http://localhost/api/templates?page=1&perPage=2';
    const res = await getTemplates(mockRequest(url));
    const json = await res.json();
    expect(res.status).toBe(500);
    expect(json.error).toMatch(/Failed to fetch templates/);
  });

  it('returns 500 on thrown error', async () => {
    (getSupabase as jest.Mock).mockImplementation(() => { throw new Error('fail'); });
    const url = 'http://localhost/api/templates?page=1&perPage=2';
    const res = await getTemplates(mockRequest(url));
    const json = await res.json();
    expect(res.status).toBe(500);
    expect(json.error).toMatch(/Internal server error/);
  });
});

describe('GET /api/templates/by-ids', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function mockRequest(url: string): NextRequest {
    return { url, headers: new Map() } as unknown as NextRequest;
  }

  it('returns 400 if ids missing', async () => {
    const res = await getTemplatesByIds(mockRequest('http://localhost/api/templates/by-ids'));
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.error).toMatch(/Missing template IDs/);
  });

  it('returns templates by ids', async () => {
    (getSupabase as jest.Mock).mockReturnValue({
      from: () => ({
        select: () => ({
          in: () => Promise.resolve({ data: [ { id: '1', title: 'A' }, { id: '2', title: 'B' } ], error: null }),
        }),
      }),
    });
    const res = await getTemplatesByIds(mockRequest('http://localhost/api/templates/by-ids?ids=1,2'));
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.length).toBe(2);
    expect(json[0].id).toBe('1');
  });

  it('returns 500 on supabase error', async () => {
    (getSupabase as jest.Mock).mockReturnValue({
      from: () => ({
        select: () => ({
          in: () => Promise.resolve({ data: null, error: { message: 'fail' } }),
        }),
      }),
    });
    const res = await getTemplatesByIds(mockRequest('http://localhost/api/templates/by-ids?ids=1,2'));
    const json = await res.json();
    expect(res.status).toBe(500);
    expect(json.error).toMatch(/Failed to fetch templates/);
  });

  it('returns 500 on thrown error', async () => {
    (getSupabase as jest.Mock).mockImplementation(() => { throw new Error('fail'); });
    const res = await getTemplatesByIds(mockRequest('http://localhost/api/templates/by-ids?ids=1,2'));
    const json = await res.json();
    expect(res.status).toBe(500);
    expect(json.error).toMatch(/Failed to fetch templates/);
  });
}); 