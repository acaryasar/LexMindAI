import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  roles?: string[];
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  setAuth: (user, accessToken, refreshToken) => {
    // Store tokens in sessionStorage instead of localStorage for better security
    sessionStorage.setItem('accessToken', accessToken);
    sessionStorage.setItem('refreshToken', refreshToken);
    sessionStorage.setItem('user', JSON.stringify(user));
    
    set({
      user,
      accessToken,
      refreshToken,
      isAuthenticated: true,
    });
  },
  logout: () => {
    // Clear tokens from sessionStorage
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('user');
    
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  },
}));

// Initialize state from sessionStorage on app load
const initializeAuth = () => {
  const accessToken = sessionStorage.getItem('accessToken');
  const refreshToken = sessionStorage.getItem('refreshToken');
  const userStr = sessionStorage.getItem('user');
  
  if (accessToken && refreshToken && userStr) {
    const user = JSON.parse(userStr);
    useAuthStore.setState({
      user,
      accessToken,
      refreshToken,
      isAuthenticated: true,
    });
  }
};

// Call initialization
if (typeof window !== 'undefined') {
  initializeAuth();
}
