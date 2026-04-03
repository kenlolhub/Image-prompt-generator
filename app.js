/* ============================================================
   CANVAS Image Prompt Generator — App Logic
   ============================================================ */

'use strict';

/* ── Constants ─────────────────────────────────────────────── */

const HISTORY_KEY   = 'canvas_prompt_history';
const LANG_KEY      = 'canvas_lang';
const HISTORY_MAX   = 10;
const AESTHETIC_MAX = 3;

/* ── Translations ───────────────────────────────────────────── */

const TRANSLATIONS = {
  en: {
    siteSubtitle:       'Image Prompt Generator',
    outputLabel:        'Generated Prompt',
    outputLabelCount:   (n) => `Generated Prompt · ${n} chars`,
    outputPlaceholder:  'Your prompt will appear here as you fill in the fields below...',
    copy:               'Copy',
    copied:             'Copied ✓',
    clear:              'Clear',
    fieldCharacter:     'Character',
    hintCharacter:      'Who or what is the main subject?',
    fieldAction:        'Action',
    hintAction:         'What is the subject doing?',
    fieldNarrative:     'Narrative Context',
    hintNarrative:      'Where is it, and what is the surrounding environment?',
    fieldViewpoint:     'Viewpoint',
    hintViewpoint:      'Camera angle, shot type, framing, distance, focus.',
    fieldAesthetic:     'Aesthetic',
    hintAesthetic:      'Visual style, medium, mood, lighting, texture, era. Pick up to 3.',
    fieldSafeguards:    'Safeguards',
    hintSafeguards:     'What should be avoided, reduced, or kept under control?',
    catStyle:           'Style & Medium',
    catMood:            'Mood & Tone',
    catLighting:        'Lighting',
    catEra:             'Era & Finish',
    manualViewpoint:    'Add your own framing...',
    manualAesthetic:    'Describe your own style...',
    aestheticCounter:   (n) => `${n} / 3 selected`,
    history:            'History',
    historyCount:       (n) => `History (${n})`,
    historyEmpty:       'No prompts saved yet. Copy a prompt to save it here.',
    historyCopy:        'Copy',
    historyRestore:     'Restore',
    timeNow:            'just now',
    timeMin:            (n) => `${n}m ago`,
    timeHour:           (n) => `${n}h ago`,
    timeDay:            (n) => `${n}d ago`,
    footer:             'CANVAS framework · prompts for Gemini and other image generators',
    /* Viewpoint chip labels */
    chip_closeup:         'Close-up',
    chip_extremecloseup:  'Extreme close-up',
    chip_mediumshot:      'Medium shot',
    chip_fullbody:        'Full body',
    chip_wideshot:        'Wide shot',
    chip_aerial:          "Aerial / bird's-eye",
    chip_lowangle:        'Low angle',
    chip_highangle:       'High angle',
    chip_overtheshoulder: 'Over-the-shoulder',
    chip_pov:             'POV',
    chip_dutchangle:      'Dutch angle',
    chip_portrait:        'Portrait / centered',
    chip_ruleofthirds:    'Rule of thirds',
    chip_silhouette:      'Silhouette',
    /* Aesthetic chip labels */
    chip_cinematic:       'Cinematic',
    chip_watercolor:      'Watercolor',
    chip_oilpainting:     'Oil painting',
    chip_inksketch:       'Ink sketch',
    chip_digitalart:      'Digital art',
    chip_filmphotography: 'Film photography',
    chip_melancholic:     'Melancholic',
    chip_dreamy:          'Dreamy',
    chip_boldgraphic:     'Bold & graphic',
    chip_serene:          'Serene',
    chip_gritty:          'Gritty',
    chip_goldenhour:      'Golden hour',
    chip_studiolit:       'Studio lit',
    chip_softdiffused:    'Soft diffused',
    chip_highcontrast:    'High contrast',
    chip_vintage:         'Vintage / retro',
    chip_minimalist:      'Minimalist',
    chip_hyperrealistic:  'Hyperrealistic',
  },
  zh: {
    siteSubtitle:       '圖像提示詞生成器',
    outputLabel:        '生成的提示詞',
    outputLabelCount:   (n) => `生成的提示詞 · ${n} 字元`,
    outputPlaceholder:  '填寫下方欄位後，提示詞將自動顯示於此...',
    copy:               '複製',
    copied:             '已複製 ✓',
    clear:              '清除',
    fieldCharacter:     'Character（主體）',
    hintCharacter:      '圖像的主角是誰？或是什麼？',
    fieldAction:        'Action（動作）',
    hintAction:         '主體正在做什麼？',
    fieldNarrative:     'Narrative Context（情境）',
    hintNarrative:      '場景在哪裡？周圍的環境是什麼？',
    fieldViewpoint:     'Viewpoint（視角）',
    hintViewpoint:      '拍攝角度、鏡頭類型、構圖方式、距離與焦點。',
    fieldAesthetic:     'Aesthetic（美學）',
    hintAesthetic:      '視覺風格、媒材、情緒、光線、質感、年代。最多選 3 項。',
    fieldSafeguards:    'Safeguards（限制）',
    hintSafeguards:     '需要避免、減少或控制的元素是什麼？',
    catStyle:           '風格與媒材',
    catMood:            '情緒與氛圍',
    catLighting:        '光線',
    catEra:             '年代與質感',
    manualViewpoint:    '輸入自訂構圖...',
    manualAesthetic:    '描述你的風格...',
    aestheticCounter:   (n) => `已選 ${n} / 3`,
    history:            '歷史記錄',
    historyCount:       (n) => `歷史記錄（${n}）`,
    historyEmpty:       '尚無已儲存的提示詞。複製提示詞後將自動儲存於此。',
    historyCopy:        '複製',
    historyRestore:     '還原',
    timeNow:            '剛剛',
    timeMin:            (n) => `${n} 分鐘前`,
    timeHour:           (n) => `${n} 小時前`,
    timeDay:            (n) => `${n} 天前`,
    footer:             'CANVAS 框架 · 適用於 Gemini 及其他圖像生成工具',
    /* Viewpoint chip labels */
    chip_closeup:         '特寫',
    chip_extremecloseup:  '極度特寫',
    chip_mediumshot:      '中景',
    chip_fullbody:        '全身',
    chip_wideshot:        '廣角',
    chip_aerial:          '鳥瞰視角',
    chip_lowangle:        '仰角',
    chip_highangle:       '俯角',
    chip_overtheshoulder: '過肩視角',
    chip_pov:             '第一人稱視角',
    chip_dutchangle:      '荷蘭角',
    chip_portrait:        '肖像 / 置中',
    chip_ruleofthirds:    '三分法',
    chip_silhouette:      '剪影',
    /* Aesthetic chip labels */
    chip_cinematic:       '電影感',
    chip_watercolor:      '水彩',
    chip_oilpainting:     '油畫',
    chip_inksketch:       '水墨素描',
    chip_digitalart:      '數位藝術',
    chip_filmphotography: '底片攝影',
    chip_melancholic:     '憂鬱',
    chip_dreamy:          '夢幻',
    chip_boldgraphic:     '粗獷平面',
    chip_serene:          '靜謐',
    chip_gritty:          '粗礪',
    chip_goldenhour:      '黃金時刻',
    chip_studiolit:       '棚拍燈光',
    chip_softdiffused:    '柔和散射',
    chip_highcontrast:    '高對比',
    chip_vintage:         '復古',
    chip_minimalist:      '極簡',
    chip_hyperrealistic:  '超寫實',
  },
};

/* ── Animated Placeholder Tips ──────────────────────────────── */

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

const TIPS_ZH = {
  character: [
    '坐在公園長椅上看書的年輕女性...',
    '黎明時分的老漁夫...',
    '躍起瞬間的黃金獵犬...',
    '紅色星球上孤獨的太空人...',
  ],
  action: [
    '凝視窗外，若有所思...',
    '張開雙臂，閉上眼睛...',
    '小心翼翼地從陶壺中倒茶...',
    '在夕陽下奔跑穿越高草原野...',
  ],
  narrative: [
    '晨霧籠罩的京都早市...',
    '掛滿畫作的採光明亮工作室...',
    '閉館後昏暗的圖書館...',
    '俯瞰城市的屋頂花園，黃昏時分...',
  ],
  safeguards: [
    '無文字、無浮水印、無商標...',
    '避免模糊，避免手部變形...',
    '無強烈陰影，無過度飽和色彩...',
    '避免人群，保持背景簡潔...',
  ],
};

/* ── State ─────────────────────────────────────────────────── */

let currentLang       = 'en';
let viewpointSelected = null;
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

/* ── Language Detection & Switching ────────────────────────── */

function detectLanguage() {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === 'zh' || saved === 'en') return saved;
  } catch { /* localStorage blocked */ }
  const browser = (navigator.language || 'en').toLowerCase();
  return browser.startsWith('zh') ? 'zh' : 'en';
}

function setLanguage(lang) {
  currentLang = lang;
  try { localStorage.setItem(LANG_KEY, lang); } catch { /* ignore */ }

  const t = TRANSLATIONS[lang];

  /* Update static text via data-i18n */
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n;
    if (typeof t[key] === 'string') el.textContent = t[key];
  });

  /* Update placeholder text via data-i18n-placeholder */
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    /* Use camelCase key derived from hyphenated attribute */
    const attr = el.getAttribute('data-i18n-placeholder');
    if (typeof t[attr] === 'string') el.placeholder = t[attr];
  });

  /* Update <html lang> attribute for accessibility */
  document.documentElement.lang = lang === 'zh' ? 'zh-TW' : 'en';

  /* Update toggle active state */
  document.querySelectorAll('.lang-opt').forEach((opt) => {
    opt.classList.toggle('active', opt.dataset.lang === lang);
  });

  /* Restart placeholder animations with correct language tips */
  restartAnimations(lang === 'zh' ? TIPS_ZH : TIPS);

  /* Refresh all dynamic text */
  updateOutput();
  updateAestheticCounter();
  renderHistory();
}

/* Lang toggle click handler */
document.getElementById('langToggle').addEventListener('click', (e) => {
  const opt = e.target.closest('.lang-opt');
  if (opt && opt.dataset.lang !== currentLang) {
    setLanguage(opt.dataset.lang);
  }
});

/* ── Animated Placeholders ─────────────────────────────────── */

/* Map of field key → { stop } controller */
const animationControllers = {};

function animatePlaceholder(input, tips, key) {
  /* Cancel any existing animation for this field */
  if (animationControllers[key]) {
    animationControllers[key].stop();
  }

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
    if (input.value.trim() !== '') return;
    paused = false;
    tick();
  }

  function stop() {
    paused = true;
    clearTimeout(timerId);
    input.removeEventListener('focus', pause);
    input.removeEventListener('blur',  resume);
  }

  input.addEventListener('focus', pause);
  input.addEventListener('blur',  resume);

  animationControllers[key] = { stop };
  tick();
}

function restartAnimations(tips) {
  animatePlaceholder(inputCharacter,  tips.character,  'character');
  animatePlaceholder(inputAction,     tips.action,     'action');
  animatePlaceholder(inputNarrative,  tips.narrative,  'narrative');
  animatePlaceholder(inputSafeguards, tips.safeguards, 'safeguards');
}

/* ── Prompt Assembly ────────────────────────────────────────── */

function assemblePrompt() {
  const parts = [];

  const character  = inputCharacter.value.trim();
  const action     = inputAction.value.trim();
  const narrative  = inputNarrative.value.trim();

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

  /* Safeguards — always English prefix since output goes to image models */
  const safeguards = inputSafeguards.value.trim();
  if (safeguards) {
    parts.push('Avoid: ' + safeguards);
  }

  return parts.join('. ');
}

function updateOutput() {
  const prompt = assemblePrompt();
  outputTextarea.value = prompt;

  /* Auto-grow textarea */
  outputTextarea.style.height = 'auto';
  outputTextarea.style.height = outputTextarea.scrollHeight + 'px';

  /* Live character count */
  const t = TRANSLATIONS[currentLang];
  const count = prompt.length;
  outputLabel.textContent = count > 0
    ? t.outputLabelCount(count)
    : t.outputLabel;
}

/* ── Chip Logic ─────────────────────────────────────────────── */

/* Viewpoint — single select */
document.getElementById('chips-viewpoint').addEventListener('click', (e) => {
  const chip = e.target.closest('.chip[data-group="viewpoint"]');
  if (!chip) return;

  const value = chip.dataset.value;

  if (viewpointSelected === value) {
    viewpointSelected = null;
    chip.classList.remove('active');
    chip.setAttribute('aria-pressed', 'false');
  } else {
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
    aestheticSelected.splice(idx, 1);
    chip.classList.remove('active');
    chip.setAttribute('aria-pressed', 'false');
  } else {
    if (aestheticSelected.length >= AESTHETIC_MAX) {
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
  aestheticCounter.textContent = TRANSLATIONS[currentLang].aestheticCounter(n);
  aestheticCounter.classList.toggle('active', n > 0);
}

/* ── Live Prompt Update ─────────────────────────────────────── */

[inputCharacter, inputAction, inputNarrative, inputSafeguards,
  inputViewpointManual, inputAestheticManual].forEach((el) => {
  el.addEventListener('input', updateOutput);
});

/* ── Copy Button ─────────────────────────────────────────────── */

copyBtn.addEventListener('click', () => {
  const prompt = outputTextarea.value.trim();
  if (!prompt) return;

  const t = TRANSLATIONS[currentLang];

  navigator.clipboard.writeText(prompt).then(() => {
    copyBtn.textContent = t.copied;
    copyBtn.classList.add('copied');
    saveToHistory(prompt);
    setTimeout(() => {
      copyBtn.textContent = t.copy;
      copyBtn.classList.remove('copied');
    }, 1600);
  }).catch(() => {
    outputTextarea.select();
    document.execCommand('copy');
    copyBtn.textContent = t.copied;
    copyBtn.classList.add('copied');
    saveToHistory(prompt);
    setTimeout(() => {
      copyBtn.textContent = t.copy;
      copyBtn.classList.remove('copied');
    }, 1600);
  });
});

/* ── Clear Button ────────────────────────────────────────────── */

clearBtn.addEventListener('click', () => {
  [inputCharacter, inputAction, inputNarrative, inputSafeguards,
    inputViewpointManual, inputAestheticManual].forEach((el) => {
    el.value = '';
  });

  viewpointSelected = null;
  document.querySelectorAll('.chip[data-group="viewpoint"].active').forEach((c) => {
    c.classList.remove('active');
    c.removeAttribute('aria-pressed');
  });

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
  } catch { /* ignore */ }
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
  document.getElementById('field-character').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function relativeTime(ts) {
  const t    = TRANSLATIONS[currentLang];
  const diff = Date.now() - ts;
  const min  = Math.floor(diff / 60000);
  const hr   = Math.floor(diff / 3600000);
  const day  = Math.floor(diff / 86400000);

  if (min  < 1)  return t.timeNow;
  if (min  < 60) return t.timeMin(min);
  if (hr   < 24) return t.timeHour(hr);
  return t.timeDay(day);
}

function renderHistory() {
  const history = loadHistory();
  const t       = TRANSLATIONS[currentLang];
  const count   = history.length;

  /* Update toggle label */
  historyToggleLabel.textContent = count > 0 ? t.historyCount(count) : t.history;

  /* Render list */
  historyList.innerHTML = '';

  if (count === 0) {
    const empty = document.createElement('p');
    empty.className   = 'history-empty';
    empty.textContent = t.historyEmpty;
    historyList.appendChild(empty);
    return;
  }

  history.forEach((entry) => {
    const row = document.createElement('div');
    row.className = 'history-entry';

    const top = document.createElement('div');
    top.className = 'history-entry-top';

    const meta = document.createElement('span');
    meta.className   = 'history-meta';
    meta.textContent = relativeTime(entry.timestamp);

    const actions = document.createElement('div');
    actions.className = 'history-actions';

    const copyHistBtn = document.createElement('button');
    copyHistBtn.className   = 'history-action-btn';
    copyHistBtn.textContent = t.historyCopy;
    copyHistBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(entry.prompt).then(() => {
        copyHistBtn.textContent = '✓';
        setTimeout(() => { copyHistBtn.textContent = t.historyCopy; }, 1400);
      }).catch(() => {
        const ta = document.createElement('textarea');
        ta.value = entry.prompt;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        copyHistBtn.textContent = '✓';
        setTimeout(() => { copyHistBtn.textContent = t.historyCopy; }, 1400);
      });
    });

    const restoreBtn = document.createElement('button');
    restoreBtn.className   = 'history-action-btn';
    restoreBtn.textContent = t.historyRestore;
    restoreBtn.addEventListener('click', () => {
      if (entry.state) restoreState(entry.state);
    });

    actions.appendChild(copyHistBtn);
    actions.appendChild(restoreBtn);

    top.appendChild(meta);
    top.appendChild(actions);

    const text = document.createElement('span');
    text.className   = 'history-prompt-text';
    text.textContent = entry.prompt;
    text.title       = entry.prompt;

    row.appendChild(top);
    row.appendChild(text);
    historyList.appendChild(row);
  });
}

/* History toggle */
historyToggle.addEventListener('click', () => {
  const expanded = historyToggle.getAttribute('aria-expanded') === 'true';
  historyToggle.setAttribute('aria-expanded', String(!expanded));
  historyList.hidden = expanded;
  if (!expanded) renderHistory();
});

/* ── Initialise ─────────────────────────────────────────────── */

setLanguage(detectLanguage());
