// Manual script to set admin claims
// Run this in Node.js environment with Firebase Admin SDK

const admin = require('firebase-admin');

// Initialize Firebase Admin with default credentials from Firebase CLI
admin.initializeApp({
  projectId: 'rdjportfolio'
});

async function setAdminClaims() {
  try {
    // Replace with the email of your Firebase user
    const userEmail = 'reza2001july@gmail.com';
    
    console.log('🔍 Looking up user with email:', userEmail);
    
    // Get user by email
    const userRecord = await admin.auth().getUserByEmail(userEmail);
    console.log('✅ Found user:', userRecord.uid, userRecord.email);
    
    // Set admin custom claims
    await admin.auth().setCustomUserClaims(userRecord.uid, { admin: true });
    console.log('✅ Admin claims set successfully!');
    
    // Verify the claims were set
    const updatedUser = await admin.auth().getUser(userRecord.uid);
    console.log('✅ User claims verified:', updatedUser.customClaims);
    
    console.log('\n🎉 Success! You can now login to your admin dashboard.');
    console.log('🔗 Navigate to: http://localhost:4200/admin/login');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting admin claims:', error.message);
    
    if (error.code === 'auth/user-not-found') {
      console.log('\n💡 Make sure you:');
      console.log('1. Created a user in Firebase Auth console');
      console.log('2. Updated the email in this script');
    } else if (error.code === 'auth/insufficient-permission') {
      console.log('\n💡 Authentication issue. Try running:');
      console.log('   firebase login');
      console.log('   firebase use rdjportfolio');
    } else if (error.message.includes('default credentials')) {
      console.log('\n💡 Authentication setup needed. Try these steps:');
      console.log('1. Run: firebase login');
      console.log('2. Run: firebase use rdjportfolio');
      console.log('3. Or use GOOGLE_APPLICATION_CREDENTIALS environment variable');
      console.log('4. Or download service account key (see GOOGLE_APPLICATION_CREDENTIALS method below)');
    }
    
    process.exit(1);
  }
}

// Run the function
setAdminClaims();
