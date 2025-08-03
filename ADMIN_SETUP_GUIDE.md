# 🚀 Admin Privileges Setup Guide

You're experiencing this issue because your Firebase user doesn't have admin custom claims set. Here are **3 different ways** to solve this:

## Method 1: Using Firebase Console + Manual Script (Recommended)

### Step 1: Get Service Account Key
1. Go to [Firebase Console](https://console.firebase.google.com/project/rdjportfolio/settings/serviceaccounts)
2. Click "Generate new private key"
3. Save the file as `service-account-key.json` in your project root

### Step 2: Update the Script
Open `set-admin-claims.js` and update:
```javascript
const userEmail = 'your-actual-email@example.com'; // Replace with your Firebase user email
```

### Step 3: Install Dependencies & Run
```bash
npm install firebase-admin
node set-admin-claims.js
```

## Method 2: Using Cloud Functions (Production Ready)

### Step 1: Initialize Functions
```bash
firebase init functions
cd functions
npm install
cd ..
```

### Step 2: Deploy Functions
```bash
firebase deploy --only functions
```

### Step 3: Use Admin Setup Page
1. Navigate to: `http://localhost:4200/admin/setup`
2. Enter your user email
3. Click "Set Admin Claim"

## Method 3: Quick Test (Temporary Solution)

### Modify Auth Service for Testing
Temporarily comment out the admin check in `auth.service.ts`:

```typescript
async loginWithEmailAndPassword(email: string, password: string): Promise<void> {
  try {
    const credential = await signInWithEmailAndPassword(this.auth, email, password);
    // const tokenResult = await credential.user.getIdTokenResult();
    
    // TEMPORARY: Comment out admin check for testing
    // if (!tokenResult.claims['admin']) {
    //   await this.logout();
    //   throw new Error('Access denied. Admin privileges required.');
    // }
    
    this.router.navigate(['/admin/dashboard']);
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}
```

**⚠️ Remember to uncomment this after setting up admin claims!**

## Verification

After setting admin claims, you can verify in the browser console:
```javascript
// In browser dev tools console
firebase.auth().currentUser.getIdTokenResult().then(result => {
  console.log('Claims:', result.claims);
});
```

## Your Current Setup Status

✅ Firebase project connected
✅ Authentication working  
✅ User created in Firebase Auth
❌ Admin custom claims not set ← **This is what we need to fix**

Choose the method that works best for you and let me know if you need help with any step!
