// Notifications Page JavaScript

// Load notifications page
function loadNotificationsPage() {
    const contentArea = document.getElementById('page-content');
    if (contentArea) {
        contentArea.innerHTML = `
            <div class="notifications-page">
                <div class="notifications-container">
                    <div class="notifications-header">
                        <h2>Notifications</h2>
                        <button class="notifications-mark-all-read-btn" id="markAllReadBtn">Mark all as read</button>
                    </div>
                    <div class="notifications-list" id="notificationsList">
                        <div class="notifications-loading">Loading notifications...</div>
                    </div>
                </div>
            </div>
        `;
        
        // Load notifications after DOM is ready
        setTimeout(loadMockNotifications, 100);
        
        // Add mark all as read functionality
        const markAllBtn = document.getElementById('markAllReadBtn');
        if (markAllBtn) {
            markAllBtn.addEventListener('click', markAllNotificationsAsRead);
        }
    }
}

// Load mock notifications
function loadMockNotifications() {
    const notificationsList = document.getElementById('notificationsList');
    if (!notificationsList) return;
    
    const mockNotifications = [
        {
            id: 1,
            type: 'like',
            user: 'catmom2024',
            avatar: 'cat-pics/cat1.png',
            message: 'liked your post',
            time: '5m',
            isRead: false,
            postImage: 'cat-pics/cat2.png'
        },
        {
            id: 2,
            type: 'comment',
            user: 'whiskers_photo',
            avatar: 'cat-pics/cat3.png',
            message: 'commented: "Such a beautiful cat! 😍"',
            time: '15m',
            isRead: false,
            postImage: 'cat-pics/cat4.png'
        },
        {
            id: 3,
            type: 'follow',
            user: 'fluffymeows',
            avatar: 'cat-pics/cat5.png',
            message: 'started following you',
            time: '1h',
            isRead: true
        },
        {
            id: 4,
            type: 'like',
            user: 'kitty_adventures',
            avatar: 'cat-pics/cat7.png',
            message: 'liked your post',
            time: '2h',
            isRead: true,
            postImage: 'cat-pics/cat6.png'
        },
        {
            id: 5,
            type: 'mention',
            user: 'cuddly_cats',
            avatar: 'cat-pics/cat9.png',
            message: 'mentioned you in a comment',
            time: '3h',
            isRead: true,
            postImage: 'cat-pics/cat8.png'
        }
    ];
    
    notificationsList.innerHTML = mockNotifications.map(notification => `
        <div class="notifications-item ${notification.isRead ? 'read' : 'unread'}" data-notification-id="${notification.id}">
            <img src="${notification.avatar}" alt="${notification.user}" class="notifications-avatar">
            <div class="notifications-content">
                <div class="notifications-text">
                    <strong>${notification.user}</strong> ${notification.message}
                </div>
                <div class="notifications-time">${notification.time}</div>
            </div>
            ${notification.postImage ? `<img src="${notification.postImage}" alt="Post" class="notifications-post-image">` : ''}
            ${!notification.isRead ? '<div class="notifications-dot"></div>' : ''}
        </div>
    `).join('');
}

// Mark all notifications as read
function markAllNotificationsAsRead() {
    const notifications = document.querySelectorAll('.notifications-item.unread');
    notifications.forEach(notification => {
        notification.classList.remove('unread');
        notification.classList.add('read');
        const dot = notification.querySelector('.notifications-dot');
        if (dot) {
            dot.remove();
        }
    });
    
    // Update button text
    const markAllBtn = document.getElementById('markAllReadBtn');
    if (markAllBtn) {
        markAllBtn.textContent = 'All read ✓';
        markAllBtn.disabled = true;
    }
}

// Export functions for use in main app
if (typeof window !== 'undefined') {
    window.NotificationsPage = {
        loadNotificationsPage,
        loadMockNotifications,
        markAllNotificationsAsRead
    };
}