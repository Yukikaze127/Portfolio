// Chess Timer JavaScript
class ChessTimer {
    constructor() {
        this.player1Time = 300; // 5 minutes in seconds
        this.player2Time = 300; // 5 minutes in seconds
        this.currentPlayer = 1;
        this.isRunning = false;
        this.isPaused = false;
        this.gameStarted = false;
        this.interval = null;
        
        // DOM elements
        this.player1Display = document.getElementById('player1Display');
        this.player2Display = document.getElementById('player2Display');
        this.player1Timer = document.getElementById('player1Timer');
        this.player2Timer = document.getElementById('player2Timer');
        this.player1Button = document.getElementById('player1Button');
        this.player2Button = document.getElementById('player2Button');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.gameStatus = document.getElementById('gameStatus');
        
        // Add click listeners to entire timer areas
        this.player1Timer.addEventListener('click', () => this.switchToPlayer(1));
        this.player2Timer.addEventListener('click', () => this.switchToPlayer(2));
        
        // Add visual feedback for clickable areas
        this.player1Timer.style.cursor = 'pointer';
        this.player2Timer.style.cursor = 'pointer';
        
        this.updateDisplay();
        this.updateUI();
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    updateDisplay() {
        this.player1Display.textContent = this.formatTime(this.player1Time);
        this.player2Display.textContent = this.formatTime(this.player2Time);
    }
    
    updateUI() {
        // Update timer highlighting
        this.player1Timer.classList.toggle('active', this.currentPlayer === 1 && this.isRunning);
        this.player2Timer.classList.toggle('active', this.currentPlayer === 2 && this.isRunning);
        
        // Update expired states
        this.player1Timer.classList.toggle('expired', this.player1Time <= 0);
        this.player2Timer.classList.toggle('expired', this.player2Time <= 0);
        
        // Update cursor style based on game state
        if (this.gameStarted && this.isRunning) {
            this.player1Timer.style.cursor = this.currentPlayer === 1 && this.player1Time > 0 ? 'pointer' : 'not-allowed';
            this.player2Timer.style.cursor = this.currentPlayer === 2 && this.player2Time > 0 ? 'pointer' : 'not-allowed';
        } else {
            this.player1Timer.style.cursor = 'default';
            this.player2Timer.style.cursor = 'default';
        }
        
        // Update buttons - Keep buttons but make them secondary
        this.player1Button.disabled = !this.gameStarted || this.currentPlayer !== 1 || !this.isRunning || this.player1Time <= 0;
        this.player2Button.disabled = !this.gameStarted || this.currentPlayer !== 2 || !this.isRunning || this.player2Time <= 0;
        
        this.startBtn.disabled = this.gameStarted;
        this.pauseBtn.disabled = !this.gameStarted;
        
        // Update pause button text
        this.pauseBtn.textContent = this.isPaused ? 'Resume' : 'Pause';
        
        // Update game status
        if (!this.gameStarted) {
            this.gameStatus.textContent = "Set your time and press Start Game";
        } else if (this.isPaused) {
            this.gameStatus.textContent = "Game Paused";
        } else if (this.player1Time <= 0) {
            this.gameStatus.textContent = "🏆 Player 2 (Black) Wins! - Player 1 ran out of time";
            this.stopTimer();
        } else if (this.player2Time <= 0) {
            this.gameStatus.textContent = "🏆 Player 1 (White) Wins! - Player 2 ran out of time";
            this.stopTimer();
        } else if (this.isRunning) {
            const currentPlayerName = this.currentPlayer === 1 ? "Player 1 (White)" : "Player 2 (Black)";
            this.gameStatus.textContent = `${currentPlayerName}'s turn - Click ANYWHERE on your timer to end your turn`;
        } else {
            this.gameStatus.textContent = "Game in progress - Press Resume to continue";
        }
    }
    
    startTimer() {
        if (this.interval) {
            clearInterval(this.interval);
        }
        
        this.interval = setInterval(() => {
            if (this.isRunning && !this.isPaused) {
                if (this.currentPlayer === 1) {
                    this.player1Time--;
                } else {
                    this.player2Time--;
                }
                
                this.updateDisplay();
                this.updateUI();
                
                // Check for time expiration
                if (this.player1Time <= 0 || this.player2Time <= 0) {
                    this.stopTimer();
                }
            }
        }, 1000);
    }
    
    stopTimer() {
        this.isRunning = false;
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        this.updateUI();
    }
    
    startGame() {
        this.gameStarted = true;
        this.isRunning = true;
        this.isPaused = false;
        this.currentPlayer = 1; // White starts
        this.startTimer();
        this.updateUI();
    }
    
    pauseGame() {
        if (this.isPaused) {
            this.isPaused = false;
            this.isRunning = true;
        } else {
            this.isPaused = true;
            this.isRunning = false;
        }
        this.updateUI();
    }
    
    resetGame() {
        this.stopTimer();
        this.gameStarted = false;
        this.isRunning = false;
        this.isPaused = false;
        this.currentPlayer = 1;
        
        // Reset to last set time or default
        const customMinutes = parseInt(document.getElementById('customMinutes').value) || 5;
        const customSeconds = parseInt(document.getElementById('customSeconds').value) || 0;
        const totalSeconds = (customMinutes * 60) + customSeconds;
        
        this.player1Time = totalSeconds;
        this.player2Time = totalSeconds;
        
        this.updateDisplay();
        this.updateUI();
    }
    
    switchToPlayer(player) {
        if (!this.isRunning) return;
        
        // FIXED LOGIC: Current player clicks their timer area to END their turn
        if (this.currentPlayer !== player) return;
        
        // Only allow if player has time remaining
        if ((player === 1 && this.player1Time <= 0) || (player === 2 && this.player2Time <= 0)) {
            return;
        }
        
        // Switch to the other player
        this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
        this.updateUI();
        
        // Optional: Add a subtle click feedback sound
        this.playClickSound();
    }
    
    setTime(minutes, seconds = 0) {
        if (this.gameStarted) return;
        
        const totalSeconds = (minutes * 60) + seconds;
        this.player1Time = totalSeconds;
        this.player2Time = totalSeconds;
        
        // Update the custom input fields
        document.getElementById('customMinutes').value = minutes;
        document.getElementById('customSeconds').value = seconds;
        
        this.updateDisplay();
    }
    
    setCustomTime() {
        const minutes = parseInt(document.getElementById('customMinutes').value) || 5;
        const seconds = parseInt(document.getElementById('customSeconds').value) || 0;
        
        if (minutes < 0 || seconds < 0 || seconds > 59) {
            alert('Please enter valid time values');
            return;
        }
        
        this.setTime(minutes, seconds);
    }
}

// Global timer instance
let chessTimer;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    chessTimer = new ChessTimer();
});

// Global functions for button onclick events
function startGame() {
    chessTimer.startGame();
}

function pauseGame() {
    chessTimer.pauseGame();
}

function resetGame() {
    chessTimer.resetGame();
}

function switchToPlayer(player) {
    chessTimer.switchToPlayer(player);
}

function setTime(minutes, seconds = 0) {
    chessTimer.setTime(minutes, seconds);
}

function setCustomTime() {
    chessTimer.setCustomTime();
}

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
    if (!chessTimer.gameStarted) return;
    
    switch(event.key) {
        case '1':
            switchToPlayer(1);
            break;
        case '2':
            switchToPlayer(2);
            break;
        case ' ':
            event.preventDefault();
            pauseGame();
            break;
        case 'r':
        case 'R':
            if (event.ctrlKey) {
                event.preventDefault();
                resetGame();
            }
            break;
    }
});

// Add sound effects (optional - browser beep)
function playBeep() {
    try {
        // Create a simple beep sound
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
        // Fallback for browsers that don't support Web Audio API
        console.log('Beep!');
    }
}

// Add click sound for timer switches
ChessTimer.prototype.playClickSound = function() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 600;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.05);
    } catch (e) {
        // Silent fallback
    }
};