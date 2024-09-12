// UserProfile.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/UserContext";
import { db } from "../firebaseConfig";
import { doc, getDoc, getDocs } from "firebase/firestore";
import Spinner from "./Spinner";
import EditProfile from "./EditProfile"; // Import EditProfile component

const UserProfile = () => {
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);

  useEffect(() => {
    if (user) fetchUserData();
  }, [user]);

  const fetchUserData = async () => {
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        setUserData(userDocSnap.data());
      } else {
        console.error("No user data found.");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <h2>User Profile</h2>
      {userData ? (
        <div>
          {!showEditForm ? (
            <>
              <p>Email: {userData.email}</p>
              <p>First Name: {userData.firstName}</p>
              <p>Last Name: {userData.lastName}</p>
              <p>Role: {userData.role}</p>
              {userData.department && <p>Department: {userData.department}</p>}
              {userData.position && <p>Position: {userData.position}</p>}
              {userData.birthday && <p>Birthday: {userData.birthday}</p>}
              {userData.joiningDate && (
                <p>Joining Date: {userData.joiningDate}</p>
              )}
              {userData.imageUrl && (
                <img src={userData.imageUrl} alt="User Profile" width={100} />
              )}
              <button
                onClick={() => setShowEditForm(true)}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
              >
                Edit Profile
              </button>
            </>
          ) : (
            <EditProfile
              userData={userData}
              onClose={() => setShowEditForm(false)} // Callback to close EditProfile
            />
          )}
        </div>
      ) : (
        <p>No user data found.</p>
      )}
    </div>
  );
};

export default UserProfile;
