import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary";

console.log('[main.tsx] Starting application...');

try {
  console.log('[main.tsx] Creating React root...');
  const root = ReactDOM.createRoot(document.getElementById("root")!);
  console.log('[main.tsx] Rendering App with ErrorBoundary...');
  root.render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
  console.log('[main.tsx] Application rendered successfully');
} catch (error) {
  console.error('[main.tsx] Failed to render application:', error);
  document.getElementById('root')!.innerHTML = `
    <div style="padding: 20px; color: white; background: #0a0a0f;">
      <h1>Application Failed to Load</h1>
      <p>Error: ${error instanceof Error ? error.message : 'Unknown error'}</p>
      <p>Please check the browser console for details.</p>
    </div>
  `;
}
