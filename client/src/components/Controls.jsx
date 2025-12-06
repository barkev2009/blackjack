import React from 'react';
import '../styles/Controls.css';

const Controls = ({
    onHit,
    onStand,
    onDoubleDown,
    onSplit,
    showStrategy,
    canDoubleDown,
    canSplit
}) => {
    return (
        <div className="controls">
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
        </div>
    );
};

export default Controls;