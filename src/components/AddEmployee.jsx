import React, { useEffect, useState } from "react";
import BreadCrumb from "./BreadCrumb";
import img from "../assets/img.jpg";
import { addDoc, collection, getDocs, setDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";

function AddEmployee() {
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [roles, setRoles] = useState([]);

  // Employee state variables
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [birthday, setBirthday] = useState("");
  const [position, setPosition] = useState("");
  const [role, setRole] = useState("");
  const [joiningDate, setJoiningDate] = useState("");
  const [image, setImage] = useState(null); // Change to null to handle the image file properly

  // Fetch roles from Firestore
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const rolesCollection = collection(db, "roles");
        const rolesSnapshot = await getDocs(rolesCollection);
        const rolesList = rolesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRoles(rolesList);
      } catch (error) {
        console.error("Error fetching roles: ", error);
      }
    };

    fetchRoles();
  }, []);

  // Fetch departments from Firestore
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "departments"));
        const departmentList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDepartments(departmentList);
      } catch (error) {
        console.error("Error fetching departments: ", error);
      }
    };

    fetchDepartments();
  }, []);

  // Handle department change
  const handleDepartmentChange = (e) => {
    const selectedDept = e.target.value;
    setSelectedDepartment(selectedDept);

    // Find the selected department from the departments array
    const department = departments.find((dept) => dept.name === selectedDept);
    if (department) {
      setPositions(department.positions || []);
    } else {
      setPositions([]);
    }
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file); // Update the state with the selected image file
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission

    if (!image) {
      alert("Please select an image.");
      return;
    }

    try {
      // Step 1: Upload the image to Firebase Storage
      const storage = getStorage(); // Initialize Firebase Storage
      const storageRef = ref(storage, `employeeImage/${image.name}`); // Create a reference to the image file in Firebase Storage
      await uploadBytes(storageRef, image); // Upload the image file

      // Step 2: Get the image URL after upload
      const imageUrl = await getDownloadURL(storageRef);

      // Step 3: Create a new employee object
      const newEmployee = {
        firstName,
        lastName,
        email,
        gender,
        birthday,
        department: selectedDepartment,
        position,
        role,
        joiningDate,
        imageUrl, // Include the image URL in the employee data
        registrationTimestamp: new Date(), // Add registration timestamp
      };

      // Step 4: Add new employee to Firestore
      const employeeDocRef = await addDoc(collection(db, "users"), newEmployee);

      // Step 5: Create an audit log
      const currentUser = auth.currentUser; // Get the current user from Firebase Authentication

      // Log the action in 'auditLogs' collection
      const auditData = {
        action: `New User ${newEmployee.email} is created by ${currentUser.email}`,
        timestamp: new Date(),
        userId: employeeDocRef.id, // The ID of the new employee document
        userEmail: newEmployee.email, // The email of the new user
        actionUserId: currentUser.uid, // The ID of the current user who performed the action
        actionUserEmail: currentUser.email, // The email of the current user who performed the action
      };

      await addDoc(collection(db, "auditLogs"), auditData);

      // Clear form fields
      setFirstName("");
      setLastName("");
      setEmail("");
      setGender("");
      setBirthday("");
      setSelectedDepartment("");
      setPosition("");
      setRole("");
      setJoiningDate("");
      setImage(null);

      // Alert success after all operations are complete
      alert("Employee added successfully!");
    } catch (error) {
      console.error("Error adding employee: ", error);
      alert(`Failed to add employee. Error: ${error.message}`);
    }
  };

  return (
    <div className="p-2">
      <BreadCrumb />
      <div className="w-full h-auto shadow-lg mt-3 p-5">
        <h1 className="text-2xl font-semibold">Add Employee</h1>
        <div className="flex">
          <div className="rightContent flex-grow p-4">
            <div className="generalInfo shadow-lg p-5 rounded-lg">
              <div className="">
                <h1 className="text-2xl font-semibold">General Information</h1>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="mt-5">
                  <div className="flex gap-2 max-sm:flex-col">
                    <div className="mb-5 w-full">
                      <label
                        htmlFor="firstName"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        First Name
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="Mayur"
                        required
                      />
                    </div>
                    <div className="mb-5 w-full">
                      <label
                        htmlFor="lastName"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="Kamble"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 max-sm:flex-col">
                    <div className="mb-5 w-full">
                      <label
                        htmlFor="email"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Your email
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="name@flowbite.com"
                        required
                      />
                    </div>
                    <div className="mb-5 w-full">
                      <label
                        htmlFor="email"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Image
                      </label>
                      <input
                        type="file"
                        id="image"
                        onChange={handleImageChange}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="name@flowbite.com"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 max-sm:flex-col">
                    <div className="mb-5 w-full">
                      <label
                        htmlFor="gender"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Your Gender
                      </label>
                      <select
                        id="gender"
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      >
                        <option value="" disabled>
                          Choose your Gender
                        </option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="non-binary">Non Binary</option>
                      </select>
                    </div>
                    <div className="mb-5 w-full">
                      <label
                        htmlFor="birthday"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Your Birthday
                      </label>
                      <input
                        type="date"
                        id="birthday"
                        value={birthday}
                        onChange={(e) => setBirthday(e.target.value)}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 max-sm:flex-col">
                    <div className="mb-5 w-full">
                      <label
                        htmlFor="newDepartment"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        New Department
                      </label>
                      <select
                        id="newDepartment"
                        value={selectedDepartment}
                        onChange={handleDepartmentChange}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      >
                        <option value="" disabled>
                          Choose a Department
                        </option>
                        {departments.map((department) => (
                          <option key={department.id} value={department.name}>
                            {department.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-5 w-full">
                      <label
                        htmlFor="newPosition"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        New Position
                      </label>
                      <select
                        id="newPosition"
                        value={position}
                        onChange={(e) => setPosition(e.target.value)}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      >
                        <option value="" disabled>
                          Choose a Position
                        </option>
                        {positions.map((position, index) => (
                          <option key={index} value={position}>
                            {position}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2 max-sm:flex-col">
                    <div className="mb-5 w-full">
                      <label
                        htmlFor="role"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Role
                      </label>
                      <select
                        id="role"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      >
                        <option value="" disabled>
                          Select Role
                        </option>
                        {roles.map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-5 w-full">
                      <label
                        htmlFor="joiningDate"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Joining Date
                      </label>
                      <input
                        type="date"
                        id="joiningDate"
                        value={joiningDate}
                        onChange={(e) => setJoiningDate(e.target.value)}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white p-2 rounded-lg"
                  >
                    Add Employee
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddEmployee;
