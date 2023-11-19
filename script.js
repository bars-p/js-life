const magicValue = 42;
const controlsWidth = 300;

const cellFull = "black";
const cellEmpty = "white";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const sizeBtn = document.getElementById("set-size");
const actionBtn = document.getElementById("action");
const popInfo = document.getElementById("population");
const logger = document.getElementById("logger");

let rows, cols, boardSize;
let xMax, yMax;
let cellSide;
let rowShift, colShift;
let boardTopLeftX, boardTopLeftY;
let boardDownRightX, boardDownRightY;

let genCounter = 0;
let population = 0;
let nexPopulation = 0;

let cells = null;
let nextCells = null;

let inAction = false;
let actionProcess = null;
let inDrawing = false;
let drawnRow = null;
let drawnCol = null;

const setupView = () => {
  xMax = window.innerWidth;
  yMax = window.innerHeight;

  setBoardSize(rows, cols);
};

const setBoardSize = (nRows = 0, nCols = 0) => {
  rows = nRows;
  cols = nCols;
  boardSize = rows * cols;

  createBoard();
  drawBoard();
};

const createBoard = () => {
  canvas.width = xMax - controlsWidth - magicValue * 2 - 2;
  canvas.height = yMax - magicValue * 3 - 6;

  ctx.font = "32px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(
    "Set board, Generate or Draw population and Start!",
    canvas.width / 2,
    canvas.height / 2
  );
  displayPopulation();

  if (rows && cols) {
    // Create the board by values set
    sizeBtn.innerText = "Reset";
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
    const { x, y } = canvas.getBoundingClientRect();
    boardTopLeftX = x + colShift;
    boardTopLeftY = y + rowShift;
    boardDownRightX = boardTopLeftX + cols * cellSide;
    boardDownRightY = boardTopLeftY + rows * cellSide;
  }

  if (!cells) {
    cells = Array.from({ length: rows }, () =>
      Array.apply(null, { length: cols }).map(Boolean.prototype.valueOf, false)
    );
    nextCells = Array.from({ length: rows }, () =>
      Array.apply(null, { length: cols }).map(Boolean.prototype.valueOf, false)
    );
  }
};

const drawBoard = () => {
  if (!(rows && cols)) return;

  // ctx.strokeStyle = "grey";
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
};

const createRandomFirstGeneration = () => {
  if (!(cols && rows)) return;

  let density = Math.round(+document.getElementById("density").value);

  const started = performance.now();
  const rate = density / 100;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      cells[row][col] = Boolean(Math.round(Math.random() - (0.5 - rate)));
    }
  }

  let total = 0;
  for (let r of cells) {
    for (let c of r) {
      total += c;
    }
  }
  population = total;

  drawBoard();
  const genTime = performance.now() - started;

  logMessage(
    `Initial state generated in <strong>${(genTime / 1000).toFixed(
      3
    )}</strong> seconds.`
  );

  displayPopulation();
  toggleActionButton(false);
};

const getCellValue = (row, col) => {
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
  let total = 0;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cellValue = getCellValue(row, col);

      if (cells[row][col]) {
        // Live cell
        if (cellValue < 2 || cellValue > 3) nextCells[row][col] = false;
        else nextCells[row][col] = cells[row][col];
      } else {
        // Dead cell
        if (cellValue == 3) nextCells[row][col] = true;
        else nextCells[row][col] = cells[row][col];
      }
      total += nextCells[row][col];
    }
  }

  nexPopulation = total;
};

const updateCellsValues = () => {
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      cells[row][col] = nextCells[row][col];
    }
  }
};

const processSetSizeClick = () => {
  const rowsNum = Math.round(+document.getElementById("rows").value);
  const colsNum = Math.round(+document.getElementById("cols").value);

  cells = null;
  nextCells = null;
  population = nexPopulation = genCounter = 0;

  setBoardSize(rowsNum, colsNum);

  toggleActionButton(true);

  logMessage(
    `Board created: <strong>${boardSize.toLocaleString(
      "ru-RU"
    )}</strong> cells.`
  );
};

const processActionClick = () => {
  if (!population && !inAction) {
    return;
  }

  if (inAction) {
    inAction = false;
    clearInterval(actionProcess);
    toggleButtonsState(false);
    actionBtn.innerText = "Start";
    actionBtn.classList.remove("pause");
    actionBtn.classList.add("ready");
    displayPopulation();
  } else {
    actionBtn.innerText = "Pause";
    actionBtn.classList.remove("ready");
    actionBtn.classList.add("pause");
    toggleButtonsState(true);
    inAction = true;
    actionProcess = setInterval(makeOneTurn, 200);
  }
};

const makeOneTurn = () => {
  const started = performance.now();

  calculateNextGeneration();
  updateCellsValues();
  displayPopulation();
  drawBoard();

  genCounter++;

  const genTime = performance.now() - started;

  const delta = nexPopulation - population;
  const rate = ((100 * delta) / population).toFixed(2);
  let trendInfo = null;

  if (delta < 0) {
    trendInfo = `(<span style="color:red;"><strong>${rate}%</strong></span>)`;
  } else if (delta > 0) {
    trendInfo = `(<span style="color:green;"><strong>+${rate}%</strong></span>)`;
  } else {
    trendInfo = `(<span style="color:orange;">Same</span>)`;
  }

  logMessage(
    `Gen. ${genCounter.toLocaleString("ru-RU")}: <strong>${(
      genTime / 1000
    ).toFixed(3)}</strong> sec. Pop: <strong>${nexPopulation.toLocaleString(
      "ru-RU"
    )}</strong> ${trendInfo}`
  );

  population = nexPopulation;
};

const displayPopulation = () => {
  const ratio = ((100 * population) / boardSize).toFixed(0);

  let popText = null;

  if (!boardSize) {
    popText = "---";
  } else {
    popText = `<strong>${population.toLocaleString(
      "ru-RU"
    )}</strong> (${ratio}%)`;
  }
  popInfo.innerHTML = popText;
};

const toggleButtonsState = (isDisabled) => {
  sizeBtn.disabled = isDisabled;
  document.getElementById("random").disabled = isDisabled;
  // document.getElementById("draw").disabled = isDisabled;
  document.getElementById("density").disabled = isDisabled;
};

const toggleActionButton = (isDisabled) => {
  actionBtn.disabled = isDisabled;
  if (isDisabled) {
    actionBtn.classList.remove("ready");
    actionBtn.classList.add("action-disabled");
  } else {
    actionBtn.classList.remove("action-disabled");
    actionBtn.classList.add("ready");
  }
};

const logMessage = (msg) => {
  const el = document.createElement("p");
  el.innerHTML = msg;
  logger.prepend(el);
};

const processCanvasClick = (e) => {
  const { row, col } = getCellRC(e.x, e.y);
  if (row != null && col != null) toggleCell(row, col);
};

const getCellRC = (x, y) => {
  let row = null;
  let col = null;

  if (
    x >= boardTopLeftX &&
    y >= boardTopLeftY &&
    x <= boardDownRightX &&
    y <= boardDownRightY
  ) {
    row = Math.floor((y - boardTopLeftY) / cellSide);
    col = Math.floor((x - boardTopLeftX) / cellSide);
  }

  return { row, col };
};

const toggleCell = (row, col) => {
  cells[row][col] = !cells[row][col];
  drawCell(row, col);
  if (cells[row][col]) {
    population++;
  } else {
    population--;
  }
  displayPopulation();
  if (population) {
    toggleActionButton(false);
  } else {
    toggleActionButton(true);
  }
};

const processCanvasMouseDown = () => {
  inDrawing = true;
};
const processCanvasMouseUp = () => {
  inDrawing = false;
  if (drawnRow != null && drawnRow != null) {
    toggleCell(drawnRow, drawnCol);
    drawnRow = drawnCol = null;
  }
};
const processCanvasMouseMove = (e) => {
  if (!inDrawing) return;

  const { row, col } = getCellRC(e.x, e.y);
  if (row != null && col != null && (row != drawnRow || col != drawnCol)) {
    toggleCell(row, col);
    drawnRow = row;
    drawnCol = col;
  }
};

const initialize = () => {
  window.addEventListener("resize", setupView);
  sizeBtn.addEventListener("click", processSetSizeClick);
  actionBtn.addEventListener("click", processActionClick);
  document
    .getElementById("random")
    .addEventListener("click", createRandomFirstGeneration);
  canvas.addEventListener("click", processCanvasClick);
  canvas.addEventListener("mousedown", processCanvasMouseDown);
  canvas.addEventListener("mouseup", processCanvasMouseUp);
  canvas.addEventListener("mousemove", processCanvasMouseMove);

  setupView();
  displayPopulation();
  toggleActionButton(true);
};

initialize();
