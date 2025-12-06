import { useCallback } from 'react';
import {
    createDeck,
    drawCard,
    calculateScore,
    canDoubleDown,
    canSplit,
    createSplitHands
} from '../utils/deckLogic';

export const useGameActions = ({
    gameStatus,
    playerHand,
    dealerHand,
    playerBalance,
    bet,
    deck,
    updateGameState,
    setShowStrategy
}) => {
    // Начать игру
    const startGame = useCallback((currentBet) => {
        if (gameStatus !== 'betting' || currentBet < 10) {
            updateGameState({ message: 'Минимальная ставка: $10' });
            return;
        }

        if (currentBet > playerBalance) {
            updateGameState({ message: 'Недостаточно средств' });
            return;
        }

        const newDeck = createDeck();
        const { card: p1, newDeck: d1 } = drawCard(newDeck);
        const { card: d1Card, newDeck: d2 } = drawCard(d1);
        const { card: p2, newDeck: d3 } = drawCard(d2);
        const { card: d2Card, newDeck: d4 } = drawCard(d3);

        updateGameState({
            deck: d4,
            playerHand: [p1, p2],
            dealerHand: [d1Card, { ...d2Card, isHidden: true }],
            playerScore: calculateScore([p1, p2]),
            dealerScore: calculateScore([d1Card]),
            playerBalance: playerBalance - currentBet,
            message: calculateScore([p1, p2]) === 21 ? 'Blackjack!' : 'Ваш ход',
            gameStatus: calculateScore([p1, p2]) === 21 ? 'dealer-turn' : 'playing'
        });

        if (calculateScore([p1, p2]) === 21) {
            setTimeout(() => handleBlackjack(), 1500);
        }
    }, [gameStatus, playerBalance, updateGameState]);

    // Очистить ставку
    const clearBet = useCallback(() => {
        if (gameStatus === 'betting') {
            updateGameState({
                bet: 0,
                message: 'Ставка очищена'
            });
        }
    }, [gameStatus, updateGameState]);

    // Изменить ставку
    const changeBet = useCallback((newBet) => {
        if (gameStatus === 'betting' && newBet <= playerBalance) {
            updateGameState({
                bet: newBet,
                message: `Ставка: $${newBet}`
            });
        }
    }, [gameStatus, playerBalance, updateGameState]);

    // Взять карту
    const hit = useCallback(() => {
        if (gameStatus !== 'playing') return;

        const { card, newDeck } = drawCard(deck);
        if (!card) return;

        const newHand = [...playerHand, card];
        const score = calculateScore(newHand);

        updateGameState({
            deck: newDeck,
            playerHand: newHand,
            playerScore: score,
            message: `Очки: ${score}`
        });

        if (score > 21) {
            setTimeout(() => endGame('Перебор! Вы проиграли.'), 1000);
        } else if (score === 21) {
            setTimeout(stand, 1000);
        }
    }, [gameStatus, deck, playerHand, updateGameState]);

    // Остановиться
    const stand = useCallback(() => {
        if (gameStatus !== 'playing') return;

        const updatedDealerHand = dealerHand.map(card => ({ ...card, isHidden: false }));
        updateGameState({
            dealerHand: updatedDealerHand,
            dealerScore: calculateScore(updatedDealerHand),
            gameStatus: 'dealer-turn',
            message: 'Ход дилера...'
        });

        setTimeout(() => dealerPlay(updatedDealerHand), 1000);
    }, [gameStatus, dealerHand, updateGameState]);

    // Double Down
    const doubleDown = useCallback(() => {
        if (gameStatus !== 'playing' || !canDoubleDown(playerHand, playerBalance, bet)) return;

        const { card, newDeck } = drawCard(deck);
        if (!card) return;

        const newHand = [...playerHand, card];
        const score = calculateScore(newHand);

        updateGameState({
            deck: newDeck,
            playerHand: newHand,
            playerScore: score,
            playerBalance: playerBalance - bet,
            message: `Double Down! Очки: ${score}`
        });

        setTimeout(() => {
            if (score > 21) {
                endGame('Перебор после Double Down!');
            } else {
                stand();
            }
        }, 500);
    }, [gameStatus, playerHand, playerBalance, bet, deck, updateGameState, stand]);

    // Split
    const split = useCallback(() => {
        if (gameStatus !== 'playing' || !canSplit(playerHand, playerBalance, bet)) return;

        const { hands, newDeck } = createSplitHands(playerHand, deck, bet);
        const scores = hands.map(hand => calculateScore(hand));

        updateGameState({
            deck: newDeck,
            playerHand: [],
            playerScore: 0,
            splitHands: hands,
            splitScores: scores,
            splitBets: [bet, bet],
            currentSplitHand: 0,
            isSplitActive: true,
            playerBalance: playerBalance - bet,
            gameStatus: 'split-playing',
            message: `Сплит! Играем Руку 1`
        });
    }, [gameStatus, playerHand, playerBalance, bet, deck, updateGameState]);

    // Вспомогательные функции
    const handleBlackjack = useCallback(() => {
        const updatedDealerHand = dealerHand.map(card => ({ ...card, isHidden: false }));
        const dealerScore = calculateScore(updatedDealerHand);

        updateGameState({
            dealerHand: updatedDealerHand,
            dealerScore: dealerScore
        });

        setTimeout(() => {
            const isDealerBlackjack = dealerHand.length === 2 && dealerScore === 21;
            updateGameState({
                message: isDealerBlackjack ? 'Push! Оба Blackjack' : 'Blackjack! Выигрыш 3:2',
                playerBalance: isDealerBlackjack ? playerBalance + bet : playerBalance + Math.floor(bet * 2.5),
                gameStatus: 'ended'
            });
        }, 1500);
    }, [dealerHand, playerBalance, bet, updateGameState]);

    const dealerPlay = useCallback((currentDealerHand) => {
        let currentDeck = deck;
        let currentHand = currentDealerHand;
        let dealerScore = calculateScore(currentHand);

        while (dealerScore < 17) {
            const { card, newDeck } = drawCard(currentDeck);
            if (!card) break;

            currentHand = [...currentHand, card];
            currentDeck = newDeck;
            dealerScore = calculateScore(currentHand);
        }

        updateGameState({
            dealerHand: currentHand,
            dealerScore: dealerScore,
            deck: currentDeck
        });

        determineWinner(dealerScore, calculateScore(playerHand));
    }, [deck, playerHand, updateGameState]);

    const determineWinner = useCallback((dealerScore, playerScore) => {
        let message = '';
        let winnings = 0;

        if (playerScore > 21) {
            message = 'Перебор! Вы проиграли.';
        } else if (dealerScore > 21) {
            message = 'Вы выиграли!';
            winnings = bet * 2;
        } else if (playerScore > dealerScore) {
            message = playerHand.length === 2 && playerScore === 21 ? 'Blackjack! 3:2' : 'Вы выиграли!';
            winnings = playerHand.length === 2 && playerScore === 21 ? Math.floor(bet * 2.5) : bet * 2;
        } else if (playerScore < dealerScore) {
            message = 'Вы проиграли!';
        } else {
            message = 'Ничья!';
            winnings = bet;
        }

        updateGameState({
            message: message,
            playerBalance: playerBalance + winnings,
            gameStatus: 'ended'
        });
    }, [bet, playerHand, playerBalance, updateGameState]);

    const endGame = useCallback((msg) => {
        updateGameState({
            message: msg,
            gameStatus: 'ended'
        });
    }, [updateGameState]);

    return {
        startGame,
        clearBet,
        changeBet,
        hit,
        stand,
        doubleDown,
        split,
        canDoubleDown: () => canDoubleDown(playerHand, playerBalance, bet),
        canSplit: () => canSplit(playerHand, playerBalance, bet)
    };
};