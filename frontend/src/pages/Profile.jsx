import React, { useContext, useState, useEffect, useCallback } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";

export default function Profile() {

  const { user, setUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({ name: "" });
  const [avatarFile, setAvatarFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

 
  useEffect(() => {  
    
    if (user) {          
      setFormData({ name: user.name || "" });
      setPreview('http://localhost:5000'+user.avatar || null);
    }
    
  }, [user]);   
   
  const handleChange = useCallback((e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

 
  const handleFileChange = useCallback((e) => {

      const file = e.target.files?.[0];
      setAvatarFile(file || null);
      
      if (file) {
        const previewUrl = URL.createObjectURL(file);
        setPreview(previewUrl);       
        return () => URL.revokeObjectURL(previewUrl);
      }
  }, []);

  
  const handleSubmit = async (e) => {

      e.preventDefault();

      if (!formData.name.trim()) {
        alert("Name is required");
        return;
      }

      const form = new FormData();
      form.append("name", formData.name.trim());
      if (avatarFile) form.append("avatar", avatarFile);

      try {      

        setLoading(true);
        const updateData = await api.put("/user/profile", form);  
        setUser(updateData.data);
        localStorage.setItem("user", JSON.stringify(updateData.data));
        alert("Profile updated successfully ✅");

      } catch (err) {       
        alert("Failed to update profile ❌");      
      } finally {
        setLoading(false);
      }

  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
        {/* Avatar Preview */}
        
        <div>            

          {preview ? (
            <img
              src={preview}
              alt="avatar"
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
              No image
            </div>
          )}
        </div>

        {/* Name Input */}
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Your name"
          className="border p-2 w-full rounded"
          disabled={loading}
        />

        {/* File Input */}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block"
          disabled={loading}
        />

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </form>
    </>
  );
}
