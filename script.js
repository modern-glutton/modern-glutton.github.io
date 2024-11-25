const board = document.getElementById("board");
const hoverPiece = document.createElement("div");
hoverPiece.id = "hover-piece";
document.body.appendChild(hoverPiece);

const triesSpan = document.getElementById("tries");
let tries = 0;
let currentPiece = null;
let keysPressed = {}; // Track which keys are currently pressed

// Initialize the game board (4x6 grid)
for (let i = 0; i < 24; i++) {
    const cell = document.createElement("div");
    cell.dataset.occupied = "false";
    cell.addEventListener("click", () => placePiece(cell));
    board.appendChild(cell);
}


// Function to highlight the edge of the grid temporarily based on the drawn piece's color
function highlightGrid() {
    // Get the color of the current drawn piece
    const pieceColor = currentPiece.color;

    // Set the border color and box-shadow based on the piece's color
    board.classList.add("highlighted");
    board.style.borderColor = pieceColor;  // Set the border color to the piece's color
    board.style.boxShadow = `0 0 10px 2px ${pieceColor}`;  // Set the glow to the piece's color

    // Remove the highlight after 500ms (duration of the highlight effect)
    setTimeout(() => {
        board.classList.remove("highlighted");
        board.style.borderColor = "";  // Reset to original state
        board.style.boxShadow = "";  // Reset to original state
    }, 100); // Duration of the highlight effect
}

function showToast(message, duration) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.style.display = "block";

    // Hide the toast after the duration
    setTimeout(() => {
        toast.style.display = "none";
    }, duration);
}


// Draw a random piece
function drawPiece() {
    tries++;
    triesSpan.textContent = tries;
    const randomPiece = pieces[Math.floor(Math.random() * pieces.length)];
    currentPiece = randomPiece;
    renderHoverPiece(randomPiece);
    
    // Highlight the edge of the grid when a new piece is drawn
    highlightGridEdge();
}



// Piece shapes and colors
const pieces = [
    { shape: [[1, 1], [1, 1]], color: "#66FFFF" }, // Box (Light Cyan)
    { shape: [[1, 1], [0, 1]], color: "#FFFF00" }, // Inverted L (Yellow)
    { shape: [[1, 1, 0], [0, 1, 1]], color: "#FF0000" }, // Z (Red)
    { shape: [[1]], color: "#FFA500" }, // Dot (Orange)
    { shape: [[1], [1], [1]], color: "#00008B" }, // Vertical (Dark Blue)
    { shape: [[1, 0], [1, 1]], color: "#008000" }, // L (Green)
    ];


// Draw a random piece
document.getElementById("draw-piece").addEventListener("click", () => drawPiece());

// Discard the current piece
document.getElementById("discard-piece").addEventListener("click", () => discardPiece());

// Reset the game
document.getElementById("reset").addEventListener("click", resetGame);

// Keyboard shortcuts for drawing and discarding
document.addEventListener("keydown", (e) => {
    if (!keysPressed[e.key]) { // Only act on the first press of the key
        keysPressed[e.key] = true;

        if (e.key.toLowerCase() === "q") {
            drawPiece(); // Press 'Q' to draw the next piece
        }
        if (e.key.toLowerCase() === "w") {
            discardPiece(); // Press 'W' to discard the current piece
        }
        if (e.key.toLowerCase() === "r") {
            resetGame(); // Press 'R' to reset game
        }
    }
});

document.addEventListener("keyup", (e) => {
    keysPressed[e.key] = false; // Reset the key state when released
});

// Cursor movement: make the piece hover
document.addEventListener("mousemove", (e) => {
    if (currentPiece) {
        hoverPiece.style.left = `${e.pageX - 25}px`; // Center on cursor
        hoverPiece.style.top = `${e.pageY - 25}px`;
    }
});

// Draw a random piece and display it on the cursor
function drawPiece() {
    tries++;
    triesSpan.textContent = tries;
    const randomPiece = pieces[Math.floor(Math.random() * pieces.length)];
    currentPiece = randomPiece;
    renderHoverPiece(randomPiece);
    highlightGrid();
}

// Discard the current piece
function discardPiece() {
    currentPiece = null;
    hoverPiece.style.visibility = "hidden"; // Hide the hover piece
}

// Render the piece to follow the cursor
function renderHoverPiece(piece) {
    hoverPiece.innerHTML = ""; // Clear previous piece content
    hoverPiece.style.gridTemplateColumns = `repeat(${piece.shape[0].length}, 50px)`;
    hoverPiece.style.visibility = "visible"; // Show the hover piece

    piece.shape.forEach(row => {
        row.forEach(cell => {
            const block = document.createElement("div");
            block.style.backgroundColor = cell ? piece.color : "transparent"; // Only fill "1" cells
            hoverPiece.appendChild(block);
        });
    });
}

// Place the current piece on the board
function placePiece(cell) {
    if (!currentPiece) return; // No piece to place

    const index = Array.from(board.children).indexOf(cell);
    const x = index % 6; // Column number
    const y = Math.floor(index / 6); // Row number

    // Check if the piece can be placed
    if (canPlacePiece(x, y, currentPiece)) {
        currentPiece.shape.forEach((row, dy) => {
            row.forEach((block, dx) => {
                if (block) {
                    const boardCell = board.children[(y + dy) * 6 + (x + dx)];
                    boardCell.style.backgroundColor = currentPiece.color;
                    boardCell.dataset.occupied = "true";
                }
            });
        });

        // Clear the current piece
        currentPiece = null;
        hoverPiece.style.visibility = "hidden";

        // Check if the board is full
        if (isBoardFull()) {
            // Show the toast
            showToast(`You have filed the grid in ${tries} tries`, 2000); // Display for 3 seconds
            resetGame();
        }
    }
}

// Check if the piece can fit on the board at the given position
function canPlacePiece(x, y, piece) {
    return piece.shape.every((row, dy) =>
        row.every((block, dx) => {
            const nx = x + dx; // Target column
            const ny = y + dy; // Target row
            if (block === 0) return true; // Skip empty blocks in the piece
            if (nx >= 6 || ny >= 4) return false; // Out of bounds
            const boardCell = board.children[ny * 6 + nx];
            return boardCell.dataset.occupied === "false"; // Check if cell is free
        })
    );
}

// Check if the entire board is filled
function isBoardFull() {
    return Array.from(board.children).every(cell => cell.dataset.occupied === "true");
}

// Reset the game board
function resetGame() {
    tries = 0;
    triesSpan.textContent = tries;
    board.childNodes.forEach(cell => {
        cell.style.backgroundColor = "#ccc"; // Reset cell color
        cell.dataset.occupied = "false"; // Mark cell as unoccupied
    });
    currentPiece = null;
    hoverPiece.style.visibility = "hidden"; // Hide the hover piece
}
