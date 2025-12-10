import { createContext, useContext, useEffect, useState } from "react";
import { createShoe, giveBSAdvice } from "../utils";
import { GAME_STATES } from "../const";

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
    function useBet(obj) { return useState(obj); }
    function useBankroll(obj) { return useState(obj); }

    const [shoe, setShoe] = useShoe(createShoe());
    const [runningCount, setRunningCount] = useRunningCount(0);
    const [playerStates, setPlayerStates] = usePlayerStates([{
        hand: [],
        score: [0, 0],
        scoreFormatted: '',
        basicStrategy: '',
        isOver: false,
        isBusted: false
    }]);
    const [dealerState, setDealerState] = useDealerState({
        hand: [],
        score: [0, 0],
        scoreFormatted: '',
        isOver: false,
        isBusted: false
    });
    const [gamePhase, setGamePhase] = useGamePhase(GAME_STATES.BETTING); // 'initial', 'player-turn', 'dealer-turn', 'game-over'
    const [bet, setBet] = useBet(0);
    const [bankroll, setBankroll] = useBankroll(2000);

    useEffect(function initializeGame() {
        if (gamePhase === GAME_STATES.INITIAL_GAME) {
            console.log(shoe);
            setDealerState(_ => ({
                hand: [],
                score: [0, 0],
                scoreFormatted: '',
                isOver: false,
                isBusted: false
            }));
            setPlayerStates(_ => [{
                hand: [],
                score: [0, 0],
                scoreFormatted: '',
                isOver: false,
                isBusted: false,
                basicStrategy: '',
                bet
            }])
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
            setGamePhase(GAME_STATES.PLAYER_TURN);
        }
        if (gamePhase === GAME_STATES.PLAYER_TURN) {
            setPlayerStates(states => states.map(state => ({ ...state, basicStrategy: setBasicStrategy(state) })));
        }
    }, [gamePhase]);

    // Эффект для проверки блэкджека после обновления счета
    useEffect(function checkBlackjackEffect() {
        if (gamePhase === GAME_STATES.PLAYER_TURN) {
            playerStates.forEach((_, index) => {
                checkForBlackjack(index);
            });
        }
    }, [playerStates, gamePhase]);

    useEffect(function determineResultEffect() {
        if (gamePhase === GAME_STATES.GAME_OVER) {
            determineResult();
            setTimeout(() => setGamePhase(_ => GAME_STATES.BETTING), 2000);

            // Обновляем колоду, если превысили лимит в 20% остатка колоды
            if (shoe.length < 6 * 52 * (1 - 0.8)) {
                setShoe(_ => createShoe());
                setRunningCount(0);
            }
        }
    }, [gamePhase]);

    // Очередь дилера
    useEffect(function startDealerTurnEffect() {
        // Если все переборы, то заканчиваем игру
        if (playerStates.map(state => state.isBusted).some(elem => elem)) {
            setGamePhase(_ => GAME_STATES.GAME_OVER);
        }
        if (playerStates.map(state => state.isOver).every(elem => elem) &&
            playerStates.map(state => state.isBusted).some(elem => !elem)) {
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
        }
    }, [playerStates]);

    // Эффект для отображения стейтов
    useEffect(function debugStates() {
        console.log('%cDEALER-STATE', 'color: gray', dealerState);
        console.log('%cPLAYER-STATES', 'color: gray', ...playerStates);
        console.log(`%cGAME-PHASE %c${gamePhase}`, 'color: gray', 'color: green');
        console.log(`%cBANKROLL %c${bankroll}`, 'color: gray', 'color: red');
        console.log('');
    }, [playerStates, dealerState, gamePhase])

    const setBasicStrategy = (playerState) => {
        let basicStrategy = '';
        if (dealerState.hand.length > 0 && dealerState.hand[0]) {
            const dealerUpCard = dealerState.hand[0].label;

            basicStrategy = giveBSAdvice(
                dealerUpCard,
                playerState.hand,
                playerState.score,
                true
            );
            console.log(`%cBASIC %cSTRATEGY: %c${basicStrategy}`, 'color: gray', 'color: gray', 'color: yellow')
        }
        return basicStrategy;
    }

    const drawOneCard = () => {
        const card = shoe[0];
        setShoe(prev => [...prev.slice(1)]);
        return card;
    }

    const determineResult = () => {
        playerStates.forEach(state => {
            if (state.isBusted) {
                console.log('RESULT - BUST');
                // DO NOTHING
            } else if (state.score[1] > dealerState.score[1] || dealerState.isBusted) {
                setBankroll(prev => prev + state.bet * 2);
                console.log('RESULT - WIN');
            } else if (state.score[1] === dealerState.score[1]) {
                setBankroll(prev => prev + state.bet);
                console.log('RESULT - PUSH');
            } else {
                console.log('RESULT - LOSE');
            }
        })
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

            // Проверяем на блэкджек
            let newHand = [...prev.hand];
            if (prev.hand.length === 2 && ((prev.hand[0].label === 'A' && prev.hand[1].value === 10) || (prev.hand[1].label === 'A' && prev.hand[0].value === 10))) {
                newHand = [newHand[0], { ...newHand[1], face: true }];
                currentAce1 = 21;
                currentAce11 = 21;
                setGamePhase(GAME_STATES.GAME_OVER);
            }

            return {
                ...prev,
                hand: newHand,
                score: [currentAce1, currentAce11],
                scoreFormatted: currentAce1 === currentAce11 ? currentAce1.toString() : `${currentAce1} / ${currentAce11}`,
                isOver: currentAce11 >= 21,
                isBusted: currentAce11 > 21
            };
        });
    }

    const deal = (betSize) => {
        setGamePhase(GAME_STATES.INITIAL_GAME);
        setBet(_ => betSize);
        setBankroll(prev => prev - betSize);
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
                scoreFormatted: currentAce1 === currentAce11 ? currentAce1.toString() : `${currentAce1} / ${currentAce11}`,
                isOver: currentAce11 >= 21,
                isBusted: currentAce11 > 21,
                basicStrategy: setBasicStrategy({ ...state, score: newScores[handIndex] })
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
                setGamePhase(GAME_STATES.DEALER_TURN);
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

    const hit = (handIndex) => {
        const card = drawOneCard();
        addCardToPlayerHand(card, handIndex);
        determineScoreForHand(handIndex, card);
        setPlayerStates(prevStates => {
            if (prevStates[handIndex].score[0] === 21) {
                stand(handIndex);
            }
            return prevStates;
        });
    }

    const doubleDown = (handIndex) => {

        const card = drawOneCard();
        addCardToPlayerHand(card, handIndex);
        determineScoreForHand(handIndex, card);

        // После doubleDown сразу переходим к следующей руке или дилеру
        setPlayerStates(prevStates => {
            if (prevStates[handIndex].score[0] <= 21) {
                stand(handIndex);
            }
            return prevStates.map((state, idx) => {
                if (idx !== handIndex) {
                    return state
                } else {
                    setBankroll(prev => prev - state.bet)
                    return { ...state, bet: state.bet * 2 }
                }
            });
        });
    }

    const split = (handIndex) => {
        const currentBet = playerStates[handIndex].bet;
        setBankroll(prev => prev - currentBet);

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
            _ => newPlayerHands.map((hand, idx) => {
                const newState = {
                    hand,
                    score: newPlayerScores[idx],
                    scoreFormatted: newPlayerScoresFormatted[idx],
                    isOver: false,
                    isBusted: false,
                    bet: currentBet
                }
                const basicStrategy = setBasicStrategy({ hand, score: newPlayerScores[idx] })
                return { ...newState, basicStrategy }
            })
        )

        determineScoreForHand(handIndex, card1);
        determineScoreForHand(handIndex, cardForHand1);
        determineScoreForHand(handIndex + 1, card2);
        determineScoreForHand(handIndex + 1, cardForHand2);
    };

    const stand = (handIndex = 0) => {
        setGamePhase(GAME_STATES.DEALER_TURN);

        // Обновляем текущую руку игрока на hard total
        setPlayerStates(prevStates =>
            prevStates.map((state, idx) => idx !== handIndex ? state : ({
                ...state,
                score: [Math.max(...state.score), Math.max(...state.score)],
                scoreFormatted: Math.max(...state.score).toString(),
                isOver: true
            }))
        );
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
                    setGamePhase(GAME_STATES.GAME_OVER);

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
                        setGamePhase(GAME_STATES.GAME_OVER);
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
        runningCount,
        gamePhase,
        bet,
        bankroll,

        hit,
        stand,
        doubleDown,
        split,
        deal
    };

    return (
        <GameContext.Provider value={value}>
            {children}
        </GameContext.Provider>
    );
};