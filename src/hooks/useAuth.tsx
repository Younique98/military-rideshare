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
  return new Promise( ( resolve ) => {
    console.log('fetchAuthState')
    const unsubscribe = onAuthStateChanged( auth, ( firebaseUser ) => {
      console.log( 'user auth state changed', firebaseUser )
      resolve(firebaseUser);
    });
    return () => unsubscribe();
  });
};

// Auth Provider Using React Query
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["authUser"],
    queryFn: fetchAuthState,
    staleTime: Infinity, // Keeps user data cached indefinitely until logout
    refetchOnMount: false, // Prevents refetching on component mount
refetchOnReconnect: false, // Prevents refetching on reconnect    
  });

  const contextValue = useMemo(
    () => ({
      user: user ?? null,
      isLoggedIn: !!user,
    }),
    [user]
  );
    
  console.log("🚀 useAuth Query Loading:", isLoading);
  console.log("✅ useAuth User Data:", user);
  console.log( "❌ useAuth Error:", error );
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
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