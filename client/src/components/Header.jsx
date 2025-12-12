import React from 'react'
import '../styles/Header.css'
import { useSelector } from 'react-redux';

const Header = () => {

    const { bankroll, runningCount, shoe } = useSelector(state => state.game);

    return (
        <header>
            <div className="bankroll">{`Bankroll: ${bankroll.toLocaleString()}`}</div>
            <div className="running-count">{`Running count: ${runningCount}`}</div>
            <div className="true-count">{`True count: ${Math.floor(runningCount / (shoe.length / 52))} (${(runningCount / (shoe.length / 52)).toFixed(2)})`}</div>
        </header>
    )
}

export default Header