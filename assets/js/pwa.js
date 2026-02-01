// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        console.log('✅ Service Worker registered:', registration.scope);
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available
              showUpdateNotification();
            }
          });
        });
      })
      .catch((error) => {
        console.log('❌ Service Worker registration failed:', error);
      });
  });
}

// Show update notification
function showUpdateNotification() {
  const notification = document.createElement('div');
  notification.id = 'update-notification';
  notification.innerHTML = `
    <div style="
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: linear-gradient(135deg, #2662d9 0%, #2eb8a1 100%);
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 10000;
      display: flex;
      align-items: center;
      gap: 1rem;
      max-width: 400px;
    ">
      <div style="flex: 1;">
        <strong>New version available!</strong><br>
        <small>Refresh to update</small>
      </div>
      <button onclick="window.location.reload()" style="
        background: white;
        color: #2662d9;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        font-weight: 600;
        cursor: pointer;
      ">Refresh</button>
      <button onclick="this.parentElement.parentElement.remove()" style="
        background: transparent;
        color: white;
        border: 1px solid white;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        cursor: pointer;
      ">Later</button>
    </div>
  `;
  document.body.appendChild(notification);
}

// Prompt to install PWA
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent the default mini-infobar
  e.preventDefault();
  deferredPrompt = e;
  
  // Show custom install button
  showInstallPromotion();
});

function showInstallPromotion() {
  const installButton = document.createElement('button');
  installButton.id = 'install-button';
  installButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px; vertical-align: middle;">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="7 10 12 15 17 10"></polyline>
      <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
    Install App
  `;
  installButton.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 20px;
    background: linear-gradient(135deg, #2662d9 0%, #2eb8a1 100%);
    color: white;
    border: none;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    cursor: pointer;
    font-weight: 600;
    font-size: 1rem;
    z-index: 10000;
    display: flex;
    align-items: center;
    transition: all 0.3s ease;
  `;
  
  installButton.addEventListener('mouseenter', () => {
    installButton.style.transform = 'translateY(-2px)';
    installButton.style.boxShadow = '0 6px 16px rgba(0,0,0,0.3)';
  });
  
  installButton.addEventListener('mouseleave', () => {
    installButton.style.transform = 'translateY(0)';
    installButton.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
  });
  
  installButton.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user's response
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response: ${outcome}`);
    
    // Clear the deferred prompt
    deferredPrompt = null;
    
    // Remove the install button
    installButton.remove();
  });
  
  document.body.appendChild(installButton);
  
  // Auto-hide after 10 seconds
  setTimeout(() => {
    installButton.style.opacity = '0';
    setTimeout(() => installButton.remove(), 300);
  }, 10000);
}

// Handle app installed event
window.addEventListener('appinstalled', () => {
  console.log('✅ PWA installed successfully!');
  deferredPrompt = null;
  
  // Remove install button if present
  const installButton = document.getElementById('install-button');
  if (installButton) installButton.remove();
});

// Offline/Online indicators
window.addEventListener('online', () => {
  console.log('✅ Back online');
  showToast('Back online!', 'success');
});

window.addEventListener('offline', () => {
  console.log('📴 Offline mode');
  showToast('Offline mode - reading cached content', 'info');
});

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  const bgColor = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#2662d9';
  
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${bgColor};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Cache refresh functionality
async function refreshCache() {
  if ('serviceWorker' in navigator && 'caches' in window) {
    try {
      // Get all cache names
      const cacheNames = await caches.keys();
      
      // Delete all caches
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      
      console.log('🔄 Cache cleared successfully');
      showToast('Cache refreshed! Reloading...', 'success');
      
      // Unregister service worker and reload
      if (navigator.serviceWorker.controller) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(reg => reg.unregister()));
      }
      
      // Wait a moment then reload
      setTimeout(() => {
        window.location.reload(true);
      }, 1000);
    } catch (error) {
      console.error('❌ Error refreshing cache:', error);
      showToast('Error refreshing cache', 'error');
    }
  }
}

// Add click event to logo for cache refresh
window.addEventListener('DOMContentLoaded', () => {
  const logo = document.querySelector('.hero-logo, .nav-logo, img[alt*="Logo"], img[alt*="InfinitiLogic"]');
  if (logo) {
    logo.style.cursor = 'pointer';
    logo.addEventListener('click', (e) => {
      // Check if user is holding Shift key for cache refresh
      if (e.shiftKey) {
        e.preventDefault();
        if (confirm('Clear cache and refresh the site?')) {
          refreshCache();
        }
      }
    });
    
    // Add tooltip hint
    logo.title = 'Shift + Click to refresh cache';
  }
});

// Auto-refresh cache after 1 minute if online
let autoRefreshTimer = null;

function startAutoRefresh() {
  // Clear any existing timer
  if (autoRefreshTimer) {
    clearTimeout(autoRefreshTimer);
  }
  
  // Only start auto-refresh if online
  if (navigator.onLine && 'serviceWorker' in navigator) {
    autoRefreshTimer = setTimeout(async () => {
      console.log('⏰ Auto-refreshing cache after 1 minute...');
      
      // Check for service worker updates
      if (navigator.serviceWorker.controller) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.update();
          console.log('✅ Service worker updated');
        }
      }
      
      // Restart the timer for next auto-refresh
      startAutoRefresh();
    }, 60000); // 60000ms = 1 minute
  }
}

// Start auto-refresh on page load
window.addEventListener('load', () => {
  startAutoRefresh();
});

// Restart auto-refresh when coming back online
window.addEventListener('online', () => {
  console.log('✅ Back online - restarting auto-refresh');
  startAutoRefresh();
});

// Stop auto-refresh when going offline
window.addEventListener('offline', () => {
  console.log('📴 Offline - stopping auto-refresh');
  if (autoRefreshTimer) {
    clearTimeout(autoRefreshTimer);
    autoRefreshTimer = null;
  }
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
