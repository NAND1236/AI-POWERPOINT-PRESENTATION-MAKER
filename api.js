/**
 * API Integration Module
 * Connects frontend to backend REST API
 */

// ============================================
// API CONFIGURATION
// ============================================
const API_BASE_URL = 'http://localhost:5000/api';

// ============================================
// TOKEN MANAGEMENT
// ============================================

/**
 * Store JWT token in localStorage
 * @param {string} token - JWT token
 */
function setToken(token) {
    localStorage.setItem('authToken', token);
}

/**
 * Get JWT token from localStorage
 * @returns {string|null} JWT token
 */
function getToken() {
    return localStorage.getItem('authToken');
}

/**
 * Remove JWT token from localStorage
 */
function removeToken() {
    localStorage.removeItem('authToken');
}

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
function isAuthenticated() {
    return !!getToken();
}

// ============================================
// HTTP REQUEST HELPER
// ============================================

/**
 * Make an authenticated API request
 * @param {string} endpoint - API endpoint (e.g., '/auth/login')
 * @param {object} options - Fetch options
 * @returns {Promise<object>} API response
 */
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Default headers
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    // Add auth token if available
    const token = getToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    try {
        const response = await fetch(url, {
            ...options,
            headers
        });
        
        const data = await response.json();
        
        // Handle unauthorized responses
        if (response.status === 401) {
            removeToken();
            // Redirect to login if on protected page
            if (!window.location.hash.includes('login')) {
                showLoginPage();
            }
            throw new Error(data.message || 'Session expired. Please login again.');
        }
        
        if (!response.ok) {
            throw new Error(data.message || 'Request failed');
        }
        
        return data;
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
}

/**
 * Make a multipart form data request (for file uploads)
 * @param {string} endpoint - API endpoint
 * @param {FormData} formData - Form data with file
 * @returns {Promise<object>} API response
 */
async function apiUpload(endpoint, formData) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers = {};
    const token = getToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: formData
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Upload failed');
        }
        
        return data;
    } catch (error) {
        console.error('Upload Error:', error);
        throw error;
    }
}

// ============================================
// AUTHENTICATION API
// ============================================

/**
 * Sign up a new user
 * @param {string} name - User's full name
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<object>} Signup response with token
 */
async function signupAPI(name, email, password) {
    const response = await apiRequest('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ name, email, password })
    });
    
    // Store token on successful signup
    if (response.data?.token) {
        setToken(response.data.token);
    }
    
    return response;
}

/**
 * Login user
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<object>} Login response with token
 */
async function loginAPI(email, password) {
    const response = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });
    
    // Store token on successful login
    if (response.data?.token) {
        setToken(response.data.token);
    }
    
    return response;
}

/**
 * Get current user profile
 * @returns {Promise<object>} User profile data
 */
async function getMeAPI() {
    return await apiRequest('/auth/me', {
        method: 'GET'
    });
}

/**
 * Logout user
 */
function logoutAPI() {
    removeToken();
    localStorage.removeItem('currentUser');
}

// ============================================
// PRESENTATION GENERATION API
// ============================================

/**
 * Generate presentation from text
 * @param {string} text - Content text
 * @param {number} slideCount - Number of slides
 * @returns {Promise<object>} Generated presentation
 */
async function generateFromTextAPI(text, slideCount = 5) {
    return await apiRequest('/generate/text', {
        method: 'POST',
        body: JSON.stringify({ 
            text, 
            slideCount 
        })
    });
}

/**
 * Generate presentation from PDF
 * @param {File} pdfFile - PDF file
 * @param {boolean} enhance - Whether to enhance with AI
 * @param {number} slideCount - Number of slides
 * @returns {Promise<object>} Generated presentation
 */
async function generateFromPDFAPI(pdfFile, enhance = true, slideCount = 5) {
    const formData = new FormData();
    formData.append('pdf', pdfFile);
    formData.append('enhance', enhance.toString());
    formData.append('slideCount', slideCount.toString());
    
    return await apiUpload('/generate/pdf', formData);
}

/**
 * Generate presentation from URL
 * @param {string} url - Website URL
 * @param {boolean} enhance - Whether to enhance with AI
 * @param {number} slideCount - Number of slides
 * @returns {Promise<object>} Generated presentation
 */
async function generateFromURLAPI(url, enhance = true, slideCount = 5) {
    return await apiRequest('/generate/url', {
        method: 'POST',
        body: JSON.stringify({ 
            url, 
            enhance,
            slideCount 
        })
    });
}

/**
 * Generate presentation from topic
 * @param {string} topic - Topic/keywords
 * @param {number} slideCount - Number of slides
 * @param {string} audience - Target audience
 * @param {string} style - Presentation style
 * @returns {Promise<object>} Generated presentation
 */
async function generateFromTopicAPI(topic, slideCount = 5, audience = 'general', style = 'professional') {
    return await apiRequest('/generate/topic', {
        method: 'POST',
        body: JSON.stringify({ 
            topic, 
            slideCount,
            audience,
            style
        })
    });
}

/**
 * Get user's presentation history
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Promise<object>} Presentations list
 */
async function getPresentationsAPI(page = 1, limit = 10) {
    return await apiRequest(`/generate/presentations?page=${page}&limit=${limit}`, {
        method: 'GET'
    });
}

/**
 * Get single presentation by ID
 * @param {string} id - Presentation ID
 * @returns {Promise<object>} Presentation data
 */
async function getPresentationByIdAPI(id) {
    return await apiRequest(`/generate/presentations/${id}`, {
        method: 'GET'
    });
}

/**
 * Delete presentation
 * @param {string} id - Presentation ID
 * @returns {Promise<object>} Delete response
 */
async function deletePresentationAPI(id) {
    return await apiRequest(`/generate/presentations/${id}`, {
        method: 'DELETE'
    });
}

/**
 * Export presentation to PowerPoint file
 * @param {object} presentation - Presentation object with title and slides
 * @param {string} theme - Theme name (professional, dark, modern, nature, corporate)
 * @returns {Promise<Blob>} PowerPoint file as blob
 */
async function exportToPowerPointAPI(presentation, theme = 'professional') {
    const url = `${API_BASE_URL}/generate/export`;
    
    const headers = {
        'Content-Type': 'application/json'
    };
    
    const token = getToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify({ presentation, theme })
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to export presentation');
        }
        
        // Return blob for file download
        return await response.blob();
    } catch (error) {
        console.error('Export Error:', error);
        throw error;
    }
}

/**
 * Get available export themes
 * @returns {Promise<object>} Available themes
 */
async function getExportThemesAPI() {
    return await apiRequest('/generate/themes', {
        method: 'GET'
    });
}

// ============================================
// UI HELPER FUNCTIONS
// ============================================

/**
 * Show loading state on a button
 * @param {HTMLElement} button - Button element
 * @param {string} loadingText - Text to show while loading
 */
function showButtonLoading(button, loadingText = 'Loading...') {
    button.disabled = true;
    button.dataset.originalText = button.innerHTML;
    button.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${loadingText}`;
}

/**
 * Hide loading state on a button
 * @param {HTMLElement} button - Button element
 */
function hideButtonLoading(button) {
    button.disabled = false;
    if (button.dataset.originalText) {
        button.innerHTML = button.dataset.originalText;
    }
}

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - 'success', 'error', or 'info'
 */
function showToast(message, type = 'info') {
    // Remove existing toasts
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        border-radius: 12px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        display: flex;
        align-items: center;
        gap: 10px;
        max-width: 400px;
    `;
    
    // Set background based on type
    const backgrounds = {
        success: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        error: 'linear-gradient(135deg, #f5576c 0%, #fa709a 100%)',
        info: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    };
    toast.style.background = backgrounds[type] || backgrounds.info;
    
    // Set icon based on type
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle'
    };
    
    toast.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i> ${message}`;
    
    // Add animation keyframes if not exists
    if (!document.querySelector('#toast-animation-style')) {
        const style = document.createElement('style');
        style.id = 'toast-animation-style';
        style.textContent = `
            @keyframes slideIn {
                from { opacity: 0; transform: translateX(100px); }
                to { opacity: 1; transform: translateX(0); }
            }
            @keyframes slideOut {
                from { opacity: 1; transform: translateX(0); }
                to { opacity: 0; transform: translateX(100px); }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(toast);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-in forwards';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

/**
 * Convert API slide format to frontend format
 * @param {object} apiResponse - API response with slides
 * @returns {Array} Slides in frontend format
 */
function convertSlidesToFrontendFormat(apiResponse) {
    if (!apiResponse.slides || !Array.isArray(apiResponse.slides)) {
        return [];
    }
    
    return apiResponse.slides.map((slide, index) => ({
        id: Date.now() + index,
        title: slide.slideTitle || `Slide ${index + 1}`,
        content: Array.isArray(slide.points) 
            ? slide.points.map(p => `• ${p}`).join('\n')
            : '• No content'
    }));
}

// ============================================
// PAGE NAVIGATION HELPERS
// ============================================

/**
 * Show login page
 */
function showLoginPage() {
    document.getElementById('loginPage').classList.remove('hidden');
    document.getElementById('signupPage').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('active');
    document.getElementById('editorPage').classList.remove('active');
}

/**
 * Show signup page
 */
function showSignupPage() {
    document.getElementById('signupPage').classList.remove('hidden');
    document.getElementById('loginPage').classList.add('hidden');
}

/**
 * Show dashboard
 */
function showDashboard() {
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('signupPage').classList.add('hidden');
    document.getElementById('dashboard').classList.add('active');
}

/**
 * Check authentication and redirect accordingly
 */
async function checkAuth() {
    if (!isAuthenticated()) {
        showLoginPage();
        return null;
    }
    
    try {
        const response = await getMeAPI();
        if (response.data?.user) {
            return response.data.user;
        }
    } catch (error) {
        console.error('Auth check failed:', error);
        removeToken();
    }
    
    showLoginPage();
    return null;
}

// Export functions for use in HTML
window.API = {
    // Config
    BASE_URL: API_BASE_URL,
    
    // Token management
    setToken,
    getToken,
    removeToken,
    isAuthenticated,
    
    // Auth
    signup: signupAPI,
    login: loginAPI,
    getMe: getMeAPI,
    logout: logoutAPI,
    
    // Generation
    generateFromText: generateFromTextAPI,
    generateFromPDF: generateFromPDFAPI,
    generateFromURL: generateFromURLAPI,
    generateFromTopic: generateFromTopicAPI,
    getPresentations: getPresentationsAPI,
    getPresentationById: getPresentationByIdAPI,
    deletePresentation: deletePresentationAPI,
    exportToPowerPoint: exportToPowerPointAPI,
    getExportThemes: getExportThemesAPI,
    
    // UI Helpers
    showButtonLoading,
    hideButtonLoading,
    showToast,
    convertSlidesToFrontendFormat,
    
    // Navigation
    showLoginPage,
    showSignupPage,
    showDashboard,
    checkAuth
};
