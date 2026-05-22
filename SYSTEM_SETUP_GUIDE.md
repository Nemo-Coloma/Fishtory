# Fishtory System Setup & Fix Guide

## 🚀 Quick Start - Fix All Issues

### Step 1: Run Database Migration
1. Open your Supabase Dashboard
2. Go to **SQL Editor**
3. Copy and paste the entire content of `FINAL_SYSTEM_FIX.sql`
4. Click **Run** to execute

This will:
- ✅ Create all missing lookup tables (fish species, landing centers, etc.)
- ✅ Seed initial data with Philippine fish species and locations
- ✅ Set up Row Level Security (RLS) policies
- ✅ Create default staff account
- ✅ Add missing columns to existing tables

### Step 2: Staff Login Credentials
After running the SQL script, you can login to the staff portal with:
- **Email:** `staff01@app.com`
- **Password:** `Staff@123`

**Staff Portal URL:** `http://localhost:3000/staff/login`

### Step 3: Test the Application

#### Test Staff Dashboard:
1. Navigate to `http://localhost:3000/staff/login`
2. Login with staff credentials above
3. You should see the Staff Dashboard with 3 tabs:
   - **Option 1: Register Fisherman** - Create new fisherman accounts
   - **Option 2: Submit Daily Catch** - Log catch reports for fishermen
   - **Option 3: My Submitted Reports** - View and edit your reports

#### Test Fisherman Dashboard:
1. Register a new fisherman account at `http://localhost:3000/login`
2. Complete profile at `/complete-profile`
3. Access dashboard at `/dashboard`
4. Submit catch reports with data from dropdowns

#### Test Data Display:
All forms should now show data from the database:
- **Fish Species:** 13 types (Bangus, Tilapia, Tuna, etc.)
- **Landing Centers:** 7 locations (Banicain, Barretto, Kalaklan, etc.)
- **Processing Methods:** 6 types (Fresh, Smoked, Dried, etc.)

## 📋 Database Schema Reference

### Lookup Tables Created:
1. **fish_species** - Fish types with English/Tagalog names
2. **fishing_gears** - Fishing equipment types
3. **fishing_vessels** - Boat/vessel types
4. **landing_centers** - Fishing ports and locations
5. **processing_methods** - Fish processing methods

### Existing Tables Updated:
- **fisherman_registration** - Added seasonality columns
- **reports** - Added processing_method, fishing_gear, vessel_type columns
- **staff_profiles** - Created if not exists

## 🔧 Troubleshooting

### Issue: Staff login not working
**Solution:** Make sure you ran the SQL script. The staff account is created by the script.

### Issue: Dropdowns are empty
**Solution:** 
1. Check browser console for errors
2. Verify Supabase connection in `.env.local`
3. Confirm SQL script ran successfully
4. Check that seed data was inserted

### Issue: "Table does not exist" errors
**Solution:** Run the SQL script again. It uses `IF NOT EXISTS` so it's safe to re-run.

### Issue: Port 3000 already in use
**Solution:** The app will automatically use port 3001. Access it at `http://localhost:3001`

## 📱 Testing Checklist

### Staff Portal:
- [ ] Can access `/staff/login`
- [ ] Can login with staff credentials
- [ ] Can see Staff Dashboard
- [ ] Can register a new fisherman
- [ ] Can submit a catch report
- [ ] Can view submitted reports
- [ ] Can edit pending reports

### Fisherman Portal:
- [ ] Can register new account
- [ ] Can complete profile
- [ ] Can access dashboard
- [ ] Can see fish species dropdown with data
- [ ] Can see locations dropdown with data
- [ ] Can see processing methods dropdown with data
- [ ] Can submit catch report
- [ ] Can view report history

### Data Verification:
- [ ] Fish species dropdown shows 13 items
- [ ] Landing centers dropdown shows 7 locations
- [ ] Processing methods dropdown shows 6 options
- [ ] All dropdowns show both English and Tagalog names

## 🌐 URLs Reference

| Page | URL |
|------|-----|
| Home | `http://localhost:3000` |
| Fisherman Login | `http://localhost:3000/login` |
| Staff Login | `http://localhost:3000/staff/login` |
| Fisherman Dashboard | `http://localhost:3000/dashboard` |
| Staff Dashboard | `http://localhost:3000/staff/dashboard` |
| Complete Profile | `http://localhost:3000/complete-profile` |

## 🔐 Default Credentials

### Staff Account:
- Email: `staff01@app.com`
- Password: `Staff@123`
- Role: Admin

### Test Fisherman Account:
Create via staff portal or register at `/login`

## 📊 Sample Data Included

### Fish Species (13):
- Coastal: Bangus, Tilapia, Lapu-lapu, Malipong Bato
- Small: Dilis, Sardinas, Tamban, Tunog
- Deep Sea: Tuna, Taba, Bariles, Isda ng Bakal
- Specialty: Pampanito

### Landing Centers (7):
- Banicain Port, Barretto Port, Kalaklan Port
- Olongapo City Fish Port, Subic Port
- Mariveles Port, Bataan Fishing Port

### Processing Methods (6):
- Fresh (Sariwa), Smoked (Tinapa), Dried (Tuyo)
- Salted (Daing), Canned (Sardinas), Frozen (Naka-freeze)

## 🛠️ Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📞 Support

If you encounter issues:
1. Check browser console (F12) for errors
2. Verify `.env.local` has correct Supabase credentials
3. Confirm SQL script ran successfully in Supabase
4. Check network tab for failed API calls
5. Review Supabase logs in dashboard

## ✅ Verification Steps

After running the SQL script, verify:

1. **Check Tables:**
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

2. **Check Seed Data:**
```sql
SELECT COUNT(*) FROM fish_species;  -- Should return 13
SELECT COUNT(*) FROM landing_centers;  -- Should return 7
SELECT COUNT(*) FROM processing_methods;  -- Should return 6
```

3. **Check Staff User:**
```sql
SELECT email, user_metadata->>'role' as role 
FROM auth.users 
WHERE email = 'staff01@app.com';
```

## 🎯 Success Criteria

Your system is working correctly when:
- ✅ Staff can login and access dashboard
- ✅ All dropdowns show database data (not empty)
- ✅ Fishermen can register and complete profiles
- ✅ Catch reports can be submitted with all fields
- ✅ Data persists in database
- ✅ Reports display correctly in tables
- ✅ All forms are responsive on mobile

---

**Last Updated:** 2026-05-22
**Version:** 1.0.0