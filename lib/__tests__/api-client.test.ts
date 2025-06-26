import { vendorApiCall, buyerApiCall, authenticatedFetch } from '../api-client';
import { getBrowserSupabase } from '../supabase-browser';

jest.mock('../supabase-browser');

const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockSession = (token?: string) => ({
  data: { session: token ? { access_token: token } : null },
});

describe('api-client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('authenticatedFetch', () => {
    it('throws if no session token', async () => {
      (getBrowserSupabase as jest.Mock).mockReturnValue({
        auth: { getSession: () => Promise.resolve(mockSession(undefined)) },
      });
      await expect(authenticatedFetch('/api', {})).rejects.toThrow('No authentication token available');
    });
    it('calls fetch with Authorization header', async () => {
      (getBrowserSupabase as jest.Mock).mockReturnValue({
        auth: { getSession: () => Promise.resolve(mockSession('abc123')) },
      });
      mockFetch.mockResolvedValue({ ok: true, status: 200 });
      await authenticatedFetch('/api', { method: 'GET' });
      expect(mockFetch).toHaveBeenCalledWith(
        '/api',
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: 'Bearer abc123' }),
        })
      );
    });
  });

  describe('vendorApiCall', () => {
    beforeEach(() => {
      (getBrowserSupabase as jest.Mock).mockReturnValue({
        auth: { getSession: () => Promise.resolve(mockSession('abc123')) },
      });
    });
    it('throws on 401', async () => {
      mockFetch.mockResolvedValue({ status: 401 });
      await expect(vendorApiCall('/api', {})).rejects.toThrow('Authentication required');
    });
    it('throws on 403', async () => {
      mockFetch.mockResolvedValue({ status: 403 });
      await expect(vendorApiCall('/api', {})).rejects.toThrow('Access denied. Vendor role required.');
    });
    it('throws on !ok with error json', async () => {
      mockFetch.mockResolvedValue({
        status: 500,
        ok: false,
        json: () => Promise.resolve({ error: 'fail' }),
      });
      await expect(vendorApiCall('/api', {})).rejects.toThrow('fail');
    });
    it('throws on !ok with unknown error', async () => {
      mockFetch.mockResolvedValue({
        status: 500,
        ok: false,
        json: () => Promise.reject(),
      });
      await expect(vendorApiCall('/api', {})).rejects.toThrow('Unknown error');
    });
    it('returns response on ok', async () => {
      const resp = { status: 200, ok: true };
      mockFetch.mockResolvedValue(resp);
      await expect(vendorApiCall('/api', {})).resolves.toBe(resp);
    });
  });

  describe('buyerApiCall', () => {
    beforeEach(() => {
      (getBrowserSupabase as jest.Mock).mockReturnValue({
        auth: { getSession: () => Promise.resolve(mockSession('abc123')) },
      });
    });
    it('throws on 401', async () => {
      mockFetch.mockResolvedValue({ status: 401 });
      await expect(buyerApiCall('/api', {})).rejects.toThrow('Authentication required');
    });
    it('throws on 403', async () => {
      mockFetch.mockResolvedValue({ status: 403 });
      await expect(buyerApiCall('/api', {})).rejects.toThrow('Access denied. Buyer role required.');
    });
    it('throws on !ok with error json', async () => {
      mockFetch.mockResolvedValue({
        status: 500,
        ok: false,
        json: () => Promise.resolve({ error: 'fail' }),
      });
      await expect(buyerApiCall('/api', {})).rejects.toThrow('fail');
    });
    it('throws on !ok with unknown error', async () => {
      mockFetch.mockResolvedValue({
        status: 500,
        ok: false,
        json: () => Promise.reject(),
      });
      await expect(buyerApiCall('/api', {})).rejects.toThrow('Unknown error');
    });
    it('returns response on ok', async () => {
      const resp = { status: 200, ok: true };
      mockFetch.mockResolvedValue(resp);
      await expect(buyerApiCall('/api', {})).resolves.toBe(resp);
    });
  });
}); 