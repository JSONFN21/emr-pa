export type Student = {
  id: number;
  name: string;
};

export type Case = {
  id: number;
  title: string;
  patient: string;
  description: string;
};

export type AssignedCase = {
  id: number;
  caseId: number;
  studentId: number;
}

export const mockStudents: Student[] = [
  { id: 1, name: "Ricky Bobby" },
  { id: 2, name: "Forrest Gump" },
];

export const mockCases: Case[] = [
  { id: 1, title: "Chest Pain", patient: "John Doe",
    description: "A 55-year-old male presents with severe chest pain radiating to the left arm. ECG shows ST elevation in leads II, III, and aVF. Troponin levels are elevated."
   },
  { id: 2, title: "Bones Itchy", patient: "Jane Smith", description: "Patient reports itchy bones and joint pain."  },
];

export const mockAssignedCases: AssignedCase[] = [
  { id: 1, caseId: 1, studentId: 1 },
  { id: 2, caseId: 1, studentId: 2 },
  { id: 3, caseId: 2, studentId: 2 },
];

export const panelStyle = {
  bgcolor: "#ffffff",
  borderRadius: 3,
  p: 2.5,
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
  flex: 1,
  display: "flex",
  flexDirection: "column"
};

export type StudentResponse = {
  id: number;
  caseId: number;
  studentId: number;
  diagnosis: string;
  notes: string;
  treatment: string;
};

export const mockStudentResponses: StudentResponse[] = [
  {
    id: 1,
    caseId: 1,
    studentId: 1,
    diagnosis: "Myocardial Infarction",
    notes: "Patient presents with severe chest pain radiating to the left arm. ECG shows ST elevation in leads II, III, and aVF. Troponin levels are elevated.",
    treatment: "Administer aspirin, start IV nitroglycerin, and prepare for possible PCI."
  },
  {
    id: 2,
    caseId: 1,
    studentId: 2,
    diagnosis: "Gastroesophageal Reflux Disease (GERD)",
    notes: "Patient reports burning chest pain after meals, especially when lying down. No ECG changes or elevated troponin levels.",
    treatment: "Recommend lifestyle modifications and start proton pump inhibitors."
  },
  {
    id: 3,
    caseId: 2,
    studentId: 2,
    diagnosis: "Eczema",
    notes: "Patient has itchy, inflamed skin on arms and legs. No signs of infection or systemic illness.",
    treatment: "Prescribe topical corticosteroids and recommend moisturizing regularly."
  }
];
