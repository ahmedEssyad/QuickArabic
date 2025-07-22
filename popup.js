class PopupController {
  constructor() {
    this.transliterator = null;
    this.currentTab = null;
    
    this.init();
  }
  
  async init() {
    // Initialize transliterator safely
    try {
      if (typeof ArabicTransliterator === 'undefined') {
        console.error('ArabicTransliterator not loaded yet, retrying...');
        setTimeout(() => this.init(), 100);
        return;
      }
      
      this.transliterator = new ArabicTransliterator();
      await this.transliterator.loadSettings();
      await this.getCurrentTab();
      
      this.setupEventListeners();
      this.loadSettings();
      this.updateStatus();
      this.loadCustomMappings();
      
      console.log('QuickArabic Popup: Initialized');
    } catch (error) {
      console.error('Failed to initialize popup:', error);
      // Show error state in popup
      this.showError('Failed to load extension. Please refresh the page.');
    }
  }
  
  async getCurrentTab() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      this.currentTab = tab;
      
      const hostname = new URL(tab.url).hostname;
      document.getElementById('currentSite').textContent = hostname;
    } catch (error) {
      console.error('Error getting current tab:', error);
      document.getElementById('currentSite').textContent = 'Unknown';
    }
  }
  
  setupEventListeners() {
    // Extension toggle
    document.getElementById('extensionToggle').addEventListener('change', this.handleExtensionToggle.bind(this));
    
    // Trigger method
    document.querySelectorAll('input[name="triggerMethod"]').forEach(radio => {
      radio.addEventListener('change', this.handleTriggerMethodChange.bind(this));
    });
    
    // Preview toggle
    document.getElementById('previewToggle').addEventListener('change', this.handlePreviewToggle.bind(this));
    
    // Custom mappings
    document.getElementById('addMapping').addEventListener('click', this.handleAddMapping.bind(this));
    document.getElementById('customLatin').addEventListener('keypress', this.handleMappingKeypress.bind(this));
    document.getElementById('customArabic').addEventListener('keypress', this.handleMappingKeypress.bind(this));
    
    // Website settings
    document.getElementById('enableOnAllSites').addEventListener('change', this.handleAllSitesToggle.bind(this));
    document.getElementById('enableCurrentSite').addEventListener('change', this.handleCurrentSiteToggle.bind(this));
    
    // Test conversion
    document.getElementById('testConvert').addEventListener('click', this.handleTestConversion.bind(this));
    document.getElementById('testInput').addEventListener('input', this.handleTestInput.bind(this));
    document.getElementById('testInput').addEventListener('keypress', this.handleTestKeypress.bind(this));
    
    // Quick actions
    document.getElementById('resetSettings').addEventListener('click', this.handleResetSettings.bind(this));
    document.getElementById('exportSettings').addEventListener('click', this.handleExportSettings.bind(this));
  }
  
  async loadSettings() {
    try {
      const result = await chrome.storage.sync.get({
        extensionEnabled: true,
        triggerMethod: 'ctrl-space',
        previewEnabled: true,
        enabledSites: [],
        enableOnAllSites: true
      });
      
      // Extension toggle
      document.getElementById('extensionToggle').checked = result.extensionEnabled;
      
      // Trigger method
      document.getElementById('ctrlSpace').checked = result.triggerMethod === 'ctrl-space';
      document.getElementById('doubleSpace').checked = result.triggerMethod === 'double-space';
      
      // Preview
      document.getElementById('previewToggle').checked = result.previewEnabled;
      
      // Website settings
      const enableOnAllSites = result.enableOnAllSites;
      document.getElementById('enableOnAllSites').checked = enableOnAllSites;
      
      const siteSpecificDiv = document.getElementById('siteSpecificSettings');
      if (enableOnAllSites) {
        siteSpecificDiv.style.display = 'none';
      } else {
        siteSpecificDiv.style.display = 'block';
        if (this.currentTab) {
          const hostname = new URL(this.currentTab.url).hostname;
          const isEnabled = result.enabledSites.includes(hostname);
          document.getElementById('enableCurrentSite').checked = isEnabled;
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }
  
  async updateStatus() {
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');
    
    try {
      if (!this.currentTab) {
        statusDot.className = 'status-dot inactive';
        statusText.textContent = 'Cannot access this page';
        return;
      }
      
      // Check if this is a special page where extension can't run
      if (this.currentTab.url.startsWith('chrome://') || 
          this.currentTab.url.startsWith('chrome-extension://') ||
          this.currentTab.url.startsWith('moz-extension://') ||
          this.currentTab.url.startsWith('about:')) {
        statusDot.className = 'status-dot inactive';
        statusText.textContent = 'Cannot run on this page';
        return;
      }
      
      // Check extension settings
      const result = await chrome.storage.sync.get({
        extensionEnabled: true,
        enableOnAllSites: true,
        enabledSites: []
      });
      
      if (!result.extensionEnabled) {
        statusDot.className = 'status-dot inactive';
        statusText.textContent = 'Extension disabled';
        return;
      }
      
      const hostname = new URL(this.currentTab.url).hostname;
      const shouldBeActive = result.enableOnAllSites || result.enabledSites.includes(hostname);
      
      if (!shouldBeActive) {
        statusDot.className = 'status-dot inactive';
        statusText.textContent = 'Disabled for this site';
        return;
      }
      
      // Try to communicate with content script
      try {
        const response = await chrome.tabs.sendMessage(this.currentTab.id, {
          action: 'get-status'
        });
        
        if (response && response.enabled) {
          statusDot.className = 'status-dot active';
          statusText.textContent = 'Active on this page';
        } else {
          statusDot.className = 'status-dot inactive';
          statusText.textContent = 'Inactive on this page';
        }
      } catch (error) {
        // Content script not loaded, but extension should work
        statusDot.className = 'status-dot active';
        statusText.textContent = 'Ready (refresh to activate)';
      }
    } catch (error) {
      statusDot.className = 'status-dot inactive';
      statusText.textContent = 'Error checking status';
    }
  }
  
  async loadCustomMappings() {
    const listContainer = document.getElementById('customMappingsList');
    listContainer.innerHTML = '';
    
    const mappings = this.transliterator.customMappings || {};
    
    if (Object.keys(mappings).length === 0) {
      listContainer.innerHTML = '<div class="no-mappings">No custom mappings added yet</div>';
      return;
    }
    
    Object.entries(mappings).forEach(([latin, arabic]) => {
      const item = document.createElement('div');
      item.className = 'mapping-item';
      item.innerHTML = `
        <div class="mapping-text">
          <span class="mapping-latin">${latin}</span>
          <span class="mapping-arrow">→</span>
          <span class="mapping-arabic">${arabic}</span>
        </div>
        <button class="btn btn-danger" data-latin="${latin}">Remove</button>
      `;
      
      item.querySelector('.btn-danger').addEventListener('click', () => {
        this.removeMapping(latin);
      });
      
      listContainer.appendChild(item);
    });
  }
  
  async handleExtensionToggle(event) {
    const enabled = event.target.checked;
    
    await chrome.storage.sync.set({ extensionEnabled: enabled });
    
    // Send message to content script
    if (this.currentTab) {
      try {
        await chrome.tabs.sendMessage(this.currentTab.id, {
          action: 'toggle-extension'
        });
      } catch (error) {
        console.log('Could not communicate with content script');
      }
    }
    
    this.updateStatus();
  }
  
  async handleTriggerMethodChange(event) {
    const method = event.target.value;
    await chrome.storage.sync.set({ triggerMethod: method });
    
    // Reload transliterator settings
    await this.transliterator.loadSettings();
  }
  
  async handlePreviewToggle(event) {
    const enabled = event.target.checked;
    await chrome.storage.sync.set({ previewEnabled: enabled });
    
    // Reload transliterator settings
    await this.transliterator.loadSettings();
  }
  
  async handleAddMapping() {
    const latinInput = document.getElementById('customLatin');
    const arabicInput = document.getElementById('customArabic');
    
    const latin = latinInput.value.trim().toLowerCase();
    const arabic = arabicInput.value.trim();
    
    if (!latin || !arabic) {
      this.showError('Both fields are required');
      return;
    }
    
    if (latin.length > 20 || arabic.length > 20) {
      this.showError('Text too long (max 20 characters)');
      return;
    }
    
    await this.transliterator.addCustomMapping(latin, arabic);
    
    latinInput.value = '';
    arabicInput.value = '';
    
    this.loadCustomMappings();
    this.showSuccess('Mapping added successfully');
  }
  
  async removeMapping(latin) {
    await this.transliterator.removeCustomMapping(latin);
    this.loadCustomMappings();
    this.showSuccess('Mapping removed');
  }
  
  handleMappingKeypress(event) {
    if (event.key === 'Enter') {
      this.handleAddMapping();
    }
  }
  
  async handleAllSitesToggle(event) {
    const enableAll = event.target.checked;
    await chrome.storage.sync.set({ enableOnAllSites: enableAll });
    
    const siteSpecificDiv = document.getElementById('siteSpecificSettings');
    if (enableAll) {
      siteSpecificDiv.style.display = 'none';
    } else {
      siteSpecificDiv.style.display = 'block';
    }
    
    this.updateStatus();
  }
  
  async handleCurrentSiteToggle(event) {
    if (!this.currentTab) return;
    
    const enabled = event.target.checked;
    const hostname = new URL(this.currentTab.url).hostname;
    
    const result = await chrome.storage.sync.get({ enabledSites: [] });
    let enabledSites = result.enabledSites;
    
    if (enabled) {
      if (!enabledSites.includes(hostname)) {
        enabledSites.push(hostname);
      }
    } else {
      enabledSites = enabledSites.filter(site => site !== hostname);
    }
    
    await chrome.storage.sync.set({ enabledSites });
    await this.transliterator.loadSettings();
    
    this.updateStatus();
  }
  
  handleTestConversion() {
    const input = document.getElementById('testInput').value.trim();
    if (!input) return;
    
    const result = this.transliterator.transliterate(input);
    document.getElementById('testOutput').textContent = result;
  }
  
  handleTestInput() {
    const input = document.getElementById('testInput').value.trim();
    if (input) {
      const result = this.transliterator.transliterate(input);
      document.getElementById('testOutput').textContent = result;
    } else {
      document.getElementById('testOutput').textContent = '';
    }
  }
  
  handleTestKeypress(event) {
    if (event.key === 'Enter') {
      this.handleTestConversion();
    }
  }
  
  async handleResetSettings() {
    if (!confirm('Are you sure you want to reset all settings to defaults?')) {
      return;
    }
    
    await chrome.storage.sync.clear();
    
    // Reset UI
    document.getElementById('extensionToggle').checked = true;
    document.getElementById('ctrlSpace').checked = true;
    document.getElementById('doubleSpace').checked = false;
    document.getElementById('previewToggle').checked = true;
    document.getElementById('enableOnAllSites').checked = true;
    document.getElementById('siteSpecificSettings').style.display = 'none';
    
    // Clear test area
    document.getElementById('testInput').value = '';
    document.getElementById('testOutput').textContent = '';
    
    // Clear custom mappings
    document.getElementById('customLatin').value = '';
    document.getElementById('customArabic').value = '';
    
    // Reload everything
    await this.transliterator.loadSettings();
    this.loadCustomMappings();
    this.updateStatus();
    
    this.showSuccess('Settings reset successfully');
  }
  
  async handleExportSettings() {
    try {
      const settings = await chrome.storage.sync.get();
      const dataStr = JSON.stringify(settings, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'quickarabic-settings.json';
      link.click();
      
      URL.revokeObjectURL(url);
      
      this.showSuccess('Settings exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      this.showError('Failed to export settings');
    }
  }
  
  showError(message) {
    this.showMessage(message, 'error');
  }
  
  showSuccess(message) {
    this.showMessage(message, 'success');
  }
  
  showMessage(message, type) {
    // Remove existing messages
    document.querySelectorAll('.message').forEach(el => el.remove());
    
    const messageEl = document.createElement('div');
    messageEl.className = `message ${type}`;
    messageEl.textContent = message;
    
    const container = document.querySelector('.popup-main');
    container.insertBefore(messageEl, container.firstChild);
    
    setTimeout(() => {
      messageEl.remove();
    }, 3000);
  }
  
  showError(message) {
    const main = document.querySelector('.popup-main');
    if (main) {
      main.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: #e74c3c;">
          <h3>Error</h3>
          <p>${message}</p>
          <button onclick="location.reload()" class="btn" style="margin-top: 1rem;">Retry</button>
        </div>
      `;
    }
  }
}

// Initialize popup when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new PopupController();
});