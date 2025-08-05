import React from 'react';

// Completely standalone App without any imports that could cause issues
const App: React.FC = () => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        background: 'white',
        padding: '3rem',
        borderRadius: '1rem',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        maxWidth: '500px',
        margin: '2rem'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          color: '#1f2937',
          marginBottom: '1rem'
        }}>
          RepairHub
        </h1>
        <p style={{
          fontSize: '1.125rem',
          color: '#6b7280',
          marginBottom: '2rem',
          lineHeight: '1.6'
        }}>
          Le Doctolib de la réparation smartphone & mobile
        </p>
        <div style={{
          display: 'grid',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            padding: '1rem',
            background: '#f9fafb',
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ color: '#1f2937', margin: 0, marginBottom: '0.5rem' }}>
              Pour les clients
            </h3>
            <p style={{ color: '#6b7280', margin: 0, fontSize: '0.875rem' }}>
              Trouvez le bon réparateur près de chez vous
            </p>
          </div>
          <div style={{
            padding: '1rem',
            background: '#f9fafb',
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ color: '#1f2937', margin: 0, marginBottom: '0.5rem' }}>
              Pour les réparateurs
            </h3>
            <p style={{ color: '#6b7280', margin: 0, fontSize: '0.875rem' }}>
              Gérez votre activité et trouvez de nouveaux clients
            </p>
          </div>
        </div>
        <div style={{
          padding: '1rem',
          background: '#fef3c7',
          borderRadius: '0.5rem',
          border: '1px solid #fbbf24'
        }}>
          <p style={{ 
            color: '#92400e', 
            margin: 0, 
            fontSize: '0.875rem',
            fontWeight: '500'
          }}>
            🚧 Application en mode maintenance
          </p>
          <p style={{ 
            color: '#92400e', 
            margin: '0.5rem 0 0 0', 
            fontSize: '0.75rem'
          }}>
            L'application sera bientôt disponible
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;