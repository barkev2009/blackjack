import React from 'react'
import '../styles/CardHand.css'
import Card from './Card'

const CardHand = ({ cards }) => {
    return (
        <div className='card-hand' style={{ left: `calc(-${100 + 25 * (cards.length - 1)}px/ 2)` }}>
            {cards.map(({ value, suit, face, label, count }, idx) =>
                <Card
                    key={`card-${value}-${suit}-${idx}`}
                    label={label}
                    value={value}
                    suit={suit}
                    face={face}
                    count={count}
                    style={{ left: `${25 * idx}px` }}
                />)}
        </div>

    )
}

export default CardHand