import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('🔍 Testing database connection...\n');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL not found in environment variables');
  process.exit(1);
}

console.log('📋 Connection details:');
console.log(`   URL: ${connectionString.replace(/:([^:@]+)@/, ':****@')}`); // Hide password in logs

try {
  // Create connection
  const sql = postgres(connectionString, {
    max: 1, // Use only 1 connection for testing
    connect_timeout: 10, // 10 second timeout
  });

  // Create drizzle instance
  const db = drizzle(sql);

  console.log('\n🔌 Attempting to connect...');

  // Test basic connection with a simple query
  const result = await sql`SELECT version(), current_database(), current_user`;
  
  console.log('✅ Database connection successful!');
  console.log(`   PostgreSQL Version: ${result[0].version.split(' ')[0]} ${result[0].version.split(' ')[1]}`);
  console.log(`   Database: ${result[0].current_database}`);
  console.log(`   User: ${result[0].current_user}`);

  // Test if our tables exist
  console.log('\n📊 Checking for application tables...');
  
  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('screenshots', 'notes', 'users')
    ORDER BY table_name
  `;

  if (tables.length > 0) {
    console.log('✅ Application tables found:');
    tables.forEach(table => console.log(`   - ${table.table_name}`));
  } else {
    console.log('⚠️  No application tables found. You may need to run migrations.');
  }

  // Test a simple count query on screenshots table if it exists
  if (tables.some(t => t.table_name === 'screenshots')) {
    try {
      const count = await sql`SELECT COUNT(*) as count FROM screenshots`;
      console.log(`   Screenshots in database: ${count[0].count}`);
    } catch (err) {
      console.log(`   Could not count screenshots: ${err.message}`);
    }
  }

  console.log('\n🎉 Database connection test completed successfully!');
  
  // Close connection
  await sql.end();
  process.exit(0);

} catch (error) {
  console.error('\n❌ Database connection failed:');
  console.error(`   Error: ${error.message}`);
  
  if (error.message.includes('password authentication failed')) {
    console.error('   🔑 Issue: Password authentication failed');
    console.error('   💡 Solution: Check your database password in .env file');
  } else if (error.message.includes('connection refused')) {
    console.error('   🌐 Issue: Connection refused');
    console.error('   💡 Solution: Check your database URL and network connection');
  } else if (error.message.includes('timeout')) {
    console.error('   ⏰ Issue: Connection timeout');
    console.error('   💡 Solution: Check your network connection and database availability');
  }
  
  process.exit(1);
}
