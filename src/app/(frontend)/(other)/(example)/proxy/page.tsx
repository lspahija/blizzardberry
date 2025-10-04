export default function ProxyPage() {
  return (
    <iframe
      src="http://localhost:8080"
      style={{
        width: '100vw',
        height: '100vh',
        border: 'none',
        position: 'absolute',
        top: 0,
        left: 0,
      }}
    />
  );
}
