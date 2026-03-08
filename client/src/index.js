import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/App.css';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { gameSlice } from './game/game.slice';

const container = document.getElementById('root');
const root = createRoot(container);


const store = configureStore(
    {
        reducer: {
            game: gameSlice.reducer,
        }
    }
)

root.render(<Provider store={store}> <App /></Provider>);