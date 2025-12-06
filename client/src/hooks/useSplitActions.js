import { useCallback } from 'react';
import { drawCard, calculateScore, canDoubleDown } from '../utils/deckLogic';

export const useSplitActions = ({
    gameStatus,
    splitHands,
    currentSplitHand,
    splitScores,
    splitBets,
    dealerHand,
    deck,
    playerBalance,
    updateGameState,
    isSplitActive
}) => {
    const switchToNextHand = useCallback(() => {
        const nextHand = currentSplitHand + 1;

        if (nextHand < splitHands.length) {
            updateGameState({
                currentSplitHand: nextHand,
                message: `Играем Руку ${nextHand + 1}`
            });
        } else {
            finishSplit();
        }
    }, [currentSplitHand, splitHands, updateGameState]);

    const finishSplit = useCallback(() => {
        const updatedDealerHand = dealerHand.map(card => ({ ...card, isHidden: false }));

        updateGameState({
            isSplitActive: false,
            dealerHand: updatedDealerHand,
            dealerScore: calculateScore(updatedDealerHand),
            gameStatus: 'dealer-turn',
            message: 'Ход дилера...'
        });
    }, [dealerHand, updateGameState]);

    const hit = useCallback(() => {
        if (gameStatus !== 'split-playing') return;

        const currentHand = splitHands[currentSplitHand];
        const { card, newDeck } = drawCard(deck);
        if (!card) return;

        const newHand = [...currentHand, card];
        const score = calculateScore(newHand);

        const newSplitHands = [...splitHands];
        newSplitHands[currentSplitHand] = newHand;

        const newSplitScores = [...splitScores];
        newSplitScores[currentSplitHand] = score;

        updateGameState({
            deck: newDeck,
            splitHands: newSplitHands,
            splitScores: newSplitScores,
            message: `Рука ${currentSplitHand + 1}: ${score > 21 ? 'Перебор!' : `Очки: ${score}`}`
        });

        if (score > 21 || score === 21) {
            setTimeout(switchToNextHand, 1000);
        }
    }, [gameStatus, splitHands, currentSplitHand, deck, splitScores, updateGameState, switchToNextHand]);

    const stand = useCallback(() => {
        if (gameStatus !== 'split-playing') return;
        setTimeout(switchToNextHand, 1000);
    }, [gameStatus, switchToNextHand]);

    const doubleDown = useCallback(() => {
        if (gameStatus !== 'split-playing' ||
            !canDoubleDown(splitHands[currentSplitHand], playerBalance, splitBets[currentSplitHand])) return;

        const { card, newDeck } = drawCard(deck);
        if (!card) return;

        const currentHand = splitHands[currentSplitHand];
        const newHand = [...currentHand, card];
        const score = calculateScore(newHand);

        const newSplitHands = [...splitHands];
        newSplitHands[currentSplitHand] = newHand;

        const newSplitScores = [...splitScores];
        newSplitScores[currentSplitHand] = score;

        const newSplitBets = [...splitBets];
        newSplitBets[currentSplitHand] = splitBets[currentSplitHand] * 2;

        updateGameState({
            deck: newDeck,
            splitHands: newSplitHands,
            splitScores: newSplitScores,
            splitBets: newSplitBets,
            playerBalance: playerBalance - splitBets[currentSplitHand],
            message: `Рука ${currentSplitHand + 1}: Double Down! ${score > 21 ? 'Перебор!' : `Очки: ${score}`}`
        });

        setTimeout(switchToNextHand, 500);
    }, [gameStatus, splitHands, currentSplitHand, playerBalance, splitBets, deck, splitScores, updateGameState, switchToNextHand]);

    return {
        hit,
        stand,
        doubleDown,
        canDoubleDown: canDoubleDown(
            splitHands[currentSplitHand] || [],
            playerBalance,
            splitBets[currentSplitHand] || 0
        )
    };
};