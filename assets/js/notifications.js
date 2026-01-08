// Check for new posts and notify users
class PostNotificationManager {
    constructor() {
        this.STORAGE_KEY = 'last_known_post_count';
        this.CHECK_INTERVAL = 1000 * 60 * 60; // Check every hour
        this.lastCheck = localStorage.getItem('last_notification_check');
    }

    // Initialize notification checking
    async init() {
        // Check on app load
        await this.checkForNewPosts();
        
        // Set up periodic checks (when app is open)
        setInterval(() => this.checkForNewPosts(), this.CHECK_INTERVAL);
        
        // Check when app comes back online
        window.addEventListener('online', () => this.checkForNewPosts());
        
        // Check when app regains focus
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.checkForNewPosts();
            }
        });
    }

    // Fetch posts and check for new ones
    async checkForNewPosts() {
        try {
            const response = await fetch('data/posts.json');
            if (!response.ok) return;
            
            const posts = await response.json();
            const currentCount = posts.length;
            const lastKnownCount = parseInt(localStorage.getItem(this.STORAGE_KEY) || '0');
            
            if (lastKnownCount === 0) {
                // First time - just store the count
                localStorage.setItem(this.STORAGE_KEY, currentCount.toString());
                return;
            }
            
            if (currentCount > lastKnownCount) {
                const newPostsCount = currentCount - lastKnownCount;
                const newestPosts = posts
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .slice(0, newPostsCount);
                
                this.showNewPostNotification(newestPosts);
                localStorage.setItem(this.STORAGE_KEY, currentCount.toString());
            }
            
            localStorage.setItem('last_notification_check', Date.now().toString());
        } catch (error) {
            console.log('Could not check for new posts:', error);
        }
    }

    // Show in-app notification banner
    showNewPostNotification(newPosts) {
        const notification = document.createElement('div');
        notification.className = 'new-post-notification';
        
        const count = newPosts.length;
        const firstPost = newPosts[0];
        const title = count === 1 
            ? `New ${firstPost.type}: ${firstPost.title}` 
            : `${count} new ${firstPost.type}s available!`;
        
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">🎉</div>
                <div class="notification-text">
                    <strong>${title}</strong>
                    <p>${firstPost.summary.substring(0, 80)}...</p>
                </div>
                <div class="notification-actions">
                    <button class="notification-btn primary" onclick="window.location.href='${firstPost.type === 'blog' ? 'blog.html' : 'projects.html'}'">
                        View Now
                    </button>
                    <button class="notification-btn secondary" onclick="this.closest('.new-post-notification').remove()">
                        Later
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Auto-dismiss after 15 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 15000);
    }

    // Request permission for push notifications (for Option 2)
    async requestPushPermission() {
        if (!('Notification' in window)) {
            console.log('This browser does not support notifications');
            return false;
        }

        if (Notification.permission === 'granted') {
            return true;
        }

        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }

        return false;
    }

    // Show browser notification (requires permission)
    showBrowserNotification(title, options) {
        if (Notification.permission === 'granted') {
            const notification = new Notification(title, {
                icon: '/assets/img/icon-192.png',
                badge: '/assets/img/icon-192.png',
                ...options
            });

            notification.onclick = function(event) {
                event.preventDefault();
                window.focus();
                if (options.url) {
                    window.location.href = options.url;
                }
                notification.close();
            };
        }
    }
}

// Add notification styles
const style = document.createElement('style');
style.textContent = `
    .new-post-notification {
        position: fixed;
        top: 80px;
        right: 20px;
        max-width: 400px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        z-index: 10001;
        transform: translateX(450px);
        transition: transform 0.3s ease;
        overflow: hidden;
        border-left: 4px solid #667eea;
    }

    .new-post-notification.show {
        transform: translateX(0);
    }

    .notification-content {
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .notification-icon {
        font-size: 2rem;
        text-align: center;
    }

    .notification-text strong {
        display: block;
        font-size: 1.1rem;
        margin-bottom: 0.5rem;
        color: #333;
    }

    .notification-text p {
        color: #666;
        font-size: 0.9rem;
        line-height: 1.4;
        margin: 0;
    }

    .notification-actions {
        display: flex;
        gap: 0.5rem;
    }

    .notification-btn {
        flex: 1;
        padding: 0.75rem 1rem;
        border: none;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 0.9rem;
    }

    .notification-btn.primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
    }

    .notification-btn.primary:hover {
        opacity: 0.9;
        transform: translateY(-1px);
    }

    .notification-btn.secondary {
        background: #f0f0f0;
        color: #333;
    }

    .notification-btn.secondary:hover {
        background: #e0e0e0;
    }

    @media (max-width: 768px) {
        .new-post-notification {
            top: 10px;
            right: 10px;
            left: 10px;
            max-width: none;
            transform: translateY(-200px);
        }

        .new-post-notification.show {
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// Initialize on load
const notificationManager = new PostNotificationManager();
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => notificationManager.init());
} else {
    notificationManager.init();
}

// Export for use in service worker
if (typeof self !== 'undefined' && self.constructor.name === 'ServiceWorkerGlobalScope') {
    self.notificationManager = notificationManager;
}
