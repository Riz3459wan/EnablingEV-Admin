import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import Cookies from "js-cookie";

const AuthContext = createContext(null);

const ROLES = ["admin"];
const ROLE_KEY = "authRole";
const USER_KEY = "authUser";

const detectRole = () => {
  const stored = localStorage.getItem(ROLE_KEY);
  if (ROLES.includes(stored)) return stored;
  return null;
};

const detectUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw || raw === "undefined" || raw === "null") return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
};

const readSession = () => {
  const hasToken = !!Cookies.get("authToken");
  const role = hasToken ? detectRole() : null;
  const user = hasToken ? detectUser() : null;
  return { isLoggedIn: hasToken && !!role, role, user };
};

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(readSession);

  const login = useCallback((token, roleKey, user = null) => {
    if (!ROLES.includes(roleKey)) {
      throw new Error(`Unknown role: ${roleKey}`);
    }
    Cookies.set("authToken", token, { expires: 1 });
    localStorage.setItem(ROLE_KEY, roleKey);
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
    setSession({ isLoggedIn: true, role: roleKey, user });
  }, []);

  const logout = useCallback(() => {
    Cookies.remove("authToken");
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem("dealerInfo");
    localStorage.removeItem("CreateProfile");
    setSession({ isLoggedIn: false, role: null, user: null });
  }, []);

  const value = useMemo(
    () => ({
      isLoggedIn: session.isLoggedIn,
      role: session.role,
      user: session.user,
      login,
      logout,
    }),
    [session, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
