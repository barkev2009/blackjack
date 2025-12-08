import React from 'react'
import '../styles/GameContainer.css'
import DealerContainer from './DealerContainer'
import PlayerContainer from './PlayerContainer'
import { useGameContext } from '../context/GameContext'

const GameContainer = () => {

    const { runningCount } = useGameContext();

    return (
        <div className='game-container'>
            <div className="running-count">{runningCount}</div>
            <DealerContainer />
            <PlayerContainer />
        </div>
    )
}

export default GameContainer