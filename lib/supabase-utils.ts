/**
 * Utility functions for Supabase configuration
 */

/**
 * Extracts the hostname from a Supabase URL
 * @param supabaseUrl - The Supabase project URL
 * @returns The hostname (e.g., "project-ref.supabase.co")
 */
export function getSupabaseHostname(supabaseUrl?: string): string {
  const url = supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL
  
  if (!url) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL environment variable is required')
  }
  
  try {
    const parsedUrl = new URL(url)
    return parsedUrl.hostname
  } catch {
    throw new Error('Invalid Supabase URL format')
  }
}

/**
 * Extracts the project reference from a Supabase URL
 * @param supabaseUrl - The Supabase project URL
 * @returns The project reference (e.g., "project-ref")
 */
export function getSupabaseProjectRef(supabaseUrl?: string): string {
  const hostname = getSupabaseHostname(supabaseUrl)
  return hostname.split('.')[0]
}

/**
 * Validates that a Supabase URL has the correct format
 * @param supabaseUrl - The Supabase project URL to validate
 * @returns true if valid, throws error if invalid
 */
export function validateSupabaseUrl(supabaseUrl: string): boolean {
  try {
    const url = new URL(supabaseUrl)
    if (!url.hostname.endsWith('.supabase.co')) {
      throw new Error('Supabase URL must end with .supabase.co')
    }
    return true
  } catch {
    throw new Error('Invalid Supabase URL format')
  }
} 