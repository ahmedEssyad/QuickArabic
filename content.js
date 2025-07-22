class QuickArabicContent {
  constructor() {
    this.transliterator = new ArabicTransliterator();
    this.isEnabled = true;
    this.lastSpaceTime = 0;
    this.spaceCount = 0;
    this.previewElement = null;
    this.currentElement = null;
    
    this.init();
  }
  
  async init() {
    await this.transliterator.loadSettings();
    
    // Check if extension should be active on this site
    if (!this.transliterator.isSiteEnabled(window.location.href)) {
      return;
    }
    
    this.setupEventListeners();
    this.createPreviewElement();
    
    console.log('QuickArabic: Extension loaded');
  }
  
  setupEventListeners() {
    // Check if we're on Facebook - use passive mode
    this.isFacebook = window.location.hostname.includes('facebook.com');
    
    if (this.isFacebook) {
      console.log('QuickArabic: Facebook detected - using passive mode');
      this.setupPassiveMode();
    } else {
      console.log('QuickArabic: Standard mode enabled');
      this.setupStandardMode();
    }
    
    // Always listen for messages from background script
    chrome.runtime.onMessage.addListener(this.handleMessage.bind(this));
  }
  
  setupStandardMode() {
    // Normal event listeners for non-Facebook sites
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    document.addEventListener('keyup', this.handleKeyUp.bind(this));
    document.addEventListener('focusin', this.handleFocusIn.bind(this));
    document.addEventListener('focusout', this.handleFocusOut.bind(this));
    this.observeDOM();
  }
  
  setupPassiveMode() {
    // ULTRA-PASSIVE MODE: Minimal Facebook interaction
    console.log('QuickArabic: Setting up ultra-passive Facebook mode');
    
    // Only add the most basic keyboard listener
    document.addEventListener('keydown', (event) => {
      // Only handle Ctrl+Space
      if (event.ctrlKey && event.code === 'Space') {
        event.preventDefault();
        event.stopPropagation();
        
        // Use setTimeout to avoid any timing conflicts with Facebook
        setTimeout(() => {
          this.handleFacebookUltraPassive();
        }, 10);
      }
    }, true); // Use capture phase to get event first
    
    // Don't create preview element for Facebook - too risky
    // Don't track anything - completely hands-off
  }
  
  handleKeyDown(event) {
    if (!this.isEnabled) return;
    
    // Handle Ctrl+Space shortcut
    if (event.ctrlKey && event.code === 'Space') {
      event.preventDefault();
      this.triggerConversion();
      return;
    }
    
    // Handle double-spacebar trigger
    if (event.code === 'Space' && this.transliterator.triggerMethod === 'double-space') {
      const now = Date.now();
      if (now - this.lastSpaceTime < 500) { // 500ms window for double-tap
        this.spaceCount++;
        if (this.spaceCount >= 2) {
          event.preventDefault();
          this.triggerConversion();
          this.spaceCount = 0;
        }
      } else {
        this.spaceCount = 1;
      }
      this.lastSpaceTime = now;
    }
  }
  
  handleKeyUp(event) {
    // Reset space count if other keys are pressed
    if (event.code !== 'Space') {
      this.spaceCount = 0;
    }
  }
  
  handleFocusIn(event) {
    const element = event.target;
    if (this.isTextInput(element)) {
      this.currentElement = element;
    }
  }
  
  handleFocusOut(event) {
    this.hidePreview();
  }
  
  handleMessage(message, sender, sendResponse) {
    switch (message.action) {
      case 'toggle-extension':
        this.isEnabled = !this.isEnabled;
        sendResponse({ enabled: this.isEnabled });
        break;
      case 'convert-text':
        this.triggerConversion();
        break;
      case 'get-status':
        sendResponse({ 
          enabled: this.isEnabled,
          url: window.location.href 
        });
        break;
    }
  }
  
  observeDOM() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Handle dynamically added inputs
              this.setupNewInputs(node);
            }
          });
        }
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  setupNewInputs(element) {
    const inputs = element.querySelectorAll('input[type="text"], textarea, [contenteditable]');
    inputs.forEach(input => {
      if (!input.dataset.quickArabicInit) {
        input.dataset.quickArabicInit = 'true';
      }
    });
  }
  
  isTextInput(element) {
    if (!element) return false;
    
    const tagName = element.tagName.toLowerCase();
    const inputType = element.type ? element.type.toLowerCase() : '';
    const contentEditable = element.contentEditable;
    
    return (
      (tagName === 'input' && ['text', 'search', 'url', 'email'].includes(inputType)) ||
      tagName === 'textarea' ||
      contentEditable === 'true' ||
      element.getAttribute('role') === 'textbox'
    );
  }
  
  async triggerConversion() {
    // Facebook uses ultra-passive mode - different handler
    if (this.isFacebook) {
      console.log('QuickArabic: Facebook detected, using ultra-passive handler');
      this.handleFacebookUltraPassive();
      return;
    }
    
    // Standard mode for non-Facebook sites
    if (!this.currentElement || !this.isTextInput(this.currentElement)) {
      // Try to find focused element
      this.currentElement = document.activeElement;
      if (!this.isTextInput(this.currentElement)) {
        return;
      }
    }
    
    const textInfo = this.getTextAndSelection(this.currentElement);
    if (!textInfo) return;
    
    let textToConvert = '';
    let selectionStart = textInfo.selectionStart;
    let selectionEnd = textInfo.selectionEnd;
    
    // NEW: If there's a selection, convert the entire selection (could be multiple words)
    if (selectionStart !== selectionEnd) {
      textToConvert = textInfo.text.substring(selectionStart, selectionEnd);
      
      // Check if it's multiple words - use paragraph conversion
      if (/\s/.test(textToConvert)) {
        const arabicText = this.transliterator.transliterateParagraph(textToConvert);
        if (this.transliterator.previewEnabled) {
          this.showPreview(textToConvert, arabicText, selectionStart, selectionEnd);
        } else {
          this.performConversion(arabicText, selectionStart, selectionEnd);
        }
        return;
      }
    } else {
      // Find the current word at cursor position
      const wordInfo = this.transliterator.getWordAtPosition(textInfo.text, selectionStart);
      if (wordInfo.word) {
        textToConvert = wordInfo.word;
        selectionStart = wordInfo.start;
        selectionEnd = wordInfo.end;
      }
    }
    
    if (!textToConvert.trim()) return;
    
    // Only convert if it contains Latin characters
    if (!/[a-zA-Z0-9]/.test(textToConvert)) return;
    
    const arabicText = this.transliterator.transliterate(textToConvert);
    
    if (this.transliterator.previewEnabled) {
      this.showPreview(textToConvert, arabicText, selectionStart, selectionEnd);
    } else {
      this.performConversion(arabicText, selectionStart, selectionEnd);
    }
  }
  
  getTextAndSelection(element) {
    try {
      if (element.contentEditable === 'true') {
        return this.getContentEditableTextInfo(element);
      } else {
        return {
          text: element.value || '',
          selectionStart: element.selectionStart || 0,
          selectionEnd: element.selectionEnd || 0
        };
      }
    } catch (error) {
      console.error('QuickArabic: Error getting text info:', error);
      return null;
    }
  }
  
  getContentEditableTextInfo(element) {
    const selection = window.getSelection();
    const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
    
    if (!range) {
      return {
        text: element.textContent || '',
        selectionStart: 0,
        selectionEnd: 0
      };
    }
    
    const text = element.textContent || '';
    const startOffset = this.getTextOffset(element, range.startContainer, range.startOffset);
    const endOffset = this.getTextOffset(element, range.endContainer, range.endOffset);
    
    return {
      text: text,
      selectionStart: startOffset,
      selectionEnd: endOffset
    };
  }
  
  getTextOffset(root, node, offset) {
    let textOffset = 0;
    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    
    let currentNode;
    while (currentNode = walker.nextNode()) {
      if (currentNode === node) {
        return textOffset + offset;
      }
      textOffset += currentNode.textContent.length;
    }
    
    return textOffset;
  }
  
  createPreviewElement() {
    // Don't create preview element for Facebook - too risky
    if (this.isFacebook) {
      console.log('QuickArabic: Skipping preview creation for Facebook');
      return;
    }
    
    this.previewElement = document.createElement('div');
    this.previewElement.className = 'quickarabic-preview';
    this.previewElement.innerHTML = `
      <div class="quickarabic-preview-content">
        <div class="quickarabic-original"></div>
        <div class="quickarabic-arrow">→</div>
        <div class="quickarabic-converted"></div>
        <div class="quickarabic-buttons">
          <button class="quickarabic-btn quickarabic-convert">Convert</button>
          <button class="quickarabic-btn quickarabic-cancel">Cancel</button>
        </div>
      </div>
    `;
    
    // Add event listeners
    this.previewElement.querySelector('.quickarabic-convert').addEventListener('click', () => {
      this.confirmConversion();
    });
    
    this.previewElement.querySelector('.quickarabic-cancel').addEventListener('click', () => {
      this.hidePreview();
    });
    
    document.body.appendChild(this.previewElement);
  }
  
  showPreview(originalText, convertedText, selectionStart, selectionEnd) {
    // Don't show preview on Facebook - use ultra-passive mode instead
    if (this.isFacebook) {
      console.log('QuickArabic: Skipping preview on Facebook, using ultra-passive mode');
      return;
    }
    
    // Check if preview element exists
    if (!this.previewElement) {
      console.log('QuickArabic: No preview element available');
      return;
    }
    
    const preview = this.previewElement;
    
    preview.querySelector('.quickarabic-original').textContent = originalText;
    preview.querySelector('.quickarabic-converted').textContent = convertedText;
    
    // Store conversion data
    preview.dataset.originalText = originalText;
    preview.dataset.convertedText = convertedText;
    preview.dataset.selectionStart = selectionStart;
    preview.dataset.selectionEnd = selectionEnd;
    
    // Position the preview near the cursor
    this.positionPreview();
    
    preview.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      if (preview.style.display === 'block') {
        this.hidePreview();
      }
    }, 5000);
  }
  
  positionPreview() {
    if (!this.currentElement) return;
    
    const rect = this.currentElement.getBoundingClientRect();
    const preview = this.previewElement;
    
    let top = rect.bottom + window.scrollY + 5;
    let left = rect.left + window.scrollX;
    
    // Adjust if preview goes off screen
    const previewRect = preview.getBoundingClientRect();
    if (left + previewRect.width > window.innerWidth) {
      left = window.innerWidth - previewRect.width - 10;
    }
    
    if (top + previewRect.height > window.innerHeight + window.scrollY) {
      top = rect.top + window.scrollY - previewRect.height - 5;
    }
    
    preview.style.left = `${left}px`;
    preview.style.top = `${top}px`;
  }
  
  hidePreview() {
    if (this.previewElement) {
      this.previewElement.style.display = 'none';
    }
  }
  
  confirmConversion() {
    const preview = this.previewElement;
    const convertedText = preview.dataset.convertedText;
    const selectionStart = parseInt(preview.dataset.selectionStart);
    const selectionEnd = parseInt(preview.dataset.selectionEnd);
    
    this.hidePreview();
    this.performConversion(convertedText, selectionStart, selectionEnd);
  }
  
  performConversion(arabicText, selectionStart, selectionEnd) {
    if (!this.currentElement) return;
    
    // Try multiple methods for maximum compatibility
    const success = this.replaceTextUniversal(arabicText, selectionStart, selectionEnd);
    
    if (!success) {
      console.log('QuickArabic: Standard replacement failed, trying fallback methods');
      this.replaceTextFallback(arabicText, selectionStart, selectionEnd);
    }
    
    // Set RTL direction if needed
    this.setTextDirection();
    
    // Trigger events for React/Vue/Angular apps
    this.triggerInputEvents();
  }
  
  replaceInputText(arabicText, selectionStart, selectionEnd) {
    const element = this.currentElement;
    const currentValue = element.value;
    
    const newValue = 
      currentValue.substring(0, selectionStart) + 
      arabicText + 
      currentValue.substring(selectionEnd);
    
    element.value = newValue;
    
    // Set cursor position after the inserted text
    const newCursorPos = selectionStart + arabicText.length;
    element.setSelectionRange(newCursorPos, newCursorPos);
    
    // Trigger input event for React/Vue applications
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  }
  
  replaceContentEditableText(arabicText, selectionStart, selectionEnd) {
    const element = this.currentElement;
    const text = element.textContent;
    
    const newText = 
      text.substring(0, selectionStart) + 
      arabicText + 
      text.substring(selectionEnd);
    
    // For simple contenteditable, replace text content
    if (element.innerHTML === element.textContent) {
      element.textContent = newText;
    } else {
      // For complex contenteditable (like Facebook), use selection API
      this.replaceSelectionText(arabicText, selectionStart, selectionEnd);
    }
    
    // Set cursor position
    this.setCursorPosition(element, selectionStart + arabicText.length);
  }
  
  replaceSelectionText(arabicText, selectionStart, selectionEnd) {
    const selection = window.getSelection();
    const range = document.createRange();
    
    try {
      // Create a text node with the Arabic text
      const textNode = document.createTextNode(arabicText);
      
      // Find the text nodes and set range
      const walker = document.createTreeWalker(
        this.currentElement,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );
      
      let currentOffset = 0;
      let startNode = null, endNode = null;
      let startOffset = 0, endOffset = 0;
      
      let node;
      while (node = walker.nextNode()) {
        const nodeLength = node.textContent.length;
        
        if (!startNode && currentOffset + nodeLength >= selectionStart) {
          startNode = node;
          startOffset = selectionStart - currentOffset;
        }
        
        if (!endNode && currentOffset + nodeLength >= selectionEnd) {
          endNode = node;
          endOffset = selectionEnd - currentOffset;
          break;
        }
        
        currentOffset += nodeLength;
      }
      
      if (startNode && endNode) {
        range.setStart(startNode, startOffset);
        range.setEnd(endNode, endOffset);
        range.deleteContents();
        range.insertNode(textNode);
        
        // Move cursor to end of inserted text
        range.setStartAfter(textNode);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    } catch (error) {
      console.error('QuickArabic: Error replacing selection:', error);
      // Fallback: replace entire content
      this.currentElement.textContent = this.currentElement.textContent.substring(0, selectionStart) + 
                                       arabicText + 
                                       this.currentElement.textContent.substring(selectionEnd);
    }
  }
  
  setCursorPosition(element, position) {
    try {
      const range = document.createRange();
      const selection = window.getSelection();
      
      const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );
      
      let currentOffset = 0;
      let node;
      
      while (node = walker.nextNode()) {
        const nodeLength = node.textContent.length;
        if (currentOffset + nodeLength >= position) {
          range.setStart(node, position - currentOffset);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
          return;
        }
        currentOffset += nodeLength;
      }
    } catch (error) {
      console.error('QuickArabic: Error setting cursor position:', error);
    }
  }
  
  replaceTextUniversal(arabicText, selectionStart, selectionEnd) {
    try {
      // Method 1: Use document.execCommand (works in most cases)
      if (document.queryCommandSupported('insertText')) {
        // First select the text to replace
        if (this.currentElement.contentEditable === 'true') {
          const selection = window.getSelection();
          const range = document.createRange();
          
          // Try to create range for the text to replace
          const textNode = this.findTextNodeAtPosition(this.currentElement, selectionStart);
          if (textNode) {
            range.setStart(textNode.node, textNode.offset);
            range.setEnd(textNode.node, textNode.offset + (selectionEnd - selectionStart));
            selection.removeAllRanges();
            selection.addRange(range);
            
            // Insert the Arabic text
            const result = document.execCommand('insertText', false, arabicText);
            if (result) {
              console.log('QuickArabic: Successfully used execCommand method');
              return true;
            }
          }
        } else {
          // For input/textarea elements
          this.currentElement.focus();
          this.currentElement.setSelectionRange(selectionStart, selectionEnd);
          const result = document.execCommand('insertText', false, arabicText);
          if (result) {
            console.log('QuickArabic: Successfully used execCommand for input');
            return true;
          }
        }
      }
      
      // Method 2: Direct value/textContent replacement
      if (this.currentElement.contentEditable === 'true') {
        return this.replaceContentEditableAdvanced(arabicText, selectionStart, selectionEnd);
      } else {
        return this.replaceInputAdvanced(arabicText, selectionStart, selectionEnd);
      }
      
    } catch (error) {
      console.error('QuickArabic: Universal replacement error:', error);
      return false;
    }
  }
  
  replaceInputAdvanced(arabicText, selectionStart, selectionEnd) {
    try {
      const element = this.currentElement;
      const currentValue = element.value || '';
      
      const newValue = 
        currentValue.substring(0, selectionStart) + 
        arabicText + 
        currentValue.substring(selectionEnd);
      
      element.value = newValue;
      
      // Set cursor position after the inserted text
      const newCursorPos = selectionStart + arabicText.length;
      element.setSelectionRange(newCursorPos, newCursorPos);
      
      return true;
    } catch (error) {
      console.error('QuickArabic: Input replacement error:', error);
      return false;
    }
  }
  
  replaceContentEditableAdvanced(arabicText, selectionStart, selectionEnd) {
    try {
      const element = this.currentElement;
      
      // Method 1: Try to use Selection API properly
      const selection = window.getSelection();
      
      // Clear any existing selection
      selection.removeAllRanges();
      
      // Create new range at the position we want to replace
      const range = this.createRangeAtPosition(element, selectionStart, selectionEnd);
      
      if (range) {
        selection.addRange(range);
        
        // Try different insertion methods
        if (this.insertTextAtRange(range, arabicText)) {
          console.log('QuickArabic: Successfully used range insertion');
          return true;
        }
      }
      
      // Method 2: Direct manipulation for Facebook-style editors
      return this.replaceTextForFacebook(arabicText, selectionStart, selectionEnd);
      
    } catch (error) {
      console.error('QuickArabic: ContentEditable replacement error:', error);
      return false;
    }
  }
  
  replaceTextForFacebook(arabicText, selectionStart, selectionEnd) {
    try {
      console.log('QuickArabic: Attempting Facebook replacement...');
      const element = this.currentElement;
      
      // Method 0: SIMPLE APPROACH - Just replace selected text and simulate paste
      if (this.facebookSimpleReplace(arabicText, selectionStart, selectionEnd)) {
        return true;
      }
      
      // Method 1: Try the nuclear approach
      if (this.facebookForceReplace(arabicText, selectionStart, selectionEnd)) {
        return true;
      }
      
      // Method 2: Try tree walker approach
      if (this.facebookTreeWalkerReplace(arabicText, selectionStart, selectionEnd)) {
        return true;
      }
      
      // Method 3: Try direct innerHTML manipulation 
      if (this.facebookDirectReplace(arabicText, selectionStart, selectionEnd)) {
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('QuickArabic: Facebook replacement error:', error);
      return false;
    }
  }
  
  facebookSimpleReplace(arabicText, selectionStart, selectionEnd) {
    try {
      const element = this.currentElement;
      console.log('QuickArabic: Trying Facebook-friendly replacement...');
      
      // GENTLE APPROACH: Don't mess with Facebook's focus system
      // Just work with the current selection if it exists
      
      const selection = window.getSelection();
      
      // Method 1: If there's already a selection, use it
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        
        // Use insertText on the existing selection - most compatible with React
        const success = document.execCommand('insertText', false, arabicText);
        
        if (success) {
          console.log('QuickArabic: Facebook-friendly replacement succeeded!');
          return true;
        }
      }
      
      // Method 2: If no selection, try to select the target text gently
      try {
        const range = this.createRangeAtPosition(element, selectionStart, selectionEnd);
        if (range) {
          selection.removeAllRanges();
          selection.addRange(range);
          
          // Use the most React-friendly method
          const success = document.execCommand('insertText', false, arabicText);
          if (success) {
            console.log('QuickArabic: Facebook gentle selection replacement succeeded!');
            return true;
          }
        }
      } catch (error) {
        console.log('QuickArabic: Gentle selection failed, trying direct approach');
      }
      
      // Method 3: Ultra-gentle direct text replacement
      return this.facebookUltraGentle(element, arabicText, selectionStart, selectionEnd);
      
    } catch (error) {
      console.error('QuickArabic: Facebook-friendly replacement failed:', error);
      return false;
    }
  }
  
  facebookUltraGentle(element, arabicText, selectionStart, selectionEnd) {
    try {
      console.log('QuickArabic: Trying ultra-gentle Facebook approach...');
      
      // Get current text without disturbing anything
      const currentText = element.textContent || element.innerText || '';
      
      // Create new text with replacement
      const newText = 
        currentText.substring(0, selectionStart) + 
        arabicText + 
        currentText.substring(selectionEnd);
      
      // Method 1: Try using React's own input setter if available
      const inputSetter = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'textContent') ||
                         Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value');
      
      if (inputSetter && inputSetter.set) {
        inputSetter.set.call(element, newText);
        
        // Dispatch only the most essential events
        element.dispatchEvent(new Event('input', { bubbles: true }));
        
        console.log('QuickArabic: Ultra-gentle React setter approach succeeded!');
        return true;
      }
      
      // Method 2: Minimal DOM manipulation
      element.textContent = newText;
      
      // Only trigger the most essential event
      setTimeout(() => {
        element.dispatchEvent(new Event('input', { bubbles: true }));
      }, 10);
      
      console.log('QuickArabic: Ultra-gentle DOM approach succeeded!');
      return true;
      
    } catch (error) {
      console.error('QuickArabic: Ultra-gentle approach failed:', error);
      return false;
    }
  }
  
  simulateRealPaste(element, text) {
    try {
      console.log('QuickArabic: Simulating paste operation...');
      element.focus();
      
      // Create and dispatch a proper paste event
      const clipboardEvent = new ClipboardEvent('paste', {
        clipboardData: new DataTransfer(),
        bubbles: true,
        cancelable: true
      });
      
      // Set the text data
      clipboardEvent.clipboardData.setData('text/plain', text);
      
      // Dispatch the event
      const eventResult = element.dispatchEvent(clipboardEvent);
      
      if (eventResult) {
        console.log('QuickArabic: Paste simulation succeeded');
        return true;
      }
      
      // If paste event was prevented, try manual insertion
      return this.manualTextInsertion(element, text);
      
    } catch (error) {
      console.error('QuickArabic: Paste simulation failed:', error);
      return false;
    }
  }
  
  manualTextInsertion(element, text) {
    try {
      console.log('QuickArabic: Trying manual text insertion...');
      
      // Get current selection
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        
        // Insert text node
        const textNode = document.createTextNode(text);
        range.insertNode(textNode);
        
        // Move cursor after inserted text
        range.setStartAfter(textNode);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        
        // Force Facebook update
        this.forceFacebookUpdate(element);
        
        console.log('QuickArabic: Manual text insertion succeeded');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('QuickArabic: Manual text insertion failed:', error);
      return false;
    }
  }
  
  facebookForceReplace(arabicText, selectionStart, selectionEnd) {
    try {
      const element = this.currentElement;
      
      // NUCLEAR OPTION: Simulate actual user typing
      console.log('QuickArabic: Starting Facebook nuclear replacement...');
      
      // Step 1: Clear the field completely
      element.focus();
      
      // Select all existing text
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(element);
      selection.removeAllRanges();
      selection.addRange(range);
      
      // Delete all content
      document.execCommand('delete', false, null);
      
      // Step 2: Get the text with replacement
      const currentText = element.textContent || '';
      const newText = 
        currentText.substring(0, selectionStart) + 
        arabicText + 
        currentText.substring(selectionEnd);
      
      // Step 3: Type the new text character by character (simulating user typing)
      this.simulateTyping(element, newText);
      
      console.log('QuickArabic: Facebook nuclear replacement completed');
      return true;
      
    } catch (error) {
      console.error('QuickArabic: Facebook nuclear replacement failed:', error);
      return false;
    }
  }
  
  simulateTyping(element, text) {
    element.focus();
    
    // Method 1: Try to paste the text (most reliable for React)
    try {
      // Clear any existing content
      document.execCommand('selectAll', false, null);
      document.execCommand('delete', false, null);
      
      // Create a fake clipboard event with our Arabic text
      const clipboardData = new DataTransfer();
      clipboardData.setData('text/plain', text);
      
      const pasteEvent = new ClipboardEvent('paste', {
        clipboardData: clipboardData,
        bubbles: true,
        cancelable: true
      });
      
      element.dispatchEvent(pasteEvent);
      
      // If paste event didn't work, use insertText
      if (!element.textContent.includes(text.charAt(0))) {
        document.execCommand('insertText', false, text);
      }
      
    } catch (error) {
      // Fallback: Use insertText
      document.execCommand('insertText', false, text);
    }
    
    // Trigger comprehensive update
    this.forceFacebookUpdate(element);
  }
  
  facebookTreeWalkerReplace(arabicText, selectionStart, selectionEnd) {
    try {
      const element = this.currentElement;
      const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );
      
      let currentOffset = 0;
      let targetNode = null;
      let nodeOffset = 0;
      
      // Find the text node containing our selection start
      let node;
      while (node = walker.nextNode()) {
        const nodeLength = node.textContent.length;
        
        if (currentOffset <= selectionStart && currentOffset + nodeLength >= selectionStart) {
          targetNode = node;
          nodeOffset = selectionStart - currentOffset;
          break;
        }
        
        currentOffset += nodeLength;
      }
      
      if (targetNode) {
        // Calculate the text to replace
        const originalText = targetNode.textContent;
        const beforeText = originalText.substring(0, nodeOffset);
        const afterText = originalText.substring(nodeOffset + (selectionEnd - selectionStart));
        
        // Create new text content
        const newText = beforeText + arabicText + afterText;
        
        // Replace the text node content
        targetNode.textContent = newText;
        
        // Force update
        this.forceFacebookUpdate(element);
        
        // Set cursor position after the inserted text
        const newCursorPos = nodeOffset + arabicText.length;
        this.setCursorInTextNode(targetNode, newCursorPos);
        
        console.log('QuickArabic: Facebook tree walker replacement succeeded');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('QuickArabic: Facebook tree walker replacement failed:', error);
      return false;
    }
  }
  
  facebookDirectReplace(arabicText, selectionStart, selectionEnd) {
    try {
      const element = this.currentElement;
      const currentText = element.textContent || element.innerText || '';
      
      // Create new text
      const newText = 
        currentText.substring(0, selectionStart) + 
        arabicText + 
        currentText.substring(selectionEnd);
      
      // Try different replacement methods
      const methods = [
        () => { element.textContent = newText; },
        () => { element.innerText = newText; },
        () => { element.innerHTML = newText; }
      ];
      
      for (const method of methods) {
        try {
          method();
          this.forceFacebookUpdate(element);
          
          // Check if text was actually set
          if (element.textContent.includes(arabicText)) {
            console.log('QuickArabic: Facebook direct replace succeeded');
            return true;
          }
        } catch (e) {
          continue;
        }
      }
      
      return false;
    } catch (error) {
      console.error('QuickArabic: Facebook direct replace failed:', error);
      return false;
    }
  }
  
  forceFacebookUpdate(element) {
    try {
      // GENTLE UPDATE: Only trigger essential events, avoid focus manipulation
      const essentialEvents = ['input', 'change'];
      
      essentialEvents.forEach(eventType => {
        try {
          const event = new Event(eventType, {
            bubbles: true,
            cancelable: true
          });
          element.dispatchEvent(event);
        } catch (e) {
          // Ignore event errors
        }
      });
      
      // Special handling for React without aggressive manipulation
      if (element._valueTracker) {
        element._valueTracker.setValue('');
      }
      
      console.log('QuickArabic: Gentle Facebook update completed');
      
    } catch (error) {
      console.error('QuickArabic: Gentle Facebook update failed:', error);
    }
  }
  
  replaceTextFallback(arabicText, selectionStart, selectionEnd) {
    try {
      // Last resort: simple text replacement
      if (this.currentElement.contentEditable === 'true') {
        const currentText = this.currentElement.textContent || '';
        const newText = 
          currentText.substring(0, selectionStart) + 
          arabicText + 
          currentText.substring(selectionEnd);
        
        this.currentElement.textContent = newText;
        
        // Try to set cursor position
        const newPos = selectionStart + arabicText.length;
        setTimeout(() => {
          this.setCursorPosition(this.currentElement, newPos);
        }, 10);
        
      } else {
        // For input elements
        const currentValue = this.currentElement.value || '';
        const newValue = 
          currentValue.substring(0, selectionStart) + 
          arabicText + 
          currentValue.substring(selectionEnd);
        
        this.currentElement.value = newValue;
        const newPos = selectionStart + arabicText.length;
        this.currentElement.setSelectionRange(newPos, newPos);
      }
      
      console.log('QuickArabic: Used fallback replacement method');
    } catch (error) {
      console.error('QuickArabic: Fallback replacement failed:', error);
    }
  }
  
  createRangeAtPosition(element, start, end) {
    try {
      const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );
      
      let currentOffset = 0;
      let startNode = null, endNode = null;
      let startOffset = 0, endOffset = 0;
      
      let node;
      while (node = walker.nextNode()) {
        const nodeLength = node.textContent.length;
        
        if (!startNode && currentOffset + nodeLength >= start) {
          startNode = node;
          startOffset = start - currentOffset;
        }
        
        if (!endNode && currentOffset + nodeLength >= end) {
          endNode = node;
          endOffset = end - currentOffset;
          break;
        }
        
        currentOffset += nodeLength;
      }
      
      if (startNode && endNode) {
        const range = document.createRange();
        range.setStart(startNode, startOffset);
        range.setEnd(endNode, endOffset);
        return range;
      }
      
      return null;
    } catch (error) {
      console.error('QuickArabic: Range creation error:', error);
      return null;
    }
  }
  
  insertTextAtRange(range, text) {
    try {
      // Method 1: Delete and insert
      range.deleteContents();
      const textNode = document.createTextNode(text);
      range.insertNode(textNode);
      
      // Move cursor to end of inserted text
      range.setStartAfter(textNode);
      range.collapse(true);
      
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      
      return true;
    } catch (error) {
      console.error('QuickArabic: Range insertion error:', error);
      return false;
    }
  }
  
  setCursorInTextNode(textNode, position) {
    try {
      const range = document.createRange();
      const selection = window.getSelection();
      
      range.setStart(textNode, Math.min(position, textNode.textContent.length));
      range.collapse(true);
      
      selection.removeAllRanges();
      selection.addRange(range);
    } catch (error) {
      console.error('QuickArabic: Cursor positioning error:', error);
    }
  }
  
  findTextNodeAtPosition(element, position) {
    try {
      const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );
      
      let currentOffset = 0;
      let node;
      
      while (node = walker.nextNode()) {
        const nodeLength = node.textContent.length;
        if (currentOffset + nodeLength >= position) {
          return {
            node: node,
            offset: position - currentOffset
          };
        }
        currentOffset += nodeLength;
      }
      
      return null;
    } catch (error) {
      console.error('QuickArabic: Text node search error:', error);
      return null;
    }
  }
  
  handleFacebookUltraPassive() {
    try {
      console.log('QuickArabic: Facebook ultra-passive triggered');
      
      // Get selection without touching anything else
      const selection = window.getSelection();
      
      if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
        this.showSimpleMessage('Please select text first, then press Ctrl+Space');
        return;
      }
      
      const selectedText = selection.toString().trim();
      
      if (!selectedText) {
        this.showSimpleMessage('No text selected');
        return;
      }
      
      if (!/[a-zA-Z0-9]/.test(selectedText)) {
        this.showSimpleMessage('No Latin text to convert');
        return;
      }
      
      // Convert the text
      let arabicText;
      if (/\s/.test(selectedText)) {
        arabicText = this.transliterator.transliterateParagraph(selectedText);
      } else {
        arabicText = this.transliterator.transliterate(selectedText);
      }
      
      console.log(`QuickArabic: "${selectedText}" → "${arabicText}"`);
      
      // Try simple insertion first
      const success = document.execCommand('insertText', false, arabicText);
      
      if (success) {
        console.log('QuickArabic: Facebook insertion succeeded!');
        this.showSimpleMessage('✅ Text converted successfully!');
      } else {
        console.log('QuickArabic: Facebook blocked insertion, showing copy dialog');
        this.showCopyDialog(arabicText, selectedText);
      }
      
    } catch (error) {
      console.error('QuickArabic: Facebook ultra-passive error:', error);
      this.showSimpleMessage('❌ Conversion failed');
    }
  }
  
  showSimpleMessage(message) {
    // Create a very simple, non-intrusive message
    const msg = document.createElement('div');
    msg.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(76, 175, 80, 0.9);
      color: white;
      padding: 8px 12px;
      border-radius: 4px;
      font-family: Arial, sans-serif;
      font-size: 12px;
      z-index: 9999999;
      pointer-events: none;
    `;
    msg.textContent = 'QuickArabic: ' + message;
    
    document.body.appendChild(msg);
    
    setTimeout(() => {
      if (msg.parentNode) msg.parentNode.removeChild(msg);
    }, 3000);
  }
  
  showCopyDialog(arabicText, originalText) {
    // Ultra-simple copy dialog
    const dialog = document.createElement('div');
    dialog.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      border: 2px solid #4CAF50;
      border-radius: 8px;
      padding: 20px;
      z-index: 9999999;
      font-family: Arial, sans-serif;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      max-width: 400px;
    `;
    
    dialog.innerHTML = `
      <div style="text-align: center; margin-bottom: 15px;">
        <strong>QuickArabic Conversion</strong>
      </div>
      <div style="margin-bottom: 10px;">
        <strong>Original:</strong> ${originalText}
      </div>
      <div style="margin-bottom: 15px; padding: 10px; background: #f0f0f0; border-radius: 4px; direction: rtl; text-align: center; font-size: 18px;">
        ${arabicText}
      </div>
      <div style="text-align: center;">
        <button id="copyBtn" style="background: #4CAF50; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; margin-right: 10px;">
          Copy Arabic Text
        </button>
        <button id="closeBtn" style="background: #f44336; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;">
          Close
        </button>
      </div>
    `;
    
    document.body.appendChild(dialog);
    
    // Add event listeners
    dialog.querySelector('#copyBtn').onclick = () => {
      navigator.clipboard.writeText(arabicText).then(() => {
        dialog.querySelector('#copyBtn').textContent = 'Copied! ✅';
        setTimeout(() => dialog.remove(), 1000);
      }).catch(() => {
        // Fallback for copy
        const textArea = document.createElement('textarea');
        textArea.value = arabicText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        dialog.querySelector('#copyBtn').textContent = 'Copied! ✅';
        setTimeout(() => dialog.remove(), 1000);
      });
    };
    
    dialog.querySelector('#closeBtn').onclick = () => dialog.remove();
    
    // Auto-close after 30 seconds
    setTimeout(() => {
      if (dialog.parentNode) dialog.remove();
    }, 30000);
  }
  
  showFacebookPreview(originalText, arabicText, selection) {
    // Store the selection for later use
    this.savedSelection = {
      selection: selection,
      range: selection.getRangeAt(0).cloneRange()
    };
    
    // Show a simple preview
    if (this.previewElement) {
      this.previewElement.querySelector('.quickarabic-original').textContent = originalText;
      this.previewElement.querySelector('.quickarabic-converted').textContent = arabicText;
      
      // Position near the selection
      this.positionPreviewNearSelection();
      this.previewElement.style.display = 'block';
      
      // Auto-hide after 10 seconds for Facebook
      setTimeout(() => {
        if (this.previewElement.style.display === 'block') {
          this.hidePreview();
        }
      }, 10000);
    }
  }
  
  positionPreviewNearSelection() {
    if (!this.savedSelection || !this.previewElement) return;
    
    try {
      const range = this.savedSelection.range;
      const rect = range.getBoundingClientRect();
      
      let top = rect.bottom + window.scrollY + 10;
      let left = rect.left + window.scrollX;
      
      // Keep preview on screen
      const previewRect = this.previewElement.getBoundingClientRect();
      if (left + previewRect.width > window.innerWidth) {
        left = window.innerWidth - previewRect.width - 10;
      }
      
      if (top + previewRect.height > window.innerHeight + window.scrollY) {
        top = rect.top + window.scrollY - previewRect.height - 10;
      }
      
      this.previewElement.style.left = `${left}px`;
      this.previewElement.style.top = `${top}px`;
    } catch (error) {
      console.error('QuickArabic: Error positioning preview:', error);
    }
  }
  
  confirmConversion() {
    if (this.isFacebook && this.savedSelection) {
      this.performFacebookPassiveConversion();
    } else {
      // Standard conversion for other sites
      const preview = this.previewElement;
      const convertedText = preview.dataset.convertedText;
      const selectionStart = parseInt(preview.dataset.selectionStart);
      const selectionEnd = parseInt(preview.dataset.selectionEnd);
      
      this.hidePreview();
      this.performConversion(convertedText, selectionStart, selectionEnd);
    }
  }
  
  performFacebookPassiveConversion() {
    try {
      if (!this.savedSelection) {
        console.log('QuickArabic: No saved selection for Facebook conversion');
        return;
      }
      
      const arabicText = this.previewElement.querySelector('.quickarabic-converted').textContent;
      
      // Restore the selection
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(this.savedSelection.range);
      
      // Use the most compatible method for Facebook
      const success = document.execCommand('insertText', false, arabicText);
      
      if (success) {
        console.log('QuickArabic: Facebook passive conversion succeeded!');
      } else {
        console.log('QuickArabic: Facebook conversion failed, text may not appear');
        // Show instruction to copy-paste manually
        this.showFacebookFallback(arabicText);
      }
      
      this.hidePreview();
      this.savedSelection = null;
      
    } catch (error) {
      console.error('QuickArabic: Facebook passive conversion error:', error);
      this.showFacebookFallback(this.previewElement.querySelector('.quickarabic-converted').textContent);
    }
  }
  
  showFacebookHelp() {
    // Show a temporary message
    const helpDiv = document.createElement('div');
    helpDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4CAF50;
      color: white;
      padding: 15px;
      border-radius: 8px;
      z-index: 9999999;
      font-family: Arial, sans-serif;
      font-size: 14px;
      max-width: 300px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    `;
    helpDiv.innerHTML = `
      <strong>QuickArabic:</strong><br>
      Please select text manually first, then press Ctrl+Space<br>
      <small>(Drag with mouse to highlight text)</small>
    `;
    
    document.body.appendChild(helpDiv);
    
    setTimeout(() => {
      if (helpDiv.parentNode) {
        helpDiv.parentNode.removeChild(helpDiv);
      }
    }, 4000);
  }
  
  showFacebookFallback(arabicText) {
    // Show the converted text for manual copy-paste
    const fallbackDiv = document.createElement('div');
    fallbackDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      border: 2px solid #4CAF50;
      padding: 20px;
      border-radius: 8px;
      z-index: 9999999;
      font-family: Arial, sans-serif;
      font-size: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      direction: rtl;
    `;
    fallbackDiv.innerHTML = `
      <div style="direction: ltr; text-align: center; margin-bottom: 10px;">
        <strong>Converted Text (copy this):</strong>
      </div>
      <div style="background: #f0f0f0; padding: 10px; border-radius: 4px; font-size: 18px; text-align: center;">
        ${arabicText}
      </div>
      <div style="direction: ltr; text-align: center; margin-top: 10px;">
        <button onclick="navigator.clipboard.writeText('${arabicText}'); this.textContent='Copied!'" 
                style="background: #4CAF50; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
          Copy to Clipboard
        </button>
        <button onclick="this.parentNode.parentNode.remove()" 
                style="background: #f44336; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-left: 10px;">
          Close
        </button>
      </div>
    `;
    
    document.body.appendChild(fallbackDiv);
    
    // Auto-remove after 15 seconds
    setTimeout(() => {
      if (fallbackDiv.parentNode) {
        fallbackDiv.parentNode.removeChild(fallbackDiv);
      }
    }, 15000);
  }
  
  triggerInputEvents() {
    if (!this.currentElement) return;
    
    try {
      // Trigger input events for modern frameworks
      const events = ['input', 'change', 'keyup', 'textInput'];
      
      events.forEach(eventType => {
        const event = new Event(eventType, {
          bubbles: true,
          cancelable: true
        });
        this.currentElement.dispatchEvent(event);
      });
      
      // Special handling for React
      if (this.currentElement._valueTracker) {
        this.currentElement._valueTracker.setValue('');
      }
      
    } catch (error) {
      console.error('QuickArabic: Event triggering error:', error);
    }
  }
  
  setTextDirection() {
    if (!this.currentElement) return;
    
    const hasArabic = /[\u0600-\u06FF]/.test(this.currentElement.value || this.currentElement.textContent);
    
    if (hasArabic) {
      this.currentElement.style.direction = 'rtl';
      this.currentElement.style.textAlign = 'right';
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new QuickArabicContent();
  });
} else {
  new QuickArabicContent();
}