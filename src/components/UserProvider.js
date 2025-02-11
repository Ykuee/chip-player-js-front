import React, { createContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const UserContext = createContext({
  user: null,
  loadingUser: true,
  faves: [],
  favesContext: [],
  showPlayerSettings: false,
  handleLogin: () => {},
  handleLogout: () => {},
  handleToggleFavorite: () => {},
  handleToggleSettings: () => {},
});

/**
 * Convert favorites from list of path strings to list of objects.
 * As of July 2024, the converted objects are not persisted to the backend.
 * Only new favorites are saved to the backend in the object form.
 *
 * {
 *   path: 'https://web.site/music/game/song.vgm',
 *   date: 1650000000,
 * }
 *
 * @param faves
 */
function migrateFaves(faves) {
  if (faves.length > 0) {
    return faves.map(fave => {
      return typeof fave === 'string' ? {
        href: fave,
        mtime: Math.floor(Date.parse('2024-01-01') / 1000),
      } : fave;
    });
  }

  return faves;
}

const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Local state for user data
  const [faves, setFaves] = useState([]);
  const [showPlayerSettings, setShowPlayerSettings] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true); // Manage loading state

  // Fetch user data from backend
  const fetchUserData = async (userId) => {
    try {
      const response = await axios.get(`/api/users/${userId}`);
      const faves = migrateFaves(response.data.faves || []);
      setFaves(faves);
      setShowPlayerSettings(response.data.settings?.showPlayerSettings || false);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoadingUser(false);
    }
  };

  // Check if user is logged in (e.g., via token or session)
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await axios.get('/api/auth/status');
        setUser(response.data);
        fetchUserData(response.data.id); // Fetch user-specific data
      } catch (error) {
        setUser(null);
        setLoadingUser(false);
      }
    };

    checkAuthStatus();
  }, []);

  const handleLogin = async () => {
    try {
      // Redirect to backend login endpoint (e.g., OAuth or custom login)
      //window.location.href = '/api/auth/login';
      const data = {
        username: "admin",
        password: "123"
      };
      await axios.post(`/user/login`, data);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
      setUser(null);
      setFaves([]);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleToggleFavorite = async (href) => {
    if (user) {
      const oldFaves = faves;
      const existingIdx = oldFaves.findLastIndex(f => f === href || f.href === href);
      let newFaves;

      if (existingIdx === -1) {
        // ADD
        const newFave = {
          href,
          mtime: Math.floor(Date.now() / 1000),
        };
        newFaves = [...oldFaves, newFave];
      } else {
        // REMOVE
        newFaves = oldFaves.toSpliced(existingIdx, 1);
      }

      // Optimistic update
      setFaves(newFaves);

      try {
        await axios.post(`/api/users/${user.id}/favorites`, { faves: newFaves });
      } catch (error) {
        setFaves(oldFaves); // Rollback on error
        console.error('Failed to update favorites:', error);
      }
    }
  };

  const handleToggleSettings = async () => {
    const newShowPlayerSettings = !showPlayerSettings;
    setShowPlayerSettings(newShowPlayerSettings);

    if (user) {
      try {
        await axios.post(`/api/users/${user.id}/settings`, {
          showPlayerSettings: newShowPlayerSettings,
        });
      } catch (error) {
        console.error('Failed to update settings:', error);
      }
    }
  };

  // Derive a list of hrefs to use as the play context
  const favesContext = useMemo(() => {
    return faves.map(fave => fave.href);
  }, [faves]);

  return (
      <UserContext.Provider
          value={{
            user,
            loadingUser,
            faves,
            favesContext,
            showPlayerSettings,
            handleLogin,
            handleLogout,
            handleToggleFavorite,
            handleToggleSettings,
          }}
      >
        {children}
      </UserContext.Provider>
  );
};

export { UserContext, UserProvider };
