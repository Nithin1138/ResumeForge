export interface SkillCategoryConfig {
  id: string; // Used as the key in the categories record
  label: string; // The display name of the category
  suggestions: string[];
  placeholder: string;
  required?: boolean;
}

const CSE_CONFIG: SkillCategoryConfig[] = [
  { id: "languages", label: "Programming Languages", suggestions: ["Python", "Java", "C++", "C", "C#", "JavaScript", "TypeScript", "Go", "Rust", "Swift", "Kotlin", "Ruby", "PHP"], placeholder: "e.g. Python, Java, C++", required: true },
  { id: "frameworks", label: "Frameworks & Libraries", suggestions: ["React", "Next.js", "Node.js", "Express", "Angular", "Vue.js", "Django", "Flask", "FastAPI", "Spring Boot", ".NET", "Tailwind CSS", "Bootstrap", "Redux"], placeholder: "e.g. React, Next.js, Node.js" },
  { id: "databases", label: "Databases", suggestions: ["PostgreSQL", "MongoDB", "MySQL", "Redis", "SQLite", "Oracle", "Cassandra", "DynamoDB", "Firebase", "Elasticsearch", "MariaDB"], placeholder: "e.g. PostgreSQL, MongoDB, MySQL" },
  { id: "tools", label: "Tools & Platforms", suggestions: ["Git", "GitHub", "GitLab", "Docker", "Kubernetes", "AWS", "Azure", "GCP", "Postman", "Linux", "Jenkins", "Terraform", "Figma", "Jira", "Vercel"], placeholder: "e.g. Git, Docker, AWS" },
  { id: "aiAndData", label: "AI & Data Technologies", suggestions: ["Machine Learning", "Deep Learning", "NLP", "Computer Vision", "Data Analytics", "Pandas", "NumPy", "TensorFlow", "PyTorch", "Scikit-Learn", "Apache Spark", "Hadoop", "Power BI", "Tableau"], placeholder: "e.g. Machine Learning, NLP" },
  { id: "csConcepts", label: "Core CS Concepts", suggestions: ["Data Structures & Algorithms (DSA)", "Object-Oriented Programming (OOP)", "DBMS", "Operating Systems", "Computer Networks", "System Design", "Software Engineering", "Microservices", "RESTful APIs", "GraphQL"], placeholder: "e.g. DSA, OOP, DBMS" }
];

export const BRANCH_SKILL_CONFIGS: Record<string, SkillCategoryConfig[]> = {
  "CSE": CSE_CONFIG,
  "IT": CSE_CONFIG,
  "AI & DS": CSE_CONFIG,
  "Cyber Security": CSE_CONFIG,
  "ECE": [
    { id: "languages", label: "Programming Languages", suggestions: ["C", "C++", "Python", "Verilog", "VHDL", "Assembly", "MATLAB", "SystemVerilog"], placeholder: "e.g. C, Python", required: true },
    { id: "embeddedSystems", label: "Embedded Systems", suggestions: ["Arduino", "ESP32", "Raspberry Pi", "Microcontrollers", "RTOS", "ARM Cortex", "PIC Microcontrollers", "IoT", "PCB Design", "Sensors & Actuators"], placeholder: "e.g. Arduino, ESP32" },
    { id: "electronicsTools", label: "Electronics Tools", suggestions: ["MATLAB", "Simulink", "Proteus", "Keil", "Altium Designer", "Eagle", "LTspice", "Multisim", "Xilinx ISE", "Vivado"], placeholder: "e.g. MATLAB, Simulink, Proteus" },
    { id: "communicationSystems", label: "Communication Systems", suggestions: ["Signal Processing", "Wireless Communication", "Networking", "Digital Signal Processing (DSP)", "Antenna Design", "RF Engineering", "Optical Communication", "5G/6G Networks"], placeholder: "e.g. Signal Processing, Wireless Communication" },
    { id: "hardwareConcepts", label: "VLSI & Hardware Concepts", suggestions: ["Verilog", "VHDL", "FPGA", "VLSI Design", "ASIC Design", "Digital Electronics", "Analog Electronics", "CMOS Design", "Hardware Verification", "RTL Design"], placeholder: "e.g. Verilog, VHDL, FPGA" }
  ],
  "EEE": [
    { id: "languages", label: "Programming Languages", suggestions: ["C", "C++", "Python", "MATLAB", "Assembly"], placeholder: "e.g. C, Python", required: true },
    { id: "electricalSoftware", label: "Electrical Software", suggestions: ["MATLAB", "Simulink", "ETAP", "AutoCAD Electrical", "PSCAD", "MiPower", "LabVIEW", "Dialux"], placeholder: "e.g. MATLAB, Simulink" },
    { id: "powerSystems", label: "Power Systems", suggestions: ["Power Electronics", "Power Systems", "Smart Grid", "Renewable Energy", "High Voltage Engineering", "Switchgear & Protection", "Electrical Machines", "Microgrids", "Power Quality"], placeholder: "e.g. Power Electronics, Power Systems" },
    { id: "controlSystems", label: "Control Systems", suggestions: ["PLC", "SCADA", "Control Systems", "PID Controllers", "Automation", "Robotics", "DCS", "Industrial Automation"], placeholder: "e.g. PLC, SCADA" },
    { id: "embeddedSystems", label: "Embedded Systems", suggestions: ["Arduino", "Embedded C", "Microcontrollers", "IoT", "Raspberry Pi", "Sensors", "RTOS", "PCB Design"], placeholder: "e.g. Arduino, Embedded C" }
  ],
  "Mechanical": [
    { id: "engineeringSoftware", label: "Engineering Software", suggestions: ["AutoCAD", "SolidWorks", "CATIA", "Fusion 360", "Creo", "Siemens NX", "Inventor", "Rhino"], placeholder: "e.g. AutoCAD, SolidWorks, CATIA", required: true },
    { id: "manufacturingConcepts", label: "Manufacturing Concepts", suggestions: ["CNC", "GD&T", "Production Planning", "Lean Manufacturing", "Additive Manufacturing (3D Printing)", "Six Sigma", "CAM", "Casting & Welding", "Tooling", "Quality Control"], placeholder: "e.g. CNC, GD&T" },
    { id: "simulationTools", label: "Simulation Tools", suggestions: ["ANSYS", "CFD", "FEA", "Abaqus", "HyperMesh", "COMSOL Multiphysics", "MATLAB", "Simulink", "SolidWorks Simulation"], placeholder: "e.g. ANSYS, CFD" },
    { id: "languages", label: "Programming (Optional)", suggestions: ["Python", "C++", "MATLAB", "R", "Julia"], placeholder: "e.g. Python, MATLAB" }
  ],
  "Civil": [
    { id: "designSoftware", label: "Design Software", suggestions: ["AutoCAD", "STAAD Pro", "ETABS", "Revit", "SAP2000", "SketchUp", "Civil 3D", "Tekla Structures", "Bentley MicroStation", "3ds Max"], placeholder: "e.g. AutoCAD, STAAD Pro", required: true },
    { id: "structuralAnalysis", label: "Structural Analysis", suggestions: ["Structural Design", "Concrete Technology", "Steel Design", "Geotechnical Engineering", "Earthquake Engineering", "Bridge Design", "Foundation Engineering", "Mechanics of Materials"], placeholder: "e.g. Structural Design, Concrete Technology" },
    { id: "constructionTechnologies", label: "Construction Technologies", suggestions: ["Surveying", "Estimation", "Quantity Analysis", "GIS", "BIM (Building Information Modeling)", "Remote Sensing", "GPS", "Material Testing"], placeholder: "e.g. Surveying, Estimation" },
    { id: "projectManagement", label: "Project Management", suggestions: ["Primavera", "MS Project", "AutoCAD Civil 3D", "Construction Management", "Cost Estimation", "Contract Management", "Risk Management"], placeholder: "e.g. Primavera, MS Project" }
  ],
  "Chemical": [
    { id: "processEngineering", label: "Process Engineering Tools", suggestions: ["Aspen HYSYS", "Aspen Plus", "ChemCAD", "MATLAB", "PRO/II", "UniSim", "AutoCAD P&ID", "HTRI"], placeholder: "e.g. Aspen HYSYS, Aspen Plus", required: true },
    { id: "simulationSoftware", label: "Simulation Software", suggestions: ["COMSOL", "ANSYS Fluent", "DWSIM", "OpenFOAM", "Simulink", "gPROMS"], placeholder: "e.g. COMSOL, ANSYS Fluent" },
    { id: "industrialOperations", label: "Industrial Operations", suggestions: ["Process Design", "Plant Operations", "Thermodynamics", "Mass Transfer", "Heat Transfer", "Fluid Mechanics", "Reaction Engineering", "Process Control", "Separation Processes", "Safety & Hazard Analysis (HAZOP)"], placeholder: "e.g. Process Design, Plant Operations" }
  ],
  "Biotechnology": [
    { id: "bioinformaticsTools", label: "Bioinformatics Tools", suggestions: ["BLAST", "Biopython", "ClustalW", "PyMOL", "R", "Python", "Linux", "GROMACS", "AutoDock", "Swiss-PdbViewer", "Cytoscape"], placeholder: "e.g. BLAST, Biopython", required: true },
    { id: "laboratoryTechniques", label: "Laboratory Techniques", suggestions: ["PCR", "DNA Sequencing", "Gel Electrophoresis", "Cell Culture", "ELISA", "Chromatography", "Western Blotting", "Flow Cytometry", "Microbiology Techniques", "Spectrophotometry"], placeholder: "e.g. PCR, DNA Sequencing" },
    { id: "researchMethods", label: "Research Methods", suggestions: ["Genomics", "Proteomics", "Molecular Cloning", "CRISPR", "Metabolomics", "Transcriptomics", "Bioprocess Engineering", "Immunology", "Systems Biology", "Drug Discovery"], placeholder: "e.g. Genomics, Proteomics" }
  ],
  "Aerospace": [
    { id: "designSoftware", label: "Design Software", suggestions: ["ANSYS", "CATIA", "SolidWorks", "AutoCAD", "Siemens NX", "FreeCAD", "OpenVSP", "XFLR5"], placeholder: "e.g. ANSYS, CATIA, SolidWorks", required: true },
    { id: "simulationTools", label: "Simulation Tools", suggestions: ["CFD", "FEA", "OpenFOAM", "MATLAB", "Simulink", "SU2", "Abaqus", "HyperWorks"], placeholder: "e.g. CFD, FEA" },
    { id: "aerodynamics", label: "Aerodynamics", suggestions: ["Flight Mechanics", "Fluid Dynamics", "Wind Tunnel Testing", "Aircraft Performance", "Stability & Control", "Computational Fluid Dynamics (CFD)", "Aerospace Structures"], placeholder: "e.g. Flight Mechanics, Fluid Dynamics" },
    { id: "propulsionSystems", label: "Propulsion Systems", suggestions: ["Jet Engines", "Rocket Propulsion", "Thermodynamics", "Gas Dynamics", "Combustion", "Spacecraft Propulsion", "Orbital Mechanics", "Heat Transfer"], placeholder: "e.g. Jet Engines, Rocket Propulsion" }
  ],
  "Other": CSE_CONFIG
};

// Fallback configuration if branch is not selected
export const DEFAULT_BRANCH_CONFIG = CSE_CONFIG;
