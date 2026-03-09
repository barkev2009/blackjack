import React from 'react';
import '../styles/DealerContainer.css';
import CardHand from './CardHand';
import { useSelector } from 'react-redux';

const DealerContainer = () => {
    const dealerState = useSelector(state => state.game.dealerState);
    const showCardValues = useSelector(state => state.game.showCardValues);

    return (
        <div className="dealer-container">
            <div className="dealer-label">Dealer</div>
            <CardHand cards={dealerState.hand} showCardValues={showCardValues} />
            <div className="dealer-score">{dealerState.scoreFormatted}</div>
        </div>
    );
};

export default DealerContainer;
