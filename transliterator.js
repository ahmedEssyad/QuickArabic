class ArabicTransliterator {
  constructor() {
    this.mapping = {
      // Basic consonants
      'b': 'ب',
      't': 'ت',
      'th': 'ث',
      'j': 'ج',
      'h': 'ح',
      'kh': 'خ',
      'd': 'د',
      'dh': 'ذ',
      'r': 'ر',
      'z': 'ز',
      's': 'س',
      'sh': 'ش',
      'f': 'ف',
      'q': 'ق',
      'k': 'ك',
      'l': 'ل',
      'm': 'م',
      'n': 'ن',
      'w': 'و',
      'y': 'ي',
      
      // Emphatic consonants (capital letters)
      'S': 'ص',
      'D': 'ض',
      'T': 'ط',
      'Z': 'ظ',
      
      // Special characters using numbers (chat conventions)
      '3': 'ع',
      '7': 'ح',
      
      // Alternative representations
      'gh': 'غ',
      'u': 'و',
      'i': 'ي',
      
      // Vowels
      'a': 'ا',
      'aa': 'ا',
      'e': 'ي',
      'ee': 'ي',
      'o': 'و',
      'oo': 'و',
      
      // Special endings
      'ah': 'ة',
      'eh': 'ة',
      
      // Common prefixes
      'al-': 'ال',
      'el-': 'ال',
      
      // Single letters that might be missed
      'g': 'ج', // alternative for j
      'c': 'ك', // alternative for k
      'x': 'كس' // rare but sometimes used
    };
    
    // Extended mappings for better accuracy
    this.extendedMapping = {
      // Common word patterns
      'allah': 'الله',
      'bismillah': 'بسم الله',
      'inshallah': 'إن شاء الله',
      'mashallah': 'ما شاء الله',
      'alhamdulillah': 'الحمد لله',
      'subhanallah': 'سبحان الله',
      
      // Common greetings
      'salam': 'سلام',
      'assalam': 'السلام',
      'ahlan': 'أهلاً',
      'marhaba': 'مرحباً',
      'shukran': 'شكراً',
      'afwan': 'عفواً',
      
      // Question words
      'shu': 'شو',
      'esh': 'إيش',
      'kayf': 'كيف',
      'wen': 'وين',
      'meta': 'متى',
      'lesh': 'ليش'
    };
    
    // Initialize settings
    this.loadSettings();
  }
  
  async loadSettings() {
    try {
      const result = await chrome.storage.sync.get({
        customMappings: {},
        enabledSites: [],
        triggerMethod: 'ctrl-space',
        previewEnabled: true
      });
      
      this.customMappings = result.customMappings;
      this.enabledSites = result.enabledSites;
      this.triggerMethod = result.triggerMethod;
      this.previewEnabled = result.previewEnabled;
    } catch (error) {
      console.log('QuickArabic: Using default settings');
      this.customMappings = {};
      this.enabledSites = [];
      this.triggerMethod = 'ctrl-space';
      this.previewEnabled = true;
    }
  }
  
  transliterate(text) {
    if (!text || typeof text !== 'string') return '';
    
    let result = text.toLowerCase().trim();
    
    // First check extended mappings for complete words
    const lowerText = result.toLowerCase();
    if (this.extendedMapping[lowerText]) {
      return this.extendedMapping[lowerText];
    }
    
    // Check custom mappings
    if (this.customMappings[lowerText]) {
      return this.customMappings[lowerText];
    }
    
    // Handle multi-character mappings first (longest first)
    const sortedKeys = Object.keys(this.mapping).sort((a, b) => b.length - a.length);
    
    for (const latinChar of sortedKeys) {
      const arabicChar = this.mapping[latinChar];
      result = result.replace(new RegExp(latinChar, 'g'), arabicChar);
    }
    
    // Handle definite article
    result = result.replace(/^al-/g, 'ال');
    result = result.replace(/^el-/g, 'ال');
    
    // Clean up any remaining Latin characters that didn't match
    result = this.handleUnmappedCharacters(result);
    
    return result;
  }
  
  handleUnmappedCharacters(text) {
    // Keep spaces and punctuation
    return text.replace(/[a-zA-Z]/g, (char) => {
      // If it's still a Latin character, try some fallbacks
      const fallbacks = {
        'p': 'ب', // No P in Arabic, use B
        'v': 'ف', // No V in Arabic, use F
        'e': 'ي', // E often becomes I/Y
        'o': 'و'  // O often becomes W/U
      };
      return fallbacks[char.toLowerCase()] || char;
    });
  }
  
  // Method to get word boundaries for cursor-based conversion
  getWordAtPosition(text, position) {
    if (!text || position < 0 || position > text.length) {
      return { word: '', start: position, end: position };
    }
    
    // Define word boundary characters (anything that's not a letter or number)
    const wordBoundary = /[^a-zA-Z0-9\u0600-\u06FF]/;
    
    let start = position;
    let end = position;
    
    // Find start of word
    while (start > 0 && !wordBoundary.test(text[start - 1])) {
      start--;
    }
    
    // Find end of word
    while (end < text.length && !wordBoundary.test(text[end])) {
      end++;
    }
    
    return {
      word: text.substring(start, end),
      start: start,
      end: end
    };
  }
  
  // Check if current site is enabled
  isSiteEnabled(url) {
    if (this.enabledSites.length === 0) {
      return true; // If no specific sites configured, enable everywhere
    }
    
    return this.enabledSites.some(site => url.includes(site));
  }
  
  // Add custom mapping
  async addCustomMapping(latin, arabic) {
    this.customMappings[latin.toLowerCase()] = arabic;
    await chrome.storage.sync.set({ customMappings: this.customMappings });
  }
  
  // Remove custom mapping
  async removeCustomMapping(latin) {
    delete this.customMappings[latin.toLowerCase()];
    await chrome.storage.sync.set({ customMappings: this.customMappings });
  }
}

// Make it globally available
if (typeof window !== 'undefined') {
  window.ArabicTransliterator = ArabicTransliterator;
}