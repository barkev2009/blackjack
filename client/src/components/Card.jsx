import React from 'react';
import '../styles/Card.css';

const Card = ({ value, suit, label, style, count, face = true, showCount = false, animIndex = 0, isClearing = false, isDealing = false }) => {
    const cardName = `${label}-${suit}`;
    const imageSrc = `${process.env.PUBLIC_URL}/static/cards/${cardName}.png`;
    const shirtSrc = `${process.env.PUBLIC_URL}/static/shirt.png`;

    let className = 'card-wrap';
    let animStyle = {};

    if (isClearing) {
        className += ' card-clearing';
        animStyle = { animationDelay: `${animIndex * 40}ms` };
    } else if (isDealing) {
        className += ' card-dealing';
        animStyle = { animationDelay: `${animIndex * 120}ms` };
    }

    return (
        <div className={className} style={{ position: 'absolute', ...style, ...animStyle }}>
            <img
                src={face ? imageSrc : shirtSrc}
                alt={face ? `${label} of ${suit}` : 'card back'}
                className="card"
                onError={(e) => { e.target.style.display = 'none'; }}
            />
            {face && showCount && (
                <div className="card-count-badge">{count > 0 ? `+${count}` : count}</div>
            )}
        </div>
    );
};

export default Card;
