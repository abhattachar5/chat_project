# 🚀 START HERE - Baby Step Instructions

Welcome! This guide will walk you through running the demo step by step.

## Prerequisites Checklist

Before you start, make sure you have:
- [ ] Node.js installed (Version 18 or higher)
- [ ] A web browser (Chrome, Edge, Firefox, or Safari)
- [ ] (Optional) An OpenAI API key for voice features

---

## Step-by-Step Instructions

### Step 1: Check Node.js Installation

1. Open Command Prompt (Windows) or Terminal (Mac/Linux)
   - **Windows:** Press `Win + R`, type `cmd`, press Enter
   - **Mac:** Press `Cmd + Space`, type `Terminal`, press Enter
   - **Linux:** Press `Ctrl + Alt + T`

2. Check if Node.js is installed:
   ```
   node -v
   ```
   OR try:
   ```
   node --version
   ```
   
3. You should see a version number like `v18.17.0` or higher
   - **If you see "not recognized" or any error:**
     - Install Node.js from: https://nodejs.org/
     - Download the LTS version (recommended)
     - Run the installer and follow the instructions
     - **Important:** Close and reopen Command Prompt after installing
   - **If you see a version number:** Great! You can proceed

---

### Step 2: Navigate to Demo Folder

1. In your terminal, navigate to the demo folder:
   ```bash
   cd demo
   ```
   
2. Verify you're in the right folder:
   
   **On Windows Command Prompt:**
   ```
   dir
   ```
   
   **On Mac/Linux Terminal:**
   ```
   ls
   ```
   
3. You should see files like `server.js`, `package.json`, `README.md`

---

### Step 3: Install Backend Dependencies

1. Still in the demo folder, run:
   ```
   npm install
   ```
   
2. Wait for installation to complete (1-2 minutes)
   - You'll see a lot of text scrolling
   - Look for `added XXX packages` at the end
   - If you see errors, check your internet connection

---

### Step 4: Start the Backend Server

1. Still in the demo folder, run:
   ```
   npm start
   ```
   
2. You should see:
   ```
   🚀 Demo backend server running on http://localhost:3000
   📋 Health check: http://localhost:3000/health
   ```

3. **KEEP THIS TERMINAL WINDOW OPEN**
   - The server needs to keep running
   - Don't close this window!

---

### Step 5: Open a NEW Terminal Window

1. Open a **NEW** terminal/command prompt window
   - You should now have 2 terminal windows open
   - One running the backend server
   - One new one for the Angular app

2. In the new terminal, navigate to the main project folder:
   ```bash
   cd ..
   ```
   (This goes back to the chat_project folder)

3. Verify you're in the main folder:
   
   **On Windows Command Prompt:**
   ```
   dir
   ```
   
   **On Mac/Linux Terminal:**
   ```
   ls
   ```
   
4. You should see folders like `projects`, `demo`, `node_modules`

---

### Step 6: Install Angular Dependencies (If Needed)

1. If you haven't installed dependencies yet, run:
   ```
   npm install
   ```
   
2. Wait for installation (may take 2-3 minutes)
   - This only needs to be done once

---

### Step 7: Start the Angular Application

1. In the main project folder, run:
   ```
   npm start
   ```
   
2. Wait for it to compile (1-2 minutes)
   - You'll see `** Angular Live Development Server is listening on localhost:4200 **`
   
3. **KEEP THIS TERMINAL WINDOW OPEN TOO**
   - The Angular app needs to keep running
   - Don't close this window!

---

### Step 8: Open Your Web Browser

1. Open your web browser (Chrome, Edge, Firefox, or Safari)

2. Go to:
   ```
   http://localhost:3000
   ```

3. You should see the **LifeGuard Insurance** website

---

### Step 9: Configure OpenAI (Optional - for Voice Features)

**Only do this if you want to test voice features**

1. Get an OpenAI API key:
   - Go to: https://platform.openai.com/api-keys
   - Sign up or log in
   - Click "Create new secret key"
   - Copy the key (starts with `sk-...`)
   - **Important:** Save it somewhere safe - you won't see it again!

2. On the demo website:
   - Paste the key in the "OpenAI API Key" field
   - Click "Save OpenAI Key"
   - You should see a green success message

**Note:** If you don't have an API key, you can still test the demo - voice features just won't work.

---

### Step 10: Start the Chat Widget

1. On the LifeGuard Insurance website:
   - Click "Initialize Chat Widget" button
   - You should see a success message

2. Look for a **blue chat icon** in the bottom-right corner of the page
   - It's a circular button with a chat icon

3. Click the chat icon to open the widget

---

### Step 11: Complete the Interview

1. The chat widget will open
2. You'll be asked 10 questions:
   - Your full name
   - Date of birth
   - Gender
   - Height
   - Weight
   - Smoking status
   - Medical conditions
   - Annual income
   - Coverage amount
   - Insurance purpose

3. Answer each question and click "Submit" (or press Enter)

4. Watch the progress indicator as you complete questions

5. After all 10 questions, you'll receive a decision:
   - **Accept** - Your application is approved
   - **Refer** - Requires manual review
   - **Reject** - Not approved

---

## ✅ Success Checklist

You've successfully set up the demo when:
- [ ] Backend server is running on port 3000
- [ ] Angular app is running on port 4200
- [ ] Browser shows LifeGuard Insurance website
- [ ] Chat widget icon appears in bottom-right corner
- [ ] Chat widget opens when clicked
- [ ] Questions load and display correctly
- [ ] You can submit answers
- [ ] Decision appears after 10 questions

---

## 🔧 Troubleshooting

### Problem: "Cannot find module..."
**Solution:** Run `npm install` in the folder where you see the error

### Problem: "node is not recognized" or "npm is not recognized"
**Solution:**
1. Node.js is not installed or not in PATH
2. Download and install Node.js from: https://nodejs.org/
3. Choose the LTS version (Long Term Support)
4. During installation, check "Add to PATH" option
5. **Restart Command Prompt** after installation
6. Try `node -v` again

### Problem: Port 3000 already in use
**Solution:** 
1. Find what's using port 3000:
   - **Windows:** `netstat -ano | findstr :3000`
   - **Mac/Linux:** `lsof -ti:3000`
2. Stop that application or change PORT in `.env` file

### Problem: Port 4200 already in use
**Solution:**
1. Find what's using port 4200:
   - **Windows:** `netstat -ano | findstr :4200`
   - **Mac/Linux:** `lsof -ti:4200`
2. Stop that application or use a different port

### Problem: Widget doesn't appear
**Solution:**
1. Make sure Angular app is running on port 4200
2. Check browser console for errors (Press F12)
3. Try refreshing the page
4. Make sure both servers are running

### Problem: Can't connect to backend
**Solution:**
1. Make sure backend server is running (Terminal 1)
2. Check http://localhost:3000/health in your browser
3. You should see: `{"status":"ok","message":"Demo backend is running"}`

---

## 📝 Quick Reference

**Two terminal windows needed:**

**Terminal 1 (Backend):**
```
cd demo
npm install
npm start
```

**Terminal 2 (Angular App):**
```
cd ..
npm install
npm start
```

**Note:** These commands work the same in Windows Command Prompt and Mac/Linux Terminal.

**Browser:**
```
http://localhost:3000
```

---

## 🎉 You're Done!

If everything is working, you should now be able to:
- See the LifeGuard Insurance website
- Click the chat widget icon
- Answer 10 questions
- Receive a decision (Accept, Refer, or Reject)

**Need more help?** Check the `README.md` in the demo folder or the main `INTEGRATION_MANUAL.md`

---

**Last Updated:** 2025-01-12

