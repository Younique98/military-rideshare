import { useContext, createContext, useMemo } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { useQuery } from "@tanstack/react-query";


interface IAuthContext {
  user: User | null;
  isLoggedIn: boolean;
}

// Context to store authentication state
export const AuthContext = createContext<IAuthContext | undefined>(undefined);

// Hook to fetch user auth state
const fetchAuthState = (): Promise<User | null> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      resolve(user);
    });
    return () => unsubscribe();
  });
};

// Auth Provider Using React Query
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { data: user, isLoading } = useQuery({
    queryKey: ["authUser"],
    queryFn: fetchAuthState,
    staleTime: Infinity, // Keeps user data cached indefinitely until logout
  });

  const contextValue = useMemo(
    () => ({
      user: user ?? null,
      isLoggedIn: !!user,
    }),
    [user]
  );
    
  return (
    <AuthContext.Provider value={contextValue}>
      {isLoading ? children : <p>Loading...</p>}
    </AuthContext.Provider>
  );
};

// Hook to use AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};