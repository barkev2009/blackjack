import { getLeftAdjustment, getRandomRotationAngle } from "../utils";

// Функции для работы со ставками и банкроллом
export const chipsReducers = {
    incrementBet: (state, action) => {
        const LIMIT = 20;
        state.bet += action.payload.value;
        const newIdx = state.chips.slice(-1)[0]?.order + 1 || 1;

        if (state.chips.length < LIMIT) {
            state.chips.push({
                ...action.payload,
                order: newIdx,
                style: {
                    bottom: `${newIdx * 4}px`,
                    left: getLeftAdjustment(newIdx),
                    transform: `rotate(${getRandomRotationAngle()}deg)`
                }
            });
        } else {
            state.chips.shift();
            state.chips.push({
                ...action.payload,
                order: newIdx,
                style: {
                    bottom: `${LIMIT * 4}px`,
                    left: getLeftAdjustment(newIdx),
                    transform: `rotate(${getRandomRotationAngle()}deg)`
                }
            });

            state.chips.forEach((chip, idx) => {
                chip.style.bottom = `${idx * 4}px`;
                chip.style.left = getLeftAdjustment(chip.order);
            });
        }
    },

    clearBet: (state) => {
        state.bet = 0;
        state.chips = [];
    },

    initialBankrollDecrement: (state) => {
        state.bankroll -= state.bet;
    },

    playerWin: (state) => {
        state.bankroll += state.bet * 2;
    },
};