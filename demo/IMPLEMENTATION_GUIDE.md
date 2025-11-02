# Demo Implementation Guide - Day 2 Features

## Overview

This guide explains how the demo server implements Day 2 features with mock services and OpenAI integration.

## Day 2 API Endpoints

### 1. File Upload
**POST /v1/intake/files**
- Accepts multipart/form-data
- Validates file type, size
- Stores file temporarily
- Returns fileId and status

### 2. Extraction Summary
**GET /v1/intake/summary?sessionId=...**
- Returns extraction status and candidates
- Supports polling (status: processing -> completed)
- Integrates with OpenAI for OCR and condition extraction

### 3. Confirmations
**POST /v1/intake/confirmations**
- Accepts confirmed/rejected conditions
- Returns prefill answers
- Generates prefill data for interview

### 4. Dictionary Search
**GET /v1/dictionary/search?q=...**
- Searches impairment dictionary
- Returns matching conditions
- Debounced on client side

## OpenAI Integration

### OCR for Document Text Extraction
- Uses OpenAI Vision API for PDF/image text extraction
- Extracts text from uploaded documents
- Provides context for condition detection

### LLM for Condition Extraction
- Uses OpenAI GPT-4 with structured output
- Extracts medical conditions from text
- Matches against impairment dictionary
- Returns confidence scores

## Mock Services

### Impairment Dictionary
- In-memory dictionary with common medical conditions
- UK-specific condition codes
- Search functionality with fuzzy matching

### File Storage
- Temporary file storage in `uploads/` directory
- Files cleaned up after processing
- File metadata stored in memory

## Environment Variables

Create `.env` file in demo folder:
```
OPENAI_API_KEY=your-api-key-here
PORT=3000
UPLOAD_DIR=./uploads
```

