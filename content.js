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
    // Listen for keyboard shortcuts
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    document.addEventListener('keyup', this.handleKeyUp.bind(this));
    
    // Listen for focus changes to track current input
    document.addEventListener('focusin', this.handleFocusIn.bind(this));
    document.addEventListener('focusout', this.handleFocusOut.bind(this));
    
    // Listen for messages from background script
    chrome.runtime.onMessage.addListener(this.handleMessage.bind(this));
    
    // Handle dynamic content (like Facebook)
    this.observeDOM();
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
      
      // Method 1: Try the most aggressive approach for Facebook
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
  
  facebookForceReplace(arabicText, selectionStart, selectionEnd) {
    try {
      const element = this.currentElement;
      
      // Get current text content
      const currentText = element.textContent || '';
      
      // Create new text with Arabic replacement
      const newText = 
        currentText.substring(0, selectionStart) + 
        arabicText + 
        currentText.substring(selectionEnd);
      
      // Method 1: Use Selection API with execCommand
      const selection = window.getSelection();
      selection.removeAllRanges();
      
      // Select the entire element content
      const range = document.createRange();
      range.selectNodeContents(element);
      selection.addRange(range);
      
      // Try to replace with execCommand
      if (document.execCommand('insertText', false, newText)) {
        console.log('QuickArabic: Facebook force replace via execCommand succeeded');
        return true;
      }
      
      // Method 2: Direct textContent replacement
      element.textContent = newText;
      
      // Force Facebook to recognize the change
      this.forceFacebookUpdate(element);
      
      // Set cursor position
      setTimeout(() => {
        this.setCursorPosition(element, selectionStart + arabicText.length);
      }, 10);
      
      console.log('QuickArabic: Facebook force replace via textContent succeeded');
      return true;
      
    } catch (error) {
      console.error('QuickArabic: Facebook force replace failed:', error);
      return false;
    }
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
      // Trigger all possible events that Facebook might listen for
      const events = [
        'input', 
        'change', 
        'keyup', 
        'keydown',
        'keypress',
        'textInput',
        'paste',
        'compositionend'
      ];
      
      events.forEach(eventType => {
        try {
          const event = new Event(eventType, {
            bubbles: true,
            cancelable: true,
            composed: true
          });
          element.dispatchEvent(event);
        } catch (e) {
          // Ignore event errors
        }
      });
      
      // Special handling for React
      if (element._valueTracker) {
        element._valueTracker.setValue('');
      }
      
      // Force focus and blur to trigger updates
      element.blur();
      setTimeout(() => {
        element.focus();
      }, 5);
      
    } catch (error) {
      console.error('QuickArabic: Force Facebook update failed:', error);
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