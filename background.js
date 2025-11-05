const GROQ_API_KEY = process.env.GROQ_API_KEY;

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action === 'analyze') {
    try {
      const result = await analyzeDocument(message.text);
      await chrome.storage.local.set({ [message.url]: result });

      // Add to history
      const history = (await chrome.storage.local.get('history')).history || [];
      history.unshift({
        url: message.url,
        title: message.title,
        timestamp: Date.now(),
        result: result
      });
      // Keep only last 50
      if (history.length > 50) history.splice(50);
      await chrome.storage.local.set({ history });

      if (result.risk_level === 'High') {
        chrome.notifications.create({
          type: 'basic',
          title: 'TermsGuard Alert',
          message: 'High risk detected in this legal document.'
        });
      }
    } catch (error) {
      console.error('Error analyzing document:', error);
    }
  }
});

async function analyzeDocument(text) {
  const prompt = `You are an expert legal assistant. Analyze the following legal document excerpt. Provide a concise summary in plain English. Extract key points including data usage, cancellation policies, user rights, and potential red flags. Assess overall risk level as Low (green), Medium (yellow), or High (red) based on privacy concerns, data collection aggressiveness, and user rights limitations. Format your response as valid JSON with keys: summary (string), key_points (array of strings), risk_level (string: 'Low', 'Medium', or 'High'), red_flags (array of strings). Do not include any other text.`;

  const truncatedText = text.substring(0, 8000); // Limit to avoid token limits

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: 'openai/gpt-oss-120b',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that responds only with valid JSON.' },
        { role: 'user', content: `${prompt}\n\nDocument:\n${truncatedText}` }
      ],
      temperature: 0.3,
      max_tokens: 1500,
      top_p: 1,
      stream: false,
      reasoning_effort: 'medium',
      stop: null
    })
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content.trim();
  return JSON.parse(content);
}