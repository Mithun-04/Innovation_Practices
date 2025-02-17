import React, { useEffect, useState } from "react";
import supabase from "./supabaseClient";
import "./profile.css"

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        setUser(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("users")
        .select("id, username")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching user from DB:", error.message);
        setUser(null);
      } else {
        setUser(data);
      }

      setLoading(false);
    };

    fetchUser();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      {user ? (
        <div className="prof">
              <h2>User profile</h2>
              <p>Name:{user.username}</p>
              <p>Department: Milling</p>
              
        </div>
      ) : (
        <p>No user data found. Please check your authentication and database.</p>
      )}
    </div>
  );
};

export default Profile;