# 🔧 Quick Fix: Set Admin Claims

Since you're getting a Cloud Functions error, here's the **fastest way** to fix this:

## Method 1: Using the Manual Script (EASIEST)

### Step 1: Install Firebase Admin
```bash
npm install firebase-admin
```

### Step 2: Login to Firebase CLI
```bash
firebase login
```

### Step 3: Update the Script
Open `set-admin-claims.js` and change this line:
```javascript
const userEmail = 'your-admin-email@example.com'; // <<<< Put your actual email here
```

### Step 4: Run the Script
```bash
node set-admin-claims.js
```

You should see:
```
✅ Admin claims set successfully!
✅ User claims verified: { admin: true }
🎉 Success! You can now login to your admin dashboard.
```

## Method 2: Firebase CLI Direct Command

Alternatively, you can use Firebase CLI directly:

```bash
# First, get your user UID from Firebase Console
# Go to Authentication > Users and copy the UID

# Then run:
firebase functions:config:set admin.uid="YOUR_USER_UID_HERE"
```

## Method 3: Temporary Bypass (For Testing Only)

If you want to test the dashboard immediately:

1. Open `src/app/core/auth.service.ts`
2. Find the `loginWithEmailAndPassword` method
3. Comment out these lines (around line 38-42):
```typescript
// if (!tokenResult.claims['admin']) {
//   await this.logout();
//   throw new Error('Access denied. Admin privileges required.');
// }
```

**⚠️ Remember to uncomment after setting admin claims!**

## Your Error Explained

The error you're seeing:
```
Http failure response for https://us-central1-rdjportfolio.cloudfunctions.net/setAdminClaimHTTP: 0 Unknown Error
```

This happens because:
- Cloud Functions aren't deployed yet (`firebase deploy --only functions`)
- Or the function URL is incorrect
- Or there are CORS issues

**👉 Use Method 1 (manual script) - it's the fastest and most reliable!**

After setting admin claims, you can login at: `http://localhost:4200/admin/login`
