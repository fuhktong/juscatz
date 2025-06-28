// About Page JavaScript

// Load about page
async function loadAboutPage(container) {
    try {
        const response = await fetch('/settings/about.html');
        const html = await response.text();
        container.innerHTML = html;
        
        // Initialize about functionality
        initializeAbout();
    } catch (error) {
        console.error('Failed to load about page:', error);
        container.innerHTML = '<div class="error-message">Failed to load about page</div>';
    }
}

// Initialize about functionality
function initializeAbout() {
    // All functionality is handled by onclick attributes in the HTML
    // This function exists for consistency with other pages
    console.log('About page initialized');
}

// Open external links
function openLink(url) {
    // Check if it's an email link
    if (url.startsWith('mailto:')) {
        window.location.href = url;
        return;
    }
    
    // For regular URLs, open in new tab/window
    // In a real app, you might want to open in-app browser or external browser
    if (window.open) {
        window.open(url, '_blank', 'noopener,noreferrer');
    } else {
        // Fallback for environments where window.open might be blocked
        window.location.href = url;
    }
}

// Get app version (could be dynamic in a real app)
function getAppVersion() {
    return '1.0.0';
}

// Get build info (could be dynamic in a real app)
function getBuildInfo() {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    return `Build ${year}.${month}.${day}`;
}

// Export functions for use in main app
if (typeof window !== 'undefined') {
    window.AboutPage = {
        loadAboutPage
    };
    
    // Make openLink globally available for onclick handlers
    window.openLink = openLink;
}