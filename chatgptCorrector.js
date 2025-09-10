(function() {
  const targetContainer = document.querySelector("div.ms-auto.flex.items-center.gap-1\\.5");
  if (!targetContainer) return console.error("Target container not found");

  // Remove old button if exists
  document.getElementById("auto-correct-btn")?.remove();

  // Create Auto-Correct button with SVG icon and classes
  const btn = document.createElement("button");
  btn.id = "auto-correct-btn";
  btn.className = "composer-submit-btn composer-submit-button-color h-9 w-9";
  btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" class="icon">
    <path d="M14.3352 10.0257C14.3352 7.6143 12.391 5.66554 10.0002 5.66537C7.60929 5.66537 5.66528 7.61419 5.66528 10.0257C5.66531 11.5493 6.44221 12.8881 7.61938 13.6683H12.3811C13.558 12.8881 14.3352 11.5491 14.3352 10.0257ZM8.84399 16.9984C9.07459 17.3983 9.50543 17.6683 10.0002 17.6683C10.495 17.6682 10.926 17.3984 11.1565 16.9984H8.84399ZM8.08813 15.6683H11.9114V14.9984H8.08813V15.6683ZM1.66626 9.33529L1.80103 9.34896C2.10381 9.41116 2.3313 9.67914 2.3313 10.0003C2.33115 10.3214 2.10377 10.5896 1.80103 10.6517L1.66626 10.6654H0.833252C0.466091 10.6654 0.168389 10.3674 0.168213 10.0003C0.168213 9.63306 0.465983 9.33529 0.833252 9.33529H1.66626ZM19.1663 9.33529L19.301 9.34896C19.6038 9.41116 19.8313 9.67914 19.8313 10.0003C19.8311 10.3214 19.6038 10.5896 19.301 10.6517L19.1663 10.6654H18.3333C17.9661 10.6654 17.6684 10.3674 17.6682 10.0003C17.6682 9.63306 17.966 9.33529 18.3333 9.33529H19.1663ZM3.0481 3.04818C3.2753 2.82099 3.62593 2.79189 3.88403 2.96224L3.98853 3.04818L4.57739 3.63705L4.66235 3.74154C4.83285 3.99966 4.80464 4.35021 4.57739 4.57748C4.35013 4.80474 3.99958 4.83293 3.74146 4.66244L3.63696 4.57748L3.0481 3.98861L2.96216 3.88412C2.79181 3.62601 2.82089 3.27538 3.0481 3.04818ZM16.012 3.04818C16.2717 2.7886 16.6927 2.78852 16.9524 3.04818C17.2117 3.30786 17.2119 3.72901 16.9524 3.98861L16.3625 4.57748C16.1028 4.83717 15.6818 4.83718 15.4221 4.57748C15.1626 4.31776 15.1625 3.89669 15.4221 3.63705L16.012 3.04818ZM9.33521 1.66634V0.833336C9.33521 0.466067 9.63297 0.168297 10.0002 0.168297C10.3674 0.168472 10.6653 0.466175 10.6653 0.833336V1.66634C10.6653 2.0335 10.3674 2.33121 10.0002 2.33138C9.63297 2.33138 9.33521 2.03361 9.33521 1.66634ZM15.6653 10.0257C15.6653 11.9571 14.7058 13.6634 13.2415 14.6917V16.3333C13.2415 16.7004 12.9444 16.9971 12.5774 16.9974C12.282 18.1473 11.2423 18.9982 10.0002 18.9984C8.75792 18.9984 7.71646 18.1476 7.42114 16.9974C7.05476 16.9964 6.75806 16.7 6.75806 16.3333V14.6917C5.29383 13.6634 4.33523 11.957 4.33521 10.0257C4.33521 6.88608 6.86835 4.33529 10.0002 4.33529C13.132 4.33547 15.6653 6.88618 15.6653 10.0257Z"></path>
  </svg>`;

  targetContainer.appendChild(btn);

  const correctionBlock = `Reply to me then Correct the grammar and spelling errors in my input like that
Your input with mistakes highlighted
is normal that a 11 yrs girl to have 20 respiratory rate
Mistakes:
"is" → should be "Is" (capital letter at start).
"normal that" → should be "normal for".
"a 11 yrs girl" → should be "an 11-year-old girl".
"20 respiratory rate" → should be "a respiratory rate of 20".
Best way to say it
👉 "Is it normal for an 11-year-old girl to have a respiratory rate of 20?"`;

  function insertText(el, text) {
    if (!el) return false;
    if (el.isContentEditable) {
      el.focus();
      document.execCommand("insertText", false, "\n\n" + text);
      el.dispatchEvent(new InputEvent("input", { bubbles: true }));
      return true;
    }
    if ("value" in el) {
      el.value += "\n\n" + text;
      el.dispatchEvent(new Event("input", { bubbles: true }));
      return true;
    }
    return false;
  }

  btn.addEventListener("click", () => {
    const prompt = document.getElementById("prompt-textarea") 
                || document.querySelector('[contenteditable="true"]')
                || document.querySelector("textarea");

    if (!prompt) return console.error("Prompt area not found");

    if (insertText(prompt, correctionBlock)) {
      const submitBtn = document.getElementById("composer-submit-button");
      if (submitBtn) {
        submitBtn.disabled = true; // prevent double clicks
        submitBtn.click();
      }
    }
  });
})();
