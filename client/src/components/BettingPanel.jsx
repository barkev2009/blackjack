import React from 'react';
import '../styles/BettingPanel.css';
import { useDispatch, useSelector } from 'react-redux';
import { gameSlice } from '../game/game.slice';
import { chipset } from '../const';
import { getBiddingAdvice, BIDDING_STRATEGY_LABELS } from '../utils';
import Chip from './Chip';
import ChipsHeap from './ChipsHeap';

const BettingPanel = ({ visible }) => {
    const dispatch = useDispatch();
    const { bet, bankroll, biddingStrategy, showBiddingAdvice, lastResult, baseUnit, runningCount, shoe } = useSelector(state => state.game);

    const trueCount = shoe.length > 0 ? runningCount / (shoe.length / 52) : 0;

    const handleDeal = () => {
        if (bet <= 0) return;
        dispatch(gameSlice.actions.initializeRound());
        dispatch(gameSlice.actions.initialBankrollDecrement());
    };

    const biddingAdviceAmount = biddingStrategy
        ? getBiddingAdvice(biddingStrategy, bankroll, bet || baseUnit, lastResult, baseUnit, runningCount, trueCount)
        : null;

    const resultLabel = lastResult ? (
        <span className={`last-result-badge ${lastResult}`}>
            {lastResult === 'blackjack' ? '🃏 BJ' : lastResult}
        </span>
    ) : null;

    return (
        <div className={`betting-panel ${visible ? 'betting-panel--visible' : ''}`}>

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
