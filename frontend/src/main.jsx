import { createRoot } from 'react-dom/client';
import App from './App.jsx';

import "./Style/Home.css";
import "./Style/auth.css";
import "./Style/global.css";

createRoot(document.getElementById('root')).render(
  <App />
);