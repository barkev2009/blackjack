import React from 'react'
import '../styles/GameContainer.css'
import DealerContainer from './DealerContainer'
import PlayerContainer from './PlayerContainer'
import { useGameContext } from '../context/GameContext'

const GameContainer = () => {

    const { runningCount, playerStates } = useGameContext();

    return (
        <div className='game-container'>
            <div className="running-count">{runningCount}</div>
            <DealerContainer />
            <div className="player-containers">
                {
                    playerStates.map((playerState, idx) => <PlayerContainer key={`player-cont-${idx}`} playerState={playerState} handIndex={idx} />)
                }
            </div>
        </div>
    )
}

export default GameContainer