import { POST } from '../route';
import { NextRequest } from 'next/server';
import { authenticateUser, requireVendor } from '@/lib/auth-utils';
import { getSupabase } from '@/lib/supabase';

jest.mock('@/lib/auth-utils');
jest.mock('@/lib/supabase');
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    accounts: {
      create: jest.fn(),
    },
    accountLinks: {
      create: jest.fn(),
    },
  }));
});

describe('POST /api/stripe/connect', () => {
  const OLD_ENV = process.env;
  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...OLD_ENV, STRIPE_SECRET_KEY: 'sk_test' };
  });
  afterAll(() => {
    process.env = OLD_ENV;
  });

  function mockRequest(body: Record<string, unknown>, url = 'http://localhost/api/stripe/connect') {
    return {
      json: () => Promise.resolve(body),
      url,
      headers: new Map(),
    } as unknown as NextRequest;
  }

  it('returns 401 if unauthenticated', async () => {
    (authenticateUser as jest.Mock).mockResolvedValue(null);
    const res = await POST(mockRequest({ vendorId: 'v1' }));
    const json = await res.json();
    expect(res.status).toBe(401);
    expect(json.error).toMatch(/Authentication required/);
  });

  it('returns 403 if not a vendor', async () => {
    (authenticateUser as jest.Mock).mockResolvedValue({ id: '1', email: 'a@b.com', role: 'buyer' });
    (requireVendor as jest.Mock).mockImplementation(() => { throw new Error('Access denied. Vendor role required.'); });
    const res = await POST(mockRequest({ vendorId: 'v1' }));
    const json = await res.json();
    expect(res.status).toBe(403);
    expect(json.error).toMatch(/Access denied/);
  });

  it('returns 400 if vendorId missing', async () => {
    (authenticateUser as jest.Mock).mockResolvedValue({ id: '1', email: 'a@b.com', role: 'vendor' });
    (requireVendor as jest.Mock).mockReturnValue({ id: '1', email: 'a@b.com', role: 'vendor' });
    const res = await POST(mockRequest({}));
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.error).toMatch(/Missing vendorId/);
  });

  it('returns 404 if vendor not found', async () => {
    (authenticateUser as jest.Mock).mockResolvedValue({ id: '1', email: 'a@b.com', role: 'vendor' });
    (requireVendor as jest.Mock).mockReturnValue({ id: '1', email: 'a@b.com', role: 'vendor' });
    (getSupabase as jest.Mock).mockReturnValue({
      from: () => ({
        select: () => ({
          eq: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: null, error: { message: 'not found' } }),
            }),
          }),
        }),
      }),
    });
    const res = await POST(mockRequest({ vendorId: 'v1' }));
    const json = await res.json();
    expect(res.status).toBe(404);
    expect(json.error).toMatch(/Vendor not found/);
  });

  it('returns 404 if vendor user not found', async () => {
    (authenticateUser as jest.Mock).mockResolvedValue({ id: '1', email: 'a@b.com', role: 'vendor' });
    (requireVendor as jest.Mock).mockReturnValue({ id: '1', email: 'a@b.com', role: 'vendor' });
    (getSupabase as jest.Mock).mockReturnValue({
      from: () => ({
        select: () => ({
          eq: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: { stripe_account_id: null, user_id: 'u1', country: 'US' }, error: null }),
            }),
          }),
        }),
      }),
    });
    // user lookup returns null
    (getSupabase as jest.Mock).mockReturnValueOnce({
      from: () => ({
        select: () => ({
          eq: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: null, error: { message: 'not found' } }),
            }),
          }),
        }),
      }),
    });
    const res = await POST(mockRequest({ vendorId: 'v1' }));
    const json = await res.json();
    expect(res.status).toBe(404);
    expect(json.error).toMatch(/Vendor user not found/);
  });

  it('creates new Stripe account and onboarding link if not connected', async () => {
    (authenticateUser as jest.Mock).mockResolvedValue({ id: '1', email: 'a@b.com', role: 'vendor' });
    (requireVendor as jest.Mock).mockReturnValue({ id: '1', email: 'a@b.com', role: 'vendor' });
    // vendor lookup
    (getSupabase as jest.Mock).mockReturnValueOnce({
      from: () => ({
        select: () => ({
          eq: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: { stripe_account_id: null, user_id: 'u1', country: 'US' }, error: null }),
            }),
          }),
        }),
      }),
    });
    // user lookup
    (getSupabase as jest.Mock).mockReturnValueOnce({
      from: () => ({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: { email: 'a@b.com' }, error: null }),
          }),
        }),
      }),
    });
    // update vendor
    (getSupabase as jest.Mock).mockReturnValueOnce({
      from: () => ({
        update: () => ({
          eq: () => Promise.resolve({}),
        }),
      }),
    });
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Stripe = require('stripe');
    Stripe.mockImplementation(() => ({
      accounts: {
        create: jest.fn().mockResolvedValue({ id: 'acct_123' }),
      },
      accountLinks: {
        create: jest.fn().mockResolvedValue({ url: 'https://onboard.stripe.com' }),
      },
    }));
    const res = await POST(mockRequest({ vendorId: 'v1' }));
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.url).toMatch(/stripe/);
  });

  it('returns onboarding link if already connected', async () => {
    (authenticateUser as jest.Mock).mockResolvedValue({ id: '1', email: 'a@b.com', role: 'vendor' });
    (requireVendor as jest.Mock).mockReturnValue({ id: '1', email: 'a@b.com', role: 'vendor' });
    (getSupabase as jest.Mock).mockReturnValue({
      from: () => ({
        select: () => ({
          eq: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: { stripe_account_id: 'acct_123', user_id: 'u1', country: 'US' }, error: null }),
            }),
          }),
        }),
      }),
    });
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Stripe = require('stripe');
    Stripe.mockImplementation(() => ({
      accountLinks: {
        create: jest.fn().mockResolvedValue({ url: 'https://onboard.stripe.com' }),
      },
    }));
    const res = await POST(mockRequest({ vendorId: 'v1' }));
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.url).toMatch(/stripe/);
  });

  it('returns 500 on error', async () => {
    (authenticateUser as jest.Mock).mockImplementation(() => { throw new Error('fail'); });
    const res = await POST(mockRequest({ vendorId: 'v1' }));
    const json = await res.json();
    expect(res.status).toBe(500);
    expect(json.error).toMatch(/Internal server error/);
  });
}); 