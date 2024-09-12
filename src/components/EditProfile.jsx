// EditProfile.jsx
import React, { useState, useEffect } from "react";
import { db, storage } from "../firebaseConfig";
import {
  doc,
  updateDoc,
  getDocs,
  collection,
  addDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const EditProfile = ({ userData, onClose }) => {
  const [firstName, setFirstName] = useState(userData.firstName || "");
  const [lastName, setLastName] = useState(userData.lastName || "");
  const [dob, setDob] = useState(userData.birthday || "");
  const [gender, setGender] = useState(userData.gender || "");
  const [department, setDepartment] = useState(userData.department || "");
  const [position, setPosition] = useState(userData.position || "");
  const [role, setRole] = useState(userData.role || "");
  const [joiningDate, setJoiningDate] = useState(userData.joiningDate || "");
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(userData.imageUrl || "");

  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    fetchDepartments();
    fetchRoles();
  }, []);

  useEffect(() => {
    if (department) {
      fetchPositions(department);
    }
  }, [department]);

  const fetchDepartments = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "departments"));
      const departmentList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDepartments(departmentList);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const fetchPositions = async (selectedDepartment) => {
    try {
      const departmentDoc = departments.find(
        (dept) => dept.name === selectedDepartment
      );
      setPositions(departmentDoc ? departmentDoc.positions || [] : []);
    } catch (error) {
      console.error("Error fetching positions:", error);
    }
  };

  const createAuditLog = async (userId, action) => {
    const timestamp = new Date(); // Get current timestamp

    const auditData = {
      userId,
      action,
      timestamp,
    };

    try {
      // Add the audit log entry to Firestore
      await addDoc(collection(db, "auditLogs"), auditData);
      console.log("Audit log created successfully!");
    } catch (e) {
      console.error("Error creating audit log: ", e);
    }
  };

  const fetchRoles = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "roles"));
      const rolesList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRoles(rolesList);
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userDocRef = doc(db, "users", userData.uid);
      let updatedImageUrl = imageUrl;

      // Handle image upload if an image is selected
      if (image) {
        const imageRef = ref(
          storage,
          `employeeImage/${userData.uid}/${image.name}`
        );
        await uploadBytes(imageRef, image);
        updatedImageUrl = await getDownloadURL(imageRef);
      }

      // Update user document in Firestore
      await updateDoc(userDocRef, {
        firstName,
        lastName,
        birthday: dob,
        gender,
        department,
        position,
        role,
        joiningDate,
        imageUrl: updatedImageUrl,
      });

      // Create audit log entry
      await createAuditLog(
        userData.uid,
        `Update user profile: ${userData.email}`
      );

      // Alert success and close the form
      alert("User profile updated successfully!");
      onClose();
    } catch (error) {
      // Log detailed error information
      console.error("Error updating profile:", error.message);
      alert("Failed to update profile.");
    }
  };

  return (
    <div className="edit-profile">
      <h3>Edit Profile</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label>First Name:</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>
        <div>
          <label>Last Name:</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
        <div>
          <label>Date of Birth:</label>
          <input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
          />
        </div>
        <div>
          <label>Gender:</label>
          <select value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label>Department:</label>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          >
            <option value="">Select Department</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.name}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Position:</label>
          <select
            value={position}
            onChange={(e) => setPosition(e.target.value)}
          >
            <option value="">Select Position</option>
            {positions.map((pos, index) => (
              <option key={index} value={pos}>
                {pos}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Role:</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="">Select Role</option>
            {roles.map((r) => (
              <option key={r.id} value={r.name}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Joining Date:</label>
          <input
            type="date"
            value={joiningDate}
            onChange={(e) => setJoiningDate(e.target.value)}
          />
        </div>
        <div>
          <label>Profile Image:</label>
          <input type="file" onChange={(e) => setImage(e.target.files[0])} />
        </div>
        <div>
          <label>Email:</label>
          <input type="email" value={userData.email} disabled />
        </div>
        <button type="submit">Update Profile</button>
        <button type="button" onClick={onClose}>
          Cancel
        </button>
      </form>
    </div>
  );
};

export default EditProfile;
