"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminDashboard from "@/components/admin/AdminDashboard";

export default function AdminPage() {
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    setIsAuth(sessionStorage.getItem("rokko-admin") === "true");
  }, []);

  function logout() {
    sessionStorage.removeItem("rokko-admin");
    setIsAuth(false);
  }

  return (
    <main className="min-h-screen bg-[#f6f8fb]">
      <Header />

      {isAuth ? (
        <AdminDashboard onLogout={logout} />
      ) : (
        <AdminLogin onLogin={() => setIsAuth(true)} />
      )}
    </main>
  );
}