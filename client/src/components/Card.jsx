import React from 'react'
import '../styles/Card.css'

const Card = ({ value, suit, label, style, face = true }) => {
    const cardName = `${label}-${suit}`;
    const imageSrc = `${process.env.PUBLIC_URL}/static/cards/${cardName}.png`;
    const shirtSrc = `${process.env.PUBLIC_URL}/static/shirt.png`;

    return (
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
    );
};

export default Card