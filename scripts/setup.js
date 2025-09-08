#!/usr/bin/env node

/**
 * Interactive Setup Script for Smart Recipe Tracker
 * Helps users configure Firebase and Spoonacular API keys
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

class SetupWizard {
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        this.config = {
            firebase: {},
            spoonacular: {},
            app: {
                name: "Smart Recipe Tracker",
                version: "1.0.0",
                environment: "development"
            },
            features: {
                enableAnalytics: true,
                enableNotifications: true,
                debugMode: false
            }
        };
    }

    async run() {
        try {
            console.log('\n🚀 Welcome to Smart Recipe Tracker Setup!\n');
            console.log('This wizard will help you configure your API keys and settings.\n');

            // Check if config already exists
            if (this.configExists()) {
                const overwrite = await this.ask('Configuration already exists. Overwrite? (y/N): ');
                if (!overwrite.toLowerCase().startsWith('y')) {
                    console.log('Setup cancelled.');
                    this.rl.close();
                    return;
                }
            }

            // Choose configuration method
            const method = await this.chooseConfigMethod();
            
            if (method === 'config') {
                await this.setupConfigFile();
            } else {
                await this.setupEnvironmentFile();
            }

            console.log('\n✅ Setup completed successfully!');
            console.log('\n📖 Next steps:');
            console.log('   1. Start the development server: npm run dev');
            console.log('   2. Or open login.html in your browser');
            console.log('   3. Create your first account and start cooking!\n');

        } catch (error) {
            console.error('\n❌ Setup failed:', error.message);
        } finally {
            this.rl.close();
        }
    }

    async chooseConfigMethod() {
        console.log('Choose your configuration method:\n');
        console.log('1. Configuration file (config.js) - Simple, works everywhere');
        console.log('2. Environment variables (.env) - Secure, works with build tools\n');
        
        const choice = await this.ask('Enter your choice (1 or 2): ');
        
        if (choice === '1') {
            return 'config';
        } else if (choice === '2') {
            return 'env';
        } else {
            console.log('Invalid choice. Defaulting to configuration file.');
            return 'config';
        }
    }

    async setupConfigFile() {
        console.log('\n🔧 Setting up configuration file...\n');
        
        // Firebase configuration
        console.log('📱 Firebase Configuration');
        console.log('Get these values from: https://console.firebase.google.com/\n');
        
        this.config.firebase.apiKey = await this.ask('Firebase API Key: ');
        this.config.firebase.authDomain = await this.ask('Auth Domain (your-project.firebaseapp.com): ');
        this.config.firebase.projectId = await this.ask('Project ID: ');
        this.config.firebase.storageBucket = await this.ask('Storage Bucket (your-project.appspot.com): ');
        this.config.firebase.messagingSenderId = await this.ask('Messaging Sender ID: ');
        this.config.firebase.appId = await this.ask('App ID: ');
        
        const measurementId = await this.ask('Measurement ID (optional, press Enter to skip): ');
        if (measurementId.trim()) {
            this.config.firebase.measurementId = measurementId;
        }

        // Spoonacular configuration
        console.log('\n🥄 Spoonacular API Configuration');
        console.log('Get your API key from: https://spoonacular.com/food-api/console#Dashboard\n');
        
        this.config.spoonacular.apiKey = await this.ask('Spoonacular API Key: ');

        // App configuration
        console.log('\n⚙️ App Configuration\n');
        
        const enableAnalytics = await this.ask('Enable analytics? (Y/n): ');
        this.config.features.enableAnalytics = !enableAnalytics.toLowerCase().startsWith('n');
        
        const debugMode = await this.ask('Enable debug mode? (y/N): ');
        this.config.features.debugMode = debugMode.toLowerCase().startsWith('y');

        // Write configuration file
        this.writeConfigFile();
    }

    async setupEnvironmentFile() {
        console.log('\n🔧 Setting up environment variables file...\n');
        
        const envContent = [];
        
        // Firebase configuration
        console.log('📱 Firebase Configuration');
        console.log('Get these values from: https://console.firebase.google.com/\n');
        
        const firebaseApiKey = await this.ask('Firebase API Key: ');
        envContent.push(`VITE_FIREBASE_API_KEY=${firebaseApiKey}`);
        
        const authDomain = await this.ask('Auth Domain (your-project.firebaseapp.com): ');
        envContent.push(`VITE_FIREBASE_AUTH_DOMAIN=${authDomain}`);
        
        const projectId = await this.ask('Project ID: ');
        envContent.push(`VITE_FIREBASE_PROJECT_ID=${projectId}`);
        
        const storageBucket = await this.ask('Storage Bucket (your-project.appspot.com): ');
        envContent.push(`VITE_FIREBASE_STORAGE_BUCKET=${storageBucket}`);
        
        const messagingSenderId = await this.ask('Messaging Sender ID: ');
        envContent.push(`VITE_FIREBASE_MESSAGING_SENDER_ID=${messagingSenderId}`);
        
        const appId = await this.ask('App ID: ');
        envContent.push(`VITE_FIREBASE_APP_ID=${appId}`);
        
        const measurementId = await this.ask('Measurement ID (optional, press Enter to skip): ');
        if (measurementId.trim()) {
            envContent.push(`VITE_FIREBASE_MEASUREMENT_ID=${measurementId}`);
        }

        // Spoonacular configuration
        console.log('\n🥄 Spoonacular API Configuration');
        console.log('Get your API key from: https://spoonacular.com/food-api/console#Dashboard\n');
        
        const spoonacularApiKey = await this.ask('Spoonacular API Key: ');
        envContent.push(`VITE_SPOONACULAR_API_KEY=${spoonacularApiKey}`);

        // App configuration
        console.log('\n⚙️ App Configuration\n');
        
        envContent.push('NODE_ENV=development');
        envContent.push('VITE_APP_NAME=Smart Recipe Tracker');
        envContent.push('VITE_APP_VERSION=1.0.0');
        
        const enableAnalytics = await this.ask('Enable analytics? (Y/n): ');
        envContent.push(`VITE_ENABLE_ANALYTICS=${!enableAnalytics.toLowerCase().startsWith('n')}`);
        
        const debugMode = await this.ask('Enable debug mode? (y/N): ');
        envContent.push(`VITE_DEBUG_MODE=${debugMode.toLowerCase().startsWith('y')}`);

        // Write environment file
        this.writeEnvironmentFile(envContent);
    }

    writeConfigFile() {
        const configContent = `// Smart Recipe Tracker Configuration
// Generated by setup wizard on ${new Date().toISOString()}

window.AppConfig = ${JSON.stringify(this.config, null, 4)};

// Security reminder:
// - Never commit this file to version control
// - Keep your API keys secure and private
// - Rotate keys regularly for enhanced security
`;

        fs.writeFileSync(path.join(process.cwd(), 'config.js'), configContent);
        console.log('\n✅ Configuration file created: config.js');
        console.log('⚠️  Remember to add config.js to your .gitignore file');
    }

    writeEnvironmentFile(envContent) {
        const envFileContent = `# Smart Recipe Tracker Environment Variables
# Generated by setup wizard on ${new Date().toISOString()}

${envContent.join('\n')}

# Security reminder:
# - Never commit this file to version control
# - Keep your API keys secure and private
# - Rotate keys regularly for enhanced security
`;

        fs.writeFileSync(path.join(process.cwd(), '.env'), envFileContent);
        console.log('\n✅ Environment file created: .env');
        console.log('⚠️  Remember to add .env to your .gitignore file');
    }

    configExists() {
        const configPath = path.join(process.cwd(), 'config.js');
        const envPath = path.join(process.cwd(), '.env');
        return fs.existsSync(configPath) || fs.existsSync(envPath);
    }

    ask(question) {
        return new Promise((resolve) => {
            this.rl.question(question, resolve);
        });
    }
}

// Validation functions
function validateFirebaseConfig(config) {
    const required = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
    const missing = required.filter(key => !config[key] || config[key].trim() === '');
    
    if (missing.length > 0) {
        throw new Error(`Missing required Firebase configuration: ${missing.join(', ')}`);
    }
}

function validateSpoonacularConfig(config) {
    if (!config.apiKey || config.apiKey.trim() === '') {
        throw new Error('Spoonacular API key is required');
    }
}

// Run setup if called directly
if (require.main === module) {
    const wizard = new SetupWizard();
    wizard.run().catch(console.error);
}

module.exports = SetupWizard;