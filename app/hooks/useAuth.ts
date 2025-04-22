// hooks/useAuth.ts
import Cookies from "js-cookie";

export const useAuth = () => {
  const token = Cookies.get("token");
  const role = Cookies.get("role");

  return {
    isAuthenticated: !!token,
    role,
    token,
  };
};
