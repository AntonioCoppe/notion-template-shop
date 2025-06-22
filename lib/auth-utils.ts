import { getSupabase } from './supabase';
import { NextRequest } from 'next/server';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
}

export async function authenticateUser(request: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    const supabase = getSupabase();
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    
    // Verify the token and get user
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email || '',
      role: user.user_metadata?.role || 'buyer'
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

export function requireAuth(user: AuthenticatedUser | null): AuthenticatedUser {
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
}

export function requireRole(user: AuthenticatedUser, requiredRole: string): AuthenticatedUser {
  if (user.role !== requiredRole) {
    throw new Error(`Access denied. Required role: ${requiredRole}`);
  }
  return user;
}

export function requireVendor(user: AuthenticatedUser | null): AuthenticatedUser {
  const authenticatedUser = requireAuth(user);
  return requireRole(authenticatedUser, 'vendor');
}

export function requireBuyer(user: AuthenticatedUser | null): AuthenticatedUser {
  const authenticatedUser = requireAuth(user);
  return requireRole(authenticatedUser, 'buyer');
} 