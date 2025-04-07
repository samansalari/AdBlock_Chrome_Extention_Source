// Service Worker background script
// Handles network request filtering and dynamic rule management

// Default configuration
const defaultConfig = {
  enabled: true,
  debugMode: false,
  whitelistedSites: [],
  blockThirdPartyRequests: true,
  advancedFiltering: true
};

// Initialize extension storage with default settings if not already set
chrome.runtime.onInstalled.addListener(async () => {
  const config = await chrome.storage.local.get('config');
  if (!config.config) {
    await chrome.storage.local.set({ config: defaultConfig });
    console.log('Extension installed with default configuration');
  }
  
  // Set up dynamic rules
  updateDynamicRules();
});

// Common ad network domains to block
const commonAdNetworks = [
  "*://*.doubleclick.net/*",
  "*://*.googlesyndication.com/*",
  "*://*.googleadservices.com/*",
  "*://*.google-analytics.com/*",
  "*://*.adnxs.com/*",
  "*://*.taboola.com/*",
  "*://*.outbrain.com/*",
  "*://*.criteo.com/*",
  "*://*.adform.net/*",
  "*://*.amazon-adsystem.com/*"
];

// Common tracking scripts
const trackingScripts = [
  "*://*analytics*.js",
  "*://*/*ads*.js",
  "*://*/*tracker*.js",
  "*://*/*pixel*.js",
  "*://*/*adsbygoogle*.js"
];

// Anti-adblock script patterns
const antiAdblockPatterns = [
  "*://*/*adblock*detect*.js",
  "*://*/*blockadblock*.js",
  "*://*/*fuckadblock*.js",
  "*://*/*detector*.js",
  "*://*/*admiral*.js"
];

// Set up dynamic rules based on declarativeNetRequest
async function updateDynamicRules() {
  try {
    const config = (await chrome.storage.local.get('config')).config || defaultConfig;
    
    if (!config.enabled) {
      // Clear all rules if extension is disabled
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: await getRuleIds()
      });
      return;
    }

    // Get the whitelist from storage
    const whitelistedSites = config.whitelistedSites || [];
    const blockThirdParty = config.blockThirdPartyRequests;
    
    // Generate rules for known ad networks
    const rules = [];
    let ruleId = 1;
    
    // Add rules for ad network domains
    commonAdNetworks.forEach(pattern => {
      if (blockThirdParty) {
        rules.push({
          id: ruleId++,
          priority: 1,
          action: { type: "block" },
          condition: {
            urlFilter: pattern,
            resourceTypes: ["script", "image", "xmlhttprequest", "sub_frame"]
          }
        });
      }
    });
    
    // Add rules for tracking scripts
    trackingScripts.forEach(pattern => {
      rules.push({
        id: ruleId++,
        priority: 1,
        action: { type: "block" },
        condition: {
          urlFilter: pattern,
          resourceTypes: ["script"]
        }
      });
    });
    
    // Add rules for anti-adblock scripts
    antiAdblockPatterns.forEach(pattern => {
      rules.push({
        id: ruleId++,
        priority: 2, // Higher priority for anti-adblock scripts
        action: { type: "redirect", redirect: { extensionPath: "/injected-scripts/adblock-defuser.js" } },
        condition: {
          urlFilter: pattern,
          resourceTypes: ["script"]
        }
      });
    });
    
    // Update the dynamic rules
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: await getRuleIds(),
      addRules: rules
    });

    if (config.debugMode) {
      console.log(`Updated ${rules.length} dynamic rules`);
    }
  } catch (error) {
    console.error('Error updating dynamic rules:', error);
  }
}

// Helper function to get all current rule IDs
async function getRuleIds() {
  const rules = await chrome.declarativeNetRequest.getDynamicRules();
  return rules.map(rule => rule.id);
}

// Listen for configuration changes
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.config) {
    updateDynamicRules();
  }
});

// Listen for messages from the popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getConfig') {
    chrome.storage.local.get('config', result => {
      sendResponse(result.config || defaultConfig);
    });
    return true; // Required for async response
  }
  
  if (message.action === 'updateConfig') {
    chrome.storage.local.set({ config: message.config }, () => {
      updateDynamicRules();
      sendResponse({ success: true });
    });
    return true; // Required for async response
  }
  
  if (message.action === 'toggleEnabled') {
    chrome.storage.local.get('config', result => {
      const config = result.config || defaultConfig;
      config.enabled = !config.enabled;
      chrome.storage.local.set({ config }, () => {
        updateDynamicRules();
        sendResponse({ success: true, enabled: config.enabled });
      });
    });
    return true; // Required for async response
  }
  
  if (message.action === 'toggleSiteWhitelist') {
    chrome.storage.local.get('config', result => {
      const config = result.config || defaultConfig;
      const site = message.site;
      
      if (config.whitelistedSites.includes(site)) {
        config.whitelistedSites = config.whitelistedSites.filter(s => s !== site);
      } else {
        config.whitelistedSites.push(site);
      }
      
      chrome.storage.local.set({ config }, () => {
        updateDynamicRules();
        sendResponse({ 
          success: true, 
          whitelisted: config.whitelistedSites.includes(site),
          site
        });
      });
    });
    return true; // Required for async response
  }
  
  if (message.action === 'logDebug' && message.data) {
    chrome.storage.local.get('config', result => {
      const config = result.config || defaultConfig;
      if (config.debugMode) {
        console.log('[StreamGuard Debug]', message.data);
      }
      sendResponse({ success: true });
    });
    return true; // Required for async response
  }
});

// Add chrome.scripting API to dynamically inject scripts when needed
async function injectCleanupScript(tabId) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['content-scripts/emergency-cleaner.js']
    });
  } catch (error) {
    console.error('Error injecting cleanup script:', error);
  }
}

// Listen for tab updates to handle adblock detection scenarios
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // Check if we're on a known problematic site that needs extra handling
    const knownProblematicSites = [
      'streaming',
      'video',
      'player',
      'tube',
      'watch'
    ];
    
    const needsExtraHandling = knownProblematicSites.some(site => 
      tab.url.toLowerCase().includes(site)
    );
    
    if (needsExtraHandling) {
      // Wait a bit for the site to fully load and potentially trigger adblock detection
      setTimeout(() => {
        chrome.scripting.executeScript({
          target: { tabId },
          function: () => {
            // Signal to the content script that it should perform a deep clean
            window.postMessage({ type: 'STREAM_GUARD_DEEP_CLEAN' }, '*');
          }
        });
      }, 2500);
    }
  }
});
