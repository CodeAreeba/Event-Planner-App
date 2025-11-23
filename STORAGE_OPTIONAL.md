# Firebase Storage - Optional Setup

## ⚠️ Storage is Currently Disabled

Firebase Storage is **optional** for now. The app will work without it, but image uploads will be disabled.

---

## 🎯 What Works Without Storage:

✅ **User Authentication** (Login, Signup, Logout)
✅ **Firestore Database** (Services, Bookings, User Profiles)
✅ **All app features** except image uploads

❌ **What's Disabled:**
- Profile picture uploads
- Service image uploads
- Any image-related features

---

## 📝 How It Works:

The app has **built-in error handling** for Storage:

1. **`STORAGE_ENABLED` flag** in `src/firebase/upload.ts` is set to `false`
2. All image upload functions return **graceful errors** instead of crashing
3. The app continues to work normally without images

---

## 🔧 When You're Ready to Enable Storage:

### **Step 1: Enable Storage in Firebase Console**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click **Storage** in left sidebar (under "Build")
4. Click **"Get started"**
5. Click **"Next"** (keep default test mode rules)
6. Choose **SAME location** as your Firestore Database
   - Important: Must match Firestore location!
7. Click **"Done"**
8. Wait for Storage to be created

### **Step 2: Enable in Code**

Open `src/firebase/upload.ts` and change:

```typescript
// Change this line from:
const STORAGE_ENABLED = false;

// To:
const STORAGE_ENABLED = true;
```

### **Step 3: Restart App**

```bash
# Stop Expo (Ctrl+C)
# Restart with:
npx expo start --clear
```

---

## ✅ Verification:

After enabling Storage:
1. Try uploading a profile picture
2. Check Firebase Console → Storage
3. You should see the uploaded image

---

## 🛡️ Error Handling:

The app handles Storage errors gracefully:

```typescript
// Example: Upload returns error instead of crashing
const result = await uploadImage(uri, path);

if (!result.success) {
  // Shows user-friendly message
  showErrorToast(result.error);
  // App continues working
}
```

---

## 🔒 Security Rules (For Production):

When you enable Storage, update rules in Firebase Console → Storage → Rules:

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

---

## 💡 Summary:

- ✅ **App works fine without Storage**
- ✅ **No crashes or errors**
- ✅ **Enable Storage anytime when ready**
- ✅ **Just flip the `STORAGE_ENABLED` flag**

You can focus on testing authentication and database features first, then enable Storage later when needed!
