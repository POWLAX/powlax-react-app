export default function TestAnimations() {
  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1>Animation Test Page</h1>
      <p>If you can see this, the server is working!</p>
      <div style={{ marginTop: '40px' }}>
        <a href="/dashboard" style={{ 
          padding: '15px 30px', 
          background: '#4CAF50', 
          color: 'white', 
          textDecoration: 'none',
          borderRadius: '5px'
        }}>
          Go to Dashboard
        </a>
      </div>
    </div>
  )
}