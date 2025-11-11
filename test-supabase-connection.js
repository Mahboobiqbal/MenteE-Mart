import supabase from './src/utils/supabase.js';

// Test the Supabase connection
async function testConnection() {
  try {
    // Test basic select query
    const { data, error } = await supabase
      .from('customers')
      .select('count')
      .limit(1);
      
    if (error) {
      console.error('Connection error:', error);
    } else {
      console.log('Connection successful!');
      console.log('Data:', data);
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

testConnection();