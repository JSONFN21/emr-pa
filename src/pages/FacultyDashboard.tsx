import { useState } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { panelStyle } from "../components/Imports";
import { Box, Button, List, ListItemButton, ListItemText, Typography, TextField } from "@mui/material";
import { getStoredToken } from "../services/authApi";
import { facultyListCases, facultyListStudents, type FacultyCase, type FacultyStudent } from "../services/facultyApi";

export default function FacultyDashboard() {
  const [studentSearch, setStudentSearch] = useState("");
  const [caseSearch, setCaseSearch] = useState("");
  const [students, setStudents] = useState<FacultyStudent[]>([]);
  const [cases, setCases] = useState<FacultyCase[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    async function loadFacultyData() {
      try {
        setLoading(true);
        setError(null);
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
        setError(err instanceof Error ? err.message : "Failed to load faculty data");
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadFacultyData();
    return () => {
      active = false;
    };
  }, []);

  const filteredStudents = students.filter((s) =>
    s.username.toLowerCase().includes(studentSearch.toLowerCase())
  );
  const filteredCases = cases.filter((c) =>
    c.name.toLowerCase().includes(caseSearch.toLowerCase())
  );

  return (
    <Box
      sx={{
        bgcolor: "#f4f7fb",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ px: 4, pt: 4 }}>
        <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>
          Faculty Dashboard
        </Typography>
        {error ? (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        ) : null}
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
            Students
          </Typography>

          <TextField
            fullWidth
            label="Search Students"
            value={studentSearch}
            onChange={(e) => setStudentSearch(e.target.value)}
            size="small"
          />

          <List sx={{ mt: 2, overflowY: "auto", flex: 1 }}>
            {!loading && filteredStudents.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No students found.
              </Typography>
            ) : null}
            {filteredStudents.map((student) => (
              <ListItemButton 
                key={student.id}
                onClick={() => navigate(`/student/${student.id}`) }
                sx={{ borderRadius: 2, mb: 1 }}
                >
                <ListItemText primary={student.username} secondary={student.email} />
              </ListItemButton>
            ))}
          </List>
        </Box>

        <Box sx={panelStyle}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
            Cases
          </Typography>

          <TextField
            fullWidth
            label="Search Cases"
            value={caseSearch}
            onChange={(e) => setCaseSearch(e.target.value)}
            size="small"
          />

          <List sx={{ mt: 2, overflowY: "auto", flex: 1 }}>
            {!loading && filteredCases.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No cases found.
              </Typography>
            ) : null}
            {filteredCases.map((c) => (
              <ListItemButton 
                key={c.id}
                sx={{ borderRadius: 2, mb: 1 }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%"
                  }}
                >
                  <Box>
                    <Typography variant="body1">{c.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{c.patient}</Typography>
                  </Box>

                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => navigate(`/caseTemplate/${c.id}`)}
                  >
                    Edit
                  </Button>
                </Box>
              </ListItemButton>
            ))}
          </List>
        </Box>

      </Box>
    </Box>
  );
}
