import { useState } from 'react';

export default function TestDB() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testDatabase = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/test-db1');
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        message: 'Failed to call API',
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Database Connection Test</h1>
      
      <button 
        onClick={testDatabase} 
        disabled={loading}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: loading ? '#ccc' : '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Testing...' : 'Test Database Connection'}
      </button>

      {result && (
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          border: `2px solid ${result.success ? 'green' : 'red'}`,
          borderRadius: '5px',
          backgroundColor: result.success ? '#f0fff0' : '#fff0f0'
        }}>
          <h2 style={{ color: result.success ? 'green' : 'red' }}>
            {result.success ? '✅ SUCCESS' : '❌ FAILED'}
          </h2>
          <p><strong>Message:</strong> {result.message}</p>
          
          {result.error && (
            <div>
              <p><strong>Error:</strong> {result.error}</p>
              {result.stack && (
                <pre style={{ 
                  background: '#f5f5f5', 
                  padding: '10px', 
                  overflow: 'auto',
                  fontSize: '12px'
                }}>
                  {result.stack}
                </pre>
              )}
            </div>
          )}

          {result.success && (
            <div>
              <p><strong>Database Version:</strong> {result.dbVersion}</p>
              <p><strong>Server Time:</strong> {result.serverTime}</p>
              <p><strong>Current Database:</strong> {result.currentDatabase}</p>
              
              {result.connection && (
                <div>
                  <p><strong>Connection Test:</strong> {result.connection.message}</p>
                </div>
              )}
            </div>
          )}

          {result.environment && (
            <div>
              <h3>Environment Check:</h3>
              <ul>
                <li>DB Host configured: {result.environment.hasHost ? '✅' : '❌'}</li>
                <li>DB User configured: {result.environment.hasUser ? '✅' : '❌'}</li>
                <li>DB Name configured: {result.environment.hasDatabase ? '✅' : '❌'}</li>
                <li>Node Environment: {result.environment.nodeEnv}</li>
              </ul>
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: '30px', padding: '15px', background: '#f0f8ff', borderRadius: '5px' }}>
        <h3>Testing Instructions:</h3>
        <ol>
          <li>Fill in your Hostinger database credentials in <code>.env.local</code></li>
          <li>Click the "Test Database Connection" button</li>
          <li>Check the results below</li>
        </ol>
        
        <h3>Common MySQL/MariaDB Functions:</h3>
        <ul>
          <li><code>NOW()</code> - Current date and time</li>
          <li><code>CURDATE()</code> - Current date</li>
          <li><code>CURTIME()</code> - Current time</li>
          <li><code>VERSION()</code> - Database version</li>
          <li><code>DATABASE()</code> - Current database name</li>
          <li><code>USER()</code> - Current user</li>
        </ul>
      </div>
    </div>
  );
}