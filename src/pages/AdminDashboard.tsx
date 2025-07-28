import React from "react";
import VisaOffersManager from "../components/admin/VisaOffersManager";
import UsersManager from "../components/admin/UsersManager.tsx";
import SubmissionsManager from "../components/admin/SubmissionsManager.tsx";
import TravelPackagesManager from "../components/admin/TravelPackagesManager";
import TravelAccessoriesManager from "../components/admin/TravelAccessoriesManager";

import { useState } from "react";

const SECTIONS = [
  { key: "visa", label: "Visa Offers", component: <VisaOffersManager /> },
  { key: "packages", label: "Travel Packages", component: <TravelPackagesManager /> },
  { key: "accessories", label: "Travel Accessories", component: <TravelAccessoriesManager /> },
  { key: "users", label: "Admin Users", component: <UsersManager /> },
  { key: "submissions", label: "Submissions", component: <SubmissionsManager /> },
  { key: "reports", label: "Reports (Coming Soon)", component: <div className="p-8 text-gray-400">Reports feature will be added here.</div> },
  { key: "settings", label: "Settings (Coming Soon)", component: <div className="p-8 text-gray-400">Settings feature will be added here.</div> },
  { key: "logs", label: "Logs (Coming Soon)", component: <div className="p-8 text-gray-400">Logs feature will be added here.</div> },
  { key: "tools", label: "More Tools (Coming Soon)", component: <div className="p-8 text-gray-400">More tools will be added here.</div> },
];

const AdminDashboard: React.FC = () => {
  // TODO: Add authentication/authorization check here
  const [selected, setSelected] = useState("visa");

  const selectedSection = SECTIONS.find((s) => s.key === selected);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">Manage your travel services and content</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Welcome, Admin
              </div>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">A</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Left Sidebar */}
        <aside className="w-64 bg-white shadow-sm min-h-[calc(100vh-73px)] flex flex-col">
          <nav className="flex-1 py-6 px-4">
            <h2 className="text-sm font-semibold mb-4 text-gray-500 uppercase tracking-wider">Navigation</h2>
            <ul className="space-y-1">
              {SECTIONS.map((section) => {
                const isDisabled = section.key === "tools" || section.key === "reports" || section.key === "settings" || section.key === "logs";
                return (
                  <li key={section.key}>
                    <button
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors duration-200 ${
                        selected === section.key
                          ? "bg-blue-600 text-white font-medium shadow-sm"
                          : isDisabled
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                      onClick={() => setSelected(section.key)}
                      disabled={isDisabled}
                    >
                      <div className="flex items-center justify-between">
                        <span>{section.label}</span>
                        {isDisabled && (
                          <span className="text-xs bg-gray-200 text-gray-500 px-2 py-1 rounded">Soon</span>
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="p-4 text-xs text-gray-400 text-center border-t bg-gray-50">
            © {new Date().getFullYear()} TarimTours Admin
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {/* Breadcrumb */}
            <div className="mb-6">
              <nav className="flex" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-2">
                  <li>
                    <span className="text-gray-500 text-sm">Admin</span>
                  </li>
                  <li>
                    <span className="text-gray-400">/</span>
                  </li>
                  <li>
                    <span className="text-gray-900 text-sm font-medium">
                      {selectedSection?.label}
                    </span>
                  </li>
                </ol>
              </nav>
            </div>

            {/* Content */}
            <div className="bg-white rounded-lg shadow-sm border">
              {selectedSection?.component}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
