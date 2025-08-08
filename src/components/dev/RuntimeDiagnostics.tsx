import React from 'react';

export const RuntimeDiagnostics: React.FC = () => {
  const [sw, setSw] = React.useState<{ registered: boolean; count: number }>({
    registered: false,
    count: 0,
  });

  React.useEffect(() => {
    let mounted = true;
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        if (mounted) setSw({ registered: regs.length > 0, count: regs.length });
      });
    }
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 8,
        right: 8,
        background: 'hsl(0 0% 98% / 0.9)',
        color: 'hsl(220 14% 20%)',
        padding: '8px 12px',
        borderRadius: 8,
        fontSize: 12,
        boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
        zIndex: 9999,
      }}
    >
      <strong>Diagnostics</strong>
      <div>Env: {import.meta.env.MODE}</div>
      <div>React: {React.version}</div>
      <div>SW regs: {sw.count} ({sw.registered ? 'active' : 'none'})</div>
    </div>
  );
};
