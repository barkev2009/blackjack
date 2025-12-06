import { configureStore } from '@reduxjs/toolkit';

import chipsReducer from './chips.reducer';

export const store = configureStore(
    {
        reducer: {
            chips: chipsReducer,
        }
    }
)