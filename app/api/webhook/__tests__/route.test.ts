import { POST } from '../route';
import { getSupabase } from '@/lib/supabase';
import Stripe from 'stripe';
import { headers as nextHeaders } from 'next/headers';

jest.mock('@/lib/supabase');
jest.mock('stripe');
jest.mock('resend');
jest.mock('next/headers');
const MockedStripe = Stripe as jest.MockedClass<typeof Stripe>;

describe('POST /api/webhook', () => {
  const OLD_ENV = process.env;
  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...OLD_ENV,
      STRIPE_SECRET_KEY: 'sk_test',
      RESEND_API_KEY: 'resend_test',
      STRIPE_WEBHOOK_SECRET: 'whsec_test',
    };
  });
  afterAll(() => {
    process.env = OLD_ENV;
  });

  function mockRequest(eventType = 'checkout.session.completed', overrides: Partial<{ session: Record<string, unknown> }> = {}): Request {
    const session = {
      metadata: { template_ids: '1,2' },
      customer_email: 'a@b.com',
      ...overrides.session,
    };
    const event = { type: eventType, data: { object: session } };
    const buf = Buffer.from('body');
    const req = { arrayBuffer: () => Promise.resolve(buf) } as unknown as Request;
    (nextHeaders as jest.Mock).mockReturnValue(new Map([['stripe-signature', 'sig']]));
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    MockedStripe.mockImplementation(((): unknown => ({
      webhooks: {
        constructEvent: jest.fn().mockReturnValue(event),
      },
    })) as unknown as typeof Stripe);
    return req;
  }

  it('returns 500 if env vars missing', async () => {
    process.env.STRIPE_SECRET_KEY = '';
    const req = mockRequest();
    const res = await POST(req);
    expect(res.status).toBe(500);
  });

  it('returns 400 on bad signature', async () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    MockedStripe.mockImplementation(((): unknown => ({
      webhooks: {
        constructEvent: jest.fn(() => { throw new Error('bad sig'); }),
      },
    })) as unknown as typeof Stripe);
    const req = mockRequest();
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('handles template fetch error gracefully', async () => {
    (getSupabase as jest.Mock).mockReturnValue({
      from: () => ({
        select: () => ({ in: () => Promise.resolve({ data: null, error: { message: 'fail' } }) }),
      }),
    });
    const req = mockRequest();
    const res = await POST(req);
    expect(res.status).toBe(200);
  });

  it('handles user not found gracefully', async () => {
    (getSupabase as jest.Mock).mockReturnValue({
      from: () => ({
        select: () => ({ in: () => Promise.resolve({ data: [{ id: '1', title: 'A', price: 10, notion_url: 'url1' }], error: null }),
          eq: () => ({ single: () => Promise.resolve({ data: null, error: { message: 'fail' } }) }),
        }),
      }),
    });
    const req = mockRequest();
    const res = await POST(req);
    expect(res.status).toBe(200);
  });

  it('handles buyer not found gracefully', async () => {
    (getSupabase as jest.Mock).mockReturnValue({
      from: () => ({
        select: () => ({ in: () => Promise.resolve({ data: [{ id: '1', title: 'A', price: 10, notion_url: 'url1' }], error: null }),
          eq: () => ({ single: () => Promise.resolve({ data: { id: 'u1' }, error: null }) }),
        }),
      }),
    });
    (getSupabase as jest.Mock).mockReturnValueOnce({
      from: () => ({
        select: () => ({ in: () => Promise.resolve({ data: [{ id: '1', title: 'A', price: 10, notion_url: 'url1' }], error: null }),
          eq: () => ({ single: () => Promise.resolve({ data: null, error: { message: 'fail' } }) }),
        }),
      }),
    });
    const req = mockRequest();
    const res = await POST(req);
    expect(res.status).toBe(200);
  });

  it('handles success', async () => {
    (getSupabase as jest.Mock).mockReturnValue({
      from: () => ({
        select: () => ({
          in: () => Promise.resolve({ data: [{ id: '1', title: 'A', price: 10, notion_url: 'url1' }], error: null }),
          eq: () => ({ single: () => Promise.resolve({ data: { id: 'u1' }, error: null }) }),
        }),
        insert: () => Promise.resolve({}),
      }),
    });
    const req = mockRequest();
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.received).toBe(true);
  });

  it('handles non-checkout events', async () => {
    const req = mockRequest('other.event');
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.received).toBe(true);
  });
}); 