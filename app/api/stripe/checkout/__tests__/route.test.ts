import { POST } from '../route';
import { NextRequest } from 'next/server';
import { authenticateUser, requireBuyer } from '@/lib/auth-utils';
import { getSupabase } from '@/lib/supabase';
import { getStripeAccountForVendor, VendorNotConnectedError } from '@/lib/stripeConnect';

jest.mock('@/lib/auth-utils');
jest.mock('@/lib/supabase');
jest.mock('@/lib/stripeConnect');
jest.mock('stripe');

describe('POST /api/stripe/checkout', () => {
  const OLD_ENV = process.env;
  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...OLD_ENV, STRIPE_SECRET_KEY: 'sk_test', NEXT_PUBLIC_SITE_URL: 'http://localhost' };
  });
  afterAll(() => {
    process.env = OLD_ENV;
  });

  function mockRequest(body: Record<string, unknown>, url = 'http://localhost/api/stripe/checkout'): NextRequest {
    return {
      json: () => Promise.resolve(body),
      url,
      headers: new Map(),
    } as unknown as NextRequest;
  }

  it('returns 401 if unauthenticated', async () => {
    (authenticateUser as jest.Mock).mockResolvedValue(null);
    const res = await POST(mockRequest({ email: 'a@b.com', cartDetails: [] }));
    const json = await res.json();
    expect(res.status).toBe(401);
    expect(json.error).toMatch(/Authentication required/);
  });

  it('returns 403 if not a buyer', async () => {
    (authenticateUser as jest.Mock).mockResolvedValue({ id: '1', email: 'a@b.com', role: 'vendor' });
    (requireBuyer as jest.Mock).mockImplementation(() => { throw new Error('Access denied. Buyer role required.'); });
    const res = await POST(mockRequest({ email: 'a@b.com', cartDetails: [] }));
    const json = await res.json();
    expect(res.status).toBe(403);
    expect(json.error).toMatch(/Access denied/);
  });

  it('returns 400 for missing input', async () => {
    (authenticateUser as jest.Mock).mockResolvedValue({ id: '1', email: 'a@b.com', role: 'buyer' });
    (requireBuyer as jest.Mock).mockReturnValue({ id: '1', email: 'a@b.com', role: 'buyer' });
    const res = await POST(mockRequest({}));
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.error).toMatch(/Missing email/);
  });

  it('returns 400 for email mismatch', async () => {
    (authenticateUser as jest.Mock).mockResolvedValue({ id: '1', email: 'a@b.com', role: 'buyer' });
    (requireBuyer as jest.Mock).mockReturnValue({ id: '1', email: 'a@b.com', role: 'buyer' });
    const res = await POST(mockRequest({ email: 'wrong@b.com', cartDetails: [] }));
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.error).toMatch(/Email mismatch/);
  });

  it('returns 404 if templates not found', async () => {
    (authenticateUser as jest.Mock).mockResolvedValue({ id: '1', email: 'a@b.com', role: 'buyer' });
    (requireBuyer as jest.Mock).mockReturnValue({ id: '1', email: 'a@b.com', role: 'buyer' });
    (getSupabase as jest.Mock).mockReturnValue({
      from: () => ({
        select: () => ({
          in: () => ({ data: null, error: null }),
        }),
      }),
    });
    const res = await POST(mockRequest({ email: 'a@b.com', cartDetails: [{ id: 't1' }] }));
    const json = await res.json();
    expect(res.status).toBe(404);
    expect(json.error).toMatch(/Templates not found/);
  });

  it('returns 400 if multiple vendors in cart', async () => {
    (authenticateUser as jest.Mock).mockResolvedValue({ id: '1', email: 'a@b.com', role: 'buyer' });
    (requireBuyer as jest.Mock).mockReturnValue({ id: '1', email: 'a@b.com', role: 'buyer' });
    (getSupabase as jest.Mock).mockReturnValue({
      from: () => ({
        select: () => ({
          in: () => ({ data: [ { id: 't1', vendor_id: 'v1', title: 'T', price: 1 }, { id: 't2', vendor_id: 'v2', title: 'T2', price: 2 } ], error: null }),
        }),
      }),
    });
    const res = await POST(mockRequest({ email: 'a@b.com', cartDetails: [{ id: 't1' }, { id: 't2' }] }));
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.error).toMatch(/Only one vendor/);
  });

  it('returns 400 if vendor not connected', async () => {
    (authenticateUser as jest.Mock).mockResolvedValue({ id: '1', email: 'a@b.com', role: 'buyer' });
    (requireBuyer as jest.Mock).mockReturnValue({ id: '1', email: 'a@b.com', role: 'buyer' });
    (getSupabase as jest.Mock).mockReturnValue({
      from: () => ({
        select: () => ({
          in: () => ({ data: [ { id: 't1', vendor_id: 'v1', title: 'T', price: 1 } ], error: null }),
        }),
      }),
    });
    (getStripeAccountForVendor as jest.Mock).mockRejectedValue(new (VendorNotConnectedError as { new (msg: string): Error })('v1'));
    const res = await POST(mockRequest({ email: 'a@b.com', cartDetails: [{ id: 't1' }] }));
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.error).toMatch(/cannot accept payments/);
  });

  it('returns 400 if Stripe account lacks transfer capability', async () => {
    (authenticateUser as jest.Mock).mockResolvedValue({ id: '1', email: 'a@b.com', role: 'buyer' });
    (requireBuyer as jest.Mock).mockReturnValue({ id: '1', email: 'a@b.com', role: 'buyer' });
    (getSupabase as jest.Mock).mockReturnValue({
      from: () => ({
        select: () => ({
          in: () => ({ data: [ { id: 't1', vendor_id: 'v1', title: 'T', price: 1 } ], error: null }),
        }),
      }),
    });
    (getStripeAccountForVendor as jest.Mock).mockResolvedValue('acct_bad');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Stripe = require('stripe');
    Stripe.mockImplementation(() => ({
      ...Stripe(),
      accounts: {
        retrieve: jest.fn().mockResolvedValue({ capabilities: { transfers: 'inactive' } }),
      },
    }));
    const res = await POST(mockRequest({ email: 'a@b.com', cartDetails: [{ id: 't1' }] }));
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.error).toMatch(/fully activated/);
  });

  it('returns 200 and session url on success', async () => {
    (authenticateUser as jest.Mock).mockResolvedValue({ id: '1', email: 'a@b.com', role: 'buyer' });
    (requireBuyer as jest.Mock).mockReturnValue({ id: '1', email: 'a@b.com', role: 'buyer' });
    (getSupabase as jest.Mock).mockReturnValue({
      from: () => ({
        select: () => ({
          in: () => ({ data: [ { id: 't1', vendor_id: 'v1', title: 'T', price: 1 } ], error: null }),
        }),
      }),
    });
    (getStripeAccountForVendor as jest.Mock).mockResolvedValue('acct_123');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Stripe = require('stripe');
    Stripe.mockImplementation(() => ({
      ...Stripe(),
      accounts: {
        retrieve: jest.fn().mockResolvedValue({ capabilities: { transfers: 'active' } }),
      },
      prices: {
        list: jest.fn().mockResolvedValue({ data: [{ id: 'price_1' }] }),
      },
      checkout: {
        sessions: {
          create: jest.fn().mockResolvedValue({ url: 'https://checkout.stripe.com/session' }),
        },
      },
    }));
    const res = await POST(mockRequest({ email: 'a@b.com', cartDetails: [{ id: 't1' }] }));
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.url).toMatch(/stripe/);
  });
}); 