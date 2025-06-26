import { VendorNotConnectedError, getStripeAccountForVendor } from '../stripeConnect';
import { getSupabase } from '@/lib/supabase';

jest.mock('@/lib/supabase');

describe('stripeConnect', () => {
  describe('VendorNotConnectedError', () => {
    it('sets message and name', () => {
      const err = new VendorNotConnectedError('abc');
      expect(err.message).toBe('Vendor abc not connected to Stripe');
      expect(err.name).toBe('VendorNotConnectedError');
    });
  });

  describe('getStripeAccountForVendor', () => {
    const OLD_ENV = process.env;
    beforeEach(() => {
      jest.clearAllMocks();
      process.env = { ...OLD_ENV };
    });
    afterAll(() => {
      process.env = OLD_ENV;
    });

    it('returns account id if present', async () => {
      (getSupabase as jest.Mock).mockReturnValue({
        from: () => ({
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: { stripe_account_id: 'acct_123' }, error: null }),
            }),
          }),
        }),
      });
      await expect(getStripeAccountForVendor('vendor1')).resolves.toBe('acct_123');
    });

    it('throws error if supabase returns error', async () => {
      const supaError = new Error('db error');
      (getSupabase as jest.Mock).mockReturnValue({
        from: () => ({
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: null, error: supaError }),
            }),
          }),
        }),
      });
      await expect(getStripeAccountForVendor('vendor2')).rejects.toBe(supaError);
    });

    it('returns platform account if fallbackToPlatform and env var set', async () => {
      process.env.STRIPE_ACCOUNT_ID = 'platform_acct';
      (getSupabase as jest.Mock).mockReturnValue({
        from: () => ({
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: { stripe_account_id: null }, error: null }),
            }),
          }),
        }),
      });
      await expect(getStripeAccountForVendor('vendor3', { fallbackToPlatform: true })).resolves.toBe('platform_acct');
    });

    it('throws VendorNotConnectedError if no account and no fallback', async () => {
      (getSupabase as jest.Mock).mockReturnValue({
        from: () => ({
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: { stripe_account_id: null }, error: null }),
            }),
          }),
        }),
      });
      await expect(getStripeAccountForVendor('vendor4')).rejects.toThrow(VendorNotConnectedError);
    });
  });
}); 