import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);
const STORAGE_USER = 'devpulse_user';
const STORAGE_USERS = 'devpulse_users';

function getStoredUsers() {
  return JSON.parse(localStorage.getItem(STORAGE_USERS) || '[]');
}

function saveStoredUsers(users) {
  localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
}

function getStoredUser() {
  const stored = localStorage.getItem(STORAGE_USER);
  return stored ? JSON.parse(stored) : null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = getStoredUser();
    if (stored) {
      setUser(stored);
    }
  }, []);

  const persistUser = (profile) => {
    localStorage.setItem(STORAGE_USER, JSON.stringify(profile));
    setUser(profile);
  };

  const login = ({ email, password }) => {
    const users = getStoredUsers();
    const existing = users.find((item) => item.email.toLowerCase() === email.toLowerCase());
    if (!existing) {
      throw new Error('Email not registered. Please sign up first.');
    }
    if (existing.password !== password) {
      throw new Error('Invalid password. Please try again.');
    }

    const profile = {
      name: existing.name || existing.email,
      email: existing.email,
      avatar: existing.avatar,
      provider: existing.provider || 'local'
    };

    persistUser(profile);
    return profile;
  };

  const signUp = ({ name, email, password }) => {
    const users = getStoredUsers();
    const existing = users.find((item) => item.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error('Email already exists. Please sign in or use a different email.');
    }

    const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=fff&size=128`;
    const newUser = {
      name,
      email,
      password,
      provider: 'local',
      avatar,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveStoredUsers(users);

    const profile = {
      name: newUser.name,
      email: newUser.email,
      avatar: newUser.avatar,
      provider: newUser.provider
    };

    persistUser(profile);
    return profile;
  };

  const googleSignIn = (profile) => {
    const googleProfile = profile || {
      name: 'Google User',
      email: 'google.user@devpulse.com',
      provider: 'google',
      avatar: 'https://ui-avatars.com/api/?name=Google+User&background=4285f4&color=fff&size=128'
    };
    const users = getStoredUsers();
    const existing = users.find((item) => item.email.toLowerCase() === googleProfile.email.toLowerCase());
    if (!existing) {
      users.push({
        name: googleProfile.name,
        email: googleProfile.email,
        password: '',
        provider: 'google',
        avatar: googleProfile.avatar,
        createdAt: new Date().toISOString()
      });
      saveStoredUsers(users);
    }

    persistUser(googleProfile);
    return googleProfile;
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_USER);
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, login, logout, signUp, googleSignIn }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
