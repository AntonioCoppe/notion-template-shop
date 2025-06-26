import { GET } from '../route';
import { NextRequest } from 'next/server';
import Stripe from 'stripe';

jest.mock('stripe');
// Our mocked Stripe constructor: (string, StripeConfig?) => Stripe
const MockedStripe = Stripe as unknown as jest.MockInstance<Stripe, [string, Stripe.StripeConfig?]>;

describe('GET /api/stripe/account-status', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...OLD_ENV, STRIPE_SECRET_KEY: 'sk_test' };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  function mockRequest(acct?: string): NextRequest {
    const url = new URL(
      'http://localhost/api/stripe/account-status' + (acct ? `?acct=${acct}` : '')
    );
    return { nextUrl: url, headers: new Map() } as unknown as NextRequest;
  }

  it('returns 500 if STRIPE_SECRET_KEY missing', async () => {
    process.env.STRIPE_SECRET_KEY = '';
    const res = await GET(mockRequest('acct_123'));
    const json = await res.json();
    expect(res.status).toBe(500);
    expect(json.error).toMatch(/Server configuration error/);
  });

  it('returns 400 if acct param missing', async () => {
    const res = await GET(mockRequest());
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.error).toMatch(/Missing account id/);
  });

  it('returns 500 on Stripe error', async () => {
    const mockRetrieve = jest
      .fn<Promise<Stripe.Account>, [string]>()
      .mockRejectedValue(new Error('fail'));

    const stripeInstance = {
      accounts: { retrieve: mockRetrieve },
    } as unknown as Stripe;

    MockedStripe.mockImplementation((_apiKey, _config) => {
      void _apiKey; void _config;
      return stripeInstance;
    });

    const res = await GET(mockRequest('acct_123'));
    const json = await res.json();
    expect(res.status).toBe(500);
    expect(json.error).toMatch(/Failed to retrieve account status/);
  });

  it('returns account info on success', async () => {
    const mockRetrieve = jest
      .fn<Promise<Stripe.Account>, [string]>()
      .mockResolvedValue(
        ({ id: 'acct_123', status: 'active' } as unknown) as Stripe.Account
      );

    const stripeInstance = {
      accounts: { retrieve: mockRetrieve },
    } as unknown as Stripe;

    MockedStripe.mockImplementation((_apiKey, _config) => {
      void _apiKey; void _config;
      return stripeInstance;
    });

    const res = await GET(mockRequest('acct_123'));
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.id).toBe('acct_123');
    expect(json.status).toBe('active');
  });
});
