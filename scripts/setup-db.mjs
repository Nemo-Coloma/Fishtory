/**
 * Fishtory Database Setup Script
 * 
 * This script:
 * 1. Inserts staff profiles for all admin/staff auth users
 * 2. Seeds demo data: reports, fishermen profiles, hub content, market prices
 * 
 * Run: node scripts/setup-db.mjs
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

// ── Known Auth Users ──────────────────────────────────────────────────────────
const ADMIN_UUID  = 'fc7a221f-6aef-4783-b762-ce72bcaa8b4f';
const STAFF1_UUID = '0cbbb5d4-7173-498f-b90d-76837780e891';
const STAFF2_UUID = '395db540-12df-4a21-9a5c-383d24a9faf2';

// Fishermen with known registrations
const FISHERMEN = [
    { user_id: '108c89ad-096e-4b12-bcc1-f60be6879e6f', fisherman_id: 'FM-2026-0001', first_name: 'Sabeth',  last_name: 'Legaspi',  location: 'Banicain'  },
    { user_id: 'c98fdf4e-969f-467a-9697-aa96d7dcc749', fisherman_id: 'FM-2026-0002', first_name: 'Nemo',    last_name: 'Coloma',   location: 'Banicain'  },
    { user_id: '1f6a6342-82ec-4a23-bf93-bcd72fbed7e5', fisherman_id: 'FM-2026-0003', first_name: 'Lixli',   last_name: 'Cayubit',  location: 'Barretto'  },
    { user_id: '7c7eda01-6d65-401a-8af3-dd010f6a85e5', fisherman_id: 'FM-2026-0004', first_name: 'Luis',    last_name: 'Cariño',   location: 'Barretto'  },
    { user_id: 'e5466766-d105-4383-b2c8-01e8f0cb6d65', fisherman_id: 'FM-2026-0005', first_name: 'Eliza',   last_name: 'Legaspi',  location: 'Barretto'  },
    { user_id: '2803a884-931d-48f8-a578-e2b37ffa5b09', fisherman_id: 'FM-2026-0006', first_name: 'CJ',      last_name: 'Alosim',   location: 'Barretto'  },
    { user_id: '42fd9732-ee7a-449f-b533-d776a4c0cb47', fisherman_id: 'FM-2026-8496', first_name: 'Juan',    last_name: 'Dela Cruz', location: 'East Tapinac' },
    { user_id: '1232cefe-561b-4e7b-976e-81b8e2e14d10', fisherman_id: 'FM-2026-8776', first_name: 'Juan',    last_name: 'Doms',     location: 'East Tapinac' },
];

// ── Step 1: Upsert Staff Profiles ─────────────────────────────────────────────
async function upsertStaffProfiles() {
    console.log('\n📋 Step 1: Upserting staff profiles...');
    const profiles = [
        { user_id: ADMIN_UUID,  staff_id: 'ADMIN-001', email: 'admin001@fishtory.com',  role: 'admin' },
        { user_id: STAFF1_UUID, staff_id: 'STAFF-01',  email: 'staff01@domain.com',     role: 'staff' },
        { user_id: STAFF2_UUID, staff_id: 'STAFF-02',  email: 'staff02@domain.com',     role: 'staff' },
    ];

    const { error } = await supabase.from('staff_profiles').upsert(profiles, { onConflict: 'user_id' });
    if (error) {
        console.error('  ❌ Error upserting staff profiles:', error.message);
    } else {
        console.log('  ✅ Staff profiles upserted successfully.');
    }
}

// ── Step 2: Ensure fisherman_registration rows exist ─────────────────────────
async function ensureFishermanRegistrations() {
    console.log('\n🎣 Step 2: Ensuring fisherman registrations exist...');
    const boats = ['BT-2027', 'BT-20262', 'Dante Esoy', 'Gyarados', 'BT-20263', "CJoy's Bangs", 'MV Dela Cruz', 'MV Doms'];
    const records = FISHERMEN.map((f, i) => ({
        user_id: f.user_id,
        fisherman_id: f.fisherman_id,
        first_name: f.first_name,
        last_name: f.last_name,
        boat_name: boats[i] || 'Unnamed Vessel',
        phone_number: `091${String(i).padStart(8, '0')}`,
        location: f.location,
        total_boats_operated: 1,
        total_crew: Math.floor(Math.random() * 4) + 2,
        lean_months: 'June, July, August',
        lean_daily_avg_catch: (Math.random() * 20 + 10).toFixed(2),
        peak_months: 'November, December, January',
        peak_daily_avg_catch: (Math.random() * 50 + 30).toFixed(2),
        created_by: STAFF1_UUID,
    }));

    for (const rec of records) {
        const { error } = await supabase.from('fisherman_registration').upsert(rec, { onConflict: 'fisherman_id' });
        if (error) {
            console.error(`  ❌ Error for ${rec.fisherman_id}:`, error.message);
        } else {
            console.log(`  ✅ ${rec.fisherman_id} — ${rec.first_name} ${rec.last_name}`);
        }
    }
}

// ── Step 3: Seed Socio-Economic Profiles ─────────────────────────────────────
async function seedSocioEconomicProfiles() {
    console.log('\n📊 Step 3: Seeding socio-economic profiles...');
    const educations = ['Elementary', 'High School', 'High School', 'Vocational', 'College', 'High School', 'Elementary', 'High School'];
    const gears = ['Hook and Line', 'Gillnet', 'Fishpot', 'Hook and Line', 'Gillnet', 'Speargun', 'Handline', 'Longline'];
    const welfares = ['Good', 'Struggling', 'Struggling', 'Good', 'Good', 'Struggling', 'Good', 'Struggling'];

    const profiles = FISHERMEN.map((f, i) => ({
        fisherman_id: f.fisherman_id,
        location: f.location,
        age: Math.floor(Math.random() * 30) + 25,
        gender: i % 5 === 4 ? 'Female' : 'Male',
        education_attainment: educations[i],
        dependency_ratio: parseFloat((Math.random() * 3 + 2).toFixed(2)),
        monthly_income: parseFloat((Math.random() * 8000 + 7000).toFixed(2)),
        poverty_status: i % 3 === 0,
        secondary_livelihood: i % 2 === 0 ? 'Farming' : 'Fish Vending',
        fishing_gear: gears[i],
        boat_ownership_status: i % 3 === 0 ? 'Rented' : 'Owned',
        boat_type_motorized: i % 4 !== 3,
        catch_composition: 'Galunggong, Tamban, Pusit',
        housing_condition: i % 3 === 0 ? 'Light Materials' : 'Semi-Concrete',
        water_access: true,
        electricity_access: true,
        toilet_access: i % 5 !== 4,
        welfare_status: welfares[i],
        fishing_needs: 'Gear Repair, Life Vest',
        philhealth: i % 2 === 0,
        sss: i % 3 === 0,
        pcic_insurance: false,
        subsidies_received: i % 2 === 0 ? 'Fishing Gear' : null,
        subsidy_requirements: 'BFAR Registration, Valid ID',
    }));

    for (const p of profiles) {
        const { error } = await supabase.from('fishermen_profiles').upsert(p, { onConflict: 'fisherman_id' });
        if (error) {
            console.error(`  ❌ Error for profile ${p.fisherman_id}:`, error.message);
        } else {
            console.log(`  ✅ Socio-economic profile for ${p.fisherman_id}`);
        }
    }
}

// ── Step 4: Seed Catch Reports ────────────────────────────────────────────────
async function seedReports() {
    console.log('\n📄 Step 4: Seeding catch reports...');

    // Check if we already have reports
    const { data: existingReports } = await supabase.from('reports').select('id').limit(10);
    if (existingReports && existingReports.length >= 10) {
        console.log('  ℹ️  Reports already seeded, skipping.');
        return;
    }

    const species = ['Galunggong', 'Tamban', 'Pusit', 'Bangus', 'Tilapia', 'Lapu-Lapu', 'Tanigue', 'Maya-Maya'];
    const methods = ['Fresh', 'Iced', 'Dried', 'Smoked'];
    const statuses = ['approved', 'approved', 'approved', 'pending', 'rejected'];
    const reports = [];

    for (const fisherman of FISHERMEN) {
        // 3-5 reports per fisherman
        const numReports = Math.floor(Math.random() * 3) + 3;
        for (let i = 0; i < numReports; i++) {
            const daysAgo = Math.floor(Math.random() * 90);
            const date = new Date();
            date.setDate(date.getDate() - daysAgo);

            reports.push({
                fisherman_id: fisherman.fisherman_id,
                user_id: fisherman.user_id,
                submitted_by: fisherman.user_id,
                boat_name: 'Vessel',
                species: species[Math.floor(Math.random() * species.length)],
                weight_kg: parseFloat((Math.random() * 80 + 20).toFixed(2)),
                processing_method: methods[Math.floor(Math.random() * methods.length)],
                location: fisherman.location,
                status: statuses[Math.floor(Math.random() * statuses.length)],
                created_at: date.toISOString(),
            });
        }
    }

    const { error } = await supabase.from('reports').insert(reports);
    if (error) {
        console.error('  ❌ Error seeding reports:', error.message);
    } else {
        console.log(`  ✅ Inserted ${reports.length} catch reports.`);
    }
}

// ── Step 5: Seed Hub Programs ─────────────────────────────────────────────────
async function seedHubPrograms() {
    console.log('\n🌐 Step 5: Seeding hub programs...');
    const { data: existing } = await supabase.from('hub_programs').select('id').limit(1);
    if (existing && existing.length > 0) {
        console.log('  ℹ️  Hub programs already exist, skipping.');
        return;
    }

    const programs = [
        {
            title: 'BFAR Livelihood Assistance Program',
            description: 'Provides fishing gear, fingerlings, and cash assistance to registered marginal fisherfolk in the municipality.',
            start_date: '2025-01-15',
            end_date: '2025-12-31',
            status: 'ongoing',
        },
        {
            title: 'Coastal Resource Management Project',
            description: 'Marine sanctuary establishment and monitoring to rehabilitate fish habitats and improve catch sustainability.',
            start_date: '2024-06-01',
            end_date: '2026-05-31',
            status: 'ongoing',
        },
        {
            title: 'Fishing Vessel Registration Drive 2024',
            description: 'Mandatory registration of all municipal fishing boats under the Philippine Fisheries Code.',
            start_date: '2024-01-01',
            end_date: '2024-12-31',
            status: 'completed',
        },
        {
            title: 'Post-Harvest Facilities Improvement',
            description: 'Construction of fish landing areas, ice plants, and cold storage facilities to reduce post-harvest losses.',
            start_date: '2025-03-01',
            end_date: '2026-02-28',
            status: 'ongoing',
        },
    ];

    const { error } = await supabase.from('hub_programs').insert(programs);
    if (error) console.error('  ❌ Error seeding programs:', error.message);
    else console.log(`  ✅ Inserted ${programs.length} hub programs.`);
}

// ── Step 6: Seed Hub Announcements ────────────────────────────────────────────
async function seedHubAnnouncements() {
    console.log('\n📢 Step 6: Seeding hub announcements...');
    const { data: existing } = await supabase.from('hub_announcements').select('id').limit(1);
    if (existing && existing.length > 0) {
        console.log('  ℹ️  Hub announcements already exist, skipping.');
        return;
    }

    const announcements = [
        {
            title: 'Free Boat Safety Training — June 2026',
            description: 'MARINA and BFAR will conduct a free boat safety and navigation seminar for all registered fisherfolk. Attendance is strongly encouraged.',
            date_posted: '2026-05-10',
            event_date: '2026-06-05',
            category: 'training',
        },
        {
            title: 'Suspension of Fishing in Banicain Bay (Breeding Season)',
            description: 'Fishing activities within the 500m buffer zone of Banicain Bay are suspended from June 1–30 in compliance with Executive Order No. 12.',
            date_posted: '2026-05-15',
            event_date: '2026-06-01',
            category: 'regulation',
        },
        {
            title: 'Distribution of Fishing Nets — Beneficiaries List Released',
            description: 'Qualified beneficiaries for the BFAR fishing net distribution may claim their equipment at the Municipal Agriculture Office starting May 28, 2026.',
            date_posted: '2026-05-18',
            event_date: '2026-05-28',
            category: 'assistance',
        },
        {
            title: 'PhilHealth Registration for Fisherfolk',
            description: 'DSWD and PhilHealth will conduct a one-day registration drive for unregistered fisherfolk and their dependents at the Barangay Hall.',
            date_posted: '2026-05-20',
            event_date: '2026-05-30',
            category: 'general',
        },
    ];

    const { error } = await supabase.from('hub_announcements').insert(announcements);
    if (error) console.error('  ❌ Error seeding announcements:', error.message);
    else console.log(`  ✅ Inserted ${announcements.length} hub announcements.`);
}

// ── Step 7: Seed Market Prices ────────────────────────────────────────────────
async function seedMarketPrices() {
    console.log('\n💰 Step 7: Seeding market prices...');
    const { data: existing } = await supabase.from('hub_market_prices').select('id').limit(1);
    if (existing && existing.length > 0) {
        console.log('  ℹ️  Market prices already exist, skipping.');
        return;
    }

    const prices = [
        { species: 'Galunggong (Round Scad)',  price: 180.00, trend: 'up',     change_text: '+₱10' },
        { species: 'Tamban (Sardine)',          price:  85.00, trend: 'stable', change_text: '₱0'   },
        { species: 'Pusit (Squid)',             price: 320.00, trend: 'down',   change_text: '-₱20' },
        { species: 'Bangus (Milkfish)',         price: 220.00, trend: 'up',     change_text: '+₱15' },
        { species: 'Tilapia',                  price: 130.00, trend: 'stable', change_text: '₱0'   },
        { species: 'Lapu-Lapu (Grouper)',       price: 580.00, trend: 'up',     change_text: '+₱30' },
        { species: 'Tanigue (Spanish Mackerel)',price: 380.00, trend: 'down',   change_text: '-₱10' },
        { species: 'Maya-Maya (Red Snapper)',   price: 450.00, trend: 'stable', change_text: '₱0'   },
        { species: 'Alumahan (Indian Mackerel)',price: 200.00, trend: 'up',     change_text: '+₱5'  },
        { species: 'Dalagang Bukid (Fusilier)', price: 250.00, trend: 'stable', change_text: '₱0'   },
    ];

    const { error } = await supabase.from('hub_market_prices').insert(prices);
    if (error) console.error('  ❌ Error seeding market prices:', error.message);
    else console.log(`  ✅ Inserted ${prices.length} market price entries.`);
}

// ── Step 8: Update Hub Extra Stats ────────────────────────────────────────────
async function updateHubExtraStats() {
    console.log('\n📈 Step 8: Updating hub extra stats...');
    const { error } = await supabase
        .from('hub_extra_stats')
        .update({ total_assistance: 142, total_trainings: 18, last_updated: new Date().toISOString() })
        .neq('id', '00000000-0000-0000-0000-000000000000'); // update all rows

    if (error) console.error('  ❌ Error updating extra stats:', error.message);
    else console.log('  ✅ Hub extra stats updated.');
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
    console.log('🚀 Fishtory Database Setup Script');
    console.log('====================================');
    console.log('Connecting to:', supabaseUrl);

    await upsertStaffProfiles();
    await ensureFishermanRegistrations();
    await seedSocioEconomicProfiles();
    await seedReports();
    await seedHubPrograms();
    await seedHubAnnouncements();
    await seedMarketPrices();
    await updateHubExtraStats();

    console.log('\n====================================');
    console.log('✅ Setup complete! Your database is ready.');
    console.log('\nYou can now log in with:');
    console.log('  Admin:  admin001@fishtory.com');
    console.log('  Staff1: staff01@domain.com');
    console.log('  Staff2: staff02@domain.com');
}

main().catch(console.error);
