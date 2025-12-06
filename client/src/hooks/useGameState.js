import { useState, useEffect, useCallback } from 'react';
import { calculateScore, getBasicStrategyAdvice } from '../utils/deckLogic';

export const useGameState = () => {
    const [deck, setDeck] = useState([]);
    const [playerHand, setPlayerHand] = useState([]);
    const [dealerHand, setDealerHand] = useState([]);
    const [playerScore, setPlayerScore] = useState(0);
    const [dealerScore, setDealerScore] = useState(0);
    const [gameStatus, setGameStatus] = useState('betting');
    const [message, setMessage] = useState('Сделайте ставку');
    const [playerBalance, setPlayerBalance] = useState(1000);
    const [bet, setBet] = useState(0);
    const [strategyAdvice, setStrategyAdvice] = useState('');

    // Состояния для сплита
    const [splitHands, setSplitHands] = useState([]);
    const [currentSplitHand, setCurrentSplitHand] = useState(0);
    const [splitScores, setSplitScores] = useState([0, 0]);
    const [isSplitActive, setIsSplitActive] = useState(false);
    const [splitBets, setSplitBets] = useState([0, 0]);

    // Обновление счета
    const updateScores = useCallback(() => {
        if (playerHand.length > 0) {
            setPlayerScore(calculateScore(playerHand));
        }

        if (dealerHand.length > 0) {
            const visibleDealerCards = gameStatus === 'playing' || gameStatus === 'split-playing'
                ? dealerHand.filter(card => !card.isHidden)
                : dealerHand;
            setDealerScore(calculateScore(visibleDealerCards));
        }
    }, [playerHand, dealerHand, gameStatus]);

    // Обновление стратегии
    const updateStrategy = useCallback((hand, dealerCard) => {
        if (hand?.length > 0 && dealerCard) {
            setStrategyAdvice(getBasicStrategyAdvice(hand, dealerCard));
        }
    }, []);

    // Функция для обновления состояния
    const updateGameState = useCallback((updates) => {
        Object.entries(updates).forEach(([key, value]) => {
            switch (key) {
                case 'deck': setDeck(value); break;
                case 'playerHand': setPlayerHand(value); break;
                case 'dealerHand': setDealerHand(value); break;
                case 'playerScore': setPlayerScore(value); break;
                case 'dealerScore': setDealerScore(value); break;
                case 'gameStatus': setGameStatus(value); break;
                case 'message': setMessage(value); break;
                case 'playerBalance': setPlayerBalance(value); break;
                case 'bet': setBet(value); break;
                case 'splitHands': setSplitHands(value); break;
                case 'currentSplitHand': setCurrentSplitHand(value); break;
                case 'splitScores': setSplitScores(value); break;
                case 'isSplitActive': setIsSplitActive(value); break;
                case 'splitBets': setSplitBets(value); break;
                case 'strategyAdvice': setStrategyAdvice(value); break;
                default: break;
            }
        });
    }, []);

    useEffect(() => {
        updateScores();
    }, [playerHand, dealerHand, gameStatus, updateScores]);

    return {
        playerHand,
        dealerHand,
        playerScore,
        dealerScore,
        gameStatus,
        message,
        playerBalance,
        bet,
        strategyAdvice,
        splitHands,
        currentSplitHand,
        splitScores,
        isSplitActive,
        splitBets,
        deck,
        updateGameState,
        updateStrategy
    };
};