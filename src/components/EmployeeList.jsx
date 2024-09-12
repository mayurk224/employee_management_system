import React, { useEffect, useState } from "react";
import BreadCrumb from "./BreadCrumb";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import Spinner from "../components/Spinner";
import EditProfile from "./EditProfile";
import { getAuth } from "firebase/auth";

const EmployeeList = ({ onComponentChange }) => {
  const [users, setUsers] = useState([]); // State to hold the users data
  const [loading, setLoading] = useState(true); // State to manage loading state
  const [editingUser, setEditingUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [tableHid, setTableHid] = useState(true);

  // Fetch users data from Firestore
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Get all documents from the "users" collection
        const querySnapshot = await getDocs(collection(db, "users"));

        // Map through the documents and extract data
        const usersList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Set the users data in state
        setUsers(usersList);
      } catch (error) {
        console.error("Error fetching users: ", error);
      } finally {
        setLoading(false); // Update loading state
      }
    };

    fetchUsers();
  }, []);

  const handleEditClick = (user) => {
    setEditingUser(user);
    setIsEditing(true); // Show the EditProfile component
    setTableHid(false);
  };

  const handleCloseEdit = () => {
    setIsEditing(false);
    setEditingUser(null);
    // Reset editing user
    setTableHid(true);
  };

  const handleDeleteUser = async (userId, userEmail) => {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      alert("You must be logged in to perform this action.");
      return;
    }

    const currentUserId = currentUser.uid;
    const currentUserEmail = currentUser.email;

    if (userId === currentUserId) {
      alert("You cannot delete your own profile.");
      return;
    }

    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        // Delete the user document from Firestore
        await deleteDoc(doc(db, "users", userId));

        // Create an audit log entry
        const auditData = {
          action: `User ${currentUserEmail} (ID: ${currentUserId}) deleted user ${userEmail} (ID: ${userId})`,
          timestamp: new Date(), // Log the current time of the action
          userId: currentUserId, // The ID of the user who performed the action
          userEmail: currentUserEmail, // The email of the user who performed the action
          actionUserId: userId, // The ID of the deleted user
          actionUserEmail: userEmail, // The email of the deleted user
        };

        await addDoc(collection(db, "auditLogs"), auditData);

        // Remove the deleted user from the state
        setUsers(users.filter((user) => user.id !== userId));
        alert("User deleted and audit log created successfully.");
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Failed to delete user.");
      }
    }
  };

  const [searchQuery, setSearchQuery] = useState(""); // State to store the search query

  // Function to handle search query change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value.toLowerCase()); // Update the search query state
  };

  // Filter users based on search query
  const filteredUsers = users.filter((user) =>
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery)
  );
  return (
    <div className="">
      {isEditing && (
        <EditProfile userData={editingUser} onClose={handleCloseEdit} />
      )}
      {tableHid && (
        <div className="">
          <BreadCrumb />
          <section class="bg-gray-50 mt-3 dark:bg-gray-900 px-3">
            <div class="mx-auto max-w-screen-xl">
              {/* <!-- Start coding here --> */}
              <div class="bg-white dark:bg-gray-800 relative shadow-md sm:rounded-lg overflow-hidden">
                <div class="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">
                  <div class="w-full md:w-1/2">
                    <form className="flex items-center mb-4">
                      <label htmlFor="simple-search" className="sr-only">
                        Search
                      </label>
                      <div className="relative w-full">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <svg
                            aria-hidden="true"
                            className="w-5 h-5 text-gray-500 dark:text-gray-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <input
                          type="text"
                          id="simple-search"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                          placeholder="Search by name"
                          value={searchQuery} // Bind the input value to searchQuery state
                          onChange={handleSearchChange} // Update the state on change
                        />
                      </div>
                    </form>
                  </div>
                  <div class="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => onComponentChange("addEmployee")}
                      class="flex items-center justify-center text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-primary-600 dark:hover:bg-primary-700 focus:outline-none dark:focus:ring-primary-800 text-center"
                    >
                      <svg
                        class="w-[25px] h-[25px] text-white-800 dark:text-white"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke="currentColor"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="1.5"
                          d="M5 12h14m-7 7V5"
                        />
                      </svg>
                      Add Employee
                    </button>
                  </div>
                </div>
                <div class="overflow-x-auto">
                  {loading ? (
                    <Spinner />
                  ) : (
                    <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                      <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                          <th scope="col" class="px-4 py-3"></th>
                          <th scope="col" class="px-4 py-3">
                            Name & Email
                          </th>
                          <th scope="col" class="px-4 py-3">
                            Department
                          </th>
                          <th scope="col" class="px-4 py-3">
                            Position
                          </th>
                          <th scope="col" class="px-4 py-3">
                            Status
                          </th>
                          <th scope="col" class="px-4 py-3">
                            Joining Date
                          </th>
                          <th scope="col" class="px-4 py-3">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((user) => (
                          <tr
                            key={user.id}
                            className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                          >
                            <td className="w-4 p-4">
                              <div className="flex items-center">
                                <input
                                  id={`checkbox-table-search-${user.id}`}
                                  type="checkbox"
                                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                />
                                <label
                                  htmlFor={`checkbox-table-search-${user.id}`}
                                  className="sr-only"
                                >
                                  checkbox
                                </label>
                              </div>
                            </td>
                            <th
                              scope="row"
                              className="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white"
                            >
                              {user.imageUrl ? (
                                <img
                                  src={user.imageUrl}
                                  alt={user.firstName}
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                              ) : (
                                "No image"
                              )}
                              <div className="ps-3">
                                <div className="text-base font-semibold">
                                  {user.firstName} {user.lastName}
                                </div>
                                <div className="font-normal text-gray-500">
                                  {user.email}
                                </div>
                              </div>
                            </th>
                            <td className="px-4 py-3">{user.department}</td>
                            <td className="px-4 py-3">{user.position}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center">
                                <div className="h-2.5 w-2.5 rounded-full bg-green-500 me-2"></div>{" "}
                                Online
                              </div>
                            </td>
                            <td className="px-4 py-3">{user.joiningDate}</td>
                            <td className="px-4 py-3">
                              <a
                                onClick={() => handleEditClick(user)}
                                className="font-medium text-blue-600 cursor-pointer dark:text-blue-500 hover:underline"
                              >
                                Edit user
                              </a>

                              <a
                                onClick={() =>
                                  handleDeleteUser(user.id, user.email)
                                }
                                className="font-medium cursor-pointer text-red-600 dark:text-blue-500 ml-2 hover:underline"
                              >
                                Delete user
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
                <nav
                  class="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0 p-4"
                  aria-label="Table navigation"
                >
                  <span class="text-sm font-normal text-gray-500 dark:text-gray-400">
                    Showing
                    <span class="font-semibold text-gray-900 dark:text-white">
                      1-10
                    </span>
                    of
                    <span class="font-semibold text-gray-900 dark:text-white">
                      1000
                    </span>
                  </span>
                  <ul class="inline-flex items-stretch -space-x-px">
                    <li>
                      <a
                        href="#"
                        class="flex items-center justify-center h-full py-1.5 px-3 ml-0 text-gray-500 bg-white rounded-l-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                      >
                        <span class="sr-only">Previous</span>
                        <svg
                          class="w-5 h-5"
                          aria-hidden="true"
                          fill="currentColor"
                          viewbox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                            clip-rule="evenodd"
                          />
                        </svg>
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        class="flex items-center justify-center text-sm py-2 px-3 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                      >
                        1
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        class="flex items-center justify-center text-sm py-2 px-3 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                      >
                        2
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        aria-current="page"
                        class="flex items-center justify-center text-sm z-10 py-2 px-3 leading-tight text-primary-600 bg-primary-50 border border-primary-300 hover:bg-primary-100 hover:text-primary-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
                      >
                        3
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        class="flex items-center justify-center text-sm py-2 px-3 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                      >
                        ...
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        class="flex items-center justify-center text-sm py-2 px-3 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                      >
                        100
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        class="flex items-center justify-center h-full py-1.5 px-3 leading-tight text-gray-500 bg-white rounded-r-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                      >
                        <span class="sr-only">Next</span>
                        <svg
                          class="w-5 h-5"
                          aria-hidden="true"
                          fill="currentColor"
                          viewbox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clip-rule="evenodd"
                          />
                        </svg>
                      </a>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;
