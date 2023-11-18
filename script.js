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

let genCounter = 0;
let population = 0;
let nexPopulation = 0;

let cells = null;
let nextCells = null;

let inAction = false;
let actionProcess = null;

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
  }

  // Create cells matrix
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
      } else {
        // Dead cell
        if (cellValue == 3) nextCells[row][col] = true;
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
  if (!population) {
    console.log("Population unset");
    return;
  }

  if (inAction) {
    inAction = false;
    clearInterval(actionProcess);
    toggleButtonsState(false);
    actionBtn.innerText = "Start";
    actionBtn.classList.remove("pause");
    actionBtn.classList.add("ready");
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

  // TODO: Log Event
  const delta = nexPopulation - population;
  const rate = ((100 * delta) / population).toFixed(2);
  let trendInfo = null;

  // console.log("Pop", population, "NextPop", nexPopulation);

  if (delta == 0) {
    // TODO: Population stable
    trendInfo = `(<span style="color:orange;">Same.</span>)`;
  } else if (delta > 0) {
    // TODO: Population grows
    trendInfo = `(<span style="color:green;"><strong>+${rate}%</strong></span>)`;
  } else {
    // TODO: Population declines
    trendInfo = `(<span style="color:red;"><strong>${rate}%</strong></span>)`;
  }

  logMessage(
    `Gen. ${genCounter.toLocaleString("ru-RU")}: <strong>${(
      genTime / 1000
    ).toFixed(
      3
    )}</strong> sec. Pop: <strong>${nexPopulation}</strong> ${trendInfo}`
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
  document.getElementById("draw").disabled = isDisabled;
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

const initialize = () => {
  console.log("🐸 Initializing");
  window.addEventListener("resize", setupView);
  sizeBtn.addEventListener("click", processSetSizeClick);
  actionBtn.addEventListener("click", processActionClick);
  document
    .getElementById("random")
    .addEventListener("click", createRandomFirstGeneration);

  setupView();
  displayPopulation();
  toggleActionButton(true);
};

initialize();
