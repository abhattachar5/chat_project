const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const WebSocket = require('ws');
const http = require('http');
const path = require('path');
const multer = require('multer');
const fs = require('fs').promises;
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
const PORT = 3000;

// Initialize OpenAI client
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configure multer for file uploads
const uploadDir = path.join(__dirname, 'uploads');
// Ensure uploads directory exists
fs.mkdir(uploadDir, { recursive: true }).catch(console.error);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
    ];
    const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.docx'];
    
    const fileExt = path.extname(file.originalname).toLowerCase();
    const isValidMimeType = allowedTypes.includes(file.mimetype);
    const isValidExtension = allowedExtensions.includes(fileExt);
    
    if (isValidMimeType || isValidExtension) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JPG, PNG, DOCX are allowed.'));
    }
  },
});

// In-memory storage (use database in production)
const sessions = new Map();
const transcripts = new Map();
const files = new Map(); // Store file metadata: fileId -> { sessionId, filename, status, uploadedAt }
const extractions = new Map(); // Store extraction results: sessionId -> { status, candidates, startedAt }
const confirmations = new Map(); // Store confirmations: sessionId -> { confirmed, rejected, manualAdd }

// Question flow for life insurance interview
const QUESTIONS = [
  {
    id: 'q-001',
    type: 'text',
    prompt: 'What is your full name as it appears on your official identification?',
    helpText: 'Example: John Michael Smith',
    constraints: { required: true, min: 2, max: 100, sensitive: true },
    field: 'fullName',
  },
  {
    id: 'q-002',
    type: 'date',
    prompt: 'What is your date of birth? (DD/MM/YYYY)',
    helpText: 'Example: 12/06/1980',
    constraints: { required: true, pattern: '^\\d{2}/\\d{2}/\\d{4}$' },
    field: 'dateOfBirth',
  },
  {
    id: 'q-003',
    type: 'selectOne',
    prompt: 'What is your gender?',
    options: ['Male', 'Female', 'Other', 'Prefer not to say'],
    constraints: { required: true },
    field: 'gender',
  },
  {
    id: 'q-004',
    type: 'number',
    prompt: 'What is your height in centimeters?',
    helpText: 'Example: 175',
    constraints: { required: true, min: 100, max: 250 },
    field: 'height',
  },
  {
    id: 'q-005',
    type: 'number',
    prompt: 'What is your weight in kilograms?',
    helpText: 'Example: 70',
    constraints: { required: true, min: 30, max: 300 },
    field: 'weight',
  },
  {
    id: 'q-006',
    type: 'selectOne',
    prompt: 'Do you smoke?',
    options: ['Yes', 'No'],
    constraints: { required: true },
    field: 'smoking',
  },
  {
    id: 'q-007',
    type: 'selectOne',
    prompt: 'Do you have any pre-existing medical conditions?',
    options: ['Yes', 'No'],
    constraints: { required: true },
    field: 'medicalConditions',
  },
  {
    id: 'q-008',
    type: 'number',
    prompt: 'What is your annual income in GBP?',
    helpText: 'Example: 50000',
    constraints: { required: true, min: 0 },
    field: 'annualIncome',
  },
  {
    id: 'q-009',
    type: 'number',
    prompt: 'What coverage amount (sum assured) are you seeking in GBP?',
    helpText: 'Example: 500000',
    constraints: { required: true, min: 10000, max: 10000000 },
    field: 'coverageAmount',
  },
  {
    id: 'q-010',
    type: 'selectOne',
    prompt: 'What is the primary purpose of this life insurance?',
    options: ['Family Protection', 'Mortgage Protection', 'Business Protection', 'Estate Planning', 'Other'],
    constraints: { required: true },
    field: 'purpose',
  },
];

// Business rules for decision making
function calculateDecision(answers) {
  let riskScore = 0;
  const age = calculateAge(answers.dateOfBirth);
  const bmi = calculateBMI(answers.height, answers.weight);
  const income = answers.annualIncome || 0;
  const coverage = answers.coverageAmount || 0;
  const coverageRatio = coverage / income;

  // Age-based risk (0-30: low, 31-50: medium, 51+: high)
  if (age > 50) riskScore += 30;
  else if (age > 30) riskScore += 15;
  else riskScore += 5;

  // BMI-based risk
  if (bmi > 30) riskScore += 25; // Obese
  else if (bmi > 25) riskScore += 15; // Overweight
  else if (bmi < 18.5) riskScore += 10; // Underweight

  // Smoking risk
  if (answers.smoking === 'Yes') riskScore += 40;

  // Medical conditions risk
  if (answers.medicalConditions === 'Yes') riskScore += 30;

  // Coverage ratio risk (coverage > 20x annual income is high risk)
  if (coverageRatio > 20) riskScore += 20;
  else if (coverageRatio > 15) riskScore += 10;

  // Decision logic
  if (riskScore < 30) {
    return { decision: 'accept', reason: 'Low risk profile' };
  } else if (riskScore < 70) {
    return { decision: 'refer', reason: 'Moderate risk profile - requires manual review' };
  } else {
    return { decision: 'reject', reason: 'High risk profile' };
  }
}

function calculateAge(dateOfBirth) {
  // Parse DD/MM/YYYY format
  const [day, month, year] = dateOfBirth.split('/').map(Number);
  const birthDate = new Date(year, month - 1, day);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

function calculateBMI(height, weight) {
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
}

// Day 2: Mock Impairment Dictionary
const IMPAIRMENT_DICTIONARY = [
  { code: 'ASTHMA', label: 'Asthma', synonyms: ['asthma', 'bronchial asthma', 'asthmatic'], category: 'respiratory' },
  { code: 'HYPERTENSION', label: 'Hypertension', synonyms: ['hypertension', 'high blood pressure', 'htn'], category: 'cardiovascular' },
  { code: 'DIABETES_TYPE2', label: 'Type 2 Diabetes', synonyms: ['diabetes', 'type 2 diabetes', 'diabetes mellitus'], category: 'endocrine' },
  { code: 'DIABETES_TYPE1', label: 'Type 1 Diabetes', synonyms: ['type 1 diabetes', 'insulin dependent diabetes'], category: 'endocrine' },
  { code: 'COPD', label: 'Chronic Obstructive Pulmonary Disease', synonyms: ['copd', 'chronic obstructive pulmonary disease', 'emphysema'], category: 'respiratory' },
  { code: 'DEPRESSION', label: 'Depression', synonyms: ['depression', 'major depressive disorder', 'mdd'], category: 'mental health' },
  { code: 'ANXIETY', label: 'Anxiety Disorder', synonyms: ['anxiety', 'anxiety disorder', 'generalized anxiety'], category: 'mental health' },
  { code: 'ARTHRITIS', label: 'Arthritis', synonyms: ['arthritis', 'osteoarthritis', 'rheumatoid arthritis'], category: 'musculoskeletal' },
  { code: 'OBESITY', label: 'Obesity', synonyms: ['obesity', 'obese', 'morbid obesity'], category: 'metabolic' },
  { code: 'HEART_DISEASE', label: 'Heart Disease', synonyms: ['heart disease', 'coronary heart disease', 'chd'], category: 'cardiovascular' },
  { code: 'STROKE', label: 'Stroke', synonyms: ['stroke', 'cerebrovascular accident', 'cva'], category: 'neurological' },
  { code: 'CANCER', label: 'Cancer', synonyms: ['cancer', 'malignancy', 'tumor'], category: 'oncology' },
  { code: 'EPILEPSY', label: 'Epilepsy', synonyms: ['epilepsy', 'seizure disorder', 'convulsions'], category: 'neurological' },
  { code: 'KIDNEY_DISEASE', label: 'Kidney Disease', synonyms: ['kidney disease', 'renal disease', 'ckd'], category: 'renal' },
  { code: 'LIVER_DISEASE', label: 'Liver Disease', synonyms: ['liver disease', 'hepatic disease', 'cirrhosis'], category: 'hepatic' },
];

// Day 2: Search dictionary
function searchDictionary(query) {
  if (!query || query.trim().length < 2) {
    return [];
  }
  
  const lowerQuery = query.toLowerCase().trim();
  
  return IMPAIRMENT_DICTIONARY
    .filter(item => {
      const labelMatch = item.label.toLowerCase().includes(lowerQuery);
      const synonymMatch = item.synonyms.some(syn => syn.toLowerCase().includes(lowerQuery));
      return labelMatch || synonymMatch;
    })
    .map(item => ({
      code: item.code,
      label: item.label,
      category: item.category,
    }))
    .slice(0, 10); // Limit to 10 results
}

// Day 2: Extract conditions from text using OpenAI
async function extractConditionsWithOpenAI(text, fileId) {
  if (!openai) {
    // Fallback to mock extraction if OpenAI not configured
    return mockExtractConditions(text);
  }

  try {
    const prompt = `Extract medical conditions from the following medical document text. 
Return a JSON object with a "conditions" array. Each condition should have:
- originalTerm: the exact term found in the text
- confidence: confidence score 0-1
- status: "active" or "resolved" if mentioned
- severity: "mild", "moderate", or "severe" if mentioned
- onsetDate: date in YYYY-MM-DD format if mentioned

Medical text:
${text.substring(0, 4000)}

Return format: {"conditions": [{"originalTerm": "...", "confidence": 0.8, ...}]}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a medical information extraction system. Extract medical conditions from text. Return a JSON object with a "conditions" array.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const result = JSON.parse(response.choices[0].message.content);
    const conditions = result.conditions || [];
    
    // Match against dictionary
    return matchConditionsToDictionary(conditions, fileId);
  } catch (error) {
    console.error('OpenAI extraction error:', error);
    return mockExtractConditions(text);
  }
}

// Day 2: Match extracted conditions to dictionary
function matchConditionsToDictionary(extractedConditions, fileId) {
  return extractedConditions.map((condition, index) => {
    // Find best match in dictionary
    const lowerTerm = condition.originalTerm.toLowerCase();
    let bestMatch = IMPAIRMENT_DICTIONARY.find(item => 
      item.label.toLowerCase() === lowerTerm ||
      item.synonyms.some(syn => syn.toLowerCase() === lowerTerm)
    );

    // Fuzzy matching if exact match not found
    if (!bestMatch) {
      bestMatch = IMPAIRMENT_DICTIONARY.find(item =>
        item.label.toLowerCase().includes(lowerTerm) ||
        item.synonyms.some(syn => syn.toLowerCase().includes(lowerTerm))
      );
    }

    // Default to first dictionary item if no match (for demo)
    if (!bestMatch) {
      bestMatch = IMPAIRMENT_DICTIONARY[0];
    }

    return {
      id: `candidate-${fileId}-${index}`,
      originalTerm: condition.originalTerm || 'Medical condition',
      canonical: {
        code: bestMatch.code,
        label: bestMatch.label,
      },
      confidence: condition.confidence || 0.8,
      status: condition.status || 'active',
      severity: condition.severity,
      onsetDate: condition.onsetDate,
      evidence: {
        docId: fileId,
        page: 1,
        snippet: condition.originalTerm || 'Found in document',
        rawSnippet: condition.originalTerm || 'Found in document',
      },
    };
  });
}

// Day 2: Mock extraction (fallback)
function mockExtractConditions(text) {
  const lowerText = text.toLowerCase();
  const foundConditions = [];
  
  IMPAIRMENT_DICTIONARY.forEach(item => {
    const matches = item.synonyms.some(syn => lowerText.includes(syn.toLowerCase()));
    if (matches) {
      foundConditions.push({
        id: `candidate-mock-${foundConditions.length}`,
        originalTerm: item.label,
        canonical: {
          code: item.code,
          label: item.label,
        },
        confidence: 0.75 + Math.random() * 0.2, // 0.75-0.95
        status: 'active',
        evidence: {
          docId: 'mock-file',
          page: 1,
          snippet: `Found reference to ${item.label} in document`,
          rawSnippet: `Found reference to ${item.label} in document`,
        },
      });
    }
  });

  return foundConditions.slice(0, 5); // Return max 5 for demo
}

// Day 2: Extract text from PDF/image using OpenAI Vision
async function extractTextFromFile(filePath, fileType) {
  if (!openai) {
    // Mock text extraction
    return 'Patient presents with history of asthma and hypertension. Current medications include inhaler and blood pressure medication.';
  }

  try {
    if (fileType === 'application/pdf' || fileType.includes('pdf')) {
      // For PDFs, we'd need to convert to images first
      // For demo, return mock text
      return 'Patient presents with history of asthma and hypertension. Current medications include inhaler and blood pressure medication.';
    }

    // For images, use OpenAI Vision API
    const imageData = await fs.readFile(filePath);
    const base64Image = imageData.toString('base64');

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Extract all text from this medical document. Return only the extracted text without any formatting or explanation.' },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 2000,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI Vision error:', error);
    return 'Patient presents with history of asthma and hypertension. Current medications include inhaler and blood pressure medication.';
  }
}

// API Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Demo backend is running' });
});

// Create session
app.post('/v1/sessions', (req, res) => {
  const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const session = {
    id: sessionId,
    status: 'active',
    progress: 0,
    createdAt: new Date().toISOString(),
    tenantId: req.body.tenantId || 'demo-tenant',
    answers: {},
    currentQuestionIndex: 0,
  };

  sessions.set(sessionId, session);
  transcripts.set(sessionId, []);

  // Add initial system message
  transcripts.get(sessionId).push({
    role: 'system',
    text: 'Session started',
    timestamp: new Date().toISOString(),
  });

  res.status(201).json(session);
});

// Get session
app.get('/v1/sessions/:sessionId', (req, res) => {
  const session = sessions.get(req.params.sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  res.json(session);
});

// Get next question
app.get('/v1/sessions/:sessionId/next-question', (req, res) => {
  const session = sessions.get(req.params.sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  const questionIndex = session.currentQuestionIndex;
  if (questionIndex >= QUESTIONS.length) {
    // All questions answered - calculate decision
    const decision = calculateDecision(session.answers);
    session.status = 'completed';
    session.decision = decision.decision;
    session.decisionReason = decision.reason;
    session.progress = 1.0;

    return res.json({
      question: null,
      isTerminal: true,
      progress: 1.0,
      decision: decision.decision,
      decisionReason: decision.reason,
    });
  }

  // Day 2: Check for prefill context
  const question = getNextQuestionWithPrefill(req.params.sessionId, questionIndex) || QUESTIONS[questionIndex];
  const progress = (questionIndex + 1) / (QUESTIONS.length + 1); // +1 for completion

  res.json({
    question: question,
    isTerminal: false,
    progress: progress,
    prefillContext: question.prefillContext, // Day 2: Include prefill context
  });
});

// Submit answer
app.post('/v1/sessions/:sessionId/answers', (req, res) => {
  const session = sessions.get(req.params.sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  // Day 2: Handle prefill answers
  const { questionId, answer: answerValue, inputMode, meta } = req.body;
  
  // Check if this is a prefill answer (should skip to next question that isn't already answered)
  if (meta?.source === 'prefill' && answerValue && Array.isArray(answerValue)) {
    // Store prefilled answer
    session.answers['medicalConditions'] = answerValue.join(', ');
    
    // If medical conditions question, mark as answered and move forward
    if (questionId === 'q-007') {
      session.currentQuestionIndex = Math.max(session.currentQuestionIndex, 7); // q-007 is index 6
    }
  }

  const question = QUESTIONS.find((q) => q.id === questionId);
  if (!question) {
    return res.status(400).json({ error: 'Invalid question ID' });
  }

  // Validation
  if (question.constraints?.required && (!answerValue || answerValue === '')) {
    return res.status(422).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'This field is required',
        fieldErrors: [{ questionId, message: 'This field is required' }],
      },
    });
  }

  // Store answer
  session.answers[question.field] = answerValue;
  session.currentQuestionIndex += 1;
  session.progress = (session.currentQuestionIndex) / (QUESTIONS.length + 1);

  // Add to transcript
  const transcript = transcripts.get(req.params.sessionId);
  transcript.push({
    role: 'user',
    text: String(Array.isArray(answerValue) ? answerValue.join(', ') : answerValue),
    redacted: question.constraints?.sensitive || false,
    timestamp: new Date().toISOString(),
    meta: meta || undefined,
  });

  // Add assistant message to transcript
  if (session.currentQuestionIndex < QUESTIONS.length) {
    const nextQuestion = QUESTIONS[session.currentQuestionIndex];
    transcript.push({
      role: 'assistant',
      text: nextQuestion.prompt,
      timestamp: new Date().toISOString(),
    });
  }

  // Get next question or decision
  if (session.currentQuestionIndex >= QUESTIONS.length) {
    // All questions answered
    const decision = calculateDecision(session.answers);
    session.status = 'completed';
    session.decision = decision.decision;
    session.decisionReason = decision.reason;
    session.progress = 1.0;

    // Add decision to transcript
    transcript.push({
      role: 'rules',
      text: `Decision: ${decision.decision.toUpperCase()}. Reason: ${decision.reason}`,
      timestamp: new Date().toISOString(),
    });

    res.json({
      accepted: true,
      nextQuestion: {
        question: null,
        isTerminal: true,
        progress: 1.0,
        decision: decision.decision,
        decisionReason: decision.reason,
      },
    });
  } else {
    // Return next question (with prefill context if applicable)
    const nextQuestion = getNextQuestionWithPrefill(req.params.sessionId, session.currentQuestionIndex) || QUESTIONS[session.currentQuestionIndex];
    const progress = (session.currentQuestionIndex + 1) / (QUESTIONS.length + 1);

    res.json({
      accepted: true,
      nextQuestion: {
        question: nextQuestion,
        isTerminal: false,
        progress: progress,
        prefillContext: nextQuestion.prefillContext, // Day 2: Include prefill context
      },
    });
  }
});

// Get transcript
app.get('/v1/sessions/:sessionId/transcript', (req, res) => {
  const transcript = transcripts.get(req.params.sessionId);
  if (!transcript) {
    return res.status(404).json({ error: 'Transcript not found' });
  }

  res.json({
    sessionId: req.params.sessionId,
    items: transcript,
  });
});

// End session
app.delete('/v1/sessions/:sessionId', (req, res) => {
  const session = sessions.get(req.params.sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  session.status = 'completed';
  res.json({ id: session.id, status: 'completed' });
});

// ============================================
// Day 2: Medical Report Intake Endpoints
// ============================================

// File upload
app.post('/v1/intake/files', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'failed',
        message: 'No file uploaded',
      });
    }

    const sessionId = req.body.sessionId || req.headers['x-session-id'];
    if (!sessionId) {
      // Clean up uploaded file
      await fs.unlink(req.file.path).catch(() => {});
      return res.status(400).json({
        status: 'failed',
        message: 'Session ID required',
      });
    }

    const fileId = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Store file metadata
    files.set(fileId, {
      sessionId,
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      status: 'uploaded',
      uploadedAt: new Date().toISOString(),
    });

    // Initialize extraction for this session
    if (!extractions.has(sessionId)) {
      extractions.set(sessionId, {
        status: 'processing',
        candidates: [],
        startedAt: new Date().toISOString(),
      });
    }

    // Start extraction process asynchronously
    processExtraction(fileId, sessionId, req.file.path, req.file.mimetype).catch(error => {
      console.error('Extraction error:', error);
    });

    res.status(200).json({
      fileId,
      status: 'uploaded',
      message: 'File uploaded successfully',
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      status: 'failed',
      message: error.message || 'Upload failed',
    });
  }
});

// Process extraction asynchronously
async function processExtraction(fileId, sessionId, filePath, mimetype) {
  try {
    const fileMeta = files.get(fileId);
    if (!fileMeta) return;

    // Update file status
    fileMeta.status = 'scanning';
    
    // Extract text from file
    const extractedText = await extractTextFromFile(filePath, mimetype);
    
    // Extract conditions using OpenAI
    const candidates = await extractConditionsWithOpenAI(extractedText, fileId);
    
    // Update extraction status
    const extraction = extractions.get(sessionId) || { status: 'processing', candidates: [] };
    extraction.candidates = [...extraction.candidates, ...candidates];
    extraction.status = 'completed';
    extraction.completedAt = new Date().toISOString();
    extractions.set(sessionId, extraction);
    
    // Update file status
    fileMeta.status = 'extracted';
    fileMeta.extractedAt = new Date().toISOString();
    
    console.log(`Extraction completed for ${fileId}: ${candidates.length} conditions found`);
  } catch (error) {
    console.error('Extraction processing error:', error);
    const extraction = extractions.get(sessionId);
    if (extraction) {
      extraction.status = 'failed';
      extraction.error = error.message;
    }
  }
}

// Get extraction summary
app.get('/v1/intake/summary', (req, res) => {
  const sessionId = req.query.sessionId;
  if (!sessionId) {
    return res.status(400).json({
      error: 'Session ID required',
    });
  }

  const extraction = extractions.get(sessionId);
  if (!extraction) {
    return res.json({
      sessionId,
      status: 'pending',
      extractionStatus: 'pending',
      candidates: [],
    });
  }

  res.json({
    sessionId,
    status: extraction.status === 'completed' ? 'completed' : 'processing',
    extractionStatus: extraction.status,
    candidates: extraction.candidates || [],
    message: extraction.status === 'failed' ? extraction.error : undefined,
  });
});

// Submit confirmations
app.post('/v1/intake/confirmations', (req, res) => {
  const { sessionId, confirmed, rejected, manualAdd } = req.body;

  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID required' });
  }

  const extraction = extractions.get(sessionId);
  if (!extraction) {
    return res.status(404).json({ error: 'Extraction not found for session' });
  }

  // Store confirmations
  confirmations.set(sessionId, {
    confirmed: confirmed || [],
    rejected: rejected || [],
    manualAdd: manualAdd || [],
    submittedAt: new Date().toISOString(),
  });

  // Generate prefill answers
  const prefillAnswers = generatePrefillAnswers(sessionId, confirmed || [], manualAdd || []);

  res.json({
    sessionId,
    confirmedCount: confirmed?.length || 0,
    rejectedCount: rejected?.length || 0,
    prefill: prefillAnswers,
  });
});

// Generate prefill answers from confirmed conditions
function generatePrefillAnswers(sessionId, confirmed, manualAdd) {
  const conditions = [];
  
  // Add confirmed conditions
  confirmed.forEach(conf => {
    const candidate = extractions.get(sessionId)?.candidates?.find(c => c.id === conf.candidateId);
    if (candidate) {
      conditions.push(candidate.canonical.label);
    }
  });

  // Add manually added conditions
  manualAdd?.forEach(item => {
    conditions.push(item.label);
  });

  // Return prefill answer for medical conditions question
  return [{
    questionId: 'q-007', // Medical conditions question
    answer: conditions,
    source: 'prefill',
    evidenceRefs: confirmed.map(c => {
      const candidate = extractions.get(sessionId)?.candidates?.find(cand => cand.id === c.candidateId);
      return candidate?.evidence?.docId ? `${candidate.evidence.docId}:${candidate.evidence.page || 1}` : '';
    }).filter(Boolean),
  }];
}

// Dictionary search
app.get('/v1/dictionary/search', (req, res) => {
  const query = req.query.q;
  
  if (!query || query.trim().length < 2) {
    return res.json([]);
  }

  const results = searchDictionary(query);
  res.json(results);
});

// Helper: Update next question to include prefill context
function getNextQuestionWithPrefill(sessionId, questionIndex) {
  const question = QUESTIONS[questionIndex];
  if (!question) return null;

  const confirmation = confirmations.get(sessionId);
  if (question.id === 'q-007' && confirmation) {
    // Medical conditions question - add adaptive prompt
    const confirmedLabels = [
      ...(confirmation.confirmed?.map(c => {
        const extraction = extractions.get(sessionId);
        const candidate = extraction?.candidates?.find(cand => cand.id === c.candidateId);
        return candidate?.canonical.label;
      }).filter(Boolean) || []),
      ...(confirmation.manualAdd?.map(item => item.label) || []),
    ];

    if (confirmedLabels.length > 0) {
      return {
        ...question,
        prompt: `We noted ${confirmedLabels.join(', ')} from your documents. Please confirm this and add any other conditions you'd like to declare.`,
        prefillContext: {
          confirmedConditions: confirmedLabels,
          adaptivePrompt: `We noted ${confirmedLabels.join(', ')} from your documents. Please confirm this and add any other conditions you'd like to declare.`,
        },
      };
    }
  }

  return question;
}

// WebSocket for ASR (simulated - OpenAI integration)
let wsServer = null;

// Start HTTP server
const server = http.createServer(app);

// WebSocket server
wsServer = new WebSocket.Server({ server, path: '/v1/asr' });

wsServer.on('connection', (ws, req) => {
  console.log('ASR WebSocket connected');

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      
      if (data.type === 'audio_chunk') {
        // In a real implementation, you would:
        // 1. Decode base64 audio
        // 2. Send to OpenAI Whisper API
        // 3. Return transcript
        
        // For demo purposes, simulate transcript
        if (Math.random() > 0.7) {
          // Simulate partial transcript
          ws.send(JSON.stringify({
            type: 'partial_transcript',
            text: 'Please state your full name',
            confidence: 0.95,
          }));
        }
      }
    } catch (error) {
      console.error('WebSocket error:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Error processing audio',
      }));
    }
  });

  ws.on('close', () => {
    console.log('ASR WebSocket disconnected');
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`\n🚀 Demo backend server running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health\n`);
  console.log('📝 Available endpoints (Day 1):');
  console.log('  POST   /v1/sessions');
  console.log('  GET    /v1/sessions/:id');
  console.log('  GET    /v1/sessions/:id/next-question');
  console.log('  POST   /v1/sessions/:id/answers');
  console.log('  GET    /v1/sessions/:id/transcript');
  console.log('  DELETE /v1/sessions/:id');
  console.log('  WS     /v1/asr (WebSocket)\n');
  console.log('📝 Available endpoints (Day 2):');
  console.log('  POST   /v1/intake/files (multipart/form-data)');
  console.log('  GET    /v1/intake/summary?sessionId=...');
  console.log('  POST   /v1/intake/confirmations');
  console.log('  GET    /v1/dictionary/search?q=...\n');
  console.log(`🤖 OpenAI: ${openai ? '✅ Configured' : '❌ Not configured (using mock)'}`);
  if (openai) {
    console.log('   Using OpenAI for OCR and condition extraction');
  } else {
    console.log('   Using mock extraction (set OPENAI_API_KEY in .env for real extraction)');
  }
  console.log('\n🌐 Open your browser to: http://localhost:3000\n');
  console.log('💡 Make sure Angular app is running on port 4200 for the widget!\n');
});

