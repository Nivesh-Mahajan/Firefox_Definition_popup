// !! IMPORTANT: Replace with your actual keys !!
const DICTIONARY_API_KEY = 'Merriam-Webster-API-KEY-HERE';
const THESAURUS_API_KEY = 'Merriam-Webster-API-KEY-HERE';

const DICTIONARY_ENDPOINT = 'https://www.dictionaryapi.com/api/v3/references/collegiate/json/';
const THESAURUS_ENDPOINT = 'https://www.dictionaryapi.com/api/v3/references/thesaurus/json/';

// Create context menu item (no changes needed here)
browser.runtime.onInstalled.addListener(() => {
  browser.contextMenus.create({
    id: "define-word-mw",
    title: "Look up \"%s\" with MW", // Updated title slightly
    contexts: ["selection"]
  });
  console.log("Context menu item created.");
});

// Listener for when the context menu item is clicked (no changes needed here)
browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "define-word-mw" && info.selectionText) {
    const word = info.selectionText.trim();
    if (word) {
      fetchWordData(word, tab.id); // Call the new function
    }
  }
});

// --- Helper function to parse Dictionary Response ---
function parseDictionaryResponse(data, word) {
  if (Array.isArray(data) && data.length > 0) {
    if (typeof data[0] === 'object' && data[0].shortdef) {
      // Found definitions
      return data[0].shortdef.map((def, index) => `${index + 1}. ${def}`).join('\n');
    } else if (typeof data[0] === 'string') {
      // API returned suggestions
      return `(Suggestions: ${data.slice(0, 3).join(', ')})`;
    }
  }
  return "No definition found."; // Default if no data or unexpected format
}

// --- Helper function to parse Thesaurus Response ---
function parseThesaurusResponse(data, word) {
  if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object') {
    // Check for direct synonyms (often in 'meta') or synonyms within definitions
    if (data[0].meta && Array.isArray(data[0].meta.syns) && data[0].meta.syns.length > 0) {
       // Synonyms might be nested, flatten and join
       const synonyms = data[0].meta.syns.flat().join(', ');
       return synonyms || "No synonyms found."; // Return found synonyms or default
    }
    // Sometimes synonyms are within the 'def' structure (less common for direct syns)
    // Add more specific parsing here if needed based on observing API results for various words.
  } else if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'string') {
      // API returned suggestions if word not found in thesaurus
       return `(Word not found in thesaurus. Suggestions: ${data.slice(0, 3).join(', ')})`;
  }
  return "No synonyms found."; // Default
}


// --- Main function to fetch data from both APIs ---
async function fetchWordData(word, tabId) {
  const dictionaryUrl = `${DICTIONARY_ENDPOINT}${encodeURIComponent(word)}?key=${DICTIONARY_API_KEY}`;
  const thesaurusUrl = `${THESAURUS_ENDPOINT}${encodeURIComponent(word)}?key=${THESAURUS_API_KEY}`;

  let message = {
    action: "showData", // Renamed action
    word: word,
    definition: "Loading definition...",
    synonyms: "Loading synonyms..."
  };

  // Send initial loading message
  browser.tabs.sendMessage(tabId, message).catch(err => console.error("Error sending initial message:", err));

  try {
    // Fetch both concurrently
    const results = await Promise.allSettled([
      fetch(dictionaryUrl).then(res => res.ok ? res.json() : Promise.reject(`Dict HTTP Error: ${res.status}`)),
      fetch(thesaurusUrl).then(res => res.ok ? res.json() : Promise.reject(`Thes HTTP Error: ${res.status}`))
    ]);

    // Process Dictionary Result
    if (results[0].status === 'fulfilled') {
      console.log("Dictionary Response:", results[0].value);
      message.definition = parseDictionaryResponse(results[0].value, word);
    } else {
      console.error("Dictionary Fetch Error:", results[0].reason);
      message.definition = `Error: ${results[0].reason}`;
    }

    // Process Thesaurus Result
    if (results[1].status === 'fulfilled') {
      console.log("Thesaurus Response:", results[1].value);
      message.synonyms = parseThesaurusResponse(results[1].value, word);
       // Only keep synonyms if actual synonyms were found, not suggestions/errors
      if (message.synonyms.startsWith('(') || message.synonyms.startsWith('No syn') || message.synonyms.startsWith('Error:')) {
           // Optionally clear it or keep the message, depending on preference
           // message.synonyms = null; // Or keep the info message
      }
    } else {
      console.error("Thesaurus Fetch Error:", results[1].reason);
      message.synonyms = `Error: ${results[1].reason}`;
    }

  } catch (error) {
    // Catch potential errors in Promise.allSettled itself (unlikely here)
    console.error("General fetch error:", error);
    message.definition = "Failed to fetch data.";
    message.synonyms = ""; // Clear synonyms on general failure
  }

  // Send final data to the content script
  console.log("Sending final message:", message);
  browser.tabs.sendMessage(tabId, message).catch(err => console.error("Error sending final message:", err));
}
