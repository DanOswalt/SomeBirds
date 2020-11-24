const randBetween = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

const getColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const STATE = {
  MOVE: 'move',
  PAUSE: 'pause',
  SLEEP: 'sleep',
};

const DIRECTION = {
  LEFT: 'left',
  RIGHT: 'right',
};

const DAY_LENGTH = 300;
const NIGHT_BEGINS = DAY_LENGTH * 0.6;
const NIGHT_ENDS = DAY_LENGTH * 0.9;

const BODY_COLORS = [
  { primary: '#666', secondary: '#444' },
  { primary: 'coral', secondary: 'tomato' },
  { primary: 'DARKTURQUOISE', secondary: 'TEAL' },
];

const EYE_COLORS = [
  'black',
  'black',
  'black',
  'black',
  'black',
  'black',
  'TEAL',
  'TEAL',
  'TEAL',
  'TAN',
  'red',
];

const BEAK_COLORS = [
  'gold',
  'gold',
  'gold',
  'PERU',
  'PERU',
  'PERU',
  'black',
  'black',
  'black',
  'pink',
];
