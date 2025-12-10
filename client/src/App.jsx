import React from 'react';
import './styles/App.css';
import ChipsContainer from './components/ChipsContainer';
import GameContainer from './components/GameContainer';
import Header from './components/Header';
import { useGameContext } from './context/GameContext';
import { GAME_STATES } from './const';

function App() {

  const { gamePhase } = useGameContext();

  return (
    <div className="App">
      <Header />
      {gamePhase !== GAME_STATES.BETTING && <GameContainer />}
      <ChipsContainer />
    </div>
  );
}

export default App;