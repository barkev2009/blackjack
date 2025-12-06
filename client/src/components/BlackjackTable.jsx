import React, { useState } from 'react';
import GameTable from './GameTable';
import BettingPanel from './BettingPanel';
import { useGameState } from '../hooks/useGameState';
import { useGameActions } from '../hooks/useGameActions';
import { useSplitActions } from '../hooks/useSplitActions';
import '../styles/BlackjackTable.css';

const BlackjackTable = () => {
    const [showStrategy, setShowStrategy] = useState(false);

    // Основные состояния
    const {
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
        updateGameState
    } = useGameState();

    // Основные действия
    const gameActions = useGameActions({
        gameStatus,
        playerHand,
        dealerHand,
        playerBalance,
        bet,
        deck,
        updateGameState,
        setShowStrategy
    });

    // Действия для сплита
    const splitActions = useSplitActions({
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
    });

    const handleDeal = () => gameActions.startGame(bet);
    const clearBet = () => gameActions.clearBet();
    const handleBetChange = (newBet) => gameActions.changeBet(newBet);

    // Выбираем нужные действия в зависимости от режима
    const getCurrentActions = () => {
        if (gameStatus === 'split-playing') {
            return {
                hit: splitActions.hit,
                stand: splitActions.stand,
                doubleDown: splitActions.doubleDown,
                split: () => { },
                canDoubleDown: splitActions.canDoubleDown,
                canSplit: false
            };
        }

        return {
            hit: gameActions.hit,
            stand: gameActions.stand,
            doubleDown: gameActions.doubleDown,
            split: gameActions.split,
            canDoubleDown: gameActions.canDoubleDown(),
            canSplit: gameActions.canSplit()
        };
    };

    const actions = getCurrentActions();

    return (
        <div className="blackjack-table">
            <div className="table-surface">
                {/* Статус баланса и ставки */}
                <div className="bet-status-bar">
                    <div className="balance-info">
                        <span className="balance-label">Баланс:</span>
                        <span className="balance-amount">${playerBalance}</span>
                    </div>

                    <div className="current-bet-info">
                        <span className="bet-label">Ставка:</span>
                        <span className="bet-amount">${bet}</span>
                        {isSplitActive && (
                            <span className="split-indicator">(Сплит: ${splitBets[0] + splitBets[1]})</span>
                        )}
                    </div>
                </div>

                {/* Игровой стол */}
                <GameTable
                    dealerHand={dealerHand}
                    playerHand={playerHand}
                    playerScore={playerScore}
                    dealerScore={dealerScore}
                    splitHands={splitHands}
                    splitScores={splitScores}
                    splitBets={splitBets}
                    currentSplitHand={currentSplitHand}
                    isSplitActive={isSplitActive}
                    gameStatus={gameStatus}
                    message={message}
                    actions={actions}
                    showStrategy={() => setShowStrategy(!showStrategy)}
                    strategyAdvice={strategyAdvice}
                    showStrategyModal={showStrategy}
                    onCloseStrategy={() => setShowStrategy(false)}
                />
            </div>

            {/* Панель ставок */}
            {gameStatus === 'betting' && (
                <BettingPanel
                    balance={playerBalance}
                    currentBet={bet}
                    onBetChange={handleBetChange}
                    onDeal={handleDeal}
                    onClear={clearBet}
                    gameStatus={gameStatus}
                />
            )}
        </div>
    );
};

export default BlackjackTable;