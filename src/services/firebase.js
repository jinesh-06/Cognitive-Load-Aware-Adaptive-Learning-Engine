import { initializeApp, getApps, getApp } from 'firebase/app';

import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    updateProfile,
    onAuthStateChanged,
    GoogleAuthProvider,
    GithubAuthProvider,
    EmailAuthProvider,
    signInWithPopup,
    linkWithCredential,
    fetchSignInMethodsForEmail
} from 'firebase/auth';


// ============================================================
// FIREBASE CONFIGURATION
// ============================================================

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};


// ============================================================
// CHECK FIREBASE CONFIGURATION
// ============================================================

const requiredKeys = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
];

const missingKeys = requiredKeys.filter(
    (key) => !
    import.meta.env[key]
);

export const isFirebaseConfigured =
    missingKeys.length === 0;

console.log('[Firebase] Configuration check:', {
    apiKey: Boolean(firebaseConfig.apiKey),
    authDomain: Boolean(firebaseConfig.authDomain),
    projectId: Boolean(firebaseConfig.projectId),
    storageBucket: Boolean(firebaseConfig.storageBucket),
    messagingSenderId: Boolean(firebaseConfig.messagingSenderId),
    appId: Boolean(firebaseConfig.appId)
});

console.log(
    '[Firebase] Firebase configured:',
    isFirebaseConfigured
);

if (missingKeys.length > 0) {
    console.error(
        '[Firebase] Missing environment variables:',
        missingKeys
    );
}


// ============================================================
// INITIALIZE FIREBASE
// ============================================================

let app = null;
let auth = null;

if (isFirebaseConfigured) {
    try {
        app =
            getApps().length > 0 ?
            getApp() :
            initializeApp(firebaseConfig);

        auth = getAuth(app);

        console.log(
            '[Firebase] Firebase initialized successfully.'
        );
    } catch (error) {
        console.error(
            '[Firebase] Firebase initialization failed:',
            error
        );

        app = null;
        auth = null;
    }
}


// ============================================================
// EXPORT FIREBASE INSTANCES
// ============================================================

export { app, auth };


// ============================================================
// GOOGLE AUTH PROVIDER
// ============================================================

const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
    prompt: 'select_account'
});


// ============================================================
// GITHUB AUTH PROVIDER
// ============================================================

const githubProvider = new GithubAuthProvider();

githubProvider.addScope('read:user');
githubProvider.addScope('user:email');


// ============================================================
// FIREBASE ERROR HANDLER
// ============================================================

export function getFriendlyErrorMessage(error) {
    if (!error) {
        return 'An unknown authentication error occurred.';
    }

    const code = error.code || '';
    const message = error.message || '';

    console.error(
        '[Firebase] Error:',
        code,
        message
    );

    switch (code) {

        // ====================================================
        // EMAIL AUTHENTICATION
        // ====================================================

        case 'auth/email-already-in-use':
            return 'This email address is already registered. Please sign in instead.';

        case 'auth/invalid-email':
            return 'Please enter a valid email address.';

        case 'auth/operation-not-allowed':
            return 'This authentication method is not enabled in Firebase Console.';

        case 'auth/weak-password':
            return 'Password must be at least 6 characters.';

        case 'auth/user-disabled':
            return 'This user account has been disabled.';

        case 'auth/user-not-found':
            return 'No account found with this email address.';

        case 'auth/wrong-password':
            return 'Incorrect email or password.';

        case 'auth/invalid-login-credentials':
            return 'Incorrect email or password.';

        case 'auth/invalid-credential':
            return 'The authentication credential is invalid. Please try again.';

        case 'auth/too-many-requests':
            return 'Too many failed attempts. Please try again later.';

        case 'auth/network-request-failed':
            return 'Network error. Please check your internet connection.';


            // ====================================================
            // POPUP AUTHENTICATION
            // ====================================================

        case 'auth/popup-closed-by-user':
            return 'Sign-in was cancelled because the popup was closed.';

        case 'auth/popup-blocked':
            return 'The browser blocked the sign-in popup. Please allow popups for this site.';

        case 'auth/cancelled-popup-request':
            return 'Another sign-in popup is already open.';


            // ====================================================
            // OAUTH / PROVIDER AUTHENTICATION
            // ====================================================

        case 'auth/account-exists-with-different-credential':
            return 'An account already exists with this email using another sign-in method.';

        case 'auth/credential-already-in-use':
            return 'This sign-in credential is already linked to another user account.';

        case 'auth/provider-already-linked':
            return 'This provider is already linked to your account.';

        case 'auth/requires-recent-login':
            return 'This operation requires recent authentication. Please sign in again.';

        case 'auth/unauthorized-domain':
            return 'This domain is not authorized in Firebase Authentication settings.';

        case 'auth/invalid-oauth-provider':
            return 'The OAuth provider is not configured correctly in Firebase.';

        case 'auth/web-storage-unsupported':
            return 'Your browser does not support the required authentication storage.';

        case 'auth/operation-not-supported-in-this-environment':
            return 'This authentication operation is not supported in this browser environment.';


            // ====================================================
            // DEFAULT
            // ====================================================

        default:
            return (
                message ||
                'Authentication failed. Please try again.'
            );
    }
}


// ============================================================
// GOOGLE LOGIN
// ============================================================

export async function loginWithGoogle() {
    if (!isFirebaseConfigured || !auth) {
        console.error(
            '[Firebase] Google login cannot start because Firebase is not configured.'
        );

        return {
            user: null,
            error: 'Firebase is not configured correctly.'
        };
    }

    try {
        console.log(
            '[Firebase] Starting Google login...'
        );

        const result = await signInWithPopup(
            auth,
            googleProvider
        );

        const user = result.user;

        console.log(
            '[Firebase] Google login successful:',
            user.email
        );

        return {
            user,
            error: null
        };

    } catch (error) {
        console.error(
            '[Firebase] Google login error:',
            error
        );

        // Auto-resolve account-exists-with-different-credential
        if (error.code === 'auth/account-exists-with-different-credential') {
            console.log(
                '[Firebase] Account exists with different credential during Google login. Attempting account linking...'
            );

            try {
                const pendingCredential =
                    GoogleAuthProvider.credentialFromError(error);
                const email =
                    error.customData?.email || error.email;

                let methods = [];
                if (email) {
                    try {
                        methods = await fetchSignInMethodsForEmail(auth, email);
                    } catch (fetchErr) {
                        console.warn(
                            '[Firebase] Could not fetch sign-in methods for email:',
                            fetchErr
                        );
                    }
                }

                // If existing account uses Email/Password
                if (
                    methods.includes(EmailAuthProvider.PROVIDER_ID) ||
                    methods.includes('password')
                ) {
                    return {
                        user: null,
                        error: 'An account already exists with this email using Email/Password. Please sign in with your email and password first.'
                    };
                }

                // If existing account uses GitHub
                if (
                    methods.includes(GithubAuthProvider.PROVIDER_ID) ||
                    methods.includes('github.com')
                ) {
                    console.log(
                        '[Firebase] Existing GitHub account detected. Prompting GitHub sign-in to link Google account...'
                    );

                    const githubResult = await signInWithPopup(
                        auth,
                        githubProvider
                    );

                    const existingUser = githubResult.user;

                    if (pendingCredential && existingUser) {
                        console.log(
                            '[Firebase] Linking Google credential to existing user:',
                            existingUser.email
                        );

                        const linkResult = await linkWithCredential(
                            existingUser,
                            pendingCredential
                        );

                        const linkedUser = linkResult.user || existingUser;

                        console.log(
                            '[Firebase] Google successfully linked to existing account:',
                            linkedUser.email
                        );

                        return {
                            user: linkedUser,
                            error: null
                        };
                    }

                    return {
                        user: existingUser,
                        error: null
                    };
                }

            } catch (linkError) {
                console.error(
                    '[Firebase] Account linking failed during Google login:',
                    linkError
                );

                return {
                    user: null,
                    error: getFriendlyErrorMessage(linkError)
                };
            }
        }

        return {
            user: null,
            error: getFriendlyErrorMessage(error)
        };
    }
}


// ============================================================
// GITHUB LOGIN
// ============================================================

export async function loginWithGithub() {
    if (!isFirebaseConfigured || !auth) {
        console.error(
            '[Firebase] GitHub login cannot start because Firebase is not configured.'
        );

        return {
            user: null,
            error: 'Firebase is not configured correctly.'
        };
    }

    try {
        console.log(
            '[Firebase] Starting GitHub login...'
        );

        const result = await signInWithPopup(
            auth,
            githubProvider
        );

        const user = result.user;

        console.log(
            '[Firebase] GitHub login successful:',
            user.email
        );

        return {
            user,
            error: null
        };

    } catch (error) {
        console.error(
            '[Firebase] GitHub login error:',
            error
        );

        // Auto-resolve account-exists-with-different-credential
        if (error.code === 'auth/account-exists-with-different-credential') {
            console.log(
                '[Firebase] Account exists with different credential during GitHub login. Attempting account linking...'
            );

            try {
                const pendingCredential =
                    GithubAuthProvider.credentialFromError(error);
                const email =
                    error.customData?.email || error.email;

                let methods = [];
                if (email) {
                    try {
                        methods = await fetchSignInMethodsForEmail(auth, email);
                    } catch (fetchErr) {
                        console.warn(
                            '[Firebase] Could not fetch sign-in methods for email:',
                            fetchErr
                        );
                    }
                }

                // If existing account uses Email/Password
                if (
                    methods.includes(EmailAuthProvider.PROVIDER_ID) ||
                    methods.includes('password')
                ) {
                    return {
                        user: null,
                        error: 'An account already exists with this email using Email/Password. Please sign in with your email and password first, then link your GitHub account.'
                    };
                }

                // If existing account uses Google (or default OAuth provider)
                console.log(
                    '[Firebase] Existing Google account detected. Prompting Google sign-in to link GitHub account...'
                );

                const googleResult = await signInWithPopup(
                    auth,
                    googleProvider
                );

                const existingUser = googleResult.user;

                if (pendingCredential && existingUser) {
                    console.log(
                        '[Firebase] Linking GitHub credential to existing user account:',
                        existingUser.email
                    );

                    const linkResult = await linkWithCredential(
                        existingUser,
                        pendingCredential
                    );

                    const linkedUser = linkResult.user || existingUser;

                    console.log(
                        '[Firebase] GitHub successfully linked to existing account:',
                        linkedUser.email
                    );

                    return {
                        user: linkedUser,
                        error: null
                    };
                }

                return {
                    user: existingUser,
                    error: null
                };

            } catch (linkError) {
                console.error(
                    '[Firebase] Account linking failed during GitHub login:',
                    linkError
                );

                return {
                    user: null,
                    error: getFriendlyErrorMessage(linkError)
                };
            }
        }

        return {
            user: null,
            error: getFriendlyErrorMessage(error)
        };
    }
}


// ============================================================
// EMAIL REGISTRATION
// ============================================================

export async function registerWithEmail(
    fullName,
    email,
    password
) {
    if (!isFirebaseConfigured || !auth) {
        return {
            user: null,
            error: 'Firebase is not configured correctly.'
        };
    }

    try {
        const userCredential =
            await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

        const user = userCredential.user;

        if (fullName && user) {
            await updateProfile(user, {
                displayName: fullName
            });
        }

        console.log(
            '[Firebase] Email registration successful:',
            user.email
        );

        return {
            user,
            error: null
        };

    } catch (error) {
        console.error(
            '[Firebase] Registration error:',
            error
        );

        return {
            user: null,
            error: getFriendlyErrorMessage(error)
        };
    }
}


// ============================================================
// EMAIL LOGIN
// ============================================================

export async function loginWithEmail(
    email,
    password
) {
    if (!isFirebaseConfigured || !auth) {
        return {
            user: null,
            error: 'Firebase is not configured correctly.'
        };
    }

    try {
        const userCredential =
            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

        const user = userCredential.user;

        console.log(
            '[Firebase] Email login successful:',
            user.email
        );

        return {
            user,
            error: null
        };

    } catch (error) {
        console.error(
            '[Firebase] Email login error:',
            error
        );

        return {
            user: null,
            error: getFriendlyErrorMessage(error)
        };
    }
}


// ============================================================
// PASSWORD RESET
// ============================================================

export async function resetPassword(email) {
    if (!email) {
        return {
            success: false,
            error: 'Please enter your email address first.'
        };
    }

    if (!isFirebaseConfigured || !auth) {
        return {
            success: false,
            error: 'Firebase is not configured correctly.'
        };
    }

    try {
        await sendPasswordResetEmail(
            auth,
            email
        );

        return {
            success: true,
            message: `Password reset email sent to ${email}.`
        };

    } catch (error) {
        console.error(
            '[Firebase] Password reset error:',
            error
        );

        return {
            success: false,
            error: getFriendlyErrorMessage(error)
        };
    }
}


// ============================================================
// LOGOUT
// ============================================================

export async function logoutUser() {
    if (auth) {
        try {
            await signOut(auth);

            console.log(
                '[Firebase] User signed out.'
            );
        } catch (error) {
            console.error(
                '[Firebase] Logout error:',
                error
            );
        }
    }

    try {
        localStorage.removeItem(
            'adaptive_learning_user'
        );
    } catch (error) {
        console.error(
            '[Firebase] Local storage cleanup failed:',
            error
        );
    }
}


// ============================================================
// CREATE APPLICATION USER
// ============================================================

function createAppUser(firebaseUser) {
    if (!firebaseUser) {
        return null;
    }

    const email =
        firebaseUser.email || '';

    const normalizedEmail =
        email.toLowerCase();

    const isEmailAdmin =
        normalizedEmail.includes('admin') ||
        normalizedEmail ===
        'sarah.chen@stanford.edu';

    const fallbackName =
        email
        .split('@')[0]
        .replace('.', ' ');

    return {
        uid: firebaseUser.uid,

        name: firebaseUser.displayName ||
            fallbackName ||
            'Learner',

        email: email,

        avatarUrl: firebaseUser.photoURL || null,

        emailVerified: firebaseUser.emailVerified,

        role: isEmailAdmin ?
            'Admin' : 'Learner',

        isAdmin: isEmailAdmin,

        id: isEmailAdmin ?
            'ADM-001' : `usr-${firebaseUser.uid.slice(0, 6)}`,

        isAuthenticated: true,

        loginTime: new Date().toISOString(),

        provider: firebaseUser.providerData &&
            firebaseUser.providerData.length > 0 ?
            firebaseUser.providerData[0].providerId : 'firebase'
    };
}


// ============================================================
// AUTH STATE LISTENER
// ============================================================

export function subscribeToAuthChanges(callback) {
    if (!auth) {
        callback(null);
        return () => {};
    }

    return onAuthStateChanged(
        auth,
        (firebaseUser) => {

            if (!firebaseUser) {
                callback(null);
                return;
            }

            const user =
                createAppUser(firebaseUser);

            try {
                localStorage.setItem(
                    'adaptive_learning_user',
                    JSON.stringify(user)
                );
            } catch (error) {
                console.error(
                    '[Firebase] Failed to save user:',
                    error
                );
            }

            callback(user);
        }
    );
}