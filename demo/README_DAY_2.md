# Day 2 Demo Setup Guide

## Overview

This demo now includes Day 2 features: Medical Report Intake & Prefill. The demo server supports:
- File upload (PDF, JPG, PNG, DOCX)
- OCR and condition extraction (using OpenAI or mock)
- Condition review and confirmation
- Interview prefill integration

## Quick Start

### 1. Set Up Environment Variables

Create a `.env` file in the `demo` folder:

```bash
cp .env.example .env
```

Edit `.env` and add your OpenAI API key:

```
OPENAI_API_KEY=sk-your-key-here
```

**Note:** If you don't have an OpenAI API key, the demo will use mock extraction. You can still test all features, but condition extraction will be simulated.

### 2. Install Dependencies

```bash
cd demo
npm install
```

This installs:
- `multer` - File upload handling
- `openai` - OpenAI API client (already included)

### 3. Start the Server

```bash
npm start
```

You should see:
```
🚀 Demo backend server running on http://localhost:3000
📝 Available endpoints (Day 2):
  POST   /v1/intake/files (multipart/form-data)
  GET    /v1/intake/summary?sessionId=...
  POST   /v1/intake/confirmations
  GET    /v1/dictionary/search?q=...
🤖 OpenAI: ✅ Configured (or ❌ Not configured (using mock))
```

### 4. Test Day 2 Features

1. **Upload a Document**
   - Start a session
   - Upload a PDF, JPG, PNG, or DOCX file
   - File will be processed (OCR + condition extraction)

2. **Review Conditions**
   - View detected conditions
   - Accept/reject/edit conditions
   - Add conditions manually via dictionary search

3. **Interview Prefill**
   - Start the interview
   - Medical conditions question will include prefilled conditions
   - Interview adapts based on confirmed conditions

## API Endpoints

### File Upload
```
POST /v1/intake/files
Content-Type: multipart/form-data

Body:
  file: <file>
  sessionId: <session-id>
```

### Get Extraction Summary
```
GET /v1/intake/summary?sessionId=<session-id>
```

### Submit Confirmations
```
POST /v1/intake/confirmations
Content-Type: application/json

Body:
{
  "sessionId": "...",
  "confirmed": [
    { "candidateId": "candidate-..." }
  ],
  "rejected": ["candidate-..."],
  "manualAdd": [
    { "code": "ASTHMA", "label": "Asthma" }
  ]
}
```

### Dictionary Search
```
GET /v1/dictionary/search?q=<query>
```

## Mock vs OpenAI

### Mock Mode (No API Key)
- Simulates OCR and condition extraction
- Uses keyword matching against mock dictionary
- Returns sample conditions (Asthma, Hypertension, etc.)
- Good for testing UI flow without API costs

### OpenAI Mode (With API Key)
- Real OCR using GPT-4 Vision API
- Real condition extraction using GPT-4o
- Matches against impairment dictionary
- More accurate condition detection

## Mock Impairment Dictionary

The demo includes a mock dictionary with common conditions:
- Asthma
- Hypertension
- Type 2 Diabetes
- COPD
- Depression
- Anxiety
- Arthritis
- Obesity
- Heart Disease
- Stroke
- Cancer
- Epilepsy
- Kidney Disease
- Liver Disease

## File Storage

- Files are stored temporarily in `demo/uploads/`
- Files are processed asynchronously
- For production, implement proper file storage (S3, etc.)

## Troubleshooting

### OpenAI Errors
- Check your API key is correct
- Ensure you have API credits
- Check API rate limits
- Demo falls back to mock mode on errors

### File Upload Errors
- Check file size (max 20MB)
- Check file type (PDF, JPG, PNG, DOCX only)
- Check `uploads/` directory exists and is writable

### Extraction Not Working
- If using OpenAI: Check API key and credits
- If using mock: Ensure file contains text matching dictionary keywords
- Check server logs for errors

## Next Steps

1. **Test with Real Documents**
   - Upload a medical report
   - See real condition extraction

2. **Customize Dictionary**
   - Edit `IMPAIRMENT_DICTIONARY` in `server.js`
   - Add your own conditions

3. **Integrate with Real Backend**
   - Replace mock services with real API calls
   - Add database storage
   - Add proper file storage

## Support

For issues or questions:
- Check server logs
- Verify API keys are set correctly
- Review endpoint responses

