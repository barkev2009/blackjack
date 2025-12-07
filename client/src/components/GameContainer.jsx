import React from 'react'
import '../styles/GameContainer.css'
import DealerContainer from './DealerContainer'
import PlayerContainer from './PlayerContainer'

const GameContainer = () => {

    return (
        <div className='game-container'>
            <DealerContainer />
            <PlayerContainer />
        </div>
    )
}

export default GameContainer