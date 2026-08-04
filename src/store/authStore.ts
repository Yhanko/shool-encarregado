import { create } from 'zustand';
import Cookies from 'js-cookie';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  institutionId: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
}

const TOKEN_KEY = 'yhanko_parent_token';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: Cookies.get(TOKEN_KEY) || null,
  isAuthenticated: !!Cookies.get(TOKEN_KEY),
  
  setUser: (user) => set({ user }),
  
  setToken: (token) => {
    if (token) {
      Cookies.set(TOKEN_KEY, token, { expires: 7, secure: true, sameSite: 'strict' });
      set({ token, isAuthenticated: true });
    } else {
      Cookies.remove(TOKEN_KEY);
      set({ token: null, isAuthenticated: false, user: null });
    }
  },
  
  logout: () => {
    Cookies.remove(TOKEN_KEY);
    set({ token: null, isAuthenticated: false, user: null });
  },
}));
