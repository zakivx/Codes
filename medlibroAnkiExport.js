(function () {
  const copiedQuestions = new Set();
  const resultArea = document.createElement("textarea");
  const resultBox = document.createElement("div");
  const counterDisplay = document.createElement("div");
  let questionCount = 0;

  resultArea.readOnly = false; // ✅ Ensure it's always editable

  function createButton(label, onClick, bg = "#2c7be5") {
    const btn = document.createElement("button");
    btn.textContent = label;
    btn.style.margin = "5px";
    btn.style.padding = "10px 15px";
    btn.style.backgroundColor = bg;
    btn.style.color = "#fff";
    btn.style.border = "none";
    btn.style.borderRadius = "5px";
    btn.style.cursor = "pointer";
    btn.addEventListener("click", onClick);
    return btn;
  }

  function formatQuestionObject(obj) {
    let currentKey = null;
    const toString = (val, indent = 0) => {
      const pad = '  '.repeat(indent);
      if (Array.isArray(val)) {
        return '[\n' + val.map(v => toString(v, indent + 1)).join(',\n') + '\n' + pad + ']';
      } else if (typeof val === 'object' && val !== null) {
        return '{\n' + Object.entries(val).map(([k, v]) => {
          const oldKey = currentKey;
          currentKey = k;
          const inner = toString(v, indent + 1);
          currentKey = oldKey;
          return `${'  '.repeat(indent + 1)}${k}: ${inner}`;
        }).join(',\n') + '\n' + pad + '}';
      } else if (typeof val === 'string') {
        return ['question', 'text', 'justification'].includes(currentKey)
          ? `\`${val.replace(/`/g, '\\`')}\`` : `"${val}"`;
      } else {
        return String(val);
      }
    };
    return toString(obj, 0);
  }

  function triggerArrowRight() {
    const event = new KeyboardEvent("keydown", {
      key: "ArrowRight",
      code: "ArrowRight",
      keyCode: 39,
      which: 39,
      bubbles: true,
    });
    document.body.dispatchEvent(event);
  }

  function addQuestionToBox(obj) {
    const formatted = formatQuestionObject(obj);
    if (!copiedQuestions.has(formatted)) {
      copiedQuestions.add(formatted);
      questionCount++;
      counterDisplay.textContent = `Questions: ${questionCount}`;

      // ✅ Preserve scroll and cursor
      const oldScroll = resultArea.scrollTop;
      const oldSelectionStart = resultArea.selectionStart;
      const oldSelectionEnd = resultArea.selectionEnd;

      const divider = resultArea.value ? "\n-------------------------\n" : "";
      resultArea.value = resultArea.value + divider + formatted;

      // ✅ Restore scroll and focus
      resultArea.scrollTop = oldScroll;
      resultArea.selectionStart = oldSelectionStart;
      resultArea.selectionEnd = oldSelectionEnd;
      resultArea.focus();
    }
  }

  function extractChoices() {
    const choiceContainers = document.querySelectorAll("div.flex-grow-1.disabled-item");
    const choices = [];
    choiceContainers.forEach((container, index) => {
      const textEl = container.querySelector("div.text-subtitle-2.text--primary");
      const iconCheck = container.querySelector("i.mdi-progress-check");
      const iconClose = container.querySelector("i.mdi-progress-close");

      const text = textEl?.innerText.trim() || "";
      const correct = iconCheck ? true : iconClose ? false : null;

      choices.push({
        label: String.fromCharCode(65 + index),
        text,
        correct,
        justification: " "
      });
    });
    return choices;
  }

  function extractQuiz() {
    const questionEl = document.querySelector("div.text-subtitle-2.text--primary");
    if (!questionEl) return;

    const questionText = questionEl.innerText.trim();
    const resultObj = {
      question: questionText,
      choices: extractChoices()
    };

    addQuestionToBox(resultObj);
    triggerArrowRight();
  }

  function extractClinic() {
    const outerDiv = document.querySelector("div.container.text-subtitle-2.pa-3.pt-0.container--fluid");
    const yearSpan = outerDiv?.querySelector("span.v-chip__content");
    const innerDivs = outerDiv ? outerDiv.querySelectorAll("div") : [];
    const scenarioText = Array.from(innerDivs)
      .map(div => div.innerText.trim())
      .filter(text => text && !text.includes("Scénario"))[0] || "";

    const calendar = yearSpan?.innerText.replace(/\s+/g, ' ').trim() || "";

    const allDivs = document.querySelectorAll('div.container.text-subtitle-2.pa-0.px-3.text--primary.container--fluid');
    const extraDiv = Array.from(allDivs).find(div =>
      div.children.length === 0 && div.innerText.trim().length > 0
    );

    const extraText = "******"+ extraDiv?.innerText.trim() || "";

    const questionText = `[${calendar}] ${scenarioText} ${extraText}`.replace(/\s+/g, ' ').trim();
    const resultObj = {
      question: questionText,
      choices: extractChoices()
    };

    addQuestionToBox(resultObj);
    triggerArrowRight();
  }

  function extractMemo() {
    (async () => {
      try {
        const validateBtn = document.querySelector(".v-btn.v-btn--block.v-btn--outlined.theme--light.v-size--large.primary--text");
        if (validateBtn) validateBtn.click();

        await new Promise(res => setTimeout(res, 1000));

        const questionEl = document.querySelector("div.text-subtitle-2.text--primary");
        if (!questionEl) return;

        const questionText = questionEl.innerText.trim();
        const resultObj = {
          question: questionText,
          choices: extractChoices()
        };

        addQuestionToBox(resultObj);

        const nextBtn = document.querySelector(".v-btn.v-btn--outlined.theme--light.v-size--large.error--text");
        if (nextBtn) nextBtn.click();
      } catch (e) {
        console.error("Memo extract error:", e);
      }
    })();
  }

  // ✅ CSV export from editable textarea
  function exportCSV() {
    const blocks = resultArea.value
      .split("-------------------------")
      .map(b => b.trim())
      .filter(Boolean);

    const rows = blocks.map(block => `"${block.replace(/"/g, '""')}"`);
    const csvContent = rows.join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "quiz_export.csv";
    link.click();
  }

  function copyReadableFormat() {
    const blocks = resultArea.value.split("-------------------------");
    const parsedBlocks = blocks.map(block => {
      try {
        const fixed = block.trim();
        if (!fixed) return "";
        const obj = eval('(' + fixed + ')');
        const question = obj.question;
        const choices = obj.choices || [];
        const lines = [question];
        for (const c of choices) {
          const mark = c.correct === true ? "✅" : c.correct === false ? "❌" : "❓";
          lines.push(`${mark} : ${c.label}. ${c.text}`);
        }
        return lines.join("\n");
      } catch (e) {
        return "";
      }
    }).filter(Boolean);

    const result = parsedBlocks.join("\n\n--------------------\n\n");
    navigator.clipboard.writeText(result).then(() => {
      console.log("📋 Readable questions copied to clipboard.");
    });
  }

  // === UI ===
  resultBox.style.position = "fixed";
  resultBox.style.bottom = "10px";
  resultBox.style.left = "10px";
  resultBox.style.zIndex = "9999";
  resultBox.style.backgroundColor = "#fff";
  resultBox.style.border = "1px solid #ccc";
  resultBox.style.padding = "10px";
  resultBox.style.borderRadius = "5px";
  resultBox.style.width = "400px";
  resultBox.style.maxHeight = "300px";
  resultBox.style.overflow = "auto";
  resultBox.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";

  resultArea.style.width = "100%";
  resultArea.style.height = "200px";
  resultArea.style.backgroundColor = "#fefefe";
  resultArea.style.border = "1px solid #ccc";
  resultArea.style.borderRadius = "4px";
  resultArea.style.padding = "5px";

  counterDisplay.textContent = `Questions: ${questionCount}`;
  counterDisplay.style.marginBottom = "8px";
  counterDisplay.style.fontWeight = "bold";

  const quizBtn = createButton("Extract Quiz", extractQuiz);
  const clinicBtn = createButton("Extract Clinic", extractClinic, "#28a745");
  const memoBtn = createButton("Extract Memo", extractMemo, "#6f42c1");
  const resetBtn = createButton("Reset", () => {
    copiedQuestions.clear();
    questionCount = 0;
    counterDisplay.textContent = `Questions: ${questionCount}`;
    resultArea.value = "";
  }, "#dc3545");
  const exportBtn = createButton("Export CSV", exportCSV, "#17a2b8");
  const copyBtn = createButton("Copy", copyReadableFormat, "#ffc107");

  resultBox.appendChild(quizBtn);
  resultBox.appendChild(clinicBtn);
  resultBox.appendChild(memoBtn);
  resultBox.appendChild(resetBtn);
  resultBox.appendChild(exportBtn);
  resultBox.appendChild(copyBtn);
  resultBox.appendChild(counterDisplay);
  resultBox.appendChild(resultArea);
  document.body.appendChild(resultBox);
})();
