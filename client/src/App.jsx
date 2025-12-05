import React from 'react';
import BlackjackTable from './components/BlackjackTable';
import './styles/App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>♠️ Blackjack ♥️</h1>
        <p>Используйте базовую стратегию для лучших результатов</p>
      </header>

      <main>
        <BlackjackTable />
      </main>

      <footer>
        <div className="rules">
          <h3>Правила Blackjack:</h3>
          <ul>
            <li>Цель: набрать ближе к 21, чем дилер</li>
            <li>Туз = 1 или 11 очков</li>
            <li>Картинки = 10 очков</li>
            <li>Дилер берет карты до 17</li>
            <li>Blackjack выплачивается 3:2</li>
            <li>Double: удвоить ставку, взять 1 карту</li>
            <li>Split: разделить пару на 2 руки</li>
          </ul>
        </div>
      </footer>
    </div>
  );
}

export default App;