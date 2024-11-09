import React from "react";
import PatientTable from "../components/PatientTable"; // Ensure this path is correct

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-between p-24">
      <PatientTable />
    </div>
  );
}
