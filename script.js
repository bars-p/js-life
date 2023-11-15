let rows, cols, boardSize;
let xMax, yMax;
let cellSide;
let xShift, yShift;

let canvas = null;
let ctx = null;
let sizeBtn = null;

let macroMode = true;

const magicValue = 42;
const controlsWidth = 300;

const cellFull = 'black';
const cellEmpty = 'white';
const cellStroke = 'grey';

let population = 0;
let trend = 0;

const setupView = () => {
  xMax = window.innerWidth;
  yMax = window.innerHeight;

  console.log('Window Size:', xMax, 'by', yMax);

  drawBoard();
};

const setBoardSize = (nRows = 0, nCols = 0) => {
  rows = nRows;
  cols = nCols;
  boardSize = rows * cols;

  console.log('Board Size:', rows, 'by', cols, 'Total:', boardSize);

  drawBoard();
};

const drawCell = (x, y, size, filled) => {
  ctx.fillStyle = filled ? cellFull : cellEmpty;
  ctx.fillRect(x, y, size, size);
  ctx.strokeRect(x, y, size - 1, size - 1);
};

const drawBoard = () => {
  console.log('🤡 Set the canvas the board');

  // Set the canvas size
  canvas.width = xMax - controlsWidth - magicValue * 2 - 2;
  canvas.height = yMax - magicValue * 3 - 6;

  ctx.font = '48px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(
    'Set board size and Start!',
    canvas.width / 2,
    canvas.height / 2
  );
  if (rows && cols) {
    // Draw the board by values set
    console.log('Drawing the board');
    macroMode = canvas.height > cols && canvas.width > rows;
    if (macroMode) {
      // Board size bigger then cells number - one cell covers several pixels
      console.log('MacroCells mode');
      const rowsRatio = canvas.height / rows;
      const colsRatio = canvas.width / cols;

      xShift = 0;
      yShift = 0;

      if (rowsRatio < colsRatio) {
        cellSide = rowsRatio;
        xShift = (canvas.width - cellSide * cols) / 2;
      } else {
        cellSide = colsRatio;
        yShift = (canvas.height - cellSide * rows) / 2;
      }

      console.log('CellSide', cellSide);

      ctx.strokeStyle = 'grey';
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
          drawCell(
            xShift + x * cellSide,
            yShift + y * cellSide,
            cellSide,
            false
          );
        }
      }
    } else {
      // One pixel covers several cells
      console.log('MicroCells mode');
    }
  }
};

const processSetSizeClick = () => {
  // TODO: Get values from inputs
  setBoardSize(10, 10);

  // TODO: Restart after board size reset

  // TODO: Change rhe BTN title to "Reset size"
};

const initialize = () => {
  console.log('🐸 Initializing');

  window.addEventListener('resize', setupView);
  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');
  sizeBtn = document.getElementById('set-size');
  sizeBtn.addEventListener('click', processSetSizeClick);

  // canvas.style.display = "none";

  setupView();

  console.log('Pop:', population);
  console.log('Canvas:', canvas.height, canvas.width);
  console.log('CTX:', ctx);
};

initialize();
