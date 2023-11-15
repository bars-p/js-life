let rows, cols, boardSize;
let xMax, yMax;

let canvas = null;
let ctx = null;
let sizeBtn = null;

const magicValue = 42;
const controlsWidth = 300;

const population = 0;
const trend = 0;

const setupView = () => {
  xMax = window.innerWidth;
  yMax = window.innerHeight;

  console.log("Window Size:", xMax, "by", yMax);

  drawBoard();
};

const setBoardSize = (nRows = 0, nCols = 0) => {
  rows = nRows;
  cols = nCols;
  boardSize = rows * cols;

  console.log("Board Size:", rows, "by", cols);

  drawBoard();
};

const drawBoard = () => {
  console.log("🤡 Set the canvas the board");

  // Set the canvas size
  canvas.width = xMax - controlsWidth - magicValue * 2 - 2;
  canvas.height = yMax - magicValue * 3 - 6;

  ctx.font = "48px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(
    "Set board size and Start!",
    canvas.width / 2,
    canvas.height / 2
  );
  if (rows && cols) {
    // Draw the board by values set
    console.log("Drawing the board");
  }
};

const processSetSizeClick = () => {
  setBoardSize(10, 10);
};

const initialize = () => {
  console.log("🐸 Initializing");

  window.addEventListener("resize", setupView);
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  sizeBtn = document.getElementById("set-size");
  sizeBtn.addEventListener("click", processSetSizeClick);

  // canvas.style.display = "none";

  setupView();

  console.log("Pop:", population);
  console.log("Canvas:", canvas.height, canvas.width);
  console.log("CTX:", ctx);
};

initialize();
