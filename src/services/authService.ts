import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../lib/firebase';
import { AppUser, UserRole } from '../types';

function formatAuthError(err: any): string {
  const code = err?.code;
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
      return 'Invalid email address or passcode. Please check your credentials.';
    case 'auth/user-not-found':
      return 'No staff account found with this email address.';
    case 'auth/invalid-email':
      return 'The email address format is invalid.';
    case 'auth/user-disabled':
      return 'This staff account has been deactivated. Please contact your beach administrator.';
    case 'auth/too-many-requests':
      return 'Access temporarily locked due to multiple failed login attempts. Please try again shortly.';
    case 'auth/network-request-failed':
      return 'Network connection error. Unable to reach Firebase authentication servers.';
    case 'auth/email-already-in-use':
      return 'This email address is already in use by another account.';
    case 'auth/weak-password':
      return 'The password is too weak. Please use at least 6 characters.';
    default:
      return err?.message || 'Authentication failed. Please verify your credentials.';
  }
}

class AuthService {
  /**
   * Listen to Firebase Auth state changes and sync role from Firestore users/{uid}
   */
  onAuthStateChange(callback: (user: AppUser | null, isLoading: boolean) => void): () => void {
    if (!isFirebaseConfigured || !auth) {
      // If Firebase is not configured, user starts as unauthenticated guest
      callback(null, false);
      return () => {};
    }

    return onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      if (!fbUser) {
        callback(null, false);
        return;
      }

      try {
        let role: UserRole = 'tourist';
        let assignedBeaches: string[] = [];
        let badgeNumber: string | undefined;
        let phoneNumber: string | undefined;
        let displayName = fbUser.displayName || fbUser.email?.split('@')[0] || 'Beach Visitor';

        if (db) {
          const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            role = data.role || 'tourist';
            assignedBeaches = data.assignedBeaches || [];
            badgeNumber = data.badgeNumber;
            phoneNumber = data.phoneNumber;
            if (data.displayName) displayName = data.displayName;
          }
        }

        const appUser: AppUser = {
          uid: fbUser.uid,
          email: fbUser.email || '',
          displayName,
          role,
          assignedBeaches,
          badgeNumber,
          phoneNumber
        };

        callback(appUser, false);
      } catch (err) {
        console.error('[Auth] Error fetching user role from Firestore:', err);
        // Fallback to basic tourist profile on read error
        callback({
          uid: fbUser.uid,
          email: fbUser.email || '',
          displayName: fbUser.displayName || 'Visitor',
          role: 'tourist',
          assignedBeaches: []
        }, false);
      }
    });
  }

  /**
   * Tourist Email/Password Login
   */
  async loginTourist(email: string, pass: string): Promise<AppUser> {
    if (!isFirebaseConfigured || !auth) {
      throw new Error(
        'Firebase Authentication is not configured. Please add your VITE_FIREBASE_* credentials to .env to enable real authentication.'
      );
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      const fbUser = cred.user;

      let role: UserRole = 'tourist';
      let assignedBeaches: string[] = [];
      let displayName = fbUser.displayName || 'Beach Visitor';

      if (db) {
        const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          role = data.role || 'tourist';
          assignedBeaches = data.assignedBeaches || [];
          if (data.displayName) displayName = data.displayName;
        }
      }

      return {
        uid: fbUser.uid,
        email: fbUser.email || email,
        displayName,
        role,
        assignedBeaches
      };
    } catch (err: any) {
      throw new Error(formatAuthError(err));
    }
  }

  /**
   * Tourist Email/Password Registration
   */
  async registerTourist(email: string, pass: string, name: string): Promise<AppUser> {
    if (!isFirebaseConfigured || !auth) {
      throw new Error(
        'Firebase Authentication is not configured. Please add your VITE_FIREBASE_* credentials to .env to enable registration.'
      );
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      const fbUser = cred.user;

      await updateProfile(fbUser, { displayName: name });

      const newUser: AppUser = {
        uid: fbUser.uid,
        email: fbUser.email || email,
        displayName: name || 'Beach Visitor',
        role: 'tourist',
        assignedBeaches: []
      };

      if (db) {
        try {
          await setDoc(doc(db, 'users', fbUser.uid), {
            ...newUser,
            createdAt: new Date().toISOString()
          });
        } catch (err) {
          console.warn('[Auth] Could not write user doc to Firestore:', err);
        }
      }

      return newUser;
    } catch (err: any) {
      throw new Error(formatAuthError(err));
    }
  }

  /**
   * Staff Email/Password Login with Mandatory Role Verification
   * Rejects any user who is not explicitly a 'lifeguard', 'beach_authority_admin', or 'super_admin' in Firestore
   */
  async loginStaff(email: string, pass: string): Promise<AppUser> {
    if (!isFirebaseConfigured || !auth) {
      throw new Error(
        'Firebase Authentication is not configured. Please set your VITE_FIREBASE_* variables in .env to enable staff login.'
      );
    }

    let cred;
    try {
      cred = await signInWithEmailAndPassword(auth, email, pass);
    } catch (err: any) {
      throw new Error(formatAuthError(err));
    }

    const fbUser = cred.user;

    if (!db) {
      await signOut(auth);
      throw new Error('Firestore is unavailable for staff role verification.');
    }

    try {
      const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
      if (!userDoc.exists()) {
        await signOut(auth);
        throw new Error(
          `Access Denied: No staff profile found in Firestore (users/${fbUser.uid}). Provision this account in Firestore with role: "lifeguard" or "beach_authority_admin".`
        );
      }

      const data = userDoc.data();
      const role: UserRole = data.role;

      if (role !== 'lifeguard' && role !== 'beach_authority_admin' && role !== 'super_admin') {
        await signOut(auth);
        throw new Error(
          `Access Denied: This account is registered with role "${role}" and cannot access the staff operations center. Only lifeguard, beach_authority_admin, or super_admin are authorized.`
        );
      }

      return {
        uid: fbUser.uid,
        email: fbUser.email || email,
        displayName: data.displayName || fbUser.displayName || 'Staff Officer',
        role,
        assignedBeaches: data.assignedBeaches || [],
        badgeNumber: data.badgeNumber,
        phoneNumber: data.phoneNumber
      };
    } catch (err: any) {
      if (err.message?.startsWith('Access Denied:')) {
        throw err;
      }
      if (err.code === 'permission-denied') {
        await signOut(auth);
        throw new Error('Firestore permission denied. Check your Firestore Security Rules to permit authenticated users to read their users/{uid} document.');
      }
      throw err;
    }
  }

  /**
   * Sign Out
   */
  async logout(): Promise<void> {
    if (auth) {
      await signOut(auth);
    }
  }
}

export const authService = new AuthService();
