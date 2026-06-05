import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, tokenStorage } from '../services/api';
import { useRouter } from 'expo-router';

interface User {
  id: string;
  mobile: string;
  role: 'admin' | 'student';
  status: 'pending' | 'active' | 'blocked';
  assignedCourses: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (mobile: string) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const storedUser = await tokenStorage.getUser();
        const storedToken = await tokenStorage.getAccessToken();
        if (storedUser && storedToken) {
          setUser(storedUser);
        }
      } catch (e) {
        console.error('Error loading stored auth:', e);
      } finally {
        setLoading(false);
      }
    };
    loadStoredAuth();
  }, []);

  const login = async (mobile: string): Promise<User> => {
    setLoading(true);
    try {
      const response = await api.post('/api/auth/login', { mobile });
      const { accessToken, refreshToken, user: loggedUser } = response.data;
      
      const userData: User = {
        id: loggedUser.id,
        mobile: loggedUser.mobile,
        role: loggedUser.role,
        status: loggedUser.status,
        assignedCourses: loggedUser.assignedCourses || [],
      };

      await tokenStorage.saveTokens(accessToken, refreshToken, userData);
      setUser(userData);
      return userData;
    } catch (error) {
      await tokenStorage.clear();
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (user) {
        await api.post('/api/auth/logout', { userId: user.id });
      }
    } catch (e) {
      console.warn('Logout api call failed, clearing tokens anyway', e);
    } finally {
      await tokenStorage.clear();
      setUser(null);
      setLoading(false);
      router.replace('/');
    }
  };

  const refreshUser = async () => {
    if (!user) return;
    try {
      // Just fetch the students list or similar to verify token, or we can check the status.
      // Wait, there is no direct "get me" endpoint, but we can verify status by fetching courses or calling an API.
      // We can also check if the user role/status has been updated. Let's make a call to getStudents for checking if they're admin,
      // or we can just fetch all courses to check token validity.
      // Let's assume we can fetch user profile or get courses.
      await api.get('/courses');
    } catch (error) {
      console.error('Failed to verify token validity:', error);
      await logout();
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
