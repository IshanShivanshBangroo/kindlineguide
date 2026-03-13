const state = {
  sessionId: crypto.randomUUID(),
  config: null,
  modes: [],
  selectedModeId: 'guided_reflection',
  threshold: 0.62,
  messages: [],
  turnLogs: [],
  preferences: {
    replyLanguage: 'auto',
    replyTone: 'balanced',
    meaningStyle: 'auto',
    contextNote: ''
  }
};

const els = {
  researchTitle: document.getElementById('research-title'),
  researchSubtitle: document.getElementById('research-subtitle'),
  modelPill: document.getElementById('model-pill'),
  interventionSelect: document.getElementById('intervention-select'),
  interventionDescription: document.getElementById('intervention-description'),
  interventionTheory: document.getElementById('intervention-theory'),
  replyLanguageSelect: document.getElementById('reply-language-select'),
  replyToneSelect: document.getElementById('reply-tone-select'),
  meaningStyleSelect: document.getElementById('meaning-style-select'),
  contextNote: document.getElementById('context-note'),
  contractSummary: document.getElementById('contract-summary'),
  thresholdRange: document.getElementById('threshold-range'),
  thresholdValue: document.getElementById('threshold-value'),
  clearButton: document.getElementById('clear-button'),
  exportButton: document.getElementById('export-button'),
  auditButton: document.getElementById('audit-button'),
  evalButton: document.getElementById('eval-button'),
  statusBox: document.getElementById('status-box'),
  sessionPill: document.getElementById('session-pill'),
  chatLog: document.getElementById('chat-log'),
  composer: document.getElementById('composer'),
  messageInput: document.getElementById('message-input'),
  sendButton: document.getElementById('send-button'),
  latestDiagnostics: document.getElementById('latest-diagnostics'),
  auditResults: document.getElementById('audit-results'),
  evaluationResults: document.getElementById('evaluation-results')
};

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function formatNumber(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return 'n/a';
  return Number(value).toFixed(3);
}

function setStatus(message) {
  els.statusBox.textContent = message;
}

function updateSessionPill() {
  const count = state.messages.filter((item) => item.role === 'assistant').length;
  els.sessionPill.textContent = count ? `${count} turn${count === 1 ? '' : 's'}` : 'New session';
}

function getSelectedMode() {
  return state.modes.find((item) => item.id === state.selectedModeId) || state.modes[0] || null;
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

function readPreferencesFromForm() {
  state.preferences = {
    replyLanguage: els.replyLanguageSelect.value || 'auto',
    replyTone: els.replyToneSelect.value || 'balanced',
    meaningStyle: els.meaningStyleSelect.value || 'auto',
    contextNote: els.contextNote.value.trim()
  };
  return state.preferences;
}

function appendSystemMessage(content, meta = {}) {
  state.messages.push({
    role: 'assistant',
    content,
    timestamp: new Date().toISOString(),
    meta: {
      gateTriggered: true,
      gateReason: meta.gateReason || 'system_error',
      gateScore: null,
      modeLabel: meta.modeLabel || getSelectedMode()?.researchLabel || getSelectedMode()?.label || 'Support mode',
      safetyLabel: meta.safetyLabel || 'System note',
      safetyExplanation: meta.safetyExplanation || ''
    }
  });
  renderMessages();
  updateSessionPill();
}

function renderInterventionOptions() {
  els.interventionSelect.innerHTML = state.modes
    .map((item) => `<option value="${escapeHtml(item.id)}" ${item.id === state.selectedModeId ? 'selected' : ''}>${escapeHtml(item.label)}</option>`)
    .join('');
  renderInterventionDetails();
}

function renderInterventionDetails() {
  const mode = getSelectedMode();
  els.interventionDescription.textContent = mode?.description || '';
  els.interventionTheory.textContent = mode?.theoryBasis ? `Theory basis: ${mode.theoryBasis}` : '';
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

function renderContractOptions() {
  const languageOptions = state.config?.supportContract?.languageOptions || [];
  const toneOptions = state.config?.supportContract?.toneOptions || [];
  const meaningStyleOptions = state.config?.supportContract?.meaningStyleOptions || [];
  els.replyLanguageSelect.innerHTML = languageOptions.map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.label)}</option>`).join('');
  els.replyToneSelect.innerHTML = toneOptions.map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.label)}</option>`).join('');
  els.meaningStyleSelect.innerHTML = meaningStyleOptions.map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.label)}</option>`).join('');
  els.replyLanguageSelect.value = state.preferences.replyLanguage;
  els.replyToneSelect.value = state.preferences.replyTone;
  els.meaningStyleSelect.value = state.preferences.meaningStyle;
  renderContractSummary();
}

function renderMessages() {
  if (!state.messages.length) {
    els.chatLog.innerHTML = `
      <article class="message assistant starter-message">
        <div class="message-header">
          <span class="message-role">Research console</span>
          <span class="message-meta">Start here</span>
        </div>
        <p>Use this page to inspect support-mode behavior, multilingual support-contract handling, purpose routing, and threshold-dependent gate behavior.</p>
      </article>
    `;
    return;
  }

  els.chatLog.innerHTML = state.messages
    .map((item) => {
      const note = item.role === 'assistant' && item.meta
        ? `<p class="message-note"><strong>${escapeHtml(item.meta.modeLabel || 'Support mode')}.</strong> ${escapeHtml(item.meta.safetyLabel || '')}${item.meta.safetyExplanation ? ` ${escapeHtml(item.meta.safetyExplanation)}` : ''}${item.meta.contractSummary ? ` Applied contract: ${escapeHtml(item.meta.contractSummary)}.` : ''}</p>`
        : '';
      const meta = item.role === 'assistant'
        ? `${item.meta?.gateTriggered ? 'Gate' : 'Pass'}${item.meta?.gateReason ? `: ${item.meta.gateReason}` : ''}`
        : new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      return `
        <article class="message ${item.role}">
          <div class="message-header">
            <span class="message-role">${item.role === 'assistant' ? 'KindLine Guide' : 'Research input'}</span>
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

function renderDiagnostics(result) {
  if (!result) {
    els.latestDiagnostics.innerHTML = '<p>No turn has been processed yet.</p>';
    return;
  }

  const gate = result.gate || {};
  const turnLog = result.logEntry || {};
  const prefs = result.preferences || turnLog.preferences || {};

  els.latestDiagnostics.innerHTML = `
    <div class="diagnostic-grid">
      <div class="metric">
        <span class="metric-label">Gate</span>
        <span class="metric-value">${gate.triggered ? 'Triggered' : 'Passed'}</span>
      </div>
      <div class="metric">
        <span class="metric-label">Gate reason</span>
        <span class="metric-value">${escapeHtml(gate.reason || 'none')}</span>
      </div>
      <div class="metric">
        <span class="metric-label">Gate score</span>
        <span class="metric-value">${formatNumber(gate.gateScore ?? gate.combinedRisk)}</span>
      </div>
      <div class="metric">
        <span class="metric-label">Threshold</span>
        <span class="metric-value">${formatNumber(gate.threshold)}</span>
      </div>
      <div class="metric">
        <span class="metric-label">Threshold source</span>
        <span class="metric-value">${escapeHtml(gate.thresholdSource || 'mode_default')}</span>
      </div>
      <div class="metric">
        <span class="metric-label">Uncertainty</span>
        <span class="metric-value">${formatNumber(gate.uncertainty?.score)}</span>
      </div>
      <div class="metric">
        <span class="metric-label">Self-risk</span>
        <span class="metric-value">${formatNumber(gate.selfRisk)}</span>
      </div>
      <div class="metric">
        <span class="metric-label">Rule risk</span>
        <span class="metric-value">${formatNumber(gate.ruleRisk)}</span>
      </div>
      <div class="metric">
        <span class="metric-label">Purpose route</span>
        <span class="metric-value">${escapeHtml(result.purpose?.kind || turnLog.purpose?.kind || 'n/a')}</span>
      </div>
      <div class="metric">
        <span class="metric-label">Effective language</span>
        <span class="metric-value">${escapeHtml(prefs.effectiveLanguageLabel || prefs.effectiveLanguage || 'n/a')}</span>
      </div>
      <div class="metric">
        <span class="metric-label">Reply tone</span>
        <span class="metric-value">${escapeHtml(prefs.toneLabel || prefs.replyTone || 'n/a')}</span>
      </div>
      <div class="metric">
        <span class="metric-label">Meaning style</span>
        <span class="metric-value">${escapeHtml(prefs.meaningStyleLabel || prefs.meaningStyle || 'n/a')}</span>
      </div>
      <div class="metric metric-wide">
        <span class="metric-label">Context note</span>
        <span class="metric-value">${escapeHtml(prefs.contextNote || 'none')}</span>
      </div>
      <div class="metric metric-wide">
        <span class="metric-label">Support mode</span>
        <span class="metric-value">${escapeHtml(turnLog.supportModeResearchLabel || result.supportMode?.researchLabel || 'n/a')}</span>
      </div>
      <div class="metric metric-wide">
        <span class="metric-label">Purpose explanation</span>
        <span class="metric-value">${escapeHtml(result.purpose?.explanation || turnLog.purpose?.explanation || 'n/a')}</span>
      </div>
      <div class="metric metric-wide">
        <span class="metric-label">Safety summary</span>
        <span class="metric-value">${escapeHtml(turnLog.safetySummary?.label || result.safetySummary?.label || 'n/a')}: ${escapeHtml(turnLog.safetySummary?.explanation || result.safetySummary?.explanation || '')}</span>
      </div>
      <div class="metric metric-wide">
        <span class="metric-label">Draft</span>
        <span class="metric-value">${escapeHtml(result.draft || turnLog.assistantDraft || 'n/a')}</span>
      </div>
      <div class="metric metric-wide">
        <span class="metric-label">Scope note</span>
        <span class="metric-value">${escapeHtml(result.scopeNote || turnLog.scopeNote || 'n/a')}</span>
      </div>
      <div class="metric metric-wide">
        <span class="metric-label">Response stats</span>
        <span class="metric-value">${escapeHtml(JSON.stringify(result.responseStats || turnLog.responseStats || {}))}</span>
      </div>
    </div>
  `;
}

function renderAudit(results) {
  if (!results) {
    els.auditResults.innerHTML = '<p>Run the artifact audit to inspect deterministic interface and safety invariants.</p>';
    return;
  }

  const sections = results.sections.map((section) => {
    const rows = section.results.map((item) => `
      <tr>
        <td>${escapeHtml(item.label)}</td>
        <td>${item.pass ? 'Pass' : 'Fail'}</td>
        <td><code>${escapeHtml(JSON.stringify(item.details || {}))}</code></td>
      </tr>
    `).join('');

    return `
      <div class="evaluation-summary">
        <p><strong>${escapeHtml(section.label)}</strong></p>
      </div>
      <div class="table-wrap">
        <table class="result-table">
          <thead>
            <tr>
              <th>Check</th>
              <th>Result</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  }).join('');

  els.auditResults.innerHTML = `
    <div class="evaluation-summary">
      <p><strong>${results.passed}/${results.total}</strong> checks passed. Pass rate: ${(results.passRate * 100).toFixed(1)}%</p>
    </div>
    ${sections}
  `;
}

function renderEvaluation(results) {
  if (!results) {
    els.evaluationResults.innerHTML = '<p>Run the model evaluation to inspect crisis, medical, and benign support cases.</p>';
    return;
  }

  const rows = results.results
    .map((item) => `
      <tr>
        <td>${escapeHtml(item.label)}</td>
        <td>${escapeHtml(item.supportMode)}</td>
        <td>${item.pass ? 'Pass' : 'Fail'}</td>
        <td>${escapeHtml(item.actual.gateReason || 'none')}</td>
        <td>${escapeHtml(item.actual.purpose?.kind || 'n/a')}</td>
        <td>${escapeHtml(item.actual.preferences?.effectiveLanguage || 'n/a')}</td>
      </tr>
    `)
    .join('');

  els.evaluationResults.innerHTML = `
    <div class="evaluation-summary">
      <p><strong>${results.passed}/${results.total}</strong> cases passed. Pass rate: ${(results.passRate * 100).toFixed(1)}%</p>
    </div>
    <div class="table-wrap">
      <table class="result-table">
        <thead>
          <tr>
            <th>Case</th>
            <th>Mode</th>
            <th>Result</th>
            <th>Gate reason</th>
            <th>Purpose</th>
            <th>Language</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function clearSession() {
  state.sessionId = crypto.randomUUID();
  state.messages = [];
  state.turnLogs = [];
  els.messageInput.value = '';
  updateSessionPill();
  renderMessages();
  renderDiagnostics(null);
  setStatus('Started a new research session.');
}

function buildResearchExport() {
  return {
    exportedAt: new Date().toISOString(),
    sessionId: state.sessionId,
    selectedModeId: state.selectedModeId,
    threshold: state.threshold,
    supportContract: readPreferencesFromForm(),
    turns: state.turnLogs
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

async function sendMessage(text) {
  const trimmed = text.trim();
  if (!trimmed) return;

  const prefs = readPreferencesFromForm();
  const now = new Date().toISOString();
  state.messages.push({ role: 'user', content: trimmed, timestamp: now, meta: { direction: 'ltr' } });
  renderMessages();
  updateSessionPill();
  els.messageInput.value = '';
  setStatus('Generating a reply with research diagnostics...');
  els.sendButton.disabled = true;

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: state.sessionId,
        uiMode: 'research',
        interventionId: state.selectedModeId,
        threshold: state.threshold,
        preferences: prefs,
        messages: state.messages.map((item) => ({ role: item.role, content: item.content }))
      })
    });

    const result = await response.json();
    if (!response.ok || result?.ok === false) {
      throw new Error(result?.error || 'The request failed.');
    }

    state.messages.push({
      role: 'assistant',
      content: result.reply,
      timestamp: new Date().toISOString(),
      meta: {
        gateTriggered: result.gate?.triggered,
        gateReason: result.gate?.reason,
        gateScore: result.gate?.gateScore,
        modeLabel: result.supportMode?.researchLabel || result.supportMode?.label || 'Support mode',
        safetyLabel: result.safetySummary?.label || '',
        safetyExplanation: result.safetySummary?.explanation || '',
        contractSummary: result.preferences?.contractSummary || '',
        direction: result.preferences?.effectiveLanguage === 'ar' || result.preferences?.effectiveLanguage === 'ur' ? 'rtl' : 'ltr'
      }
    });
    if (result.logEntry) state.turnLogs.push(result.logEntry);
    renderMessages();
    renderDiagnostics(result);
    updateSessionPill();
    setStatus(result.gate?.triggered ? 'Gate triggered on this turn.' : 'Turn completed without gate trigger.');
  } catch (error) {
    console.error(error);
    appendSystemMessage(
      'The research turn failed before a reply was returned. Check the deployment logs or retry with a shorter prompt.',
      {
        gateReason: 'system_error',
        safetyLabel: 'System note',
        safetyExplanation: 'A server or parsing error interrupted this research turn.'
      }
    );
    setStatus(error.message || 'Something went wrong while generating a reply.');
  } finally {
    els.sendButton.disabled = false;
  }
}

async function runArtifactAudit() {
  setStatus('Running deterministic artifact audit...');
  els.auditButton.disabled = true;
  try {
    const response = await fetch('/api/audit', { method: 'POST' });
    const result = await response.json();
    if (!response.ok || result?.ok === false) throw new Error(result?.error || 'The artifact audit failed.');
    renderAudit(result);
    setStatus('Artifact audit finished.');
  } catch (error) {
    console.error(error);
    setStatus(error.message || 'The artifact audit failed.');
  } finally {
    els.auditButton.disabled = false;
  }
}

async function runEvaluation() {
  setStatus('Running the model evaluation...');
  els.evalButton.disabled = true;
  try {
    const response = await fetch('/api/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: `evaluation-${crypto.randomUUID()}`,
        threshold: state.threshold
      })
    });
    const result = await response.json();
    if (!response.ok || result?.ok === false) throw new Error(result?.error || 'The evaluation failed.');
    renderEvaluation(result);
    setStatus('Model evaluation finished.');
  } catch (error) {
    console.error(error);
    setStatus(error.message || 'The evaluation failed.');
  } finally {
    els.evalButton.disabled = false;
  }
}

async function init() {
  renderMessages();
  updateSessionPill();
  renderAudit(null);
  renderEvaluation(null);

  try {
    const response = await fetch('/api/config');
    const config = await response.json();
    state.config = config;
    state.modes = Array.isArray(config?.researchModes) ? config.researchModes : [];
    state.selectedModeId = config?.defaults?.researchIntervention || state.selectedModeId;
    state.threshold = Number(config?.defaults?.researchThreshold || 0.62);
    state.preferences.replyLanguage = config?.defaults?.replyLanguage || 'auto';
    state.preferences.replyTone = config?.defaults?.replyTone || 'balanced';
    state.preferences.meaningStyle = config?.defaults?.meaningStyle || 'auto';

    if (config?.app?.name) els.researchTitle.textContent = `${config.app.name} Research Console`;
    if (config?.app?.researchSubtitle) els.researchSubtitle.textContent = config.app.researchSubtitle;
    if (config?.defaults?.model) els.modelPill.textContent = `Model: ${config.defaults.model}`;

    els.thresholdRange.value = String(state.threshold);
    els.thresholdValue.textContent = state.threshold.toFixed(2);

    renderInterventionOptions();
    renderContractOptions();
    setStatus('Ready.');
  } catch (error) {
    console.error(error);
    setStatus('Could not load the research configuration.');
  }
}

els.interventionSelect.addEventListener('change', () => {
  state.selectedModeId = els.interventionSelect.value;
  renderInterventionDetails();
  setStatus(`Support mode set to ${getSelectedMode()?.label || 'Guided reflection'}.`);
});

els.thresholdRange.addEventListener('input', () => {
  state.threshold = Number(els.thresholdRange.value);
  els.thresholdValue.textContent = state.threshold.toFixed(2);
});

els.composer.addEventListener('submit', async (event) => {
  event.preventDefault();
  await sendMessage(els.messageInput.value);
});

els.clearButton.addEventListener('click', clearSession);
els.exportButton.addEventListener('click', () => {
  downloadJson(`kindline-research-session-${state.sessionId}.json`, buildResearchExport());
  setStatus('Downloaded the research log.');
});

els.replyLanguageSelect.addEventListener('change', () => {
  const prefs = readPreferencesFromForm();
  setStatus(`Reply language set to ${getLanguageLabel ? getLanguageLabel(prefs.replyLanguage) : prefs.replyLanguage}.`);
});
els.replyToneSelect.addEventListener('change', () => {
  const prefs = readPreferencesFromForm();
  setStatus(`Reply tone set to ${getToneLabel ? getToneLabel(prefs.replyTone) : prefs.replyTone}.`);
});
els.contextNote.addEventListener('change', () => {
  readPreferencesFromForm();
  setStatus('Updated the support contract note.');
});

els.auditButton.addEventListener('click', runArtifactAudit);
els.evalButton.addEventListener('click', runEvaluation);

init();
