class QuickArabicBackground {
  constructor() {
    this.init();
  }
  
  init() {
    // Handle extension installation
    chrome.runtime.onInstalled.addListener(this.handleInstall.bind(this));
    
    // Handle keyboard shortcuts
    chrome.commands.onCommand.addListener(this.handleCommand.bind(this));
    
    // Handle messages from content script and popup
    chrome.runtime.onMessage.addListener(this.handleMessage.bind(this));
    
    // Handle tab updates to inject content script if needed
    chrome.tabs.onUpdated.addListener(this.handleTabUpdate.bind(this));
    
    console.log('QuickArabic Background: Service worker started');
  }
  
  async handleInstall(details) {
    console.log('QuickArabic: Extension installed/updated', details.reason);
    
    // Set default settings
    const defaultSettings = {
      extensionEnabled: true,
      triggerMethod: 'ctrl-space',
      previewEnabled: true,
      customMappings: {},
      enabledSites: [],
      enableOnAllSites: true
    };
    
    // Only set defaults if this is a fresh install
    if (details.reason === 'install') {
      await chrome.storage.sync.set(defaultSettings);
      
      // Show welcome page or notification
      this.showWelcomeNotification();
    }
  }
  
  async handleCommand(command) {
    console.log('QuickArabic: Command received:', command);
    
    switch (command) {
      case 'convert-text':
        await this.sendToActiveTab({ action: 'convert-text' });
        break;
      case 'toggle-extension':
        await this.toggleExtension();
        break;
    }
  }
  
  async handleMessage(message, sender, sendResponse) {
    console.log('QuickArabic Background: Message received:', message);
    
    switch (message.action) {
      case 'get-settings':
        const settings = await chrome.storage.sync.get();
        sendResponse(settings);
        break;
        
      case 'save-settings':
        await chrome.storage.sync.set(message.settings);
        sendResponse({ success: true });
        break;
        
      case 'toggle-extension':
        const result = await this.toggleExtension();
        sendResponse(result);
        break;
        
      case 'get-tab-info':
        const tab = await this.getActiveTab();
        sendResponse({ 
          url: tab ? tab.url : null,
          title: tab ? tab.title : null
        });
        break;
        
      default:
        sendResponse({ error: 'Unknown action' });
    }
  }
  
  async handleTabUpdate(tabId, changeInfo, tab) {
    // Only handle complete loads
    if (changeInfo.status !== 'complete') return;
    
    // Skip special pages
    if (tab.url.startsWith('chrome://') || 
        tab.url.startsWith('chrome-extension://') ||
        tab.url.startsWith('moz-extension://')) {
      return;
    }
    
    // Check if extension should be active on this site
    try {
      const settings = await chrome.storage.sync.get({
        extensionEnabled: true,
        enableOnAllSites: true,
        enabledSites: []
      });
      
      if (!settings.extensionEnabled) return;
      
      const hostname = new URL(tab.url).hostname;
      
      const shouldActivate = settings.enableOnAllSites || 
                           settings.enabledSites.includes(hostname);
      
      if (shouldActivate) {
        // Inject content script if not already injected
        try {
          await chrome.tabs.sendMessage(tabId, { action: 'ping' });
        } catch (error) {
          // Content script not injected, inject it
          console.log('Injecting content script into tab:', tabId);
          await this.injectContentScript(tabId);
        }
      }
    } catch (error) {
      console.error('Error handling tab update:', error);
    }
  }
  
  async injectContentScript(tabId) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ['transliterator.js', 'content.js']
      });
      
      await chrome.scripting.insertCSS({
        target: { tabId },
        files: ['content.css']
      });
      
      console.log('Content script injected successfully');
    } catch (error) {
      console.error('Failed to inject content script:', error);
    }
  }
  
  async toggleExtension() {
    try {
      const result = await chrome.storage.sync.get({ extensionEnabled: true });
      const newState = !result.extensionEnabled;
      
      await chrome.storage.sync.set({ extensionEnabled: newState });
      
      // Notify all tabs
      const tabs = await chrome.tabs.query({});
      
      for (const tab of tabs) {
        try {
          await chrome.tabs.sendMessage(tab.id, {
            action: 'toggle-extension',
            enabled: newState
          });
        } catch (error) {
          // Tab might not have content script, ignore
        }
      }
      
      // Show notification
      const message = newState ? 'QuickArabic Enabled' : 'QuickArabic Disabled';
      this.showNotification(message, newState ? '✅' : '❌');
      
      return { enabled: newState };
    } catch (error) {
      console.error('Error toggling extension:', error);
      return { error: 'Failed to toggle extension' };
    }
  }
  
  async sendToActiveTab(message) {
    try {
      const tab = await this.getActiveTab();
      if (tab) {
        // Check if tab can receive messages (not chrome:// or extension pages)
        if (tab.url.startsWith('chrome://') || 
            tab.url.startsWith('chrome-extension://') ||
            tab.url.startsWith('moz-extension://') ||
            tab.url.startsWith('about:')) {
          console.log('Cannot send message to special page:', tab.url);
          return;
        }
        
        try {
          await chrome.tabs.sendMessage(tab.id, message);
        } catch (error) {
          // Try to inject content script first, then retry
          console.log('Content script not found, injecting...');
          await this.injectContentScript(tab.id);
          
          // Wait a bit and retry
          setTimeout(async () => {
            try {
              await chrome.tabs.sendMessage(tab.id, message);
            } catch (retryError) {
              console.log('Message still failed after injection:', retryError.message);
            }
          }, 500);
        }
      }
    } catch (error) {
      console.error('Error sending message to active tab:', error);
    }
  }
  
  async getActiveTab() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      return tab;
    } catch (error) {
      console.error('Error getting active tab:', error);
      return null;
    }
  }
  
  showWelcomeNotification() {
    this.showNotification(
      'QuickArabic installed! Use Ctrl+Space to convert text to Arabic.',
      '🎉'
    );
  }
  
  showNotification(message, iconText = '🔤') {
    // Create a simple notification using the badge
    try {
      chrome.action.setBadgeText({ text: iconText });
      chrome.action.setBadgeBackgroundColor({ color: '#4CAF50' });
      chrome.action.setTitle({ title: message });
      
      // Clear badge after 3 seconds
      setTimeout(() => {
        chrome.action.setBadgeText({ text: '' });
        chrome.action.setTitle({ title: 'QuickArabic - Arabic Transliteration' });
      }, 3000);
    } catch (error) {
      console.log('Could not show notification:', error);
    }
  }
  
  // Handle context menu (future feature)
  setupContextMenu() {
    chrome.contextMenus.create({
      id: 'convert-to-arabic',
      title: 'Convert to Arabic',
      contexts: ['selection'],
      documentUrlPatterns: ['http://*/*', 'https://*/*']
    });
    
    chrome.contextMenus.onClicked.addListener((info, tab) => {
      if (info.menuItemId === 'convert-to-arabic' && info.selectionText) {
        chrome.tabs.sendMessage(tab.id, {
          action: 'convert-selection',
          text: info.selectionText
        });
      }
    });
  }
}

// Initialize background script
new QuickArabicBackground();