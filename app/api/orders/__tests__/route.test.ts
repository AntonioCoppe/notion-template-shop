import { GET } from '../route';
import { getSupabase } from '@/lib/supabase';

jest.mock('@/lib/supabase');

describe('GET /api/orders', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function mockRequest(buyerId?: string): Request {
    const url = new URL('http://localhost/api/orders' + (buyerId ? `?buyerId=${buyerId}` : ''));
    return { url: url.toString(), headers: new Map() } as unknown as Request;
  }

  it('returns 400 if buyerId missing', async () => {
    const res = await GET(mockRequest());
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.error).toMatch(/buyerId parameter is required/);
  });

  it('returns 500 on supabase error', async () => {
    (getSupabase as jest.Mock).mockReturnValue({
      from: () => ({
        select: () => ({
          eq: () => ({
            order: () => Promise.resolve({ data: null, error: { message: 'fail' } }),
          }),
        }),
      }),
    });
    const res = await GET(mockRequest('b1'));
    const json = await res.json();
    expect(res.status).toBe(500);
    expect(json.error).toMatch(/Failed to fetch orders/);
  });

  it('returns 500 on thrown error', async () => {
    (getSupabase as jest.Mock).mockImplementation(() => { throw new Error('fail'); });
    const res = await GET(mockRequest('b1'));
    const json = await res.json();
    expect(res.status).toBe(500);
    expect(json.error).toMatch(/Internal server error/);
  });

  it('returns orders on success', async () => {
    (getSupabase as jest.Mock).mockReturnValue({
      from: () => ({
        select: () => ({
          eq: () => ({
            order: () => Promise.resolve({
              data: [
                {
                  id: 'o1',
                  amount: 100,
                  status: 'paid',
                  created_at: '2024-01-01',
                  templates: [
                    { id: 't1', title: 'Template 1', notion_url: 'url1', img: 'img1' },
                  ],
                },
              ],
              error: null,
            }),
          }),
        }),
      }),
    });
    const res = await GET(mockRequest('b1'));
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(Array.isArray(json)).toBe(true);
    expect(json[0].id).toBe('o1');
    expect(json[0].template.title).toBe('Template 1');
  });
}); 