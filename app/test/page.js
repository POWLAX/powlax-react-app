export default function TestPage() {
  return (
    <div style={{ padding: '50px', fontSize: '24px', background: 'yellow' }}>
      <h1>TEST PAGE - If you see this, routing works!</h1>
      <p>Time: {new Date().toLocaleTimeString()}</p>
    </div>
  )
}
