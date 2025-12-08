import { createContext, useContext, useEffect, useState } from "react";
import { createShoe } from "../utils";

const GameContext = createContext();

export const useGameContext = () => {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error('useGameContext must be used within GameProvider');
    }
    return context;
};

export const GameProvider = ({ children }) => {
    function useShoe(obj) { return useState(obj); }
    function useRunningCount(obj) { return useState(obj); }
    function usePlayerStates(obj) { return useState(obj); }
    function useDealerState(obj) { return useState(obj); }
    function useGamePhase(obj) { return useState(obj); }

    const [shoe, setShoe] = useShoe(createShoe());
    const [runningCount, setRunningCount] = useRunningCount(0);
    const [playerStates, setPlayerStates] = usePlayerStates([{
        hand: [],
        score: [0, 0],
        scoreFormatted: ''
    }]);
    const [dealerState, setDealerState] = useDealerState({
        hand: [],
        score: [0, 0],
        scoreFormatted: ''
    });
    const [gamePhase, setGamePhase] = useGamePhase('initial'); // 'initial', 'player-turn', 'dealer-turn', 'game-over'

    const drawOneCard = () => {
        const card = shoe[0];
        setShoe(prev => [...prev.slice(1)]);
        return card;
    }

    const determineDealerScore = (card) => {
        setDealerState(prev => {
            setRunningCount(prevCount => prevCount + card.count);

            let currentAce1 = prev.score[0];
            let currentAce11 = prev.score[1];

            if (card.label === 'A') {
                currentAce1 += 1;
                currentAce11 += 11;
            } else {
                currentAce1 += card.value;
                currentAce11 += card.value;
            }

            if (currentAce11 > 21) {
                const extraTens = (currentAce11 - currentAce1) / 10;

                if (extraTens > 0) {
                    currentAce11 -= 10;

                    if (currentAce11 > 21 && extraTens > 1) {
                        currentAce11 -= 10;
                    }

                    if (currentAce11 > 21) {
                        currentAce11 = currentAce1;
                    }
                } else {
                    currentAce11 = currentAce1;
                }
            }

            if (currentAce11 === 21) {
                currentAce1 = 21;
            }

            return {
                ...prev,
                score: [currentAce1, currentAce11],
                scoreFormatted: currentAce1 === currentAce11 ? currentAce1.toString() : `${currentAce1} / ${currentAce11}`
            };
        });
    }

    const determineScoreForHand = (handIndex, card) => {
        setPlayerStates(prevStates => {
            const prevScores = prevStates.map(state => state.score);
            const newScores = [...prevScores];
            const prevScore = newScores[handIndex] || [0, 0];

            setRunningCount(prevCount => prevCount + card.count);

            let currentAce1 = prevScore[0];
            let currentAce11 = prevScore[1];

            if (card.label === 'A') {
                currentAce1 += 1;
                currentAce11 += 11;
            } else {
                currentAce1 += card.value;
                currentAce11 += card.value;
            }

            if (currentAce11 > 21) {
                const extraTens = (currentAce11 - currentAce1) / 10;

                if (extraTens > 0) {
                    currentAce11 -= 10;

                    if (currentAce11 > 21 && extraTens > 1) {
                        currentAce11 -= 10;
                    }

                    if (currentAce11 > 21) {
                        currentAce11 = currentAce1;
                    }
                } else {
                    currentAce11 = currentAce1;
                }
            }

            if (currentAce11 === 21) {
                currentAce1 = 21;
            }

            newScores[handIndex] = [currentAce1, currentAce11];
            return prevStates.map((state, idx) => idx !== handIndex ? state : {
                ...state,
                score: newScores[handIndex],
                scoreFormatted: currentAce1 === currentAce11 ? currentAce1.toString() : `${currentAce1} / ${currentAce11}`
            });
        });
    };

    const addCardToPlayerHand = (card, handIndex) => {
        setPlayerStates(prevStates => {
            return prevStates.map((state, idx) => idx !== handIndex ? state : {
                ...state,
                hand: [...state.hand, card]
            })
        })
    }

    const checkForBlackjack = (handIndex) => {
        setPlayerStates(prevStates => {
            const state = prevStates[handIndex];
            const score = state.score;

            // Проверяем блэкджек (21 очко И ровно 2 карты в руке)
            if (state.hand.length === 2 && (score[0] === 21 || score[1] === 21)) {
                // Устанавливаем фазу дилера для проверки
                setGamePhase('dealer-turn');
                // Запускаем stand только если это первая рука игрока
                if (handIndex === prevStates.length - 1) {
                    // Открываем вторую карту дилера
                    setDealerState(prev => {
                        // Копируем карту чтобы не мутировать оригинал
                        const secondCard = prev.hand[1] ? { ...prev.hand[1], face: true } : null;
                        determineDealerScore(secondCard);

                        return {
                            ...prev,
                            hand: [prev.hand[0], secondCard || prev.hand[1]]
                        };
                    });
                }
            }
            return prevStates;
        });
    }

    useEffect(function initializeGame() {
        console.log(shoe);
        const currentShoe = [...shoe];

        // Раздаем карты дилеру
        const dealerHand = [currentShoe[0], { ...currentShoe[1], face: false }];
        setDealerState(prev => ({ ...prev, hand: dealerHand }));
        determineDealerScore(currentShoe[0]);

        // Раздаем карты игроку
        const initialHand = [currentShoe[2], currentShoe[3]];
        setPlayerStates(prevStates => [{ ...prevStates[0], hand: initialHand }]);

        // Рассчитываем счет для начальной руки
        determineScoreForHand(0, currentShoe[2]);
        determineScoreForHand(0, currentShoe[3]);

        setShoe(prev => [...prev.slice(4)]);
        setGamePhase('player-turn');
    }, []);

    // Эффект для проверки блэкджека после обновления счета
    useEffect(function checkBlackjackEffect() {
        if (gamePhase === 'player-turn') {
            playerStates.forEach((_, index) => {
                checkForBlackjack(index);
            });
        }
    }, [playerStates, gamePhase]);

    const hit = (handIndex) => {
        const card = drawOneCard();
        addCardToPlayerHand(card, handIndex);
        determineScoreForHand(handIndex, card);
    }

    const doubleDown = (handIndex) => {
        const card = drawOneCard();
        addCardToPlayerHand(card, handIndex);
        determineScoreForHand(handIndex, card);

        // После doubleDown сразу переходим к следующей руке или дилеру
        setPlayerStates(prevStates => {
            if (handIndex === prevStates.length - 1) {
                // Это последняя рука
                setTimeout(() => stand(), 0);
            }
            return prevStates;
        });
    }

    const split = (handIndex) => {
        const currentHand = playerStates[handIndex].hand;

        if (currentHand.length !== 2) return;

        const [card1, card2] = currentHand;
        if (card1.value !== card2.value) return;

        const cardForHand1 = shoe[0];
        const cardForHand2 = shoe[1];

        const newHand1 = [card1, cardForHand1];
        const newHand2 = [card2, cardForHand2];

        const newPlayerHands = [...playerStates.map(state => state.hand)];
        const newPlayerScores = [...playerStates.map(state => state.score)];
        const newPlayerScoresFormatted = [...playerStates.map(state => state.scoreFormatted)];

        newPlayerHands[handIndex] = newHand1;
        newPlayerHands.splice(handIndex + 1, 0, newHand2);

        newPlayerScores[handIndex] = [0, 0];
        newPlayerScores.splice(handIndex + 1, 0, [0, 0]);

        newPlayerScoresFormatted[handIndex] = '';
        newPlayerScoresFormatted.splice(handIndex + 1, 0, '');

        setRunningCount(prev => prev + cardForHand1.count + cardForHand2.count);

        setShoe(prev => [...prev.slice(2)]);
        setPlayerStates(
            _ => newPlayerHands.map((hand, idx) => ({
                hand,
                score: newPlayerScores[idx],
                scoreFormatted: newPlayerScoresFormatted[idx]
            }))
        )

        determineScoreForHand(handIndex, card1);
        determineScoreForHand(handIndex, cardForHand1);
        determineScoreForHand(handIndex + 1, card2);
        determineScoreForHand(handIndex + 1, cardForHand2);
    };

    const stand = (handIndex = 0) => {
        setGamePhase('dealer-turn');

        // Обновляем все руки игрока на hard total
        setPlayerStates(prevStates =>
            prevStates.map(state => ({
                ...state,
                score: [Math.max(...state.score), Math.max(...state.score)],
                scoreFormatted: Math.max(...state.score).toString()
            }))
        );

        // Открываем вторую карту дилера
        setDealerState(prev => {
            // Копируем карту чтобы не мутировать оригинал
            const secondCard = prev.hand[1] ? { ...prev.hand[1], face: true } : null;

            if (secondCard) {
                // Обновляем счет для второй карты дилера
                setTimeout(() => {
                    determineDealerScore(secondCard);
                    startDealerTurn();
                }, 500);
            } else {
                startDealerTurn();
            }

            return {
                ...prev,
                hand: [prev.hand[0], secondCard || prev.hand[1]]
            };
        });
    };

    const startDealerTurn = () => {
        const interval = setInterval(() => {
            setDealerState(prevState => {
                const prevScore = prevState.score;
                const isSoft17 = prevScore[1] === 17 && prevScore[0] !== prevScore[1];

                // Проверяем, должен ли дилер остановиться
                if (prevScore[0] > 17 || prevScore[1] > 17 ||
                    (prevScore[1] === 17 && !isSoft17)) {

                    // Финализируем счет дилера
                    const finalScore = prevScore[0] > 21 ? Math.min(...prevScore) : Math.max(...prevScore);

                    clearInterval(interval);
                    setGamePhase('game-over');

                    return {
                        ...prevState,
                        score: [finalScore, finalScore],
                        scoreFormatted: finalScore.toString()
                    };
                }

                // Дилер берет карту
                setShoe(prevShoe => {
                    if (prevShoe.length === 0) {
                        clearInterval(interval);
                        setGamePhase('game-over');
                        return prevShoe;
                    }

                    const card = prevShoe[0];
                    const newShoe = prevShoe.slice(1);

                    // Добавляем карту дилеру
                    setDealerState(prevDealerState => {
                        const newHand = [...prevDealerState.hand, card];
                        return { ...prevDealerState, hand: newHand };
                    });

                    // Обновляем счет дилера
                    determineDealerScore(card);

                    return newShoe;
                });

                return prevState;
            });
        }, 1000);
    };

    const value = {
        shoe,
        dealerState,
        playerStates,
        dealerHand: dealerState.hand,
        dealerScore: dealerState.score,
        dealerScoreFormatted: dealerState.scoreFormatted,
        runningCount,
        gamePhase,

        hit,
        stand,
        doubleDown,
        split
    };

    return (
        <GameContext.Provider value={value}>
            {children}
        </GameContext.Provider>
    );
};