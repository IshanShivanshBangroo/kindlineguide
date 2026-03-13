const state = {
  sessionId: crypto.randomUUID(),
  config: null,
  supportModes: [],
  selectedModeId: 'guided_reflection',
  messages: [],
  turnLogs: [],
  speakReplies: false,
  listening: false,
  recognition: null,
  recognitionSupported: false,
  preferences: {
    replyLanguage: 'auto',
    replyTone: 'balanced',
    meaningStyle: 'auto',
    contextNote: ''
  }
};

const els = {
  appTitle: document.getElementById('app-title'),
  appSubtitle: document.getElementById('app-subtitle'),
  contractNote: document.getElementById('contract-note'),
  supportModeCards: document.getElementById('support-mode-cards'),
  selectedModeSummary: document.getElementById('selected-mode-summary'),
  contractSummary: document.getElementById('contract-summary'),
  clearButton: document.getElementById('clear-button'),
  exportButton: document.getElementById('export-button'),
  statusBox: document.getElementById('status-box'),
  sessionPill: document.getElementById('session-pill'),
  chatLog: document.getElementById('chat-log'),
  composer: document.getElementById('composer'),
  replyLanguageSelect: document.getElementById('reply-language-select'),
  replyToneSelect: document.getElementById('reply-tone-select'),
  meaningStyleSelect: document.getElementById('meaning-style-select'),
  contextNote: document.getElementById('context-note'),
  messageInput: document.getElementById('message-input'),
  sendButton: document.getElementById('send-button'),
  speakToggle: document.getElementById('speak-toggle'),
  micButton: document.getElementById('mic-button')
};

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function setStatus(message) {
  els.statusBox.textContent = message;
}

function getSelectedMode() {
  return state.supportModes.find((item) => item.id === state.selectedModeId) || state.supportModes[0] || null;
}

function updateSessionPill() {
  const count = state.messages.filter((item) => item.role === 'assistant').length;
  els.sessionPill.textContent = count ? `${count} turn${count === 1 ? '' : 's'}` : 'New session';
}

function readPreferencesFromForm() {
  state.preferences = {
    replyLanguage: els.replyLanguageSelect.value || 'auto',
    replyTone: els.replyToneSelect.value || 'balanced',
    meaningStyle: els.meaningStyleSelect.value || 'auto',
    contextNote: els.contextNote.value.trim()
  };
  return state.preferences;
}

function getLanguageLabel(languageId) {
  const options = state.config?.supportContract?.languageOptions || [];
  return options.find((item) => item.id === languageId)?.label || languageId;
}

function getToneLabel(toneId) {
  const options = state.config?.supportContract?.toneOptions || [];
  return options.find((item) => item.id === toneId)?.label || toneId;
}

function getMeaningStyleLabel(meaningId) {
  const options = state.config?.supportContract?.meaningStyleOptions || [];
  return options.find((item) => item.id === meaningId)?.label || meaningId;
}

function renderSupportModes() {
  els.supportModeCards.innerHTML = state.supportModes
    .map((item) => `
      <button
        type="button"
        class="mode-card ${item.id === state.selectedModeId ? 'active' : ''}"
        data-mode-id="${escapeHtml(item.id)}"
        aria-pressed="${item.id === state.selectedModeId ? 'true' : 'false'}"
      >
        <span class="mode-title">${escapeHtml(item.label)}</span>
        <span class="mode-description">${escapeHtml(item.description)}</span>
        <span class="mode-note">${escapeHtml(item.selectionNote)}</span>
      </button>
    `)
    .join('');

  els.supportModeCards.querySelectorAll('[data-mode-id]').forEach((button) => {
    button.addEventListener('click', () => {
      state.selectedModeId = button.getAttribute('data-mode-id');
      renderSupportModes();
      renderSelectedModeSummary();
      setStatus(`Support style set to ${getSelectedMode()?.label || 'Start broad'}.`);
    });
  });
}

function renderSelectedModeSummary() {
  const mode = getSelectedMode();
  if (!mode) {
    els.selectedModeSummary.innerHTML = '';
    return;
  }

  els.selectedModeSummary.innerHTML = `
    <p class="mode-summary-title">Current support style</p>
    <p class="mode-summary-copy"><strong>${escapeHtml(mode.label)}.</strong> ${escapeHtml(mode.description)}</p>
    <p class="mode-summary-copy">${escapeHtml(mode.selectionNote)}</p>
  `;
}

function renderContractSummary() {
  if (!els.contractSummary) return;
  const prefs = readPreferencesFromForm();
  els.contractSummary.innerHTML = `
    <p class="mode-summary-title">Current support contract</p>
    <p class="mode-summary-copy"><strong>${escapeHtml(getLanguageLabel(prefs.replyLanguage))}</strong> • ${escapeHtml(getToneLabel(prefs.replyTone))} • ${escapeHtml(getMeaningStyleLabel(prefs.meaningStyle))}</p>
    <p class="mode-summary-copy">${prefs.contextNote ? escapeHtml(prefs.contextNote) : 'No extra context note yet.'}</p>
  `;
}

function renderMessages() {
  if (!state.messages.length) {
    els.chatLog.innerHTML = `
      <article class="message assistant starter-message">
        <div class="message-header">
          <span class="message-role">KindLine Guide</span>
          <span class="message-meta">Start here</span>
        </div>
        <p>You can write one short paragraph about what happened and what feels hardest. If you are unsure which support style to pick, leave the default and start broad.</p>
      </article>
    `;
    return;
  }

  els.chatLog.innerHTML = state.messages
    .map((item) => {
      const note = item.role === 'assistant' && item.meta
        ? `<p class="message-note"><strong>${escapeHtml(item.meta.modeLabel || 'Support style')}.</strong> ${escapeHtml(item.meta.safetyLabel || '')}${item.meta.safetyExplanation ? ` ${escapeHtml(item.meta.safetyExplanation)}` : ''}${item.meta.contractSummary ? ` Applied contract: ${escapeHtml(item.meta.contractSummary)}.` : ''}</p>`
        : '';
      const meta = item.role === 'assistant'
        ? (item.meta?.modeLabel || 'Reply')
        : new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      return `
        <article class="message ${item.role}">
          <div class="message-header">
            <span class="message-role">${item.role === 'assistant' ? 'KindLine Guide' : 'You'}</span>
            <span class="message-meta">${escapeHtml(meta)}</span>
          </div>
          <p dir="${item.meta?.direction || 'ltr'}">${escapeHtml(item.content)}</p>
          ${note}
        </article>
      `;
    })
    .join('');

  els.chatLog.scrollTop = els.chatLog.scrollHeight;
}

function appendSystemMessage(content, meta = {}) {
  state.messages.push({
    role: 'assistant',
    content,
    timestamp: new Date().toISOString(),
    meta: {
      modeLabel: meta.modeLabel || getSelectedMode()?.label || 'Support style',
      safetyLabel: meta.safetyLabel || 'System note',
      safetyExplanation: meta.safetyExplanation || '',
      direction: meta.direction || 'ltr'
    }
  });
  renderMessages();
  updateSessionPill();
}

function clearSession() {
  state.sessionId = crypto.randomUUID();
  state.messages = [];
  state.turnLogs = [];
  els.messageInput.value = '';
  updateSessionPill();
  renderMessages();
  setStatus('Started a new session.');
}

function buildParticipantExport() {
  const prefs = readPreferencesFromForm();
  return {
    exportedAt: new Date().toISOString(),
    sessionId: state.sessionId,
    selectedModeId: state.selectedModeId,
    supportContract: prefs,
    voiceReplyEnabled: Boolean(state.speakReplies),
    turns: state.turnLogs.map((item) => ({
      timestamp: item.timestamp,
      userText: item.userText,
      assistantFinal: item.assistantFinal,
      supportModeId: item.supportModeId,
      supportModeLabel: item.supportModeUserLabel,
      gateTriggered: item.gateTriggered,
      gateReason: item.gateReason,
      purpose: item.purpose || null,
      preferences: item.preferences || null,
      safetySummary: item.safetySummary,
      latencyMs: item.latencyMs,
      responseStats: item.responseStats || null
    }))
  };
}

function downloadJson(filename, payload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function inferLocaleFromContract() {
  const prefs = readPreferencesFromForm();
  const options = state.config?.supportContract?.languageOptions || [];
  if (prefs.replyLanguage !== 'auto' && prefs.replyLanguage !== 'match_message') {
    return options.find((item) => item.id === prefs.replyLanguage)?.locale || navigator.language || 'en-US';
  }
  const note = String(prefs.contextNote || '').toLowerCase();
  const order = [
    ['hinglish', 'hi-IN'], ['hindi', 'hi-IN'], ['spanish', 'es-ES'], ['french', 'fr-FR'], ['german', 'de-DE'],
    ['arabic', 'ar'], ['bengali', 'bn-BD'], ['portuguese', 'pt-BR'], ['russian', 'ru-RU'], ['chinese', 'zh-CN'],
    ['japanese', 'ja-JP'], ['korean', 'ko-KR'], ['turkish', 'tr-TR'], ['italian', 'it-IT'], ['tamil', 'ta-IN'], ['urdu', 'ur-PK']
  ];
  for (const [hint, locale] of order) {
    if (note.includes(hint)) return locale;
  }
  return navigator.language || 'en-US';
}

function currentLocale() {
  return inferLocaleFromContract();
}

function chooseVoice(lang) {
  if (!('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  const exact = voices.find((voice) => voice.lang?.toLowerCase() === String(lang).toLowerCase());
  if (exact) return exact;
  const prefix = String(lang).split('-')[0].toLowerCase();
  return voices.find((voice) => voice.lang?.toLowerCase().startsWith(prefix)) || voices[0] || null;
}

function maybeSpeakReply(text, localeHint) {
  if (!state.speakReplies || !('speechSynthesis' in window) || !text) return;
  const lang = localeHint || currentLocale();
  const utterance = new SpeechSynthesisUtterance(text);
  const voice = chooseVoice(lang);
  if (voice) utterance.voice = voice;
  utterance.lang = voice?.lang || lang;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

function setMicButton() {
  if (!state.recognitionSupported) {
    els.micButton.disabled = true;
    els.micButton.textContent = 'Voice unavailable';
    return;
  }
  els.micButton.disabled = false;
  els.micButton.textContent = state.listening ? 'Stop voice' : 'Use voice';
}

function initRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    state.recognitionSupported = false;
    setMicButton();
    return;
  }

  state.recognitionSupported = true;
  state.recognition = new SpeechRecognition();
  state.recognition.interimResults = true;
  state.recognition.continuous = false;

  let interim = '';
  state.recognition.onstart = () => {
    state.listening = true;
    state.recognition.lang = currentLocale();
    setMicButton();
    setStatus('Listening...');
  };

  state.recognition.onresult = (event) => {
    let finalText = '';
    interim = '';
    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      const result = event.results[i];
      const transcript = result[0]?.transcript || '';
      if (result.isFinal) finalText += transcript;
      else interim += transcript;
    }
    const merged = `${els.messageInput.value.trim()} ${finalText || interim}`.trim();
    els.messageInput.value = merged;
  };

  state.recognition.onerror = (event) => {
    state.listening = false;
    setMicButton();
    setStatus(`Voice input error: ${event.error || 'unknown error'}. Typed input still works.`);
  };

  state.recognition.onend = () => {
    state.listening = false;
    setMicButton();
    setStatus('Voice input finished. You can edit the text before sending.');
  };

  setMicButton();
}

function populateContractOptions() {
  const languageOptions = state.config?.supportContract?.languageOptions || [];
  const toneOptions = state.config?.supportContract?.toneOptions || [];
  const meaningStyleOptions = state.config?.supportContract?.meaningStyleOptions || [];
  els.replyLanguageSelect.innerHTML = languageOptions
    .map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.label)}</option>`)
    .join('');
  els.replyToneSelect.innerHTML = toneOptions
    .map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.label)}</option>`)
    .join('');
  els.meaningStyleSelect.innerHTML = meaningStyleOptions
    .map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.label)}</option>`)
    .join('');

  els.replyLanguageSelect.value = state.preferences.replyLanguage;
  els.replyToneSelect.value = state.preferences.replyTone;
  els.meaningStyleSelect.value = state.preferences.meaningStyle;
  els.contextNote.placeholder = state.config?.supportContract?.contextPlaceholder || els.contextNote.placeholder;
  if (state.config?.supportContract?.note) els.contractNote.textContent = state.config.supportContract.note;
  renderContractSummary();
}

async function sendMessage(text) {
  const trimmed = text.trim();
  if (!trimmed) return;

  const prefs = readPreferencesFromForm();
  const now = new Date().toISOString();
  state.messages.push({ role: 'user', content: trimmed, timestamp: now, meta: { direction: 'ltr' } });
  renderMessages();
  updateSessionPill();
  els.messageInput.value = '';
  setStatus('Generating a bounded reply...');
  els.sendButton.disabled = true;

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: state.sessionId,
        uiMode: 'participant',
        interventionId: state.selectedModeId,
        preferences: prefs,
        messages: state.messages.map((item) => ({ role: item.role, content: item.content }))
      })
    });

    const result = await response.json();
    if (!response.ok || result?.ok === false) {
      throw new Error(result?.error || 'The request failed.');
    }

    const assistantMessage = {
      role: 'assistant',
      content: result.reply,
      timestamp: new Date().toISOString(),
      meta: {
        modeLabel: result.supportMode?.userLabel || getSelectedMode()?.label || 'Support style',
        safetyLabel: result.safetySummary?.label || 'Within scope',
        safetyExplanation: result.safetySummary?.explanation || '',
        contractSummary: result.preferences?.contractSummary || '',
        direction: result.preferences?.effectiveLanguage === 'ar' || result.preferences?.effectiveLanguage === 'ur' ? 'rtl' : 'ltr'
      }
    };

    state.messages.push(assistantMessage);
    if (result.logEntry) state.turnLogs.push(result.logEntry);
    renderMessages();
    updateSessionPill();
    maybeSpeakReply(result.reply, result.preferences?.effectiveLanguage ? (state.config?.supportContract?.languageOptions || []).find((item) => item.id === result.preferences.effectiveLanguage)?.locale : null);
    setStatus(result.gate?.triggered ? `The tool narrowed the reply to stay within scope. ${result.preferences?.contractSummary ? `(${result.preferences.contractSummary})` : ''}` : `Reply ready${result.preferences?.contractSummary ? ` (${result.preferences.contractSummary})` : ''}.`);
  } catch (error) {
    console.error(error);
    appendSystemMessage(
      'The reply could not be generated normally, so the session stayed unchanged. Please try again in a moment or rephrase the message in one short paragraph.',
      {
        safetyLabel: 'System note',
        safetyExplanation: 'A server or parsing error interrupted this turn.'
      }
    );
    setStatus(error.message || 'Something went wrong while generating a reply.');
  } finally {
    els.sendButton.disabled = false;
  }
}

async function init() {
  renderMessages();
  updateSessionPill();
  initRecognition();

  try {
    const response = await fetch('/api/config');
    const config = await response.json();
    state.config = config;
    state.supportModes = Array.isArray(config?.supportModes) ? config.supportModes : [];
    state.selectedModeId = config?.defaults?.participantIntervention || state.supportModes.find((item) => item.recommendedDefault)?.id || state.selectedModeId;
    state.speakReplies = Boolean(config?.voice?.synthesisDefault);
    state.preferences.replyLanguage = config?.defaults?.replyLanguage || 'auto';
    state.preferences.replyTone = config?.defaults?.replyTone || 'balanced';
    state.preferences.meaningStyle = config?.defaults?.meaningStyle || 'auto';
    els.speakToggle.checked = state.speakReplies;

    if (config?.app?.name) els.appTitle.textContent = config.app.name;
    if (config?.app?.participantSubtitle) els.appSubtitle.textContent = config.app.participantSubtitle;

    populateContractOptions();
    renderSupportModes();
    renderSelectedModeSummary();
    setStatus('Ready.');
  } catch (error) {
    console.error(error);
    setStatus('Could not load the site configuration.');
  }
}

els.composer.addEventListener('submit', async (event) => {
  event.preventDefault();
  await sendMessage(els.messageInput.value);
});

els.clearButton.addEventListener('click', clearSession);
els.exportButton.addEventListener('click', () => {
  downloadJson(`kindline-session-${state.sessionId}.json`, buildParticipantExport());
  setStatus('Downloaded the session log.');
});

els.replyLanguageSelect.addEventListener('change', () => {
  const prefs = readPreferencesFromForm();
  renderContractSummary();
  setStatus(`Reply language set to ${getLanguageLabel ? getLanguageLabel(prefs.replyLanguage) : prefs.replyLanguage}.`);
});
els.replyToneSelect.addEventListener('change', () => {
  const prefs = readPreferencesFromForm();
  renderContractSummary();
  setStatus(`Reply tone set to ${getToneLabel ? getToneLabel(prefs.replyTone) : prefs.replyTone}.`);
});
els.meaningStyleSelect.addEventListener('change', () => {
  const prefs = readPreferencesFromForm();
  renderContractSummary();
  setStatus(`Meaning style set to ${getMeaningStyleLabel(prefs.meaningStyle)}.`);
});
els.contextNote.addEventListener('input', () => {
  readPreferencesFromForm();
  renderContractSummary();
});
els.contextNote.addEventListener('change', () => {
  readPreferencesFromForm();
  renderContractSummary();
  setStatus('Updated the support contract note.');
});

els.speakToggle.addEventListener('change', () => {
  state.speakReplies = els.speakToggle.checked;
  setStatus(state.speakReplies ? 'Assistant replies will be spoken when available.' : 'Assistant speech turned off.');
});
els.micButton.addEventListener('click', () => {
  if (!state.recognitionSupported || !state.recognition) {
    setStatus('Voice input is not available in this browser. Typed input still works.');
    return;
  }

  if (state.listening) {
    state.recognition.stop();
    return;
  }

  try {
    state.recognition.lang = currentLocale();
    state.recognition.start();
  } catch (error) {
    console.error(error);
    setStatus('Could not start voice input. Typed input still works.');
  }
});

if ('speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    if (state.speakReplies) setStatus('Voice list updated.');
  };
}

init();
