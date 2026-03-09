import { drawCardFromShoe, updateScore } from "./game.utils";
import { GAME_STATES } from "../const";

export const playersReducers = {
    hit: (state, action) => {
        const { playerIndex } = action.payload;
        drawCardFromShoe(state, state.playerStates[playerIndex]);
        updateScore(state.playerStates[playerIndex]);
        if (state.playerStates[playerIndex].score[0] > 21) {
            state.playerStates[playerIndex].isBusted = true;
            state.playerStates[playerIndex].isOver = true;
            state.playerStates[playerIndex].result = 'bust';
            // Активируем следующую ожидающую руку
            const next = state.playerStates[playerIndex + 1];
            if (next && next.isWaiting) next.isWaiting = false;
        }
    },

    stand: (state, action) => {
        const { playerIndex } = action.payload;
        const ps = state.playerStates[playerIndex];
        ps.isOver = true;
        const best = ps.score[1] <= 21 ? ps.score[1] : ps.score[0];
        ps.score = [best, best];
        ps.scoreFormatted = best.toString();
        // Активируем следующую ожидающую руку
        const next = state.playerStates[playerIndex + 1];
        if (next && next.isWaiting) next.isWaiting = false;
    },

    doubleDown: (state, action) => {
        const { playerIndex } = action.payload;
        const ps = state.playerStates[playerIndex];
        state.bankroll -= ps.bet;
        ps.bet *= 2;
        drawCardFromShoe(state, ps);
        updateScore(ps);
        ps.isOver = true;
        if (ps.score[0] > 21) {
            ps.isBusted = true;
            ps.result = 'bust';
        }
        // Активируем следующую ожидающую руку
        const nextPs = state.playerStates[action.payload.playerIndex + 1];
        if (nextPs && nextPs.isWaiting) nextPs.isWaiting = false;
    },

    split: (state, action) => {
        const { playerIndex } = action.payload;
        const ps = state.playerStates[playerIndex];
        const originalBet = ps.bet;
        // We need to put up another equal bet for the second hand
        state.bankroll -= originalBet;

        const [card1, card2] = ps.hand;

        const makeHandState = (card, bet) => ({
            hand: [{ ...card, face: true }],
            score: card.label === 'A' ? [1, 11] : [card.value, card.value],
            scoreFormatted: card.label === 'A' ? '1 / 11' : card.value.toString(),
            bet,
            basicStrategy: '',
            isOver: false,
            isBusted: false,
            result: null,
            isSplit: true,
        });

        const state1 = makeHandState(card1, originalBet);
        const state2 = makeHandState(card2, originalBet);

        state.playerStates.splice(playerIndex, 1, state1, state2);

        // Draw second card for each split hand
        drawCardFromShoe(state, state.playerStates[playerIndex]);
        updateScore(state.playerStates[playerIndex]);
        drawCardFromShoe(state, state.playerStates[playerIndex + 1]);
        updateScore(state.playerStates[playerIndex + 1]);

        // Split aces: обе руки сразу завершены
        if (card1.label === 'A') {
            state.playerStates[playerIndex].isOver = true;
            state.playerStates[playerIndex + 1].isOver = true;
        } else {
            // Вторая рука ждёт пока первая не завершится
            state.playerStates[playerIndex + 1].isWaiting = true;
        }
    },

    setPlayerResult: (state, action) => {
        const { playerIndex, result } = action.payload;
        state.playerStates[playerIndex].result = result;
    },

    playerWin: (state, action) => {
        const { playerIndex } = action.payload;
        state.bankroll += state.playerStates[playerIndex].bet * 2;
        state.playerStates[playerIndex].result = 'win';
    },

    playerPush: (state, action) => {
        const { playerIndex } = action.payload;
        state.bankroll += state.playerStates[playerIndex].bet;
        state.playerStates[playerIndex].result = 'push';
    },

    playerLose: (state, action) => {
        const { playerIndex } = action.payload;
        state.playerStates[playerIndex].result = 'loss';
    },
};
