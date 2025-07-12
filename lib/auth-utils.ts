import { NextRequest } from 'next/server';
import { getSupabase } from './supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

export type AuthenticatedUser = {
  id: string;
  email: string;
  role: 'buyer' | 'vendor';
};

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

// Utility function to clear stale tokens
export async function clearStaleTokens(supabase: SupabaseClient) {
  try {
    // Check if there's an existing session first
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      // Only sign out if there's an existing session
      await supabase.auth.signOut();
      console.log('Stale tokens cleared');
    } else {
      console.log('No existing session to clear');
    }
  } catch (error) {
    console.error('Error clearing tokens:', error);
    // Don't throw the error, just log it
  }
}

// Utility function to validate and refresh session
export async function validateAndRefreshSession(supabase: SupabaseClient) {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
      // No valid session → try a refresh
      const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError || !refreshedSession) {
        throw new Error('Failed to refresh session');
      }
      
      return refreshedSession;
    }
    
    return session;
  } catch (error) {
    console.error('Session validation error:', error);
    throw error;
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