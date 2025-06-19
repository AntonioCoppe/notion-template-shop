# Stripe Setup Guide for Notion Template Shop

This guide will help you set up Stripe Connect to handle vendor payments with commission structure.

## 🚀 Quick Setup Steps

### 1. Create a Stripe Account
1. Go to [stripe.com](https://stripe.com) and create an account
2. Complete your business verification
3. Get your API keys from the Stripe Dashboard

### 2. Environment Variables Setup

Add these environment variables to your `.env.local` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_... # Your Stripe secret key
STRIPE_WEBHOOK_SECRET=whsec_... # Webhook secret (we'll create this)
NEXT_PUBLIC_SITE_URL=http://localhost:3000 # Your site URL

# Supabase Configuration (you already have these)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Email Service (for order confirmations)
RESEND_API_KEY=your_resend_api_key
```

### 3. Get Your Stripe API Keys

1. **Log into Stripe Dashboard**
2. **Go to Developers → API Keys**
3. **Copy your Secret Key** (starts with `sk_test_` for test mode, `sk_live_` for production)
4. **Copy your Publishable Key** (starts with `pk_test_` for test mode, `pk_live_` for production)

### 4. Set Up Webhooks

1. **In Stripe Dashboard, go to Developers → Webhooks**
2. **Click "Add endpoint"**
3. **Enter your webhook URL**: `https://your-domain.com/api/webhook`
4. **Select these events**:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `account.updated` (for Connect accounts)
5. **Copy the webhook secret** and add it to your environment variables

### 5. Configure Stripe Connect

1. **Go to Connect → Settings in Stripe Dashboard**
2. **Enable Express accounts** (this is what we're using)
3. **Set your application fee** (currently set to 10% in the code)
4. **Configure your branding** (optional)

## 💰 Commission Structure

The current setup takes a **10% commission** on every sale. Here's how it works:

### How Commissions Work

1. **Customer pays** $10 for a template
2. **Stripe processes** the payment
3. **Platform fee** of $1 (10%) goes to you
4. **Vendor receives** $9 (90%) minus Stripe fees

### Commission Configuration

The commission is set in `app/api/checkout/route.ts`:

```typescript
payment_intent_data: {
  application_fee_amount: Math.round(template.price * 10), // 10% platform fee
  transfer_data: {
    destination: vendor.stripe_account_id,
  },
},
```

To change the commission rate, modify the calculation:
- **5% commission**: `Math.round(template.price * 5)`
- **15% commission**: `Math.round(template.price * 15)`
- **Fixed $2 fee**: `200` (amount in cents)

## 🔧 Testing the Setup

### 1. Test Mode vs Live Mode

- **Test Mode**: Use test cards, no real money
- **Live Mode**: Real payments, real money

### 2. Test Cards

Use these test card numbers:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires Authentication**: `4000 0025 0000 3155`

### 3. Test Flow

1. **Sign up as a vendor**
2. **Go to vendor dashboard**
3. **Click "Connect Stripe"**
4. **Complete Stripe onboarding** (use test data)
5. **Add a template**
6. **Test purchase** as a buyer

## 🚨 Common Issues & Solutions

### Issue: "Failed to create Stripe account"

**Possible causes:**
- Missing environment variables
- Invalid Stripe API key
- Database connection issues

**Solutions:**
1. Check all environment variables are set
2. Verify Stripe API key is correct
3. Check Supabase connection
4. Look at server logs for detailed error

### Issue: "Email not confirmed"

**Solution:**
- Check your email and click the confirmation link
- Check spam folder
- Try signing up again

### Issue: "Vendor not connected to Stripe"

**Solution:**
- Make sure vendor completed Stripe onboarding
- Check vendor has `stripe_account_id` in database
- Reconnect Stripe if needed

### Issue: Webhook not working

**Solutions:**
1. Check webhook URL is correct
2. Verify webhook secret in environment variables
3. Test webhook endpoint manually
4. Check Stripe Dashboard for webhook delivery status

## 📊 Monitoring & Analytics

### Stripe Dashboard
- **Payments**: View all transactions
- **Connect**: Monitor vendor accounts
- **Reports**: Generate revenue reports
- **Disputes**: Handle chargebacks

### Your Platform
- **Orders table**: Track all purchases
- **Vendor dashboard**: Vendor-specific analytics
- **Webhook logs**: Monitor payment processing

## 🔒 Security Best Practices

1. **Never expose secret keys** in client-side code
2. **Use environment variables** for all sensitive data
3. **Validate webhook signatures** (already implemented)
4. **Use HTTPS** in production
5. **Monitor for suspicious activity**

## 🚀 Going Live

1. **Switch to live mode** in Stripe Dashboard
2. **Update environment variables** with live keys
3. **Update webhook URL** to production domain
4. **Test with small amounts** first
5. **Monitor transactions** closely

## 📞 Support

- **Stripe Support**: [support.stripe.com](https://support.stripe.com)
- **Stripe Documentation**: [stripe.com/docs](https://stripe.com/docs)
- **Connect Documentation**: [stripe.com/docs/connect](https://stripe.com/docs/connect)

## 🔄 Updating Commission Rates

To change commission rates, update these files:

1. **`app/api/checkout/route.ts`** - Main commission calculation
2. **`STRIPE_SETUP.md`** - Update this documentation
3. **Vendor terms** - Update vendor agreements

Example: Change to 15% commission
```typescript
application_fee_amount: Math.round(template.price * 15), // 15% platform fee
``` 