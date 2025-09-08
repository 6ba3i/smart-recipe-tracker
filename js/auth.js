// Authentication Logic for Smart Recipe Tracker

class AuthManager {
    constructor() {
        this.auth = null;
        this.db = null;
        this.googleProvider = null;
        this.isInitialized = false;
        
        this.init();
    }

    async init() {
        try {
            // Wait for Firebase to be initialized
            await this.waitForFirebase();
            
            // Get Firebase services
            const firebaseServices = window.firebaseConfig;
            
            if (!firebaseServices || !firebaseServices.auth) {
                throw new Error('Firebase services not available');
            }
            
            this.auth = firebaseServices.auth;
            this.db = firebaseServices.db;
            this.googleProvider = firebaseServices.googleProvider;
            
            // Check if user is already authenticated
            this.auth.onAuthStateChanged((user) => {
                if (user) {
                    console.log('👤 User is signed in:', user.email);
                    this.redirectToApp();
                } else {
                    console.log('👤 User is signed out');
                    this.showLoginForm();
                }
            });
            
            this.bindEvents();
            this.isInitialized = true;
            
            console.log('🔐 Auth Manager initialized successfully');
            
        } catch (error) {
            console.error('❌ Auth Manager initialization failed:', error);
            this.showInitializationError(error);
        }
    }

    async waitForFirebase() {
        let attempts = 0;
        const maxAttempts = 100; // 10 seconds max wait
        
        while ((!window.firebaseManager || !window.firebaseManager.isReady()) && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (!window.firebaseManager || !window.firebaseManager.isReady()) {
            throw new Error('Firebase not initialized');
        }
        
        // Wait a bit more for services to be fully ready
        await new Promise(resolve => setTimeout(resolve, 200));
    }

    showInitializationError(error) {
        console.error('Auth initialization error:', error);
        
        // Show a user-friendly error message
        if (document.body) {
            const errorMessage = document.createElement('div');
            errorMessage.innerHTML = `
                <div style="
                    position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
                    background: #1e293b; color: #f8fafc; padding: 2rem; border-radius: 1rem;
                    border: 1px solid #ef4444; max-width: 400px; text-align: center;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
                    z-index: 10000;
                ">
                    <div style="font-size: 2rem; margin-bottom: 1rem;">⚠️</div>
                    <h3 style="color: #ef4444; margin-bottom: 1rem;">Authentication Error</h3>
                    <p style="margin-bottom: 1.5rem; line-height: 1.5;">
                        Unable to initialize authentication system.<br>
                        Please check your Firebase configuration.
                    </p>
                    <button onclick="location.reload()" style="
                        background: #6366f1; color: white; border: none;
                        padding: 0.75rem 1.5rem; border-radius: 0.5rem;
                        cursor: pointer; font-size: 1rem;
                    ">Retry</button>
                </div>
            `;
            document.body.appendChild(errorMessage);
        }
    }

    bindEvents() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Signup form
        const signupForm = document.getElementById('signupForm');
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => this.handleSignup(e));
        }

        // Forgot password form
        const forgotForm = document.getElementById('forgotForm');
        if (forgotForm) {
            forgotForm.addEventListener('submit', (e) => this.handleForgotPassword(e));
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;

        if (!this.validateEmail(email)) {
            this.showMessage('Please enter a valid email address', 'error');
            return;
        }

        if (password.length < 6) {
            this.showMessage('Password must be at least 6 characters long', 'error');
            return;
        }

        this.showLoading(true);
        
        try {
            // Set persistence based on remember me checkbox
            const persistence = rememberMe ? 
                firebase.auth.Auth.Persistence.LOCAL : 
                firebase.auth.Auth.Persistence.SESSION;
            
            await this.auth.setPersistence(persistence);
            
            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            console.log('Login successful:', user);
            this.showMessage('Login successful! Redirecting...', 'success');
            
            // Update user's last login
            await this.updateUserProfile(user.uid, {
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            setTimeout(() => {
                this.redirectToApp();
            }, 1000);
            
        } catch (error) {
            console.error('Login error:', error);
            this.showMessage(this.getErrorMessage(error), 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async handleSignup(e) {
        e.preventDefault();
        
        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const agreeTerms = document.getElementById('agreeTerms').checked;

        // Validation
        if (!firstName || !lastName) {
            this.showMessage('Please enter your first and last name', 'error');
            return;
        }

        if (!this.validateEmail(email)) {
            this.showMessage('Please enter a valid email address', 'error');
            return;
        }

        if (password.length < 6) {
            this.showMessage('Password must be at least 6 characters long', 'error');
            return;
        }

        if (password !== confirmPassword) {
            this.showMessage('Passwords do not match', 'error');
            return;
        }

        if (!agreeTerms) {
            this.showMessage('Please agree to the Terms of Service and Privacy Policy', 'error');
            return;
        }

        this.showLoading(true);
        
        try {
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // Update user profile
            await user.updateProfile({
                displayName: `${firstName} ${lastName}`
            });

            // Create user document in Firestore
            await this.createUserDocument(user.uid, {
                firstName,
                lastName,
                email,
                displayName: `${firstName} ${lastName}`,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
                preferences: {
                    dietaryRestrictions: [],
                    allergies: [],
                    favoritesCuisines: [],
                    nutritionGoals: {
                        calories: 2000,
                        protein: 150,
                        carbs: 200,
                        fat: 70
                    }
                }
            });
            
            console.log('Signup successful:', user);
            this.showMessage('Account created successfully! Redirecting...', 'success');
            
            setTimeout(() => {
                this.redirectToApp();
            }, 1000);
            
        } catch (error) {
            console.error('Signup error:', error);
            this.showMessage(this.getErrorMessage(error), 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async handleForgotPassword(e) {
        e.preventDefault();
        
        const email = document.getElementById('resetEmail').value;

        if (!this.validateEmail(email)) {
            this.showMessage('Please enter a valid email address', 'error');
            return;
        }

        this.showLoading(true);
        
        try {
            await this.auth.sendPasswordResetEmail(email);
            this.showMessage('Password reset email sent! Check your inbox.', 'success');
            
            setTimeout(() => {
                this.showLogin();
            }, 2000);
            
        } catch (error) {
            console.error('Password reset error:', error);
            this.showMessage(this.getErrorMessage(error), 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async signInWithGoogle() {
        this.showLoading(true);
        
        try {
            const result = await this.auth.signInWithPopup(this.googleProvider);
            const user = result.user;
            
            console.log('Google sign-in successful:', user);
            
            // Check if this is a new user
            const userDoc = await this.db.collection('users').doc(user.uid).get();
            
            if (!userDoc.exists) {
                // Create user document for new Google users
                const names = user.displayName ? user.displayName.split(' ') : ['', ''];
                await this.createUserDocument(user.uid, {
                    firstName: names[0] || '',
                    lastName: names.slice(1).join(' ') || '',
                    email: user.email,
                    displayName: user.displayName || '',
                    photoURL: user.photoURL || '',
                    provider: 'google',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
                    preferences: {
                        dietaryRestrictions: [],
                        allergies: [],
                        favoritesCuisines: [],
                        nutritionGoals: {
                            calories: 2000,
                            protein: 150,
                            carbs: 200,
                            fat: 70
                        }
                    }
                });
            } else {
                // Update last login for existing users
                await this.updateUserProfile(user.uid, {
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
            
            this.showMessage('Google sign-in successful! Redirecting...', 'success');
            
            setTimeout(() => {
                this.redirectToApp();
            }, 1000);
            
        } catch (error) {
            console.error('Google sign-in error:', error);
            this.showMessage(this.getErrorMessage(error), 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async createUserDocument(uid, userData) {
        try {
            await this.db.collection('users').doc(uid).set(userData);
        } catch (error) {
            console.error('Error creating user document:', error);
            throw error;
        }
    }

    async updateUserProfile(uid, data) {
        try {
            await this.db.collection('users').doc(uid).update(data);
        } catch (error) {
            console.error('Error updating user profile:', error);
        }
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    getErrorMessage(error) {
        switch (error.code) {
            case 'auth/user-not-found':
                return 'No account found with this email address.';
            case 'auth/wrong-password':
                return 'Incorrect password. Please try again.';
            case 'auth/email-already-in-use':
                return 'An account with this email already exists.';
            case 'auth/weak-password':
                return 'Password is too weak. Please choose a stronger password.';
            case 'auth/invalid-email':
                return 'Please enter a valid email address.';
            case 'auth/too-many-requests':
                return 'Too many failed attempts. Please try again later.';
            case 'auth/popup-closed-by-user':
                return 'Sign-in was cancelled. Please try again.';
            case 'auth/network-request-failed':
                return 'Network error. Please check your connection and try again.';
            default:
                return error.message || 'An unexpected error occurred. Please try again.';
        }
    }

    showMessage(message, type = 'info') {
        const container = document.getElementById('messageContainer');
        if (!container) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${type}`;
        messageDiv.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            ${message}
        `;

        container.appendChild(messageDiv);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 5000);
    }

    showLoading(show) {
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) {
            spinner.style.display = show ? 'flex' : 'none';
        }

        // Disable form buttons
        const buttons = document.querySelectorAll('.auth-btn');
        buttons.forEach(btn => {
            btn.disabled = show;
            if (show) {
                btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Loading...';
            } else {
                // Reset button text based on button id
                if (btn.id === 'loginBtn') {
                    btn.innerHTML = '<i class="fas fa-sign-in-alt me-2"></i>Sign In';
                } else if (btn.id === 'signupBtn') {
                    btn.innerHTML = '<i class="fas fa-user-plus me-2"></i>Create Account';
                } else if (btn.id === 'resetBtn') {
                    btn.innerHTML = '<i class="fas fa-paper-plane me-2"></i>Send Reset Link';
                }
            }
        });
    }

    showLogin() {
        this.hideAllCards();
        const loginCard = document.querySelector('.auth-card:first-child');
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
        const cards = document.querySelectorAll('.auth-card');
        cards.forEach(card => {
            card.style.display = 'none';
            card.classList.remove('fade-in');
        });
    }

    redirectToApp() {
        // Redirect to main app
        window.location.href = 'index.html';
    }

    showLoginForm() {
        // Show login form if not authenticated
        const currentPath = window.location.pathname;
        if (!currentPath.includes('login.html')) {
            window.location.href = 'login.html';
        }
    }
}

// Global functions for button clicks
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.getElementById('passwordToggle');
    
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

function toggleSignupPassword() {
    const passwordInput = document.getElementById('signupPassword');
    const toggleIcon = document.getElementById('signupPasswordToggle');
    
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