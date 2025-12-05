import React, { useState, useEffect } from 'react';
import { createDeck, drawCard, calculateScore, canDoubleDown, canSplit, hasBlackjack, getBasicStrategyAdvice } from '../utils/deckLogic';
import Card from './Card';
import Controls from './Controls';
import Scoreboard from './Scoreboard';
import GameStatus from './GameStatus';
import BasicStrategy from './BasicStrategy';
import '../styles/BlackjackTable.css';

const BlackjackTable = () => {
    const [deck, setDeck] = useState([]);
    const [playerHand, setPlayerHand] = useState([]);
    const [dealerHand, setDealerHand] = useState([]);
    const [playerScore, setPlayerScore] = useState(0);
    const [dealerScore, setDealerScore] = useState(0);
    const [gameStatus, setGameStatus] = useState('betting'); // betting, playing, dealer-turn, ended
    const [message, setMessage] = useState('Сделайте ставку');
    const [playerBalance, setPlayerBalance] = useState(1000);
    const [bet, setBet] = useState(100);
    const [showStrategy, setShowStrategy] = useState(false);
    const [strategyAdvice, setStrategyAdvice] = useState('');

    // Сброс игры
    const resetGame = () => {
        setPlayerHand([]);
        setDealerHand([]);
        setPlayerScore(0);
        setDealerScore(0);
        setMessage('Сделайте ставку');
        setGameStatus('betting');
    };

    // Новая игра
    const startNewGame = () => {
        if (bet > playerBalance || bet <= 0) {
            setMessage('Некорректная ставка');
            return;
        }

        const newDeck = createDeck();
        const { card: playerCard1, newDeck: deck1 } = drawCard(newDeck);
        const { card: dealerCard1, newDeck: deck2 } = drawCard(deck1);
        const { card: playerCard2, newDeck: deck3 } = drawCard(deck2);
        const { card: dealerCard2, newDeck: deck4 } = drawCard(deck3);

        // Карта дилера скрыта
        const dealerHiddenCard = { ...dealerCard2, isHidden: true };

        setDeck(deck4);
        setPlayerHand([playerCard1, playerCard2]);
        setDealerHand([dealerCard1, dealerHiddenCard]);

        // Сразу обновляем счет игрока
        const initialPlayerScore = calculateScore([playerCard1, playerCard2]);
        setPlayerScore(initialPlayerScore);

        // Обновляем счет дилера (только видимая карта)
        const initialDealerScore = calculateScore([dealerCard1]);
        setDealerScore(initialDealerScore);

        // Проверяем блэкджек
        if (initialPlayerScore === 21) {
            handleBlackjack();
        } else {
            setGameStatus('playing');
            setMessage('Ваш ход');
            updateStrategyAdvice([playerCard1, playerCard2], dealerCard1);
        }

        // Обновляем баланс (вычитаем ставку)
        setPlayerBalance(prev => prev - bet);
    };

    const handleBlackjack = () => {
        setGameStatus('dealer-turn');
        setMessage('Blackjack! Проверяем дилера...');

        // Показываем скрытую карту дилера
        const updatedDealerHand = dealerHand.map(card => ({
            ...card,
            isHidden: false
        }));
        setDealerHand(updatedDealerHand);

        const dealerFinalScore = calculateScore(updatedDealerHand);
        setDealerScore(dealerFinalScore);

        setTimeout(() => {
            if (dealerFinalScore === 21) {
                setMessage('Push! Оба имеют Blackjack');
                setPlayerBalance(prev => prev + bet); // Возвращаем ставку
            } else {
                setMessage('Blackjack! Вы выиграли 3:2');
                const winnings = Math.floor(bet * 2.5); // 3:2 выплата
                setPlayerBalance(prev => prev + winnings);
            }
            setGameStatus('ended');
        }, 1500);
    };

    // Взять карту
    const hit = () => {
        if (gameStatus !== 'playing') return;

        const { card, newDeck } = drawCard(deck);
        if (!card) return;

        const newPlayerHand = [...playerHand, card];
        setPlayerHand(newPlayerHand);
        setDeck(newDeck);

        const score = calculateScore(newPlayerHand);
        setPlayerScore(score);

        // Обновляем стратегию
        updateStrategyAdvice(newPlayerHand, dealerHand[0]);

        if (score > 21) {
            endGame('Перебор! Вы проиграли.');
        } else if (score === 21) {
            stand(); // Автоматически стой если 21
        }
    };

    // Остановиться
    const stand = () => {
        if (gameStatus !== 'playing') return;

        setGameStatus('dealer-turn');
        setMessage('Ход дилера...');

        // Показываем скрытую карту дилера
        const updatedDealerHand = dealerHand.map(card => ({
            ...card,
            isHidden: false
        }));
        setDealerHand(updatedDealerHand);

        // Сразу обновляем счет дилера
        const updatedDealerScore = calculateScore(updatedDealerHand);
        setDealerScore(updatedDealerScore);

        // Ход дилера
        setTimeout(() => dealerPlay(updatedDealerHand), 1000);
    };

    // Double Down
    const doubleDown = () => {
        if (gameStatus !== 'playing' || !canDoubleDown(playerHand, playerBalance, bet)) return;

        // Удваиваем ставку
        setPlayerBalance(prev => prev - bet);
        const newBet = bet * 2;

        // Берем одну карту
        const { card, newDeck } = drawCard(deck);
        if (!card) return;

        const newPlayerHand = [...playerHand, card];
        setPlayerHand(newPlayerHand);
        setDeck(newDeck);

        const score = calculateScore(newPlayerHand);
        setPlayerScore(score);

        // Автоматически стой после Double Down
        setTimeout(() => {
            if (score > 21) {
                endGame('Перебор после Double Down! Вы проиграли.');
            } else {
                stand();
            }
        }, 500);
    };

    // Split
    const split = () => {
        // Реализация сплита (упрощенная версия)
        if (gameStatus !== 'playing' || !canSplit(playerHand, playerBalance, bet)) return;

        setMessage('Split в разработке...');
        // Здесь будет логика для сплита
    };

    // Ход дилера
    const dealerPlay = (currentDealerHand) => {
        let currentDeck = [...deck];
        let currentHand = [...currentDealerHand];
        let dealerScoreValue = calculateScore(currentHand);

        // Обновляем счет дилера
        setDealerScore(dealerScoreValue);

        // Дилер берет карты пока меньше 17
        while (dealerScoreValue < 17) {
            const { card, newDeck } = drawCard(currentDeck);
            if (!card) break;

            currentHand.push(card);
            currentDeck = newDeck;
            dealerScoreValue = calculateScore(currentHand);

            setDealerHand([...currentHand]);
            setDeck(currentDeck);
            setDealerScore(dealerScoreValue);
        }

        determineWinner(dealerScoreValue, playerScore);
    };

    // Определение победителя
    const determineWinner = (dealerFinalScore, playerFinalScore) => {
        let result = '';
        let winnings = 0;

        if (playerFinalScore > 21) {
            result = 'Перебор! Вы проиграли.';
            winnings = 0;
        } else if (dealerFinalScore > 21) {
            result = 'Вы выиграли! У дилера перебор.';
            winnings = bet * 2;
        } else if (playerFinalScore > dealerFinalScore) {
            result = 'Вы выиграли!';
            winnings = bet * 2;
        } else if (playerFinalScore < dealerFinalScore) {
            result = 'Вы проиграли!';
            winnings = 0;
        } else {
            result = 'Ничья!';
            winnings = bet; // Возвращаем ставку
        }

        endGame(result, winnings);
    };

    const endGame = (finalMessage, winnings = 0) => {
        setGameStatus('ended');
        setMessage(finalMessage);

        if (winnings > 0) {
            setPlayerBalance(prev => prev + winnings);
        }
    };

    // Обновление стратегии
    const updateStrategyAdvice = (hand, dealerCard) => {
        if (hand.length > 0 && dealerCard) {
            const advice = getBasicStrategyAdvice(hand, dealerCard);
            setStrategyAdvice(advice);
        }
    };

    // Обновление счета при изменении рук
    useEffect(() => {
        if (playerHand.length > 0) {
            const score = calculateScore(playerHand);
            setPlayerScore(score);
        }

        if (dealerHand.length > 0) {
            // Если игра не в процессе, показываем полный счет дилера
            const score = calculateScore(
                gameStatus === 'playing'
                    ? dealerHand.filter(card => !card.isHidden)
                    : dealerHand
            );
            setDealerScore(score);
        }
    }, [playerHand, dealerHand, gameStatus]);

    // Обновление стратегии при изменении карт
    useEffect(() => {
        if (playerHand.length > 0 && dealerHand.length > 0 && gameStatus === 'playing') {
            updateStrategyAdvice(playerHand, dealerHand[0]);
        }
    }, [playerHand, dealerHand, gameStatus]);

    // Изменение ставки
    const changeBet = (amount) => {
        if (gameStatus !== 'betting') return;

        const newBet = bet + amount;
        if (newBet >= 10 && newBet <= playerBalance) {
            setBet(newBet);
        }
    };

    return (
        <div className="blackjack-table">
            <div className="table-surface">
                {/* Статус баланса и ставки */}
                <div className="balance-section">
                    <div className="balance-info">
                        <span>Баланс: ${playerBalance}</span>
                        <span>Ставка: ${bet}</span>
                    </div>

                    {gameStatus === 'betting' && (
                        <div className="bet-controls">
                            <button className="btn btn-small" onClick={() => changeBet(-10)}>-10</button>
                            <button className="btn btn-small" onClick={() => changeBet(-50)}>-50</button>
                            <button className="btn btn-small" onClick={() => setBet(100)}>100</button>
                            <button className="btn btn-small" onClick={() => changeBet(50)}>+50</button>
                            <button className="btn btn-small" onClick={() => changeBet(10)}>+10</button>
                            <button className="btn btn-small" onClick={() => setBet(playerBalance)}>Max</button>
                        </div>
                    )}
                </div>

                <div className="dealer-section">
                    <h2>Дилер</h2>
                    <div className="hand">
                        {dealerHand.map((card, index) => (
                            <Card
                                key={index}
                                card={card}
                                hidden={card.isHidden}
                            />
                        ))}
                    </div>
                    <Scoreboard score={dealerScore} label="Очки дилера:" />
                </div>

                <div className="game-center">
                    <GameStatus message={message} />
                </div>

                <div className="player-section">
                    <h2>Игрок</h2>
                    <div className="hand">
                        {playerHand.map((card, index) => (
                            <Card
                                key={index}
                                card={card}
                                hidden={false}
                            />
                        ))}
                    </div>
                    <Scoreboard score={playerScore} label="Ваши очки:" />
                </div>

                <Controls
                    gameStatus={gameStatus}
                    onHit={hit}
                    onStand={stand}
                    onDoubleDown={doubleDown}
                    onSplit={split}
                    onNewGame={startNewGame}
                    onReset={resetGame}
                    playerHand={playerHand}
                    playerBalance={playerBalance}
                    bet={bet}
                    showStrategy={() => setShowStrategy(!showStrategy)}
                    canDoubleDown={canDoubleDown(playerHand, playerBalance, bet)}
                    canSplit={canSplit(playerHand, playerBalance, bet)}
                />

                {showStrategy && strategyAdvice && (
                    <BasicStrategy
                        advice={strategyAdvice}
                        onClose={() => setShowStrategy(false)}
                    />
                )}
            </div>
        </div>
    );
};

export default BlackjackTable;