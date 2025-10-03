class ImageSearchApp {
    constructor() {
        // Unsplash API Configuration
        this.UNSPLASH_ACCESS_KEY = 'YOUR_UNSPLASH_ACCESS_KEY'; // You'll need to replace this
        this.UNSPLASH_API_URL = 'https://api.unsplash.com/search/photos';
        
        // DOM Elements
        this.searchInput = document.getElementById('searchInput');
        this.searchBtn = document.getElementById('searchBtn');
        this.searchResults = document.getElementById('searchResults');
        this.welcomeMessage = document.getElementById('welcomeMessage');
        this.imageModal = new bootstrap.Modal(document.getElementById('imageModal'));
        this.modalImage = document.getElementById('modalImage');
        this.modalInfo = document.getElementById('modalInfo');
        
        // State
        this.currentPage = 1;
        this.currentQuery = '';
        this.isLoading = false;
        
        this.initializeEventListeners();
    }
    
    initializeEventListeners() {
        // Search button click
        this.searchBtn.addEventListener('click', () => {
            this.performSearch();
        });
        
        // Enter key in search input
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });
        
        // Auto-search as user types (with debounce)
        let searchTimeout;
        this.searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                if (this.searchInput.value.trim().length > 2) {
                    this.performSearch();
                }
            }, 500);
        });
    }
    
    async performSearch(page = 1) {
        const query = this.searchInput.value.trim();
        
        if (!query) {
            this.showWelcomeMessage();
            return;
        }
        
        // Check if API key is set
        if (this.UNSPLASH_ACCESS_KEY === 'YOUR_UNSPLASH_ACCESS_KEY') {
            this.showError('Please set your Unsplash API key in the JavaScript file.');
            return;
        }
        
        if (query !== this.currentQuery) {
            this.currentPage = 1;
            this.currentQuery = query;
        } else {
            this.currentPage = page;
        }
        
        if (this.isLoading) return;
        
        this.showLoading();
        
        try {
            const response = await fetch(
                `${this.UNSPLASH_API_URL}?query=${encodeURIComponent(query)}&page=${this.currentPage}&per_page=20&orientation=all`,
                {
                    headers: {
                        'Authorization': `Client-ID ${this.UNSPLASH_ACCESS_KEY}`
                    }
                }
            );
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (this.currentPage === 1) {
                this.displayResults(data.results);
            } else {
                this.appendResults(data.results);
            }
            
            // Add load more functionality if there are more results
            if (data.results.length === 20 && data.total > this.currentPage * 20) {
                this.addLoadMoreButton();
            }
            
        } catch (error) {
            console.error('Search error:', error);
            this.showError('Failed to search images. Please try again.');
        } finally {
            this.isLoading = false;
        }
    }
    
    showLoading() {
        this.isLoading = true;
        this.hideWelcomeMessage();
        
        if (this.currentPage === 1) {
            this.searchResults.innerHTML = `
                <div class="loading">
                    <i class="bi bi-arrow-clockwise"></i>
                    <p class="mt-3">Searching for images...</p>
                </div>
            `;
        }
    }
    
    displayResults(images) {
        this.hideWelcomeMessage();
        
        if (images.length === 0) {
            this.searchResults.innerHTML = `
                <div class="no-results">
                    <i class="bi bi-search" style="font-size: 3rem; margin-bottom: 20px;"></i>
                    <h3>No images found</h3>
                    <p>Try searching for something else like "nature", "architecture", or "animals".</p>
                </div>
            `;
            return;
        }
        
        const imageGrid = this.createImageGrid(images);
        this.searchResults.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h4 class="text-white mb-0">
                    <i class="bi bi-images"></i> Search Results for "${this.currentQuery}"
                </h4>
                <span class="badge bg-light text-dark">${images.length} images</span>
            </div>
            ${imageGrid}
        `;
    }
    
    appendResults(images) {
        if (images.length === 0) return;
        
        const existingGrid = this.searchResults.querySelector('.image-grid');
        if (existingGrid) {
            const newImages = this.createImageCards(images);
            existingGrid.insertAdjacentHTML('beforeend', newImages);
        }
    }
    
    createImageGrid(images) {
        const imageCards = this.createImageCards(images);
        return `<div class="image-grid">${imageCards}</div>`;
    }
    
    createImageCards(images) {
        return images.map(image => `
            <div class="image-card" onclick="imageSearchApp.openImageModal('${image.id}', '${image.urls.regular}', '${image.alt_description || 'Image'}', '${image.user.name}', '${image.user.links.html}', '${image.links.html}')">
                <img src="${image.urls.small}" alt="${image.alt_description || 'Image'}" loading="lazy">
                <div class="image-info">
                    <h6 class="mb-1">${this.truncateText(image.alt_description || 'Untitled', 50)}</h6>
                    <div class="photographer">
                        <i class="bi bi-camera"></i> by ${image.user.name}
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    addLoadMoreButton() {
        const existingButton = document.getElementById('loadMoreBtn');
        if (existingButton) existingButton.remove();
        
        this.searchResults.insertAdjacentHTML('beforeend', `
            <div class="text-center mt-4">
                <button id="loadMoreBtn" class="btn btn-outline-light btn-lg">
                    <i class="bi bi-plus-circle"></i> Load More Images
                </button>
            </div>
        `);
        
        document.getElementById('loadMoreBtn').addEventListener('click', () => {
            this.performSearch(this.currentPage + 1);
        });
    }
    
    openImageModal(imageId, imageUrl, altText, photographerName, photographerUrl, imageUrl_unsplash) {
        this.modalImage.src = imageUrl;
        this.modalImage.alt = altText;
        
        this.modalInfo.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h6 class="mb-1">${altText}</h6>
                    <p class="mb-0">
                        <i class="bi bi-camera"></i> Photo by 
                        <a href="${photographerUrl}" target="_blank" class="text-light">${photographerName}</a>
                    </p>
                </div>
                <div>
                    <a href="${imageUrl_unsplash}" target="_blank" class="btn btn-sm btn-outline-light me-2">
                        <i class="bi bi-box-arrow-up-right"></i> View on Unsplash
                    </a>
                    <button class="btn btn-sm btn-light" onclick="imageSearchApp.downloadImage('${imageUrl}', '${altText}')">
                        <i class="bi bi-download"></i> Download
                    </button>
                </div>
            </div>
        `;
        
        this.imageModal.show();
    }
    
    downloadImage(imageUrl, filename) {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `${filename.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.jpg`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    showError(message) {
        this.hideWelcomeMessage();
        this.searchResults.innerHTML = `
            <div class="text-center text-white">
                <i class="bi bi-exclamation-triangle" style="font-size: 3rem; margin-bottom: 20px; color: #ff6b6b;"></i>
                <h3>Oops! Something went wrong</h3>
                <p>${message}</p>
                <p class="small">Make sure you have set up your Unsplash API key correctly.</p>
            </div>
        `;
    }
    
    showWelcomeMessage() {
        this.searchResults.innerHTML = `
            <div class="text-center text-white" id="welcomeMessage">
                <i class="bi bi-images" style="font-size: 3rem; margin-bottom: 20px;"></i>
                <h3>Welcome to Image Search!</h3>
                <p>Enter a search term above to discover amazing photos from Unsplash.</p>
                <div class="mt-4">
                    <span class="badge bg-light text-dark me-2">Try: "nature"</span>
                    <span class="badge bg-light text-dark me-2">Try: "architecture"</span>
                    <span class="badge bg-light text-dark">Try: "animals"</span>
                </div>
            </div>
        `;
        this.welcomeMessage = document.getElementById('welcomeMessage');
    }
    
    hideWelcomeMessage() {
        if (this.welcomeMessage) {
            this.welcomeMessage.style.display = 'none';
        }
    }
    
    truncateText(text, maxLength) {
        if (!text) return 'Untitled';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }
}

// API Key Setup Instructions
function showAPIKeyInstructions() {
    console.log(`
🔑 UNSPLASH API SETUP INSTRUCTIONS:

1. Go to https://unsplash.com/developers
2. Create a free account or sign in
3. Create a new application
4. Copy your Access Key
5. Replace 'YOUR_UNSPLASH_ACCESS_KEY' in this file with your actual key

Example:
this.UNSPLASH_ACCESS_KEY = 'your-actual-access-key-here';

Note: Free tier allows 50 requests per hour, which is perfect for this demo!
    `);
}

// Initialize the app when the page loads
let imageSearchApp;
document.addEventListener('DOMContentLoaded', () => {
    imageSearchApp = new ImageSearchApp();
    
    // Show setup instructions in console
    showAPIKeyInstructions();
});