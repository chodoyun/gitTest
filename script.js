// 게임 변수들
let board = []; // 게임 보드 배열
let currentPiece = null; // 현재 블록
let currentPieceType = null; // 현재 블록 타입
let currentX = 0; // 현재 블록의 X 좌표
let currentY = 0; // 현재 블록의 Y 좌표
let score = 0; // 점수
let gameInterval = null; // 게임 인터벌
let isGameOver = false; // 게임 오버 상태

// 테트리스 블록 모양 정의
const SHAPES = [
    { shape: [[1, 1, 1, 1]], type: 'I' }, // I
    { shape: [[1, 1], [1, 1]], type: 'O' }, // O
    { shape: [[1, 1, 1], [0, 1, 0]], type: 'T' }, // T
    { shape: [[1, 1, 1], [1, 0, 0]], type: 'L' }, // L
    { shape: [[1, 1, 1], [0, 0, 1]], type: 'J' }, // J
    { shape: [[1, 1, 0], [0, 1, 1]], type: 'S' }, // S
    { shape: [[0, 1, 1], [1, 1, 0]], type: 'Z' }  // Z
];

// 게임 보드 초기화
function initBoard() {
    board = Array(20).fill().map(() => Array(10).fill(0));
    const gameBoard = document.getElementById('gameBoard');
    gameBoard.innerHTML = '';
    
    for (let i = 0; i < 20; i++) {
        for (let j = 0; j < 10; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.id = `${i}-${j}`;
            gameBoard.appendChild(cell);
        }
    }
}

// 새로운 블록 생성
function createNewPiece() {
    const randomPiece = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    currentPiece = randomPiece.shape;
    currentPieceType = randomPiece.type;
    currentX = Math.floor(10 / 2) - Math.floor(currentPiece[0].length / 2);
    currentY = 0;
    
    if (!isValidMove(currentX, currentY)) {
        gameOver();
    }
}

// 블록 이동 가능 여부 확인
function isValidMove(x, y) {
    for (let i = 0; i < currentPiece.length; i++) {
        for (let j = 0; j < currentPiece[i].length; j++) {
            if (currentPiece[i][j]) {
                const newX = x + j;
                const newY = y + i;
                
                // 보드 범위를 벗어나는지 확인
                if (newX < 0 || newX >= 10 || newY >= 20) return false;
                
                // 다른 블록과 충돌하는지 확인
                if (newY >= 0 && board[newY][newX] !== 0) return false;
            }
        }
    }
    return true;
}

// 블록 회전
function rotatePiece() {
    const newPiece = currentPiece[0].map((_, i) => 
        currentPiece.map(row => row[i]).reverse()
    );
    
    const oldPiece = currentPiece;
    currentPiece = newPiece;
    
    if (!isValidMove(currentX, currentY)) {
        currentPiece = oldPiece;
    }
}

// 블록 고정
function lockPiece() {
    for (let i = 0; i < currentPiece.length; i++) {
        for (let j = 0; j < currentPiece[i].length; j++) {
            if (currentPiece[i][j]) {
                const y = currentY + i;
                if (y >= 0) {
                    board[y][currentX + j] = currentPieceType;
                    const cell = document.getElementById(`${y}-${currentX + j}`);
                    cell.classList.add('filled');
                    cell.classList.add(`type-${currentPieceType}`);
                }
            }
        }
    }
    checkLines();
    createNewPiece();
}

// 줄 제거
function checkLines() {
    for (let i = 19; i >= 0; i--) {
        if (board[i].every(cell => cell !== 0)) {
            // 위의 모든 줄을 한 칸씩 아래로 이동
            for (let y = i; y > 0; y--) {
                for (let x = 0; x < 10; x++) {
                    board[y][x] = board[y-1][x];
                }
            }
            // 최상단 줄은 빈 줄로 설정
            board[0] = Array(10).fill(0);
            
            // UI 업데이트
            for (let y = i; y >= 0; y--) {
                for (let x = 0; x < 10; x++) {
                    const cell = document.getElementById(`${y}-${x}`);
                    // 모든 클래스 제거
                    cell.classList.remove('filled');
                    cell.classList.remove('type-I', 'type-O', 'type-T', 'type-L', 'type-J', 'type-S', 'type-Z');
                    
                    // 블록이 있으면 해당 타입의 클래스 추가
                    if (board[y][x] !== 0) {
                        cell.classList.add('filled');
                        cell.classList.add(`type-${board[y][x]}`);
                    }
                }
            }
            
            score += 100;
            document.getElementById('score').textContent = score;
            
            // 같은 줄을 다시 체크 (연쇄 반응을 위해)
            i++;
        }
    }
}

// 게임 오버
function gameOver() {
    isGameOver = true;
    clearInterval(gameInterval);
    alert('게임 오버! 점수: ' + score);
}

// 게임 시작
function startGame() {
    initBoard();
    score = 0;
    isGameOver = false;
    document.getElementById('score').textContent = '0';
    createNewPiece();
    
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(() => {
        if (!isGameOver) {
            if (isValidMove(currentX, currentY + 1)) {
                currentY++;
            } else {
                lockPiece();
            }
            updateUI();
        }
    }, 1000);
}

// UI 업데이트
function updateUI() {
    // 이전 블록 지우기
    document.querySelectorAll('.cell').forEach(cell => {
        if (!cell.classList.contains('filled')) {
            cell.classList.remove('active');
            cell.classList.remove('type-I', 'type-O', 'type-T', 'type-L', 'type-J', 'type-S', 'type-Z');
        }
    });
    
    // 현재 블록 그리기
    if (currentPiece) {
        for (let i = 0; i < currentPiece.length; i++) {
            for (let j = 0; j < currentPiece[i].length; j++) {
                if (currentPiece[i][j]) {
                    const y = currentY + i;
                    if (y >= 0) {
                        const cell = document.getElementById(`${y}-${currentX + j}`);
                        cell.classList.add('active');
                        cell.classList.add(`type-${currentPieceType}`);
                    }
                }
            }
        }
    }
}

// 키보드 이벤트 처리
document.addEventListener('keydown', (e) => {
    if (isGameOver) return;
    
    switch (e.key) {
        case 'ArrowLeft':
            if (isValidMove(currentX - 1, currentY)) currentX--;
            break;
        case 'ArrowRight':
            if (isValidMove(currentX + 1, currentY)) currentX++;
            break;
        case 'ArrowDown':
            if (isValidMove(currentX, currentY + 1)) currentY++;
            break;
        case 'ArrowUp':
            rotatePiece();
            break;
    }
    updateUI();
});

// 게임 시작 버튼 이벤트
document.getElementById('startBtn').addEventListener('click', startGame); 