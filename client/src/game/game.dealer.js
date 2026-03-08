import { drawCardFromShoe, revealDealerCard, updateScore } from "./game.utils";

// Логика дилера
export const dealerReducers = {
    revealDealerCardAction: (state) => {
        revealDealerCard(state.dealerState, state.runningCount);
    },

    drawDealerCard: (state) => {
        drawCardFromShoe(state, state.dealerState);
        updateScore(state.dealerState, state.runningCount);
    },

    finishDealerTurn: (state) => {
        state.dealerState.isOver = true;
    },

    dealerTurn: (state) => {
        revealDealerCard(state.dealerState, state.runningCount);

        while (state.dealerState.score[1] < 17 && !state.dealerState.isBusted) {
            drawCardFromShoe(state, state.dealerState);
            updateScore(state.dealerState, state.runningCount);
        }

        state.dealerState.isOver = true;
    },
};