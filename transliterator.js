class ArabicTransliterator {
  constructor() {
    // ENHANCED PHONETIC MAPPING - Ordered by priority and length for correct replacement
    this.initializeMappings();
    this.initializeTashkeel();
    
    // Initialize settings
    this.loadSettings();
  }
  
  initializeMappings() {
    // PRIORITY 1: Complete words and phrases (highest priority - longest matches first)
    this.completeWords = {
      // Islamic phrases with corrected spellings
      'allah': 'الله',
      'bismillah': 'بسم الله',
      'alhamdulillah': 'الحمد لله',
      'subhanallah': 'سبحان الله',
      'inshallah': 'إن شاء الله',
      'enshallah': 'إن شاء الله', // Common misspelling
      'mashallah': 'ما شاء الله',
      'masala': 'ما شاء الله', // Common misspelling correction
      'astaghfirullah': 'أستغفر الله',
      'lahaula': 'لا حول ولا قوة إلا بالله',
      'barakallahu': 'بارك الله',
      'jazakallahu': 'جزاك الله خيراً',
      
      // Compound greetings
      'assalamu3alaykum': 'السلام عليكم',
      'assalamualaykum': 'السلام عليكم',
      'wa3alaykumassalam': 'وعليكم السلام',
      'waalaykumassalam': 'وعليكم السلام',
      'ahlanwasahlan': 'أهلاً وسهلاً',
      'salam3alaykum': 'سلام عليكم',
      
      // Corrected individual words
      'salam': 'سلام',
      'ahlan': 'أهلاً', // Fixed: was 'أهلان', should be 'أهلاً'
      'marhaba': 'مرحباً',
      'shukran': 'شكراً',
      'habibi': 'حبيبي',
      'habibti': 'حبيبتي',
      'habbibak': 'حبّك', // With shadda
      'hayati': 'حياتي',
      'rohi': 'روحي',
      'albi': 'قلبي'
    };
    
    // PRIORITY 2: Long vowels and diphthongs (before single letters)
    this.longVowels = {
      'aa': 'ا',
      'ee': 'ي',
      'ii': 'ي', 
      'oo': 'و',
      'uu': 'و',
      'ay': 'اي',
      'ai': 'اي',
      'aw': 'او',
      'ow': 'او',
      'ou': 'او',
      'ey': 'ي'
    };
    
    // PRIORITY 3: Multi-character combinations (ordered by length, longest first)
    this.multiChar = {
      // Special Arabic sounds
      'kh': 'خ',
      'gh': 'غ', 
      'sh': 'ش',
      'th': 'ث',
      'dh': 'ذ',
      'ph': 'ف', // Sometimes used for ف
      
      // Definite articles
      'al-': 'ال',
      'el-': 'ال', 
      'il-': 'ال',
      'ul-': 'ال'
    };
    
    // PRIORITY 4: Chat Arabic numbers
    this.chatArabic = {
      '2': 'ء',    // Hamza
      '3': 'ع',    // Ayn
      '5': 'خ',    // Kha
      '6': 'ط',    // Ta (emphatic)
      '7': 'ح',    // Ha
      '8': 'خ',    // Kha (alternative)
      '9': 'ق'     // Qaf
    };
    
    // PRIORITY 5: Single consonants
    this.consonants = {
      'b': 'ب', 't': 'ت', 'j': 'ج', 'd': 'د', 'r': 'ر',
      'z': 'ز', 's': 'س', 'f': 'ف', 'q': 'ق', 'k': 'ك',
      'l': 'ل', 'm': 'م', 'n': 'ن', 'w': 'و', 'y': 'ي',
      'h': 'ه', 'c': 'س', 'x': 'كس', 'v': 'ف', 'p': 'ب'
    };
    
    // PRIORITY 6: Emphatic consonants (capitals)
    this.emphaticConsonants = {
      'T': 'ط', 'S': 'ص', 'D': 'ض', 'H': 'ح', 'Z': 'ظ'
    };
    
    // Combine all mappings in order
    this.compiledMapping = {
      ...this.completeWords,
      ...this.longVowels,
      ...this.multiChar,
      ...this.chatArabic,
      ...this.emphaticConsonants,
      ...this.consonants
    };
    
    // Create ordered keys for replacement (longest first to avoid conflicts)
    this.orderedKeys = Object.keys(this.compiledMapping)
      .sort((a, b) => b.length - a.length || a.localeCompare(b));
  }
  
  initializeTashkeel() {
    // Optional vowel marks (tashkeel) for educational purposes
    this.tashkeel = {
      'fatha': 'َ',     // Short A sound
      'kasra': 'ِ',     // Short I sound  
      'damma': 'ُ',     // Short U sound
      'sukun': 'ْ',     // No vowel sound
      'shadda': 'ّ',    // Double consonant
      'tanween_fath': 'ً', // Indefinite -an
      'tanween_kasr': 'ٍ', // Indefinite -in
      'tanween_damm': 'ٌ'  // Indefinite -un
    };
    
    // Tashkeel is disabled by default, can be enabled in settings
    this.enableTashkeel = false;
    
    // Initialize advanced linguistic features
    this.initializeAdvancedFeatures();
  }
  
  initializeAdvancedFeatures() {
    // Sun and Moon letters for definite article assimilation
    this.sunLetters = ['ت', 'ث', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ل', 'ن'];
    this.moonLetters = ['أ', 'ب', 'ج', 'ح', 'خ', 'ع', 'غ', 'ف', 'ق', 'ك', 'م', 'ه', 'و', 'ي'];
    
    // Arabic root patterns (common morphological patterns)
    this.rootPatterns = {
      'fa3al': ['ف', 'ع', 'ل'],     // فعل - basic verb form
      'fa3il': ['ف', 'ع', 'ل'],     // فعيل - adjective pattern
      'maf3ul': ['م', 'ف', 'ع', 'و', 'ل'], // مفعول - passive participle
      'muf3il': ['م', 'ف', 'ع', 'ل'], // مفعل - active participle
      'if3al': ['إ', 'ف', 'ع', 'ا', 'ل'], // إفعال - verbal noun
      'taf3il': ['ت', 'ف', 'ع', 'ي', 'ل'] // تفعيل - verbal noun
    };
    
    // Dialectal variations mapping
    this.dialectalVariations = {
      'egyptian': {
        'ج': 'g',    // Egyptian J sounds like G
        'ث': 's',    // Egyptian TH sounds like S 
        'ذ': 'z',    // Egyptian DH sounds like Z
        'ق': '2',    // Egyptian Q sounds like hamza
        'كسرة': 'e'   // Egyptian kasra sounds like E
      },
      'levantine': {
        'ق': '2',    // Levantine Q sounds like hamza
        'كاف': 'k',  // Standard K
        'جيم': 'j'   // Standard J
      },
      'gulf': {
        'ج': 'y',    // Gulf J sometimes sounds like Y
        'كاف': 'ch'  // Gulf K sometimes sounds like CH
      }
    };
    
    // Contextual vowel prediction rules
    this.vowelPredictionRules = {
      // After specific consonants, predict likely vowels
      'ب': { likely: 'a', alternatives: ['i', 'u'] },
      'ت': { likely: 'a', alternatives: ['i', 'u'] },
      'ح': { likely: 'a', alternatives: ['i'] },
      'د': { likely: 'a', alternatives: ['i'] },
      'س': { likely: 'a', alternatives: ['i', 'u'] },
      'ع': { likely: 'a', alternatives: ['i', 'u'] },
      'ف': { likely: 'a', alternatives: ['i', 'u'] },
      'ل': { likely: 'a', alternatives: ['i', 'u'] },
      'م': { likely: 'a', alternatives: ['i', 'u'] },
      'ن': { likely: 'a', alternatives: ['i', 'u'] },
      'ه': { likely: 'a', alternatives: ['i'] },
      'و': { likely: 'u', alternatives: ['a'] },
      'ي': { likely: 'i', alternatives: ['a'] }
    };
    
    // Phonetic similarity mapping for fuzzy matching
    this.phoneticSimilarity = {
      'b': ['p', 'v'],
      'f': ['p', 'v'], 
      's': ['c', 'z'],
      'z': ['s'],
      'k': ['c', 'g', 'q'],
      'g': ['k', 'q'],
      'j': ['g', 'y'],
      'y': ['j', 'i'],
      'w': ['v', 'u', 'o'],
      'd': ['t'],
      't': ['d'],
      'r': ['l'],
      'l': ['r'],
      'n': ['m'],
      'm': ['n']
    };
    
    // Current dialect setting (default: standard)
    this.currentDialect = 'standard';
  }
  
  // Advanced phonetic normalization with linguistic intelligence
  normalizePhonetics(text) {
    if (!text || typeof text !== 'string') return '';
    
    let normalized = text.toLowerCase().trim();
    
    // Phase 1: Fix common misspellings
    normalized = this.applySpellingCorrections(normalized);
    
    // Phase 2: Handle dialectal variations  
    normalized = this.normalizeDialectalVariations(normalized);
    
    // Phase 3: Apply phonetic similarity matching
    normalized = this.applyPhoneticSimilarity(normalized);
    
    // Phase 4: Intelligent word segmentation
    normalized = this.intelligentWordSegmentation(normalized);
    
    return normalized;
  }
  
  applySpellingCorrections(text) {
    const corrections = {
      // Islamic phrases
      'enshallah': 'inshallah', 'enshaallah': 'inshallah', 'ensha allah': 'insha allah',
      'masala': 'mashallah', 'mashala': 'mashallah', 'ma sha allah': 'masha allah',
      'subhanalah': 'subhanallah', 'sobhanallah': 'subhanallah',
      'alhamdulilah': 'alhamdulillah', 'elhamdulillah': 'alhamdulillah',
      'bismilah': 'bismillah', 'besmellah': 'bismillah',
      'astaghfirulah': 'astaghfirullah', 'astghfrullah': 'astaghfirullah',
      
      // Common words
      'habiby': 'habibi', 'habeebi': 'habibi', 'hibeebi': 'habibi',
      'shokran': 'shukran', 'shoukran': 'shukran', 'chukran': 'shukran',
      'maraba': 'marhaba', 'marahaba': 'marhaba', 'marahba': 'marhaba',
      'yala': 'yalla', 'yallah': 'yalla', 'ya allah': 'ya allah',
      
      // Hamza and alef variations
      'a2': 'aa', '2a': 'aa', '2i': 'ii', 'i2': 'ii', '2u': 'uu', 'u2': 'uu',
      
      // Letter variations
      'ph': 'f', 'ck': 'k', 'qu': 'q', 'x': 'ks', 'ch': 'sh',
      
      // Number-letter confusions
      '0': 'o', '1': 'l', '4': 'a', '3': '3' // keep 3 as is for ayn
    };
    
    for (const [wrong, correct] of Object.entries(corrections)) {
      const regex = new RegExp(this.escapeRegex(wrong), 'gi');
      text = text.replace(regex, correct);
    }
    
    return text;
  }
  
  normalizeDialectalVariations(text) {
    // Handle dialectal input based on current dialect setting
    if (this.currentDialect === 'standard') return text;
    
    const dialectMap = this.dialectalVariations[this.currentDialect];
    if (!dialectMap) return text;
    
    // Apply reverse dialectal mapping (from dialect to standard)
    for (const [standard, dialectal] of Object.entries(dialectMap)) {
      if (typeof dialectal === 'string') {
        const regex = new RegExp(this.escapeRegex(dialectal), 'gi');
        text = text.replace(regex, standard);
      }
    }
    
    return text;
  }
  
  applyPhoneticSimilarity(text) {
    // Apply phonetic similarity for uncertain inputs
    let result = text;
    
    for (const [target, alternatives] of Object.entries(this.phoneticSimilarity)) {
      for (const alt of alternatives) {
        // Replace alternatives with target in Arabic context
        const regex = new RegExp(`\\b${this.escapeRegex(alt)}(?=[a-z]*[\\s]|$)`, 'gi');
        result = result.replace(regex, (match, offset, string) => {
          // Only replace if it seems to be in Arabic context
          const beforeChar = string[offset - 1];
          const afterChar = string[offset + match.length];
          
          // Check if surrounded by Arabic-like characters
          if (this.isArabicContext(beforeChar, afterChar)) {
            return target;
          }
          return match;
        });
      }
    }
    
    return result;
  }
  
  intelligentWordSegmentation(text) {
    // Split compound words intelligently based on Arabic morphology
    const compoundPatterns = {
      // Prefix patterns
      'wal': 'wa l',     // و + ال
      'bil': 'bi l',     // ب + ال  
      'fil': 'fi l',     // في + ال
      'lil': 'li l',     // ل + ال
      
      // Common compound greetings (enhanced)
      'salamualaikum': 'salamu alaykum',
      'salamualaykum': 'salamu alaykum', 
      'assalamualaykum': 'assalamu alaykum',
      'waalaykumassalam': 'wa alaykum assalam',
      'wa3alaykumussalam': 'wa 3alaykum assalam',
      
      // Compound Islamic phrases
      'alhamdulillahirabbilalamin': 'alhamdu lillahi rabbi l alamin',
      'laailahaillallah': 'la ilaha illa allah',
      'allahuakbar': 'allahu akbar',
      'subhanallahwaalhamdulillah': 'subhan allah wa alhamdu lillah',
      
      // Common compound words
      'barakallahufik': 'baraka allahu fik',
      'jazakallahukhayr': 'jazaka allahu khayr',
      'assalamualaikumwarahmatullahi': 'assalamu alaykum wa rahmatu llahi',
      
      // Question compound words
      'kayfalhalak': 'kayf al halak',
      'shuakhbarak': 'shu akhbarak',
      'mnwenak': 'min wenak',
      'wenak': 'wen ak',
      
      // Time compounds
      'sabahalkhayr': 'sabah al khayr',
      'masaalkhayy': 'masa al khayr',
      'laylatulqadr': 'laylat ul qadr'
    };
    
    let result = text;
    
    // Apply compound word splitting
    for (const [compound, separated] of Object.entries(compoundPatterns)) {
      const regex = new RegExp(`\\b${this.escapeRegex(compound)}\\b`, 'gi');
      result = result.replace(regex, separated);
    }
    
    return result;
  }
  
  isArabicContext(beforeChar, afterChar) {
    // Determine if we're in an Arabic transliteration context
    const arabicIndicators = /[3679]/; // Chat Arabic numbers
    const arabicLetters = /[\u0600-\u06FF]/; // Arabic Unicode range
    const commonArabicLatin = /[qxzgh]/; // Letters common in Arabic transliteration
    
    return (
      arabicIndicators.test(beforeChar) || arabicIndicators.test(afterChar) ||
      arabicLetters.test(beforeChar) || arabicLetters.test(afterChar) ||
      commonArabicLatin.test(beforeChar) || commonArabicLatin.test(afterChar)
    );
  }
  
  // Escape special regex characters to prevent bugs
  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
    
    // Initialize settings
    this.loadSettings();
  }
  
  async loadSettings() {
    try {
      const result = await chrome.storage.sync.get({
        customMappings: {},
        enabledSites: [],
        triggerMethod: 'ctrl-space',
        previewEnabled: true,
        enableTashkeel: false,
        currentDialect: 'standard',
        morphologyEnabled: false,
        confidenceThreshold: 70
      });
      
      this.customMappings = result.customMappings;
      this.enabledSites = result.enabledSites;
      this.triggerMethod = result.triggerMethod;
      this.previewEnabled = result.previewEnabled;
      this.enableTashkeel = result.enableTashkeel;
      this.currentDialect = result.currentDialect;
      this.morphologyEnabled = result.morphologyEnabled;
      this.confidenceThreshold = result.confidenceThreshold;
    } catch (error) {
      console.log('QuickArabic: Using default settings');
      this.customMappings = {};
      this.enabledSites = [];
      this.triggerMethod = 'ctrl-space';
      this.previewEnabled = true;
      this.enableTashkeel = false;
      this.currentDialect = 'standard';
      this.morphologyEnabled = false;
      this.confidenceThreshold = 70;
    }
  }
  
  transliterate(text) {
    if (!text || typeof text !== 'string') return '';
    
    // Step 1: Normalize input
    let result = this.normalizePhonetics(text);
    
    // Step 2: Check for complete word match first (highest priority)
    const lowerResult = result.toLowerCase();
    if (this.completeWords[lowerResult]) {
      return this.completeWords[lowerResult];
    }
    
    // Step 3: Check custom mappings
    if (this.customMappings && this.customMappings[lowerResult]) {
      return this.customMappings[lowerResult];
    }
    
    // Step 4: Apply phonetic transformations in correct order
    result = this.applyHamzaRules(result);
    result = this.applyDoubledConsonants(result);
    result = this.applyTaMarbuta(result);
    result = this.applyOrderedMapping(result);
    result = this.applyInitialAlef(result);
    result = this.addTashkeelIfEnabled(result);
    
    return result;
  }
  
  // Apply hamza rules: 2a, a2 → أ, i at start → إ
  applyHamzaRules(text) {
    // Hamza with alef at beginning of words
    text = text.replace(/\b(2a|a2)\b/g, 'أ');
    text = text.replace(/\b(2i|i2)\b/g, 'إ');
    text = text.replace(/\b(2u|u2)\b/g, 'أو');
    
    // Initial 'i' becomes alef with hamza below
    text = text.replace(/\bi(?=[a-z])/g, 'إ');
    
    // Standalone hamza
    text = text.replace(/\b2\b/g, 'ء');
    
    return text;
  }
  
  // Apply doubled consonant logic for shadda
  applyDoubledConsonants(text) {
    // Pattern: same consonant repeated (bb, dd, tt, etc.)
    // Convert to consonant + shadda
    const doubledPattern = /([bcdfghjklmnpqrstvwxyz])\1+/gi;
    
    return text.replace(doubledPattern, (match, consonant) => {
      const arabicChar = this.consonants[consonant.toLowerCase()];
      if (arabicChar) {
        return arabicChar + 'ّ'; // Arabic letter + shadda
      }
      return match;
    });
  }
  
  // Apply ta marbuta rules for word endings
  applyTaMarbuta(text) {
    // Final a/ah/eh/it/at → ة (ta marbuta)
    const taMarburaPatterns = [
      /ah\b/g,  // word ending 'ah'
      /at\b/g,  // word ending 'at'
      /eh\b/g,  // word ending 'eh' 
      /it\b/g,  // word ending 'it'
      /a\b(?![a-z])/g // standalone 'a' at word end
    ];
    
    taMarburaPatterns.forEach(pattern => {
      text = text.replace(pattern, 'ة');
    });
    
    return text;
  }
  
  // Apply ordered mapping with regex safety
  applyOrderedMapping(text) {
    // Process in order of key length (longest first) to avoid conflicts
    for (const key of this.orderedKeys) {
      if (text.includes(key)) {
        const escapedKey = this.escapeRegex(key);
        const regex = new RegExp(escapedKey, 'g');
        text = text.replace(regex, this.compiledMapping[key]);
      }
    }
    
    return text;
  }
  
  // Apply initial alef rules
  applyInitialAlef(text) {
    // Words starting with vowels get alef
    text = text.replace(/\ba(?=[\u0600-\u06FF])/g, 'ا');
    text = text.replace(/\be(?=[\u0600-\u06FF])/g, 'ا');
    text = text.replace(/\bo(?=[\u0600-\u06FF])/g, 'ا');
    text = text.replace(/\bu(?=[\u0600-\u06FF])/g, 'ا');
    
    return text;
  }
  
  // Add tashkeel marks if enabled (for educational purposes)
  addTashkeelIfEnabled(text) {
    if (!this.enableTashkeel) return text;
    
    // Simple tashkeel addition logic
    // This is basic - more sophisticated rules could be added
    text = text.replace(/([\u0600-\u06FF])a/g, '$1َ'); // fatha
    text = text.replace(/([\u0600-\u06FF])i/g, '$1ِ'); // kasra 
    text = text.replace(/([\u0600-\u06FF])u/g, '$1ُ'); // damma
    
    return text;
  }
  
  // Enhanced paragraph transliteration with compound word handling
  transliterateParagraph(text) {
    if (!text || typeof text !== 'string') return '';
    
    // Handle compound words first (like wa3alaykumassalam)
    text = this.handleCompoundWords(text);
    
    // Split by spaces and word boundaries but preserve them
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
  
  // Handle compound words by splitting them intelligently
  handleCompoundWords(text) {
    // Common Arabic compound patterns
    const compoundPatterns = {
      // Greetings
      'wa3alaykumassalam': 'wa 3alaykum assalam',
      'assalamu3alaykum': 'assalamu 3alaykum',
      'ahlanwasahlan': 'ahlan wa sahlan',
      
      // Common combinations
      'inshallah': 'insha allah',
      'mashallah': 'masha allah',
      'subhanallah': 'subhan allah',
      'alhamdulillah': 'alhamdu lillah',
      
      // Question patterns
      'shu2akhbarak': 'shu akhbarak',
      'kayfalhalak': 'kayf al halak',
      'mnwenak': 'min wenak'
    };
    
    let result = text;
    for (const [compound, separated] of Object.entries(compoundPatterns)) {
      const regex = new RegExp(this.escapeRegex(compound), 'gi');
      result = result.replace(regex, separated);
    }
    
    return result;
  }
  
  // Enable/disable tashkeel for educational purposes
  setTashkeelEnabled(enabled) {
    this.enableTashkeel = enabled;
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
  
  // Advanced settings and configuration methods
  setTashkeelEnabled(enabled) {
    this.enableTashkeel = enabled;
  }
  
  setDialect(dialect) {
    const supportedDialects = ['standard', 'egyptian', 'levantine', 'gulf'];
    if (supportedDialects.includes(dialect)) {
      this.currentDialect = dialect;
    }
  }
  
  // Enhanced custom mapping management
  async addCustomMapping(latin, arabic, dialect = 'standard') {
    const key = `${latin.toLowerCase()}_${dialect}`;
    this.customMappings[key] = {
      arabic: arabic,
      dialect: dialect,
      createdAt: Date.now(),
      usageCount: 0
    };
    await chrome.storage.sync.set({ customMappings: this.customMappings });
  }
  
  async removeCustomMapping(latin, dialect = 'standard') {
    const key = `${latin.toLowerCase()}_${dialect}`;
    delete this.customMappings[key];
    await chrome.storage.sync.set({ customMappings: this.customMappings });
  }
  
  // Advanced transliteration with morphological analysis
  transliterateAdvanced(text, options = {}) {
    const {
      enableMorphology = false,
      enableRootDetection = false,
      enableDialectDetection = false,
      confidence = 'medium' // low, medium, high
    } = options;
    
    let result = this.transliterate(text);
    
    if (enableMorphology) {
      result = this.applyMorphologicalAnalysis(result);
    }
    
    if (enableRootDetection) {
      result = this.applyRootPatternRecognition(result);
    }
    
    if (enableDialectDetection) {
      const detectedDialect = this.detectDialect(text);
      if (detectedDialect !== this.currentDialect) {
        this.setDialect(detectedDialect);
        result = this.transliterate(text); // Re-transliterate with detected dialect
      }
    }
    
    return {
      result,
      confidence: this.calculateConfidence(text, result),
      detectedDialect: this.currentDialect,
      alternativeTransliterations: this.generateAlternatives(text)
    };
  }
  
  applyMorphologicalAnalysis(text) {
    // Basic morphological analysis - identify prefixes, roots, suffixes
    let result = text;
    
    // Common Arabic prefixes
    const prefixes = {
      'و': 'wa',   // and
      'ف': 'fa',   // so/then  
      'ب': 'bi',   // with/in
      'ل': 'li',   // for/to
      'ك': 'ka'    // like/as
    };
    
    // Common Arabic suffixes
    const suffixes = {
      'ها': 'ha',   // her/its
      'هم': 'hum',  // them (masc)
      'هن': 'hun',  // them (fem)
      'ني': 'ni',   // me
      'ك': 'ak',   // you (masc)
      'ك': 'ik'    // you (fem)
    };
    
    // Apply morphological segmentation
    // This is a simplified version - a full implementation would be much more complex
    
    return result;
  }
  
  applyRootPatternRecognition(text) {
    // Attempt to identify Arabic root patterns in the transliterated text
    // This is advanced Arabic morphology - simplified implementation
    
    const commonRoots = {
      'ktb': ['ك', 'ت', 'ب'], // write root
      'qrl': ['ق', 'ر', 'أ'], // read root  
      'drb': ['د', 'ر', 'ب'], // hit/go root
      'slm': ['س', 'ل', 'م'], // peace root
      'hmd': ['ح', 'م', 'د'], // praise root
      'qds': ['ق', 'د', 'س']  // holy root
    };
    
    // This would require much more sophisticated implementation
    // For now, return text as is
    return text;
  }
  
  detectDialect(text) {
    // Simple dialect detection based on characteristic patterns
    const dialectPatterns = {
      'egyptian': /\b(eh|ay|geh|da|de)\b/i,
      'levantine': /\b(shu|wen|halla2|ya3ni)\b/i, 
      'gulf': /\b(shlonak|wesh|hathy|hal)\b/i
    };
    
    for (const [dialect, pattern] of Object.entries(dialectPatterns)) {
      if (pattern.test(text)) {
        return dialect;
      }
    }
    
    return 'standard';
  }
  
  calculateConfidence(input, output) {
    // Calculate transliteration confidence based on various factors
    let confidence = 100;
    
    // Reduce confidence for:
    // - Remaining Latin characters
    const remainingLatin = (output.match(/[a-zA-Z]/g) || []).length;
    confidence -= remainingLatin * 5;
    
    // - Very short inputs
    if (input.length < 3) confidence -= 20;
    
    // - Inputs with numbers (except chat Arabic)
    const numbers = (input.match(/[0-46-8]/g) || []).length;
    confidence -= numbers * 10;
    
    // - Unknown words (not in dictionary)
    if (!this.completeWords[input.toLowerCase()]) confidence -= 15;
    
    return Math.max(0, Math.min(100, confidence));
  }
  
  generateAlternatives(text) {
    // Generate alternative transliterations for ambiguous inputs
    const alternatives = [];
    
    // Try different vowel combinations
    const vowelAlternatives = {
      'a': ['e', 'i'],
      'i': ['e', 'y'], 
      'u': ['o', 'w']
    };
    
    // Generate up to 3 alternatives
    let altCount = 0;
    for (const [vowel, alts] of Object.entries(vowelAlternatives)) {
      if (altCount >= 3) break;
      
      for (const alt of alts) {
        if (text.includes(vowel)) {
          const alternative = text.replace(new RegExp(vowel, 'g'), alt);
          const transliterated = this.transliterate(alternative);
          if (transliterated !== this.transliterate(text)) {
            alternatives.push({
              input: alternative,
              output: transliterated,
              reason: `Alternative vowel: ${vowel} → ${alt}`
            });
            altCount++;
            break;
          }
        }
      }
    }
    
    return alternatives;
  }
  
  // Get statistics about transliteration usage
  getTransliterationStats() {
    const stats = {
      totalCustomMappings: Object.keys(this.customMappings).length,
      mostUsedMappings: [],
      dialectDistribution: {},
      averageConfidence: 0
    };
    
    // Analyze custom mappings usage
    const sortedMappings = Object.entries(this.customMappings)
      .sort(([,a], [,b]) => (b.usageCount || 0) - (a.usageCount || 0))
      .slice(0, 10);
    
    stats.mostUsedMappings = sortedMappings.map(([key, data]) => ({
      key: key.split('_')[0],
      arabic: data.arabic,
      dialect: data.dialect,
      usageCount: data.usageCount || 0
    }));
    
    // Calculate dialect distribution
    Object.values(this.customMappings).forEach(mapping => {
      const dialect = mapping.dialect || 'standard';
      stats.dialectDistribution[dialect] = (stats.dialectDistribution[dialect] || 0) + 1;
    });
    
    return stats;
  }
  
  // Export user data for backup
  async exportUserData() {
    const data = {
      version: '2.0',
      exportDate: new Date().toISOString(),
      customMappings: this.customMappings,
      settings: {
        enableTashkeel: this.enableTashkeel,
        currentDialect: this.currentDialect,
        triggerMethod: this.triggerMethod,
        previewEnabled: this.previewEnabled
      },
      statistics: this.getTransliterationStats()
    };
    
    return JSON.stringify(data, null, 2);
  }
  
  // Import user data from backup
  async importUserData(jsonData) {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.version && data.customMappings) {
        this.customMappings = data.customMappings;
        
        if (data.settings) {
          this.enableTashkeel = data.settings.enableTashkeel || false;
          this.currentDialect = data.settings.currentDialect || 'standard';
          this.triggerMethod = data.settings.triggerMethod || 'ctrl-space';
          this.previewEnabled = data.settings.previewEnabled !== false;
        }
        
        // Save to chrome storage
        await chrome.storage.sync.set({
          customMappings: this.customMappings,
          enableTashkeel: this.enableTashkeel,
          currentDialect: this.currentDialect,
          triggerMethod: this.triggerMethod,
          previewEnabled: this.previewEnabled
        });
        
        return { success: true, message: 'Data imported successfully' };
      } else {
        return { success: false, message: 'Invalid data format' };
      }
    } catch (error) {
      return { success: false, message: 'Failed to parse data: ' + error.message };
    }
  }
}

// Make it globally available with version info
if (typeof window !== 'undefined') {
  window.ArabicTransliterator = ArabicTransliterator;
  window.QuickArabicVersion = '2.0.0-advanced';
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ArabicTransliterator;
}