import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

type User = {
  id: string;
  name: string;
  email: string;
  role: "VISITOR" | "KAARIGAR" | "ADMIN";
  craftType?: string;
  description?: string;
};

type AuthData = {
  token: string;
  user: User;
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem("token");
      const storedUser = await AsyncStorage.getItem("user");

      if (storedToken) {
        setToken(storedToken);
      }

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.log("Failed to load authentication:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuth();
  }, []);

  const saveAuth = async (data: AuthData) => {
    await AsyncStorage.setItem("token", data.token);
    await AsyncStorage.setItem("user", JSON.stringify(data.user));

    setToken(data.token);
    setUser(data.user);
  };

  const logout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");

    setToken(null);
    setUser(null);
  };

  return {
    user,
    token,
    loading,
    saveAuth,
    logout,
  };
};