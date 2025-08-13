// Firebase configuration for production
// TODO: Replace these placeholder values with your actual Firebase configuration

export const environment = {
  production: true,
  firebase: {
    projectId: 'rdjportfolio',
    appId: 'your-actual-app-id', // Replace with your actual app ID
    storageBucket: 'rdjportfolio.appspot.com',
    apiKey: 'your-actual-api-key', // Replace with your actual API key
    authDomain: 'rdjportfolio.firebaseapp.com',
    messagingSenderId: 'your-actual-sender-id', // Replace with your actual sender ID
    measurementId: 'your-actual-measurement-id' // Replace with your actual measurement ID (optional)
  },
  api: {
    contactEmailUrl: 'https://us-central1-rdjportfolio.cloudfunctions.net/sendContactEmail'
  }
};
