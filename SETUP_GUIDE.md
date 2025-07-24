# Creator CRM Platform - Complete Setup Guide

This guide will help you set up the Creator CRM Platform from scratch, including database setup, environment configuration, and deployment.

## Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier works)
- Clerk account (free tier works)
- Stripe account (for payments)
- Git

## 1. Environment Setup

### Install Dependencies
```bash
npm install
```

### Environment Variables
Create a `.env.local` file with the following variables:

```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# App URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 2. Database Setup

### Option 1: Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `database_schema.sql`
4. Run the SQL to create all tables

### Option 2: Using Supabase CLI
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Push schema
supabase db push
```

## 3. Clerk Setup

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Create a new application
3. Configure the following:
   - **Application Name**: Creator CRM Platform
   - **Authentication Strategy**: Email + Social
   - **Social Providers**: Google, GitHub (optional)
4. Copy the publishable and secret keys to your `.env.local`

## 4. Stripe Setup

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Create products and prices:
   - **Tango Core (Monthly)**: $39.99/month
   - **Tango Core (Yearly)**: $383.90/year (20% discount)
3. Set up webhook endpoint:
   - URL: `https://yourdomain.com/api/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.*`
4. Copy the webhook secret to your `.env.local`

## 5. Supabase Configuration

### Enable Row Level Security (RLS)
All tables have RLS enabled by default. Make sure to configure policies:

```sql
-- Example RLS policy for users
CREATE POLICY "Users can only see their own data" ON users
    FOR ALL USING (auth.uid() = id);

-- Example RLS policy for deals
CREATE POLICY "Users can only see their own deals" ON deals
    FOR ALL USING (auth.uid() = user_id);
```

### Configure Authentication
1. Go to Supabase Authentication settings
2. Enable Clerk as external provider
3. Set up the JWT secret

## 6. Local Development

### Start Development Server
```bash
npm run dev
```

### Test Database Connection
Visit `http://localhost:3000/api/test-db` to verify database connectivity.

### Test Authentication
1. Visit `http://localhost:3000`
2. Click "Get Started" to test the onboarding flow
3. Complete the 4-step onboarding process

## 7. Production Deployment

### Vercel Deployment
1. Push your code to GitHub
2. Import the repository in Vercel
3. Add all environment variables
4. Deploy

### Environment Variables for Production
Update your production environment variables:
- `NEXT_PUBLIC_APP_URL`: Your production domain
- All other variables should be production-ready

### Stripe Webhook Configuration
Update your Stripe webhook endpoint to your production URL:
- `https://yourdomain.com/api/stripe/webhook`

## 8. Testing the Complete Flow

### Test User Onboarding
1. Create a new account via Clerk
2. Complete the 4-step onboarding:
   - Select niches (Content Creator, Coach, etc.)
   - Choose goals
   - View testimonials
   - Start 3-day free trial
3. Complete Stripe checkout
4. Verify redirect to onboarding success page
5. Check dashboard loads with correct niche

### Test CRM Features
1. **Clients**: Add, edit, delete clients
2. **Deals**: Create deals, move through pipeline stages
3. **Content**: Plan and track content
4. **Calendar**: Schedule meetings and events
5. **Goals**: Set and track progress
6. **Journal**: Create journal entries

## 9. Troubleshooting

### Common Issues

#### Database Connection Issues
- Verify Supabase URL and anon key
- Check if RLS policies are properly configured
- Ensure user ID is being passed correctly

#### Authentication Issues
- Verify Clerk keys are correct
- Check if Clerk webhook is configured
- Ensure user is properly authenticated

#### Stripe Issues
- Verify Stripe keys are correct
- Check webhook endpoint is accessible
- Ensure products/prices are created

#### Build Issues
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run build
```

## 10. Monitoring and Analytics

### Supabase Analytics
- Monitor database usage
- Check query performance
- Review RLS policy effectiveness

### Clerk Analytics
- Track user sign-ups
- Monitor authentication events
- Review user engagement

### Stripe Analytics
- Track subscription metrics
- Monitor payment failures
- Review revenue analytics

## 11. Maintenance

### Regular Updates
- Keep dependencies updated
- Monitor security advisories
- Update environment variables as needed

### Database Maintenance
- Regular backups
- Performance optimization
- Schema updates (use migrations)

## 12. Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the documentation in the `/docs` folder
3. Check the GitHub issues
4. Contact support via the provided channels

## Quick Start Commands

```bash
# Clone repository
git clone [your-repo-url]
cd creator-crm-platform

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your keys

# Run database setup
# Copy database_schema.sql to Supabase SQL editor and run

# Start development
npm run dev

# Build for production
npm run build
```

## Success Checklist

- [ ] Environment variables configured
- [ ] Database schema created
- [ ] Clerk authentication working
- [ ] Stripe checkout functional
- [ ] Onboarding flow complete
- [ ] All CRM features accessible
- [ ] Production deployment successful
- [ ] Monitoring and analytics configured
