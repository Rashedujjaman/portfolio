# 🔑 Service Account Setup Guide

Since automatic authentication isn't working, let's use a service account:

## Step 1: Download Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/project/rdjportfolio/settings/serviceaccounts)
2. Click "Generate new private key"
3. Save the file as `service-account-key.json` in your project root

## Step 2: Update Script to Use Service Account

The script below will use the service account key file:

```javascript
// service-account-admin-claims.js
const admin = require('firebase-admin');
const serviceAccount = require('./service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'rdjportfolio'
});

async function setAdminClaims() {
  try {
    const userEmail = 'reza2001july@gmail.com';
    
    const userRecord = await admin.auth().getUserByEmail(userEmail);
    await admin.auth().setCustomUserClaims(userRecord.uid, { admin: true });
    
    console.log('✅ Admin claims set successfully!');
    console.log('✅ User:', userRecord.email);
    console.log('✅ UID:', userRecord.uid);
    
    // Verify
    const updatedUser = await admin.auth().getUser(userRecord.uid);
    console.log('✅ Claims verified:', updatedUser.customClaims);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setAdminClaims();
```

## Step 3: Run the Script

```bash
node service-account-admin-claims.js
```

## Alternative: Environment Variable Method

Set the environment variable and run the original script:

### Windows:
```cmd
set GOOGLE_APPLICATION_CREDENTIALS=service-account-key.json
node set-admin-claims.js
```

### PowerShell:
```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="service-account-key.json"
node set-admin-claims.js
```

## Quick Test Alternative

If all else fails, temporarily disable admin checks:

1. Open `src/app/core/auth.service.ts`
2. Comment out the admin check (lines ~38-42)
3. Login to test your dashboard
4. Set up admin claims later

This is exactly what you need to resolve the authentication issue! 🚀
