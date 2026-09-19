# TermsGuard — AI Terms of Service & Privacy Policy Analyzer

**TermsGuard** is an AI-powered browser extension and web analyzer that simplifies Terms of Service, Privacy Policies, and user agreements into concise summaries, risk assessments, clause breakdowns, and actionable insights.

**Live:** https://termsguard.allkvd.dev/

**Repository:** https://github.com/kvdhanush06/TermsGuard

## Problem

Most users accept Terms of Service and Privacy Policies without reading them because legal documents are lengthy, complex, and difficult to understand. TermsGuard helps users identify important clauses, understand potential risks, and review agreements in plain language.

## Features

### AI-Powered Analysis

- Legal document summarization
- Key clause extraction
- Plain-English explanations
- Risk assessment

### Risk Detection

- Identifies potentially concerning clauses
- Highlights user-impacting terms
- Categorizes risks into severity levels

Risk levels: Low, Medium, High.

### Smart Insights

- Important clause extraction
- Key-point summaries
- Red-flag detection
- Browser notifications for high-risk documents

### Automatic Detection

TermsGuard detects Terms of Service, Privacy Policies, User Agreements, and legal disclosure pages using URL and content signals.

## How It Works

Page Detection → Legal Content Identification → Content Extraction → AI Analysis → Risk Assessment → Summary Generation → Results Display

## Tech Stack

### Frontend & Browser

- JavaScript
- HTML
- CSS
- Chrome Extensions API
- Chrome Notifications API
- Chrome Storage API

### AI

- Groq API
- GPT-OSS-120B

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

```bash
git clone https://github.com/kvdhanush06/TermsGuard.git
cd TermsGuard
npm install
npm run build
```

Load the generated extension through Chrome's `chrome://extensions` page with Developer Mode enabled.

## Security & Privacy

Do not publish builds containing embedded API keys. Prefer user-provided keys through extension settings or a secure backend proxy for production deployments. Document content is processed through the configured AI provider and results are stored locally in the browser.

## Future Improvements

- Clause categorization
- Policy comparison
- Historical policy change tracking
- Organization trust scoring
- Multi-provider LLM support
- Cross-browser support

---

## Product & Creator

TermsGuard is a software product published by **Venkata Dhanush Kakarlamudi** under the AllKVD project portfolio.

- **Product:** https://termsguard.allkvd.dev/
- **Creator:** https://allkvd.dev/
- **Portfolio:** https://portfolio.allkvd.dev/
- **GitHub:** https://github.com/kvdhanush06
- **Resume:** https://drive.google.com/file/d/1NCT6ZCa_HfxCdScqI-1Q2yA6y2c7O-qA/view
