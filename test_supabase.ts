import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vqrxnupbnydobvmgqciu.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxcnhudXBibnlkb2J2bWdxY2l1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzMjM4NTgsImV4cCI6MjA5Mzg5OTg1OH0.V3AGZpHmfcF4VYGVnaD67RlEnf93g6LEAsZhlTJgDMo'

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  console.log("Testing connection...");
  // test querying a table (doesn't matter if it exists, error will show it connects)
  const { data, error } = await supabase.from('users').select('*').limit(1)
  console.log("Users Query (Connection test):", { data, error })

  console.log("Testing authentication...");
  // test auth
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'agent@maruthi.com',
    password: 'Agent@123'
  })
  console.log("Auth login attempt error:", authError?.message || "Success!")
}

test()
