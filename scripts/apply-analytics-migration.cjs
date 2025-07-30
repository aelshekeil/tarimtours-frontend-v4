const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const SUPABASE_URL = 'https://vrvrhzseqnjpriqesgoj.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.argv[2];

if (!SUPABASE_SERVICE_KEY) {
  console.error('Please provide the Supabase service key as an argument or set SUPABASE_SERVICE_KEY environment variable');
  console.error('Usage: node scripts/apply-analytics-migration.js <service-key>');
  process.exit(1);
}

// Create Supabase client with service key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyMigration() {
  try {
    console.log('Reading migration file...');
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250729210000_add_analytics_tables.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('Applying analytics migration to Supabase...');
    
    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      
      try {
        console.log(`Executing statement ${i + 1}/${statements.length}...`);
        
        // Execute the SQL statement
        const { error } = await supabase.rpc('exec_sql', {
          sql: statement
        });

        if (error) {
          // Try direct execution if RPC doesn't exist
          const { error: directError } = await supabase.from('_sql').select(statement);
          
          if (directError) {
            console.error(`Error in statement ${i + 1}:`, directError.message);
            errorCount++;
          } else {
            successCount++;
          }
        } else {
          successCount++;
        }
      } catch (err) {
        console.error(`Error in statement ${i + 1}:`, err.message);
        errorCount++;
      }
    }

    console.log('\nMigration Summary:');
    console.log(`✅ Successful statements: ${successCount}`);
    console.log(`❌ Failed statements: ${errorCount}`);
    
    if (errorCount === 0) {
      console.log('\n🎉 Analytics migration applied successfully!');
      console.log('\nNext steps:');
      console.log('1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/vrvrhzseqnjpriqesgoj');
      console.log('2. Navigate to Database → Replication');
      console.log('3. Enable replication for these tables:');
      console.log('   - user_analytics');
      console.log('   - system_logs');
      console.log('\nYour analytics dashboard should now be fully functional!');
    } else {
      console.log('\n⚠️  Some statements failed. You may need to apply them manually in the Supabase SQL Editor.');
    }

  } catch (error) {
    console.error('Failed to apply migration:', error);
    process.exit(1);
  }
}

// Alternative approach using direct SQL execution
async function applyMigrationDirect() {
  try {
    console.log('Reading migration file...');
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250729210000_add_analytics_tables.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('\n📋 Migration SQL has been prepared.');
    console.log('\nSince direct SQL execution requires service role key, please:');
    console.log('\n1. Go to Supabase SQL Editor: https://supabase.com/dashboard/project/vrvrhzseqnjpriqesgoj/sql/new');
    console.log('2. Copy and paste the following SQL:');
    console.log('\n' + '='.repeat(80));
    console.log(migrationSQL);
    console.log('='.repeat(80));
    console.log('\n3. Click "Run" to execute the migration');
    console.log('\n4. After successful execution, enable replication for:');
    console.log('   - user_analytics table');
    console.log('   - system_logs table');
    console.log('   (Database → Replication → Select tables)');

    // Save to file for easy access
    const outputPath = path.join(__dirname, '..', 'analytics-migration-to-apply.sql');
    fs.writeFileSync(outputPath, migrationSQL);
    console.log(`\n💾 Migration SQL saved to: ${outputPath}`);

  } catch (error) {
    console.error('Failed to prepare migration:', error);
    process.exit(1);
  }
}

// Check if we have a service key, otherwise provide manual instructions
if (SUPABASE_SERVICE_KEY === 'manual') {
  applyMigrationDirect();
} else {
  console.log('Note: Direct SQL execution via API requires service role key.');
  console.log('If you don\'t have it, run: node scripts/apply-analytics-migration.js manual');
  applyMigrationDirect();
}