import React from 'react'
import '../styles/DealerContainer.css'
import CardHand from './CardHand'
import { useGameContext } from '../context/GameContext'

const DealerContainer = () => {

    const { dealerState } = useGameContext();

    return (
        <div className='dealer-container'>
            <div className="dealer-score" style={{position: 'absolute', left: '0'}}>{dealerState.scoreFormatted}</div>
            <CardHand cards={dealerState.hand} />
        </div>
    )
}

export default DealerContainer