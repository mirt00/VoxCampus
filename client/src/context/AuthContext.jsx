import { createContext, useContext, useState, useEffect } from "react";
import { getMeApi, loginApi, logoutApi } from "../api/auth.api";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMeApi()
      .then((r) => {
        const u = r.data;
        setUser({ ...u, id: u._id || u.id });
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const { data } = await loginApi({ email, password });
    // normalize id
    setUser({ ...data.user, id: data.user.id || data.user._id });
  };

  const logout = async () => {
    await logoutApi();
    setUser(null);
  };

  // Derived convenience fields
  const userID = user?.id || user?._id || null;
  const userName = user?.name || null;
  const faculty = user?.faculty || null;
  const userToken = !!user; // true if authenticated

  return (
    <AuthContext.Provider value={{
      user, loading, login, logout, setUser,
      userID, userName, faculty, userToken,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
