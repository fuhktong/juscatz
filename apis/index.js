// API Index
// Main entry point for all API modules

// Load all API modules
const scripts = [
    'config.js',
    'client.js', 
    'auth.js',
    'users.js',
    'posts.js'
];

// Load scripts dynamically in browser environment
if (typeof window !== 'undefined') {
    scripts.forEach(script => {
        const scriptElement = document.createElement('script');
        scriptElement.src = `apis/${script}`;
        scriptElement.async = false; // Maintain load order
        document.head.appendChild(scriptElement);
    });
    
    // Create unified API interface
    window.addEventListener('load', () => {
        window.JusCatzAPI = {
            auth: window.AuthAPI,
            users: window.UsersAPI,
            posts: window.PostsAPI,
            config: window.APIConfig,
            client: window.APIClient
        };
    });
}

// Node.js environment exports
if (typeof module !== 'undefined' && module.exports) {
    const APIConfig = require('./config.js');
    const APIClient = require('./client.js');
    const AuthAPI = require('./auth.js');
    const UsersAPI = require('./users.js');
    const PostsAPI = require('./posts.js');
    
    module.exports = {
        auth: new AuthAPI(),
        users: new UsersAPI(),
        posts: new PostsAPI(),
        config: new APIConfig(),
        client: new APIClient()
    };
}

// Simple API usage examples:
/*

// Authentication
await JusCatzAPI.auth.login({
    emailOrUsername: 'test@example.com',
    password: 'password123',
    rememberMe: true
});

// Get user profile
const profile = await JusCatzAPI.users.getProfile();

// Create a post
const newPost = await JusCatzAPI.posts.createPost({
    caption: 'Look at my cute cat! #catsofinstagram',
    imageUrl: 'https://example.com/cat.jpg',
    hashtags: ['catsofinstagram', 'cute'],
    visibility: 'public'
});

// Get feed
const feed = await JusCatzAPI.posts.getFeed(1, 20);

*/