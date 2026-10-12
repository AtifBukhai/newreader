import React from 'react';
import ReactDOM from 'react-dom/client';

// Minimal test to verify React can render
function TestApp() {
  console.log('[TestApp] Rendering...');
  return (
    <div style={{ padding: '20px', color: 'white', background: '#0a0a0f' }}>
      <h1>Kitabo Test</h1>
      <p>If you see this, React is working!</p>
      <p>Time: {new Date().toLocaleTimeString()}</p>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<TestApp />);

console.log('[Test] React app mounted successfully');
