import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useAuth } from "../context/AuthContext";

// Validation Schema
const schema = yup.object({
  currentPassword: yup.string().required("Current password is required"),
  newPassword: yup
    .string()
    .min(5, "Password must be at least 5 characters")
    .required("New password is required"),
});

// Reusable InputField Component
const InputField = ({ label, name, type = "text", register, errors }) => (
  <div className="flex flex-col mb-3">
    <label className="mb-1 font-medium">{label}</label>
    <input
      type={type}
      {...register(name)}
      className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    {errors[name] && (
      <p className="text-red-500 text-sm mt-1">{errors[name].message}</p>
    )}
  </div>
);

export default function ChangePassword() {

  const { api, logout } = useAuth();
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onBlur",
  });

  const onSubmit = async (data) => {

    setErrorMessage("");
    setSuccessMessage("");
    try {
      await api.post("/user/change-password", data);
      setSuccessMessage("✅ Password changed successfully. Please login again.");
      await logout();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to change password";
      setErrorMessage(msg);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-md mx-auto p-6 border rounded-lg shadow flex flex-col gap-3"
    >
      <h2 className="text-lg font-semibold mb-4">Change Password</h2>

      <InputField
        label="Current Password"
        name="currentPassword"
        type="password"
        register={register}
        errors={errors}
      />
      <InputField
        label="New Password"
        name="newPassword"
        type="password"
        register={register}
        errors={errors}
      />

      {errorMessage && <p className="text-red-600">{errorMessage}</p>}
      {successMessage && <p className="text-green-600">{successMessage}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting ? "Submitting..." : "Change Password"}
      </button>
    </form>
  );
}
