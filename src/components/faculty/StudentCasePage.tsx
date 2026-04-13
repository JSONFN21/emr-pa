import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { mockCases, mockStudentResponses, mockStudents } from "../Imports";
import { Box, Button, Typography, Drawer, List, ListItemButton, ListItemText, Divider, Paper } from "@mui/material";
import { getStoredToken } from "../../services/authApi";
import {
  facultyGetCase,
  facultyListCaseNotes,
  type FacultyCase,
  type FacultyCaseNote,
} from "../../services/facultyApi";

export default function StudentCasePage() {
  const { caseId, studentId } = useParams<{ caseId: string; studentId: string }>();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState<FacultyCase | null>(null);
  const [response, setResponse] = useState<FacultyCaseNote | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!caseId || !studentId) {
      setLoading(false);
      return;
    }

    let active = true;

    async function loadCaseDetail() {
      try {
        setLoading(true);
        setError(null);
        const token = getStoredToken();
        if (!token) {
          throw new Error("You are not logged in.");
        }

        const parsedCaseId = Number(caseId);
        const [{ case: foundCase }, { notes }] = await Promise.all([
          facultyGetCase(token, parsedCaseId),
          facultyListCaseNotes(token, parsedCaseId),
        ]);

        if (!active) return;
        setCaseData(foundCase);
        setResponse(notes.find((n) => n.studentId === studentId) ?? null);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load case detail");
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadCaseDetail();
    return () => {
      active = false;
    };
  }, [caseId, studentId]);

  const sidebarSections = useMemo(
    () => [
      { key: "hpi", label: "HPI" },
      { key: "history", label: "History" },
      { key: "meds", label: "Medications & Allergies" },
      { key: "ros", label: "Review of Systems" },
      { key: "exam", label: "Physical Exam" },
      { key: "diagnostics", label: "Diagnostics" },
      { key: "assessment", label: "Assessment" },
      { key: "treatment", label: "Treatment" },
      { key: "coding", label: "Coding & Billing" },
      { key: "notes", label: "Notes" },],
    []
  );

  const mockCaseData = caseId
    ? mockCases.find((c) => c.id === Number(caseId))
    : undefined;

  const numericStudentId = Number(studentId);
  const mappedMockStudentId =
    Number.isInteger(numericStudentId) && numericStudentId > 0
      ? numericStudentId
      : ((Array.from(studentId || "").reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % mockStudents.length) + 1);

  const mockResponse = caseId
    ? mockStudentResponses.find((r) => {
        if (r.caseId !== Number(caseId)) return false;
        return r.studentId === mappedMockStudentId;
      }) ?? mockStudentResponses.find((r) => r.caseId === Number(caseId))
    : undefined;

  const useMockFallback = !loading && !caseData && Boolean(mockCaseData);
  const displayResponse = useMemo(() => {
    if (useMockFallback) {
      return mockResponse ?? null;
    }
    if (!response) {
      return null;
    }
    return {
      id: 0,
      caseId: response.caseId,
      studentId: mappedMockStudentId,
      hpi: response.hpi || " ",
      history: {
        medical: " ",
        family: response.familyHistory || " ",
        social: response.socialHistory || " ",
      },
      medications: response.medications || " ",
      allergies: response.allergies || " ",
      ros: response.learningIssues || " ",
      exam: response.physicalExam || " ",
      procedures: response.procedures || " ",
      diagnostics: response.labAndDiagnostics || " ",
      assessment: response.assessment || response.diagnosis || " ",
      treatment: response.treatmentPlan || " ",
      codingBilling: response.codingAndBilling || " ",
      notes: response.feedback || " ",
    };
  }, [mappedMockStudentId, mockResponse, response, useMockFallback]);

  if (!caseId || !studentId) return null;

  if (loading && !caseData) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="text.secondary">Loading case detail...</Typography>
      </Box>
    );
  }

  if (!caseData && !useMockFallback) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="text.secondary">Case not found.</Typography>
      </Box>
    );
  }

  const shownCasePatient = useMockFallback ? mockCaseData?.patient ?? "Unknown" : caseData!.patient;
  const shownCaseName = useMockFallback ? mockCaseData?.title ?? "Unknown" : caseData!.name;
  const shownCaseDob = useMockFallback ? "" : new Date(caseData!.dob).toLocaleDateString();
  const shownCaseGender = useMockFallback ? "" : caseData!.gender;

  return (
    <Box
      sx={{
        bgcolor: "#f4f7fb",
        height: "100vh",
        display: "flex",
      }}
    >
      <Drawer
        variant="permanent"
        anchor="left"
        PaperProps={{
          sx: {
            width: 280,
            borderRight:"1px solid #dbe4f0",
            bgcolor: "#fff",
            p: 2
          },
        }}
      >
        <Button onClick={() => navigate(`/student/${studentId}`)} sx={{ mb: 2 }}>
          Back
        </Button>

        <Typography variant="h6" fontWeight={700}>
          Case Sections
        </Typography>

        <List sx={{ mt: 2 }}>
          {sidebarSections.map((section) => (
            <ListItemButton key={section.key}>
              <ListItemText primary={section.label} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>
      
      <Box sx={{ flex: 1, ml: "280px", p: 4 }}>
        <Typography variant="h5" fontWeight={600}>
          Student: {studentId}
        </Typography>
        <Typography variant="h4" fontWeight={700}>
          Patient: {shownCasePatient}
        </Typography>

        <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 0.5 }}>
          DOB: {shownCaseDob || ""} | Gender: {shownCaseGender || ""}| Chief Complaint: {shownCaseName}
        </Typography>

        <Divider sx={{ my: 3 }} />

        {loading ? (
          <Typography color="text.secondary">Loading case submission...</Typography>
        ) : null}

        {error ? (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        ) : null}

        {!displayResponse ? (
          <Typography color="text.secondary">
            No submission yet.
          </Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Paper sx={{ p: 2 }}>
              <Typography fontWeight={700}>HPI</Typography>
              <Typography>{displayResponse.hpi}</Typography>
            </Paper>

            <Paper sx={{ p: 2 }}>
              <Typography fontWeight={700}>History</Typography>
              <Typography>Medical: {displayResponse.history.medical}</Typography>
              <Typography>Family: {displayResponse.history.family}</Typography>
              <Typography>Social: {displayResponse.history.social}</Typography>
            </Paper>

            <Paper sx={{ p: 2 }}>
              <Typography fontWeight={700}>Medications</Typography>
              <Typography>{displayResponse.medications}</Typography>
              <Typography fontWeight={700} sx={{ mt: 1 }}>Allergies</Typography>
              <Typography>{displayResponse.allergies}</Typography>
            </Paper>

            <Paper sx={{ p: 2 }}>
              <Typography fontWeight={700}>Review of Systems</Typography>
              <Typography>{displayResponse.ros}</Typography>
            </Paper>

            <Paper sx={{ p: 2 }}>
              <Typography fontWeight={700}>Physical Exam</Typography>
              <Typography>{displayResponse.exam}</Typography>
            </Paper>

            <Paper sx={{ p: 2 }}>
              <Typography fontWeight={700}>Procedures</Typography>
              <Typography>{displayResponse.procedures}</Typography>
            </Paper>

            <Paper sx={{ p: 2 }}>
              <Typography fontWeight={700}>Labs & Diagnostics</Typography>
              <Typography>{displayResponse.diagnostics}</Typography>
            </Paper>

            <Paper sx={{ p: 2 }}>
              <Typography fontWeight={700}>Diagnosis</Typography>
              <Typography>{displayResponse.assessment}</Typography>
            </Paper>

            <Paper sx={{ p: 2 }}>
              <Typography fontWeight={700}>Treatment</Typography>
              <Typography>{displayResponse.treatment}</Typography>
            </Paper>

            <Paper sx={{ p: 2 }}>
              <Typography fontWeight={700}>Coding & Billing</Typography>
              <Typography>{displayResponse.codingBilling}</Typography>
            </Paper>

            <Paper sx={{ p: 2 }}>
              <Typography fontWeight={700}>Notes</Typography>
              <Typography>{displayResponse.notes}</Typography>
            </Paper>
          </Box>
        )}
      </Box>
    </Box>
  );
}