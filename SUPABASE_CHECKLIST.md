# Supabase Setup Checklist

## ✅ Pre-Setup
- [ ] Supabase account created
- [ ] Project created in Supabase dashboard
- [ ] Database password saved securely

## ✅ Environment Setup
- [ ] `.env.local` file created in project root
- [ ] `NEXT_PUBLIC_SUPABASE_URL` added to `.env.local`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` added to `.env.local`
- [ ] Environment variables are correct (not placeholder values)

## ✅ Database Schema
- [ ] Opened SQL Editor in Supabase dashboard
- [ ] Copied content from `database_schema.sql`
- [ ] Pasted and executed schema in SQL Editor
- [ ] All tables created successfully
- [ ] Sample data inserted

## ✅ Security Setup
- [ ] Row Level Security (RLS) enabled on all tables
- [ ] RLS policies created for all tables
- [ ] Users can only access their own data

## ✅ Testing
- [ ] Run `npm run test:supabase` to test connection
- [ ] All tables accessible
- [ ] No connection errors
- [ ] Application starts without errors

## ✅ Verification
- [ ] Open `http://localhost:3000` in browser
- [ ] Check browser console for errors
- [ ] Test creating a sample record
- [ ] Verify data appears in Supabase dashboard

## 🚨 Common Issues to Check
- [ ] API key is the anon key (not service role key)
- [ ] Project URL is correct
- [ ] Database is active in Supabase dashboard
- [ ] No typos in environment variables
- [ ] `.env.local` file is in project root

## 📞 If Issues Persist
1. Check Supabase dashboard logs
2. Verify environment variables
3. Test connection with the test script
4. Check Supabase documentation
5. Review error messages in browser console 