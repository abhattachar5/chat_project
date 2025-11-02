# 🪟 Windows Quick Start Guide

This is a Windows-specific guide with exact commands for Command Prompt (CMD).

## Step 1: Check Node.js (Windows)

1. Open **Command Prompt:**
   - Press `Windows Key + R`
   - Type `cmd`
   - Press Enter

2. Type this command:
   ```
   node -v
   ```

3. **What you should see:**
   - ✅ `v18.17.0` or similar = Node.js is installed!
   - ❌ `'node' is not recognized` = Node.js is NOT installed

4. **If Node.js is NOT installed:**
   - Go to: https://nodejs.org/
   - Click "Download" (choose LTS version)
   - Run the installer
   - **Important:** Check the box "Add to PATH" during installation
   - After installation, **close and reopen Command Prompt**
   - Try `node -v` again

---

## Step 2: Navigate to Demo Folder

1. In Command Prompt, type:
   ```
   cd demo
   ```

2. Check you're in the right place:
   ```
   dir
   ```
   You should see: `server.js`, `package.json`, `README.md`

---

## Step 3: Install Backend Dependencies

1. Type:
   ```
   npm install
   ```
   Wait 1-2 minutes. You'll see lots of text scrolling.

2. When finished, you'll see:
   ```
   added XXX packages
   ```

---

## Step 4: Start Backend Server

1. Type:
   ```
   npm start
   ```

2. You should see:
   ```
   🚀 Demo backend server running on http://localhost:3000
   ```

3. **KEEP THIS WINDOW OPEN!**
   - Don't close Command Prompt
   - The server must keep running

---

## Step 5: Open NEW Command Prompt

1. **Open a NEW Command Prompt window:**
   - Press `Windows Key + R`
   - Type `cmd`
   - Press Enter
   - (You now have 2 Command Prompt windows open)

2. In the NEW window, go back to main folder:
   ```
   cd ..
   ```
   (This goes back to `chat_project` folder)

3. Verify:
   ```
   dir
   ```
   You should see: `projects`, `demo`, `package.json`

---

## Step 6: Install Angular Dependencies

1. **First, install the project dependencies:**
   ```
   npm install
   ```
   Wait 2-3 minutes. You'll see lots of text scrolling.

2. When finished, you'll see:
   ```
   added XXX packages
   ```

3. **Important:** This step only needs to be done once. If you've already run `npm install` in this folder, you can skip to Step 7.

---

## Step 7: Start Angular App

1. Type:
   ```
   npm start
   ```

2. Wait 1-2 minutes for compilation.

3. You should see:
   ```
   ** Angular Live Development Server is listening on localhost:4200 **
   ```

4. **KEEP THIS WINDOW OPEN TOO!**

---

## Step 8: Open Browser

1. Open any web browser (Chrome, Edge, Firefox)

2. Go to:
   ```
   http://localhost:3000
   ```

3. You should see the **LifeGuard Insurance** website!

---

## Step 9: Start Chat Widget

1. On the website, click **"Initialize Chat Widget"**

2. Look for a **blue chat icon** in the bottom-right corner

3. Click the chat icon to start!

---

## Common Windows Issues

### Issue: "node is not recognized"
**Fix:**
1. Install Node.js from https://nodejs.org/
2. Restart Command Prompt
3. Try `node -v` again

### Issue: "npm is not recognized"
**Fix:**
1. Install Node.js (npm comes with it)
2. Restart Command Prompt

### Issue: Port 3000 already in use
**Fix:**
1. Find what's using it:
   ```
   netstat -ano | findstr :3000
   ```
2. See the PID number in the last column
3. Stop it:
   ```
   taskkill /PID [PID_NUMBER] /F
   ```
   (Replace `[PID_NUMBER]` with the actual number)

### Issue: Port 4200 already in use
**Fix:**
1. Find what's using it:
   ```
   netstat -ano | findstr :4200
   ```
2. Stop it using `taskkill` (see above)

### Issue: 'ng' is not recognized as an internal or external command
**Fix:**
1. You need to install project dependencies first:
   ```
   npm install
   ```
2. Wait for installation to complete (2-3 minutes)
3. Then try `npm start` again
4. **Important:** Make sure you're in the `chat_project` folder (not the `demo` folder) when running `npm install`

---

## Quick Commands Reference

| Task | Command |
|------|---------|
| Check Node.js version | `node -v` |
| Check npm version | `npm -v` |
| Navigate to folder | `cd folder_name` |
| Go back one folder | `cd ..` |
| List files | `dir` |
| Install dependencies | `npm install` |
| Start server | `npm start` |

---

## ✅ Success Checklist

- [ ] Node.js installed (`node -v` works)
- [ ] npm installed (`npm -v` works)
- [ ] Backend running on port 3000
- [ ] Angular app running on port 4200
- [ ] Browser shows LifeGuard Insurance website
- [ ] Chat widget icon appears

---

**Need help?** Check `README.md` or `START_HERE.md` for more details.

