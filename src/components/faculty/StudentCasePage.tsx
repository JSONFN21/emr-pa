import { useParams, useNavigate} from "react-router-dom";
import { mockCases, mockStudentResponses, panelStyle } from "../Imports";
import { Box, Button, Typography } from "@mui/material";

export default function StudentCasePage() {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();

  if (!caseId) return null;

  const caseData = mockCases.find((c) => c.id === parseInt(caseId));
  const response = mockStudentResponses.find(r => r.caseId === parseInt(caseId));

  if (!caseData) return null;

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
        <Button onClick={() => navigate(-1)} sx={{ mb: 2 }}>
          Back
        </Button>

        <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
          {caseData.title}
        </Typography>

        <Typography variant="subtitle1" color="text.secondary">
          Patient: {caseData.patient}
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
            Case Details
          </Typography>

          <Typography variant="body1">
            {caseData.description}
          </Typography>
        </Box>

        <Box sx={panelStyle}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
            Student Response
          </Typography>

          {response ? (
            <>
              <Typography variant="subtitle2" sx={{ mt: 1 }}>
                Diagnosis
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {response.diagnosis}
              </Typography>

              <Typography variant="subtitle2">
                Notes
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {response.notes}
              </Typography>

              <Typography variant="subtitle2">
                Treatment Plan
              </Typography>
              <Typography variant="body1">
                {response.treatment}
              </Typography>
            </>
          ) : (
            <Typography color="text.secondary">
              No response submitted.
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}