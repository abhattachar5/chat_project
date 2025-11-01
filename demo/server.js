const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const WebSocket = require('ws');
const http = require('http');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory storage (use database in production)
const sessions = new Map();
const transcripts = new Map();

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

  const question = QUESTIONS[questionIndex];
  const progress = (questionIndex + 1) / (QUESTIONS.length + 1); // +1 for completion

  res.json({
    question: question,
    isTerminal: false,
    progress: progress,
  });
});

// Submit answer
app.post('/v1/sessions/:sessionId/answers', (req, res) => {
  const session = sessions.get(req.params.sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  const { questionId, answer } = req.body;
  const question = QUESTIONS.find((q) => q.id === questionId);
  if (!question) {
    return res.status(400).json({ error: 'Invalid question ID' });
  }

  // Validation
  if (question.constraints?.required && (!answer || answer === '')) {
    return res.status(422).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'This field is required',
        fieldErrors: [{ questionId, message: 'This field is required' }],
      },
    });
  }

  // Store answer
  session.answers[question.field] = answer;
  session.currentQuestionIndex += 1;
  session.progress = (session.currentQuestionIndex) / (QUESTIONS.length + 1);

  // Add to transcript
  const transcript = transcripts.get(req.params.sessionId);
  transcript.push({
    role: 'user',
    text: String(answer),
    redacted: question.constraints?.sensitive || false,
    timestamp: new Date().toISOString(),
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
    // Return next question
    const nextQuestion = QUESTIONS[session.currentQuestionIndex];
    const progress = (session.currentQuestionIndex + 1) / (QUESTIONS.length + 1);

    res.json({
      accepted: true,
      nextQuestion: {
        question: nextQuestion,
        isTerminal: false,
        progress: progress,
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
  console.log('📝 Available endpoints:');
  console.log('  POST   /v1/sessions');
  console.log('  GET    /v1/sessions/:id');
  console.log('  GET    /v1/sessions/:id/next-question');
  console.log('  POST   /v1/sessions/:id/answers');
  console.log('  GET    /v1/sessions/:id/transcript');
  console.log('  DELETE /v1/sessions/:id');
  console.log('  WS     /v1/asr (WebSocket)\n');
  console.log('🌐 Open your browser to: http://localhost:3000\n');
  console.log('💡 Make sure Angular app is running on port 4200 for the widget!\n');
});

