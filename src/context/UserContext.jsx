// UserContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig"; // Your Firebase config file

// Create the UserContext
const UserContext = createContext();

// Provide the UserContext to the application
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null); // Add state for user role

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid); // Adjust to match your collection path
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          setUser(currentUser);
          setRole(userDocSnap.data().role); // Set the user role from Firestore
        } else {
          console.error("No such user document!");
          setUser(null);
          setRole(null);
        }
      } else {
        setUser(null);
        setRole(null);
      }

      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ user, role, loading }}>
      {!loading && children}
    </UserContext.Provider>
  );
};

// Custom hook to use the UserContext
export const useAuth = () => useContext(UserContext);
