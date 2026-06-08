# TermsGuard

AI-powered browser extension that simplifies Terms of Service, Privacy Policies, and user agreements into concise summaries, risk assessments, and actionable insights.

**Live:** https://termsguard.allkvd.dev/

## Problem

Most users accept Terms of Service and Privacy Policies without reading them because legal documents are lengthy, complex, and difficult to understand.

TermsGuard helps users understand important clauses, identify potential risks, and make informed decisions before accepting agreements.

## Features

### AI-Powered Analysis

* Legal document summarization
* Key clause extraction
* Plain-English explanations
* Risk assessment

### Risk Detection

* Identifies potentially concerning clauses
* Highlights user-impacting terms
* Categorizes risks into severity levels

Risk Levels:

* Low
* Medium
* High

### Smart Insights

* Important clauses extraction
* Key points summary
* Red flag detection
* Browser notifications for high-risk documents

### Automatic Detection

TermsGuard automatically detects:

* Terms of Service
* Privacy Policies
* User Agreements
* Legal disclosure pages

using content analysis and legal keyword matching.

## How It Works

Page Detection

↓

Legal Content Identification

↓

Content Extraction

↓

AI Analysis

↓

Risk Assessment

↓

Summary Generation

↓

Results Display

### Analysis Pipeline

1. Detect legal documents using URL and content-based signals.
2. Extract relevant document content.
3. Submit content for AI-powered analysis.
4. Generate:

   * Summary
   * Key points
   * Risk level
   * Red flags
5. Display results directly inside the browser extension.

## Tech Stack

### Frontend

* JavaScript
* HTML
* CSS

### Browser APIs

* Chrome Extensions API
* Chrome Notifications API
* Chrome Storage API

### AI

* Groq API
* GPT-OSS-120B

## Project Structure

```text
TermsGuard/
├── extension/
├── popup/
├── background/
├── content/
├── assets/
└── README.md
```

## Installation

### Clone Repository

```bash
git clone https://github.com/kvdhanush06/TermsGuard.git
cd TermsGuard
```

### Install Dependencies

```bash
npm install
```

### Configure API Key

Recommended approach:

Use the extension settings page and provide your own Groq API key.

Alternative approach:

```bash
cp .env.example .env
```

Add:

```env
GROQ_API_KEY=your_api_key
```

### Build Extension

```bash
npm run build
```

This generates:

```text
dist/
termsguard-extension-vX.Y.Z.zip
```

### Load Extension

1. Open Chrome.
2. Navigate to:

```text
chrome://extensions
```

3. Enable Developer Mode.
4. Select "Load unpacked".
5. Choose the generated extension directory.

## Security Considerations

### API Keys

Do not publish builds containing embedded API keys.

Recommended approaches:

* User-provided API keys through extension settings.
* Backend proxy service for production deployments.

### Privacy

* No personal data is collected by TermsGuard.
* Document content is processed through Groq for analysis.
* Results are stored locally in the browser.

## Development

```bash
npm install
npm run build
```

Reload the extension through:

```text
chrome://extensions
```

after making changes.

## Future Improvements

* Clause categorization
* Policy comparison
* Historical policy change tracking
* Organization trust scoring
* Multi-provider LLM support
* Cross-browser support
