import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

// Base API URL
const API_BASE_URL = "http://localhost:5000/api"; 

// Create the context
export const AuthContext = createContext(null);

//use AuthContext
export const useAuth = () => useContext(AuthContext);


export const AuthProvider = ({ children }) => {
      
      const [user, setUser] = useState(() => {

          try {
            const stored = localStorage.getItem("user");
            return stored ? JSON.parse(stored) : null;
          } catch {
            return null;
          }
      });

      const [accessToken, setAccessToken] = useState(
        localStorage.getItem("accessToken") || null
      );

      const [loading, setLoading] = useState(false);  
      const [error, setError] = useState(null);  
      
      const api = axios.create({
        baseURL: API_BASE_URL,
        withCredentials: true,
      });

      const refreshApi = axios.create({
        baseURL: API_BASE_URL,
        withCredentials: true,
      });


      // ---------------- Interceptors ----------------
      useEffect(() => {

        //Interceptors request
        const reqInterceptor = api.interceptors.request.use(
          (config) => {
            if (accessToken) {
              config.headers.Authorization = `Bearer ${accessToken}`;
            }
            return config;
          },
          (err) => Promise.reject(err)
        );


        //Interceptors Response
        const resInterceptor = api.interceptors.response.use(
          (res) => res,
          async (err) => {

            const originalRequest = err.config;

            if (err.response?.status === 401 && !originalRequest._retry) {

              originalRequest._retry = true;

              try {

                const res = await refreshApi.post("/auth/refresh", {});
                const newToken = res.data.accessToken;

                setAccessToken(newToken);
                localStorage.setItem("accessToken", newToken);

                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return api(originalRequest);
              } catch {
                logout();
              }
            }
            return Promise.reject(err);
          }
        );

        return () => {
          api.interceptors.request.eject(reqInterceptor);
          api.interceptors.response.eject(resInterceptor);
        };

      }, [accessToken]);


      // ---------------- Actions ----------------
      const login = async (email, password) => {

        setLoading(true);
        setError(null);

        try {

            const res = await api.post("/auth/login",{ email, password },{ skipAuthRefresh: true });

            setUser(res.data.user);
            setAccessToken(res.data.accessToken);

            localStorage.setItem("user", JSON.stringify(res.data.user));
            localStorage.setItem("accessToken", res.data.accessToken);
            return res.data.user;

        } catch (err) {

            const msg = err.response?.data?.message || "Login failed. Try again.";
            setError(msg);
            throw err;

        } finally {
            setLoading(false);
        }

      };

      const register = async (name, email, password) => {

          setLoading(true);
          setError(null);

          try {          

              const res = await api.post("/auth/register", { name, email, password });         
              await login(email, password);
              return res.data.user;

          } catch (err) {

              const msg =
                err.response?.data?.message || "Registration failed. Try again.";
              setError(msg);
              throw err;

          } finally {
            setLoading(false);
          }

      };

      const logout = async () => {

          setUser(null);
          setAccessToken(null);

          localStorage.removeItem("user");
          localStorage.removeItem("accessToken");

          try {
            await refreshApi.post("/auth/logout", {});
          } catch {
            // ignore logout errors
          }

      };


      // ---------------- Refresh on Mount ----------------

      useEffect(() => {
        
        const tryRefresh = async () => {

          try {

              const res = await refreshApi.post("/auth/refresh", {});
              const newToken = res.data.accessToken;

              setAccessToken(newToken);
              localStorage.setItem("accessToken", newToken);

              setUser(res.data.user);
              localStorage.setItem("user", JSON.stringify(res.data.user));

          } catch {
            logout();
          }

        };

        if (!accessToken) {
          tryRefresh();
        }

      }, []);
      

      // ---------------- Context Value ----------------

      const value = {
        user,
        setUser,
        accessToken,
        login,
        register,
        logout,
        api,
        loading,
        error,
      };
      
      return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
