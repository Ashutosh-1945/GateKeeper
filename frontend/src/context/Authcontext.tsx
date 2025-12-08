import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  getIdToken
} from "firebase/auth";
import type { User } from "firebase/auth";
import { auth } from "../firebase";

// Extended user type with role
interface AppUser {
  firebaseUser: User;
  role: 'user' | 'admin';
  email: string | null;
  uid: string;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  getToken: () => Promise<string | null>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Admin email list (you can also store this in Firestore)
const ADMIN_EMAILS = [
  'admin@gatekeeper.com',
  'ashutosh1945@gmail.com',
  'mujjawal774@gmail.com', // Your admin email
];

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Determine role based on email or custom claims
        const role = ADMIN_EMAILS.includes(firebaseUser.email || '') ? 'admin' : 'user';
        
        setUser({
          firebaseUser,
          role,
          email: firebaseUser.email,
          uid: firebaseUser.uid,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const getToken = async (): Promise<string | null> => {
    if (user?.firebaseUser) {
      return await getIdToken(user.firebaseUser);
    }
    return null;
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    getToken,
    isAdmin: user?.role === 'admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
