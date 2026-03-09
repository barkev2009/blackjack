import React, { useState } from 'react';
import './styles/App.css';
import GameTable from './components/GameTable';
import SettingsScreen from './components/SettingsScreen';
import SimulationScreen from './components/SimulationScreen';
import Header from './components/Header';
import DevShoePanel from './components/DevShoePanel';
import { useSelector } from 'react-redux';
import CardPreloader from './components/CardPreloader';

function App() {
    const showShoeDev = useSelector(state => state.game.showShoeDev);
    const [activeScreen, setActiveScreen] = useState('game');

    return (
        <div className="App">
            <CardPreloader />
            <Header activeScreen={activeScreen} setActiveScreen={setActiveScreen} />
            {activeScreen === 'settings' && <SettingsScreen />}
            {activeScreen === 'simulation' && <SimulationScreen />}
            {activeScreen === 'game' && <GameTable />}
            {showShoeDev && <DevShoePanel />}
        </div>
    );
}

export default App;
