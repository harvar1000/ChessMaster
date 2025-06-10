let board = [];
let selectedPiece = null;
let validMoves = [];
let turn = 'black';
let moveHistory = { black: [], white: [] };
let checkWarningCount = 0;
let isAIEnabled = true; // Enable AI for the white player
let gameOver = false;  // To track if the game is over

const pieces = {
    'wP': '♙', 'bP': '♟',
    'wR': '♖', 'bR': '♜',
    'wN': '♘', 'bN': '♞',
    'wB': '♗', 'bB': '♝',
    'wQ': '♕', 'bQ': '♛',
    'wK': '♔', 'bK': '♚',
};
function initializeBoard() {
    board = [
        ['bR', 'bN', 'bB', 'bQ', 'bK', 'bB', 'bN', 'bR'],
        ['bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP'],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP'],
        ['wR', 'wN', 'wB', 'wQ', 'wK', 'wB', 'wN', 'wR'],
    ];
    renderBoard();
}

function renderBoard() {
    const boardElement = document.getElementById('board');
    boardElement.innerHTML = '';  // Clear previous board rendering

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.classList.add('square');
            square.classList.add((row + col) % 2 === 0 ? 'white' : 'black');

            const piece = board[row][col];
            if (piece) {
                const pieceElement = document.createElement('span');
                pieceElement.textContent = pieces[piece];
                square.appendChild(pieceElement);
            }

            // Add event listener for onSquareClick
            square.addEventListener('click', () => onSquareClick(row, col));
            boardElement.appendChild(square);
        }
    }
}
// Assign piece values for evaluation
const pieceValues = {
    'p': 1,   // Pawn
    'n': 3,   // Knight
    'b': 3,   // Bishop
    'r': 5,   // Rook
    'q': 9,   // Queen
    'k': 1000 // King (high to prevent sacrificing)
};

function evaluateBoard() {
    let score = 0;
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece) {
                const pieceType = piece[1].toLowerCase();
                const value = pieceValues[pieceType] || 0;
                score += (piece[0] === 'w' ? value : -value);
            }
        }
    }
    return score;
}

function onSquareClick(row, col) {
    if (gameOver) return; // Do nothing if the game is over

    const piece = board[row][col];

    if (selectedPiece && isMoveValid(row, col)) {
        movePiece(selectedPiece.row, selectedPiece.col, row, col);
        addMoveToHistory(selectedPiece.piece, row, col);
        selectedPiece = null;
        validMoves = [];
        clearHighlights();
        checkForCheckmate();
        switchTurn();

        if (isAIEnabled && turn === 'white' && !gameOver) {
            setTimeout(() => aiMove(), 500); // Delay AI move for a better user experience
        }
        return;
    }

    if (selectedPiece && (selectedPiece.row === row && selectedPiece.col === col)) {
        selectedPiece = null;
        validMoves = [];
        clearHighlights();
        return;
    }

    if (piece && ((turn === 'black' && piece[0] === 'b') || (turn === 'white' && piece[0] === 'w'))) {
        selectedPiece = { row, col, piece };
        highlightValidMoves(row, col);
    }
}

function minimax(depth, isMaximizing, alpha, beta) {
    if (depth === 0 || gameOver) {
        return evaluateBoard();
    }

    if (isMaximizing) {
        let maxEval = -Infinity;
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (board[row][col] && board[row][col][0] === 'w') {
                    const moves = getValidMoves(row, col, board[row][col]);
                    for (const [toRow, toCol] of moves) {
                        const capturedPiece = board[toRow][toCol];
                        board[toRow][toCol] = board[row][col];
                        board[row][col] = '';  // Simulate move
                        
                        const eval = minimax(depth - 1, false, alpha, beta);
                        
                        board[row][col] = board[toRow][toCol];  // Undo move
                        board[toRow][toCol] = capturedPiece;
                        
                        maxEval = Math.max(maxEval, eval);
                        alpha = Math.max(alpha, eval);
                        if (beta <= alpha) break; // Beta cut-off
                    }
                }
            }
        }
        return maxEval;
    } else {
        let minEval = Infinity;
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (board[row][col] && board[row][col][0] === 'b') {
                    const moves = getValidMoves(row, col, board[row][col]);
                    for (const [toRow, toCol] of moves) {
                        const capturedPiece = board[toRow][toCol];
                        board[toRow][toCol] = board[row][col];
                        board[row][col] = '';  // Simulate move

                        const eval = minimax(depth - 1, true, alpha, beta);

                        board[row][col] = board[toRow][toCol];  // Undo move
                        board[toRow][toCol] = capturedPiece;

                        minEval = Math.min(minEval, eval);
                        beta = Math.min(beta, eval);
                        if (beta <= alpha) break; // Alpha cut-off
                    }
                }
            }
        }
        return minEval;
    }
}

// Remaining functions (highlightValidMoves, clearHighlights, movePiece, switchTurn, addMoveToHistory, checkForCheckmate, etc.) remain the same.
function highlightValidMoves(row, col) {
    validMoves = getValidMoves(row, col, board[row][col]);
    clearHighlights();
    validMoves.forEach(([r, c]) => {
        const square = document.querySelector(`#board > .square:nth-child(${r * 8 + c + 1})`);
        square.classList.add('highlight');
    });
}

function clearHighlights() {
    document.querySelectorAll('.square').forEach(square => square.classList.remove('highlight'));
}

function isMoveValid(row, col) {
    return validMoves.some(([r, c]) => r === row && c === col);
}
function getValidMoves(row, col, piece) {
    const moves = [];
    const color = piece[0];
    const type = piece[1];

    // Pawn movement
    if (type === 'P') {
        const direction = color === 'w' ? -1 : 1;
        const startRow = color === 'w' ? 6 : 1;

        // Move forward
        if (row + direction >= 0 && row + direction < 8 && !board[row + direction][col]) {
            moves.push([row + direction, col]);
            
            // First move can move 2 squares forward
            if (row === startRow && !board[row + 2 * direction][col]) {
                moves.push([row + 2 * direction, col]);
            }
        }

        // Capture diagonally
        if (row + direction >= 0 && row + direction < 8) {
            if (col - 1 >= 0 && board[row + direction][col - 1] && board[row + direction][col - 1][0] !== color) {
                moves.push([row + direction, col - 1]);
            }
            if (col + 1 < 8 && board[row + direction][col + 1] && board[row + direction][col + 1][0] !== color) {
                moves.push([row + direction, col + 1]);
            }
        }
    }
    // Knight movement
    else if (type === 'N') {
        const knightMoves = [
            [row + 2, col + 1], [row + 2, col - 1],
            [row - 2, col + 1], [row - 2, col - 1],
            [row + 1, col + 2], [row + 1, col - 2],
            [row - 1, col + 2], [row - 1, col - 2]
        ];
        knightMoves.forEach(([r, c]) => {
            if (r >= 0 && r < 8 && c >= 0 && c < 8 && (!board[r][c] || board[r][c][0] !== color)) {
                moves.push([r, c]);
            }
        });
    }
    // Bishop movement
    else if (type === 'B') {
        const directions = [
            [1, 1], [1, -1], [-1, 1], [-1, -1]
        ];

        directions.forEach(([dx, dy]) => {
            let r = row + dx, c = col + dy;
            while (r >= 0 && r < 8 && c >= 0 && c < 8) {
                if (board[r][c] && board[r][c][0] === color) break;  // Blocked by same color
                moves.push([r, c]);
                if (board[r][c]) break; // Stop if there's an opponent piece
                r += dx;
                c += dy;
            }
        });
    }
    // Rook movement
    else if (type === 'R') {
        const directions = [
            [1, 0], [-1, 0], [0, 1], [0, -1]
        ];

        directions.forEach(([dx, dy]) => {
            let r = row + dx, c = col + dy;
            while (r >= 0 && r < 8 && c >= 0 && c < 8) {
                if (board[r][c] && board[r][c][0] === color) break;  // Blocked by same color
                moves.push([r, c]);
                if (board[r][c]) break; // Stop if there's an opponent piece
                r += dx;
                c += dy;
            }
        });
    }
    // Queen movement (combination of Rook and Bishop)
    else if (type === 'Q') {
        const directions = [
            [1, 1], [1, -1], [-1, 1], [-1, -1], // Diagonals
            [1, 0], [-1, 0], [0, 1], [0, -1] // Horizontals and Verticals
        ];

        directions.forEach(([dx, dy]) => {
            let r = row + dx, c = col + dy;
            while (r >= 0 && r < 8 && c >= 0 && c < 8) {
                if (board[r][c] && board[r][c][0] === color) break;  // Blocked by same color
                moves.push([r, c]);
                if (board[r][c]) break; // Stop if there's an opponent piece
                r += dx;
                c += dy;
            }
        });
    }
    // King movement
    else if (type === 'K') {
        const kingMoves = [
            [row + 1, col], [row - 1, col], [row, col + 1], [row, col - 1],
            [row + 1, col + 1], [row + 1, col - 1], [row - 1, col + 1], [row - 1, col - 1]
        ];

        kingMoves.forEach(([r, c]) => {
            if (r >= 0 && r < 8 && c >= 0 && c < 8 && (!board[r][c] || board[r][c][0] !== color)) {
                moves.push([r, c]);
            }
        });
    }

    return moves;
}

function resetGame() {
    // Reset game variables
    selectedPiece = null;
    validMoves = [];
    turn = 'black';
    moveHistory = { black: [], white: [] };
    checkWarningCount = 0;
    gameOver = false;

    // Reinitialize the board and render it with event listeners
    initializeBoard();

    // Clear move history display
    document.getElementById('black-moves').innerHTML = '';
    document.getElementById('white-moves').innerHTML = '';

    // Reset turn status display
    document.getElementById('turn-status').textContent = "Black's Turn";
}
// Modify movePiece function to reset the game after a win
function movePiece(fromRow, fromCol, toRow, toCol) {
    const capturedPiece = board[toRow][toCol];
    
    // Check if the captured piece is a king
    if (capturedPiece && capturedPiece[1] === 'K') {
        gameOver = true;
        const winner = turn === 'black' ? 'Black' : 'White';
        alert(`${winner} wins by capturing the king!`);
        
        // Start a new game
        resetGame();
        return;
    }

    board[toRow][toCol] = board[fromRow][fromCol];
    board[fromRow][fromCol] = '';
    renderBoard();
}

function switchTurn() {
    turn = turn === 'black' ? 'white' : 'black';
    document.getElementById('turn-status').textContent = `${turn.charAt(0).toUpperCase() + turn.slice(1)}'s Turn`;
}

function addMoveToHistory(piece, row, col) {
    const move = `${pieces[piece]} to ${String.fromCharCode(65 + col)}${8 - row}`;
    moveHistory[turn].push(move);

    const moveList = document.getElementById(`${turn}-moves`);
    const moveItem = document.createElement('li');
    moveItem.textContent = move;
    moveList.appendChild(moveItem);
}

function checkForCheckmate() {
    if (isCheckmate()) {
        checkWarningCount++;
        if (checkWarningCount >= 3) {
            alert(`${turn.charAt(0).toUpperCase() + turn.slice(1)} is in checkmate! Game over.`);
            gameOver = true;
        } else {
            alert(`${turn.charAt(0).toUpperCase() + turn.slice(1)} is in check! Warning ${checkWarningCount}/3`);
        }
    }
}
function isCheckmate() {
    if (!isKingInCheck(turn)) return false;

    // Loop through all pieces of the current player
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece && piece[0] === turn[0]) { // Check if the piece belongs to the current player
                const moves = getValidMoves(row, col, piece);

                for (const [toRow, toCol] of moves) {
                    // Simulate move
                    const capturedPiece = board[toRow][toCol];
                    board[toRow][toCol] = piece;
                    board[row][col] = '';

                    // Check if the king is still in check after this move
                    const isStillInCheck = isKingInCheck(turn);

                    // Undo move
                    board[row][col] = piece;
                    board[toRow][toCol] = capturedPiece;

                    if (!isStillInCheck) {
                        return false; // Found a move that gets the king out of check
                    }
                }
            }
        }
    }

    // No legal moves left to escape check, so it's checkmate
    return true;
}

function isKingInCheck(playerColor) {
    const kingPos = findKing(playerColor);

    // Check all opponent moves to see if they can capture the king
    const opponentColor = playerColor === 'white' ? 'black' : 'white';

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece && piece[0] !== playerColor[0]) { // Opponent's piece
                const moves = getValidMoves(row, col, piece);
                for (const [toRow, toCol] of moves) {
                    if (toRow === kingPos.row && toCol === kingPos.col) {
                        return true; // King is in check
                    }
                }
            }
        }
    }

    return false;
}

function findKing(playerColor) {
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece === `${playerColor[0]}K`) {
                return { row, col };
            }
        }
    }
    return null;
}

function aiMove() {
    if (gameOver || turn !== 'white') return;

    let bestMove = null;
    let bestEval = -Infinity;

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if (board[row][col] && board[row][col][0] === 'w') {
                const moves = getValidMoves(row, col, board[row][col]);
                for (const [toRow, toCol] of moves) {
                    const capturedPiece = board[toRow][toCol];
                    board[toRow][toCol] = board[row][col];
                    board[row][col] = '';  // Simulate move

                    const eval = minimax(3, false, -Infinity, Infinity);  // Depth 3
                    board[row][col] = board[toRow][toCol];  // Undo move
                    board[toRow][toCol] = capturedPiece;

                    if (eval > bestEval) {
                        bestEval = eval;
                        bestMove = { from: [row, col], to: [toRow, toCol] };
                    }
                }
            }
        }
    }

    if (bestMove) {
        movePiece(bestMove.from[0], bestMove.from[1], bestMove.to[0], bestMove.to[1]);
        addMoveToHistory(board[bestMove.to[0]][bestMove.to[1]], bestMove.to[0], bestMove.to[1]);
        switchTurn();
    }
}

initializeBoard();