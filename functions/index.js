const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

// SMTP transporter (using environment variables instead of deprecated functions.config())
let transporter;
function getTransporter() {
  if (transporter) return transporter;
  
  // Use environment variables for SMTP config
  const smtpConfig = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for 587
    auth: {
      user: process.env.SMTP_USER || 'reza2001july@gmail.com',
      pass: process.env.SMTP_PASS || 'lhos qptu ereb leod'
    }
  };
  
  if (!process.env.SMTP_PASS) {
    console.warn('SMTP_PASS environment variable not set. Email sending may fail.');
  }
  
  transporter = nodemailer.createTransport(smtpConfig);
  return transporter;
}

// HTTP endpoint to send contact form email
exports.sendContactEmail = functions.https.onRequest(async (req, res) => {
  // Enhanced CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.set('Access-Control-Max-Age', '86400');
  
  if (req.method === 'OPTIONS') { 
    res.status(204).send(''); 
    return; 
  }
  if (req.method !== 'POST') { 
    res.status(405).json({ error: 'Method Not Allowed' }); 
    return; 
  }

  try {
    const { name, email, subject, message, phone, company } = req.body || {};
    if (!name || !email || !subject || !message) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const mailOptions = {
      from: `Portfolio Contact <${process.env.SMTP_FROM || process.env.SMTP_USER || 'reza2001july@gmail.com'}>`,
      to: process.env.SMTP_TO || process.env.SMTP_USER || 'rashedujjaman.reza@gmail.com',
      replyTo: email,
      subject: `[Portfolio] ${subject}`,
      text: `New contact form submission\n\nName: ${name}\nEmail: ${email}${phone ? '\nPhone: '+phone : ''}${company ? '\nCompany: '+company : ''}\n\nMessage:\n${message}`,
      html: `<h2>New Contact Submission</h2>
             <p><strong>Name:</strong> ${name}</p>
             <p><strong>Email:</strong> ${email}</p>
             ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
             ${company ? `<p><strong>Company:</strong> ${company}</p>` : ''}
             <p><strong>Subject:</strong> ${subject}</p>
             <p><strong>Message:</strong><br>${message.replace(/\n/g,'<br>')}</p>`
    };

    const info = await getTransporter().sendMail(mailOptions);
    res.json({ success: true, id: info.messageId });
  } catch (err) {
    console.error('sendContactEmail error', err);
    res.status(500).json({ error: 'Failed to send email', details: err.message });
  }
});

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
