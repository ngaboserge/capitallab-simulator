// Run this to verify your Supabase connection
// Usage: npx tsx scripts/verify-supabase.ts

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  console.log('\nPlease add:')
  console.log('NEXT_PUBLIC_SUPABASE_URL=your-url')
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function verify() {
  console.log('🔍 Verifying Supabase connection...\n')

  // Test 1: Connection
  console.log('1. Testing connection...')
  const { data, error } = await supabase.from('profiles').select('count')
  if (error) {
    console.log('❌ Connection failed:', error.message)
    return false
  }
  console.log('✅ Connected successfully\n')

  // Test 2: Tables exist
  console.log('2. Checking tables...')
  const tables = ['profiles', 'companies', 'ipo_applications', 'application_sections', 'documents']
  for (const table of tables) {
    const { error } = await supabase.from(table).select('count').limit(1)
    if (error) {
      console.log(`❌ Table '${table}' not found`)
      return false
    }
    console.log(`✅ Table '${table}' exists`)
  }
  console.log()

  // Test 3: Storage bucket
  console.log('3. Checking storage...')
  const { data: buckets } = await supabase.storage.listBuckets()
  const hasDocs = buckets?.some(b => b.name === 'documents')
  if (!hasDocs) {
    console.log('❌ Storage bucket "documents" not found')
    console.log('   Create it in: Supabase Dashboard > Storage > New bucket')
    return false
  }
  console.log('✅ Storage bucket "documents" exists\n')

  console.log('🎉 All checks passed! Your Supabase is ready.\n')
  return true
}

verify().then(success => {
  process.exit(success ? 0 : 1)
})
