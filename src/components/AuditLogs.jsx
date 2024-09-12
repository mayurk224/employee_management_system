import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig.js";
import { formatDistanceToNow } from "date-fns";
import { collection, getDocs } from "firebase/firestore";
import Spinner from "./Spinner.jsx";
import { useAuth } from "../context/UserContext.jsx";

function AuditLogs() {
  const { user } = useAuth(); // Get the current user object
  const [auditLogs, setAuditLogs] = useState([]);
  const [logCount, setLogCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch audit logs from Firestore
    const fetchAuditLogs = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "auditLogs"));
        const logs = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAuditLogs(logs);
        setLogCount(querySnapshot.size);
      } catch (error) {
        console.error("Error fetching audit logs: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAuditLogs();
  }, [user]);

  if (loading) return <Spinner />;
  return (
    <div>
      <div className="">
        <div>
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
                    Audit Logs
                  </span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <div className="">
          <section class="bg-white py-8 antialiased dark:bg-gray-900 md:py-16">
            <div class="mx-auto max-w-screen-lg px-4 2xl:px-0">
              <div class="lg:flex lg:items-center lg:justify-between lg:gap-4">
                <h2 class="shrink-0 text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
                  Logs {logCount}
                </h2>

                <form class="mt-4 w-full gap-4 sm:flex sm:items-center sm:justify-end lg:mt-0">
                  <label for="simple-search" class="sr-only">
                    Search
                  </label>
                  <div class="relative w-full flex-1 lg:max-w-sm">
                    <div class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3">
                      <svg
                        class="h-4 w-4 text-gray-500 dark:text-gray-400"
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
                          stroke-width="2"
                          d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
                        />
                      </svg>
                    </div>
                    <input
                      type="text"
                      id="simple-search"
                      class="block w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 ps-9 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500"
                      placeholder="Search Questions & Answers"
                      required
                    />
                  </div>
                </form>
              </div>

              <div class="mt-6 flow-root">
                <div class="-my-6 divide-y divide-gray-400 dark:divide-gray-800">
                  {auditLogs
                    .sort((a, b) => b.timestamp.toDate() - a.timestamp.toDate()) // Sort logs by timestamp in descending order
                    .map((log) => {
                      const timestamp = log.timestamp.toDate(); // Convert Firestore timestamp to JS Date object
                      const formattedDate = timestamp.toLocaleString(); // Format the timestamp
                      const timeAgo = formatDistanceToNow(timestamp, {
                        addSuffix: true,
                      }); // Format 'time ago'

                      return (
                        <div key={log.id} className="space-y-4 py-6 md:py-8">
                          <div className="grid gap-4">
                            <div>
                              <span className="inline-block rounded bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300 md:mb-0">
                                {formattedDate}
                              </span>
                            </div>
                            <div className="text-xl font-semibold text-gray-900 dark:text-white">
                              {log.action}
                            </div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              <strong>Performed By:</strong>{" "}
                              {log.actionUserEmail} (ID: {log.actionUserId})
                            </p>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              <strong>Affected User:</strong> {log.userEmail}{" "}
                              (ID: {log.userId})
                            </p>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              <strong>Time Ago:</strong> {timeAgo}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default AuditLogs;
