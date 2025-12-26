import { create } from 'zustand';
import api from '../services/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}
async function testFetch() {
  console.log('🧪 Testing FETCH...');
  try {
    const response = await fetch('http://localhost:3001/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@test.com',
        password: 'test123',
        firstName: 'Test',
        lastName: 'User'
      })
    });
    console.log('✅ Fetch response status:', response.status);
    const data = await response.json();
    console.log('✅ Fetch response data:', data);
  } catch (err) {
    console.error('❌ Fetch error:', err);
  }
}
export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  isLoading: false,
  error: null,

register: async (email, password, firstName, lastName) => {
  set({ isLoading: true, error: null });
  console.log('🔵 Register called with:', { email, firstName, lastName });
  try {
    console.log('🔵 Making API call to:', `${api.defaults.baseURL}/auth/register`);
    const response = await api.post('/auth/register', {
      email,
      password,
      firstName,
      lastName,
    });

    console.log('🟢 API Response:', response.data);
    const { token, user } = response.data;
    set({ token, user, isLoading: false });
    localStorage.setItem('token', token);
  } catch (error: any) {
    console.error('🔴 FULL Error object:', error);
    console.error('🔴 Error message:', error.message);
    console.error('🔴 Error response:', error.response);
    console.error('🔴 Error code:', error.code);
    
    const message = error.response?.data?.message || 'Registration failed';
    set({ error: message, isLoading: false });
    throw error;
  }
},



  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', { email, password });
      
      const { token, user } = response.data;
      set({ token, user, isLoading: false });
      localStorage.setItem('token', token);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  logout: () => {
    set({ user: null, token: null });
    localStorage.removeItem('token');
  },

  clearError: () => set({ error: null }),
}));
(window as any).testFetch = testFetch;