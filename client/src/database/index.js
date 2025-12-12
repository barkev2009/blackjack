import { configureStore } from '@reduxjs/toolkit';

import chipsReducer from './chips.reducer';
import gameReducer from './game.reducer';

export const store = configureStore(
    {
        reducer: {
            chips: chipsReducer,
            game: gameReducer,
        }
    }
)