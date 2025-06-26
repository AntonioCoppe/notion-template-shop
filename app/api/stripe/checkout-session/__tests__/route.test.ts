import { GET } from '../route';
import { NextRequest } from 'next/server';
import Stripe from 'stripe';

jest.mock('stripe');
// Tell TS that our mocked Stripe constructor takes (string, StripeConfig?) => Stripe
const MockedStripe = Stripe as unknown as jest.MockInstance<Stripe, [string, Stripe.StripeConfig?]>;

describe('GET /api/stripe/checkout-session', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...OLD_ENV, STRIPE_SECRET_KEY: 'sk_test' };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  function mockRequest(session_id?: string): NextRequest {
    const url = new URL('http://localhost/api/stripe/checkout-session');
    if (session_id) url.searchParams.set('session_id', session_id);
    return { nextUrl: url, headers: new Map() } as unknown as NextRequest;
  }

  it('returns 500 if STRIPE_SECRET_KEY missing', async () => {
    process.env.STRIPE_SECRET_KEY = '';
    const res = await GET(mockRequest('sess_123'));
    const json = await res.json();
    expect(res.status).toBe(500);
    expect(json.error).toMatch(/Server config error/);
  });

  it('returns 400 if session_id missing', async () => {
    const res = await GET(mockRequest());
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.error).toMatch(/Missing session_id/);
  });

  it('returns 500 on Stripe error', async () => {
    // 1) Create a typed mock retrieve() that rejects
    const mockRetrieve = jest
      .fn<Promise<Stripe.Checkout.Session>, [string]>()
      .mockRejectedValue(new Error('fail'));

    // 2) Minimal Stripe instance
    const stripeInstance = {
      checkout: { sessions: { retrieve: mockRetrieve } },
    } as unknown as Stripe;

    // 3) Mock the constructor
    MockedStripe.mockImplementation((_apiKey, _config) => {
      void _apiKey; void _config;
      return stripeInstance;
    });

    const res = await GET(mockRequest('sess_123'));
    const json = await res.json();
    expect(res.status).toBe(500);
    expect(json.error).toMatch(/fail/);
  });

  it('returns session info on success', async () => {
    // 1) Create a typed mock retrieve() that resolves
    const mockRetrieve = jest
      .fn<Promise<Stripe.Checkout.Session>, [string]>()
      .mockResolvedValue(
        // Cast through unknown to satisfy TS that this is a full Session
        ({ id: 'sess_123', status: 'complete' } as unknown) as Stripe.Checkout.Session
      );

    // 2) Minimal Stripe instance
    const stripeInstance = {
      checkout: { sessions: { retrieve: mockRetrieve } },
    } as unknown as Stripe;

    // 3) Mock the constructor
    MockedStripe.mockImplementation((_apiKey, _config) => {
      void _apiKey; void _config;
      return stripeInstance;
    });

    const res = await GET(mockRequest('sess_123'));
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.id).toBe('sess_123');
    expect(json.status).toBe('complete');
  });
});
