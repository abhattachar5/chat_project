# Insurance Chat Widget - Demo Application

This demo simulates a life insurer's website with the chat widget embedded. It includes a mock backend with business rules that asks 10 questions and provides a decision (Accept, Refer, or Reject).

## 🚀 Baby Step Instructions

### Step 1: Install Node.js
1. Go to https://nodejs.org/
2. Download and install Node.js (Version 18 or higher)
3. Open a new terminal/command prompt
4. Verify installation:
   ```bash
   node --version
   npm --version
   ```
   You should see version numbers (e.g., v18.17.0)

### Step 2: Navigate to Demo Folder
1. Open terminal/command prompt
2. Navigate to the demo folder:
   ```bash
   cd demo
   ```

### Step 3: Install Dependencies
1. In the demo folder, run:
   ```bash
   npm install
   ```
2. Wait for installation to complete (may take 1-2 minutes)

### Step 4: Start the Backend Server
1. In the demo folder, run:
   ```bash
   npm start
   ```
2. You should see:
   ```
   🚀 Demo backend server running on http://localhost:3000
   ```
3. Keep this terminal window open

### Step 5: Open a New Terminal for Angular App
1. Open a **NEW** terminal/command prompt window
2. Navigate to the main project folder:
   ```bash
   cd ..
   ```
   (This goes back to the chat_project folder)

### Step 6: Start the Angular Application
1. Make sure you're in the chat_project folder (not demo folder)
2. Install dependencies (if not done already):
   ```bash
   npm install
   ```
3. Start the Angular app:
   ```bash
   npm start
   ```
4. Wait for it to compile (may take 1-2 minutes)
5. You should see:
   ```
   ** Angular Live Development Server is listening on localhost:4200 **
   ```
6. Keep this terminal window open

### Step 7: Open the Demo Website
1. Open your web browser (Chrome, Edge, Firefox, or Safari)
2. Go to:
   ```
   http://localhost:3000
   ```
3. You should see the LifeGuard Insurance website

### Step 8: Configure OpenAI (Optional)
1. If you want voice features, get an OpenAI API key:
   - Go to https://platform.openai.com/api-keys
   - Sign up or log in
   - Create a new API key
   - Copy the key (starts with `sk-...`)
2. On the demo website, paste the key in the "OpenAI API Key" field
3. Click "Save Configuration"

### Step 9: Initialize the Chat Widget
1. On the demo website, click "Initialize Chat Widget"
2. You should see a green success message
3. Look for a blue chat icon in the bottom-right corner

### Step 10: Start the Interview
1. Click the blue chat icon (bottom-right corner)
2. The chat widget will open
3. Start answering the 10 questions
4. After all questions, you'll receive a decision (Accept, Refer, or Reject)

## 📋 What You Should See

### Terminal 1 (Backend Server):
```
🚀 Demo backend server running on http://localhost:3000
📋 Health check: http://localhost:3000/health
```

### Terminal 2 (Angular App):
```
** Angular Live Development Server is listening on localhost:4200 **
```

### Browser:
- LifeGuard Insurance website at http://localhost:3000
- Chat widget (blue icon) in bottom-right corner
- Chat opens when you click the icon

## 🔧 Troubleshooting

### Problem: "Cannot find module 'express'"
**Solution:** Run `npm install` in the demo folder

### Problem: Port 3000 already in use
**Solution:** Change PORT in `.env` file or stop the application using port 3000

### Problem: Port 4200 already in use
**Solution:** 
```bash
# Windows
netstat -ano | findstr :4200
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:4200 | xargs kill
```

### Problem: Widget doesn't appear
**Solution:** 
1. Make sure Angular app is running on port 4200
2. Check browser console for errors (F12)
3. Try refreshing the page

### Problem: Backend server won't start
**Solution:** 
1. Check if port 3000 is available
2. Verify Node.js is installed: `node --version`
3. Reinstall dependencies: `npm install`

## 📝 Question Flow

The demo asks 10 questions:
1. Full name
2. Date of birth
3. Gender
4. Height (cm)
5. Weight (kg)
6. Smoking status
7. Medical conditions
8. Annual income
9. Coverage amount
10. Insurance purpose

After all questions, you'll get a decision based on risk assessment:
- **Accept**: Low risk profile
- **Refer**: Moderate risk (requires manual review)
- **Reject**: High risk profile

## 🔑 OpenAI API Key (Optional)

If you want to test voice features:
1. Get API key from https://platform.openai.com/api-keys
2. Add it in the demo website configuration
3. Voice features will be enabled

**Note:** The API key is stored locally in your browser and only sent to OpenAI for transcription.

## 📁 Folder Structure

```
demo/
├── server.js              # Backend server with business rules
├── package.json           # Backend dependencies
├── .env                   # Environment variables (create from .env.example)
├── .env.example          # Example environment file
├── README.md             # This file
└── public/
    └── index.html        # Demo insurer website
```

## 🎯 Quick Commands Reference

```bash
# Terminal 1: Start backend
cd demo
npm install
npm start

# Terminal 2: Start Angular app
cd .. (or cd chat_project)
npm install
npm start

# Then open browser to:
http://localhost:3000
```

## ✅ Success Checklist

- [ ] Node.js installed (v18+)
- [ ] Dependencies installed in demo folder
- [ ] Dependencies installed in main project folder
- [ ] Backend server running on port 3000
- [ ] Angular app running on port 4200
- [ ] Browser shows LifeGuard Insurance website
- [ ] Chat widget icon appears
- [ ] Widget opens when clicked
- [ ] Questions load correctly
- [ ] Can submit answers
- [ ] Decision appears after 10 questions

---

**Need Help?** Check the troubleshooting section or review the main INTEGRATION_MANUAL.md

