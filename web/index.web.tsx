import React from "react";
import { createRoot } from "react-dom/client";
import "./global.css";

// Try to load the real App component
function resolveApp() {
  try { 
    console.log("[WatchCollector Web] Loading real App.tsx component");
    return require("../App").default; 
  } catch(e) {
    console.error("[WatchCollector Web] Could not load real App component:", e);
    // Fallback to web-only component if real App fails
    try {
      console.log("[WatchCollector Web] Falling back to web App component");
      return require("./App.web").default;
    } catch(e2) {
      console.error("[WatchCollector Web] Could not load web App component either:", e2);
      return () => <div style={{padding:20,fontFamily:"sans-serif"}}>
        <h1>WatchCollector Web</h1>
        <p>App component not found. Check App.tsx or web/App.web.tsx</p>
      </div>;
    }
  }
}

class ErrorBoundary extends React.Component<{children: React.ReactNode},{error?: Error}> {
  constructor(props){ super(props); this.state = {}; }
  static getDerivedStateFromError(error){ return { error }; }
  componentDidCatch(error, info){ console.error("[Web] ErrorBoundary:", error, info); }
  render() {
    if (this.state.error) {
      return <div style={{padding:20,fontFamily:"sans-serif"}}>
        <h2>Something went wrong.</h2>
        <pre>{String(this.state.error)}</pre>
      </div>;
    }
    return this.props.children as any;
  }
}

const App = resolveApp();
const rootEl = document.getElementById("root")!;
createRoot(rootEl).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
