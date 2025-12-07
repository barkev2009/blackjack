import React from 'react'
import '../styles/DealerContainer.css'
import CardHand from './CardHand'
import { useGameContext } from '../context/GameContext'

const DealerContainer = () => {

    const { dealerHand, dealerScoreFormatted } = useGameContext();

    return (
        <div className='dealer-container'>
            <div className="dealer-score" style={{position: 'absolute', left: '0'}}>{dealerScoreFormatted}</div>
            <CardHand cards={dealerHand} />
        </div>
    )
}

export default DealerContainer