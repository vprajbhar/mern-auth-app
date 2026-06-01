import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

 
const loginSchema = yup.object({
  email: yup.string().email("Invalid email format").required("Email is required"),
  password: yup.string().required("Password is required"),
});


export default function Login() {

  const { login, user, loading } = useAuth();
  const [loginError, setLoginError] = useState("");
  const { register, handleSubmit,formState: { errors },} = useForm({ resolver: yupResolver(loginSchema) });
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

   
  const onSubmit = async (data) => {

      setLoginError("");
      
      try {

        await login(data.email, data.password);
        navigate("/dashboard");

      } catch {
        setLoginError("Invalid credentials!");
      }

  };
  

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-3 max-w-sm mx-auto p-6 border rounded-lg shadow"
    >
      {/* Email Field */}
      <div>
        <input
          {...register("email")}
          type="email"
          placeholder="Email"
          className="w-full border p-2 rounded"
        />
        {errors.email && (
          <p className="text-red-500 text-sm">{errors.email.message}</p>
        )}
      </div>

      {/* Password Field */}
      <div>
        <input
          {...register("password")}
          type="password"
          placeholder="Password"
          className="w-full border p-2 rounded"
        />
        {errors.password && (
          <p className="text-red-500 text-sm">{errors.password.message}</p>
        )}
      </div>

      {/* Global Errors */}
      {loginError && <p className="text-red-600 text-sm">{loginError}</p>}       

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
