// Post Creation Page JavaScript

// Load post creation page
async function loadPostPage(container) {
    try {
        const response = await fetch('/posts/post.html');
        const html = await response.text();
        container.innerHTML = html;
        
        // Initialize post creation functionality
        initializePostCreation();
    } catch (error) {
        console.error('Failed to load post page:', error);
        container.innerHTML = '<div class="post-error">Failed to load post page</div>';
    }
}

// Initialize post creation functionality
function initializePostCreation() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const uploadPlaceholder = document.getElementById('uploadPlaceholder');
    const previewContainer = document.getElementById('previewContainer');
    const previewImage = document.getElementById('previewImage');
    const previewVideo = document.getElementById('previewVideo');
    const removeMediaBtn = document.getElementById('removeMediaBtn');
    const captionInput = document.getElementById('captionInput');
    const charCount = document.getElementById('charCount');
    const submitBtn = document.getElementById('postSubmitBtn');
    const cancelBtn = document.getElementById('cancelBtn');

    let selectedFile = null;

    // File upload handlers
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });

    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('post-upload-dragover');
    });

    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('post-upload-dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('post-upload-dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelection(files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileSelection(e.target.files[0]);
        }
    });

    // Remove media handler
    removeMediaBtn.addEventListener('click', () => {
        selectedFile = null;
        fileInput.value = '';
        showUploadPlaceholder();
        updateSubmitButton();
    });

    // Caption input handlers
    captionInput.addEventListener('input', (e) => {
        const length = e.target.value.length;
        charCount.textContent = length;
        
        if (length > 1900) {
            charCount.style.color = '#dc3545';
        } else if (length > 1500) {
            charCount.style.color = '#ffc107';
        } else {
            charCount.style.color = '#666';
        }

        updateSubmitButton();
    });

    // Submit handler
    submitBtn.addEventListener('click', handleSubmit);

    // Cancel handler
    cancelBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to cancel? Your post will be lost.')) {
            // Navigate back to home or previous page
            if (window.loadPage) {
                window.loadPage('home');
            }
        }
    });

    // Handle file selection
    function handleFileSelection(file) {
        // Validate file type
        if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
            alert('Please select an image or video file.');
            return;
        }

        // Validate file size (10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert('File size must be less than 10MB.');
            return;
        }

        selectedFile = file;
        showPreview(file);
        updateSubmitButton();
    }

    // Show file preview
    function showPreview(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            uploadPlaceholder.style.display = 'none';
            previewContainer.style.display = 'block';

            if (file.type.startsWith('image/')) {
                previewImage.src = e.target.result;
                previewImage.style.display = 'block';
                previewVideo.style.display = 'none';
            } else if (file.type.startsWith('video/')) {
                previewVideo.src = e.target.result;
                previewVideo.style.display = 'block';
                previewImage.style.display = 'none';
            }
        };

        reader.readAsDataURL(file);
    }

    // Show upload placeholder
    function showUploadPlaceholder() {
        uploadPlaceholder.style.display = 'block';
        previewContainer.style.display = 'none';
        previewImage.src = '';
        previewVideo.src = '';
    }

    // Update submit button state
    function updateSubmitButton() {
        const hasFile = selectedFile !== null;
        const hasCaption = captionInput.value.trim().length > 0;
        
        // Enable if has file (caption is optional)
        submitBtn.disabled = !hasFile;
        
        if (hasFile) {
            submitBtn.classList.add('post-submit-enabled');
        } else {
            submitBtn.classList.remove('post-submit-enabled');
        }
    }

    // Handle form submission
    async function handleSubmit() {
        if (!selectedFile) {
            alert('Please select a file to upload.');
            return;
        }

        const submitText = document.querySelector('.post-submit-text');
        const submitLoader = document.querySelector('.post-submit-loader');
        
        // Show loading state
        submitBtn.disabled = true;
        submitText.style.display = 'none';
        submitLoader.style.display = 'inline';

        try {
            // Prepare form data
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('caption', captionInput.value.trim());
            formData.append('location', document.getElementById('locationInput').value.trim());
            formData.append('allow_comments', document.getElementById('allowCommentsCheckbox').checked);
            formData.append('show_in_feed', document.getElementById('showInFeedCheckbox').checked);

            // Submit to API
            const response = await fetch('/posts/posts.php', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to create post');
            }

            // Success
            showSuccessMessage('Post created successfully!');
            
            // Reset form
            resetForm();
            
            // Navigate to profile after short delay
            setTimeout(() => {
                if (window.loadPage) {
                    window.loadPage('profile');
                }
            }, 2000);

        } catch (error) {
            console.error('Post creation failed:', error);
            showErrorMessage(error.message || 'Failed to create post. Please try again.');
        } finally {
            // Reset button state
            submitText.style.display = 'inline';
            submitLoader.style.display = 'none';
            submitBtn.disabled = false;
        }
    }

    // Get auth token (helper function)
    function getAuthToken() {
        return localStorage.getItem('juscatz_token') || sessionStorage.getItem('juscatz_token');
    }

    // Reset form
    function resetForm() {
        selectedFile = null;
        fileInput.value = '';
        captionInput.value = '';
        document.getElementById('locationInput').value = '';
        document.getElementById('allowCommentsCheckbox').checked = true;
        document.getElementById('showInFeedCheckbox').checked = true;
        charCount.textContent = '0';
        showUploadPlaceholder();
        updateSubmitButton();
    }

    // Show success message
    function showSuccessMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'post-message post-success';
        messageDiv.textContent = message;
        
        const container = document.querySelector('.post-create-container');
        container.insertBefore(messageDiv, container.firstChild);
        
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }

    // Show error message
    function showErrorMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'post-message post-error';
        messageDiv.textContent = message;
        
        const container = document.querySelector('.post-create-container');
        container.insertBefore(messageDiv, container.firstChild);
        
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }
}

// Export functions for use in main app
if (typeof window !== 'undefined') {
    window.PostPage = {
        loadPostPage
    };
}