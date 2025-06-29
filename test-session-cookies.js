#!/usr/bin/env node

/**
 * Test script to verify cookies are set by /api/auth/session
 * Run with: node test-session-cookies.js
 */

import fetch from 'node-fetch';

async function testSessionCookies() {
  console.log('🍪 Testing /api/auth/session cookie handling\n');

  const tokens = {
    access_token: 'test_access_token',
    refresh_token: 'test_refresh_token'
  };

  try {
    const res = await fetch('http://localhost:3000/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tokens),
      redirect: 'manual'
    });

    const cookieHeader = res.headers.raw()['set-cookie'] || [];
    const accessCookie = cookieHeader.find(c => c.startsWith('sb-access-token='));
    const refreshCookie = cookieHeader.find(c => c.startsWith('sb-refresh-token='));

    if (!accessCookie || !refreshCookie) {
      console.error('❌ Session cookies not found');
      process.exit(1);
    }
    console.log('✅ Session cookies present');

    const domainMatch = /domain=([^;]+)/i.exec(accessCookie.toLowerCase());
    const cookieDomain = domainMatch ? domainMatch[1] : undefined;

    const host = 'localhost';
    const secure = process.env.NODE_ENV === 'production';
    const expectedDomain = secure
      ? process.env.ROOT_DOMAIN
        ? `.${process.env.ROOT_DOMAIN}`
        : undefined
      : host === 'localhost'
        ? undefined
        : '.' + host.replace(/^www\./, '');

    if (cookieDomain === expectedDomain || (!cookieDomain && expectedDomain === undefined)) {
      console.log(`✅ Domain matches expected (${cookieDomain ?? 'none'})`);
    } else {
      console.error(`❌ Domain mismatch. Expected ${expectedDomain ?? 'none'}, got ${cookieDomain ?? 'none'}`);
      process.exit(1);
    }

    console.log('\n🎉 All cookie tests passed!');
  } catch (err) {
    console.error('❌ Error during test:', err.message);
    process.exit(1);
  }
}

await testSessionCookies();
