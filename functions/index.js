const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// HTTP Cloud Function to set admin claims
exports.setAdminClaim = functions.https.onCall(async (data, context) => {
  // Check if request is made by an authenticated user
  if (!context.auth) {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
  }

  // For security, you can add additional checks here
  // For initial setup, we'll allow the first user to set admin claims
  
  const { uid, isAdmin } = data;
  
  try {
    // Set custom user claims on this user
    await admin.auth().setCustomUserClaims(uid, { admin: isAdmin });
    
    return {
      message: `Admin claim set to ${isAdmin} for user ${uid}`,
      success: true
    };
  } catch (error) {
    throw new functions.https.HttpsError('internal', 'Failed to set admin claim', error);
  }
});

// Alternative: HTTP function (no authentication required - use with caution!)
exports.setAdminClaimHTTP = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }
  
  const { uid, email, isAdmin } = req.body;
  
  try {
    let targetUid = uid;
    
    // If no UID provided but email is provided, look up user by email
    if (!targetUid && email) {
      const userRecord = await admin.auth().getUserByEmail(email);
      targetUid = userRecord.uid;
    }
    
    if (!targetUid) {
      res.status(400).json({ error: 'Either uid or email must be provided' });
      return;
    }
    
    // Set custom user claims
    await admin.auth().setCustomUserClaims(targetUid, { admin: isAdmin !== false });
    
    res.json({
      message: `Admin claim set for user ${targetUid}`,
      success: true
    });
  } catch (error) {
    console.error('Error setting admin claim:', error);
    res.status(500).json({ error: 'Failed to set admin claim', details: error.message });
  }
});

// Function to list all users (helpful for debugging)
exports.listUsers = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  
  try {
    const listUsersResult = await admin.auth().listUsers(10);
    const users = listUsersResult.users.map(user => ({
      uid: user.uid,
      email: user.email,
      customClaims: user.customClaims || {}
    }));
    
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: 'Failed to list users', details: error.message });
  }
});
