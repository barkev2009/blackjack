import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/App.css';
import { Provider } from 'react-redux';
import { store } from './database';
import { GameProvider } from './context/GameContext';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<Provider store={store}><GameProvider> <App /></GameProvider></Provider>);