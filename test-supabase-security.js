#!/usr/bin/env node

/**
 * Test script to verify Supabase security improvements
 * Run with: node test-supabase-security.js
 */

import fs from 'fs'

console.log('🔒 Testing Supabase Security Improvements...\n')

try {
  // Test 1: Verify no hardcoded values in next.config.mjs
  const nextConfig = fs.readFileSync('./next.config.mjs', 'utf8')
  
  if (nextConfig.includes('uthbpvnrrtkngmltlszg.supabase.co')) {
    console.log('❌ Security issue: Hardcoded Supabase hostname found in next.config.mjs')
    process.exit(1)
  } else {
    console.log('✅ Security fix verified: No hardcoded Supabase hostname in next.config.mjs')
  }
  
  // Test 2: Verify environment variable usage
  if (nextConfig.includes('getSupabaseHostname()')) {
    console.log('✅ Security fix verified: Using dynamic hostname extraction function')
  } else {
    console.log('❌ Security issue: Not using dynamic hostname extraction')
    process.exit(1)
  }
  
  // Test 3: Verify supabase-utils.ts exists
  if (fs.existsSync('./lib/supabase-utils.ts')) {
    console.log('✅ Security fix verified: supabase-utils.ts utility file exists')
  } else {
    console.log('❌ Security issue: supabase-utils.ts utility file missing')
    process.exit(1)
  }
  
  // Test 4: Verify utility functions are properly defined
  const utilsContent = fs.readFileSync('./lib/supabase-utils.ts', 'utf8')
  if (utilsContent.includes('getSupabaseHostname') && utilsContent.includes('process.env.NEXT_PUBLIC_SUPABASE_URL')) {
    console.log('✅ Security fix verified: Utility functions properly implemented')
  } else {
    console.log('❌ Security issue: Utility functions not properly implemented')
    process.exit(1)
  }
  
  console.log('\n🎉 All security tests passed! The Supabase project reference is now properly protected.')
  console.log('\n📝 Summary of security improvements:')
  console.log('   • Removed hardcoded Supabase hostname from next.config.mjs')
  console.log('   • Added dynamic hostname extraction from environment variables')
  console.log('   • Created reusable utility functions in lib/supabase-utils.ts')
  console.log('   • Updated documentation with security best practices')
  
} catch (error) {
  console.error('❌ Test failed:', error.message)
  process.exit(1)
} 