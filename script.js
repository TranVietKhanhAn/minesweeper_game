// Minesweeper 10x5, 25 mines
const ROWS = 5;
const COLS = 10;
const MINES = 25;

let board = [];
let mineLocations = [];
let openedCount = 0;
let gameOver = false;

const boardDiv = document.getElementById('board');
const minesCountSpan = document.getElementById('mines-count');
const messageDiv = document.getElementById('message');
const resetBtn = document.getElementById('reset');

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function initBoard() {
    board = [];
    mineLocations = [];
    openedCount = 0;
    gameOver = false;
    messageDiv.textContent = "";

    boardDiv.innerHTML = "";
    minesCountSpan.textContent = "Mìn: " + MINES;

    // Tạo mảng vị trí mìn
    let positions = [];
    for (let r = 0; r < ROWS; r++)
        for (let c = 0; c < COLS; c++)
            positions.push([r, c]);
    shuffle(positions);
    mineLocations = positions.slice(0, MINES);

    // Khởi tạo bảng
    for (let r = 0; r < ROWS; r++) {
        board[r] = [];
        for (let c = 0; c < COLS; c++) {
            const cell = {
                mine: false,
                open: false,
                flagged: false,
                adjacent: 0,
                r, c
            };
            board[r][c] = cell;
        }
    }
    // Đặt mìn
    for (const [r, c] of mineLocations) {
        board[r][c].mine = true;
    }
    // Tính số mìn xung quanh
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            board[r][c].adjacent = countAdjacentMines(r, c);
        }
    }
    // Hiển thị bảng
    renderBoard();
}

function countAdjacentMines(r, c) {
    let count = 0;
    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            let nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
                if (board[nr][nc]?.mine) count++;
            }
        }
    }
    return count;
}

function renderBoard() {
    boardDiv.innerHTML = "";
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const cell = board[r][c];
            const cellDiv = document.createElement('div');
            cellDiv.className = "cell";
            cellDiv.dataset.r = r;
            cellDiv.dataset.c = c;

            if (cell.open) {
                cellDiv.classList.add('open');
                if (cell.mine) {
                    cellDiv.classList.add('mine');
                    cellDiv.textContent = "💣";
                } else if (cell.adjacent > 0) {
                    cellDiv.textContent = cell.adjacent;
                    cellDiv.style.color = getColor(cell.adjacent);
                }
            } else if (cell.flagged) {
                cellDiv.classList.add('flag');
                cellDiv.textContent = "🚩";
            }

            cellDiv.addEventListener('click', onCellClick);
            cellDiv.addEventListener('contextmenu', onCellRightClick);
            boardDiv.appendChild(cellDiv);
        }
    }
}

function getColor(n) {
    const colors = ["#1976d2", "#388e3c", "#e53935", "#fbc02d", "#8e24aa", "#00bcd4", "#d84315", "#455a64"];
    return colors[n-1] || "#333";
}

function onCellClick(e) {
    if (gameOver) return;
    const r = +e.currentTarget.dataset.r;
    const c = +e.currentTarget.dataset.c;
    const cell = board[r][c];
    if (cell.open || cell.flagged) return;

    if (cell.mine) {
        cell.open = true;
        revealMines();
        renderBoard();
        messageDiv.textContent = "Bạn đã thua! 💥";
        gameOver = true;
        return;
    }
    openCell(r, c);
    renderBoard();
    checkWin();
}

function openCell(r, c) {
    const cell = board[r][c];
    if (cell.open || cell.flagged) return;
    cell.open = true;
    openedCount++;
    if (cell.adjacent === 0 && !cell.mine) {
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                let nr = r + dr, nc = c + dc;
                if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
                    openCell(nr, nc);
                }
            }
        }
    }
}

function revealMines() {
    for (const [r, c] of mineLocations) {
        board[r][c].open = true;
    }
}

function onCellRightClick(e) {
    e.preventDefault();
    if (gameOver) return;
    const r = +e.currentTarget.dataset.r;
    const c = +e.currentTarget.dataset.c;
    const cell = board[r][c];
    if (cell.open) return;
    cell.flagged = !cell.flagged;
    renderBoard();
}

function checkWin() {
    if (openedCount === ROWS * COLS - MINES) {
        revealMines();
        renderBoard();
        messageDiv.textContent = "Bạn đã thắng! 🎉";
        gameOver = true;
    }
}

resetBtn.addEventListener('click', initBoard);

// Khởi tạo game khi tải trang
initBoard();