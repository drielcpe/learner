import { testConnection, query } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('🔄 Starting database test...');
    
    // Test 1: Just test basic connection first
    console.log('🔌 Testing basic connection...');
    const connectionTest = await testConnection();
    
    if (!connectionTest.success) {
      console.log('❌ Basic connection failed');
      return res.status(500).json(connectionTest);
    }

    console.log('✅ Basic connection successful');
    
    // Test 2: Use the simplest possible query
    console.log('📝 Testing simple query...');
    const simpleQuery = await query('SELECT 1 + 1 as result');
    
    console.log('✅ Simple query successful');

    res.status(200).json({
      success: true,
      message: 'Basic database connection successful!',
      simpleMath: simpleQuery[0].result, // Should be 2
      environment: {
        hasHost: !!process.env.DB_HOST,
        hasUser: !!process.env.DB_USER,
        hasDatabase: !!process.env.DB_NAME,
        nodeEnv: process.env.NODE_ENV,
      }
    });

  } catch (error) {
    console.error('💥 Database test error:', error);
    res.status(500).json({
      success: false,
      message: 'Database test failed',
      error: error.message,
      sqlError: error.sqlMessage || 'No SQL error details'
    });
  }
}