# Admin Setup Guide

## Overview
This guide explains how to set up and manage admin access for the Tango CRM platform.

## 🔐 Admin Authentication

### How it Works
- Admin access is controlled by email addresses
- Only users with admin emails can access `/admin/*` routes
- Admin emails are centrally managed in `src/lib/admin-config.ts`

### Current Admin Emails
- `stevenvitoratos@gmail.com` (Primary admin)

## 📁 Admin Routes

### Protected Routes
- `/admin` - Main admin dashboard
- `/admin/contact-submissions` - Contact form submissions
- `/api/admin/*` - Admin API endpoints

### Access Control
- **Middleware Protection**: Routes are protected at the middleware level
- **Component Protection**: Admin components use `AdminOnly` wrapper
- **API Protection**: Admin APIs check authentication and admin status

## 🛠️ Adding New Admins

### Step 1: Update Admin Config
Edit `src/lib/admin-config.ts`:
```typescript
export const ADMIN_EMAILS = [
  "stevenvitoratos@gmail.com", // Your email
  "newadmin@example.com",      // Add new admin
];
```

### Step 2: Restart Development Server
The changes will take effect after restarting the dev server.

## 🎯 Admin Features

### Contact Submissions Management
- **View**: All contact form submissions
- **Filter**: By status (new, read, replied, archived)
- **Update**: Submission status
- **Reply**: Direct email links
- **Archive**: Remove from active list

### Admin Dashboard
- **Overview**: Quick access to admin tools
- **Navigation**: Easy access from sidebar (admin users only)
- **Future**: User management, system settings

## 🔒 Security Features

### Authentication Layers
1. **Clerk Authentication**: Must be logged in
2. **Email Verification**: Must have admin email
3. **Route Protection**: Middleware blocks unauthorized access
4. **Component Protection**: UI components check admin status

### Database Security
- **Row Level Security (RLS)**: Enabled on contact_submissions table
- **API Authentication**: All admin APIs require authentication
- **Service Role**: Uses Supabase service role for admin operations

## 🚀 Testing Admin Access

### Test Contact Form
1. Go to `/contact`
2. Submit a test message
3. Check console logs for submission

### Test Admin Access
1. Login with admin email
2. Navigate to `/admin`
3. View contact submissions at `/admin/contact-submissions`

### Test Non-Admin Access
1. Login with non-admin email
2. Try to access `/admin/*` routes
3. Should be redirected to dashboard

## 📊 Database Schema

### Contact Submissions Table
```sql
CREATE TABLE contact_submissions (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  subject VARCHAR(500) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔧 Troubleshooting

### Common Issues

**Admin link not showing in sidebar**
- Check if user email is in `ADMIN_EMAILS` array
- Verify user is logged in
- Check browser console for errors

**Cannot access admin routes**
- Ensure user is authenticated
- Verify email is in admin list
- Check middleware configuration

**Contact submissions not loading**
- Verify database table exists
- Check Supabase connection
- Review API endpoint logs

### Debug Steps
1. Check browser console for errors
2. Verify admin email in config
3. Test authentication status
4. Check database connectivity
5. Review API response logs

## 📝 Future Enhancements

### Planned Features
- [ ] User management interface
- [ ] System settings panel
- [ ] Admin activity logs
- [ ] Bulk operations for submissions
- [ ] Email templates for responses
- [ ] Advanced filtering and search

### Security Improvements
- [ ] Role-based permissions
- [ ] Admin audit logs
- [ ] Two-factor authentication
- [ ] Session management
- [ ] IP whitelisting 