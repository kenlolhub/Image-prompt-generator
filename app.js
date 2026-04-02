/* ============================================================
   CANVAS Image Prompt Generator — App Logic
   ============================================================ */

'use strict';

/* ── Constants ─────────────────────────────────────────────── */

const HISTORY_KEY   = 'canvas_prompt_history';
const HISTORY_MAX   = 10;
const AESTHETIC_MAX = 3;

/* Animated placeholder tips for each text field */
const TIPS = {
  character: [
    'a young woman reading on a park bench...',
    'an elderly fisherman at dawn...',
    'a golden retriever mid-leap...',
    'a lone astronaut on a red planet...',
  ],
  action: [
    'gazing out the window in thought...',
    'stretching arms wide, eyes closed...',
    'carefully pouring tea from a ceramic pot...',
    'running through tall grass at sunset...',
  ],
  narrative: [
    'a foggy morning market in Kyoto...',
    'a sunlit studio cluttered with paintings...',
    'a dimly lit library after closing time...',
    'a rooftop garden overlooking the city at dusk...',
  ],
  safeguards: [
    'no text, no watermarks, no logos...',
    'avoid blur, avoid distortion of hands...',
    'no harsh shadows, no oversaturation...',
    'avoid crowds, keep background simple...',
  ],
};

/* ── State ─────────────────────────────────────────────────── */

/* viewpoint: single selected chip value (string | null) */
let viewpointSelected = null;

/* aesthetic: ordered array of selected chip values (max AESTHETIC_MAX) */
let aestheticSelected = [];

/* ── DOM Refs ───────────────────────────────────────────────── */

const outputTextarea       = document.getElementById('outputTextarea');
const outputLabel          = document.getElementById('outputLabel');
const copyBtn              = document.getElementById('copyBtn');
const clearBtn             = document.getElementById('clearBtn');
const historyToggle        = document.getElementById('historyToggle');
const historyToggleLabel   = document.getElementById('historyToggleLabel');
const historyList          = document.getElementById('historyList');
const aestheticCounter     = document.getElementById('aestheticCounter');

const inputCharacter       = document.getElementById('input-character');
const inputAction          = document.getElementById('input-action');
const inputNarrative       = document.getElementById('input-narrative');
const inputSafeguards      = document.getElementById('input-safeguards');
const inputViewpointManual = document.getElementById('input-viewpoint-manual');
const inputAestheticManual = document.getElementById('input-aesthetic-manual');

const allTextInputs = [
  inputCharacter,
  inputAction,
  inputNarrative,
  inputSafeguards,
];

/* ── Animated Placeholders ─────────────────────────────────── */

/**
 * Attach a typing-animation to an input's placeholder.
 * Pauses when focused, resumes when blurred (if empty).
 */
function animatePlaceholder(input, tips) {
  let tipIndex  = 0;
  let charIndex = 0;
  let deleting  = false;
  let timerId   = null;
  let paused    = false;

  function tick() {
    if (paused) return;

    const tip = tips[tipIndex];

    if (!deleting) {
      charIndex++;
      input.placeholder = tip.slice(0, charIndex);

      if (charIndex === tip.length) {
        deleting = true;
        timerId = setTimeout(tick, 2200);
        return;
      }
    } else {
      charIndex--;
      input.placeholder = tip.slice(0, charIndex);

      if (charIndex === 0) {
        deleting  = false;
        tipIndex  = (tipIndex + 1) % tips.length;
      }
    }

    timerId = setTimeout(tick, deleting ? 38 : 58);
  }

  function pause() {
    paused = true;
    clearTimeout(timerId);
    input.placeholder = '';
  }

  function resume() {
    if (input.value.trim() !== '') return; // don't resume if field has content
    paused = false;
    tick();
  }

  input.addEventListener('focus', pause);
  input.addEventListener('blur',  resume);

  tick();
}

/* Initialise animations */
animatePlaceholder(inputCharacter,  TIPS.character);
animatePlaceholder(inputAction,     TIPS.action);
animatePlaceholder(inputNarrative,  TIPS.narrative);
animatePlaceholder(inputSafeguards, TIPS.safeguards);

/* ── Prompt Assembly ────────────────────────────────────────── */

function assemblePrompt() {
  const parts = [];

  const character  = inputCharacter.value.trim();
  const action     = inputAction.value.trim();
  const narrative  = inputNarrative.value.trim();

  /* Build the narrative opening */
  const subjectParts = [character, action, narrative].filter(Boolean);
  if (subjectParts.length) {
    parts.push(subjectParts.join(', '));
  }

  /* Viewpoint */
  const viewpointChip   = viewpointSelected || '';
  const viewpointManual = inputViewpointManual.value.trim();
  const viewpointParts  = [viewpointChip, viewpointManual].filter(Boolean);
  if (viewpointParts.length) {
    parts.push(viewpointParts.join(', '));
  }

  /* Aesthetic */
  const aestheticChips  = aestheticSelected.slice();
  const aestheticManual = inputAestheticManual.value.trim();
  const aestheticParts  = [...aestheticChips, aestheticManual].filter(Boolean);
  if (aestheticParts.length) {
    parts.push(aestheticParts.join(', '));
  }

  /* Safeguards */
  const safeguards = inputSafeguards.value.trim();
  if (safeguards) {
    parts.push('Avoid: ' + safeguards);
  }

  return parts.join('. ');
}

function updateOutput() {
  const prompt = assemblePrompt();
  outputTextarea.value = prompt;

  /* Auto-grow: reset then expand to fit content */
  outputTextarea.style.height = 'auto';
  outputTextarea.style.height = outputTextarea.scrollHeight + 'px';

  /* Live character count in label */
  const count = prompt.length;
  outputLabel.textContent = count > 0
    ? `Generated Prompt · ${count} chars`
    : 'Generated Prompt';
}

/* ── Chip Logic ─────────────────────────────────────────────── */

/* Viewpoint — single select */
document.getElementById('chips-viewpoint').addEventListener('click', (e) => {
  const chip = e.target.closest('.chip[data-group="viewpoint"]');
  if (!chip) return;

  const value = chip.dataset.value;

  if (viewpointSelected === value) {
    /* Deselect */
    viewpointSelected = null;
    chip.classList.remove('active');
    chip.setAttribute('aria-pressed', 'false');
  } else {
    /* Deselect any currently active viewpoint chip */
    document.querySelectorAll('.chip[data-group="viewpoint"].active').forEach((c) => {
      c.classList.remove('active');
      c.setAttribute('aria-pressed', 'false');
    });
    viewpointSelected = value;
    chip.classList.add('active');
    chip.setAttribute('aria-pressed', 'true');
  }

  updateOutput();
});

/* Aesthetic — multi-select, max AESTHETIC_MAX */
document.getElementById('chips-aesthetic').addEventListener('click', (e) => {
  const chip = e.target.closest('.chip[data-group="aesthetic"]');
  if (!chip) return;

  const value = chip.dataset.value;
  const idx   = aestheticSelected.indexOf(value);

  if (idx !== -1) {
    /* Deselect */
    aestheticSelected.splice(idx, 1);
    chip.classList.remove('active');
    chip.setAttribute('aria-pressed', 'false');
  } else {
    if (aestheticSelected.length >= AESTHETIC_MAX) {
      /* Evict the oldest (first-selected) */
      const oldestValue = aestheticSelected.shift();
      const oldestChip  = document.querySelector(
        `.chip[data-group="aesthetic"][data-value="${CSS.escape(oldestValue)}"]`
      );
      if (oldestChip) {
        oldestChip.classList.remove('active');
        oldestChip.setAttribute('aria-pressed', 'false');
      }
    }
    aestheticSelected.push(value);
    chip.classList.add('active');
    chip.setAttribute('aria-pressed', 'true');
  }

  updateAestheticCounter();
  updateOutput();
});

function updateAestheticCounter() {
  const n = aestheticSelected.length;
  aestheticCounter.textContent = `${n} / ${AESTHETIC_MAX} selected`;
  aestheticCounter.classList.toggle('active', n > 0);
}

/* ── Live Prompt Update ─────────────────────────────────────── */

/* Update on any text input change */
[inputCharacter, inputAction, inputNarrative, inputSafeguards,
  inputViewpointManual, inputAestheticManual].forEach((el) => {
  el.addEventListener('input', updateOutput);
});

/* ── Copy Button ─────────────────────────────────────────────── */

copyBtn.addEventListener('click', () => {
  const prompt = outputTextarea.value.trim();
  if (!prompt) return;

  navigator.clipboard.writeText(prompt).then(() => {
    copyBtn.textContent = 'Copied ✓';
    copyBtn.classList.add('copied');
    saveToHistory(prompt);
    setTimeout(() => {
      copyBtn.textContent = 'Copy';
      copyBtn.classList.remove('copied');
    }, 1600);
  }).catch(() => {
    /* Fallback for older browsers */
    outputTextarea.select();
    document.execCommand('copy');
    copyBtn.textContent = 'Copied ✓';
    copyBtn.classList.add('copied');
    saveToHistory(prompt);
    setTimeout(() => {
      copyBtn.textContent = 'Copy';
      copyBtn.classList.remove('copied');
    }, 1600);
  });
});

/* ── Clear Button ────────────────────────────────────────────── */

clearBtn.addEventListener('click', () => {
  /* Clear text inputs */
  [inputCharacter, inputAction, inputNarrative, inputSafeguards,
    inputViewpointManual, inputAestheticManual].forEach((el) => {
    el.value = '';
  });

  /* Clear viewpoint chips */
  viewpointSelected = null;
  document.querySelectorAll('.chip[data-group="viewpoint"].active').forEach((c) => {
    c.classList.remove('active');
    c.removeAttribute('aria-pressed');
  });

  /* Clear aesthetic chips */
  aestheticSelected = [];
  document.querySelectorAll('.chip[data-group="aesthetic"].active').forEach((c) => {
    c.classList.remove('active');
    c.removeAttribute('aria-pressed');
  });
  updateAestheticCounter();

  updateOutput();
});

/* ── History ─────────────────────────────────────────────────── */

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  } catch {
    return [];
  }
}

function saveHistory(history) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    /* localStorage unavailable (e.g. private browsing restrictions) */
  }
}

function captureState() {
  return {
    character:       inputCharacter.value.trim(),
    action:          inputAction.value.trim(),
    narrative:       inputNarrative.value.trim(),
    viewpointChip:   viewpointSelected,
    viewpointManual: inputViewpointManual.value.trim(),
    aestheticChips:  aestheticSelected.slice(),
    aestheticManual: inputAestheticManual.value.trim(),
    safeguards:      inputSafeguards.value.trim(),
  };
}

function saveToHistory(prompt) {
  const history = loadHistory();

  history.unshift({
    id:        Date.now(),
    timestamp: Date.now(),
    prompt,
    state:     captureState(),
  });

  while (history.length > HISTORY_MAX) {
    history.pop();
  }

  saveHistory(history);
  renderHistory();
}

function restoreState(state) {
  inputCharacter.value       = state.character       || '';
  inputAction.value          = state.action          || '';
  inputNarrative.value       = state.narrative       || '';
  inputViewpointManual.value = state.viewpointManual || '';
  inputAestheticManual.value = state.aestheticManual || '';
  inputSafeguards.value      = state.safeguards      || '';

  /* Restore viewpoint chip */
  viewpointSelected = null;
  document.querySelectorAll('.chip[data-group="viewpoint"].active').forEach((c) => {
    c.classList.remove('active');
    c.removeAttribute('aria-pressed');
  });
  if (state.viewpointChip) {
    viewpointSelected = state.viewpointChip;
    const chip = document.querySelector(
      `.chip[data-group="viewpoint"][data-value="${CSS.escape(state.viewpointChip)}"]`
    );
    if (chip) {
      chip.classList.add('active');
      chip.setAttribute('aria-pressed', 'true');
    }
  }

  /* Restore aesthetic chips */
  aestheticSelected = [];
  document.querySelectorAll('.chip[data-group="aesthetic"].active').forEach((c) => {
    c.classList.remove('active');
    c.removeAttribute('aria-pressed');
  });
  (state.aestheticChips || []).forEach((val) => {
    aestheticSelected.push(val);
    const chip = document.querySelector(
      `.chip[data-group="aesthetic"][data-value="${CSS.escape(val)}"]`
    );
    if (chip) {
      chip.classList.add('active');
      chip.setAttribute('aria-pressed', 'true');
    }
  });

  updateAestheticCounter();
  updateOutput();

  /* Scroll back to top of form */
  document.getElementById('field-character').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* Relative time helper */
function relativeTime(ts) {
  const diff = Date.now() - ts;
  const minutes = Math.floor(diff / 60000);
  const hours   = Math.floor(diff / 3600000);
  const days    = Math.floor(diff / 86400000);

  if (minutes < 1)  return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours   < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function renderHistory() {
  const history = loadHistory();

  /* Update toggle label */
  const count = history.length;
  historyToggleLabel.textContent = count > 0 ? `History (${count})` : 'History';

  /* Clear list */
  historyList.innerHTML = '';

  if (count === 0) {
    const empty = document.createElement('p');
    empty.className = 'history-empty';
    empty.textContent = 'No prompts saved yet. Copy a prompt to save it here.';
    historyList.appendChild(empty);
    return;
  }

  history.forEach((entry) => {
    const row = document.createElement('div');
    row.className = 'history-entry';

    const meta = document.createElement('span');
    meta.className = 'history-meta';
    meta.textContent = relativeTime(entry.timestamp);

    const text = document.createElement('span');
    text.className = 'history-prompt-text';
    text.textContent = entry.prompt;
    text.title = entry.prompt;

    const actions = document.createElement('div');
    actions.className = 'history-actions';

    const copyHistBtn = document.createElement('button');
    copyHistBtn.className = 'history-action-btn';
    copyHistBtn.textContent = 'Copy';
    copyHistBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(entry.prompt).then(() => {
        copyHistBtn.textContent = '✓';
        setTimeout(() => { copyHistBtn.textContent = 'Copy'; }, 1400);
      }).catch(() => {
        /* Fallback */
        const ta = document.createElement('textarea');
        ta.value = entry.prompt;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        copyHistBtn.textContent = '✓';
        setTimeout(() => { copyHistBtn.textContent = 'Copy'; }, 1400);
      });
    });

    const restoreBtn = document.createElement('button');
    restoreBtn.className = 'history-action-btn';
    restoreBtn.textContent = 'Restore';
    restoreBtn.addEventListener('click', () => {
      if (entry.state) {
        restoreState(entry.state);
      }
    });

    actions.appendChild(copyHistBtn);
    actions.appendChild(restoreBtn);

    row.appendChild(meta);
    row.appendChild(text);
    row.appendChild(actions);

    historyList.appendChild(row);
  });
}

/* History toggle */
historyToggle.addEventListener('click', () => {
  const expanded = historyToggle.getAttribute('aria-expanded') === 'true';
  historyToggle.setAttribute('aria-expanded', String(!expanded));
  historyList.hidden = expanded;

  if (!expanded) {
    renderHistory(); /* Refresh relative timestamps on open */
  }
});

/* ── Initialise ─────────────────────────────────────────────── */

updateOutput();
renderHistory();
