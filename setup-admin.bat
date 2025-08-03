@echo off
echo 🔧 Setting admin claims for Firebase user...

REM Set the project
firebase use rdjportfolio

REM Create a simple function for admin setup
echo const functions = require('firebase-functions'); > functions\admin-setup.js
echo const admin = require('firebase-admin'); >> functions\admin-setup.js
echo. >> functions\admin-setup.js
echo admin.initializeApp(); >> functions\admin-setup.js
echo. >> functions\admin-setup.js
echo exports.setupAdmin = functions.https.onRequest(async (req, res) =^> { >> functions\admin-setup.js
echo   try { >> functions\admin-setup.js
echo     const email = 'reza2001july@gmail.com'; >> functions\admin-setup.js
echo     const userRecord = await admin.auth().getUserByEmail(email); >> functions\admin-setup.js
echo     await admin.auth().setCustomUserClaims(userRecord.uid, { admin: true }); >> functions\admin-setup.js
echo. >> functions\admin-setup.js
echo     res.json({ >> functions\admin-setup.js
echo       success: true, >> functions\admin-setup.js
echo       message: `Admin privileges granted to ${email}`, >> functions\admin-setup.js
echo       uid: userRecord.uid >> functions\admin-setup.js
echo     }); >> functions\admin-setup.js
echo   } catch (error) { >> functions\admin-setup.js
echo     res.status(500).json({ error: error.message }); >> functions\admin-setup.js
echo   } >> functions\admin-setup.js
echo }); >> functions\admin-setup.js

echo 📦 Deploying admin setup function...
firebase deploy --only functions:setupAdmin

echo ✅ Function deployed!
echo 🌐 Visit this URL to grant admin privileges:
echo https://us-central1-rdjportfolio.cloudfunctions.net/setupAdmin
pause
