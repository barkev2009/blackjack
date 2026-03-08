import React, { useEffect } from 'react';
import './styles/App.css';
import ChipsContainer from './components/ChipsContainer';
import GameContainer from './components/GameContainer';
import Header from './components/Header';
import { GAME_STATES } from './const';
import { useDispatch, useSelector } from 'react-redux';
import { determineGameResult } from './utils';

function App() {

  const gamePhase = useSelector(state => state.game.phase);
  const dispatch = useDispatch();

  useEffect(() => {
    if (gamePhase === GAME_STATES.GAME_OVER) {
      // determineGameResult(chipsState, gameState);
    }
  }, [gamePhase])

  return (
    <div className="App">
      <Header />
      {gamePhase !== GAME_STATES.BETTING && <GameContainer />}
      <ChipsContainer />
    </div>
  );
}

export default App;