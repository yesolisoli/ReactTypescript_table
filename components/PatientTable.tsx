"use client";
import React, { useEffect, useState } from "react";

// Data Types
interface ScreeningAlert {
    type: "SBP" | "DBP" | "PR" | "RR" | "BT";
    value: number;
    date: string;
}

interface ScreeningData {
    type: "SBP" | "DBP" | "PR" | "RR" | "BT";
    value: number;
}

interface PatientTableType {
    status: "SCREENED" | "OBSERVING" | "DONE" | "ERROR" | "DNR";
    emr_id: number;
    name: string;
    sex: "F" | "M";
    age: number;
    location: string;
    doctor: string;
    department: string;
    admission_dt: string;
    alert: ScreeningAlert;
    screening_data: ScreeningData[];
}

const PatientTable: React.FC = () => {
    const [patients, setPatients] = useState<PatientTableType[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const response = await fetch("http://localhost:5001/screening");
                const data = await response.json();
                setPatients(data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching patients:", error);
                setLoading(false);
            }
        };
        
        fetchPatients();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse">
                <thead>
                    <tr>
                        <th className="border px-4 py-2">Status</th>
                        <th className="border px-4 py-2">Patient Info</th>
                        <th className="border px-4 py-2"></th>
                        <th className="border px-4 py-2"></th>
                        <th className="border px-4 py-2">Screened Type</th>
                        <th className="border px-4 py-2">Screened Date</th>
                        <th className="border px-4 py-2">SBP</th>
                        <th className="border px-4 py-2">DBP</th>
                        <th className="border px-4 py-2">PR</th>
                        <th className="border px-4 py-2">RR</th>
                        <th className="border px-4 py-2">BT</th>
                    </tr>
                </thead>
                <tbody>
                    {patients.map((patient) => (
                        <tr key={patient.emr_id}>
                            <td className="border px-4 py-2">{patient.status}</td>
                            <td className="border px-4 py-2">{patient.name} ({patient.sex}/{patient.age}) <br />{patient.emr_id}</td>
                            <td className="border px-4 py-2">{patient.location} <br />{patient.admission_dt}</td>
                            <td className="border px-4 py-2">{patient.department} <br />{patient.doctor}</td>
                            <td className="border px-4 py-2">
                                {patient.alert ? `${patient.alert.type}: ${patient.alert.value}` : "None"}
                            </td>
                            <td className="border px-4 py-2">
                                {patient.alert ? `${patient.alert.date}` : "None"}
                            </td>
                            {patient.screening_data.map((data, index) => (
                                <td className="border px-4 py-2" key={index}>
                                    {data.type}: {data.value}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default PatientTable;

