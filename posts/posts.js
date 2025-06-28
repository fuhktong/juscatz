// Posts Display Page JavaScript

// Load posts page
async function loadPostsPage(container, postId) {
    try {
        const response = await fetch('/posts/posts.html');
        const html = await response.text();
        container.innerHTML = html;
        
        // Initialize posts functionality
        initializePosts(postId);
    } catch (error) {
        console.error('Failed to load posts page:', error);
        container.innerHTML = '<div class="posts-error">Failed to load posts page</div>';
    }
}

// Initialize posts functionality
function initializePosts(postId) {
    // Get current post ID from URL or parameter
    const currentPostId = postId || getPostIdFromUrl();
    
    if (!currentPostId) {
        showError('Post ID not found');
        return;
    }
    
    // Load post data
    loadPost(currentPostId);
    
    // Initialize event listeners
    initializeEventListeners();
}

// Get post ID from URL
function getPostIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id') || urlParams.get('post_id');
}

// Initialize all event listeners
function initializeEventListeners() {
    // Like button
    const likeBtn = document.getElementById('likeBtn');
    if (likeBtn) {
        likeBtn.addEventListener('click', handleLike);
    }
    
    // Comment button (scroll to comments)
    const commentBtn = document.getElementById('commentBtn');
    if (commentBtn) {
        commentBtn.addEventListener('click', () => {
            const commentsSection = document.querySelector('.posts-comments-section');
            if (commentsSection) {
                commentsSection.scrollIntoView({ behavior: 'smooth' });
                document.getElementById('commentInput').focus();
            }
        });
    }
    
    // Share button
    const shareBtn = document.getElementById('shareBtn');
    if (shareBtn) {
        shareBtn.addEventListener('click', handleShare);
    }
    
    // Save button
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', handleSave);
    }
    
    // Double-tap to like on media
    const mediaContainer = document.getElementById('mediaContainer');
    if (mediaContainer) {
        let tapCount = 0;
        mediaContainer.addEventListener('click', () => {
            tapCount++;
            if (tapCount === 1) {
                setTimeout(() => {
                    if (tapCount === 2) {
                        handleDoubleTapLike();
                    }
                    tapCount = 0;
                }, 300);
            }
        });
    }
    
    // Comment input and submit
    const commentInput = document.getElementById('commentInput');
    const commentSubmitBtn = document.getElementById('commentSubmitBtn');
    
    if (commentInput && commentSubmitBtn) {
        commentInput.addEventListener('input', () => {
            const hasText = commentInput.value.trim().length > 0;
            commentSubmitBtn.disabled = !hasText;
        });
        
        commentInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !commentSubmitBtn.disabled) {
                handleAddComment();
            }
        });
        
        commentSubmitBtn.addEventListener('click', handleAddComment);
    }
    
    // Share modal
    const shareModal = document.getElementById('shareModal');
    const shareCloseBtn = document.getElementById('shareCloseBtn');
    
    if (shareCloseBtn) {
        shareCloseBtn.addEventListener('click', closeShareModal);
    }
    
    if (shareModal) {
        shareModal.addEventListener('click', (e) => {
            if (e.target === shareModal) {
                closeShareModal();
            }
        });
        
        // Share options
        const shareOptions = shareModal.querySelectorAll('.posts-share-option');
        shareOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                const shareType = e.currentTarget.dataset.share;
                handleShareOption(shareType);
            });
        });
    }
}

// Load post data
async function loadPost(postId) {
    try {
        showLoading();
        
        const response = await fetch(`/posts/posts.php?action=get&id=${postId}`);
        const result = await response.json();
        
        if (result.success && result.post) {
            displayPost(result.post);
            loadComments(postId);
        } else {
            showError(result.message || 'Post not found');
        }
        
        hideLoading();
    } catch (error) {
        console.error('Failed to load post:', error);
        hideLoading();
        showError('Failed to load post');
    }
}

// Display post data
function displayPost(post) {
    // User info
    document.getElementById('postUsername').textContent = post.username || 'Unknown User';
    document.getElementById('postTimestamp').textContent = formatTimestamp(post.created_at);
    
    // User avatar
    const userAvatar = document.getElementById('userAvatar');
    if (post.profile_picture) {
        userAvatar.src = post.profile_picture;
    }
    
    // Media
    const mediaContainer = document.getElementById('mediaContainer');
    const postImage = document.getElementById('postImage');
    const postVideo = document.getElementById('postVideo');
    
    if (post.media_type === 'image') {
        postImage.src = post.media_url;
        postImage.style.display = 'block';
        postVideo.style.display = 'none';
    } else if (post.media_type === 'video') {
        postVideo.src = post.media_url;
        postVideo.style.display = 'block';
        postImage.style.display = 'none';
    }
    
    // Caption
    if (post.caption && post.caption.trim()) {
        const captionElement = document.getElementById('postCaption');
        const captionUsername = document.getElementById('captionUsername');
        const captionText = document.getElementById('captionText');
        
        captionUsername.textContent = post.username;
        captionText.textContent = post.caption;
        captionElement.style.display = 'block';
    }
    
    // Like count and status
    updateLikeDisplay(post.like_count, post.user_liked);
    
    // Comment count
    updateCommentCount(post.comment_count);
    
    // Store post data globally
    window.currentPost = post;
}

// Load comments
async function loadComments(postId) {
    try {
        const response = await fetch(`/posts/posts.php?action=get_comments&post_id=${postId}`);
        const result = await response.json();
        
        if (result.success) {
            displayComments(result.comments || []);
        }
    } catch (error) {
        console.error('Failed to load comments:', error);
    }
}

// Display comments
function displayComments(comments) {
    const commentsList = document.getElementById('commentsList');
    
    if (comments.length === 0) {
        commentsList.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">No comments yet. Be the first to comment!</p>';
        return;
    }
    
    commentsList.innerHTML = '';
    
    comments.forEach(comment => {
        const commentElement = createCommentElement(comment);
        commentsList.appendChild(commentElement);
    });
}

// Create comment element
function createCommentElement(comment) {
    const commentDiv = document.createElement('div');
    commentDiv.className = 'posts-comment';
    commentDiv.innerHTML = `
        <div class="posts-comment-avatar">
            <img src="${comment.profile_picture || '/images/default-profile-pic.png'}" alt="${comment.username}">
        </div>
        <div class="posts-comment-content">
            <div>
                <span class="posts-comment-user">${comment.username}</span>
                <span class="posts-comment-text">${comment.comment_text}</span>
            </div>
            <div class="posts-comment-meta">
                <span class="posts-comment-time">${formatTimestamp(comment.created_at)}</span>
                <button class="posts-comment-like-btn ${comment.user_liked ? 'liked' : ''}" 
                        data-comment-id="${comment.id}">
                    ${comment.like_count > 0 ? `${comment.like_count} likes` : 'Like'}
                </button>
            </div>
        </div>
    `;
    
    // Add comment like functionality
    const likeBtn = commentDiv.querySelector('.posts-comment-like-btn');
    likeBtn.addEventListener('click', () => handleCommentLike(comment.id, likeBtn));
    
    return commentDiv;
}

// Handle like
async function handleLike() {
    if (!window.currentPost) return;
    
    try {
        const action = window.currentPost.user_liked ? 'unlike' : 'like';
        const response = await fetch('/posts/posts.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=${action}&post_id=${window.currentPost.id}`
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Update local state
            window.currentPost.user_liked = !window.currentPost.user_liked;
            window.currentPost.like_count = result.like_count;
            
            // Update UI
            updateLikeDisplay(result.like_count, window.currentPost.user_liked);
            
            // Animate like button
            const likeBtn = document.getElementById('likeBtn');
            if (window.currentPost.user_liked) {
                likeBtn.classList.add('liked');
            } else {
                likeBtn.classList.remove('liked');
            }
        }
    } catch (error) {
        console.error('Failed to like post:', error);
    }
}

// Handle double-tap like
function handleDoubleTapLike() {
    if (!window.currentPost || window.currentPost.user_liked) return;
    
    // Show like animation
    const likeOverlay = document.getElementById('likeOverlay');
    likeOverlay.classList.add('show');
    
    setTimeout(() => {
        likeOverlay.classList.remove('show');
    }, 600);
    
    // Perform like action
    handleLike();
}

// Handle add comment
async function handleAddComment() {
    const commentInput = document.getElementById('commentInput');
    const commentText = commentInput.value.trim();
    
    if (!commentText || !window.currentPost) return;
    
    try {
        const response = await fetch('/posts/posts.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=add_comment&post_id=${window.currentPost.id}&comment=${encodeURIComponent(commentText)}`
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Clear input
            commentInput.value = '';
            document.getElementById('commentSubmitBtn').disabled = true;
            
            // Reload comments
            loadComments(window.currentPost.id);
            
            // Update comment count
            window.currentPost.comment_count++;
            updateCommentCount(window.currentPost.comment_count);
        } else {
            alert(result.message || 'Failed to add comment');
        }
    } catch (error) {
        console.error('Failed to add comment:', error);
        alert('Failed to add comment');
    }
}

// Handle comment like
async function handleCommentLike(commentId, buttonElement) {
    try {
        const isLiked = buttonElement.classList.contains('liked');
        const action = isLiked ? 'unlike_comment' : 'like_comment';
        
        const response = await fetch('/posts/posts.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=${action}&comment_id=${commentId}`
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Update button state
            if (isLiked) {
                buttonElement.classList.remove('liked');
                buttonElement.textContent = result.like_count > 0 ? `${result.like_count} likes` : 'Like';
            } else {
                buttonElement.classList.add('liked');
                buttonElement.textContent = result.like_count > 0 ? `${result.like_count} likes` : '1 like';
            }
        }
    } catch (error) {
        console.error('Failed to like comment:', error);
    }
}

// Handle share
function handleShare() {
    const shareModal = document.getElementById('shareModal');
    shareModal.style.display = 'flex';
}

// Close share modal
function closeShareModal() {
    const shareModal = document.getElementById('shareModal');
    shareModal.style.display = 'none';
}

// Handle share option
async function handleShareOption(shareType) {
    const postUrl = `${window.location.origin}${window.location.pathname}?id=${window.currentPost.id}`;
    
    switch (shareType) {
        case 'copy':
            try {
                await navigator.clipboard.writeText(postUrl);
                alert('Link copied to clipboard!');
            } catch (error) {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = postUrl;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                alert('Link copied to clipboard!');
            }
            break;
        case 'message':
            // In a real app, this would open a message composer
            alert('Share via message feature coming soon!');
            break;
    }
    
    closeShareModal();
}

// Handle save
async function handleSave() {
    // Save functionality would go here
    const saveBtn = document.getElementById('saveBtn');
    const isSaved = saveBtn.classList.contains('saved');
    
    if (isSaved) {
        saveBtn.classList.remove('saved');
        alert('Post removed from saved');
    } else {
        saveBtn.classList.add('saved');
        alert('Post saved');
    }
}

// Update like display
function updateLikeDisplay(likeCount, userLiked) {
    const likeCountElement = document.getElementById('likeCount');
    const likeCountText = document.getElementById('likeCountText');
    const likeBtn = document.getElementById('likeBtn');
    
    if (likeCount > 0) {
        likeCountText.textContent = `${likeCount} ${likeCount === 1 ? 'like' : 'likes'}`;
        likeCountElement.style.display = 'block';
    } else {
        likeCountElement.style.display = 'none';
    }
    
    if (userLiked) {
        likeBtn.classList.add('liked');
    } else {
        likeBtn.classList.remove('liked');
    }
}

// Update comment count
function updateCommentCount(count) {
    const commentCountElement = document.getElementById('commentCount');
    commentCountElement.textContent = count || 0;
}

// Format timestamp
function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
        return 'Just now';
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours}h ago`;
    } else if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days}d ago`;
    } else {
        return date.toLocaleDateString();
    }
}

// Show loading
function showLoading() {
    document.getElementById('loadingState').style.display = 'flex';
    document.querySelector('.posts-content').style.display = 'none';
}

// Hide loading
function hideLoading() {
    document.getElementById('loadingState').style.display = 'none';
    document.querySelector('.posts-content').style.display = 'block';
}

// Show error
function showError(message) {
    const errorState = document.getElementById('errorState');
    errorState.querySelector('p').textContent = message || 'An error occurred';
    errorState.style.display = 'flex';
    document.querySelector('.posts-content').style.display = 'none';
}

// Export functions for use in main app
if (typeof window !== 'undefined') {
    window.PostsPage = {
        loadPostsPage
    };
}