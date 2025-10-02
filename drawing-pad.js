class MobileDrawingPad {
    constructor() {
        this.canvas = document.getElementById('drawingCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.isDrawing = false;
        this.currentTool = 'brush';
        this.currentColor = '#000000';
        this.currentSize = 5;
        this.lastX = 0;
        this.lastY = 0;
        
        this.initializeCanvas();
        this.setupEventListeners();
        this.setupToolbar();
        this.preventDefaultGestures();
    }

    initializeCanvas() {
        // Set canvas size to container size
        this.resizeCanvas();
        
        // Set canvas size to match container
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();
        
        // Account for padding
        const computedStyle = getComputedStyle(container);
        const paddingX = parseFloat(computedStyle.paddingLeft) + parseFloat(computedStyle.paddingRight);
        const paddingY = parseFloat(computedStyle.paddingTop) + parseFloat(computedStyle.paddingBottom);
        
        const canvasWidth = rect.width - paddingX;
        const canvasHeight = rect.height - paddingY;
        
        this.canvas.width = canvasWidth;
        this.canvas.height = canvasHeight;
        this.canvas.style.width = canvasWidth + 'px';
        this.canvas.style.height = canvasHeight + 'px';
        
        // Set initial drawing properties
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.globalCompositeOperation = 'source-over';
        
        // Fill with white background
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    resizeCanvas() {
        window.addEventListener('resize', () => {
            // Save current drawing
            const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
            
            // Reinitialize canvas
            this.initializeCanvas();
            
            // Restore drawing
            this.ctx.putImageData(imageData, 0, 0);
        });
    }

    setupEventListeners() {
        // Touch events for mobile
        this.canvas.addEventListener('touchstart', this.handleStart.bind(this), { passive: false });
        this.canvas.addEventListener('touchmove', this.handleMove.bind(this), { passive: false });
        this.canvas.addEventListener('touchend', this.handleEnd.bind(this), { passive: false });
        
        // Mouse events for desktop testing
        this.canvas.addEventListener('mousedown', this.handleStart.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleEnd.bind(this));
        this.canvas.addEventListener('mouseout', this.handleEnd.bind(this));
        
        // Add mouse move tracking for cursor position
        this.canvas.addEventListener('mousemove', this.updateCursorPosition.bind(this));
    }

    updateCursorPosition(e) {
        if (!this.isDrawing) {
            const pos = this.getEventPos(e);
            // Debug: Show coordinates in console for testing
            // console.log(`Cursor at: ${pos.x}, ${pos.y}`);
        }
    }

    getEventPos(e) {
        const rect = this.canvas.getBoundingClientRect();
        
        let clientX, clientY;
        
        if (e.type.includes('touch')) {
            const touch = e.touches[0] || e.changedTouches[0];
            clientX = touch.clientX;
            clientY = touch.clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    }

    handleStart(e) {
        e.preventDefault();
        this.isDrawing = true;
        
        const pos = this.getEventPos(e);
        this.lastX = pos.x;
        this.lastY = pos.y;
        
        // Set drawing properties
        if (this.currentTool === 'brush') {
            this.ctx.globalCompositeOperation = 'source-over';
            this.ctx.strokeStyle = this.currentColor;
        } else if (this.currentTool === 'eraser') {
            this.ctx.globalCompositeOperation = 'destination-out';
        }
        
        this.ctx.lineWidth = this.currentSize;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        // Start drawing with a dot for single taps
        this.ctx.beginPath();
        this.ctx.moveTo(pos.x, pos.y);
        this.ctx.lineTo(pos.x, pos.y);
        this.ctx.stroke();
    }

    handleMove(e) {
        if (!this.isDrawing) return;
        e.preventDefault();
        
        const pos = this.getEventPos(e);
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.lastX, this.lastY);
        this.ctx.lineTo(pos.x, pos.y);
        this.ctx.stroke();
        
        this.lastX = pos.x;
        this.lastY = pos.y;
    }

    handleEnd(e) {
        if (!this.isDrawing) return;
        e.preventDefault();
        
        this.isDrawing = false;
        this.ctx.beginPath();
    }

    setupToolbar() {
        // Color palette
        const colorBtns = document.querySelectorAll('.color-btn');
        colorBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all color buttons
                colorBtns.forEach(b => b.classList.remove('active'));
                // Add active class to clicked button
                btn.classList.add('active');
                // Set current color
                this.currentColor = btn.dataset.color;
                
                // Switch to brush tool when color is selected
                if (this.currentTool === 'eraser') {
                    this.setTool('brush');
                }
            });
        });

        // Brush size slider
        const brushSizeSlider = document.getElementById('brushSize');
        const sizeDisplay = document.getElementById('sizeDisplay');
        
        brushSizeSlider.addEventListener('input', (e) => {
            this.currentSize = e.target.value;
            sizeDisplay.textContent = e.target.value;
        });

        // Tool buttons
        const brushTool = document.getElementById('brushTool');
        const eraserTool = document.getElementById('eraserTool');
        const clearBtn = document.getElementById('clearBtn');
        const saveBtn = document.getElementById('saveBtn');

        brushTool.addEventListener('click', () => this.setTool('brush'));
        eraserTool.addEventListener('click', () => this.setTool('eraser'));
        clearBtn.addEventListener('click', () => this.clearCanvas());
        saveBtn.addEventListener('click', () => this.saveDrawing());
    }

    setTool(tool) {
        this.currentTool = tool;
        
        // Update tool button states
        const toolBtns = document.querySelectorAll('.tool-btn');
        toolBtns.forEach(btn => btn.classList.remove('active'));
        
        if (tool === 'brush') {
            document.getElementById('brushTool').classList.add('active');
            this.canvas.style.cursor = 'crosshair';
        } else if (tool === 'eraser') {
            document.getElementById('eraserTool').classList.add('active');
            this.canvas.style.cursor = 'grab';
        }
    }

    clearCanvas() {
        // Confirm before clearing
        if (confirm('Are you sure you want to clear the canvas? This cannot be undone.')) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            // Refill with white background
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    saveDrawing() {
        try {
            // Create download link
            const link = document.createElement('a');
            link.download = `drawing-${new Date().getTime()}.png`;
            link.href = this.canvas.toDataURL('image/png', 1.0);
            
            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Show success message
            this.showToast('Drawing saved successfully!', 'success');
        } catch (error) {
            console.error('Error saving drawing:', error);
            this.showToast('Error saving drawing. Please try again.', 'error');
        }
    }

    showToast(message, type = 'info') {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `alert alert-${type === 'success' ? 'success' : 'danger'} position-fixed`;
        toast.style.cssText = `
            top: 20px;
            right: 20px;
            z-index: 9999;
            min-width: 200px;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        toast.innerHTML = `
            <i class="bi bi-${type === 'success' ? 'check-circle' : 'exclamation-triangle'}"></i>
            ${message}
        `;
        
        document.body.appendChild(toast);
        
        // Fade in
        setTimeout(() => toast.style.opacity = '1', 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    }

    preventDefaultGestures() {
        // Prevent default touch behaviors
        document.addEventListener('touchstart', (e) => {
            if (e.target === this.canvas) {
                e.preventDefault();
            }
        }, { passive: false });

        document.addEventListener('touchend', (e) => {
            if (e.target === this.canvas) {
                e.preventDefault();
            }
        }, { passive: false });

        document.addEventListener('touchmove', (e) => {
            if (e.target === this.canvas) {
                e.preventDefault();
            }
        }, { passive: false });

        // Prevent context menu on long press
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        // Prevent zoom on double tap
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, { passive: false });
    }
}

// Initialize the drawing pad when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new MobileDrawingPad();
});