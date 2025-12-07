import { createSlice } from '@reduxjs/toolkit';
import { getLeftAdjustment, getRandomRotationAngle } from '../utils';

const initialState = {
    bet: 0,
    bankroll: 2000,
    chips: []
};

export const chipsSlice = createSlice({
    name: 'chips',
    initialState,
    reducers: {
        incrementBet(state, action) {
            const LIMIT = 20;
            state.bet += action.payload.value;
            const newIdx = state.chips.slice(-1)[0]?.order + 1 || 1;
            if (state.chips.length < LIMIT) {
                state.chips.push({
                    ...action.payload,
                    order: newIdx,
                    style: { bottom: `${newIdx * 4}px`, left: getLeftAdjustment(newIdx), transform: `rotate(${getRandomRotationAngle()}deg)` }
                });
            } else {
                state.chips.shift()
                state.chips.push({
                    ...action.payload,
                    order: newIdx,
                    style: { bottom: `${LIMIT * 4}px`, left: getLeftAdjustment(newIdx), transform: `rotate(${getRandomRotationAngle()}deg)` }
                });
                state.chips.forEach((chip, idx) => {
                    chip.style.bottom = `${idx * 4}px`;
                    chip.style.left = getLeftAdjustment(chip.order);
                })
            }
        },
        clearBet(state, action) {
            state.bet = 0;
            state.chips = [];
        }
    }
});

const { reducer } = chipsSlice
export const { incrementBet, clearBet } = chipsSlice.actions
export default reducer
