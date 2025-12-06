import React from 'react';
import '../styles/BasicStrategy.css';

const BasicStrategy = ({ advice, onClose, isSplit = false }) => {
    return (
        <div className="basic-strategy-overlay">
            <div className="basic-strategy-modal">
                <div className="strategy-header">
                    <h3>📊 {isSplit ? 'Стратегия сплита' : 'Базовая стратегия'}</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                <div className="strategy-content">
                    <div className="advice">
                        <strong>Рекомендация:</strong>
                        <span className="advice-text">{advice}</span>
                    </div>
                    {isSplit && (
                        <div className="split-rules">
                            <p><strong>Важные правила сплита:</strong></p>
                            <ul>
                                <li>Ставка удваивается (еще одна ставка на вторую руку)</li>
                                <li>Каждая рука играется отдельно</li>
                                <li><strong>После сплита НЕ может быть блэкджека</strong> (даже если 21 очко)</li>
                                <li>21 очко после сплита выплачивается 1:1, не 3:2</li>
                                <li>После сплита можно делать Double Down на каждой руке</li>
                                <li>Повторный сплит (re-split) обычно не разрешен в базовой стратегии</li>
                            </ul>
                        </div>
                    )}
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