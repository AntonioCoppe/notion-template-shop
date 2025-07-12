import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from './session-provider'

export function useSupabaseAuth() {
  const router = useRouter()
  const { supabase } = useSupabase()

  useEffect(() => {
    // Clear any stale tokens and validate session on mount
    const initializeAuth = async () => {
      try {
        // Get current session
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error || !session) {
          // No valid session → try a refresh
          await supabase.auth.refreshSession()
        }
      } catch (error) {
        console.error('Session initialization error:', error)
      }
    }

    initializeAuth()

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event) => {
        if (event === 'SIGNED_IN') {
          // Validate session is fresh before redirecting
          try {
            const { data: { session: freshSession }, error } = await supabase.auth.getSession()
            
            if (error || !freshSession) {
              // Try to refresh the session
              await supabase.auth.refreshSession()
            }
            
            // Now check if user has a role and redirect
            const role = freshSession?.user?.user_metadata?.role
            if (role) {
              router.replace(role === 'vendor' ? '/vendor' : '/dashboard')
            } else {
              // User needs to complete profile
              router.replace('/auth/choose-role')
            }
          } catch (error) {
            console.error('Session validation error:', error)
          }
        }
        if (event === 'SIGNED_OUT') {
          router.replace('/auth/sign-in')
        }
      }
    )
    return () => listener.subscription.unsubscribe()
  }, [router, supabase])
} 