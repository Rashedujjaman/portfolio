# Firebase Service Account Setup

## Security Notice
The Firebase service account key file contains sensitive credentials and should NEVER be committed to version control.

## Setup Instructions

1. **Download your service account key** from Firebase Console:
   - Go to Firebase Console → Project Settings → Service Accounts
   - Click "Generate new private key"
   - Save the downloaded JSON file as `service-account-key.json` in the project root

2. **Local Development Setup**:
   ```bash
   # Copy your downloaded service account key to the project root
   cp path/to/your/downloaded-key.json service-account-key.json
   ```

3. **Environment Variables** (Alternative approach):
   You can also use environment variables instead of a file:
   ```bash
   # Set environment variable
   export GOOGLE_APPLICATION_CREDENTIALS="path/to/service-account-key.json"
   
   # Or use Firebase emulator for local development
   firebase emulators:start
   ```

## Important Security Notes

- ✅ `service-account-key.json` is already in `.gitignore`
- ✅ `service-account-key.json.json` is also ignored (common naming mistake)
- ❌ NEVER commit actual service account keys to Git
- ❌ NEVER share service account keys in public repositories
- ❌ NEVER include credentials in environment files that get committed

## Production Deployment

For production deployment, use:
- Firebase CLI with `firebase deploy`
- Environment variables in your hosting platform
- Secure secret management systems

## File Structure Reference

See `service-account-key.json.example` for the expected file structure (with placeholder values).
