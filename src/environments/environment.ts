// Firebase configuration for development

export const environment = {
  production: false,
  firebase: {
    projectId: 'rdjportfolio',
    appId: '1:993787135973:web:84c145414610577ab9510c', 
    storageBucket: 'rdjportfolio.firebasestorage.app',
    apiKey: 'AIzaSyB9Q6peKUKb7ACM6PZcDfNBp9lzXo1gsQY', 
    authDomain: 'rdjportfolio.firebaseapp.com',
    messagingSenderId: '993787135973',
    measurementId: 'your-actual-measurement-id'
  },
  api: {
    // Direct Cloud Function URL (default region us-central1 unless changed)
    contactEmailUrl: 'https://us-central1-rdjportfolio.cloudfunctions.net/sendContactEmail'
  }
};

// Instructions to get your Firebase configuration:
// 1. Go to https://console.firebase.google.com/project/rdjportfolio/settings/general
// 2. Scroll down to "Your apps" section
// 3. If no app exists, click "Add app" and select Web app (</>)
// 4. Register your app with a nickname (e.g., "portfolio-web")
// 5. Copy the configuration object and replace the placeholder values above
