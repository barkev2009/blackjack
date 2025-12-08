import React from 'react'

const ChipGradient = ({ color }) => {

    const id = `radial-pattern-${color}`
    switch (color) {
        case 'violet':
            return (
                <radialGradient xmlns="http://www.w3.org/2000/svg" id={id} gradientUnits="userSpaceOnUse" cx="0" cy="0" fx="0" fy="0" r="695.85" gradientTransform="matrix(1, 0, 0, 1, 905.685, 1059.2)">
                    <stop offset="0" stopColor="rgb(76.673889%, 62.954712%, 89.634705%)" stopOpacity="1" />
                    <stop offset="0.5" stopColor="rgb(52.659607%, 39.727783%, 67.980957%)" stopOpacity="1" />
                    <stop offset="1" stopColor="rgb(29.019165%, 16.862488%, 46.665955%)" stopOpacity="1" />
                </radialGradient>
            )
        case 'blue':
            return (
                <radialGradient xmlns="http://www.w3.org/2000/svg" id={id} gradientUnits="userSpaceOnUse" cx="0" cy="0" fx="0" fy="0" r="695.85" gradientTransform="matrix(1, 0, 0, 1, 2500, 1059.2)">
                    <stop offset="0" stopColor="rgb(5.046082%, 24.591064%, 48.440552%)" stopOpacity="1" />
                    <stop offset="0.5" stopColor="rgb(3.245544%, 20.53833%, 41.838074%)" stopOpacity="1" />
                    <stop offset="1" stopColor="rgb(0.392151%, 14.117432%, 31.37207%)" stopOpacity="1" />
                </radialGradient>
            )
        case 'red':
            return (
                <radialGradient xmlns="http://www.w3.org/2000/svg" id={id} gradientUnits="userSpaceOnUse" cx="0" cy="0" fx="0" fy="0" r="695.85" gradientTransform="matrix(1, 0, 0, 1, 4094.31, 2940.8)">
                    <stop offset="0" stopColor="rgb(98.400879%, 79.89502%, 0.0350952%)" stopOpacity="1" />
                    <stop offset="0.5" stopColor="rgb(90.950012%, 53.22876%, 9.249878%)" stopOpacity="1" />
                    <stop offset="1" stopColor="rgb(83.528137%, 26.66626%, 18.431091%)" stopOpacity="1" />
                </radialGradient>
            )
        case 'light-green':
            return (
                <radialGradient xmlns="http://www.w3.org/2000/svg" id={id} gradientUnits="userSpaceOnUse" cx="0" cy="0" fx="0" fy="0" r="695.85" gradientTransform="matrix(1, 0, 0, 1, 905.685, 2940.8)">
                    <stop offset="0" stopColor="rgb(72.782898%, 92.39502%, 0%)" stopOpacity="1" />
                    <stop offset="0.5" stopColor="rgb(52.705383%, 72.709656%, 0%)" stopOpacity="1" />
                    <stop offset="1" stopColor="rgb(32.940674%, 53.33252%, 0%)" stopOpacity="1" />
                </radialGradient>
            )
        case 'brown':
            return (
                <radialGradient xmlns="http://www.w3.org/2000/svg" id={id} gradientUnits="userSpaceOnUse" cx="0" cy="0" fx="0" fy="0" r="695.85" gradientTransform="matrix(1, 0, 0, 1, 2500, 2940.8)">
                    <stop offset="0" stopColor="rgb(83.821106%, 0%, 0%)" stopOpacity="1" />
                    <stop offset="0.5" stopColor="rgb(58.331299%, 0%, 0%)" stopOpacity="1" />
                    <stop offset="1" stopColor="rgb(32.940674%, 0%, 0%)" stopOpacity="1" />
                </radialGradient>
            )
        case 'yellow':
            return (
                <radialGradient xmlns="http://www.w3.org/2000/svg" id={id} gradientUnits="userSpaceOnUse" cx="0" cy="0" fx="0" fy="0" r="695.85" gradientTransform="matrix(1, 0, 0, 1, 4094.31, 1059.2)">
                    <stop offset="0" stopColor="rgb(83.557129%, 26.77002%, 18.39447%)" stopOpacity="1" />
                    <stop offset="0.5" stopColor="rgb(91.007996%, 53.436279%, 9.178162%)" stopOpacity="1" />
                    <stop offset="1" stopColor="rgb(98.431396%, 79.998779%, 0%)" stopOpacity="1" />
                </radialGradient>
            )
        default:
            return (
                <radialGradient xmlns="http://www.w3.org/2000/svg" id={id} gradientUnits="userSpaceOnUse" cx="0" cy="0" fx="0" fy="0" r="695.85" gradientTransform="matrix(1, 0, 0, 1, 905.685, 1059.2)">
                    <stop offset="0" stopColor="rgb(76.673889%, 62.954712%, 89.634705%)" stopOpacity="1" />
                    <stop offset="0.5" stopColor="rgb(52.659607%, 39.727783%, 67.980957%)" stopOpacity="1" />
                    <stop offset="1" stopColor="rgb(29.019165%, 16.862488%, 46.665955%)" stopOpacity="1" />
                </radialGradient>
            )
    }


}

export default ChipGradient