import React from 'react';
import '../styles/Controls.css';

const Controls = ({
    gameStatus,
    onHit,
    onStand,
    onDoubleDown,
    onSplit,
    onNewGame,
    onReset,
    playerHand,
    playerBalance,
    bet,
    showStrategy,
    canDoubleDown,
    canSplit
}) => {
    return (
        <div className="controls">
            {gameStatus === 'betting' && (
                <button className="btn btn-primary" onClick={onNewGame}>
                    Начать игру (${bet})
                </button>
            )}

            {gameStatus === 'playing' && (
                <>
                    <button className="btn btn-success" onClick={onHit}>
                        Взять карту (Hit)
                    </button>
                    <button className="btn btn-warning" onClick={onStand}>
                        Остановиться (Stand)
                    </button>
                    {canDoubleDown && (
                        <button className="btn btn-info" onClick={onDoubleDown}>
                            Удвоить (Double)
                        </button>
                    )}
                    {canSplit && (
                        <button className="btn btn-purple" onClick={onSplit}>
                            Разделить (Split)
                        </button>
                    )}
                    <button className="btn btn-secondary" onClick={showStrategy}>
                        Стратегия
                    </button>
                </>
            )}

            {gameStatus === 'ended' && (
                <>
                    <button className="btn btn-primary" onClick={onReset}>
                        Новая ставка
                    </button>
                </>
            )}
        </div>
    );
};

export default Controls;