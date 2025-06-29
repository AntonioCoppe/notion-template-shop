export async function authenticatedFetch(url: string, options: RequestInit = {}) {
  // Note: This function should be used within a component that has access to the session provider
  // For server-side usage, you'll need to pass the session token directly
  
  // For now, we'll use the browser client directly for this utility function
  // In a real implementation, you might want to restructure this to work with the session provider
  const { createBrowserClient } = await import('@supabase/ssr');
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
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