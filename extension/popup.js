document.addEventListener('DOMContentLoaded', async () => {
  // Promise-wrapped chrome APIs
  const storageGet = (keys) => new Promise((resolve) => chrome.storage.local.get(keys, resolve));
  const storageSet = (items) => new Promise((resolve) => chrome.storage.local.set(items, resolve));
  const queryTabs = (query) => new Promise((resolve) => chrome.tabs.query(query, resolve));

  const contentDiv = document.getElementById('content');
  const exportButtons = document.getElementById('export-buttons');
  const historyToggle = document.getElementById('history-toggle');
  const historyDiv = document.getElementById('history');
  const apiBanner = document.getElementById('api-key-banner');
  const apiBannerText = document.getElementById('api-key-banner-text');
  const openOptionsBtn = document.getElementById('open-options');

  let currentResult = null;
  let darkMode = false;

  function displayAnalysis(result, title, url) {
    const header = title && url ? `<div class="page-header"><h4>${title}</h4><a href="${url}" target="_blank">${url}</a></div>` : '';
    contentDiv.innerHTML = `
      ${header}
      <div class="risk ${result.risk_level.toLowerCase()}">Risk Level: ${result.risk_level}</div>
      <div class="section">
        <div class="section-title">Summary</div>
        <p>${result.summary}</p>
      </div>
      <div class="section">
        <div class="section-title key-points">Key Points</div>
        <ul>${result.key_points.map(point => `<li>${point}</li>`).join('')}</ul>
      </div>
      <div class="section">
        <div class="section-title red-flags">Red Flags</div>
        <ul>${result.red_flags.map(flag => `<li>${flag}</li>`).join('')}</ul>
      </div>
    `;
  }

  function compareAnalyses(history, selectedIndices) {
    const items = selectedIndices.map(i => history[i]);
    contentDiv.innerHTML = `
      <h4>Comparison of ${items.length} Analyses</h4>
      <div class="comparison">
        ${items.map(item => `
          <div class="compare-item">
            <h5>${item.title || item.url}</h5>
            <p><small>${item.url} - ${new Date(item.timestamp).toLocaleString()}</small></p>
            <div class="compare-section">
              <strong>Risk Level:</strong> ${item.result.risk_level}
            </div>
            <div class="compare-section">
              <strong>Summary:</strong> ${item.result.summary}
            </div>
            <div class="compare-section">
              <strong>Key Points:</strong>
              <ul>${item.result.key_points.map(p => `<li>${p}</li>`).join('')}</ul>
            </div>
            <div class="compare-section">
              <strong>Red Flags:</strong>
              <ul>${item.result.red_flags.map(f => `<li>${f}</li>`).join('')}</ul>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  function highlightSearch(result, query) {
    if (!query) {
      displayAnalysis(result);
      return;
    }
    const highlightText = (text) => text.replace(new RegExp(`(${query})`, 'gi'), '<mark>$1</mark>');
    contentDiv.innerHTML = `
      <div class="risk ${result.risk_level.toLowerCase()}">Risk Level: ${result.risk_level}</div>
      <div class="section">
        <div class="section-title">Summary</div>
        <p>${highlightText(result.summary)}</p>
      </div>
      <div class="section">
        <div class="section-title key-points">Key Points</div>
        <ul>${result.key_points.map(point => `<li>${highlightText(point)}</li>`).join('')}</ul>
      </div>
      <div class="section">
        <div class="section-title red-flags">Red Flags</div>
        <ul>${result.red_flags.map(flag => `<li>${highlightText(flag)}</li>`).join('')}</ul>
      </div>
    `;
  }

  function copyToClipboard(result) {
    const text = `TermsGuard Analysis\n\nRisk Level: ${result.risk_level}\n\nSummary: ${result.summary}\n\nKey Points:\n${result.key_points.map(p => `- ${p}`).join('\n')}\n\nRed Flags:\n${result.red_flags.map(f => `- ${f}`).join('\n')}`;
    navigator.clipboard.writeText(text).catch(() => {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    });
  }

  async function displayHistory(history, compareMode = false) {
    if (!history || history.length === 0) {
      historyDiv.innerHTML = '<p>No history available.</p>';
      return;
    }
    historyDiv.innerHTML = history.map((item, index) => `
      <div class="history-item ${compareMode ? 'compare-item' : ''}" data-index="${index}">
        ${compareMode ? `<input type="checkbox" class="compare-checkbox" data-index="${index}">` : ''}
        <div class="history-content" data-index="${index}">
          <div class="history-url">${item.title || item.url}</div>
          <div class="history-date">${new Date(item.timestamp).toLocaleString()}</div>
        </div>
        <button class="delete-history" data-index="${index}">✕</button>
      </div>
    `).join('');

    if (compareMode) {
      historyDiv.innerHTML += '<button id="do-compare" class="small-btn" style="display: none;">Compare Selected</button>';
      document.getElementById('do-compare').addEventListener('click', () => {
        const checked = Array.from(document.querySelectorAll('.compare-checkbox:checked')).map(cb => parseInt(cb.dataset.index));
        if (checked.length > 1) compareAnalyses(history, checked);
      });
      const updateCompareBtn = () => {
        const checkedCount = document.querySelectorAll('.compare-checkbox:checked').length;
        document.getElementById('do-compare').style.display = checkedCount >= 2 ? 'inline-block' : 'none';
      };
      document.querySelectorAll('.compare-checkbox').forEach(cb => cb.addEventListener('change', updateCompareBtn));
    } else {
      document.querySelectorAll('.history-content').forEach(item => {
        item.addEventListener('click', () => {
          const index = parseInt(item.dataset.index);
          const historicalResult = history[index];
          displayAnalysis(historicalResult.result, historicalResult.title, historicalResult.url);
          currentResult = historicalResult.result;
          exportButtons.style.display = 'block';
          document.getElementById('search-bar').style.display = 'block';
        });
      });
    }

    document.querySelectorAll('.delete-history').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const index = parseInt(btn.dataset.index);
        history.splice(index, 1);
        await storageSet({ history });
        displayHistory(history, compareMode);
      });
    });
  }

  // Check for API key and show prompt if missing
  try {
    const keyObj = await storageGet('GROQ_API_KEY');
    const groqKey = keyObj?.GROQ_API_KEY;
    if (!groqKey) {
      apiBannerText.textContent = 'Groq API key not set. Please enter your key in Options.';
      apiBanner.style.display = 'block';
      openOptionsBtn.addEventListener('click', () => {
        try { chrome.runtime.openOptionsPage(); } catch (e) { /* ignore */ }
      });
    } else {
      apiBanner.style.display = 'none';
    }
  } catch (e) {
    console.error('Error checking API key', e);
  }

  // Load dark mode preference
  const prefs = await storageGet('prefs');
  darkMode = prefs.prefs?.darkMode || false;
  document.body.classList.toggle('dark', darkMode);
  document.getElementById('dark-mode-toggle').textContent = darkMode ? '☀️' : '🌙';

  // Get current tab and load analysis
  const [tab] = await queryTabs({ active: true, currentWindow: true });
  const url = tab?.url;
  const data = await storageGet([url, 'history']);
  const result = data ? data[url] : undefined;
  const history = data ? data.history || [] : [];

  if (result) {
    displayAnalysis(result);
    currentResult = result;
    exportButtons.style.display = 'block';
    document.getElementById('search-bar').style.display = 'block';

    // Ensure current analysis is in history
    const currentEntry = { url, title: tab.title, timestamp: Date.now(), result };
    const existingIndex = history.findIndex(item => item.url === url);
    if (existingIndex === -1) {
      history.unshift(currentEntry);
      if (history.length > 50) history.splice(50);
      await storageSet({ history });
    } else {
      history[existingIndex].timestamp = Date.now();
      await storageSet({ history });
    }
  } else {
    contentDiv.innerHTML = '<div class="no-analysis">No analysis available for this page. If this is a legal document, it may still be processing or not detected.</div>';
  }

  // Display history
  await displayHistory(history);

  // Show compare button only if history has more than 1 item
  document.getElementById('compare-mode').style.display = history.length > 1 ? 'inline-block' : 'none';

  // Toggle history
  historyToggle.addEventListener('click', () => {
    const isVisible = historyDiv.style.display === 'block';
    historyDiv.style.display = isVisible ? 'none' : 'block';
    document.getElementById('history-header').style.display = isVisible ? 'none' : 'block';
    historyToggle.textContent = isVisible ? 'View History' : 'Hide History';
  });

  // Dark mode toggle
  document.getElementById('dark-mode-toggle').addEventListener('click', async () => {
    darkMode = !darkMode;
    document.body.classList.toggle('dark', darkMode);
    document.getElementById('dark-mode-toggle').textContent = darkMode ? '☀️' : '🌙';
    await storageSet({ prefs: { darkMode } });
  });

  // Search
  document.getElementById('search-input').addEventListener('input', () => {
    const query = document.getElementById('search-input').value.toLowerCase();
    if (currentResult) highlightSearch(currentResult, query);
  });

  // Add event listeners for export buttons
  document.getElementById('copy-clipboard').addEventListener('click', () => {
    if (currentResult) copyToClipboard(currentResult);
  });

  // Clear history button
  document.getElementById('clear-history').addEventListener('click', async () => {
    const empty = [];
    await storageSet({ history: empty });
    await displayHistory(empty);
    document.getElementById('compare-mode').style.display = 'none';
  });

  // Compare mode
  let compareMode = false;
  let selectedForCompare = [];
  document.getElementById('compare-mode').addEventListener('click', () => {
    compareMode = !compareMode;
    selectedForCompare = [];
    document.getElementById('compare-mode').textContent = compareMode ? 'Exit Compare' : 'Compare';
    if (!compareMode && result) {
      displayAnalysis(result);
      currentResult = result;
      exportButtons.style.display = 'block';
      document.getElementById('search-bar').style.display = 'block';
    }
    displayHistory(history, compareMode);
  });

});

function displayAnalysis(result, title, url) {
  const contentDiv = document.getElementById('content');
  const header = title && url ? `<div class="page-header"><h4>${title}</h4><a href="${url}" target="_blank">${url}</a></div>` : '';
  contentDiv.innerHTML = `
    ${header}
    <div class="risk ${result.risk_level.toLowerCase()}">Risk Level: ${result.risk_level}</div>
    <div class="section">
      <div class="section-title">Summary</div>
      <p>${result.summary}</p>
    </div>
    <div class="section">
      <div class="section-title key-points">Key Points</div>
      <ul>${result.key_points.map(point => `<li>${point}</li>`).join('')}</ul>
    </div>
    <div class="section">
      <div class="section-title red-flags">Red Flags</div>
      <ul>${result.red_flags.map(flag => `<li>${flag}</li>`).join('')}</ul>
    </div>
  `;
}

function compareAnalyses(history, selectedIndices) {
  const contentDiv = document.getElementById('content');
  const items = selectedIndices.map(i => history[i]);
  contentDiv.innerHTML = `
    <h4>Comparison of ${items.length} Analyses</h4>
    <div class="comparison">
      ${items.map(item => `
        <div class="compare-item">
          <h5>${item.title || item.url}</h5>
          <p><small>${item.url} - ${new Date(item.timestamp).toLocaleString()}</small></p>
          <div class="compare-section">
            <strong>Risk Level:</strong> ${item.result.risk_level}
          </div>
          <div class="compare-section">
            <strong>Summary:</strong> ${item.result.summary}
          </div>
          <div class="compare-section">
            <strong>Key Points:</strong>
            <ul>${item.result.key_points.map(p => `<li>${p}</li>`).join('')}</ul>
          </div>
          <div class="compare-section">
            <strong>Red Flags:</strong>
            <ul>${item.result.red_flags.map(f => `<li>${f}</li>`).join('')}</ul>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function highlightSearch(result, query) {
  const contentDiv = document.getElementById('content');
  if (!query) {
    displayAnalysis(result);
    return;
  }
  // Simple highlight by wrapping matches
  const highlightText = (text) => text.replace(new RegExp(`(${query})`, 'gi'), '<mark>$1</mark>');
  contentDiv.innerHTML = `
    <div class="risk ${result.risk_level.toLowerCase()}">Risk Level: ${result.risk_level}</div>
    <div class="section">
      <div class="section-title">Summary</div>
      <p>${highlightText(result.summary)}</p>
    </div>
    <div class="section">
      <div class="section-title key-points">Key Points</div>
      <ul>${result.key_points.map(point => `<li>${highlightText(point)}</li>`).join('')}</ul>
    </div>
    <div class="section">
      <div class="section-title red-flags">Red Flags</div>
      <ul>${result.red_flags.map(flag => `<li>${highlightText(flag)}</li>`).join('')}</ul>
    </div>
  `;
}

function copyToClipboard(result) {
  const text = `TermsGuard Analysis\n\nRisk Level: ${result.risk_level}\n\nSummary: ${result.summary}\n\nKey Points:\n${result.key_points.map(p => `- ${p}`).join('\n')}\n\nRed Flags:\n${result.red_flags.map(f => `- ${f}`).join('\n')}`;
  navigator.clipboard.writeText(text).catch(() => {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  });
}

function displayHistory(history, compareMode = false) {
  const historyDiv = document.getElementById('history');
  if (history.length === 0) {
    historyDiv.innerHTML = '<p>No history available.</p>';
    return;
  }
  historyDiv.innerHTML = history.map((item, index) => `
    <div class="history-item ${compareMode ? 'compare-item' : ''}" data-index="${index}">
      ${compareMode ? `<input type="checkbox" class="compare-checkbox" data-index="${index}">` : ''}
      <div class="history-content" data-index="${index}">
        <div class="history-url">${item.title || item.url}</div>
        <div class="history-date">${new Date(item.timestamp).toLocaleString()}</div>
      </div>
      <button class="delete-history" data-index="${index}">✕</button>
    </div>
  `).join('');

  if (compareMode) {
    // Add compare button
    historyDiv.innerHTML += '<button id="do-compare" class="small-btn" style="display: none;">Compare Selected</button>';
    document.getElementById('do-compare').addEventListener('click', () => {
      selectedForCompare = Array.from(document.querySelectorAll('.compare-checkbox:checked')).map(cb => parseInt(cb.dataset.index));
      if (selectedForCompare.length > 1) {
        compareAnalyses(history, selectedForCompare);
      }
    });

    // Show/hide compare button based on selection
    const checkboxes = document.querySelectorAll('.compare-checkbox');
    const updateCompareBtn = () => {
      const checked = document.querySelectorAll('.compare-checkbox:checked').length;
      document.getElementById('do-compare').style.display = checked >= 2 ? 'inline-block' : 'none';
    };
    checkboxes.forEach(cb => cb.addEventListener('change', updateCompareBtn));
  } else {
    // Add click listeners to load historical analysis
    document.querySelectorAll('.history-content').forEach(item => {
      item.addEventListener('click', () => {
        const index = parseInt(item.dataset.index);
        const historicalResult = history[index];
        displayAnalysis(historicalResult.result, historicalResult.title, historicalResult.url);
        currentResult = historicalResult.result;
        exportButtons.style.display = 'block';
        document.getElementById('search-bar').style.display = 'block';
      });
    });
  }

  // Add delete listeners
  document.querySelectorAll('.delete-history').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const index = parseInt(btn.dataset.index);
      history.splice(index, 1);
      await chrome.storage.local.set({ history });
      displayHistory(history, compareMode);
    });
  });
}