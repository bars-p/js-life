const magicValue = 42;
const controlsWidth = 300;

const cellFull = "black";
const cellEmpty = "white";
const cellStroke = "grey";

let canvas = null;
let ctx = null;
let sizeBtn = null;
let actionBtn = null;

// let macroMode = true;

let rows, cols, boardSize;
let xMax, yMax;
let cellSide;
let rowShift, colShift;

let population = 0;
let trend = 0;

let cells = null;
let nextCells = null;

const setupView = () => {
  xMax = window.innerWidth;
  yMax = window.innerHeight;

  console.log("Window Size:", xMax, "by", yMax);

  setBoardSize(rows, cols);
};

const setBoardSize = (nRows = 0, nCols = 0) => {
  rows = nRows;
  cols = nCols;
  boardSize = rows * cols;

  console.log("Board Size:", rows, "by", cols, "Total:", boardSize);

  createBoard();
  drawBoard();
};

const createBoard = () => {
  console.log("🤡 Set the canvas and create the board");

  // Set the canvas size
  canvas.width = xMax - controlsWidth - magicValue * 2 - 2;
  canvas.height = yMax - magicValue * 3 - 6;

  ctx.font = "32px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(
    "Set board size, population and Start!",
    canvas.width / 2,
    canvas.height / 2
  );
  if (rows && cols) {
    // Create the board by values set
    console.log("Drawing the board");
    sizeBtn.innerText = "Reset";
    // macroMode = canvas.height > cols && canvas.width > rows; // FIXME:
    // FIXME: Delete MacroMode trails
    // if (true) {
    // Board size bigger then cells number - one cell covers several pixels
    console.log("MacroCells mode");
    const rowsRatio = canvas.height / rows;
    const colsRatio = canvas.width / cols;

    colShift = 0;
    rowShift = 0;

    if (rowsRatio < colsRatio) {
      cellSide = rowsRatio;
      colShift = (canvas.width - cellSide * cols) / 2;
    } else {
      cellSide = colsRatio;
      rowShift = (canvas.height - cellSide * rows) / 2;
    }

    console.log("CellSide", cellSide);
    // } else {
    //   // One pixel covers several cells
    //   console.log("MicroCells mode");
    // }
  }

  // Create cells matrix
  if (!cells) {
    cells = Array.from({ length: rows }, () =>
      Array.apply(null, { length: cols }).map(Boolean.prototype.valueOf, false)
    );
    nextCells = Array.from({ length: rows }, () =>
      Array.apply(null, { length: cols }).map(Boolean.prototype.valueOf, false)
    );

    console.log("Cells created:", cells);
  }
};

const drawBoard = () => {
  if (!(rows && cols)) return;

  ctx.strokeStyle = "grey";
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let col = 0; col < cols; col++) {
    for (let row = 0; row < rows; row++) {
      drawCell(row, col);
    }
  }
};

const drawCell = (row, col) => {
  drawCellXY(
    colShift + col * cellSide,
    rowShift + row * cellSide,
    cellSide,
    cells[row][col]
  );
};

const drawCellXY = (x, y, size, filled) => {
  ctx.fillStyle = filled ? cellFull : cellEmpty;
  ctx.fillRect(x, y, size, size);
  // ctx.strokeRect(x, y, size - 1, size - 1);
};

const createRandomFirstGeneration = () => {
  if (!(cols && rows)) return;

  let density = Math.round(+document.getElementById("density").value);
  if (density == 0) {
    console.log("Density not set");
    return;
  }
  if (density > 100) {
    density = 100;
    document.getElementById("density").value = 100;
  }

  console.log("📱 Population create started");
  const started = performance.now();
  const rate = density / 100;

  console.log("🪙 Rate:", rate);
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      cells[row][col] = Boolean(Math.round(Math.random() - (0.5 - rate)));
    }
  }

  drawBoard();
  const genTime = performance.now() - started;
  console.log(
    "📱 Population create finished, took",
    (genTime / 1000).toFixed(2),
    "sec"
  );
};

const getCellValue = (row, col) => {
  // console.log("Get Cell Value (r, c):", row, col);
  // console.log(cells);
  let cellValue = -cells[row][col];
  for (let r = row - 1; r <= row + 1; r++) {
    const rIdx = r == rows ? 0 : r;
    for (let c = col - 1; c <= col + 1; c++) {
      const cIdx = c == cols ? 0 : c;
      cellValue += cells.at(rIdx).at(cIdx);
    }
  }

  return cellValue;
};

const calculateNextGeneration = () => {
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cellValue = getCellValue(row, col);

      // console.log(
      //   "Cell (r, c):",
      //   row,
      //   col,
      //   cells[row][col],
      //   "Value:",
      //   cellValue
      // );

      if (cells[row][col]) {
        // Live cell
        if (cellValue < 2 || cellValue > 3) nextCells[row][col] = false;
      } else {
        // Dead cell
        if (cellValue == 3) nextCells[row][col] = true;
      }
    }
  }
};

const updateCellsValues = () => {
  // TODO: Calculate next population
  // TODO: Compare current population with next population - trend

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      cells[row][col] = nextCells[row][col];
    }
  }
};

const processSetSizeClick = () => {
  const rowsNum = Math.round(+document.getElementById("rows").value);
  const colsNum = Math.round(+document.getElementById("cols").value);

  console.log("Entered", rowsNum, colsNum);
  cells = null;
  nextCells = null;
  setBoardSize(rowsNum, colsNum);
};

const processActionClick = () => {
  console.log("Action!");
  const started = performance.now();

  // console.log("Cell value (1, 1):", getCellValue(1, 1));
  // console.log("Cell value (1, 0):", getCellValue(1, 0));
  // console.log("Cell value (0, 1):", getCellValue(0, 1));
  // console.log("Cell value (0, 0):", getCellValue(0, 0));
  // console.log("Cell value (0, 5):", getCellValue(0, 5));

  calculateNextGeneration();
  updateCellsValues();
  drawBoard();

  const genTime = performance.now() - started;
  console.log("Generation time:", (genTime / 1000).toFixed(3));
};

const initialize = () => {
  console.log("🐸 Initializing");

  window.addEventListener("resize", setupView);
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  sizeBtn = document.getElementById("set-size");
  sizeBtn.addEventListener("click", processSetSizeClick);
  actionBtn = document.getElementById("action");
  actionBtn.addEventListener("click", processActionClick);
  document
    .getElementById("random")
    .addEventListener("click", createRandomFirstGeneration);

  setupView();
};

initialize();
