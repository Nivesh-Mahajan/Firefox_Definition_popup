let definitionPopup = null;
let currentSelectionRect = null;

// Listen for messages from the background script
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Check for the action name "showData"
  if (request.action === "showData") {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      currentSelectionRect = selection.getRangeAt(0).getBoundingClientRect();
      // Pass definition and synonyms to the popup function
      createOrUpdatePopup(request.word, request.definition, request.synonyms, currentSelectionRect);
    } else {
      removePopup();
    }
  }
});

// Updated function to accept and display both definition and synonyms
function createOrUpdatePopup(word, definition, synonyms, rect) {
  removePopup(); // Remove existing popup first

  definitionPopup = document.createElement('div');
  definitionPopup.id = 'mw-definition-popup-extension';

  // Build inner HTML conditionally
  let definitionHTML = '';
  if (definition && !definition.startsWith('Error:') && !definition.startsWith('No definition')) {
      definitionHTML = `<div class="mw-popup-section"><h4>Definition:</h4><p>${escapeHtml(definition).replace(/\n/g, '<br>')}</p></div>`;
  } else if (definition) {
       definitionHTML = `<div class="mw-popup-section"><p><i>${escapeHtml(definition)}</i></p></div>`; // Show errors/messages
  }

  let synonymsHTML = '';
   // Only show synonyms section if actual synonyms were found (not suggestions/errors)
  if (synonyms && !synonyms.startsWith('Error:') && !synonyms.startsWith('No synonyms') && !synonyms.startsWith('(')) {
    synonymsHTML = `<div class="mw-popup-section"><h4>Synonyms:</h4><p>${escapeHtml(synonyms)}</p></div>`;
  } else if (synonyms && (synonyms.startsWith('(') || synonyms.startsWith('Error:'))) {
     // Optionally display the thesaurus error/suggestion message
     synonymsHTML = `<div class="mw-popup-section"><p><i>Thesaurus: ${escapeHtml(synonyms)}</i></p></div>`;
  }

  definitionPopup.innerHTML = `
  <div class="mw-popup-content">
    ${definitionHTML}
    ${synonymsHTML}
  </div>
  <button id="mw-popup-close-btn" title="Close">&times;</button>
`;

  document.body.appendChild(definitionPopup);

  // --- Positioning Logic (same as before) ---
  const popupWidth = definitionPopup.offsetWidth;
  const popupHeight = definitionPopup.offsetHeight;
  const padding = 10;

  let top = window.scrollY + rect.bottom + padding;
  let left = window.scrollX + rect.left;

  if (left + popupWidth > window.innerWidth) {
    left = window.innerWidth - popupWidth - padding;
  }
   if (top + popupHeight > window.scrollY + window.innerHeight && rect.top > popupHeight + padding) {
    top = window.scrollY + rect.top - popupHeight - padding;
  }

  definitionPopup.style.top = `${Math.max(0, top)}px`;
  definitionPopup.style.left = `${Math.max(0, left)}px`;
  definitionPopup.style.position = 'absolute';
  definitionPopup.style.zIndex = '2147483647';
  // --- End Positioning Logic ---

  // Add listener to close button - this is unchanged
  document.getElementById('mw-popup-close-btn').addEventListener('click', removePopup);

  // **** KEY CHANGE: Only listen for clicks on the close button, not outside clicks ****
  // Remove the outside click listener and keep only the scroll listener
  window.addEventListener('scroll', handleScroll, true);
}

// Modified to handle scrolling without immediately closing popup
// Modified to handle scrolling without immediately closing popup
function handleScroll(event) {
  // Only close the popup if we've scrolled a significant amount
  // This prevents accidental dismissal from tiny scrolls
  if (definitionPopup) {
    const scrollThreshold = 200; // Increased from 50 to 200 pixels
    const currentScrollY = window.scrollY;
    
    // Store the initial scroll position if not already set
    if (!definitionPopup.initialScrollY) {
      definitionPopup.initialScrollY = currentScrollY;
    }
    
    // Close only if scrolled more than threshold
    if (Math.abs(currentScrollY - definitionPopup.initialScrollY) > scrollThreshold) {
      removePopup();
    }
  }
}

// Updated removePopup function to clean up all listeners
function removePopup() {
  if (definitionPopup) {
    definitionPopup.remove();
    definitionPopup = null;
    window.removeEventListener('scroll', handleScroll, true);
  }
}

// escapeHtml function remains the same
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}