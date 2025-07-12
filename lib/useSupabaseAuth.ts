import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from './session-provider'

export function useSupabaseAuth() {
  const router = useRouter()
  const { supabase } = useSupabase()

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN') {
          // Check if user has a role, if not they'll be redirected to complete-profile
          const role = session?.user?.user_metadata?.role
          if (role) {
            router.replace(role === 'vendor' ? '/vendor' : '/dashboard')
          } else {
            // User needs to complete profile - they'll be redirected by the OAuth flow
            // or we can redirect them to choose role
            router.replace('/auth/choose-role')
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