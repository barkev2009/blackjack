// 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000 
export const chipset = [
    {
        chipColor: 'violet',
        color: '#4a2b77',
        label: 5,
        value: 5,
        isComplex: false
    },
    {
        chipColor: 'blue',
        color: '#012450',
        label: 10,
        value: 10,
        isComplex: false
    },
    {
        chipColor: 'red',
        color: 'hsl(0, 69%, 45%)',
        label: 25,
        value: 25,
        isComplex: false
    },
    {
        chipColor: 'light-green',
        color: '#598300',
        label: 50,
        value: 50,
        isComplex: false
    },
    {
        chipColor: 'brown',
        color: '#540000',
        label: 100,
        value: 100,
        isComplex: false
    },
    {
        chipColor: 'violet',
        color: '#4a2b77',
        label: 250,
        value: 250,
        isComplex: true
    },
    {
        chipColor: 'blue',
        color: '#012450',
        label: 500,
        value: 500,
        isComplex: true
    },
    {
        chipColor: 'red',
        color: 'hsl(0, 69%, 45%)',
        label: '1K',
        value: 1000,
        isComplex: true
    },
    {
        chipColor: 'light-green',
        color: '#598300',
        label: '2.5K',
        value: 2500,
        isComplex: true
    },
    {
        chipColor: 'brown',
        color: '#540000',
        label: '5K',
        value: 5000,
        isComplex: true
    },
    // {
    //     chipColor: 'yellow',
    //     color: '#ffcf00',
    //     label: '10K',
    //     value: 10000
    // },
]

export const GAME_STATES = {
    BETTING: 'betting',
    INITIAL_GAME: 'initial',
    DEALER_TURN: 'dealer-turn',
    PLAYER_TURN: 'player-turn',
    GAME_OVER: 'game-over'
}

export const GAME_DECISIONS = {
    STAND: 'STAND',
    HIT: 'HIT',
    DOUBLE_DOWN: 'DOUBLE_DOWN / HIT',
    DOUBLE_DOWN_S: 'DOUBLE_DOWN / STAND',
    SPLIT: 'SPLIT',
}