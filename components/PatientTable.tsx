"use client";
import React, { useEffect, useState } from "react";

// Enum for sort order
enum SortOrder {
    ASC = "asc",
    DESC = "desc",
}

// Enum for sort columns
enum SortColumn {
    NAME = "name",
    ALERT_DATE = "alertDate",
    SBP = "SBP",
    DBP = "DBP",
    PR = "PR",
    RR = "RR",
    BT = "BT",
}

// Enum for vital types
enum VitalType {
    SBP = "SBP",
    DBP = "DBP",
    PR = "PR",
    RR = "RR",
    BT = "BT",
}

// Enum for patient status
enum PatientStatus {
    SCREENED = "SCREENED",
    OBSERVING = "OBSERVING",
    DONE = "DONE",
    ERROR = "ERROR",
    DNR = "DNR",
}

// Data Types
interface ScreeningData {
    type: VitalType;
    value: number;
}

interface ScreeningAlert extends ScreeningData {
    date: string;
}

interface PatientTableType {
    status: PatientStatus;
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
    const [selectedStatuses, setSelectedStatuses] = useState<PatientStatus[]>(Object.values(PatientStatus));
    const [sortColumn, setSortColumn] = useState<SortColumn>(SortColumn.ALERT_DATE);  // Default to Screened Date
    const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.DESC);  // Default to DESC (descending)

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

    const handleStatusChange = (status: PatientStatus) => {
        let updatedStatuses = [...selectedStatuses];

        if (updatedStatuses.includes(status)) {
            updatedStatuses = updatedStatuses.filter((s) => s !== status);
        } else {
            updatedStatuses.push(status);
        }

        if (updatedStatuses.length === 0) {
            updatedStatuses = Object.values(PatientStatus);
        }

        setSelectedStatuses(updatedStatuses);
    };

    const sortedPatients = [...patients]
        .filter((patient) => selectedStatuses.includes(patient.status))
        .sort((a, b) => {
            switch (sortColumn) {
                case SortColumn.NAME:
                    return sortOrder === SortOrder.ASC ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
                case SortColumn.ALERT_DATE:
                    const dateA = a.alert ? new Date(a.alert.date).getTime() : 0;
                    const dateB = b.alert ? new Date(b.alert.date).getTime() : 0;
                    return sortOrder === SortOrder.ASC ? dateA - dateB : dateB - dateA;
                case SortColumn.SBP:
                case SortColumn.DBP:
                case SortColumn.PR:
                case SortColumn.RR:
                case SortColumn.BT:
                    const findValue = (patient: PatientTableType, type: VitalType) =>
                        patient.screening_data.find((data) => data.type === type)?.value ?? 0;
                    const valueA = findValue(a, sortColumn as VitalType);
                    const valueB = findValue(b, sortColumn as VitalType);
                    return sortOrder === SortOrder.ASC ? valueA - valueB : valueB - valueA;
                default:
                    return 0;
            }
        });

    if (loading) {
        return <div>Loading...</div>;
    }

    const handleSort = (column: SortColumn) => {
        if (column === sortColumn) {
            setSortOrder(sortOrder === SortOrder.ASC ? SortOrder.DESC : SortOrder.ASC);
        } else {
            setSortColumn(column);
            setSortOrder(SortOrder.ASC);
        }
    };

    return (
        <div>
            <div className="mb-4">
                <h3>Status Filter:</h3>
                {Object.values(PatientStatus).map((status) => (
                    <label key={status}>
                        <input
                            type="checkbox"
                            checked={selectedStatuses.includes(status)}
                            onChange={() => handleStatusChange(status)}
                        />
                        {status}
                    </label>
                ))}
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full table-auto border-collapse">
                    <thead>
                        <tr>
                            <th className="border px-4 py-2">Status</th>
                            <th className="border px-4 py-2 cursor-pointer" onClick={() => handleSort(SortColumn.NAME)}>Patient Info</th>
                            <th className="border px-4 py-2">Location</th>
                            <th className="border px-4 py-2">Department</th>
                            <th className="border px-4 py-2">Screened Type</th>
                            <th className="border px-4 py-2 cursor-pointer" onClick={() => handleSort(SortColumn.ALERT_DATE)}>Screened Date</th>
                            <th className="border px-4 py-2 cursor-pointer" onClick={() => handleSort(SortColumn.SBP)}>SBP</th>
                            <th className="border px-4 py-2 cursor-pointer" onClick={() => handleSort(SortColumn.DBP)}>DBP</th>
                            <th className="border px-4 py-2 cursor-pointer" onClick={() => handleSort(SortColumn.PR)}>PR</th>
                            <th className="border px-4 py-2 cursor-pointer" onClick={() => handleSort(SortColumn.RR)}>RR</th>
                            <th className="border px-4 py-2 cursor-pointer" onClick={() => handleSort(SortColumn.BT)}>BT</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedPatients.map((patient) => (
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
                                {Object.values(VitalType).map((type) => (
                                    <td className="border px-4 py-2" key={type}>
                                        {patient.screening_data.find((data) => data.type === type)?.value ?? "N/A"}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PatientTable;
