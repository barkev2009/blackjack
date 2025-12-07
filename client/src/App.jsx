import React from 'react';
import './styles/App.css';
import ChipsContainer from './components/ChipsContainer';
import GameContainer from './components/GameContainer';
import { GameProvider } from './context/GameContext';

function App() {
  return (
    <div className="App">
      <GameProvider>
        <GameContainer />
      </GameProvider>
      <ChipsContainer />
    </div>
  );
}

export default App;