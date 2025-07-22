class ArabicTransliterator {
  constructor() {
    // SMART MAPPING: Only convert when it makes sense!
    this.mapping = {
      // PRIORITY 1: Complete Arabic words (highest priority)
      'allah': 'الله',
      'bismillah': 'بسم الله',
      'alhamdulillah': 'الحمد لله',
      'subhanallah': 'سبحان الله',
      'inshallah': 'إن شاء الله',
      'mashallah': 'ما شاء الله',
      'astaghfirullah': 'أستغفر الله',
      'salam': 'سلام',
      'ahlan': 'أهلان',
      'marhaba': 'مرحباً',
      'shukran': 'شكراً',
      'habibi': 'حبيبي',
      'habibti': 'حبيبتي',
      
      // PRIORITY 2: Definite articles 
      'al-': 'ال',
      'el-': 'ال',
      'il-': 'ال',
      
      // PRIORITY 3: Special Arabic sounds (longer combinations first)
      'kh': 'خ',   // خ - Kha (keep this)
      'gh': 'غ',   // غ - Ghayn (keep this)
      'sh': 'ش',   // ش - Sheen (keep this)  
      'th': 'ث',   // ث - Tha (keep this)
      'dh': 'ذ',   // ذ - Thal (keep this)
      
      // PRIORITY 4: Chat Arabic numbers (very common)
      '3': 'ع',    // ع - Ayn
      '7': 'ح',    // ح - Ha  
      '9': 'ق',    // ق - Qaf
      '8': 'خ',    // خ - Kha (alternative)
      '6': 'ط',    // ط - Ta (emphatic)
      '5': 'خ',    // خ - Kha (another common one)
      '2': 'ء',    // ء - Hamza
      
      // PRIORITY 5: Essential consonants (NO VOWELS HERE!)
      'b': 'ب',    // ب - Ba
      't': 'ت',    // ت - Ta  
      'j': 'ج',    // ج - Jim
      'd': 'د',    // د - Dal
      'r': 'ر',    // ر - Ra
      'z': 'ز',    // ز - Zayn
      's': 'س',    // س - Seen
      'f': 'ف',    // ف - Fa
      'q': 'ق',    // ق - Qaf
      'k': 'ك',    // ك - Kaf
      'l': 'ل',    // ل - Lam
      'm': 'م',    // م - Meem
      'n': 'ن',    // ن - Noon
      'w': 'و',    // و - Waw
      'y': 'ي',    // ي - Ya
      
      // PRIORITY 6: Emphatic letters (capital = emphatic)
      'T': 'ط',    // ط - Ta (emphatic)
      'S': 'ص',    // ص - Sad (emphatic)
      'D': 'ض',    // ض - Dad (emphatic)
      'H': 'ح',    // ح - Ha (emphatic)
      'Z': 'ظ',    // ظ - Zah (emphatic)
      
      // PRIORITY 7: Only convert standalone h at word end or before consonants
      // 'h' mapping is handled specially in the logic
      
      // REMOVED PROBLEMATIC MAPPINGS:
      // - NO 'a' → 'ا' (too common in English)
      // - NO 'i' → 'ي' (too common in English)  
      // - NO 'u' → 'و' (too common in English)
      // - NO 'o' → 'و' (too common in English)
      // - NO 'e' → 'ي' (too common in English)
      
      // Special cases will be handled in logic
    };
    
    // Extended mappings for complete words and phrases
    this.extendedMapping = {
      // Islamic phrases (already in main mapping but kept for backward compatibility)
      'allah': 'الله',
      'bismillah': 'بسم الله',
      'inshallah': 'إن شاء الله',
      'mashallah': 'ما شاء الله',
      'alhamdulillah': 'الحمد لله',
      'subhanallah': 'سبحان الله',
      'astaghfirullah': 'أستغفر الله',
      'lahaula': 'لا حول ولا قوة إلا بالله',
      'barakallahu': 'بارك الله',
      'jazakallahu': 'جزاك الله خيراً',
      
      // Greetings and common phrases
      'salam': 'سلام',
      'assalam': 'السلام',
      'assalamu3alaykum': 'السلام عليكم',
      'wa3alaykumassalam': 'وعليكم السلام',
      'ahlan': 'أهلاً',
      'ahlanwasahlan': 'أهلاً وسهلاً',
      'marhaba': 'مرحباً',
      'marhabik': 'مرحبك',  // feminine
      'shukran': 'شكراً',
      'kateer': 'كتير',
      'afwan': 'عفواً',
      '3afwan': 'عفواً',
      'habibi': 'حبيبي',
      'habibti': 'حبيبتي',
      'hayati': 'حياتي',
      'rohi': 'روحي',
      'albi': 'قلبي',
      
      // Family terms
      'abu': 'أبو',
      'um': 'أم',
      'ibn': 'ابن',
      'bint': 'بنت',
      'akh': 'أخ',
      'ukht': 'أخت',
      'baba': 'بابا',
      'mama': 'ماما',
      'teta': 'تيتا',
      'jiddo': 'جدو',
      
      // Question words and interrogatives
      'shu': 'شو',
      'sheno': 'شينو',
      'esh': 'إيش',
      'eish': 'إيش',
      'kayf': 'كيف',
      'kifak': 'كيفك',
      'kifik': 'كيفك', // feminine
      'shu2akhbarak': 'شو أخبارك',
      'wen': 'وين',
      'fein': 'فين',
      'meta': 'متى',
      'mata': 'متى',
      'lesh': 'ليش',
      'leih': 'ليه',
      'min': 'مين',
      'mino': 'مينو',
      
      // Common verbs
      'ruh': 'روح',
      'ta3al': 'تعال',
      'ta3ali': 'تعالي', // feminine
      'imshi': 'امشي',
      'aruh': 'أروح',
      'anam': 'أنام',
      'akul': 'آكل',
      'ashrab': 'أشرب',
      'ashouf': 'أشوف',
      'asma3': 'أسمع',
      'aktib': 'أكتب',
      'aqra': 'أقرأ',
      
      // Time and days
      'yom': 'يوم',
      'youm': 'يوم',
      'sahar': 'سهر',
      'leil': 'ليل',
      'sabah': 'صباح',
      'masa': 'مساء',
      'nahar': 'نهار',
      'sayi': 'صيف',
      'shita': 'شتا',
      
      // Numbers in Arabic
      'wahed': 'واحد',
      'itnen': 'اثنين',
      'tlate': 'تلاتة',
      'arba3': 'أربعة',
      'khamse': 'خمسة',
      'site': 'ستة',
      'saba3': 'سبعة',
      'tmane': 'تمانية',
      'tis3a': 'تسعة',
      '3ashara': 'عشرة',
      
      // Colors
      'abyad': 'أبيض',
      'aswad': 'أسود',
      'ahmar': 'أحمر',
      'akhdar': 'أخضر',
      'azraq': 'أزرق',
      'asfar': 'أصفر',
      'banafsaji': 'بنفسجي',
      'wardi': 'وردي',
      
      // Common adjectives
      'kibeer': 'كبير',
      'sgheer': 'صغير',
      'taweel': 'طويل',
      'qaseer': 'قصير',
      'helou': 'حلو',
      'helu': 'حلو',
      'jemeel': 'جميل',
      'jameel': 'جميل',
      'sa3b': 'صعب',
      'sahel': 'سهل',
      'jdeed': 'جديد',
      'qadeem': 'قديم',
      
      // Food and drink
      'khubz': 'خبز',
      'lahem': 'لحمة',
      'samak': 'سمك',
      'ruz': 'رز',
      'makarona': 'مكرونة',
      'salata': 'سلطة',
      'shawar': 'شاورما',
      'falafel': 'فلافل',
      'hommus': 'حمص',
      'tabbule': 'تبولة',
      'qahwe': 'قهوة',
      'shai': 'شاي',
      'mai': 'مي',
      'mayy': 'ميّ'
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
    
    // SMART TRANSLITERATION: Handle word endings first, then do character-by-character
    result = this.handleWordEndings(result);
    result = this.handleCharacterMapping(result);
    result = this.handleDefiniteArticles(result);
    result = this.handleUnmappedCharacters(result);
    
    return result;
  }
  
  // NEW: Transliterate full paragraph with multiple words
  transliterateParagraph(text) {
    if (!text || typeof text !== 'string') return '';
    
    // Split by spaces and other word boundaries but preserve them
    const parts = text.split(/(\s+|[^\w\u0600-\u06FF]+)/);
    
    const translatedParts = parts.map(part => {
      // If it's whitespace or punctuation, keep as is
      if (/^\s+$/.test(part) || /^[^\w\u0600-\u06FF]+$/.test(part)) {
        return part;
      }
      
      // If it's already Arabic, keep as is
      if (/[\u0600-\u06FF]/.test(part)) {
        return part;
      }
      
      // If it's a word with Latin characters, transliterate it
      if (/[a-zA-Z0-9]/.test(part)) {
        return this.transliterate(part);
      }
      
      return part;
    });
    
    return translatedParts.join('');
  }
  
  handleWordEndings(text) {
    // Handle ta marbuta endings correctly
    // Only at word boundaries, not in middle of words
    text = text.replace(/ah$/g, 'ة');     // word ending with ah → ة
    text = text.replace(/at$/g, 'ة');     // word ending with at → ة  
    text = text.replace(/eh$/g, 'ة');     // word ending with eh → ة
    text = text.replace(/it$/g, 'ة');     // word ending with it → ة
    
    // Handle hamza endings
    text = text.replace(/a2$/g, 'أ');     // word ending with a2 → أ
    text = text.replace(/2a$/g, 'أ');     // word ending with 2a → أ
    
    return text;
  }
  
  handleCharacterMapping(text) {
    // Sort by length (longest first) for proper pattern matching
    const sortedKeys = Object.keys(this.mapping).sort((a, b) => b.length - a.length);
    
    // Apply each mapping pattern
    for (const latinChar of sortedKeys) {
      const arabicChar = this.mapping[latinChar];
      text = text.replace(new RegExp(latinChar, 'g'), arabicChar);
    }
    
    // SMART VOWEL HANDLING: Only add vowels in specific contexts
    text = this.handleSmartVowels(text);
    
    // SMART H HANDLING: Convert 'h' only in specific contexts
    text = this.handleSmartH(text);
    
    return text;
  }
  
  handleSmartVowels(text) {
    // Only convert isolated vowels at word boundaries or after Arabic letters
    
    // Convert 'a' to 'ا' only:
    // - At start of word: 'ana' → 'أنا'  
    // - After Arabic consonant: 'ba' → 'با'
    text = text.replace(/\ba(?=[bcdfgjklmnpqrstvwxyz]|$)/g, 'ا');
    
    // Convert 'i' to 'ي' only:
    // - At end of words: 'habibi' → 'حبيبي'
    // - In specific Arabic contexts
    text = text.replace(/i(?=\b)/g, 'ي');
    
    // Convert 'u' to 'و' only:
    // - At end of words or before consonants
    text = text.replace(/u(?=[bcdfgjklmnpqrstvwxyz]|\b)/g, 'و');
    
    return text;
  }
  
  handleSmartH(text) {
    // Convert 'h' to 'ه' only in specific contexts:
    // 1. At the end of words: 'kitabah' → 'كتابه'
    // 2. Before consonants: 'lahm' → 'لحم'
    // 3. NOT in combinations like 'th', 'sh', 'kh', 'gh' (already handled)
    
    // Don't convert 'h' that's part of digraphs (th, sh, kh, gh already handled above)
    // Convert standalone 'h' at word end
    text = text.replace(/h\b/g, 'ه');
    
    // Convert 'h' before consonants (but not vowels)
    text = text.replace(/h(?=[bcdfgjklmnpqrstvwxyz])/g, 'ه');
    
    return text;
  }
  
  handleDefiniteArticles(text) {
    // Handle definite articles at word beginnings
    text = text.replace(/^al-/g, 'ال');
    text = text.replace(/^el-/g, 'ال');
    text = text.replace(/^il-/g, 'ال');
    
    return text;
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