'use client';

const EtherealMistComponent = () => {
  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '400px',
        height: '300px',
        background: 'radial-gradient(circle at 20% 30%, rgba(255, 69, 0, 0.6) 0%, rgba(255, 165, 0, 0.4) 30%, rgba(138, 43, 226, 0.3) 60%, rgba(0, 191, 255, 0.2) 80%, transparent 100%)',
        opacity: 0.7,
        filter: 'blur(15px)',
        borderRadius: '80px',
        animation: 'drift 20s ease-in-out infinite alternate',
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(45deg, transparent 40%, rgba(255, 255, 255, 0.2) 50%, transparent 60%)',
          backgroundSize: '200% 200%',
          animation: 'shimmer 10s linear infinite',
          mixBlendMode: 'overlay',
          opacity: 0.3
        }}
      />
    </div>
  );
};

const styles = `
@keyframes drift {
  0% {
    background-position: 0% 0%;
  }
  100% {
    background-position: 100% 100%;
  }
}

@keyframes shimmer {
  0% {
    background-position: -200% -200%;
  }
  100% {
    background-position: 200% 200%;
  }
}
`;

const EtherealMistWithStyles = () => (
  <>
    <style>{styles}</style>
    <EtherealMistComponent />
  </>
);

export default function MistPage() {
  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: 'transparent' }}>
      <EtherealMistWithStyles />
    </div>
  );
}