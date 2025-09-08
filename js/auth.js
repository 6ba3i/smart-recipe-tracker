// Authentication Manager
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.authState = 'loading';
        this.providers = {};
        
        this.initializeAuth();
    }

    async initializeAuth() {
        try {
            // Wait for Firebase to be available
            if (!window.firebaseConfig) {
                setTimeout(() => this.initializeAuth(), 100);
                return;
            }

            this.auth = window.firebaseConfig.auth;
            this.db = window.firebaseConfig.db;

            // Set up Google provider
            this.providers.google = new firebase.auth.GoogleAuthProvider();
            this.providers.google.addScope('profile');
            this.providers.google.addScope('email');

            // Listen for auth state changes
            this.auth.onAuthStateChanged((user) => {
                this.handleAuthStateChange(user);
            });

            // Set up form handlers
            this.setupFormHandlers();

            console.log('Auth Manager initialized');
        } catch (error) {
            console.error('Error initializing auth:', error);
            this.authState = 'error';
        }
    }

    setupFormHandlers() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Signup form
        const signupForm = document.getElementById('signupForm');
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSignup();
            });
        }

        // Forgot password form
        const forgotForm = document.getElementById('forgotPasswordForm');
        if (forgotForm) {
            forgotForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleForgotPassword();
            });
        }

        // Social login buttons
        const googleBtn = document.getElementById('googleSignInBtn');
        if (googleBtn) {
            googleBtn.addEventListener('click', () => this.signInWithGoogle());
        }

        // Guest login button
        const guestBtn = document.getElementById('guestLoginBtn');
        if (guestBtn) {
            guestBtn.addEventListener('click', () => this.signInAsGuest());
        }
    }

    async handleLogin() {
        try {
            const email = document.getElementById('email')?.value;
            const password = document.getElementById('password')?.value;

            if (!email || !password) {
                this.showError('Please fill in all fields');
                return;
            }

            this.showLoading('Signing you in...');

            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            this.currentUser = userCredential.user;

            await this.updateUserProfile();
            
            this.showSuccess('Welcome back!');
            this.redirectToApp();

        } catch (error) {
            this.hideLoading();
            this.handleAuthError(error);
        }
    }

    async handleSignup() {
        try {
            const email = document.getElementById('signupEmail')?.value;
            const password = document.getElementById('signupPassword')?.value;
            const confirmPassword = document.getElementById('confirmPassword')?.value;
            const displayName = document.getElementById('displayName')?.value;

            // Validation
            if (!email || !password || !confirmPassword || !displayName) {
                this.showError('Please fill in all fields');
                return;
            }

            if (password !== confirmPassword) {
                this.showError('Passwords do not match');
                return;
            }

            if (password.length < 6) {
                this.showError('Password must be at least 6 characters');
                return;
            }

            this.showLoading('Creating your account...');

            // Create user account
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
            this.currentUser = userCredential.user;

            // Update profile with display name
            await this.currentUser.updateProfile({
                displayName: displayName
            });

            // Create user document in Firestore
            await this.createUserDocument({
                uid: this.currentUser.uid,
                email: email,
                displayName: displayName,
                createdAt: new Date().toISOString(),
                authProvider: 'email',
                preferences: this.getDefaultPreferences()
            });

            this.showSuccess('Account created successfully!');
            this.redirectToApp();

        } catch (error) {
            this.hideLoading();
            this.handleAuthError(error);
        }
    }

    async handleForgotPassword() {
        try {
            const email = document.getElementById('forgotEmail')?.value;

            if (!email) {
                this.showError('Please enter your email address');
                return;
            }

            this.showLoading('Sending reset email...');

            await this.auth.sendPasswordResetEmail(email);
            
            this.hideLoading();
            this.showSuccess('Password reset email sent! Check your inbox.');
            this.showLogin();

        } catch (error) {
            this.hideLoading();
            this.handleAuthError(error);
        }
    }

    async signInWithGoogle() {
        try {
            this.showLoading('Connecting with Google...');

            const result = await this.auth.signInWithPopup(this.providers.google);
            this.currentUser = result.user;

            // Check if this is a new user
            const isNewUser = result.additionalUserInfo?.isNewUser;
            
            if (isNewUser) {
                await this.createUserDocument({
                    uid: this.currentUser.uid,
                    email: this.currentUser.email,
                    displayName: this.currentUser.displayName,
                    photoURL: this.currentUser.photoURL,
                    createdAt: new Date().toISOString(),
                    authProvider: 'google',
                    preferences: this.getDefaultPreferences()
                });
            }

            await this.updateUserProfile();
            
            this.showSuccess(`Welcome ${this.currentUser.displayName || 'back'}!`);
            this.redirectToApp();

        } catch (error) {
            this.hideLoading();
            this.handleAuthError(error);
        }
    }

    async signInAsGuest() {
        try {
            this.showLoading('Setting up guest access...');

            const result = await this.auth.signInAnonymously();
            this.currentUser = result.user;

            // Create temporary user profile
            await this.createUserDocument({
                uid: this.currentUser.uid,
                displayName: 'Guest User',
                createdAt: new Date().toISOString(),
                authProvider: 'anonymous',
                isGuest: true,
                preferences: this.getDefaultPreferences()
            });

            this.showSuccess('Welcome! You\'re using guest mode.');
            this.redirectToApp();

        } catch (error) {
            this.hideLoading();
            this.handleAuthError(error);
        }
    }

    async signOut() {
        try {
            await this.auth.signOut();
            this.currentUser = null;
            this.authState = 'signed-out';
            
            // Clear any cached data
            if (window.app) {
                window.app = null;
            }
            
            // Redirect to login
            window.location.href = 'login.html';
        } catch (error) {
            console.error('Error signing out:', error);
            this.showError('Error signing out');
        }
    }

    handleAuthStateChange(user) {
        this.currentUser = user;
        
        if (user) {
            this.authState = 'signed-in';
            console.log('User signed in:', user.uid);
            
            // Update UI with user info
            this.updateUserUI();
            
            // Don't redirect if already on main app
            if (window.location.pathname.includes('login.html')) {
                this.redirectToApp();
            }
        } else {
            this.authState = 'signed-out';
            console.log('User signed out');
            
            // Redirect to login if not already there
            if (!window.location.pathname.includes('login.html')) {
                this.showLoginForm();
            }
        }
    }

    updateUserUI() {
        // Update user display name in navbar
        const userDisplayName = document.getElementById('userDisplayName');
        if (userDisplayName && this.currentUser) {
            userDisplayName.textContent = this.currentUser.displayName || 
                                          this.currentUser.email || 
                                          'Guest User';
        }

        // Update user avatar if available
        const userAvatar = document.querySelector('.user-avatar');
        if (userAvatar && this.currentUser?.photoURL) {
            userAvatar.src = this.currentUser.photoURL;
        }
    }

    async createUserDocument(userData) {
        try {
            if (this.db) {
                await this.db.collection('users').doc(userData.uid).set(userData, { merge: true });
                console.log('User document created/updated');
            }
        } catch (error) {
            console.error('Error creating user document:', error);
        }
    }

    async updateUserProfile() {
        try {
            if (this.currentUser && this.db) {
                await this.db.collection('users').doc(this.currentUser.uid).update({
                    lastLoginAt: new Date().toISOString(),
                    loginCount: firebase.firestore.FieldValue.increment(1)
                });
            }
        } catch (error) {
            console.error('Error updating user profile:', error);
        }
    }

    getDefaultPreferences() {
        return {
            nutritionGoals: {
                dailyCalories: 2000,
                dailyProtein: 150,
                dailyCarbs: 225,
                dailyFat: 67
            },
            mealPlanPreferences: {
                familySize: 2,
                budget: 50,
                cookingTime: 45,
                dietaryRestrictions: [],
                cuisinePreferences: []
            },
            theme: 'dark',
            notifications: {
                mealReminders: true,
                nutritionGoals: true,
                weeklyReports: true
            }
        };
    }

    handleAuthError(error) {
        let message = 'An error occurred. Please try again.';
        
        switch (error.code) {
            case 'auth/user-not-found':
                message = 'No account found with this email address.';
                break;
            case 'auth/wrong-password':
                message = 'Incorrect password. Please try again.';
                break;
            case 'auth/email-already-in-use':
                message = 'An account with this email already exists.';
                break;
            case 'auth/weak-password':
                message = 'Password is too weak. Please choose a stronger password.';
                break;
            case 'auth/invalid-email':
                message = 'Invalid email address format.';
                break;
            case 'auth/user-disabled':
                message = 'This account has been disabled.';
                break;
            case 'auth/too-many-requests':
                message = 'Too many failed attempts. Please try again later.';
                break;
            case 'auth/popup-closed-by-user':
                message = 'Sign-in was cancelled.';
                break;
            case 'auth/popup-blocked':
                message = 'Pop-up was blocked. Please allow pop-ups and try again.';
                break;
            default:
                console.error('Auth error:', error);
                message = error.message || message;
        }
        
        this.showError(message);
    }

    // UI Management
    showLogin() {
        this.hideAllCards();
        const loginCard = document.getElementById('loginCard');
        if (loginCard) {
            loginCard.style.display = 'block';
            loginCard.classList.add('fade-in');
        }
    }

    showSignUp() {
        this.hideAllCards();
        const signupCard = document.getElementById('signupCard');
        if (signupCard) {
            signupCard.style.display = 'block';
            signupCard.classList.add('fade-in');
        }
    }

    showForgotPassword() {
        this.hideAllCards();
        const forgotCard = document.getElementById('forgotCard');
        if (forgotCard) {
            forgotCard.style.display = 'block';
            forgotCard.classList.add('fade-in');
        }
    }

    hideAllCards() {
        const cards = document.querySelectorAll('.auth-card > div');
        cards.forEach(card => {
            card.style.display = 'none';
            card.classList.remove('fade-in');
        });
    }

    redirectToApp() {
        // Show body if hidden
        document.body.style.display = 'block';
        
        // Redirect to main app
        if (window.location.pathname.includes('login.html')) {
            window.location.href = 'index.html';
        }
    }

    showLoginForm() {
        // Show login form if not authenticated
        const currentPath = window.location.pathname;
        if (!currentPath.includes('login.html')) {
            window.location.href = 'login.html';
        }
    }

    showLoading(message) {
        // Show loading state on buttons
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(btn => {
            if (btn.classList.contains('btn-primary') || btn.classList.contains('btn-google')) {
                btn.disabled = true;
                const originalText = btn.innerHTML;
                btn.innerHTML = `
                    <span class="loading-spinner"></span>
                    ${message}
                `;
                btn.dataset.originalText = originalText;
            }
        });
    }

    hideLoading() {
        // Restore button states
        const buttons = document.querySelectorAll('.btn[data-original-text]');
        buttons.forEach(btn => {
            btn.disabled = false;
            btn.innerHTML = btn.dataset.originalText;
            delete btn.dataset.originalText;
        });
    }

    showSuccess(message) {
        this.showAlert(message, 'success');
    }

    showError(message) {
        this.showAlert(message, 'danger');
    }

    showAlert(message, type) {
        // Remove existing alerts
        const existingAlerts = document.querySelectorAll('.auth-alert');
        existingAlerts.forEach(alert => alert.remove());

        // Create new alert
        const alert = document.createElement('div');
        alert.className = `alert alert-${type} auth-alert`;
        alert.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'} me-2"></i>
            ${message}
        `;

        // Insert at top of active form
        const activeCard = document.querySelector('.auth-card > div[style*="block"]');
        if (activeCard) {
            activeCard.insertBefore(alert, activeCard.firstChild);
        }

        // Auto-remove success messages
        if (type === 'success') {
            setTimeout(() => {
                if (alert.parentNode) {
                    alert.remove();
                }
            }, 3000);
        }
    }

    // Password visibility toggle
    togglePasswordVisibility(inputId, iconId) {
        const passwordInput = document.getElementById(inputId);
        const toggleIcon = document.getElementById(iconId);
        
        if (passwordInput && toggleIcon) {
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                toggleIcon.classList.remove('fa-eye');
                toggleIcon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                toggleIcon.classList.remove('fa-eye-slash');
                toggleIcon.classList.add('fa-eye');
            }
        }
    }

    // Check if user is authenticated
    isAuthenticated() {
        return this.currentUser !== null;
    }

    // Get current user info
    getCurrentUser() {
        return this.currentUser;
    }

    // Check if user is guest
    isGuest() {
        return this.currentUser?.isAnonymous || false;
    }

    // Upgrade guest account to full account
    async upgradeGuestAccount(email, password, displayName) {
        try {
            if (!this.isGuest()) {
                throw new Error('User is not a guest');
            }

            const credential = firebase.auth.EmailAuthProvider.credential(email, password);
            const result = await this.currentUser.linkWithCredential(credential);
            
            // Update profile
            await result.user.updateProfile({
                displayName: displayName
            });

            // Update user document
            await this.createUserDocument({
                uid: result.user.uid,
                email: email,
                displayName: displayName,
                authProvider: 'email',
                isGuest: false,
                upgradedAt: new Date().toISOString()
            });

            this.showSuccess('Account upgraded successfully!');
            return result.user;

        } catch (error) {
            this.handleAuthError(error);
            throw error;
        }
    }
}

// Global functions for HTML onclick events
function togglePassword(inputId = 'password', iconId = 'passwordToggle') {
    if (window.authManager) {
        window.authManager.togglePasswordVisibility(inputId, iconId);
    }
}

function toggleSignupPassword() {
    togglePassword('signupPassword', 'signupPasswordToggle');
}

function showLogin() {
    if (window.authManager) {
        window.authManager.showLogin();
    }
}

function showSignUp() {
    if (window.authManager) {
        window.authManager.showSignUp();
    }
}

function showForgotPassword() {
    if (window.authManager) {
        window.authManager.showForgotPassword();
    }
}

function signInWithGoogle() {
    if (window.authManager) {
        window.authManager.signInWithGoogle();
    }
}

function signInAsGuest() {
    if (window.authManager) {
        window.authManager.signInAsGuest();
    }
}

function logout() {
    if (window.authManager) {
        window.authManager.signOut();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait for Firebase to be initialized
    const initAuth = () => {
        if (window.firebaseConfig && window.firebaseConfig.auth) {
            window.authManager = new AuthManager();
        } else {
            setTimeout(initAuth, 100);
        }
    };
    initAuth();
});

console.log('Auth system loaded');