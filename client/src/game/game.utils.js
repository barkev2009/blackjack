import { GAME_STATES } from "../const";

export const drawCardFromShoe = (state, participantState, isHiddenCard = false) => {
    const drawnCard = state.shoe.shift();
    isHiddenCard ? participantState.hand.push({ ...drawnCard, face: false }) : participantState.hand.push(drawnCard);
    return drawnCard;
};

export const revealDealerCard = (dealerState, runningCount) => {
    dealerState.hand = [dealerState.hand[0], { ...dealerState.hand[1], face: true }]
    updateScore(dealerState, runningCount)
}

export const updateScore = (state, runningCount) => {
    const card = state.hand.slice(-1)[0];
    state.runningCount += card.count;

    let [ace1, ace11] = state.score;
    if (card.label === 'A') {
        ace1 += 1;
        if (ace11 + 11 > 21) {
            ace11 += 1;
        } else {
            ace11 += 11;
        }
    } else {
        ace1 += card.value;
        ace11 += card.value;
    }

    // Корректировка софтов
    if (ace1 !== ace11 && ace11 > 21) {
        ace11 = ace1
    } else if (ace11 === 21) {
        ace1 = 21
    }

    state.isBusted = Math.min(ace1, ace11) > 21;

    if (ace1 < ace11) {
        state.scoreFormatted = `${ace1} / ${ace11}`
    } else {
        state.scoreFormatted = ace11.toString();
    }

    state.score = [ace1, ace11]
    // state.runningCount = runningCount;
}

export const checkBlackjack = (state) => {
    if (state.playerStates[0].score[0] === 21) {
        revealDealerCard(state.dealerState, state.runningCount);
        if (state.dealerState.score[0] === 21) {
            state.bankroll += state.bet;
        } else {
            state.bankroll += 2.5 * state.bet;
        }
        state.phase = GAME_STATES.BETTING;
    }
}

export const setGamePhase = (state, phase) => {
    state.phase = phase
}

export const determineResult = (state) => {

}

export const createPlayerState = (hand, bet) => ({
    hand,
    score: hand[0].label === 'A' ? [1, 11] : [hand[0].value, hand[0].value],
    scoreFormatted: hand[0].label === 'A' ? '1 / 11' : hand[0].value.toString(),
    bet,
    basicStrategy: '',
    isOver: false,
    isBusted: false
});