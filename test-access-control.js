const fs = require('fs');

async function testAccessControl() {
  console.log('🧪 Testing Access Control Implementation\n');

  // Test 1: Check if middleware file exists
  console.log('1. Checking middleware file...');
  try {
    if (fs.existsSync('./middleware.ts')) {
      console.log('✅ middleware.ts exists');
    } else {
      console.log('❌ middleware.ts missing');
    }
  } catch (error) {
    console.log('❌ Error checking middleware file:', error.message);
  }

  // Test 2: Check if auth utilities exist
  console.log('\n2. Checking auth utilities...');
  try {
    if (fs.existsSync('./lib/auth-utils.ts')) {
      console.log('✅ lib/auth-utils.ts exists');
    } else {
      console.log('❌ lib/auth-utils.ts missing');
    }
    
    if (fs.existsSync('./lib/api-client.ts')) {
      console.log('✅ lib/api-client.ts exists');
    } else {
      console.log('❌ lib/api-client.ts missing');
    }
  } catch (error) {
    console.log('❌ Error checking auth utilities:', error.message);
  }

  // Test 3: Check if protected pages exist
  console.log('\n3. Checking protected pages...');
  try {
    const pages = [
      './app/vendor/page.tsx',
      './app/cart/page.tsx', 
      './app/account/page.tsx'
    ];
    
    pages.forEach(page => {
      if (fs.existsSync(page)) {
        console.log(`✅ ${page} exists`);
      } else {
        console.log(`❌ ${page} missing`);
      }
    });
  } catch (error) {
    console.log('❌ Error checking protected pages:', error.message);
  }

  // Test 4: Check if API routes exist
  console.log('\n4. Checking protected API routes...');
  try {
    const apiRoutes = [
      './app/api/stripe/connect/route.ts',
      './app/api/stripe/checkout/route.ts'
    ];
    
    apiRoutes.forEach(route => {
      if (fs.existsSync(route)) {
        console.log(`✅ ${route} exists`);
      } else {
        console.log(`❌ ${route} missing`);
      }
    });
  } catch (error) {
    console.log('❌ Error checking API routes:', error.message);
  }

  // Test 5: Check if navbar exists
  console.log('\n5. Checking navbar...');
  try {
    if (fs.existsSync('./app/Navbar.tsx')) {
      console.log('✅ app/Navbar.tsx exists');
    } else {
      console.log('❌ app/Navbar.tsx missing');
    }
  } catch (error) {
    console.log('❌ Error checking navbar:', error.message);
  }

  // Test 6: Check if documentation exists
  console.log('\n6. Checking documentation...');
  try {
    if (fs.existsSync('./ACCESS_CONTROL.md')) {
      console.log('✅ ACCESS_CONTROL.md exists');
    } else {
      console.log('❌ ACCESS_CONTROL.md missing');
    }
  } catch (error) {
    console.log('❌ Error checking documentation:', error.message);
  }

  // Test 7: Check middleware content
  console.log('\n7. Checking middleware configuration...');
  try {
    const middlewareContent = fs.readFileSync('./middleware.ts', 'utf8');
    if (middlewareContent.includes('/vendor/:path*')) {
      console.log('✅ Middleware protects vendor routes');
    } else {
      console.log('❌ Middleware missing vendor route protection');
    }
    
    if (middlewareContent.includes('/cart/:path*')) {
      console.log('✅ Middleware protects cart routes');
    } else {
      console.log('❌ Middleware missing cart route protection');
    }
    
    if (middlewareContent.includes('/account/:path*')) {
      console.log('✅ Middleware protects account routes');
    } else {
      console.log('❌ Middleware missing account route protection');
    }
  } catch (error) {
    console.log('❌ Error checking middleware content:', error.message);
  }

  console.log('\n📋 Manual Testing Checklist:');
  console.log('================================');
  console.log('1. Unauthenticated User Tests:');
  console.log('   - Visit /vendor → should redirect to /auth/sign-in');
  console.log('   - Visit /cart → should redirect to /auth/sign-in');
  console.log('   - Visit /account → should redirect to /auth/sign-in');
  console.log('');
  console.log('2. Buyer Role Tests:');
  console.log('   - Sign up as buyer');
  console.log('   - Visit /vendor → should show "Access Denied"');
  console.log('   - Visit /cart → should work normally');
  console.log('   - Visit /account → should work normally');
  console.log('   - Navbar should show Cart and Account links');
  console.log('');
  console.log('3. Vendor Role Tests:');
  console.log('   - Sign up as vendor');
  console.log('   - Visit /cart → should show "Access Denied"');
  console.log('   - Visit /account → should show "Access Denied"');
  console.log('   - Visit /vendor → should work normally');
  console.log('   - Navbar should show Vendor Dashboard link');
  console.log('');
  console.log('4. API Route Tests:');
  console.log('   - Call /api/stripe/connect without auth → should return 401');
  console.log('   - Call /api/stripe/connect as buyer → should return 403');
  console.log('   - Call /api/stripe/checkout without auth → should return 401');
  console.log('   - Call /api/stripe/checkout as vendor → should return 403');
  console.log('');
  console.log('5. Middleware Tests:');
  console.log('   - Direct URL access to protected routes should be blocked');
  console.log('   - Role-based redirects should work correctly');
  console.log('');
  console.log('🎯 All tests completed! Check the manual testing checklist above.');
}

testAccessControl().catch(console.error); 