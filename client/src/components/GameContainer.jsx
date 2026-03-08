import React, { useEffect } from 'react'
import '../styles/GameContainer.css'
import DealerContainer from './DealerContainer'
import PlayerContainer from './PlayerContainer'
import { useDispatch, useSelector } from 'react-redux'
import { dealerTurnAsync } from '../game/game.thunks'

const GameContainer = () => {

    const dispatch = useDispatch();
    const playerStates = useSelector(state => state.game.playerStates);

    useEffect(function startDealerTurnEffect() { if (playerStates.every(state => state.isOver)) { dispatch(dealerTurnAsync()) } }, [playerStates, dispatch]);

    return (
        <div className='game-container'>
            <DealerContainer />
            <div className="player-containers">
                {
                    playerStates.map((playerState, idx) => <PlayerContainer key={`player-cont-${idx}`} playerState={playerState} handIndex={idx} playerIndex={idx} />)
                }
            </div>
        </div>
    )
}

export default GameContainer