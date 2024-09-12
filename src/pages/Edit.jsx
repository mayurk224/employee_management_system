import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db, storage } from "../firebaseConfig"; // Assuming storage is imported as well
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Spinner from "../components/Spinner";

function Edit() {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [password, setPassword] = useState("");

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const employeeRef = doc(db, "employee", id);
        const employeeSnapshot = await getDoc(employeeRef);

        if (employeeSnapshot.exists()) {
          const data = employeeSnapshot.data();
          setEmployee(data);
          setImage(data.image);
        } else {
          setError("Employee not found.");
        }
      } catch (error) {
        console.error("Error fetching employee:", error);
        setError("Error fetching employee data.");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id]);

  const handleSave = useCallback(async () => {
    try {
      let updatedData = { ...employee };
      let imageURL = employee.image;

      if (imageFile) {
        const storageRef = ref(
          storage,
          `employeeImages/${id}/${imageFile.name}`
        );
        await uploadBytes(storageRef, imageFile);
        imageURL = await getDownloadURL(storageRef);
        updatedData.image = imageURL;
      }

      if (password) {
        updatedData.password = password;
      }

      const employeeRef = doc(db, "employee", id);
      await updateDoc(employeeRef, updatedData);

      alert("Employee details updated successfully!");
      navigate(`/profile/${id}`);
    } catch (error) {
      console.error("Error updating employee:", error);
      alert("Failed to update employee details.");
    }
  }, [employee, id, imageFile, password, navigate]);

  const handleImageChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(URL.createObjectURL(file));
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEmployee((prev) => ({ ...prev, [name]: value }));
  };

  const optimizedImagePreview = useMemo(
    () =>
      image ? (
        <img
          className="w-12 h-12 p-1 rounded-full object-cover ring-2 ring-gray-300 dark:ring-gray-500"
          src={image}
          alt="Selected"
        />
      ) : (
        <svg
          className="w-12 h-12 p-1 rounded-full ring-2 ring-gray-300 dark:ring-gray-500"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
            clipRule="evenodd"
          ></path>
        </svg>
      ),
    [image]
  );

  return (
    <div className="flex justify-center items-center w-full h-[100vh]">
      {loading ? (
        <Spinner />
      ) : (
        <div className="relative p-4 w-full max-w-2xl h-[100vh] md:h-auto">
          <form onSubmit={handleSave}>
            <div className="grid gap-4 mb-4 sm:grid-cols-2">
              <InputField
                label="First Name"
                type="text"
                name="firstName"
                value={employee.firstName}
                onChange={handleInputChange}
                placeholder="Mayur"
              />
              <InputField
                label="Last Name"
                type="text"
                name="lastName"
                value={employee.lastName}
                onChange={handleInputChange}
                placeholder="Kamble"
              />
              {/* Additional input fields... */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Upload file
                </label>
                <input
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                  id="file_input"
                  type="file"
                />
              </div>
              <div className="flex items-end">{optimizedImagePreview}</div>
              {/* Additional input fields... */}
            </div>
            <button
              type="submit"
              className="text-white inline-flex items-center bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
            >
              <svg
                className="mr-1 -ml-1 w-6 h-6"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                  clipRule="evenodd"
                ></path>
              </svg>
              Save Profile
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

const InputField = ({ label, type, name, value, onChange, placeholder }) => (
  <div>
    <label
      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
      htmlFor={name}
    >
      {label}
    </label>
    <input
      type={type}
      name={name}
      id={name}
      value={value}
      onChange={onChange}
      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
      placeholder={placeholder}
      required
    />
  </div>
);

export default Edit;
