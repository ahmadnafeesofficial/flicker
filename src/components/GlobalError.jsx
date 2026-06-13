
export default function GlobalError({ onRetry = () => window.location.reload() }) {
  return (
    <div style={{ paddingTop: '100px', textAlign: 'center', minHeight: '50vh', color: 'var(--text-muted)' }}>
      <i className="bi bi-wifi-off" style={{ fontSize: '3.5rem', display: 'block', marginBottom: '16px', color: 'var(--red-primary)' }}></i>
      <p style={{ color: 'var(--text-primary)' }}>Failed to connect to Flicker movie catalog.</p>
      <button className="btn-retry" onClick={onRetry} style={{ marginTop: '16px' }}>Retry Connection</button>
    </div>
  );
}
