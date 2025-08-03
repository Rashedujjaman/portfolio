// Alternative admin claims script using Firebase CLI credentials
// This version uses the Firebase CLI authentication automatically

const { execSync } = require('child_process');
const fs = require('fs');

async function setAdminClaimsViaFirebaseCLI() {
  try {
    const userEmail = 'reza2001july@gmail.com';
    
    console.log('🔍 Setting admin claims via Firebase CLI...');
    console.log('📧 Target email:', userEmail);
    
    // Create a temporary Cloud Function to set admin claims
    const functionCode = `
const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.setAdminClaim = functions.https.onRequest(async (req, res) => {
  try {
    const userRecord = await admin.auth().getUserByEmail('${userEmail}');
    await admin.auth().setCustomUserClaims(userRecord.uid, { admin: true });
    
    res.json({ 
      success: true, 
      message: 'Admin claim set successfully',
      uid: userRecord.uid,
      email: userRecord.email
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});`;

    // Write the function
    const functionsDir = './functions';
    if (!fs.existsSync(functionsDir)) {
      fs.mkdirSync(functionsDir);
    }
    
    fs.writeFileSync('./functions/index.js', functionCode);
    
    console.log('📝 Created temporary function...');
    console.log('🚀 Deploying function...');
    
    // Deploy the function
    execSync('firebase deploy --only functions:setAdminClaim', { stdio: 'inherit' });
    
    console.log('✅ Function deployed! Visit the URL that was displayed above to set admin claims.');
    console.log('🔗 The URL should look like: https://us-central1-rdjportfolio.cloudfunctions.net/setAdminClaim');
    console.log('📧 Just open that URL in your browser to set admin claims for:', userEmail);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Make sure you have:');
    console.log('1. Logged in with: firebase login');
    console.log('2. Set the project: firebase use rdjportfolio');
    console.log('3. Functions enabled in your Firebase project');
  }
}

setAdminClaimsViaFirebaseCLI();
