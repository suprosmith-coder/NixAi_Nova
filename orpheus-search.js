/* ================================================================
   ORPHEUS WEB SEARCH INTEGRATION
   
   Canopy Labs Orpheus English API
   Multi-tiered web information system
================================================================ */

// ============================================================================
// ORPHEUS API CONFIGURATION
// ============================================================================

const ORPHEUS_CONFIG = {
    apiKey: 'your-orpheus-api-key-here',
    baseUrl: 'https://api.canopylabs.com/v1', // Update with actual URL
    
    // Pricing tiers (for reference)
    pricing: {
        characters: 22,              // $22 flat - 100 chars/sec
        advancedSearch: 0.008,       // $8 per 1000 requests
        visitWebsite: 0.001,         // $1 per 1000 requests
        browserSearch: 0.005,        // $5 per 1000 requests
        browserOpen: 0.001           // $1 per 1000 requests
    },
    
    // Rate limits
    rateLimit: {
        charactersPerSecond: 100
    }
};

// ============================================================================
// ORPHEUS SEARCH FUNCTIONS
// ============================================================================

/**
 * Advanced Search - Quick web search ($8/1000)
 * Best for: Quick facts, recent info, direct answers
 */
async function orpheusAdvancedSearch(query, options = {}) {
    try {
        const response = await fetch(`${ORPHEUS_CONFIG.baseUrl}/search`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${ORPHEUS_CONFIG.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: query,
                parameter: 'web_search',
                max_results: options.maxResults || 5,
                ...options
            })
        });
        
        if (!response.ok) throw new Error('Search failed');
        
        const data = await response.json();
        return {
            success: true,
            results: data.results || [],
            cost: 0.008 // $8 per 1000
        };
        
    } catch (error) {
        console.error('Orpheus Advanced Search error:', error);
        return {
            success: false,
            error: error.message,
            results: []
        };
    }
}

/**
 * Visit Website - Pull full page content ($1/1000)
 * Best for: Content scraping, article reading, context retrieval
 */
async function orpheusVisitWebsite(url, options = {}) {
    try {
        const response = await fetch(`${ORPHEUS_CONFIG.baseUrl}/visit`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${ORPHEUS_CONFIG.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url: url,
                parameter: 'visit_website',
                extract_text: options.extractText !== false,
                extract_links: options.extractLinks || false,
                ...options
            })
        });
        
        if (!response.ok) throw new Error('Website visit failed');
        
        const data = await response.json();
        return {
            success: true,
            content: data.content || '',
            title: data.title || '',
            links: data.links || [],
            cost: 0.001 // $1 per 1000
        };
        
    } catch (error) {
        console.error('Orpheus Visit Website error:', error);
        return {
            success: false,
            error: error.message,
            content: ''
        };
    }
}

/**
 * Browser Search - Basic ($5/1000)
 * Best for: Complex queries requiring browser simulation
 */
async function orpheusBrowserSearch(query, options = {}) {
    try {
        const response = await fetch(`${ORPHEUS_CONFIG.baseUrl}/browser`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${ORPHEUS_CONFIG.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: query,
                parameter: 'browser_search',
                action: 'browser.search',
                max_results: options.maxResults || 10,
                ...options
            })
        });
        
        if (!response.ok) throw new Error('Browser search failed');
        
        const data = await response.json();
        return {
            success: true,
            results: data.results || [],
            cost: 0.005 // $5 per 1000
        };
        
    } catch (error) {
        console.error('Orpheus Browser Search error:', error);
        return {
            success: false,
            error: error.message,
            results: []
        };
    }
}

/**
 * Browser Open - Visit via browser ($1/1000)
 * Best for: JavaScript-heavy sites, dynamic content
 */
async function orpheusBrowserOpen(url, options = {}) {
    try {
        const response = await fetch(`${ORPHEUS_CONFIG.baseUrl}/browser`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${ORPHEUS_CONFIG.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url: url,
                parameter: 'browser_search',
                action: 'browser.open',
                wait_for: options.waitFor || 'load',
                extract_text: options.extractText !== false,
                ...options
            })
        });
        
        if (!response.ok) throw new Error('Browser open failed');
        
        const data = await response.json();
        return {
            success: true,
            content: data.content || '',
            title: data.title || '',
            screenshot: data.screenshot || null,
            cost: 0.001 // $1 per 1000
        };
        
    } catch (error) {
        console.error('Orpheus Browser Open error:', error);
        return {
            success: false,
            error: error.message,
            content: ''
        };
    }
}

// ============================================================================
// SMART WEB SEARCH - AUTO-SELECTS BEST METHOD
// ============================================================================

/**
 * Smart search that automatically chooses the best Orpheus method
 * based on query type and cost efficiency
 */
async function orpheusSmartSearch(query, options = {}) {
    // Determine search strategy based on query
    const strategy = determineSearchStrategy(query, options);
    
    let result;
    
    switch (strategy.method) {
        case 'quick':
            // Use Advanced Search for quick facts
            result = await orpheusAdvancedSearch(query, options);
            break;
            
        case 'deep':
            // Use Browser Search for complex queries
            result = await orpheusBrowserSearch(query, options);
            break;
            
        case 'content':
            // Visit specific URL if provided
            if (options.url) {
                result = await orpheusVisitWebsite(options.url, options);
            } else {
                result = await orpheusAdvancedSearch(query, options);
            }
            break;
            
        case 'dynamic':
            // Use Browser Open for JavaScript sites
            if (options.url) {
                result = await orpheusBrowserOpen(options.url, options);
            } else {
                result = await orpheusBrowserSearch(query, options);
            }
            break;
            
        default:
            // Default to Advanced Search (cheapest)
            result = await orpheusAdvancedSearch(query, options);
    }
    
    return {
        ...result,
        strategy: strategy.method,
        reasoning: strategy.reasoning
    };
}

/**
 * Determine best search strategy based on query
 */
function determineSearchStrategy(query, options) {
    const lowerQuery = query.toLowerCase();
    
    // If URL provided, determine if it needs browser
    if (options.url) {
        const needsBrowser = options.url.includes('javascript') || 
                            options.url.includes('spa') ||
                            options.dynamic;
        
        return needsBrowser 
            ? { method: 'dynamic', reasoning: 'URL requires JavaScript execution' }
            : { method: 'content', reasoning: 'Simple URL content retrieval' };
    }
    
    // Complex research queries need browser search
    if (lowerQuery.includes('compare') || 
        lowerQuery.includes('analyze') ||
        lowerQuery.includes('detailed')) {
        return { method: 'deep', reasoning: 'Complex query requires thorough search' };
    }
    
    // Quick fact lookups use advanced search
    if (lowerQuery.includes('what is') ||
        lowerQuery.includes('who is') ||
        lowerQuery.includes('when') ||
        lowerQuery.includes('define')) {
        return { method: 'quick', reasoning: 'Quick fact lookup' };
    }
    
    // Default to quick search (most cost-effective)
    return { method: 'quick', reasoning: 'Standard search query' };
}

// ============================================================================
// INTEGRATION WITH CYANIX AI
// ============================================================================

/**
 * Integrate Orpheus search into Cyanix AI chat
 * Automatically detects when to search the web
 */
async function handleOrpheusInChat(userMessage, context = {}) {
    // Detect if web search is needed
    const needsSearch = detectSearchIntent(userMessage);
    
    if (!needsSearch) {
        return null; // No search needed
    }
    
    // Show search indicator
    showSearchIndicator('Searching the web...');
    
    try {
        // Perform smart search
        const searchResult = await orpheusSmartSearch(userMessage, {
            maxResults: 5,
            ...context
        });
        
        if (!searchResult.success) {
            throw new Error(searchResult.error);
        }
        
        // Format results for AI context
        const formattedResults = formatSearchResults(searchResult);
        
        // Hide search indicator
        hideSearchIndicator();
        
        return {
            success: true,
            results: formattedResults,
            cost: searchResult.cost,
            strategy: searchResult.strategy
        };
        
    } catch (error) {
        hideSearchIndicator();
        showToast('Web search failed', 'error');
        return null;
    }
}

/**
 * Detect if user message requires web search
 */
function detectSearchIntent(message) {
    const lowerMsg = message.toLowerCase();
    
    const searchKeywords = [
        'search for', 'look up', 'find information',
        'what is the latest', 'current', 'recent',
        'news about', 'research', 'compare',
        'latest', 'today', 'this week', 'this month'
    ];
    
    return searchKeywords.some(keyword => lowerMsg.includes(keyword));
}

/**
 * Format search results for AI consumption
 */
function formatSearchResults(searchResult) {
    if (!searchResult.results || searchResult.results.length === 0) {
        return 'No search results found.';
    }
    
    let formatted = `Web Search Results (via ${searchResult.strategy}):\n\n`;
    
    searchResult.results.forEach((result, index) => {
        formatted += `${index + 1}. ${result.title}\n`;
        formatted += `   URL: ${result.url}\n`;
        formatted += `   ${result.snippet || result.content}\n\n`;
    });
    
    return formatted;
}

/**
 * Show search indicator in chat
 */
function showSearchIndicator(message) {
    const indicator = document.createElement('div');
    indicator.id = 'orpheus-search-indicator';
    indicator.className = 'search-indicator';
    indicator.innerHTML = `
        <div class="search-spinner"></div>
        <span>${message}</span>
    `;
    
    document.getElementById('messagesWrapper').appendChild(indicator);
    scrollToBottom();
}

/**
 * Hide search indicator
 */
function hideSearchIndicator() {
    const indicator = document.getElementById('orpheus-search-indicator');
    if (indicator) indicator.remove();
}

// ============================================================================
// COST TRACKING
// ============================================================================

let orpheusCostTracker = {
    totalCost: 0,
    requestCounts: {
        advancedSearch: 0,
        visitWebsite: 0,
        browserSearch: 0,
        browserOpen: 0
    }
};

/**
 * Track Orpheus API costs
 */
function trackOrpheusCost(method, count = 1) {
    const costs = {
        advancedSearch: 0.008,
        visitWebsite: 0.001,
        browserSearch: 0.005,
        browserOpen: 0.001
    };
    
    orpheusCostTracker.requestCounts[method] += count;
    orpheusCostTracker.totalCost += costs[method] * count;
    
    // Save to localStorage
    localStorage.setItem('orpheus_costs', JSON.stringify(orpheusCostTracker));
}

/**
 * Get cost statistics
 */
function getOrpheusCostStats() {
    return {
        totalCost: orpheusCostTracker.totalCost.toFixed(4),
        breakdown: orpheusCostTracker.requestCounts,
        estimated: `$${(orpheusCostTracker.totalCost * 1000).toFixed(2)} per 1000 requests`
    };
}

// ============================================================================
// INITIALIZATION
// ============================================================================

function initOrpheus() {
    // Load saved costs
    const saved = localStorage.getItem('orpheus_costs');
    if (saved) {
        orpheusCostTracker = JSON.parse(saved);
    }
    
    console.log('✅ Orpheus Web Search initialized');
}

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOrpheus);
} else {
    initOrpheus();
}

// ============================================================================
// EXPORT FOR MODULE USAGE
// ============================================================================

// If using modules, export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        orpheusAdvancedSearch,
        orpheusVisitWebsite,
        orpheusBrowserSearch,
        orpheusBrowserOpen,
        orpheusSmartSearch,
        handleOrpheusInChat,
        getOrpheusCostStats,
        ORPHEUS_CONFIG
    };
}
