import React, { useEffect } from 'react';
import './styles/App.css';
import ChipsContainer from './components/ChipsContainer';
import GameContainer from './components/GameContainer';
import Header from './components/Header';
import { GAME_STATES } from './const';
import { useDispatch, useSelector } from 'react-redux';
import { initializeRound } from './database/game.reducer';

function App() {

  const gamePhase = useSelector(state => state.game.phase);
  const dispatch = useDispatch();

  // useEffect(() => { dispatch(initializeRound()) }, []);

  return (
    <div className="App">
      <Header />
      {gamePhase !== GAME_STATES.BETTING && <GameContainer />}
      <ChipsContainer />
    </div>
  );
}

export default App;