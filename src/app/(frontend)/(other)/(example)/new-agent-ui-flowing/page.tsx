'use client';

const EtherealMistComponent = () => {
  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '80vw',
        height: '60vh',
        opacity: 0.7,
        filter: 'blur(50px)',
        overflow: 'hidden',
      }}
    >
      {/* First gradient layer */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background:
            'linear-gradient(135deg, rgba(255, 69, 0, 0.6), rgba(255, 165, 0, 0.4), rgba(138, 43, 226, 0.3), rgba(0, 191, 255, 0.5), rgba(255, 69, 0, 0.6))',
          backgroundSize: '600% 600%',
          animation: 'gradient 15s ease infinite',
        }}
      />
      {/* Second gradient layer for more flow */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background:
            'linear-gradient(-45deg, rgba(0, 191, 255, 0.5), rgba(138, 43, 226, 0.3), rgba(255, 165, 0, 0.4), rgba(255, 69, 0, 0.6), rgba(0, 191, 255, 0.5))',
          backgroundSize: '600% 600%',
          animation: 'gradientReverse 20s ease infinite',
          opacity: 0.6,
          mixBlendMode: 'screen',
        }}
      />
      {/* Shimmering slivers */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background:
            'linear-gradient(45deg, transparent 40%, rgba(255, 255, 255, 0.2) 50%, transparent 60%)',
          backgroundSize: '200% 200%',
          animation: 'shimmer 10s linear infinite',
          mixBlendMode: 'overlay',
          opacity: 0.3,
        }}
      />
    </div>
  );
};

const styles = `
@keyframes gradient {
  0% {
    background-position: 0% 0%;
  }
  50% {
    background-position: 100% 100%;
  }
  100% {
    background-position: 0% 0%;
  }
}

@keyframes gradientReverse {
  0% {
    background-position: 100% 100%;
  }
  50% {
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
    <div
      style={{ width: '100vw', height: '100vh', backgroundColor: '#f0f0f0' }}
    >
      <EtherealMistWithStyles />
    </div>
  );
}
