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
3. (Recommended) Do nothing yet — after installing the extension you can open the extension Options page and enter your Groq API key (stored locally in the browser).

Alternatively, if you want to produce a pre-bundled ZIP that already contains a key for personal testing, copy `.env.example` to `.env` and add your Groq API key as `GROQ_API_KEY` and then build.

4. Build the extension (this will create a `dist/` folder and a versioned ZIP in the repository root):
```bash
npm run build
```

The build step will (optionally) inject the value of `GROQ_API_KEY` into the built extension files when `.env` is present and produces a file named `termsguard-extension-vX.Y.Z.zip` (version is taken from `extension/manifest.json`). For public releases, prefer the options-page approach (have users enter their own key) or use a server-side proxy.

5. Install the extension locally (developer mode):

```bash
# unzip and load the unpacked extension
unzip termsguard-extension-vX.Y.Z.zip -d termsguard-extension
# open Chrome -> chrome://extensions -> Enable Developer mode -> Load unpacked -> select the unzipped folder
```

6. Alternatively, after publishing a GitHub Release with the ZIP attached, you can download the ZIP from the Releases page and follow the same "Load unpacked" steps above.

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

## Privacy & Security

- Document text is sent to Groq for processing.
- No personal data is collected by the extension itself.
- Important security note: the current build process injects your GROQ API key into the built extension files. If you publish the ZIP or the built extension publicly, that API key will be visible to anyone who downloads the extension. For production/public releases consider one of these safer alternatives:
	- Use a small server-side proxy (recommended) that holds the API key and forwards requests from the extension.
	- Provide an options page where users can enter their own API key into chrome.storage (so you don't publish a shared key).

If you keep using the .env-based build for personal testing, make sure you do not commit any built artifacts containing the secret into the public repository.

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

## Release automation (optional)

You can automatically create a GitHub Release and upload the ZIP when you push a tag (e.g. `v1.0.0`) by using the provided GitHub Actions workflow in `.github/workflows/release.yml`. The workflow runs the build and uploads the generated `termsguard-extension-v*.zip` as a release asset.

## License

MIT
