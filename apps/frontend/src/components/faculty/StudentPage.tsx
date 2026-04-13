import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { panelStyle } from "../Imports";
import { mockAssignedCases, mockCases, mockStudents } from "../Imports";
import { Box, Button, List, ListItemButton, ListItemText, Typography } from "@mui/material";
import { getStoredToken } from "../../services/authApi";
import {
    facultyListCases,
    facultyListStudents,
    type FacultyCase,
    type FacultyStudent,
} from "../../services/facultyApi";

export default function StudentPage() {
    const { studentId } = useParams<{ studentId: string }>();
    const navigate = useNavigate();
    const [students, setStudents] = useState<FacultyStudent[]>([]);
    const [cases, setCases] = useState<FacultyCase[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;

        async function loadFacultyData() {
            try {
                setLoading(true);
                const token = getStoredToken();
                if (!token) {
                    throw new Error("You are not logged in.");
                }

                const [{ students: nextStudents }, { cases: nextCases }] = await Promise.all([
                    facultyListStudents(token),
                    facultyListCases(token),
                ]);

                if (!active) return;
                setStudents(nextStudents);
                setCases(nextCases);
            } catch (err) {
                if (!active) return;
                console.error("Failed to load student page data", err);
            } finally {
                if (active) setLoading(false);
            }
        }

        void loadFacultyData();
        return () => {
            active = false;
        };
    }, []);

    if (!studentId) return null;

    const student = students.find((s) => s.id === studentId);
    if (loading) {
        return (
            <Box sx={{ p: 4 }}>
                <Typography color="text.secondary">Loading student data...</Typography>
            </Box>
        );
    }

    if(!student) {
        return (
            <Box sx={{ p: 4 }}>
                <Typography color="text.secondary">Student not found.</Typography>
            </Box>
        );
    }

    const studentLabel = Number.isInteger(Number(student.id))
        ? mockStudents.find((s) => s.id === Number(student.id))?.name ?? student.username
        : student.username;

    const casesForStudent = cases.filter((c) =>
        c.assignments.some((assignment) => assignment.studentId === student.id)
    );

    const studentIndex = students.findIndex((s) => s.id === student.id);
    const numericStudentId = Number(student.id);
    const mappedMockStudentId =
        Number.isInteger(numericStudentId) && numericStudentId > 0
            ? numericStudentId
            : ((studentIndex >= 0 ? studentIndex : 0) % mockStudents.length) + 1;

    const mockCasesForStudent = mockAssignedCases
        .filter((assignment) => assignment.studentId === mappedMockStudentId)
        .map((assignment) => mockCases.find((c) => c.id === assignment.caseId))
        .filter((c): c is (typeof mockCases)[number] => Boolean(c));

    const displayCases =
        casesForStudent.length > 0
            ? casesForStudent.map((c) => ({ id: c.id, title: c.name, patient: c.patient, mock: false }))
            : mockCasesForStudent.map((c) => ({ id: c.id, title: c.title, patient: c.patient, mock: true }));

    return (
        <Box 
            sx={{ 
                bgcolor: "#f4f7fb",
                height: "100vh",
                display: "flex",
                flexDirection: "column"
            }}
            >
            <Box sx={{ px: 4, pt: 4 }}>
                <Button onClick={() => navigate("/faculty")} sx={{ mb: 2}}>
                    Back
                </Button>

                <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>
                    {studentLabel}
                </Typography>
            </Box>

            <Box 
                sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 3,
                    flex: 1,
                    px: 4,
                    pb: 4,
                    width: "100%",
                }}
            >
                <Box sx={panelStyle}>
                    <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                        Assigned Cases
                    </Typography>

                    <List>
                        {displayCases.map(c => (
                            <ListItemButton
                            key={c.id}
                            onClick={() => navigate(`/studentCase/${student.id}/${c.id}`)}
                            sx={{ borderRadius: 2, mb: 1 }}
                            >
                            <ListItemText
                                primary={c.title}
                                secondary={c.patient}/>
                            </ListItemButton>
                        ))
                        }
                    </List>
                </Box>

                <Box sx={panelStyle}>
                    <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                        Students
                    </Typography>

                    <List>
                        {students.map(s => (
                        <ListItemButton
                            key={s.id}
                            selected={s.id === student.id}
                            onClick={() => navigate(`/student/${s.id}`)}
                        >
                            <ListItemText
                                primary={
                                    Number.isInteger(Number(s.id))
                                        ? mockStudents.find((ms) => ms.id === Number(s.id))?.name ?? s.username
                                        : s.username
                                }
                            />
                        </ListItemButton>
                        ))}
                    </List>
                </Box>
            </Box>
        </Box>
    );   
}