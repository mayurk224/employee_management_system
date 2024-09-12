import React, { useState } from "react";
import BreadCrumb from "./BreadCrumb";
import { addDoc, collection, doc, setDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useAuth } from "../context/UserContext";

function AddDepartment() {
  const [departmentName, setDepartmentName] = useState("");
  const [positions, setPositions] = useState("");
  const [heads, setHeads] = useState([""]); // Holds the multiple heads as an array

  const { user } = useAuth(); // Get the current user object from the context

  const handleAddDepartment = async (e) => {
    e.preventDefault();

    // Split the positions input by comma and remove any extra whitespace
    const positionsArray = positions
      .split(",")
      .map((position) => position.trim());

    const departmentData = {
      name: departmentName,
      positions: positionsArray,
      heads: heads.filter((head) => head.trim() !== ""), // Remove empty strings
    };

    try {
      // Convert the department name to lowercase for the document ID
      const departmentId = departmentName.toLowerCase();

      // Save to Firebase Firestore with a custom ID
      await setDoc(doc(db, "departments", departmentId), departmentData);
      console.log("Document written with ID: ", departmentId);

      alert("Department added successfully!");

      // Log the action in 'auditLogs' collection
      const auditData = {
        action: `New Department added by ${user?.email}`, // Log the email of the current user
        timestamp: new Date(),
        userId: user?.uid || "", // The ID of the user who performed the action
        userEmail: user?.email || "", // The email of the user who performed the action
        actionUserId: departmentId, // The ID of the department created
        actionUserEmail: user?.email || "", // The email of the current user who performed the action
      };

      await addDoc(collection(db, "auditLogs"), auditData);

      // Reset the form
      setDepartmentName("");
      setPositions("");
      setHeads([""]);
    } catch (e) {
      console.error("Error adding document: ", e);
      alert("Error adding department, please try again.");
    }
  };

  const handleAddHead = () => {
    setHeads([...heads, ""]); // Add an empty input for a new head
  };

  const handleRemoveHead = (index) => {
    const updatedHeads = [...heads];
    updatedHeads.splice(index, 1); // Remove the head at the given index
    setHeads(updatedHeads);
  };

  const handleHeadChange = (index, value) => {
    const updatedHeads = [...heads];
    updatedHeads[index] = value;
    setHeads(updatedHeads);
  };

  return (
    <div>
      <div className="">
        <nav class="flex" aria-label="Breadcrumb">
          <ol class="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
            <li class="inline-flex items-center">
              <a
                href="#"
                class="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white"
              >
                <svg
                  class="w-3 h-3 me-2.5"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z" />
                </svg>
                Home
              </a>
            </li>

            <li aria-current="page">
              <div class="flex items-center">
                <svg
                  class="rtl:rotate-180 w-3 h-3 text-gray-400 mx-1"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 6 10"
                >
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="m1 9 4-4-4-4"
                  />
                </svg>
                <span class="ms-1 text-sm font-medium text-gray-500 md:ms-2 dark:text-gray-400">
                  Add Department
                </span>
              </div>
            </li>
          </ol>
        </nav>
      </div>
      <div className="">
        <form class="max-w-sm mx-auto" onSubmit={handleAddDepartment}>
          <div class="mb-5">
            <label
              for="email"
              class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Your email
            </label>
            <input
              type="text"
              id="email"
              value={departmentName}
              onChange={(e) => setDepartmentName(e.target.value)}
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="name@flowbite.com"
              required
            />
          </div>
          <div class="mb-5">
            <label
              for="password"
              class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Your password
            </label>
            <input
              type="text"
              id="password"
              value={positions}
              onChange={(e) => setPositions(e.target.value)}
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              required
            />
          </div>
          <div class="flex items-start mb-5 flex-col">
            <label>Department Heads:</label>
            {heads.map((head, index) => (
              <div key={index} className="flex">
                <input
                  type="text"
                  value={head}
                  onChange={(e) => handleHeadChange(index, e.target.value)}
                  placeholder={`Head ${index + 1}`}
                />
                {index > 0 && (
                  <button type="button" onClick={() => handleRemoveHead(index)}>
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={handleAddHead}>
              Add Another Head
            </button>
          </div>
          <button
            type="submit"
            class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddDepartment;
