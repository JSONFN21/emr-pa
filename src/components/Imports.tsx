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
  hpi: string;
  history: {
    medical: string;
    family: string;
    social: string;
  }
  medications: string;
  allergies: string;
  ros: string;
  exam: string;
  procedures: string;
  diagnostics: string;
  assessment: string;
  treatment: string;
  codingBilling: string;
  learningIssues: string;
  documentation: string;
};

export const mockStudentResponses: StudentResponse[] = [
  {
    id: 1,
    caseId: 1,
    studentId: 1,
    hpi: "Severe chest pain radiating to the left arm starting 2 hours prior to arrival.",
    history: {
      medical: "Hypertension, hyperlipidemia",
      family: "Father died of MI at age 58",
      social: "Smokes 1 pack/day, occasional alcohol use"
    },
    medications: "Lisinopril, Atorvastatin",
    allergies: "No known drug allergies",
    ros: "Positive for chest pain and shortness of breath. Negative for fever, nausea, or abdominal pain.",
    exam: "Diaphoretic, tachycardic, chest tenderness absent, S1/S2 normal.",
    procedures: "ECG performed, IV access established",
    diagnostics: "ECG shows ST elevation in II, III, aVF. Troponin elevated.",
    assessment: "Acute Myocardial Infarction (Inferior STEMI)",
    treatment: "Aspirin, nitroglycerin, heparin, prepare for PCI",
    codingBilling: "I21.3 - STEMI of inferior wall",
    learningIssues: "Recognizing ECG patterns of STEMI; timing of PCI intervention",
    documentation: "Clear documentation of onset time critical for eligibility for reperfusion therapy"
  },

  {
    id: 2,
    caseId: 1,
    studentId: 2,
    hpi: "Burning chest pain after meals, worse when lying down.",
    history: {
      medical: "Obesity",
      family: "Non-contributory",
      social: "High-fat diet, sedentary lifestyle"
    },
    medications: "None",
    allergies: "Penicillin (rash)",
    ros: "Positive for heartburn. Negative for chest pressure or dyspnea.",
    exam: "Normal cardiovascular and respiratory exam.",
    procedures: "None",
    diagnostics: "No ECG changes, troponins normal",
    assessment: "Gastroesophageal Reflux Disease (GERD)",
    treatment: "PPI therapy, dietary modification, weight loss",
    codingBilling: "K21.9 - GERD without esophagitis",
    learningIssues: "Differentiating GERD from cardiac chest pain",
    documentation: "Symptom-based diagnosis; rule out cardiac causes first"
  },

  {
    id: 3,
    caseId: 2,
    studentId: 2,
    hpi: "Itchy, inflamed skin on arms and legs for several weeks.",
    history: {
      medical: "Asthma as a child",
      family: "Mother has eczema",
      social: "Works in dry environment"
    },
    medications: "None",
    allergies: "Dust mites",
    ros: "Positive for pruritus. No fever or systemic symptoms.",
    exam: "Dry, erythematous patches on flexor surfaces.",
    procedures: "Skin exam only",
    diagnostics: "Clinical diagnosis",
    assessment: "Atopic dermatitis (Eczema)",
    treatment: "Topical corticosteroids, emollients",
    codingBilling: "L20.9 - Atopic dermatitis",
    learningIssues: "Chronic inflammatory skin conditions",
    documentation: "Avoid irritants; emphasize moisturizing regimen"
  }
];