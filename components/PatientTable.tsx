"use client";
import React, { useEffect, useState, useCallback } from "react";

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
    const [sortColumn, setSortColumn] = useState<SortColumn>(SortColumn.ALERT_DATE);
    const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.DESC);

    // Fetch patient data when the component mounts
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

    // Toggle the selected status for filtering patients
    const handleStatusChange = (status: PatientStatus) => {
        let updatedStatuses = [...selectedStatuses];

        if (updatedStatuses.includes(status)) {
            updatedStatuses = updatedStatuses.filter((s) => s !== status);
        } else {
            updatedStatuses.push(status);
        }

        // Reset to all statuses if no statuses are selected
        if (updatedStatuses.length === 0) {
            updatedStatuses = Object.values(PatientStatus);
        }

        setSelectedStatuses(updatedStatuses);
    };

    // Handle copying the EMR ID to clipboard
    const handleCopy = (emrId: number) => {
        navigator.clipboard.writeText(emrId.toString());
        alert("Copied EMR ID: " + emrId);
    };

    // Sort the patients based on selected column and order
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

                // Safely cast to VitalType using unknown first
                const vitalType = sortColumn as unknown as VitalType;

                const valueA = findValue(a, vitalType);
                const valueB = findValue(b, vitalType);

                return sortOrder === SortOrder.ASC ? valueA - valueB : valueB - valueA;
            default:
                return 0;
        }
    });

    // Format numerical values, returning "N/A" if the value is 0
    const formatValue = (value: number) => {
        return value !== 0 ? value.toFixed(1) : "N/A";
    };

    // Format dates, optionally including time
    const formatDate = (dateString: string, isTimeIncluded?: boolean) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        const time = `${hours}:${minutes}`;
        
        // Only add time if isTimeIncluded is true
        if (isTimeIncluded) {
            return `${month}.${day} ${time}`;
        }
    
        return `${year}.${month}.${day}`;
    };

    // Show loading message if data is still being fetched
    if (loading) {
        return <div>Loading...</div>;
    }

    // Handle sorting when a column header is clicked
    const handleSort = (column: SortColumn) => {
        if (column === sortColumn) {
            setSortOrder(sortOrder === SortOrder.ASC ? SortOrder.DESC : SortOrder.ASC);
        } else {
            setSortColumn(column);
            setSortOrder(SortOrder.ASC);
        }
    };

    // Get the sort icon based on the selected column and order
    const getSortIcon = (column: SortColumn) => {
        if (sortColumn === column) {
            return sortOrder === SortOrder.ASC ? <span>&#x25B2;</span> : <span>&#x25BC;</span>;
        }
    };

    return (
        <div>
            <div className="mb-4 text-xs">
                <div className="flex flex-wrap gap-4">
                    <span>All {Object.values(PatientStatus).length}</span> | 
                    {Object.values(PatientStatus).map((status) => (
                        <label key={status} className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={selectedStatuses.includes(status)}
                                onChange={() => handleStatusChange(status)}
                            />
                            <span>{status}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="overflow-x-auto max-h-[600px] overflow-y-auto text-xs">
                <table className="min-w-full table-auto border-collapse">
                    <thead className="bg-grey50 sticky top-0 z-10 text-grey100">
                        <tr>
                            <th className="px-4 py-2">Status</th>
                            <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort(SortColumn.NAME)}>
                                Patient Info {sortColumn === SortColumn.NAME && getSortIcon(SortColumn.NAME)}
                            </th>
                            <th className="px-4 py-2"></th>
                            <th className="px-4 py-2"></th>
                            <th className="border-l px-4 py-2">Screened Type</th>
                            <th className="border-r px-4 py-2 cursor-pointer" onClick={() => handleSort(SortColumn.ALERT_DATE)}>
                                Screened Date {sortColumn === SortColumn.ALERT_DATE && getSortIcon(SortColumn.ALERT_DATE)}
                            </th>
                            <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort(SortColumn.SBP)}>
                                SBP {sortColumn === SortColumn.SBP && getSortIcon(SortColumn.SBP)} 
                            </th>
                            <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort(SortColumn.DBP)}>
                                DBP {sortColumn === SortColumn.DBP && getSortIcon(SortColumn.DBP)} 
                            </th>
                            <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort(SortColumn.PR)}>
                                PR {sortColumn === SortColumn.PR && getSortIcon(SortColumn.PR)} 
                            </th>
                            <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort(SortColumn.RR)}>
                                RR {sortColumn === SortColumn.RR && getSortIcon(SortColumn.RR)} 
                            </th>
                            <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort(SortColumn.BT)}>
                                BT {sortColumn === SortColumn.BT && getSortIcon(SortColumn.BT)} 
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedPatients.map((patient) => (
                            <tr key={patient.emr_id} className="group hover:bg-blue1 border-b">
                                <td className="px-4 py-2 text-center">
                                    <span 
                                        className={`px-4 py-2 rounded-full ${
                                            patient.status === PatientStatus.SCREENED ? 'bg-screened_bg text-screened_text' :
                                            patient.status === PatientStatus.OBSERVING ? 'bg-observing_bg text-observing_text' :
                                            patient.status === PatientStatus.DONE ? 'bg-done_bg text-done_text' :
                                            patient.status === PatientStatus.ERROR ? 'bg-error_bg text-error_text' :
                                            patient.status === PatientStatus.DNR ? 'bg-dnr_bg text-dnr_text' :
                                            'bg-gray-400 text-dark-gray'
                                        }`}
                                    >
                                        {patient.status}
                                    </span>
                                </td>
                                <td className="px-4 py-2">
                                    {patient.name} ({patient.sex}/{patient.age}) <br />
                                    <span 
                                        onClick={() => handleCopy(patient.emr_id)} 
                                        className="cursor-pointer text-grey100">
                                        {patient.emr_id} &#x2398;
                                    </span>
                                </td>
                                <td className="px-4 py-2">{patient.location} <br /><span className="text-grey100">{formatDate(patient.admission_dt)}</span></td>
                                <td className="px-4 py-2">{patient.department} <br /><span className="text-grey100">{patient.doctor}</span></td>
                                <td className="border-l px-4 py-2 bg-pink group-hover:bg-blue1">
                                    {patient.alert ? `${patient.alert.type}: ${formatValue(patient.alert.value)}` : "None"}
                                </td>
                                <td className="border-r px-4 py-2 bg-pink group-hover:bg-blue1">
                                    {patient.alert ? formatDate(patient.alert.date, true) : "None"}
                                </td>
                                {Object.values(VitalType).map((type) => (
                                    <td className="px-4 py-2" key={type}>
                                        {formatValue(patient.screening_data.find((data) => data.type === type)?.value ?? 0)}
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
