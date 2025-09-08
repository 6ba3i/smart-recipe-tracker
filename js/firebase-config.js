// Firebase Configuration with Environment Variable Support
// This file handles Firebase initialization using the configuration manager

class FirebaseConfigManager {
    constructor() {
        this.isInitialized = false;
        this.firebaseConfig = null;
        this.services = null;
        this.initialize();
    }

    async initialize() {
        try {
            // Wait for configuration manager to be ready
            await this.waitForConfigManager();
            
            // Get Firebase configuration
            this.firebaseConfig = window.configManager.getFirebaseConfig();
            
            // Validate configuration
            this.validateConfig();
            
            // Initialize Firebase
            await this.initializeFirebase();
            
            console.log('🔥 Firebase initialized successfully');
            this.isInitialized = true;
            
        } catch (error) {
            console.error('❌ Firebase initialization failed:', error);
            this.handleInitializationError(error);
        }
    }

    async waitForConfigManager() {
        let attempts = 0;
        const maxAttempts = 100; // 10 seconds max wait
        
        while (!window.configManager && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (!window.configManager) {
            throw new Error('Configuration manager not available');
        }
        
        // Wait for config manager to be initialized
        await window.configManager.waitForConfig();
    }

    validateConfig() {
        if (!this.firebaseConfig) {
            throw new Error('Firebase configuration not found');
        }

        const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
        const missingFields = requiredFields.filter(field => 
            !this.firebaseConfig[field] || 
            this.firebaseConfig[field].includes('demo-mode') ||
            this.firebaseConfig[field].includes('your-')
        );

        if (missingFields.length > 0) {
            const errorMsg = `Firebase configuration incomplete. Missing or invalid fields: ${missingFields.join(', ')}`;
            throw new Error(errorMsg);
        }
    }

    async initializeFirebase() {
        // Check if Firebase is already initialized
        if (firebase.apps.length > 0) {
            console.log('🔥 Firebase already initialized, using existing app');
            firebase.app(); // Use existing app
        } else {
            // Initialize new Firebase app
            firebase.initializeApp(this.firebaseConfig);
            console.log('🔥 Firebase app initialized');
        }

        // Initialize Firebase services
        const auth = firebase.auth();
        const db = firebase.firestore();

        // Configure Auth providers
        const googleProvider = new firebase.auth.GoogleAuthProvider();
        googleProvider.addScope('profile');
        googleProvider.addScope('email');

        // Set auth persistence
        try {
            await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
        } catch (error) {
            console.warn('⚠️ Could not set auth persistence:', error);
        }

        // Store services globally
        this.services = {
            auth,
            db,
            googleProvider,
            firebase,
            config: this.firebaseConfig
        };

        // Export for global access
        window.firebaseConfig = this.services;
        
        console.log('✅ Firebase services configured');
    }

    handleInitializationError(error) {
        console.error('Firebase initialization error details:', error);
        
        // Show user-friendly error for configuration issues
        if (error.message.includes('configuration') || error.message.includes('Missing')) {
            this.showConfigurationError();
        }
        
        // Create a minimal services object for graceful degradation
        this.services = {
            auth: null,
            db: null,
            googleProvider: null,
            firebase: null,
            config: null,
            error: error.message
        };
        
        window.firebaseConfig = this.services;
        this.isInitialized = true; // Mark as initialized even with error
    }

    showConfigurationError() {
        // Only show error overlay if we're not on the login page and DOM is ready
        if (typeof window !== 'undefined' && 
            document.readyState === 'complete' && 
            !window.location.pathname.includes('login.html')) {
            
            const errorOverlay = document.createElement('div');
            errorOverlay.innerHTML = `
                <div style="
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0; 
                    background: rgba(15, 23, 42, 0.95); color: #f8fafc; 
                    display: flex; align-items: center; justify-content: center;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    z-index: 10000; backdrop-filter: blur(5px);
                ">
                    <div style="text-align: center; max-width: 600px; padding: 2rem; background: #1e293b; border-radius: 1rem; border: 1px solid #475569;">
                        <div style="font-size: 3rem; margin-bottom: 1rem;">🔧</div>
                        <h2 style="color: #ef4444; margin-bottom: 1rem; font-size: 1.5rem;">Configuration Required</h2>
                        <p style="margin-bottom: 1rem; line-height: 1.6;">
                            Firebase configuration is missing or incomplete.<br>
                            Please set up your API keys to continue.
                        </p>
                        <div style="background: #334155; padding: 1rem; border-radius: 0.5rem; margin: 1rem 0; text-align: left;">
                            <strong>Setup Options:</strong><br>
                            • Copy <code>config.example.js</code> to <code>config.js</code><br>
                            • Or copy <code>.env.example</code> to <code>.env</code><br>
                            • Add your Firebase API keys<br>
                            • Refresh this page
                        </div>
                        <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                            <button onclick="location.reload()" style="
                                background: #6366f1; color: white; border: none; 
                                padding: 0.75rem 1.5rem; border-radius: 0.5rem; 
                                cursor: pointer; font-size: 1rem;
                            ">Retry</button>
                            <button onclick="this.parentElement.parentElement.parentElement.remove()" style="
                                background: #374151; color: white; border: none; 
                                padding: 0.75rem 1.5rem; border-radius: 0.5rem; 
                                cursor: pointer; font-size: 1rem;
                            ">Continue Anyway</button>
                        </div>
                        <p style="font-size: 0.875rem; color: #94a3b8; margin-top: 1rem;">
                            📖 See README.md for detailed setup instructions
                        </p>
                    </div>
                </div>
            `;
            document.body.appendChild(errorOverlay);
        }
    }

    // Public methods
    isReady() {
        return this.isInitialized;
    }

    getServices() {
        return this.services;
    }

    async waitForInitialization() {
        while (!this.isInitialized) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        return this.services;
    }
}

// Initialize Firebase configuration manager
let firebaseManager;

function initializeFirebaseManager() {
    if (typeof window !== 'undefined') {
        firebaseManager = new FirebaseConfigManager();
        window.firebaseManager = firebaseManager;
    }
}

// Start initialization when script loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeFirebaseManager);
} else {
    initializeFirebaseManager();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FirebaseConfigManager;
}

console.log('🔧 Firebase configuration manager loaded');

/*
SETUP INSTRUCTIONS:

🚀 Quick Setup:
1. Choose your method:
   A) Configuration file: Copy config.example.js to config.js
   B) Environment variables: Copy .env.example to .env

2. Get Firebase configuration:
   - Go to https://console.firebase.google.com/
   - Create/select project
   - Go to Project Settings > General > Your apps
   - Add web app or view existing config
   - Copy the configuration values

3. Add configuration:
   Method A - In config.js:
   window.AppConfig = {
       firebase: {
           apiKey: "your-firebase-api-key",
           authDomain: "your-project.firebaseapp.com",
           projectId: "your-project-id",
           // ... other config values
       }
   };

   Method B - In .env:
   VITE_FIREBASE_API_KEY=your-firebase-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id

4. Enable Firebase services:
   - Authentication: Enable Email/Password and Google sign-in
   - Firestore: Create database in test mode

5. Refresh the page and you're ready!

📖 For detailed instructions, see README.md

🛡️ Security Notes:
- Never commit config.js or .env files to version control
- Use different API keys for development and production
- Monitor your Firebase usage and set up billing alerts
*/