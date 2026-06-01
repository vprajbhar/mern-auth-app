import React, {useEffect} from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

// Validation schema
const schema = yup.object({
  name: yup.string().min(2, "Name must be at least 2 characters").required("Name is required"),
  email: yup.string().email("Enter valid email id").required("Email is required"),
  password: yup.string().min(5, "Password must be at least 5 characters").required("Password is required"),
  confirm: yup.string().oneOf([yup.ref("password")], "Passwords must match").required("Confirm password is required"),
});


export default function Register() {

  const { register: doRegister, loading, error,user } = useAuth();
  const navigate = useNavigate();


  useEffect(() => {
      if (user) {
        navigate("/dashboard");
      }
  }, [user, navigate]);


  const {
        register,
        handleSubmit,
        setError,
        clearErrors,
        formState: { errors },
      } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data) => {

      try {
        await doRegister(data.name, data.email, data.password);
        navigate("/dashboard");
      } catch (err) {
        // Show backend error in form
        setError("email", { message: "Email already in use" });
      }

  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-3 max-w-sm mx-auto p-6 border rounded-lg shadow"
    >
      {/* Name */}
      <div>
        <input
          {...register("name")}
          placeholder="Name"
          className="w-full border p-2 rounded"
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
      </div>

      {/* Email */}
      <div>
        <input
          {...register("email")}
          placeholder="Email"
          onChange={() => clearErrors("email")}
          className="w-full border p-2 rounded"
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
      </div>

      {/* Password */}
      <div>
        <input
          type="password"
          {...register("password")}
          placeholder="Password"
          className="w-full border p-2 rounded"
        />
        {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
      </div>

      {/* Confirm Password */}
      <div>
        <input
          type="password"
          {...register("confirm")}
          placeholder="Confirm Password"
          className="w-full border p-2 rounded"
        />
        {errors.confirm && <p className="text-red-500 text-sm">{errors.confirm.message}</p>}
      </div>

      {/* Global Error (from context) */}
      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="bg-green-600 text-white p-2 rounded hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? "Registering..." : "Register"}
      </button>
    </form>
  );
}
