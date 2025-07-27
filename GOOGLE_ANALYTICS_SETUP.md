# Google Analytics Setup Guide for Tango CRM

## Step 1: Create Google Analytics Account
1. Go to https://analytics.google.com/
2. Click "Start measuring"
3. Create account: "Tango CRM"
4. Create property: "gotangocrm.com"

## Step 2: Get Tracking Code
1. Copy the GA4 tracking code (G-XXXXXXXXXX)
2. Add to your environment variables:
   ```
   NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
   ```

## Step 3: Add to Layout
Add this to `src/app/layout.tsx` in the `<head>` section:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

## Step 4: Track Key Pages
Monitor these pages for SEO performance:
- `/` (Homepage)
- `/creator-crm`
- `/podcaster-crm` 
- `/coach-crm`
- `/freelancer-crm`
- `/blog/creator-crm-guide`
- `/blog/podcaster-crm-guide`

## Step 5: Set Up Goals
Create conversion goals for:
- Free trial signups
- Pricing page visits
- Blog engagement
- Contact form submissions

## Step 6: Monitor SEO Performance
Track these metrics:
- Organic traffic growth
- Page rankings for target keywords
- Click-through rates from search
- Time on page and bounce rate
- Conversion rates from organic traffic 