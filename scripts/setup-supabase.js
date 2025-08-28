import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupSupabase() {
  console.log('🚀 Setting up Supabase for TradeSnapManager...\n');

  try {
    // 1. Create storage bucket for screenshots
    console.log('📁 Creating storage bucket for screenshots...');
    const { data: bucket, error: bucketError } = await supabase.storage.createBucket('screenshots', {
      public: false,
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
      fileSizeLimit: 10485760, // 10MB
    });

    if (bucketError && !bucketError.message.includes('already exists')) {
      console.error('❌ Error creating bucket:', bucketError.message);
    } else {
      console.log('✅ Screenshots bucket ready');
    }

    // 2. Set up storage policies
    console.log('🔐 Setting up storage policies...');
    
    // Policy to allow authenticated users to upload screenshots
    const uploadPolicy = `
      CREATE POLICY "Allow authenticated uploads" ON storage.objects
      FOR INSERT WITH CHECK (bucket_id = 'screenshots' AND auth.role() = 'authenticated');
    `;

    // Policy to allow authenticated users to view screenshots
    const viewPolicy = `
      CREATE POLICY "Allow authenticated views" ON storage.objects
      FOR SELECT USING (bucket_id = 'screenshots' AND auth.role() = 'authenticated');
    `;

    // Note: These policies would typically be set up in the Supabase dashboard
    console.log('ℹ️  Storage policies should be configured in Supabase Dashboard');

    // 3. Test database connection
    console.log('🗄️  Testing database connection...');
    const { data: tables, error: dbError } = await supabase
      .from('screenshots')
      .select('count(*)')
      .limit(1);

    if (dbError) {
      console.error('❌ Database connection error:', dbError.message);
    } else {
      console.log('✅ Database connection successful');
    }

    // 4. Test file upload
    console.log('📤 Testing file upload...');
    const testFile = new Blob(['test'], { type: 'text/plain' });
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('screenshots')
      .upload('test/test.txt', testFile);

    if (uploadError) {
      console.error('❌ Upload test failed:', uploadError.message);
    } else {
      console.log('✅ File upload test successful');
      
      // Clean up test file
      await supabase.storage.from('screenshots').remove(['test/test.txt']);
    }

    console.log('\n🎉 Supabase setup complete!');
    console.log('\n📋 Next steps:');
    console.log('1. Go to Supabase Dashboard → Storage → screenshots');
    console.log('2. Set up RLS policies if needed');
    console.log('3. Configure authentication if required');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

setupSupabase();
