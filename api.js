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
 * CRITICAL: This is the ONLY function that should make fetch calls
 * @param {string} endpoint - API endpoint (e.g., '/auth/login')
 * @param {object} options - Fetch options
 * @param {boolean} requiresAuth - Whether this endpoint requires authentication (default: true)
 * @returns {Promise<object>} API response
 */
async function apiRequest(endpoint, options = {}, requiresAuth = true) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Get fresh token from localStorage for EVERY request
    const token = localStorage.getItem('authToken');
    
    // AUTH GUARD: If auth required but no token, redirect to login
    if (requiresAuth && !token && !endpoint.includes('/auth/')) {
        console.error('[API] No token found - redirecting to login');
        localStorage.removeItem('currentUser');
        showLoginPage();
        throw new Error('Please login to continue');
    }
    
    // Build headers - ALWAYS attach token if it exists
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    // CRITICAL: Always attach Authorization header if token exists
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Debug logging
    console.log(`[API] ${options.method || 'GET'} ${endpoint}`, {
        hasToken: !!token,
        tokenPreview: token ? `${token.substring(0, 20)}...` : 'none'
    });
    
    try {
        const response = await fetch(url, {
            ...options,
            headers
        });
        
        // Try to parse JSON, handle non-JSON responses
        let data;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            const text = await response.text();
            data = { message: text };
        }
        
        // Handle 401 Unauthorized - ALWAYS clear auth and redirect
        if (response.status === 401) {
            console.warn('[API] 401 Unauthorized - clearing all auth data');
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
            showLoginPage();
            throw new Error(data.message || 'Session expired. Please login again.');
        }
        
        if (!response.ok) {
            throw new Error(data.message || `Request failed with status ${response.status}`);
        }
        
        return data;
    } catch (error) {
        console.error('[API] Request Error:', endpoint, error.message);
        throw error;
    }
}

/**
 * Make a multipart form data request (for file uploads)
 * CRITICAL: Uses same auth pattern as apiRequest
 * @param {string} endpoint - API endpoint
 * @param {FormData} formData - Form data with file
 * @returns {Promise<object>} API response
 */
async function apiUpload(endpoint, formData) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Get fresh token from localStorage for EVERY request
    const token = localStorage.getItem('authToken');
    
    // AUTH GUARD: Redirect if no token
    if (!token) {
        console.error('[API Upload] No token found - redirecting to login');
        localStorage.removeItem('currentUser');
        showLoginPage();
        throw new Error('Please login to continue');
    }
    
    // Don't set Content-Type for FormData (browser sets it with boundary)
    const headers = {
        'Authorization': `Bearer ${token}`
    };
    
    // Debug logging
    console.log(`[API Upload] POST ${endpoint}`, {
        hasToken: !!token,
        tokenPreview: token ? `${token.substring(0, 20)}...` : 'none'
    });
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: formData
        });
        
        // Try to parse JSON
        let data;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            const text = await response.text();
            data = { message: text };
        }
        
        // Handle 401 Unauthorized - clear auth and redirect
        if (response.status === 401) {
            console.warn('[API Upload] 401 Unauthorized - clearing all auth data');
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
            showLoginPage();
            throw new Error(data.message || 'Session expired. Please login again.');
        }
        
        if (!response.ok) {
            throw new Error(data.message || `Upload failed with status ${response.status}`);
        }
        
        return data;
    } catch (error) {
        console.error('[API Upload] Error:', endpoint, error.message);
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
    // Auth endpoints don't require existing token
    const response = await apiRequest('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ name, email, password })
    }, false);
    
    // CRITICAL: Store token IMMEDIATELY in localStorage
    const token = response.data?.token || response.token;
    if (token) {
        localStorage.setItem('authToken', token);
        console.log('[API] Token stored after signup:', token.substring(0, 20) + '...');
        
        // Verify storage worked
        const stored = localStorage.getItem('authToken');
        if (stored !== token) {
            console.error('[API] Token storage verification FAILED!');
        }
    } else {
        console.warn('[API] No token in signup response!', response);
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
    // Auth endpoints don't require existing token
    const response = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    }, false);
    
    // CRITICAL: Store token IMMEDIATELY in localStorage
    const token = response.data?.token || response.token;
    if (token) {
        localStorage.setItem('authToken', token);
        console.log('[API] Token stored after login:', token.substring(0, 20) + '...');
        
        // Verify storage worked
        const stored = localStorage.getItem('authToken');
        if (stored !== token) {
            console.error('[API] Token storage verification FAILED!');
        }
    } else {
        console.warn('[API] No token in login response!', response);
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
 * Logout user - clears ALL auth data from localStorage
 */
function logoutAPI() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    console.log('[API] Logged out - all auth data cleared');
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
 * CRITICAL: Uses same auth pattern - token from localStorage
 * @param {object} presentation - Presentation object with title and slides
 * @param {string} theme - Theme name (professional, dark, modern, nature, corporate)
 * @returns {Promise<Blob>} PowerPoint file as blob
 */
async function exportToPowerPointAPI(presentation, theme = 'professional') {
    const url = `${API_BASE_URL}/generate/export`;
    
    // Get fresh token from localStorage for EVERY request
    const token = localStorage.getItem('authToken');
    
    // AUTH GUARD: Redirect if no token
    if (!token) {
        console.error('[API Export] No token found - redirecting to login');
        localStorage.removeItem('currentUser');
        showLoginPage();
        throw new Error('Please login to continue');
    }
    
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
    
    // Debug logging
    console.log('[API] POST /generate/export', {
        hasToken: !!token,
        tokenPreview: token ? `${token.substring(0, 20)}...` : 'none'
    });
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify({ presentation, theme })
        });
        
        // Handle 401 Unauthorized - clear auth and redirect
        if (response.status === 401) {
            console.warn('[API Export] 401 Unauthorized - clearing all auth data');
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
            showLoginPage();
            throw new Error('Session expired. Please login again.');
        }
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to export presentation (${response.status})`);
        }
        
        // Return blob for file download
        return await response.blob();
    } catch (error) {
        console.error('[API Export] Error:', error.message);
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
    console.log('API Response received:', JSON.stringify(apiResponse, null, 2));
    
    if (!apiResponse.slides || !Array.isArray(apiResponse.slides)) {
        return [];
    }
    
    const converted = apiResponse.slides.map((slide, index) => ({
        id: Date.now() + index,
        title: slide.slideTitle || `Slide ${index + 1}`,
        content: Array.isArray(slide.points) 
            ? slide.points.map(p => `• ${p}`).join('\n')
            : '• No content',
        imageUrl: slide.imageUrl || null,
        imageKeyword: slide.imageKeyword || null
    }));
    
    console.log('Converted slides:', JSON.stringify(converted, null, 2));
    return converted;
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
 * AUTH GUARD: This verifies token exists and is valid
 */
async function checkAuth() {
    const token = localStorage.getItem('authToken');
    
    // No token = not authenticated
    if (!token) {
        console.log('[API] checkAuth: No token found');
        showLoginPage();
        return null;
    }
    
    try {
        // Verify token is still valid with backend
        const response = await getMeAPI();
        if (response.data?.user) {
            console.log('[API] checkAuth: Token valid, user:', response.data.user.email);
            return response.data.user;
        }
    } catch (error) {
        console.error('[API] checkAuth failed:', error.message);
        // Clear invalid token
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
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
