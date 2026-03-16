import { GAME_STATES } from "../const";

export const drawCardFromShoe = (state, participantState, isHiddenCard = false) => {
    const drawnCard = state.shoe.shift();
    if (!drawnCard) return null;
    const card = isHiddenCard ? { ...drawnCard, face: false } : { ...drawnCard, face: true };
    participantState.hand.push(card);
    if (!isHiddenCard) state.runningCount += drawnCard.count;
    return drawnCard;
};

export const revealDealerCard = (state) => {
    const hiddenCard = state.dealerState.hand[1];
    state.dealerState.hand[1] = { ...hiddenCard, face: true };
    state.runningCount += hiddenCard.count;
    updateScore(state.dealerState);
};

export const updateScore = (participantState) => {
    let ace1 = 0, ace11 = 0;
    for (const card of participantState.hand) {
        if (card.face === false) continue;
        if (card.label === 'A') {
            ace1 += 1;
            ace11 = ace11 + 11 > 21 ? ace11 + 1 : ace11 + 11;
        } else if (card.value) {
            ace1 += card.value;
            ace11 += card.value;
        }
    }
    if (ace1 !== ace11 && ace11 > 21) ace11 = ace1;
    if (ace11 === 21) ace1 = 21;
    participantState.isBusted = Math.min(ace1, ace11) > 21;
    participantState.scoreFormatted = ace1 < ace11 ? `${ace1} / ${ace11}` : ace11.toString();
    participantState.score = [ace1, ace11];
};

export const checkBlackjack = (state) => {
    const playerScore = state.playerStates[0].score;
    const isPlayerBJ = playerScore[0] === 21 && state.playerStates[0].hand.length === 2;

    if (isPlayerBJ) {
        revealDealerCard(state);
        const dealerScore = state.dealerState.score;
        const isDealerBJ = dealerScore[0] === 21 && state.dealerState.hand.length === 2;

        state.playerStates[0].isOver = true;
        state.dealerState.isOver = true;

        if (isDealerBJ) {
            state.bankroll = Math.floor(state.bankroll + state.playerStates[0].bet);
            state.playerStates[0].result = 'push';
            state.lastResult = 'push';           // ← фикс
        } else {
            state.bankroll = Math.floor(state.bankroll + state.playerStates[0].bet * (1 + state.settings.blackjackPayout));
            state.playerStates[0].result = 'blackjack';
            state.lastResult = 'blackjack';      // ← фикс
        }
        state.phase = GAME_STATES.GAME_OVER;
        return true;
    }

    // Dealer BJ (без BJ у игрока)
    const dealerUpCard = state.dealerState.hand[0];
    if (['A', '10', 'J', 'Q', 'K'].includes(dealerUpCard.label)) {
        const tempScore = computeHandScore([
            state.dealerState.hand[0],
            { ...state.dealerState.hand[1] },
        ]);
        if (Math.max(tempScore[0], tempScore[1]) === 21) {
            revealDealerCard(state);
            state.dealerState.isOver = true;
            state.playerStates.forEach(ps => {
                ps.isOver = true;
                ps.result = 'loss';
            });
            state.lastResult = 'loss';           // ← фикс
            state.phase = GAME_STATES.GAME_OVER;
            return true;
        }
    }

    return false;
};

export const computeHandScore = (hand) => {
    let ace1 = 0, ace11 = 0;
    for (const card of hand) {
        if (card.label === 'A') {
            ace1 += 1;
            ace11 = ace11 + 11 > 21 ? ace11 + 1 : ace11 + 11;
        } else {
            ace1 += card.value;
            ace11 += card.value;
        }
    }
    if (ace1 !== ace11 && ace11 > 21) ace11 = ace1;
    return [ace1, ace11];
};

export const setGamePhase = (state, phase) => {
    state.phase = phase;
};