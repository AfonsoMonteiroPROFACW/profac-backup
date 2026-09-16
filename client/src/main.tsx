import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Global error handlers to prevent unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled Promise Rejection:', event.reason);
  console.warn('Promise rejected at:', event.promise);
  
  // Prevent the default browser behavior (logging to console)
  event.preventDefault();
  
  // You could also send this to an error reporting service
  // or show a user-friendly message
});

window.addEventListener('error', (event) => {
  console.error('Global Error:', event.error);
  console.warn('Error occurred at:', event.filename, 'line:', event.lineno);
});

createRoot(document.getElementById("root")!).render(<App />);
