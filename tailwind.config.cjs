/** @type {import('tailwindcss').Config} */

import {createThemes} from "tw-colors";

export const colors = {
    black90: '#191919',
    black70: '#494949',
    black50: '#818181',
    black25: '#B2B2B2',
    black12: '#DFDFDF',
    black8: '#F2F2F2',
    black3: '#F7F7F7',
    black0: '#FFFFFF',
    white: '#FFFFFF',
    white100: '#FFFFFF', // 这个无 dark 映射
    white70: 'rgba(255, 255, 255, .7)',
    white50: 'rgba(255, 255, 255, .5)',
    white30: 'rgba(255, 255, 255, .3)',
    white10: 'rgba(255, 255, 255, .1)',
    brown100: '#9D653D',
    brown70: '#B39470',
    brown50: '#B7A568',
    brown30: '#D6CCAA',
    brown10: '#F2E7D7',
    brown3: '#FFFDFA',
}


export const darkColors = {
    black90: '#FFFFFF',
    black70: '#AEADB3',
    black50: '#87878C',
    black25: '#626166',
    black12: '#3B3B40',
    black8: '#3B3B40',
    black3: '#2F2F33',
    black0: '#232326',
    white: '#232227',
};

module.exports = {
    content: ['./src/**/*.{js,jsx,ts,tsx}', './*.html'],
    darkMode: 'media',
    mode: 'jit',
    plugins: [ 
        require('tailwind-scrollbar'),
        createThemes(
            {
                dark: {...darkColors},
                light: {...colors}
            },
        )],

};
