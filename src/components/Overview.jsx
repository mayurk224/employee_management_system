import { useState, useEffect } from "react";
import { db } from "../firebaseConfig"; // Replace with your Firebase config
import { collection, getDocs } from "firebase/firestore";

const Overview = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [departmentCounts, setDepartmentCounts] = useState(0);
  const [roleCounts, setRoleCounts] = useState(0);
  const [usersRegisteredToday, setUsersRegisteredToday] = useState(0);

  useEffect(() => {
    // Fetch total users count
    const fetchTotalUsers = async () => {
      const usersCollectionRef = collection(db, "users");
      const usersSnapshot = await getDocs(usersCollectionRef);
      const today = new Date();
      const todayStart = new Date(today.setHours(0, 0, 0, 0));
      const todayEnd = new Date(today.setHours(23, 59, 59, 999));

      const usersToday = usersSnapshot.docs.filter((doc) => {
        const registerDate = new Date(doc.data().registerDate);
        return registerDate >= todayStart && registerDate <= todayEnd;
      });

      setUsersRegisteredToday(usersToday.length);
      setTotalUsers(usersSnapshot.size);
    };

    // Fetch department documents and counts
    const fetchDepartmentCounts = async () => {
      const departmentsCollectionRef = collection(db, "departments");
      const departmentsSnapshot = await getDocs(departmentsCollectionRef);

      setDepartmentCounts(departmentsSnapshot.size);
    };

    // Fetch roles and counts
    const fetchRoleCounts = async () => {
      const rolesCollectionRef = collection(db, "roles");
      const rolesSnapshot = await getDocs(rolesCollectionRef);

      setRoleCounts(rolesSnapshot.size);
    };

    fetchTotalUsers();
    fetchDepartmentCounts();
    fetchRoleCounts();
  }, []);

  return (
    <div className="p-6 flex gap-5 max-[450px]:flex-col">
      {/* Card for Total Users */}
      <div className="w-full bg-white border border-gray-200 rounded-lg shadow-md p-5">
        <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">
          Total Users
        </h5>
        <p className="font-normal text-gray-700 text-4xl">{totalUsers}</p>
      </div>

      <div className="w-full bg-white border border-gray-200 rounded-lg shadow-md p-5">
        <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">
          Total Department
        </h5>
        <p className="font-normal text-gray-700 text-4xl">{departmentCounts}</p>
      </div>

      <div className="w-full bg-white border border-gray-200 rounded-lg shadow-md p-5">
        <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">
          Total Roles
        </h5>
        <p className="font-normal text-gray-700 text-4xl">{roleCounts}</p>
      </div>

      <div className="w-full bg-white border border-gray-200 rounded-lg shadow-md p-5">
        <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">
          Users Registered Today
        </h5>
        <p className="font-normal text-gray-700 text-4xl">
          {usersRegisteredToday}
        </p>
      </div>
    </div>
  );
};

export default Overview;
