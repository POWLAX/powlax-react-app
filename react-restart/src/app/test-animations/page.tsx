export default function TestAnimations() {
  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1>Animation Test Page</h1>
      <p>If you can see this, the server is working!</p>
      <div style={{ marginTop: '40px' }}>
        <a href="/demo-launcher" style={{ 
          padding: '15px 30px', 
          background: '#4CAF50', 
          color: 'white', 
          textDecoration: 'none',
          borderRadius: '5px',
          marginRight: '20px'
        }}>
          Go to Demo Launcher
        </a>
        <a href="/animations-demo" style={{ 
          padding: '15px 30px', 
          background: '#2196F3', 
          color: 'white', 
          textDecoration: 'none',
          borderRadius: '5px'
        }}>
          Go to Animations Demo
        </a>
      </div>
    </div>
  )
}