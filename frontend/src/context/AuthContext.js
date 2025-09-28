// frontend/src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Base URL setup (Render backend)
  axios.defaults.baseURL =
    process.env.REACT_APP_API_URL || "http://localhost:5000";

  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      const parsedUser = JSON.parse(userInfo);
      setUser(parsedUser);
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${parsedUser.token}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await axios.post("/api/users/login", {
        email,
        password,
      });
      localStorage.setItem("userInfo", JSON.stringify(data));
      setUser(data);
      axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Login failed");
    }
  };

  const register = async (username, email, password) => {
    try {
      const { data } = await axios.post("/api/users/register", {
        username,
        email,
        password,
      });
      localStorage.setItem("userInfo", JSON.stringify(data));
      setUser(data);
      axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Registration failed");
    }
  };

  const logout = () => {
    localStorage.removeItem("userInfo");
    setUser(null);
    delete axios.defaults.headers.common["Authorization"];
  };

  const value = { user, login, register, logout, loading };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
