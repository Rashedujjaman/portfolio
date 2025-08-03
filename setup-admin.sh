#!/bin/bash

# Simple script to set admin claims using Firebase CLI
# This bypasses the Node.js authentication issues

echo "🔧 Setting admin claims for Firebase user..."

# Set the project
firebase use rdjportfolio

# Create a simple Cloud Function to set admin claims
cat > functions/admin-setup.js << 'EOF'
const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.setupAdmin = functions.https.onRequest(async (req, res) => {
  try {
    const email = 'reza2001july@gmail.com';
    const userRecord = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(userRecord.uid, { admin: true });
    
    res.json({ 
      success: true, 
      message: `Admin privileges granted to ${email}`,
      uid: userRecord.uid 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
EOF

echo "📦 Deploying admin setup function..."
firebase deploy --only functions:setupAdmin

echo "✅ Function deployed!"
echo "🌐 Visit this URL to grant admin privileges:"
echo "https://us-central1-rdjportfolio.cloudfunctions.net/setupAdmin"
