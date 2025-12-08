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
    const [runningCount, setRunningCount] = useState(0);

    // Эффект для проверки перебора игрока
    useEffect(() => {
        if (playerScore[0] >= 21) {
            // Автоматически показываем карты дилера при переборе
            const card = dealerHand[1];
            setDealerHand(prev => [prev[0], { ...prev[1], face: true }]);
            determineScore(setDealerScore, setDealerScoreFormatted, card);
        }
    }, [playerScore]);

    // НЕ ИСПОЛЬЗОВАТЬ в циклах
    const drawOneCard = () => {
        const card = shoe[0];
        setShoe(prev => [...prev.slice(1)]);
        return card;
    }

    const determineScore = (stateFunction, stateFunctionFormatted, card) => {
        stateFunction(prev => {
            // Берем текущие значения
            let currentAce1 = prev[0];
            let currentAce11 = prev[1];

            // Добавляем новую карту
            if (card.label === 'A') {
                // Для туза: добавляем 1 к ace1 и 11 к ace11
                currentAce1 += 1;
                currentAce11 += 11;
            } else {
                currentAce1 += card.value;
                currentAce11 += card.value;
            }

            // Проверяем, можем ли мы использовать ace11
            // Если ace11 > 21, пытаемся преобразовать один из тузов из 11 в 1
            if (currentAce11 > 21) {
                // Разница между ace11 и ace1 показывает, сколько у нас "лишних" 10-ок от тузов
                const extraTens = (currentAce11 - currentAce1) / 10;

                if (extraTens > 0) {
                    // Преобразуем один туз из 11 в 1 (вычитаем 10)
                    currentAce11 -= 10;

                    // Если все еще > 21 и есть другие тузы как 11, преобразуем еще
                    if (currentAce11 > 21 && extraTens > 1) {
                        currentAce11 -= 10;
                    }

                    // Если после преобразований все еще > 21, используем ace1
                    if (currentAce11 > 21) {
                        currentAce11 = currentAce1;
                    }
                } else {
                    // Нет тузов как 11, просто используем ace1
                    currentAce11 = currentAce1;
                }
            }

            // Если достигли ровно 21, оба значения должны быть 21
            if (currentAce11 === 21) {
                currentAce1 = 21;
            }

            // Форматируем для отображения
            if (currentAce1 === currentAce11) {
                stateFunctionFormatted(currentAce1.toString());
            } else {
                stateFunctionFormatted(`${currentAce1} / ${currentAce11}`);
            }

            return [currentAce1, currentAce11];
        });
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
        hit(); // Берем одну карту

        // После hit, если игрок не перебрал, запускаем stand
        // Проверка на перебор произойдет в useEffect выше
        if (playerScore[0] <= 21) {
            stand();
        }
    }

    const stand = () => {
        // Открываем вторую карту дилера
        const secondCard = dealerHand[1];
        // if (dealerScore[1] + secondCard.value === 21) {
        //     setDealerHand(prev => [prev[0], { ...prev[1], face: true }]);
        //     setDealerScore([21, 21]);
        //     setDealerScoreFormatted('21');
        //     return
        // }
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
                    setDealerScore(prev => {
                        let [ace1, ace11] = [prev[0], prev[1]];
                        // Если ace11 перебрал, используем ace1 для обоих
                        ace1 = ace11;
                        setDealerScoreFormatted(_ => ace1);
                        return [ace1, ace11];
                    })
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
        runningCount,

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