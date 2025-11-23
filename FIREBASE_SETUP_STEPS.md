# 🔥 Firebase Setup Guide - Step by Step

## 📋 **Step 1: Add Web App to Firebase**

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project** (or create new one if you haven't)
3. **Click the Web icon** `</>` (next to "Add app")
   - Location: Project Overview page, under "Get started by adding Firebase to your app"
4. **Register app**:
   - App nickname: `Event Planner Web`
   - ❌ **DO NOT** check "Also set up Firebase Hosting"
   - Click **"Register app"**
5. **Copy the config** - You'll see something like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:xxxxxxxxxxxxxx"
};
```

6. **COPY THESE VALUES** - You'll paste them in the `.env` file next
7. Click **"Continue to console"**

---

## 🔐 **Step 2: Paste Config in .env File**

1. **Open** `.env` file in your project root
2. **Replace the placeholder values** with your actual Firebase config:

```env
# Example - Replace with YOUR actual values:
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:xxxxxxxxxxxxxx
```

### 📝 **Format Guide:**
- ✅ **NO quotes** around values
- ✅ **NO spaces** around the `=` sign
- ✅ Each value on a **new line**
- ✅ Use the **exact variable names** shown above
- ✅ Must start with `EXPO_PUBLIC_` for Expo to read them

### ❌ **Common Mistakes:**
```env
# WRONG - Has quotes
EXPO_PUBLIC_FIREBASE_API_KEY="AIzaSyXXXX"

# WRONG - Has spaces
EXPO_PUBLIC_FIREBASE_API_KEY = AIzaSyXXXX

# WRONG - Missing EXPO_PUBLIC_ prefix
FIREBASE_API_KEY=AIzaSyXXXX

# CORRECT ✅
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXX
```

3. **Save the file**

---

## 🔑 **Step 3: Enable Authentication (Email/Password)**

1. **In Firebase Console**, click **"Authentication"** in left sidebar
   - Under "Build" section
2. Click **"Get started"** (if first time)
3. Click on **"Sign-in method"** tab (at the top)
4. Find **"Email/Password"** in the list
5. Click on it to expand
6. **Toggle ON** the first switch (Email/Password)
   - ❌ Leave "Email link (passwordless sign-in)" **OFF**
7. Click **"Save"**

✅ **Verification**: You should see "Email/Password" with status "Enabled"

---

## 📊 **Step 4: Create Firestore Database**

1. **In Firebase Console**, click **"Firestore Database"** in left sidebar
   - Under "Build" section
2. Click **"Create database"**
3. **Select mode**: Choose **"Start in test mode"**
   - ⚠️ This allows read/write for 30 days (good for development)
   - We'll add security rules later
4. Click **"Next"**
5. **Choose location**: Select closest to your users
   - Example: `asia-south1` (Mumbai) for India
   - Example: `us-central1` for USA
6. Click **"Enable"**
7. **Wait** for database to be created (30-60 seconds)

✅ **Verification**: You should see an empty Firestore Database with "Start collection" button

---

## 📁 **Step 5: Enable Storage**

1. **In Firebase Console**, click **"Storage"** in left sidebar
   - Under "Build" section
2. Click **"Get started"**
3. **Security rules**: Click **"Next"** (keep default test mode rules)
4. **Choose location**: Use the **SAME location** as Firestore
   - Must match your Firestore location!
5. Click **"Done"**
6. **Wait** for storage to be created (10-20 seconds)

✅ **Verification**: You should see Storage bucket with "Upload file" button

---

## 🔧 **Step 6: Restart Your App**

After updating the `.env` file, you MUST restart Expo:

1. **Stop the current server** (Press `Ctrl+C` in terminal)
2. **Clear cache and restart**:
```bash
npx expo start --clear
```

3. **Wait for bundling** to complete
4. **Open app** on your device/emulator

---

## ✅ **Step 7: Test Your Setup**

1. **Open the app**
2. **Click "Sign Up"**
3. **Enter test details**:
   - Name: Test User
   - Email: test@example.com
   - Password: Test123!
   - Confirm Password: Test123!
4. **Click "Sign Up"**

### **Expected Result:**
- ✅ Success toast: "Account created successfully!"
- ✅ App navigates to Home screen
- ✅ In Firebase Console → Authentication → Users, you see the new user

### **If you see errors:**
- ❌ "Firebase configuration is not set up" → Check `.env` file format
- ❌ "Network error" → Check internet connection
- ❌ "Invalid API key" → Copy config from Firebase Console again

---

## 🔒 **Security Notes**

### **Important:**
- ✅ `.env` file is in `.gitignore` (won't be committed to Git)
- ✅ Never share your `.env` file publicly
- ✅ Never commit `.env` to GitHub/GitLab
- ✅ Each team member needs their own `.env` file

### **For Production:**
- Update Firestore rules (see FIREBASE_SETUP.md)
- Update Storage rules (see FIREBASE_SETUP.md)
- Enable App Check for extra security

---

## 📱 **Your .env File Should Look Like This:**

```env
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyC1234567890abcdefghijklmnopqr
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=event-planner-12345.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=event-planner-12345
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=event-planner-12345.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abc123def456ghi789
```

---

## 🆘 **Troubleshooting**

### **Error: "process.env.EXPO_PUBLIC_FIREBASE_API_KEY is undefined"**
**Solution:**
1. Make sure `.env` file is in project **root directory**
2. Restart Expo with `npx expo start --clear`
3. Check variable names have `EXPO_PUBLIC_` prefix

### **Error: "Firebase: Error (auth/invalid-api-key)"**
**Solution:**
1. Go to Firebase Console → Project Settings
2. Copy the config again
3. Paste in `.env` file
4. Restart Expo

### **Error: "Firebase: Error (auth/operation-not-allowed)"**
**Solution:**
1. Go to Firebase Console → Authentication
2. Make sure Email/Password is **Enabled**

---

## ✅ **Checklist**

- [ ] Created Firebase project
- [ ] Added Web app to Firebase
- [ ] Copied Firebase config
- [ ] Pasted config in `.env` file (correct format)
- [ ] Enabled Email/Password authentication
- [ ] Created Firestore Database (test mode)
- [ ] Enabled Storage
- [ ] Restarted Expo with `--clear` flag
- [ ] Tested signup - user appears in Firebase Console

---

**Once all steps are complete, your app is ready to use! 🎉**
