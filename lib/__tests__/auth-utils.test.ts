import { requireAuth, requireRole, requireVendor, requireBuyer, AuthenticatedUser } from '../auth-utils';

describe('auth-utils', () => {
  const user: AuthenticatedUser = {
    id: 'user-1',
    email: 'test@example.com',
    role: 'buyer',
  };

  describe('requireAuth', () => {
    it('returns user if authenticated', () => {
      expect(requireAuth(user)).toBe(user);
    });
    it('throws if user is null', () => {
      expect(() => requireAuth(null)).toThrow('Authentication required');
    });
  });

  describe('requireRole', () => {
    it('returns user if role matches', () => {
      expect(requireRole(user, 'buyer')).toBe(user);
    });
    it('throws if role does not match', () => {
      expect(() => requireRole(user, 'vendor')).toThrow('Access denied. Required role: vendor');
    });
  });

  describe('requireVendor', () => {
    it('returns user if role is vendor', () => {
      const vendor = { ...user, role: 'vendor' };
      expect(requireVendor(vendor)).toEqual(vendor);
    });
    it('throws if user is null', () => {
      expect(() => requireVendor(null)).toThrow('Authentication required');
    });
    it('throws if user is not vendor', () => {
      expect(() => requireVendor(user)).toThrow('Access denied. Required role: vendor');
    });
  });

  describe('requireBuyer', () => {
    it('returns user if role is buyer', () => {
      expect(requireBuyer(user)).toEqual(user);
    });
    it('throws if user is null', () => {
      expect(() => requireBuyer(null)).toThrow('Authentication required');
    });
    it('throws if user is not buyer', () => {
      const vendor = { ...user, role: 'vendor' };
      expect(() => requireBuyer(vendor)).toThrow('Access denied. Required role: buyer');
    });
  });
}); 