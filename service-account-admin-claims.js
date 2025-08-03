// Service account version of admin claims script
const admin = require('firebase-admin');

// This script uses a service account key file
// Download from: https://console.firebase.google.com/project/rdjportfolio/settings/serviceaccounts

try {
  const serviceAccount = require('./service-account-key.json');
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'rdjportfolio'
  });
  
  console.log('✅ Service account initialized successfully');
} catch (error) {
  console.error('❌ Could not load service account key.');
  console.log('📋 To fix this:');
  console.log('1. Go to: https://console.firebase.google.com/project/rdjportfolio/settings/serviceaccounts');
  console.log('2. Click "Generate new private key"');
  console.log('3. Save as "service-account-key.json" in this folder');
  console.log('4. Run this script again');
  process.exit(1);
}

async function setAdminClaims() {
  try {
    const userEmail = 'reza2001july@gmail.com';
    
    console.log('🔍 Looking up user:', userEmail);
    
    const userRecord = await admin.auth().getUserByEmail(userEmail);
    console.log('✅ Found user:', userRecord.email, 'UID:', userRecord.uid);
    
    await admin.auth().setCustomUserClaims(userRecord.uid, { admin: true });
    console.log('✅ Admin claims set successfully!');
    
    // Verify the claims
    const updatedUser = await admin.auth().getUser(userRecord.uid);
    console.log('✅ Claims verified:', updatedUser.customClaims);
    
    console.log('\n🎉 Success! You can now login to your admin dashboard.');
    console.log('🔗 Navigate to: http://localhost:4200/admin/login');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting admin claims:', error.message);
    
    if (error.code === 'auth/user-not-found') {
      console.log('\n💡 User not found. Make sure:');
      console.log('1. You created a user in Firebase Auth console');
      console.log('2. The email in this script is correct');
    }
    
    process.exit(1);
  }
}

setAdminClaims();
