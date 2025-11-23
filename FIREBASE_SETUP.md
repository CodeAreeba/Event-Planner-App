# Firebase Setup Guide for Event Planner App

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter project name: `event-planner-app` (or any name you prefer)
4. Click **Continue**
5. **Disable Google Analytics** (optional, you can enable it later)
6. Click **Create project**
7. Wait for the project to be created, then click **Continue**

---

## Step 2: Register Your App

1. In the Firebase Console, click the **Web icon** (`</>`) to add a web app
2. Enter app nickname: `Event Planner Web`
3. **Do NOT check** "Also set up Firebase Hosting"
4. Click **Register app**
5. You'll see your Firebase configuration - **COPY THIS**, you'll need it soon
6. Click **Continue to console**

---

## Step 3: Enable Authentication

1. In the left sidebar, click **Build** → **Authentication**
2. Click **Get started**
3. Click on **Email/Password** in the Sign-in method tab
4. **Enable** the first option (Email/Password)
5. Click **Save**

---

## Step 4: Create Firestore Database

1. In the left sidebar, click **Build** → **Firestore Database**
2. Click **Create database**
3. Select **Start in test mode** (for development)
   - Test mode allows read/write access for 30 days
   - We'll add security rules later
4. Choose your Cloud Firestore location (select closest to your users)
5. Click **Enable**
6. Wait for the database to be created

---

## Step 5: Enable Storage

1. In the left sidebar, click **Build** → **Storage**
2. Click **Get started**
3. Click **Next** (keep default security rules for now)
4. Choose your storage location (same as Firestore)
5. Click **Done**

---

## Step 6: Get Your Firebase Configuration

1. Click the **gear icon** (⚙️) next to "Project Overview" in the sidebar
2. Click **Project settings**
3. Scroll down to **"Your apps"** section
4. You should see your web app
5. Under **"SDK setup and configuration"**, select **"Config"**
6. Copy the `firebaseConfig` object

It should look like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "event-planner-app-xxxxx.firebaseapp.com",
  projectId: "event-planner-app-xxxxx",
  storageBucket: "event-planner-app-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:xxxxxxxxxxxxxx"
};
```

---

## Step 7: Update Your App Configuration

1. Open `src/firebase/config.ts` in your project
2. Replace the placeholder values with your actual Firebase config:

```typescript
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Replace with YOUR Firebase project configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase:', error);
  throw error;
}

export { app, auth, db, storage };
```

---

## Step 8: Install Firebase Dependencies

Run this command in your project directory:

```bash
npm install firebase
```

---

## Step 9: Test Your Setup

1. Save all files
2. Restart your Expo server:
   ```bash
   npx expo start --clear
   ```
3. Open the app on your device/emulator
4. Try to sign up with a test account
5. Check Firebase Console → Authentication → Users to see if the user was created

---

## Step 10: Set Up Firestore Security Rules (Production)

When you're ready to deploy, update your Firestore rules:

1. Go to **Firestore Database** → **Rules** tab
2. Replace with these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Services collection
    match /services/{serviceId} {
      allow read: if true; // Anyone can read services
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        request.auth.uid == resource.data.providerId;
    }
    
    // Bookings collection
    match /bookings/{bookingId} {
      allow read: if request.auth != null && 
        (request.auth.uid == resource.data.userId || 
         request.auth.uid == resource.data.providerId);
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        (request.auth.uid == resource.data.userId || 
         request.auth.uid == resource.data.providerId);
      allow delete: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
  }
}
```

3. Click **Publish**

---

## Step 11: Set Up Storage Security Rules (Production)

1. Go to **Storage** → **Rules** tab
2. Replace with these rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Profile images
    match /profiles/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Service images
    match /services/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. Click **Publish**

---

## Troubleshooting

### Error: "Firebase: Error (auth/configuration-not-found)"
- Make sure you've copied the correct Firebase config
- Check that all fields are filled in `config.ts`

### Error: "Firebase: Error (auth/api-key-not-valid)"
- Your API key is incorrect
- Go back to Firebase Console and copy the config again

### Error: "Firebase: Error (auth/network-request-failed)"
- Check your internet connection
- Make sure Firebase project is active

### Users not appearing in Firebase Console
- Check that you're looking at the correct project
- Make sure Authentication is enabled
- Check browser console for errors

---

## ✅ Verification Checklist

- [ ] Firebase project created
- [ ] Web app registered
- [ ] Email/Password authentication enabled
- [ ] Firestore database created
- [ ] Storage enabled
- [ ] Firebase config copied to `src/firebase/config.ts`
- [ ] `npm install firebase` completed
- [ ] App restarts without errors
- [ ] Test signup creates user in Firebase Console

---

## Next Steps After Setup

1. **Test Authentication**: Try signing up and logging in
2. **Add Test Data**: Create some test services in Firestore manually
3. **Test Image Upload**: Try uploading a profile picture
4. **Implement Remaining Screens**: Complete the placeholder screens

---

## Need Help?

If you encounter any issues:
1. Check the Firebase Console for error messages
2. Look at the browser/app console for detailed errors
3. Verify all configuration values are correct
4. Make sure you're using the web SDK (not React Native Firebase)
