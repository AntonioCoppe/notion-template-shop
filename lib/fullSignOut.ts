export async function fullSignOut(supabase: any) {
  const { error } = await supabase.auth.signOut();
  if (error) {
    return { error };
  }
  try {
    await fetch('/api/supabase/session', { method: 'DELETE', credentials: 'include' });
  } catch (err) {
    console.error('Failed to clear session cookies:', err);
  }
  return { error: null };
}

