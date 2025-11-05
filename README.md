# TermsGuard - AI-Powered Legal Document Summarizer

A Chrome extension that analyzes and summarizes terms of service, privacy policies, and user agreements using AI.

## Features

- Automatic detection of legal documents on web pages using content analysis
- AI-powered summarization and risk assessment
- Color-coded risk levels (Low/Medium/High)
- Key points extraction
- Red flags highlighting
- Smart notifications for high-risk documents

## Setup

1. Clone this repository.
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and add your Groq API key.
4. Build the extension: `npm run build`
5. Open Chrome and go to `chrome://extensions/`.
6. Enable "Developer mode" in the top right.
7. Click "Load unpacked" and select the `dist` folder.
8. The extension should now be installed.

## Configuration

The extension requires a Groq API key for AI analysis.

- Get your free API key from [Groq Console](https://console.groq.com/).
- Add it to the `.env` file as `GROQ_API_KEY=your_key_here`.

## Usage

- Navigate to a website with terms of service, privacy policy, or similar legal documents.
- The extension will automatically detect and analyze the page based on content (may take a few seconds).
- Click the TermsGuard icon to view the summary, key points, risk level, and red flags.
- If the risk level is High, you'll receive a browser notification.

## How It Works

- Content scripts run on pages with URLs containing legal-related keywords (terms, privacy, policy, etc.).
- Page content is scanned for legal phrases using regex patterns.
- If legal content is detected, text is extracted and sent to the background service.
- The background service calls the Groq API for analysis using the openai/gpt-oss-120b model.
- Results are stored locally and displayed in the popup.

## Privacy

- Document text is sent to Groq for processing.
- No personal data is collected by the extension itself.
- Your API key is stored locally in the `.env` file.

## Development

To modify the extension:

- Edit the source files as needed.
- Run `npm run build` to rebuild after changes.
- Reload the extension in `chrome://extensions/` after changes.
- Check the console for errors.

## Requirements

- Chrome browser
- Node.js and npm
- Internet connection for AI analysis
- Groq API key (free)

## License

MIT
