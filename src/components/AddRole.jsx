import React, { useState } from "react";
import BreadCrumb from "./BreadCrumb";
import { addDoc, collection, doc, setDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

function AddRole() {
  const [roleName, setRoleName] = useState("");
  const [permissions, setPermissions] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Convert permissions input into an array
    const permissionsArray = permissions.split(",").map((perm) => perm.trim());

    // Structure the new role object
    const newRole = {
      name: roleName,
      permissions: permissionsArray,
      description: description,
    };

    // Generate document ID by converting role name to lowercase
    const roleId = roleName.toLowerCase().replace(/\s+/g, "_"); // Convert to lowercase and replace spaces with underscores

    try {
      // Add the new role to the "roles" collection with a specific ID
      await setDoc(doc(db, "roles", roleId), newRole);
      alert("Role added successfully!");

      // Log the action in 'auditLogs' collection
      const auditData = {
        action: `New Role added by ${user?.email}`, // Log the email of the current user
        timestamp: new Date(),
        userId: user?.uid || "", // The ID of the user who performed the action
        userEmail: user?.email || "", // The email of the user who performed the action
        actionUserId: roleId, // The ID of the department created
        actionUserEmail: user?.email || "", // The email of the current user who performed the action
      };

      await addDoc(collection(db, "auditLogs"), auditData);

      // Reset form fields
      setRoleName("");
      setPermissions("");
      setDescription("");
    } catch (error) {
      console.error("Error adding role: ", error);
      alert("Failed to add role.", error);
    }
  };
  return (
    <div>
      <BreadCrumb />
      <div className="">
        <form class="max-w-sm mx-auto" onSubmit={handleSubmit}>
          <div class="mb-5">
            <label
              for="email"
              class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Role
            </label>
            <input
              type="text"
              id="email"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
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
              Permission
            </label>
            <input
              type="text"
              id="password"
              value={permissions}
              onChange={(e) => setPermissions(e.target.value)}
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="description"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Describe the role"
              rows="3"
              required
            />
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

export default AddRole;
