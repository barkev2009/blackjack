import { createContext, useContext, useEffect, useState } from "react";
import { createShoe } from "../utils";

const GameContext = createContext();

export const useGameContext = () => {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error('useGame must be used within GameProvider');
    }
    return context;
};

export const GameProvider = ({ children }) => {
    const [shoe, setShoe] = useState(createShoe());
    const [dealerHand, setDealerHand] = useState([]);
    const [playerHand, setPlayerHand] = useState([]);
    const [dealerScore, setDealerScore] = useState([0, 0]); // [ACE = 1, ACE = 11]
    const [playerScore, setPlayerScore] = useState([0, 0]); // [ACE = 1, ACE = 11]
    const [dealerScoreFormatted, setDealerScoreFormatted] = useState('');
    const [playerScoreFormatted, setPlayerScoreFormatted] = useState('');

    // НЕ ИСПОЛЬЗОВАТЬ в циклах
    const drawOneCard = () => {
        const card = shoe[0];
        setShoe(prev => [...prev.slice(1)]);
        return card;
    }

    const determineScore = (stateFunction, stateFunctionFormatted, card) => {
        if (card.label === 'A') {
            stateFunction(prev => {
                let [ace1, ace11] = [prev[0] + 1, prev[1] + 11];
                // Если ace11 перебрал, используем ace1 для обоих
                if (ace11 >= 21) {
                    ace11 = ace1;
                }
                if (ace1 === ace11) {
                    stateFunctionFormatted(_ => ace1);
                } else {
                    stateFunctionFormatted(_ => `${ace1} / ${ace11}`);
                }
                return [ace1, ace11];
            });
        } else {
            stateFunction(prev => {
                let [ace1, ace11] = [prev[0] + card.value, prev[1] + card.value];
                // Если ace11 перебрал, используем ace1 для обоих
                if (ace11 >= 21) {
                    ace11 = ace1;
                }
                if (ace1 === ace11) {
                    stateFunctionFormatted(_ => ace1);
                } else {
                    stateFunctionFormatted(_ => `${ace1} / ${ace11}`);
                }
                return [ace1, ace11];
            });
        }
    };

    useEffect(
        () => {
            console.log(shoe);
            const currentShoe = [...shoe];

            setDealerHand(prev => [...prev, currentShoe[0]]);
            setDealerHand(prev => [...prev, { ...currentShoe[1], face: false }]);
            determineScore(setDealerScore, setDealerScoreFormatted, currentShoe[0]);

            setPlayerHand(prev => [...prev, currentShoe[2]]);
            setPlayerHand(prev => [...prev, currentShoe[3]]);
            determineScore(setPlayerScore, setPlayerScoreFormatted, currentShoe[2]);
            determineScore(setPlayerScore, setPlayerScoreFormatted, currentShoe[3]);

            setShoe(prev => [...prev.slice(4)]);
        }, []
    );

    const hit = () => {
        const card = drawOneCard();
        setPlayerHand(prev => [...prev, card]);
        determineScore(setPlayerScore, setPlayerScoreFormatted, card);
    }

    const doubleDown = () => {
        hit();
        stand();
    }

    const stand = () => {
        // Открываем вторую карту дилера
        const secondCard = dealerHand[1];
        setDealerHand(prev => [prev[0], { ...prev[1], face: true }]);
        determineScore(setDealerScore, setDealerScoreFormatted, secondCard);

        const interval = setInterval(() => {
            // Получаем актуальный счет дилера
            setDealerScore(prevScore => {
                // Проверяем soft 17: если туз считается как 11 и сумма 17, дилер должен брать еще
                const isSoft17 = prevScore[1] === 17 && prevScore[0] !== prevScore[1];

                // Останавливаемся если: больше 17 ИЛИ ровно 17 и это не soft 17
                if (prevScore[0] > 17 || prevScore[1] > 17 ||
                    (prevScore[1] === 17 && !isSoft17)) {
                    clearInterval(interval);
                    return prevScore;
                }

                // Получаем текущую колоду
                setShoe(prevShoe => {
                    if (prevShoe.length === 0) {
                        clearInterval(interval);
                        return prevShoe;
                    }

                    const card = prevShoe[0];
                    const newShoe = prevShoe.slice(1);

                    // Добавляем карту дилеру
                    setDealerHand(prevHand => [...prevHand, card]);
                    // Обновляем счет дилера с учетом НОВОЙ карты
                    determineScore(setDealerScore, setDealerScoreFormatted, card);

                    // Возвращаем обновленную колоду
                    return newShoe;
                });

                return prevScore;
            });
        }, 1000);

        // Очистка интервала при размонтировании
        return () => clearInterval(interval);
    };

    // Значение контекста
    const value = {
        // Состояния
        shoe,
        dealerHand,
        playerHand,
        dealerScore,
        playerScore,
        dealerScoreFormatted,
        playerScoreFormatted,

        // Функции
        hit,
        stand,
        doubleDown
    };

    return (
        <GameContext.Provider value={value}>
            {children}
        </GameContext.Provider>
    );
};