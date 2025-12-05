import React from 'react';
import '../styles/BasicStrategy.css';

const BasicStrategy = ({ advice, onClose }) => {
    return (
        <div className="basic-strategy-overlay">
            <div className="basic-strategy-modal">
                <div className="strategy-header">
                    <h3>📊 Базовая стратегия</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                <div className="strategy-content">
                    <div className="advice">
                        <strong>Рекомендация:</strong>
                        <span className="advice-text">{advice}</span>
                    </div>
                    <div className="strategy-tips">
                        <p><strong>Хит (Hit)</strong> - взять еще карту</p>
                        <p><strong>Стоять (Stand)</strong> - не брать карты</p>
                        <p><strong>Дабл (Double)</strong> - удвоить ставку, взять 1 карту</p>
                        <p><strong>Сплит (Split)</strong> - разделить пару на две руки</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BasicStrategy;