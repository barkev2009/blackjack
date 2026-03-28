import React, { useState } from 'react';
import '../styles/BettingPanel.css';
import { useDispatch, useSelector } from 'react-redux';
import { gameSlice } from '../game/game.slice';
import { chipset } from '../const';
import { getBiddingAdvice, BIDDING_STRATEGY_LABELS } from '../utils';
import Chip from './Chip';
import ChipsHeap from './ChipsHeap';

const BettingPanel = ({ visible }) => {
    const dispatch = useDispatch();
    const { bet, bankroll, biddingStrategy, showBiddingAdvice, lastResult, baseUnit, runningCount, shoe, settings } = useSelector(state => state.game);
    const [tableNotice, setTableNotice] = useState(null);

    const trueCount = shoe.length > 0 ? runningCount / (shoe.length / 52) : 0;

    const handleDeal = () => {
        if (bet <= 0) return;
        dispatch(gameSlice.actions.initializeRound());
        dispatch(gameSlice.actions.initialBankrollDecrement());
    };

    const handleSwitchTable = () => {
        dispatch(gameSlice.actions.switchTable());
        // После dispatch state обновится — показываем уведомление с новыми данными через небольшую задержку
        setTableNotice('switching');
        setTimeout(() => setTableNotice(null), 3500);
    };

    const biddingAdviceAmount = biddingStrategy
        ? getBiddingAdvice(biddingStrategy, bankroll, bet || baseUnit, lastResult, baseUnit, runningCount, trueCount, settings.tcSpread)
        : null;

    const resultLabel = lastResult ? (
        <span className={`last-result-badge ${lastResult}`}>
            {lastResult === 'blackjack' ? '🃏 BJ' : lastResult}
        </span>
    ) : null;

    return (
        <div className={`betting-panel ${visible ? 'betting-panel--visible' : ''}`}>

            {/* Уведомление о смене стола */}
            {tableNotice && (
                <div className="switch-table-notice">
                    🎲 Вы перешли на другой стол — новая колода, новый счёт!
                </div>
            )}

            {/* Башенка — снаружи панели, в потоке, над тёмным фоном */}
            <div className="bet-heap-float">
                <ChipsHeap />
            </div>

            {/* Тёмная панель с суммой, кнопками и фишками */}
            <div className="bet-panel-body">
                <div className="bet-center">
                    <div className="bet-amount-row">
                        <span className="bet-label-inline">BET {resultLabel}</span>
                        <span className={`bet-amount ${bet === 0 ? 'zero' : ''}`}>
                            ${bet.toLocaleString()}
                        </span>
                    </div>
                    <div className="bet-buttons">
                        <button
                            className="btn-clear"
                            onClick={() => dispatch(gameSlice.actions.clearBet())}
                            disabled={bet === 0}
                        >✕ Clear</button>
                        <button
                            className="btn-deal"
                            onClick={handleDeal}
                            disabled={bet <= 0 || bet > bankroll}
                        >▶ Deal</button>
                    </div>
                    <div className="bet-secondary-actions">
                        <button
                            className="btn-switch-table"
                            onClick={handleSwitchTable}
                            title="Перейти на другой стол с новой колодой"
                        >
                            🚶 Другой стол
                        </button>
                    </div>
                    {biddingStrategy && showBiddingAdvice && (
                        <div className="bidding-advice-bar">
                            <span className="bidding-advice-strat">{BIDDING_STRATEGY_LABELS[biddingStrategy]}:</span>
                            <span className="bidding-advice-amount">${biddingAdviceAmount?.toLocaleString()}</span>
                        </div>
                    )}
                </div>

                <div className="chips-tray">
                    <div className="chips-tray-inner">
                        {chipset.map(({ chipColor, value, label, isComplex }, idx) => (
                            <Chip
                                key={`chip-${idx}`}
                                color={chipColor}
                                value={value}
                                label={label}
                                isComplex={isComplex}
                                disabled={bet + value > bankroll}
                            />
                        ))}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default BettingPanel;