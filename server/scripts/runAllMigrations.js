import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const runMigration = async (scriptName) => {
  try {
    console.log(`\n🔄 Running ${scriptName}...`);
    const { stdout, stderr } = await execAsync(`node scripts/${scriptName}.js`);
    
    if (stdout) {
      console.log(`✅ ${scriptName} completed successfully:`);
      console.log(stdout);
    }
    
    if (stderr) {
      console.log(`⚠️  ${scriptName} warnings:`);
      console.log(stderr);
    }
  } catch (error) {
    console.error(`❌ Error running ${scriptName}:`, error.message);
    throw error;
  }
};

const runAllMigrations = async () => {
  try {
    console.log('🚀 Starting all migrations and seed scripts...\n');
    
    // Run migrations in order
    await runMigration('migrateDepartments');
    await runMigration('migrateEmploymentTypes');
    await runMigration('migrateTimeEntryJobCodes');
    await runMigration('seedJobCodes');
    await runMigration('seedCompanyDefaults');
    
    console.log('\n🎉 All migrations and seed scripts completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n💥 Failed to run all migrations:', error.message);
    process.exit(1);
  }
};

runAllMigrations(); 