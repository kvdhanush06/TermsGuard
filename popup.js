document.addEventListener('DOMContentLoaded', async () => {
  const contentDiv = document.getElementById('content');
  const exportButtons = document.getElementById('export-buttons');
  const historyToggle = document.getElementById('history-toggle');
  const historyDiv = document.getElementById('history');

  // Get current tab and load analysis
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = tab.url;
  const data = await chrome.storage.local.get([url, 'history']);
  const result = data[url];
  const history = data.history || [];

  if (result) {
    displayAnalysis(result);
    currentResult = result;
    exportButtons.style.display = 'block';

    // Ensure current analysis is in history
    const currentEntry = { url, title: tab.title, timestamp: Date.now(), result };
    const existingIndex = history.findIndex(item => item.url === url);
    if (existingIndex === -1) {
      history.unshift(currentEntry);
      if (history.length > 50) history.splice(50);
      await chrome.storage.local.set({ history });
    } else {
      // Update timestamp if needed
      history[existingIndex].timestamp = Date.now();
      await chrome.storage.local.set({ history });
    }
  } else {
    contentDiv.innerHTML = '<div class="no-analysis">No analysis available for this page. If this is a legal document, it may still be processing or not detected.</div>';
  }

  // Display history
  displayHistory(history);

  // Toggle history
  historyToggle.addEventListener('click', () => {
    if (historyDiv.style.display === 'none' || historyDiv.style.display === '') {
      historyDiv.style.display = 'block';
      historyToggle.textContent = 'Hide History';
    } else {
      historyDiv.style.display = 'none';
      historyToggle.textContent = 'View History';
    }
  });

  // Add event listeners for export buttons
  document.getElementById('copy-clipboard').addEventListener('click', () => {
    const currentResult = getCurrentDisplayedResult();
    if (currentResult) copyToClipboard(currentResult);
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

function copyToClipboard(result) {
  const text = `TermsGuard Analysis\n\nRisk Level: ${result.risk_level}\n\nSummary: ${result.summary}\n\nKey Points:\n${result.key_points.map(p => `- ${p}`).join('\n')}\n\nRed Flags:\n${result.red_flags.map(f => `- ${f}`).join('\n')}`;
  navigator.clipboard.writeText(text);
}

function displayHistory(history) {
  const historyDiv = document.getElementById('history');
  if (history.length === 0) {
    historyDiv.innerHTML = '<p>No history available.</p>';
    return;
  }
  historyDiv.innerHTML = history.map(item => `
    <div class="history-item" data-index="${history.indexOf(item)}">
      <div class="history-url">${item.title || item.url}</div>
      <div class="history-date">${new Date(item.timestamp).toLocaleString()}</div>
    </div>
  `).join('');

  // Add click listeners to load historical analysis
  document.querySelectorAll('.history-item').forEach(item => {
    item.addEventListener('click', () => {
      const index = parseInt(item.dataset.index);
      const historicalResult = history[index];
      displayAnalysis(historicalResult.result, historicalResult.title, historicalResult.url);
      currentResult = historicalResult.result;
      exportButtons.style.display = 'block'; // Allow copying historical
    });
  });
}