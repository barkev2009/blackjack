import React from 'react';
import Card from './Card';
import SplitHand from './SplitHand';
import Controls from './Controls';
import Scoreboard from './Scoreboard';
import GameStatus from './GameStatus';
import BasicStrategy from './BasicStrategy';
import '../styles/GameTable.css';

const GameTable = ({
    dealerHand,
    playerHand,
    playerScore,
    dealerScore,
    splitHands,
    splitScores,
    splitBets,
    currentSplitHand,
    isSplitActive,
    gameStatus,
    message,
    actions,
    showStrategy,
    strategyAdvice,
    showStrategyModal,
    onCloseStrategy
}) => {
    const renderPlayerArea = () => {
        if (isSplitActive) {
            return (
                <div className="split-area">
                    <h2>Сплит руки</h2>
                    <div className="split-hands-container">
                        {splitHands.map((hand, index) => (
                            <SplitHand
                                key={index}
                                hand={hand}
                                score={splitScores[index]}
                                handIndex={index}
                                isActive={currentSplitHand === index && gameStatus === 'split-playing'}
                                isCompleted={currentSplitHand > index || gameStatus !== 'split-playing'}
                                bet={splitBets[index]}
                            />
                        ))}
                    </div>
                </div>
            );
        }

        return (
            <div className="player-area">
                <h2>Игрок</h2>
                <div className="hand">
                    {playerHand.map((card, index) => (
                        <Card key={index} card={card} hidden={false} />
                    ))}
                </div>
                <Scoreboard score={playerScore} label="Очки:" />
            </div>
        );
    };

    return (
        <>
            <div className="dealer-area">
                <h2>Дилер</h2>
                <div className="hand">
                    {dealerHand.map((card, index) => (
                        <Card key={index} card={card} hidden={card.isHidden} />
                    ))}
                </div>
                <Scoreboard score={dealerScore} label="Очки:" />
            </div>

            {/* <div className="game-center">
                <GameStatus message={message} />
            </div> */}

            {renderPlayerArea()}

            {(gameStatus === 'playing' || gameStatus === 'split-playing') && (
                <Controls
                    onHit={actions.hit}
                    onStand={actions.stand}
                    onDoubleDown={actions.doubleDown}
                    onSplit={actions.split}
                    showStrategy={showStrategy}
                    canDoubleDown={actions.canDoubleDown}
                    canSplit={actions.canSplit}
                />
            )}

            {showStrategyModal && strategyAdvice && (
                <BasicStrategy
                    advice={strategyAdvice}
                    onClose={onCloseStrategy}
                    isSplit={isSplitActive}
                />
            )}
        </>
    );
};

export default GameTable;