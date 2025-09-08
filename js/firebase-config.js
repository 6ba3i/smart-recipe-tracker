// Firebase Configuration with actual API keys
const firebaseConfig = {
    apiKey: "AIzaSyC_fnBK0vfP3U6SKhFWJP98CC6e2sjjIJs",
    authDomain: "nut-track.firebaseapp.com",
    projectId: "nut-track",
    storageBucket: "nut-track.firebasestorage.app",
    messagingSenderId: "656967210072",
    appId: "1:656967210072:web:5f17fc3d10e525e08ee62d",
    measurementId: "G-CVLLBVRBEF"
};

// Initialize Firebase
let app;
let db;
let auth;

try {
    // Initialize Firebase app
    app = firebase.initializeApp(firebaseConfig);
    
    // Initialize Firebase services
    db = firebase.firestore();
    auth = firebase.auth();
    
    console.log('Firebase initialized successfully');
    
    // Enable offline persistence
    if (db) {
        db.enablePersistence({ synchronizeTabs: true })
            .then(() => {
                console.log('Firestore offline persistence enabled');
            })
            .catch((err) => {
                if (err.code === 'failed-precondition') {
                    console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time');
                } else if (err.code === 'unimplemented') {
                    console.warn('The current browser doesn\'t support offline persistence');
                }
            });
    }
    
    // Set up authentication state listener
    auth.onAuthStateChanged((user) => {
        try {
            if (user) {
                console.log('User authenticated:', user.uid);
                document.body.style.display = 'block';
                
                // Initialize app if on main page
                if (!window.location.pathname.includes('login.html')) {
                    // Try to initialize the main app
                    if (typeof SmartRecipeApp !== 'undefined') {
                        window.app = new SmartRecipeApp();
                    } else {
                        console.log('Waiting for app classes to load...');
                    }
                }
            } else {
                console.log('User not authenticated');
                
                // Don't redirect if already on login page
                if (!window.location.pathname.includes('login.html')) {
                    // Sign in anonymously for demo purposes
                    auth.signInAnonymously()
                        .then(() => {
                            console.log('Anonymous authentication successful');
                        })
                        .catch((error) => {
                            console.error('Anonymous authentication failed:', error);
                            // Redirect to login page if anonymous auth fails
                            window.location.href = 'login.html';
                        });
                }
            }
        } catch (error) {
            console.error('Error in auth state change handler:', error);
        }
    });
    
} catch (error) {
    console.error('Firebase initialization error:', error);
    
    // Show user-friendly error message
    if (!window.location.pathname.includes('login.html')) {
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
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🔥</div>
                    <h2 style="color: #ef4444; margin-bottom: 1rem; font-size: 1.5rem;">Firebase Connection Error</h2>
                    <p style="margin-bottom: 1rem; line-height: 1.6;">
                        Unable to connect to Firebase services.<br>
                        Please check your internet connection and try again.
                    </p>
                    <button onclick="window.location.reload()" style="
                        background: #6366f1; color: white; border: none; 
                        padding: 0.75rem 1.5rem; border-radius: 0.5rem; 
                        cursor: pointer; font-weight: 600;
                    ">
                        Retry Connection
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(errorOverlay);
    }
}

// Database helper functions
const FirebaseHelper = {
    // Save user data
    async saveUserData(collection, data) {
        try {
            if (!auth.currentUser) {
                throw new Error('User not authenticated');
            }
            
            const userDoc = db.collection(collection).doc(auth.currentUser.uid);
            await userDoc.set(data, { merge: true });
            console.log(`Data saved to ${collection}:`, data);
            return true;
        } catch (error) {
            console.error(`Error saving to ${collection}:`, error);
            throw error;
        }
    },
    
    // Get user data
    async getUserData(collection) {
        try {
            if (!auth.currentUser) {
                throw new Error('User not authenticated');
            }
            
            const userDoc = await db.collection(collection).doc(auth.currentUser.uid).get();
            if (userDoc.exists) {
                return userDoc.data();
            } else {
                return null;
            }
        } catch (error) {
            console.error(`Error getting ${collection} data:`, error);
            throw error;
        }
    },
    
    // Add document to collection
    async addDocument(collection, data) {
        try {
            if (!auth.currentUser) {
                throw new Error('User not authenticated');
            }
            
            const docRef = await db.collection(collection).add({
                ...data,
                userId: auth.currentUser.uid,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            console.log(`Document added to ${collection} with ID:`, docRef.id);
            return docRef.id;
        } catch (error) {
            console.error(`Error adding document to ${collection}:`, error);
            throw error;
        }
    },
    
    // Get user's documents from collection
    async getUserDocuments(collection, orderBy = 'createdAt', orderDirection = 'desc') {
        try {
            if (!auth.currentUser) {
                throw new Error('User not authenticated');
            }
            
            const snapshot = await db.collection(collection)
                .where('userId', '==', auth.currentUser.uid)
                .orderBy(orderBy, orderDirection)
                .get();
            
            const documents = [];
            snapshot.forEach(doc => {
                documents.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            return documents;
        } catch (error) {
            console.error(`Error getting documents from ${collection}:`, error);
            throw error;
        }
    },
    
    // Update document
    async updateDocument(collection, docId, data) {
        try {
            await db.collection(collection).doc(docId).update({
                ...data,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            console.log(`Document updated in ${collection}:`, docId);
            return true;
        } catch (error) {
            console.error(`Error updating document in ${collection}:`, error);
            throw error;
        }
    },
    
    // Delete document
    async deleteDocument(collection, docId) {
        try {
            await db.collection(collection).doc(docId).delete();
            console.log(`Document deleted from ${collection}:`, docId);
            return true;
        } catch (error) {
            console.error(`Error deleting document from ${collection}:`, error);
            throw error;
        }
    }
};

// Export for global use
window.firebaseConfig = {
    app,
    db,
    auth,
    helper: FirebaseHelper
};

// Analytics (optional)
if (firebaseConfig.measurementId) {
    try {
        // You can add Google Analytics initialization here if needed
        console.log('Analytics measurement ID available:', firebaseConfig.measurementId);
    } catch (error) {
        console.warn('Analytics initialization failed:', error);
    }
}

console.log('Firebase configuration loaded successfully');