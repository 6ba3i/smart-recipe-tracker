// Configuration Manager for Smart Recipe Tracker
// Environment Variables Only - No config files

class ConfigManager {
    constructor() {
        this.config = null;
        this.isInitialized = false;
        this.initializeConfig();
    }

    initializeConfig() {
        try {
            // Load configuration from environment variables only
            this.config = this.loadFromEnvironmentVariables() || this.loadFallbackConfig();

            this.validateConfig();
            this.isInitialized = true;
            
            console.log('Configuration loaded successfully');
            this.logConfigStatus();
            
        } catch (error) {
            console.error('Failed to initialize configuration:', error);
            this.config = this.loadFallbackConfig();
            this.isInitialized = true;
        }
    }

    // Load from environment variables (build tools)
    loadFromEnvironmentVariables() {
        try {
            const envConfig = this.getEnvironmentConfig();
            
            if (envConfig && envConfig.firebase.apiKey && envConfig.firebase.apiKey !== 'undefined') {
                console.log('Using environment variables configuration');
                return envConfig;
            }
        } catch (error) {
            console.log('Environment variables not available or incomplete');
        }
        return null;
    }

    // Fallback configuration (for initial setup)
    loadFallbackConfig() {
        console.warn('Using fallback configuration - please set up your environment variables!');
        return {
            firebase: {
                apiKey: "demo-mode-replace-with-real-key",
                authDomain: "demo-project.firebaseapp.com",
                projectId: "demo-project", 
                storageBucket: "demo-project.appspot.com",
                messagingSenderId: "123456789012",
                appId: "1:123456789012:web:demo",
                measurementId: "G-DEMO"
            },
            spoonacular: {
                apiKey: "demo-mode-replace-with-real-key",
                apiSecret: ""
            },
            app: {
                name: "Smart Recipe Tracker",
                version: "1.0.0",
                environment: "development"
            },
            features: {
                enableAnalytics: false,
                enableNotifications: false,
                debugMode: true
            }
        };
    }

    // Get environment variables configuration
    getEnvironmentConfig() {
        const env = this.getEnvironmentVariables();
        
        return {
            firebase: {
                apiKey: env.FIREBASE_API_KEY,
                authDomain: env.FIREBASE_AUTH_DOMAIN,
                projectId: env.FIREBASE_PROJECT_ID,
                storageBucket: env.FIREBASE_STORAGE_BUCKET,
                messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID,
                appId: env.FIREBASE_APP_ID,
                measurementId: env.FIREBASE_MEASUREMENT_ID
            },
            spoonacular: {
                apiKey: env.SPOONACULAR_API_KEY,
                apiSecret: env.SPOONACULAR_API_SECRET || ""
            },
            app: {
                name: env.APP_NAME || "Smart Recipe Tracker",
                version: env.APP_VERSION || "1.0.0",
                environment: env.NODE_ENV || "development"
            },
            features: {
                enableAnalytics: env.ENABLE_ANALYTICS !== 'false',
                enableNotifications: env.ENABLE_NOTIFICATIONS !== 'false',
                debugMode: env.DEBUG_MODE === 'true' || env.NODE_ENV === 'development'
            }
        };
    }

    // Get environment variables from different build tools
    getEnvironmentVariables() {
        const env = {};
        
        // Try different environment variable patterns
        const patterns = [
            'VITE_',           // Vite
            'REACT_APP_',      // Create React App
            'NEXT_PUBLIC_',    // Next.js
            'VUE_APP_',        // Vue CLI
            ''                 // Direct (Node.js)
        ];

        const keys = [
            'FIREBASE_API_KEY',
            'FIREBASE_AUTH_DOMAIN', 
            'FIREBASE_PROJECT_ID',
            'FIREBASE_STORAGE_BUCKET',
            'FIREBASE_MESSAGING_SENDER_ID',
            'FIREBASE_APP_ID',
            'FIREBASE_MEASUREMENT_ID',
            'SPOONACULAR_API_KEY',
            'SPOONACULAR_API_SECRET',
            'APP_NAME',
            'APP_VERSION',
            'NODE_ENV',
            'ENABLE_ANALYTICS',
            'ENABLE_NOTIFICATIONS',
            'DEBUG_MODE'
        ];

        // Try each pattern for each key
        keys.forEach(key => {
            for (const pattern of patterns) {
                const envKey = pattern + key;
                try {
                    // Check if we're in a build environment
                    if (typeof process !== 'undefined' && process.env && process.env[envKey]) {
                        env[key] = process.env[envKey];
                        break;
                    }
                    // Check for build-time injected variables (common with Vite, etc.)
                    if (typeof window !== 'undefined' && window.__ENV__ && window.__ENV__[envKey]) {
                        env[key] = window.__ENV__[envKey];
                        break;
                    }
                } catch (e) {
                    // Environment access might fail in some contexts
                    continue;
                }
            }
        });

        return env;
    }

    // Validate configuration
    validateConfig() {
        const requiredFields = [
            'firebase.apiKey',
            'firebase.projectId', 
            'spoonacular.apiKey'
        ];

        const warnings = [];

        requiredFields.forEach(field => {
            const value = this.getNestedValue(this.config, field);
            if (!value || value.includes('demo-mode') || value.includes('your-') || value.includes('replace-with')) {
                warnings.push(`${field} is not properly configured`);
            }
        });

        if (warnings.length > 0) {
            console.warn('Configuration warnings:');
            warnings.forEach(warning => console.warn(warning));
            console.warn('Please set up your environment variables (.env file)');
        }
    }

    // Helper to get nested object values
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current && current[key], obj);
    }

    // Log configuration status (without sensitive information)
    logConfigStatus() {
        const status = {
            firebase: {
                configured: !this.config.firebase.apiKey.includes('demo-mode'),
                project: this.config.firebase.projectId
            },
            spoonacular: {
                configured: !this.config.spoonacular.apiKey.includes('demo-mode')
            },
            environment: this.config.app.environment,
            debugMode: this.config.features.debugMode
        };

        console.log('Configuration Status:', status);
        
        if (!status.firebase.configured || !status.spoonacular.configured) {
            console.log('');
            console.log('Setup Required:');
            if (!status.firebase.configured) {
                console.log('  • Configure Firebase: Add Firebase keys to .env file');
            }
            if (!status.spoonacular.configured) {
                console.log('  • Configure Spoonacular: Add Spoonacular API key to .env file');
            }
            console.log('  • Use format: VITE_FIREBASE_API_KEY=your-key');
            console.log('  • See README.md for detailed setup instructions');
        }
    }

    // Public methods to get configuration values
    getFirebaseConfig() {
        return this.config?.firebase || {};
    }

    getSpoonacularConfig() {
        return this.config?.spoonacular || {};
    }

    getAppConfig() {
        return this.config?.app || {};
    }

    getFeatures() {
        return this.config?.features || {};
    }

    // Check if configuration is ready for production use
    isProductionReady() {
        return this.config && 
               !this.config.firebase.apiKey.includes('demo-mode') &&
               !this.config.spoonacular.apiKey.includes('demo-mode') &&
               this.config.firebase.projectId !== 'demo-project';
    }

    // Get configuration value by path
    get(path, defaultValue = null) {
        return this.getNestedValue(this.config, path) || defaultValue;
    }

    // Check if app is in debug mode
    isDebugMode() {
        return this.config?.features?.debugMode || false;
    }

    // Wait for configuration to be ready
    async waitForConfig() {
        while (!this.isInitialized) {
            await new Promise(resolve => setTimeout(resolve, 10));
        }
        return this.config;
    }
}

// Create global configuration manager instance
window.configManager = new ConfigManager();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ConfigManager;
}

console.log('Configuration Manager loaded (Environment Variables Only)');