// Function to simulate a full user click
function simulateFullClick(el) {
  const events = [
    'pointerover',
    'pointerenter',
    'mouseover',
    'mouseenter',
    'mousemove',
    'pointerdown',
    'mousedown',
    'pointerup',
    'mouseup',
    'click'
  ];

  events.forEach(type => {
    const event = new MouseEvent(type, {
      bubbles: true,
      cancelable: true,
      view: window,
      clientX: 0,
      clientY: 0,
      button: 0
    });
    el.dispatchEvent(event);
  });
}

// Function to handle a new "More actions" button
function onNewButton(newButton) {
  console.log('New "More actions" button detected:', newButton);

  // Click the "More actions" button
  simulateFullClick(newButton);

  // Wait for the menu to appear, then click "Read aloud"
  setTimeout(() => {
    const readAloudButton = document.querySelector('[aria-label="Read aloud"]');
    if (readAloudButton) {
      simulateFullClick(readAloudButton);
      console.log('"Read aloud" button clicked!');
    } else {
      console.log('"Read aloud" button not found yet.');
    }
  }, 200); // Adjust delay if menu is slow
}

// Observe the document for new nodes
const observer = new MutationObserver(mutations => {
  mutations.forEach(mutation => {
    mutation.addedNodes.forEach(node => {
      if (node.nodeType === 1) { // element node
        // Check if the added node is a "More actions" button
        if (node.matches('button[aria-label="More actions"]')) {
          onNewButton(node);
        }

        // Also check if any descendants are "More actions" buttons
        node.querySelectorAll?.('button[aria-label="More actions"]').forEach(btn => {
          onNewButton(btn);
        });
      }
    });
  });
});

// Start observing
observer.observe(document.body, { childList: true, subtree: true });
console.log('Watching for new "More actions" buttons...');
