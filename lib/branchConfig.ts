export interface SkillCategoryConfig {
  id: string; // Used as the key in the categories record
  label: string; // The display name of the category
  suggestions: string[];
  placeholder: string;
  required?: boolean;
}

const CSE_CONFIG: SkillCategoryConfig[] = [
  { id: "languages", label: "Programming Languages", suggestions: ["Python", "Java", "C++", "JavaScript", "TypeScript"], placeholder: "e.g. Python, Java, C++", required: true },
  { id: "frameworks", label: "Frameworks & Libraries", suggestions: ["React", "Next.js", "Node.js", "FastAPI", "Spring Boot"], placeholder: "e.g. React, Next.js, Node.js" },
  { id: "databases", label: "Databases", suggestions: ["PostgreSQL", "MongoDB", "MySQL", "Redis"], placeholder: "e.g. PostgreSQL, MongoDB, MySQL" },
  { id: "tools", label: "Tools & Platforms", suggestions: ["Git", "Docker", "AWS", "Postman", "Linux"], placeholder: "e.g. Git, Docker, AWS" },
  { id: "aiAndData", label: "AI & Data Technologies", suggestions: ["Machine Learning", "NLP", "Computer Vision", "Data Analytics"], placeholder: "e.g. Machine Learning, NLP" },
  { id: "csConcepts", label: "Core CS Concepts", suggestions: ["DSA", "OOP", "DBMS", "Operating Systems", "Computer Networks"], placeholder: "e.g. DSA, OOP, DBMS" }
];

export const BRANCH_SKILL_CONFIGS: Record<string, SkillCategoryConfig[]> = {
  "CSE": CSE_CONFIG,
  "IT": CSE_CONFIG,
  "AI & DS": CSE_CONFIG,
  "Cyber Security": CSE_CONFIG,
  "ECE": [
    { id: "languages", label: "Programming Languages", suggestions: ["C", "C++", "Python", "Verilog"], placeholder: "e.g. C, Python", required: true },
    { id: "embeddedSystems", label: "Embedded Systems", suggestions: ["Arduino", "ESP32", "Raspberry Pi", "Microcontrollers", "RTOS"], placeholder: "e.g. Arduino, ESP32" },
    { id: "electronicsTools", label: "Electronics Tools", suggestions: ["MATLAB", "Simulink", "Proteus", "Keil"], placeholder: "e.g. MATLAB, Simulink, Proteus" },
    { id: "communicationSystems", label: "Communication Systems", suggestions: ["Signal Processing", "Wireless Communication", "Networking"], placeholder: "e.g. Signal Processing, Wireless Communication" },
    { id: "hardwareConcepts", label: "VLSI & Hardware Concepts", suggestions: ["Verilog", "VHDL", "FPGA", "VLSI Design"], placeholder: "e.g. Verilog, VHDL, FPGA" }
  ],
  "EEE": [
    { id: "languages", label: "Programming Languages", suggestions: ["C", "C++", "Python"], placeholder: "e.g. C, Python", required: true },
    { id: "electricalSoftware", label: "Electrical Software", suggestions: ["MATLAB", "Simulink", "ETAP", "AutoCAD Electrical"], placeholder: "e.g. MATLAB, Simulink" },
    { id: "powerSystems", label: "Power Systems", suggestions: ["Power Electronics", "Power Systems", "Smart Grid"], placeholder: "e.g. Power Electronics, Power Systems" },
    { id: "controlSystems", label: "Control Systems", suggestions: ["PLC", "SCADA", "Control Systems"], placeholder: "e.g. PLC, SCADA" },
    { id: "embeddedSystems", label: "Embedded Systems", suggestions: ["Arduino", "Embedded C", "Microcontrollers"], placeholder: "e.g. Arduino, Embedded C" }
  ],
  "Mechanical": [
    { id: "engineeringSoftware", label: "Engineering Software", suggestions: ["AutoCAD", "SolidWorks", "CATIA", "Fusion 360"], placeholder: "e.g. AutoCAD, SolidWorks, CATIA", required: true },
    { id: "manufacturingConcepts", label: "Manufacturing Concepts", suggestions: ["CNC", "GD&T", "Production Planning", "Lean Manufacturing"], placeholder: "e.g. CNC, GD&T" },
    { id: "simulationTools", label: "Simulation Tools", suggestions: ["ANSYS", "CFD", "FEA", "Abaqus"], placeholder: "e.g. ANSYS, CFD" },
    { id: "languages", label: "Programming (Optional)", suggestions: ["Python", "C++", "MATLAB"], placeholder: "e.g. Python, MATLAB" }
  ],
  "Civil": [
    { id: "designSoftware", label: "Design Software", suggestions: ["AutoCAD", "STAAD Pro", "ETABS", "Revit"], placeholder: "e.g. AutoCAD, STAAD Pro", required: true },
    { id: "structuralAnalysis", label: "Structural Analysis", suggestions: ["Structural Design", "Concrete Technology", "Steel Design"], placeholder: "e.g. Structural Design, Concrete Technology" },
    { id: "constructionTechnologies", label: "Construction Technologies", suggestions: ["Surveying", "Estimation", "Quantity Analysis"], placeholder: "e.g. Surveying, Estimation" },
    { id: "projectManagement", label: "Project Management", suggestions: ["Primavera", "MS Project", "AutoCAD Civil 3D"], placeholder: "e.g. Primavera, MS Project" }
  ],
  "Chemical": [
    { id: "processEngineering", label: "Process Engineering Tools", suggestions: ["Aspen HYSYS", "Aspen Plus", "ChemCAD", "MATLAB"], placeholder: "e.g. Aspen HYSYS, Aspen Plus", required: true },
    { id: "simulationSoftware", label: "Simulation Software", suggestions: ["COMSOL", "ANSYS Fluent", "DWSIM"], placeholder: "e.g. COMSOL, ANSYS Fluent" },
    { id: "industrialOperations", label: "Industrial Operations", suggestions: ["Process Design", "Plant Operations", "Thermodynamics", "Mass Transfer"], placeholder: "e.g. Process Design, Plant Operations" }
  ],
  "Biotechnology": [
    { id: "bioinformaticsTools", label: "Bioinformatics Tools", suggestions: ["BLAST", "Biopython", "ClustalW", "PyMOL"], placeholder: "e.g. BLAST, Biopython", required: true },
    { id: "laboratoryTechniques", label: "Laboratory Techniques", suggestions: ["PCR", "DNA Sequencing", "Gel Electrophoresis", "Cell Culture"], placeholder: "e.g. PCR, DNA Sequencing" },
    { id: "researchMethods", label: "Research Methods", suggestions: ["Genomics", "Proteomics", "Molecular Cloning", "CRISPR"], placeholder: "e.g. Genomics, Proteomics" }
  ],
  "Aerospace": [
    { id: "designSoftware", label: "Design Software", suggestions: ["ANSYS", "CATIA", "SolidWorks", "AutoCAD"], placeholder: "e.g. ANSYS, CATIA, SolidWorks", required: true },
    { id: "simulationTools", label: "Simulation Tools", suggestions: ["CFD", "FEA", "OpenFOAM", "MATLAB"], placeholder: "e.g. CFD, FEA" },
    { id: "aerodynamics", label: "Aerodynamics", suggestions: ["Flight Mechanics", "Fluid Dynamics", "Wind Tunnel Testing"], placeholder: "e.g. Flight Mechanics, Fluid Dynamics" },
    { id: "propulsionSystems", label: "Propulsion Systems", suggestions: ["Jet Engines", "Rocket Propulsion", "Thermodynamics"], placeholder: "e.g. Jet Engines, Rocket Propulsion" }
  ],
  "Other": CSE_CONFIG
};

// Fallback configuration if branch is not selected
export const DEFAULT_BRANCH_CONFIG = CSE_CONFIG;
