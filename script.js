class TicTacToe {
    constructor() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameMode = 'pvp'; // 'pvp' or 'ai'
        this.aiDifficulty = 'easy'; // 'easy', 'medium', 'hard'
        this.gameActive = true;
        this.stats = {
            xWins: 0,
            oWins: 0,
            draws: 0,
            totalGames: 0
        };
        
        this.winningCombinations = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6] // Diagonals
        ];
        
        this.initializeElements();
        this.bindEvents();
        this.loadStats();
        this.updateDisplay();
    }
    
    initializeElements() {
        this.cells = document.querySelectorAll('.cell');
        this.currentPlayerDisplay = document.getElementById('currentPlayer');
        this.gameStatus = document.getElementById('gameStatus');
        this.gameOverlay = document.getElementById('gameOverlay');
        this.winnerAnnouncement = document.getElementById('winnerAnnouncement');
        
        this.buttons = {
            pvpMode: document.getElementById('pvpMode'),
            aiMode: document.getElementById('aiMode'),
            reset: document.getElementById('resetBtn'),
            newGame: document.getElementById('newGameBtn'),
            playAgain: document.getElementById('playAgainBtn')
        };
        
        this.stats.elements = {
            xWins: document.getElementById('xWins'),
            oWins: document.getElementById('oWins'),
            draws: document.getElementById('draws'),
            totalGames: document.getElementById('totalGames')
        };
        
        this.difficultySection = document.getElementById('difficultySection');
        this.difficultyButtons = document.querySelectorAll('.difficulty-btn');
    }
    
    bindEvents() {
        // Cell clicks
        this.cells.forEach((cell, index) => {
            cell.addEventListener('click', () => this.handleCellClick(index));
        });
        
        // Mode buttons
        this.buttons.pvpMode.addEventListener('click', () => this.setGameMode('pvp'));
        this.buttons.aiMode.addEventListener('click', () => this.setGameMode('ai'));
        
        // Control buttons
        this.buttons.reset.addEventListener('click', () => this.resetGame());
        this.buttons.newGame.addEventListener('click', () => this.newGame());
        this.buttons.playAgain.addEventListener('click', () => this.playAgain());
        
        // Difficulty buttons
        this.difficultyButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.aiDifficulty = btn.dataset.difficulty;
                this.updateDifficultyButtons();
            });
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'KeyR' && e.ctrlKey) {
                e.preventDefault();
                this.resetGame();
            } else if (e.code === 'KeyN' && e.ctrlKey) {
                e.preventDefault();
                this.newGame();
            } else if (e.code === 'Escape' && this.gameOverlay.classList.contains('show')) {
                this.playAgain();
            }
        });
    }
    
    setGameMode(mode) {
        this.gameMode = mode;
        this.updateModeButtons();
        this.difficultySection.style.display = mode === 'ai' ? 'block' : 'none';
        this.resetGame();
    }
    
    updateModeButtons() {
        this.buttons.pvpMode.classList.toggle('active', this.gameMode === 'pvp');
        this.buttons.aiMode.classList.toggle('active', this.gameMode === 'ai');
    }
    
    updateDifficultyButtons() {
        this.difficultyButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.difficulty === this.aiDifficulty);
        });
    }
    
    handleCellClick(index) {
        if (!this.gameActive || this.board[index] !== '') return;
        
        this.makeMove(index, this.currentPlayer);
        
        if (this.gameActive && this.gameMode === 'ai' && this.currentPlayer === 'O') {
            setTimeout(() => this.makeAIMove(), 500);
        }
    }
    
    makeMove(index, player) {
        this.board[index] = player;
        this.cells[index].textContent = player;
        this.cells[index].classList.add(player.toLowerCase());
        
        const result = this.checkGameEnd();
        
        if (result.gameEnded) {
            this.endGame(result);
        } else {
            this.switchPlayer();
            this.updateDisplay();
        }
    }
    
    makeAIMove() {
        if (!this.gameActive) return;
        
        let move;
        switch (this.aiDifficulty) {
            case 'easy':
                move = this.getRandomMove();
                break;
            case 'medium':
                move = Math.random() < 0.7 ? this.getBestMove() : this.getRandomMove();
                break;
            case 'hard':
                move = this.getBestMove();
                break;
        }
        
        if (move !== -1) {
            this.makeMove(move, 'O');
        }
    }
    
    getRandomMove() {
        const availableMoves = this.board
            .map((cell, index) => cell === '' ? index : null)
            .filter(val => val !== null);
        
        return availableMoves.length > 0 
            ? availableMoves[Math.floor(Math.random() * availableMoves.length)]
            : -1;
    }
    
    getBestMove() {
        // Try to win
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === '') {
                this.board[i] = 'O';
                if (this.checkWinner() === 'O') {
                    this.board[i] = '';
                    return i;
                }
                this.board[i] = '';
            }
        }
        
        // Try to block player from winning
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === '') {
                this.board[i] = 'X';
                if (this.checkWinner() === 'X') {
                    this.board[i] = '';
                    return i;
                }
                this.board[i] = '';
            }
        }
        
        // Take center if available
        if (this.board[4] === '') return 4;
        
        // Take corners
        const corners = [0, 2, 6, 8];
        const availableCorners = corners.filter(i => this.board[i] === '');
        if (availableCorners.length > 0) {
            return availableCorners[Math.floor(Math.random() * availableCorners.length)];
        }
        
        // Take any available move
        return this.getRandomMove();
    }
    
    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
    }
    
    checkGameEnd() {
        const winner = this.checkWinner();
        
        if (winner) {
            return {
                gameEnded: true,
                winner: winner,
                winningCombination: this.getWinningCombination(winner)
            };
        }
        
        if (this.board.every(cell => cell !== '')) {
            return {
                gameEnded: true,
                winner: null,
                winningCombination: null
            };
        }
        
        return { gameEnded: false };
    }
    
    checkWinner() {
        for (const combination of this.winningCombinations) {
            const [a, b, c] = combination;
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                return this.board[a];
            }
        }
        return null;
    }
    
    getWinningCombination(winner) {
        for (const combination of this.winningCombinations) {
            const [a, b, c] = combination;
            if (this.board[a] === winner && this.board[b] === winner && this.board[c] === winner) {
                return combination;
            }
        }
        return null;
    }
    
    endGame(result) {
        this.gameActive = false;
        
        if (result.winningCombination) {
            result.winningCombination.forEach(index => {
                this.cells[index].classList.add('winning');
            });
        }
        
        // Update stats
        if (result.winner === 'X') {
            this.stats.xWins++;
        } else if (result.winner === 'O') {
            this.stats.oWins++;
        } else {
            this.stats.draws++;
        }
        this.stats.totalGames++;
        
        this.saveStats();
        this.updateStatsDisplay();
        
        // Show game over overlay
        setTimeout(() => {
            this.showGameOverOverlay(result);
        }, 1000);
    }
    
    showGameOverOverlay(result) {
        let message;
        let className = '';
        
        if (result.winner === 'X') {
            message = this.gameMode === 'ai' ? '🎉 You Win!' : '🎉 Player X Wins!';
            className = 'winner-x';
        } else if (result.winner === 'O') {
            message = this.gameMode === 'ai' ? '🤖 AI Wins!' : '🎉 Player O Wins!';
            className = 'winner-o';
        } else {
            message = '🤝 It\'s a Draw!';
            className = 'draw';
        }
        
        this.winnerAnnouncement.textContent = message;
        this.winnerAnnouncement.className = `winner-announcement ${className}`;
        this.gameOverlay.classList.add('show');
    }
    
    playAgain() {
        this.gameOverlay.classList.remove('show');
        this.resetGame();
    }
    
    resetGame() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        
        this.cells.forEach(cell => {
            cell.textContent = '';
            cell.className = 'cell';
        });
        
        this.updateDisplay();
    }
    
    newGame() {
        this.resetGame();
        this.stats = {
            xWins: 0,
            oWins: 0,
            draws: 0,
            totalGames: 0
        };
        this.saveStats();
        this.updateStatsDisplay();
    }
    
    updateDisplay() {
        this.currentPlayerDisplay.textContent = this.currentPlayer;
        this.currentPlayerDisplay.className = `player-indicator ${this.currentPlayer === 'O' ? 'player-o' : ''}`;
        
        if (this.gameMode === 'ai') {
            if (this.currentPlayer === 'X') {
                this.gameStatus.textContent = 'Your turn!';
            } else {
                this.gameStatus.textContent = 'AI is thinking...';
            }
        } else {
            this.gameStatus.textContent = `Player ${this.currentPlayer}'s turn`;
        }
    }
    
    updateStatsDisplay() {
        this.stats.elements.xWins.textContent = this.stats.xWins;
        this.stats.elements.oWins.textContent = this.stats.oWins;
        this.stats.elements.draws.textContent = this.stats.draws;
        this.stats.elements.totalGames.textContent = this.stats.totalGames;
    }
    
    saveStats() {
        localStorage.setItem('ticTacToeStats', JSON.stringify(this.stats));
    }
    
    loadStats() {
        const savedStats = localStorage.getItem('ticTacToeStats');
        if (savedStats) {
            this.stats = { ...this.stats, ...JSON.parse(savedStats) };
        }
        this.updateStatsDisplay();
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new TicTacToe();
    
    // Add loading animation
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// Add visual feedback for button interactions
document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.btn, .mode-btn, .difficulty-btn');
    
    buttons.forEach(button => {
        button.addEventListener('mousedown', function() {
            if (!this.disabled) {
                this.style.transform = 'translateY(1px) scale(0.98)';
            }
        });
        
        button.addEventListener('mouseup', function() {
            if (!this.disabled) {
                this.style.transform = 'translateY(-2px) scale(1)';
            }
        });
        
        button.addEventListener('mouseleave', function() {
            if (!this.disabled) {
                this.style.transform = 'translateY(0) scale(1)';
            }
        });
    });
});

// Add keyboard shortcut hints
document.addEventListener('DOMContentLoaded', () => {
    const shortcuts = [
        { key: 'Ctrl+R', action: 'Reset Game' },
        { key: 'Ctrl+N', action: 'New Game' },
        { key: 'Escape', action: 'Close Game Over (when shown)' }
    ];
    
    console.log('Keyboard Shortcuts:');
    shortcuts.forEach(shortcut => {
        console.log(`${shortcut.key}: ${shortcut.action}`);
    });
});