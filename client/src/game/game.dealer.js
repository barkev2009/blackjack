import { drawCardFromShoe, revealDealerCard, updateScore } from "./game.utils";

export const dealerReducers = {
    revealDealerCardAction: (state) => {
        revealDealerCard(state);
    },

    drawDealerCard: (state) => {
        drawCardFromShoe(state, state.dealerState);
        updateScore(state.dealerState);
    },

    finishDealerTurn: (state) => {
        state.dealerState.isOver = true;
    },
};
