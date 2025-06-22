import fs from 'fs';

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

  // Test 8: Check forgot password flow
  console.log('\n8. Checking forgot password flow...');
  try {
    // Check if forgot password page exists
    if (fs.existsSync('./app/auth/forgot-password/page.tsx')) {
      console.log('✅ app/auth/forgot-password/page.tsx exists');
    } else {
      console.log('❌ app/auth/forgot-password/page.tsx missing');
    }

    // Check if reset password page exists
    if (fs.existsSync('./app/auth/reset-password/page.tsx')) {
      console.log('✅ app/auth/reset-password/page.tsx exists');
    } else {
      console.log('❌ app/auth/reset-password/page.tsx missing');
    }

    // Check if sign-in page has forgot password link
    if (fs.existsSync('./app/auth/sign-in/page.tsx')) {
      const signInContent = fs.readFileSync('./app/auth/sign-in/page.tsx', 'utf8');
      if (signInContent.includes('/auth/forgot-password')) {
        console.log('✅ Sign-in page includes forgot password link');
      } else {
        console.log('❌ Sign-in page missing forgot password link');
      }
    } else {
      console.log('❌ app/auth/sign-in/page.tsx missing');
    }

    // Check forgot password page functionality
    if (fs.existsSync('./app/auth/forgot-password/page.tsx')) {
      const forgotPasswordContent = fs.readFileSync('./app/auth/forgot-password/page.tsx', 'utf8');
      
      if (forgotPasswordContent.includes('resetPasswordForEmail')) {
        console.log('✅ Forgot password page uses resetPasswordForEmail');
      } else {
        console.log('❌ Forgot password page missing resetPasswordForEmail');
      }
      
      if (forgotPasswordContent.includes('/auth/reset-password')) {
        console.log('✅ Forgot password page redirects to reset-password');
      } else {
        console.log('❌ Forgot password page missing redirect to reset-password');
      }
      
      if (forgotPasswordContent.includes('useState')) {
        console.log('✅ Forgot password page has proper React hooks');
      } else {
        console.log('❌ Forgot password page missing React hooks');
      }
    }

    // Check reset password page functionality
    if (fs.existsSync('./app/auth/reset-password/page.tsx')) {
      const resetPasswordContent = fs.readFileSync('./app/auth/reset-password/page.tsx', 'utf8');
      
      if (resetPasswordContent.includes('updateUser')) {
        console.log('✅ Reset password page uses updateUser');
      } else {
        console.log('❌ Reset password page missing updateUser');
      }
      
      if (resetPasswordContent.includes('getSession')) {
        console.log('✅ Reset password page validates session');
      } else {
        console.log('❌ Reset password page missing session validation');
      }
      
      if (resetPasswordContent.includes('password !== confirmPassword')) {
        console.log('✅ Reset password page validates password confirmation');
      } else {
        console.log('❌ Reset password page missing password confirmation validation');
      }
      
      if (resetPasswordContent.includes('password.length < 6')) {
        console.log('✅ Reset password page validates password length');
      } else {
        console.log('❌ Reset password page missing password length validation');
      }
      
      if (resetPasswordContent.includes('useState') && resetPasswordContent.includes('useEffect')) {
        console.log('✅ Reset password page has proper React hooks');
      } else {
        console.log('❌ Reset password page missing React hooks');
      }
    }

  } catch (error) {
    console.log('❌ Error checking forgot password flow:', error.message);
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
  console.log('6. Forgot Password Flow Tests:');
  console.log('   - Click "Forgot password?" on sign-in page → should go to /auth/forgot-password');
  console.log('   - Enter email on forgot password page → should send reset email');
  console.log('   - Click reset link in email → should go to /auth/reset-password');
  console.log('   - Enter new password and confirm → should update password');
  console.log('   - After password reset → should redirect to sign-in page');
  console.log('   - Try to access reset-password without valid session → should show error');
  console.log('   - Try to submit mismatched passwords → should show validation error');
  console.log('   - Try to submit short password → should show length validation error');
  console.log('');
  console.log('🎯 All tests completed! Check the manual testing checklist above.');
}

testAccessControl().catch(console.error); 