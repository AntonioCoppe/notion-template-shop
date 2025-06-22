import { getBrowserSupabase } from './supabase-browser';

export async function authenticatedFetch(url: string, options: RequestInit = {}) {
  const supabase = getBrowserSupabase();
  
  // Get the current session
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    throw new Error('No authentication token available');
  }

  // Add authorization header
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    'Authorization': `Bearer ${session.access_token}`,
  };

  return fetch(url, {
    ...options,
    headers,
  });
}

export async function vendorApiCall(url: string, options: RequestInit = {}) {
  const response = await authenticatedFetch(url, options);
  
  if (response.status === 401) {
    throw new Error('Authentication required');
  }
  
  if (response.status === 403) {
    throw new Error('Access denied. Vendor role required.');
  }
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || 'API call failed');
  }
  
  return response;
}

export async function buyerApiCall(url: string, options: RequestInit = {}) {
  const response = await authenticatedFetch(url, options);
  
  if (response.status === 401) {
    throw new Error('Authentication required');
  }
  
  if (response.status === 403) {
    throw new Error('Access denied. Buyer role required.');
  }
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || 'API call failed');
  }
  
  return response;
} 