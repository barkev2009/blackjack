import { drawCardFromShoe, updateScore } from "./game.utils";

// Логика игроков
export const playersReducers = {
    hit: (state, action) => {
        drawCardFromShoe(state, state.playerStates[action.payload.playerIndex]);
        updateScore(state.playerStates[action.payload.playerIndex], state.runningCount);
        state.playerStates[action.payload.playerIndex].isBusted =
            state.playerStates[action.payload.playerIndex].score[0] > 21;
        state.playerStates[action.payload.playerIndex].isOver =
            state.playerStates[action.payload.playerIndex].score[0] >= 21;
    },

    stand: (state, action) => {
        state.playerStates[action.payload.playerIndex].isOver = true;
        const score = state.playerStates[action.payload.playerIndex].score;
        state.playerStates[action.payload.playerIndex].score = [Math.max(...score), Math.max(...score)];
        state.playerStates[action.payload.playerIndex].scoreFormatted = Math.max(...score).toString();
    },

    doubleDown: (state, action) => {
        state.bankroll -= state.bet;
        drawCardFromShoe(state, state.playerStates[action.payload.playerIndex]);
        updateScore(state.playerStates[action.payload.playerIndex], state.runningCount);
        state.playerStates[action.payload.playerIndex].isBusted =
            state.playerStates[action.payload.playerIndex].score[0] > 21;
        state.playerStates[action.payload.playerIndex].isOver = true;
    },

    split: (state, action) => {
        console.log(state.playerStates[action.payload.playerIndex].bet);
        state.bankroll -= state.playerStates[action.payload.playerIndex].bet;
        const [card1, card2] = state.playerStates[action.payload.playerIndex].hand;
        const state1 = {
            hand: [card1],
            score: card1.label === 'A' ? [1, 11] : [card1.value, card1.value],
            scoreFormatted: card1.label === 'A' ? '1 / 11' : card1.value.toString(),
            bet: state.playerStates[action.payload.playerIndex].bet,
            basicStrategy: '',
            isOver: false,
            isBusted: false
        };

        const state2 = {
            hand: [card2],
            score: card2.label === 'A' ? [1, 11] : [card2.value, card2.value],
            scoreFormatted: card2.label === 'A' ? '1 / 11' : card2.value.toString(),
            bet: state.playerStates[action.payload.playerIndex].bet,
            basicStrategy: '',
            isOver: false,
            isBusted: false
        };

        state.playerStates.splice(action.payload.playerIndex, 1, state1, state2);
        drawCardFromShoe(state, state.playerStates[action.payload.playerIndex]);
        updateScore(state.playerStates[action.payload.playerIndex], state.runningCount);
        drawCardFromShoe(state, state.playerStates[action.payload.playerIndex + 1]);
        updateScore(state.playerStates[action.payload.playerIndex + 1], state.runningCount);
    },
    playerWin: (state, action) => {
        state.bankroll += state.playerStates[action.payload.playerIndex].bet * 2;
    },
    playerPush: (state, action) => {
        state.bankroll += state.playerStates[action.payload.playerIndex].bet;
    },
};