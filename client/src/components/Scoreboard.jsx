import React from 'react';
import '../styles/Scoreboard.css';

const Scoreboard = ({ score, label }) => {
    const getScoreClass = () => {
        if (score > 21) return 'score-danger';
        if (score === 21) return 'score-blackjack';
        if (score >= 17 && score <= 20) return 'score-safe';
        return '';
    };

    return (
        <div className="scoreboard">
            <div className="score-label">{label}</div>
            <div className={`score-value ${getScoreClass()}`}>
                {score || 0}
            </div>
        </div>
    );
};

export default Scoreboard;