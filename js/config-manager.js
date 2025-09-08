// Configuration Manager
class ConfigManager {
    constructor() {
        this.config = this.loadConfig();
        this.validateConfig();
    }

    // Load configuration from environment variables
    loadConfig() {
        const config = {
            firebase: {
                apiKey: this.getEnvVariable('VITE_FIREBASE_API_KEY', 'AIzaSyC_fnBK0vfP3U6SKhFWJP98CC6e2sjjIJs'),
                authDomain: this.getEnvVariable('VITE_FIREBASE_AUTH_DOMAIN', 'nut-track.firebaseapp.com'),
                projectId: this.getEnvVariable('VITE_FIREBASE_PROJECT_ID', 'nut-track'),
                storageBucket: this.getEnvVariable('VITE_FIREBASE_STORAGE_BUCKET', 'nut-track.firebasestorage.app'),
                messagingSenderId: this.getEnvVariable('VITE_FIREBASE_MESSAGING_SENDER_ID', '656967210072'),
                appId: this.getEnvVariable('VITE_FIREBASE_APP_ID', '1:656967210072:web:5f17fc3d10e525e08ee62d'),
                measurementId: this.getEnvVariable('VITE_FIREBASE_MEASUREMENT_ID', 'G-CVLLBVRBEF')
            },
            spoonacular: {
                apiKey: this.getEnvVariable('VITE_SPOONACULAR_API_KEY', 'a197d4a8778b40389a0d3d0a6a82f32d'),
                apiSecret: this.getEnvVariable('VITE_SPOONACULAR_API_SECRET', 'd29b19b20b5e48b0aceefcfdc9f80251'),
                baseUrl: 'https://api.spoonacular.com'
            },
            app: {
                environment: this.getEnvVariable('NODE_ENV', 'development'),
                version: '1.0.0',
                debugMode: this.getEnvVariable('VITE_DEBUG', 'false') === 'true'
            }
        };

        return config;
    }

    // Get environment variable with fallback
    getEnvVariable(key, fallback = '') {
        // Try different environment variable patterns
        const patterns = [
            key,
            key.replace('VITE_', ''),
            key.toLowerCase(),
            key.toUpperCase()
        ];

        for (const pattern of patterns) {
            try {
                // Check process.env (Node.js environments)
                if (typeof process !== 'undefined' && process.env && process.env[pattern]) {
                    return process.env[pattern];
                }

                // Check import.meta.env (Vite environments)
                if (typeof import !== 'undefined' && import.meta && import.meta.env && import.meta.env[pattern]) {
                    return import.meta.env[pattern];
                }

                // Check window environment variables
                if (typeof window !== 'undefined' && window.__ENV__ && window.__ENV__[pattern]) {
                    return window.__ENV__[pattern];
                }
            } catch (e) {
                continue;
            }
        }

        return fallback;
    }

    // Validate configuration
    validateConfig() {
        const requiredFields = [
            'firebase.apiKey',
            'firebase.projectId',
            'spoonacular.apiKey'
        ];

        const warnings = [];
        const errors = [];

        requiredFields.forEach(field => {
            const value = this.getNestedValue(this.config, field);
            if (!value) {
                errors.push(`${field} is missing`);
            } else if (value.includes('demo-mode') || value.includes('your-') || value.includes('replace-with')) {
                warnings.push(`${field} appears to be a placeholder value`);
            }
        });

        if (errors.length > 0) {
            console.error('Configuration errors:');
            errors.forEach(error => console.error(`❌ ${error}`));
        }

        if (warnings.length > 0) {
            console.warn('Configuration warnings:');
            warnings.forEach(warning => console.warn(`⚠️ ${warning}`));
        }

        if (errors.length === 0 && warnings.length === 0) {
            console.log('✅ Configuration validated successfully');
        }

        return { errors, warnings };
    }

    // Helper to get nested object values
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : null;
        }, obj);
    }

    // Get specific configuration section
    getFirebaseConfig() {
        return this.config.firebase;
    }

    getSpoonacularConfig() {
        return this.config.spoonacular;
    }

    getAppConfig() {
        return this.config.app;
    }

    // Check if running in development mode
    isDevelopment() {
        return this.config.app.environment === 'development';
    }

    // Check if debug mode is enabled
    isDebugMode() {
        return this.config.app.debugMode;
    }

    // Update configuration at runtime
    updateConfig(path, value) {
        const keys = path.split('.');
        let current = this.config;

        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) {
                current[keys[i]] = {};
            }
            current = current[keys[i]];
        }

        current[keys[keys.length - 1]] = value;
        console.log(`Configuration updated: ${path} = ${value}`);
    }

    // Export configuration for external use
    exportConfig() {
        return JSON.parse(JSON.stringify(this.config));
    }

    // Create .env template
    generateEnvTemplate() {
        return `# Smart Recipe Tracker Environment Variables

# Firebase Configuration
VITE_FIREBASE_API_KEY=${this.config.firebase.apiKey}
VITE_FIREBASE_AUTH_DOMAIN=${this.config.firebase.authDomain}
VITE_FIREBASE_PROJECT_ID=${this.config.firebase.projectId}
VITE_FIREBASE_STORAGE_BUCKET=${this.config.firebase.storageBucket}
VITE_FIREBASE_MESSAGING_SENDER_ID=${this.config.firebase.messagingSenderId}
VITE_FIREBASE_APP_ID=${this.config.firebase.appId}
VITE_FIREBASE_MEASUREMENT_ID=${this.config.firebase.measurementId}

# Spoonacular API Configuration
VITE_SPOONACULAR_API_KEY=${this.config.spoonacular.apiKey}
VITE_SPOONACULAR_API_SECRET=${this.config.spoonacular.apiSecret}

# Application Configuration
NODE_ENV=${this.config.app.environment}
VITE_DEBUG=${this.config.app.debugMode}
`;
    }
}

// Initialize configuration manager
const configManager = new ConfigManager();

// Export for global use
window.configManager = configManager;

// Log configuration status
if (configManager.isDebugMode()) {
    console.log('Configuration Manager loaded:', configManager.exportConfig());
}

console.log('Configuration Manager initialized successfully');