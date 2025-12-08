import React from 'react'
import '../styles/Card.css'

const Card = ({ value, suit, label, style, count, face = true, showCount = true }) => {
    const cardName = `${label}-${suit}`;
    const imageSrc = `${process.env.PUBLIC_URL}/static/cards/${cardName}.png`;
    const shirtSrc = `${process.env.PUBLIC_URL}/static/shirt.png`;

    return (
        <div>
            <img
                src={face ? imageSrc : shirtSrc}
                alt={`${label} ${suit}`}
                className='card'
                style={{ ...style }}
                onError={(e) => {
                    console.error(`Карта ${cardName} не найдена`);
                    e.target.style.display = 'none';
                }}
            />
            {face && showCount && <div className="card-count" style={{ ...style }}>{count}</div>}
        </div>

    );
};

export default Card