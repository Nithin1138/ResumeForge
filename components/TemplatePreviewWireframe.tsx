"use client";

import React from "react";
import { User } from "lucide-react";
import { TemplateDefinition } from "@/lib/templatesConfig";

interface PersonaData {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  photoUrl: string;
  summary: string;
  skills: string[];
  education: { institution: string; degree: string; years: string; gpa?: string }[];
  experience: { company: string; role: string; years: string; bullets: string[] }[];
  projects: { title: string; tech: string; description: string }[];
}

// 20 Unique Personas for the 20 templates
const PERSONAS: Record<string, PersonaData> = {
  modern: {
    name: "Sophie Watson",
    title: "Senior Customer Service Representative",
    email: "sophie.watson@email.com",
    phone: "(206) 555-0142",
    location: "Seattle, WA",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    summary: "Dedicated Customer Service Specialist with 6+ years of experience resolving complex inquiries, improving client retention by 35%, and managing high-volume call workflows.",
    skills: ["Customer Relations", "Call Center Operations", "Conflict Resolution", "CRM Software", "Agile Support"],
    education: [
      { institution: "University of Washington", degree: "B.A. Communications", years: "2014 – 2018", gpa: "3.8 GPA" },
      { institution: "West Seattle High School", degree: "High School Diploma", years: "2010 – 2014" },
    ],
    experience: [
      {
        company: "Apex Bank Corp",
        role: "Branch Customer Service Rep",
        years: "2021 – Present",
        bullets: [
          "Managed 80+ daily customer accounts with 98% first-contact resolution.",
          "Trained 12 new hires on banking software and compliance protocols.",
        ],
      },
      {
        company: "Alorica Inc",
        role: "Customer Sales Representative",
        years: "2018 – 2021",
        bullets: [
          "Addressed escalated client complaints and increased upsell revenue by 18%.",
        ],
      },
    ],
    projects: [
      { title: "Client Support Automation Portal", tech: "Zendesk, CRM API", description: "Streamlined ticket triage reducing response time by 40%." },
    ],
  },

  recruiter_scan: {
    name: "Charlotte Warren",
    title: "Recruitment Officer & Talent Lead",
    email: "charlotte.w@talent.com",
    phone: "(415) 555-0199",
    location: "San Francisco, CA",
    photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
    summary: "Results-driven Recruitment Officer specializing in tech talent acquisition, executive sourcing, and reducing time-to-hire across high-growth startups.",
    skills: ["Greenhouse ATS", "LinkedIn Recruiter", "Candidate Sourcing", "Interview Coaching", "Offer Negotiation"],
    education: [
      { institution: "NYU Stern School of Business", degree: "B.S. Human Resources", years: "2015 – 2019", gpa: "3.9 GPA" },
    ],
    experience: [
      {
        company: "Synergie HR Solutions",
        role: "Senior HR Recruiter",
        years: "2021 – Present",
        bullets: [
          "Sourced and closed 150+ senior software engineers across APAC & US.",
          "Reduced average cost-per-hire by 28% via targeted LinkedIn campaigns.",
        ],
      },
      {
        company: "KPMG Advisory",
        role: "Talent Acquisition Consultant",
        years: "2019 – 2021",
        bullets: [
          "Managed campus recruitment drives screening 1,200+ student resumes annually.",
        ],
      },
    ],
    projects: [
      { title: "Global Diversity Hiring Drive", tech: "Lever, Workday", description: "Boosted female engineering hires by 45% across 3 regions." },
    ],
  },

  skills_first: {
    name: "Patricia Giordano",
    title: "Receptionist & Front Office Lead",
    email: "patricia.g@office.com",
    phone: "(415) 555-0188",
    location: "San Francisco, CA",
    photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80",
    summary: "Professional Front Desk Supervisor with proven track record in executive administrative support, client reception, and facility scheduling.",
    skills: ["Front Office Operations", "MS Office 365", "Executive Scheduling", "Visitor Management", "Multi-line Phone Systems"],
    education: [
      { institution: "University of Seattle", degree: "Associate of Communications", years: "2016 – 2018" },
    ],
    experience: [
      {
        company: "Alfred Young Design",
        role: "Front Desk Supervisor",
        years: "2020 – Present",
        bullets: [
          "Welcomed 50+ daily VIP clients while managing C-suite calendars.",
          "Handled travel logistics and vendor procurement budgets.",
        ],
      },
      {
        company: "Little Day Spa",
        role: "Lead Receptionist",
        years: "2018 – 2020",
        bullets: [
          "Scheduled 200+ weekly appointments and processed POS payments.",
        ],
      },
    ],
    projects: [
      { title: "Digital Visitor Kiosk Setup", tech: "Envoy, iPad POS", description: "Automated guest check-in reducing lobby wait times." },
    ],
  },

  project_first: {
    name: "Gregory Walls",
    title: "Lead Construction Project Director",
    email: "gregory.walls@build.com",
    phone: "(303) 555-0177",
    location: "Denver, CO",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    summary: "Senior Construction Manager oversight of $25M+ commercial development projects. Specialist in OSHA safety protocols, subcontractor budgeting, and timeline delivery.",
    skills: ["Construction Management", "Procore Safety", "Subcontractor Bidding", "CAD Blueprinting", "Cost Estimation"],
    education: [
      { institution: "Colorado State University", degree: "B.S. Construction Management", years: "2010 – 2014" },
    ],
    experience: [
      {
        company: "Timble General Contractors",
        role: "Senior Project Manager",
        years: "2019 – Present",
        bullets: [
          "Delivered 12-story commercial tower 3 weeks ahead of schedule under $18M budget.",
          "Maintained zero lost-time incidents across 450,000 work hours.",
        ],
      },
      {
        company: "Ringwood Development Inc",
        role: "Site Manager",
        years: "2014 – 2019",
        bullets: [
          "Supervised daily operations for residential subdivisions.",
        ],
      },
    ],
    projects: [
      { title: "Denver Tech Center Tower Project", tech: "Procore, AutoDesk", description: "$22M commercial build delivered on time with zero safety citations." },
    ],
  },

  academic_premium: {
    name: "Matthew Jones",
    title: "Financial Analyst & Economic Researcher",
    email: "matthew.j@finance.org",
    phone: "(212) 555-0166",
    location: "New York, NY",
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
    summary: "Detail-oriented Financial Analyst with strong background in corporate valuation, macroeconomic modeling, capital budgeting, and quantitative risk assessment.",
    skills: ["Financial Modeling", "DCF Valuation", "Bloomberg Terminal", "Python Data Analysis", "SQL & Excel VBA"],
    education: [
      { institution: "Wharton School - Univ. of Pennsylvania", degree: "B.S. Finance & Economics", years: "2017 – 2021", gpa: "3.95 GPA" },
    ],
    experience: [
      {
        company: "Morgan Stanley",
        role: "Investment Banking Analyst",
        years: "2021 – Present",
        bullets: [
          "Built LBO and M&A valuation models for $1.2B+ tech acquisitions.",
          "Prepared pitch books and financial due diligence reports for C-suite.",
        ],
      },
    ],
    projects: [
      { title: "Macroeconomic Interest Rate Sensitivity Study", tech: "Python, Stata", description: "Published research paper analyzing Federal Reserve rate shifts." },
    ],
  },

  one_page_dense: {
    name: "Susan Stone",
    title: "Marketing Manager & Digital Strategist",
    email: "susan.stone@marketing.com",
    phone: "(312) 555-0155",
    location: "Chicago, IL",
    photoUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80",
    summary: "Growth Marketer driving multi-channel acquisition campaigns, SEO optimization, and high-converting paid ad strategies across B2B SaaS.",
    skills: ["Google Ads & SEO", "HubSpot Automation", "Meta Ads Manager", "Conversion Optimization", "Content Strategy"],
    education: [
      { institution: "Harvard University", degree: "B.A. Marketing & Media", years: "2015 – 2019" },
    ],
    experience: [
      {
        company: "Mass Telecommunications",
        role: "Growth Marketing Manager",
        years: "2020 – Present",
        bullets: [
          "Increased organic web traffic by 180% year-over-year via targeted SEO pillar content.",
          "Managed $50k monthly ad budget yielding 4.2x ROAS across paid search and social.",
        ],
      },
      {
        company: "Freelance Digital Agency",
        role: "Online Marketing Consultant",
        years: "2019 – 2020",
        bullets: [
          "Scaled 8 ecommerce client stores from $10k to $100k+ monthly recurring revenue.",
        ],
      },
    ],
    projects: [
      { title: "B2B SaaS Lead Generation Funnel", tech: "HubSpot, Google Analytics 4", description: "Generated 3,400 qualified sales leads in Q3." },
    ],
  },

  modern_minimal: {
    name: "Sebastian Wilder",
    title: "Product Designer & UI/UX Specialist",
    email: "sebastian.w@design.io",
    phone: "(917) 555-0144",
    location: "Brooklyn, NY",
    photoUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80",
    summary: "User-centric Product Designer crafting intuitive digital web and mobile experiences. Expert in design systems, interactive prototypes, and usability testing.",
    skills: ["Figma & Design Systems", "User Research", "Wireframing & Prototyping", "HTML/CSS/Tailwind", "Accessibility (WCAG)"],
    education: [
      { institution: "Parsons School of Design", degree: "B.F.A. Industrial & Digital Design", years: "2016 – 2020" },
    ],
    experience: [
      {
        company: "Big Apple Products",
        role: "Senior UI/UX Designer",
        years: "2020 – Present",
        bullets: [
          "Redesigned core mobile checkout flow improving conversion rates by 26%.",
          "Established company-wide Figma component design library used by 40+ engineers.",
        ],
      },
    ],
    projects: [
      { title: "Fintech Mobile Wallet App", tech: "Figma, Protopie", description: "Award-winning mobile app design with over 500k active users." },
    ],
  },

  impact_focused: {
    name: "Jack Farrell",
    title: "Warehouse Operations Manager",
    email: "jack.farrell@logistics.com",
    phone: "(312) 555-0133",
    location: "Chicago, IL",
    photoUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80",
    summary: "Operations Supervisor driving 30% efficiency gains across distribution centers, inventory logistics, and fulfillment supply chains.",
    skills: ["Logistics Operations", "WMS & SAP", "Inventory Control", "Fleet Management", "Six Sigma Lean"],
    education: [
      { institution: "Illinois Institute of Technology", degree: "B.S. Supply Chain Logistics", years: "2012 – 2016" },
    ],
    experience: [
      {
        company: "Warehousing Corp",
        role: "Warehouse Operations Lead",
        years: "2019 – Present",
        bullets: [
          "Supervised 60+ floor staff maintaining 99.4% order picking accuracy rate.",
          "Cut inventory discrepancy costs by $120k annually through barcode automation.",
        ],
      },
      {
        company: "Packaging Inc",
        role: "Logistics Coordinator",
        years: "2016 – 2019",
        bullets: [
          "Managed daily dispatch routes for 25 commercial freight vehicles.",
        ],
      },
    ],
    projects: [
      { title: "Distribution Center Automation", tech: "SAP WMS, RFID", description: "Automated pallet tracking accelerating order dispatch by 35%." },
    ],
  },

  developer_portfolio: {
    name: "Elsa Williams",
    title: "Physical Therapist & Clinical Specialist",
    email: "elsa.williams@health.org",
    phone: "(619) 555-0122",
    location: "San Diego, CA",
    photoUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80",
    summary: "Compassionate Physical Therapist with 7+ years of clinical experience in orthopedic rehabilitation, sports injury recovery, and patient care management.",
    skills: ["Orthopedic Rehabilitation", "Post-Surgical Care", "Patient Evaluation", "Manual Therapy", "EMR Documentation"],
    education: [
      { institution: "University of Southern California", degree: "Doctor of Physical Therapy (DPT)", years: "2014 – 2017" },
      { institution: "UC San Diego", degree: "B.S. Kinesiology", years: "2010 – 2014" },
    ],
    experience: [
      {
        company: "Physical Therapy Care Center",
        role: "Lead Physical Therapist",
        years: "2019 – Present",
        bullets: [
          "Evaluated and treated 25+ daily patients recovering from complex joint surgeries.",
          "Achieved 96% patient satisfaction rating across post-op rehabilitation programs.",
        ],
      },
      {
        company: "Rehab Specialists Inc",
        role: "Staff Therapist",
        years: "2017 – 2019",
        bullets: [
          "Formulated individualized recovery plans for collegiate and professional athletes.",
        ],
      },
    ],
    projects: [
      { title: "ACL Rehabilitation Protocol", tech: "Clinical Study", description: "Published recovery guidelines adopted across 14 regional clinics." },
    ],
  },

  global_professional: {
    name: "Alexander Wright",
    title: "Enterprise Solutions Architect",
    email: "alexander.wright@tech.corp",
    phone: "(617) 555-0111",
    location: "Boston, MA",
    photoUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80",
    summary: "Enterprise Technology Architect specializing in cloud infrastructure migration, microservice design, and digital transformation for Fortune 500 companies.",
    skills: ["Cloud Architecture (AWS/GCP)", "Kubernetes & Microservices", "Enterprise Security", "DevOps Pipelines", "Stakeholder Management"],
    education: [
      { institution: "MIT", degree: "M.S. Computer Science", years: "2014 – 2016" },
      { institution: "Boston University", degree: "B.S. Software Engineering", years: "2010 – 2014" },
    ],
    experience: [
      {
        company: "Global Tech Solutions",
        role: "Principal Solutions Architect",
        years: "2020 – Present",
        bullets: [
          "Led $40M cloud migration for legacy banking core saving $4.2M annually.",
          "Architected zero-trust security framework serving 2M+ active daily users.",
        ],
      },
    ],
    projects: [
      { title: "Bank Core Cloud Migration", tech: "AWS, Terraform, K8s", description: "Migrated 120+ microservices to cloud with zero unplanned downtime." },
    ],
  },
};

// Fill photo personas for photo templates
const PHOTO_PERSONAS: Record<string, PersonaData> = {
  photo_executive: {
    name: "Sophie Watson",
    title: "Executive Vice President of Operations",
    email: "sophie.w@executive.com",
    phone: "(206) 555-0142",
    location: "Seattle, WA",
    photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
    summary: "Senior Operations Executive with 12+ years steering corporate growth, cross-functional business strategies, and $50M+ P&L management.",
    skills: ["P&L Management", "Strategic Operations", "Cross-Functional Leadership", "Corporate Mergers", "Budget Optimization"],
    education: [
      { institution: "University of Washington", degree: "Executive MBA", years: "2016 – 2018" },
      { institution: "Seattle University", degree: "B.A. Business Administration", years: "2010 – 2014" },
    ],
    experience: [
      {
        company: "Apex Global Holdings",
        role: "VP of Business Operations",
        years: "2020 – Present",
        bullets: [
          "Oversee operational strategy across 14 regional offices with 450+ employees.",
          "Increased operating margin by 22% over 3 fiscal years through Lean implementation.",
        ],
      },
    ],
    projects: [
      { title: "Enterprise ERP Transformation", tech: "SAP S/4HANA", description: "Unified financial and supply chain systems across 4 corporate subsidiaries." },
    ],
  },

  photo_side_panel: {
    name: "Gregory Walls",
    title: "Senior Product Designer & Art Director",
    email: "gregory.walls@design.co",
    phone: "(415) 555-0199",
    location: "San Francisco, CA",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    summary: "Creative Art Director crafting high-impact visual identity systems, mobile applications, and brand experiences for tier-1 tech products.",
    skills: ["Visual Brand Design", "Figma & Design Systems", "Interactive Prototyping", "User Research", "3D Motion Graphics"],
    education: [
      { institution: "California College of the Arts", degree: "B.F.A. Graphic Design", years: "2013 – 2017" },
    ],
    experience: [
      {
        company: "Studio Nimble Creative",
        role: "Lead Product Designer",
        years: "2021 – Present",
        bullets: [
          "Directed design overhaul for mobile fintech app used by 3M+ active subscribers.",
          "Mentored team of 8 junior and mid-level product designers across 4 squads.",
        ],
      },
      {
        company: "Vanguard Media",
        role: "Senior UI Designer",
        years: "2017 – 2021",
        bullets: [
          "Designed marketing landing pages generating over $12M in customer acquisitions.",
        ],
      },
    ],
    projects: [
      { title: "Fintech Mobile Wallet Redesign", tech: "Figma, Principle", description: "Increased daily active app usage by 34% post release." },
    ],
  },

  photo_student_card: {
    name: "Matthew Jones",
    title: "Full Stack Engineer & CS Student",
    email: "matthew.j@tech.edu",
    phone: "(212) 555-0188",
    location: "New York, NY",
    photoUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80",
    summary: "Computer Science senior passionate about cloud infrastructure, full-stack React/Node web platforms, and open-source AI tooling.",
    skills: ["React, Next.js", "Node.js, Express", "TypeScript & SQL", "Docker & AWS", "Data Structures"],
    education: [
      { institution: "Columbia University", degree: "B.S. Computer Science", years: "2021 – 2025", gpa: "3.92 GPA" },
    ],
    experience: [
      {
        company: "Google Cloud Inc",
        role: "Software Engineering Intern",
        years: "Summer 2024",
        bullets: [
          "Built real-time telemetry dashboard monitoring Kubernetes cluster health.",
          "Implemented automated CI/CD pipeline reducing build test runtimes by 30%.",
        ],
      },
    ],
    projects: [
      { title: "AI Resume Generator Platform", tech: "Next.js, OpenAI API, PostgreSQL", description: "Built viral SaaS web tool serving over 20,000 active university students." },
    ],
  },

  photo_corporate: {
    name: "Charlotte Warren",
    title: "Management Consultant & Strategy Lead",
    email: "charlotte.w@consulting.com",
    phone: "(312) 555-0177",
    location: "Chicago, IL",
    photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
    summary: "Management Consultant specializing in corporate strategy, digital operating models, and organizational restructurings for Fortune 500 enterprises.",
    skills: ["Corporate Strategy", "Market Analysis", "Operating Models", "Financial Due Diligence", "Stakeholder Presentation"],
    education: [
      { institution: "Northwestern Kellogg", degree: "MBA Strategy & Finance", years: "2017 – 2019" },
      { institution: "UChicago", degree: "B.A. Economics", years: "2011 – 2015" },
    ],
    experience: [
      {
        company: "McKinsey & Company",
        role: "Associate Partner",
        years: "2019 – Present",
        bullets: [
          "Advised C-suite executives on $2B acquisition integration across healthcare sector.",
          "Led restructuring program that unlocked $85M in annual operational efficiencies.",
        ],
      },
    ],
    projects: [
      { title: "Healthcare Supply Chain Overhaul", tech: "Strategic Analysis", description: "Optimized logistics footprint across 40 regional hospital networks." },
    ],
  },

  photo_creative_tech: {
    name: "Sebastian Wilder",
    title: "Frontend Developer & Creative Coder",
    email: "sebastian.w@code.dev",
    phone: "(917) 555-0166",
    location: "Brooklyn, NY",
    photoUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80",
    summary: "Creative Technologist blending modern React web development, Three.js 3D web graphics, and interactive user interfaces.",
    skills: ["React & Next.js", "Three.js / WebGL", "TailwindCSS & Motion", "TypeScript", "Performance Tuning"],
    education: [
      { institution: "NYU Tisch School of Arts", degree: "B.S. Interactive Telecommunications", years: "2017 – 2021" },
    ],
    experience: [
      {
        company: "Superreal Creative Agency",
        role: "Lead Frontend Engineer",
        years: "2021 – Present",
        bullets: [
          "Engineered immersive web experiences for global brands using WebGL & React.",
          "Achieved 99+ Lighthouse performance scores across all client production deployments.",
        ],
      },
    ],
    projects: [
      { title: "3D Interactive Product Configurator", tech: "Three.js, React, WebGL", description: "Interactive 3D configurator increasing e-commerce checkout sales by 42%." },
    ],
  },

  photo_academic: {
    name: "Matthew Jones",
    title: "Bioinformatics Researcher & Data Scientist",
    email: "matthew.j@research.edu",
    phone: "(617) 555-0155",
    location: "Cambridge, MA",
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
    summary: "Biomedical Data Researcher utilizing machine learning, genomic sequencing pipelines, and statistical modeling to accelerate drug discovery.",
    skills: ["Genomic Data Analysis", "Python & R Statistics", "PyTorch ML Models", "Bioinformatics Pipelines", "LaTeX & Publishing"],
    education: [
      { institution: "Harvard Medical School", degree: "Ph.D. Biomedical Informatics", years: "2019 – 2024" },
      { institution: "MIT", degree: "B.S. Computational Biology", years: "2015 – 2019", gpa: "3.96 GPA" },
    ],
    experience: [
      {
        company: "Broad Institute of MIT and Harvard",
        role: "Postdoctoral Research Fellow",
        years: "2024 – Present",
        bullets: [
          "Developed deep learning pipeline classifying rare genetic variant pathogenicity.",
          "Co-authored 6 peer-reviewed papers in Nature Genetics and Bioinformatics.",
        ],
      },
    ],
    projects: [
      { title: "Single-Cell RNA Sequencing Toolkit", tech: "Python, PyTorch, R", description: "Open source genomic tool downloaded by over 40,000 global researchers." },
    ],
  },

  photo_split_hero: {
    name: "Susan Stone",
    title: "Senior Product Manager",
    email: "susan.stone@product.io",
    phone: "(415) 555-0144",
    location: "San Francisco, CA",
    photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
    summary: "Data-driven Senior Product Manager leading 0-to-1 SaaS products, user growth funnels, and agile engineering roadmaps.",
    skills: ["Product Roadmap Strategy", "Agile & Scrum Methodologies", "A/B Testing & Mixpanel", "User Persona Research", "SQL Data Analytics"],
    education: [
      { institution: "Stanford University", degree: "B.S. Symbolic Systems", years: "2014 – 2018" },
    ],
    experience: [
      {
        company: "Stripe Inc",
        role: "Group Product Manager",
        years: "2021 – Present",
        bullets: [
          "Led team of 14 engineers and designers building developer API billing tools.",
          "Grew platform ARR from $12M to $45M in 24 months through self-serve onboarding.",
        ],
      },
      {
        company: "Lyft",
        role: "Product Manager",
        years: "2018 – 2021",
        bullets: [
          "Optimized passenger pickup matching algorithms reducing driver wait times by 18%.",
        ],
      },
    ],
    projects: [
      { title: "Self-Serve Enterprise Billing Portal", tech: "Stripe API, React", description: "Reduced customer onboarding friction from 5 days to 10 minutes." },
    ],
  },

  photo_clean_vertical: {
    name: "Alexander Wright",
    title: "Lead Cloud Infrastructure Architect",
    email: "alex.wright@cloud.net",
    phone: "(206) 555-0133",
    location: "Seattle, WA",
    photoUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80",
    summary: "Cloud Architect designing high-availability AWS/Kubernetes systems, Infrastructure-as-Code automation, and zero-downtime microservice deployments.",
    skills: ["AWS & Kubernetes (EKS)", "Terraform & Ansible", "CI/CD GitHub Actions", "Go & Python Automation", "Cybersecurity Compliance"],
    education: [
      { institution: "University of Washington", degree: "B.S. Computer Engineering", years: "2012 – 2016" },
    ],
    experience: [
      {
        company: "Amazon Web Services (AWS)",
        role: "Principal Solutions Architect",
        years: "2019 – Present",
        bullets: [
          "Architected multi-region failover cluster handling 50k requests/second with 99.999% SLA.",
          "Automated Terraform deployment templates saving 400+ engineering team hours.",
        ],
      },
    ],
    projects: [
      { title: "Multi-Region Cloud Failover Mesh", tech: "AWS EKS, Terraform, Istio", description: "Zero-downtime regional failover infrastructure for enterprise banking." },
    ],
  },

  photo_personal_brand: {
    name: "Elsa Williams",
    title: "UX Director & Brand Founder",
    email: "elsa.williams@brand.co",
    phone: "(310) 555-0122",
    location: "Los Angeles, CA",
    photoUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80",
    summary: "Creative Director and Brand Strategist helping tech founders launch iconic identity systems, high-converting digital web products, and brand stories.",
    skills: ["Creative Direction", "Brand Strategy & Positioning", "UI/UX Design Systems", "Content Strategy", "Digital Campaign Management"],
    education: [
      { institution: "USC Roski School of Art", degree: "B.F.A. Visual Design & Media", years: "2013 – 2017" },
    ],
    experience: [
      {
        company: "Elsa Williams Studio",
        role: "Founder & Creative Lead",
        years: "2020 – Present",
        bullets: [
          "Branded and launched 25+ venture-backed tech startups raising over $150M in Series A.",
          "Recognized in Awwwards, Webby Awards, and Communication Arts Design Annual.",
        ],
      },
    ],
    projects: [
      { title: "Venture Brand Identity Suite", tech: "Figma, Webflow", description: "Complete brand design system and web launch platform for AI startup." },
    ],
  },

  photo_premium_identity: {
    name: "Jack Farrell",
    title: "Engineering Director & Systems Lead",
    email: "jack.farrell@engineering.com",
    phone: "(512) 555-0111",
    location: "Austin, TX",
    photoUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80",
    summary: "Engineering Director with 14+ years scaling engineering organizations, real-time backend microservices, and distributed cloud platforms.",
    skills: ["Engineering Leadership", "Distributed Systems", "Go, C++, Rust", "High-Throughput APIs", "Agile Team Scaling"],
    education: [
      { institution: "UT Austin", degree: "B.S. Electrical & Computer Engineering", years: "2008 – 2012" },
    ],
    experience: [
      {
        company: "Tesla Motors",
        role: "Director of Software Engineering",
        years: "2019 – Present",
        bullets: [
          "Scaled engineering organization from 20 to 120+ engineers across 6 specialized squads.",
          "Architected real-time vehicle telemetry data platform processing 10B+ daily data points.",
        ],
      },
    ],
    projects: [
      { title: "Real-Time Telemetry Data Engine", tech: "Go, Apache Kafka, Rust", description: "Stream processing infrastructure scaling to 10M concurrent connected devices." },
    ],
  },
};

export function TemplatePreviewWireframe({ tmpl }: { tmpl: TemplateDefinition }) {
  const accent = tmpl.accentColor || "#01696f";
  const isPhoto = tmpl.supportsPhoto;

  const p = isPhoto 
    ? (PHOTO_PERSONAS[tmpl.id] || PHOTO_PERSONAS.photo_executive)
    : (PERSONAS[tmpl.id] || PERSONAS.modern);

  // Determine section order labels
  const sectionsToDisplay = tmpl.sectionOrder.map((s) => {
    const labels: Record<string, string> = {
      summary: "PROFILE SUMMARY",
      education: "EDUCATION",
      skills: "CORE SKILLS & TECH",
      projects: "KEY PROJECTS",
      experience: "EMPLOYMENT HISTORY",
      achievements: "ACHIEVEMENTS",
      certifications: "CERTIFICATIONS",
    };
    return { key: s, label: labels[s] || s.toUpperCase() };
  });

  // ── 1. SIDEBAR LAYOUT (Side Photo Panel / Modern Sidebar) ──
  if (tmpl.headerStyle === "side_panel" || tmpl.photoPlacement === "sidebar") {
    return (
      <div className="w-full aspect-[1/1.41] bg-white text-zinc-900 shadow-sm border border-zinc-200/90 rounded-md p-0 overflow-hidden select-none relative flex text-[7.5px] leading-[1.2]">
        {/* Left Solid Colored Sidebar */}
        <div className="w-[34%] p-2.5 flex flex-col space-y-2 shrink-0 text-white" style={{ backgroundColor: accent }}>
          {isPhoto ? (
            <div className="flex flex-col items-center text-center space-y-1 mb-1">
              <img
                src={p.photoUrl}
                alt={p.name}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-white/80 shadow-xs shrink-0"
              />
              <span className="text-[7.5px] font-bold text-white leading-none tracking-tight block mt-0.5">{p.name}</span>
              <span className="text-[6px] text-white/80 font-medium block truncate max-w-full">{p.title}</span>
            </div>
          ) : (
            <div className="border-b border-white/30 pb-1 mb-0.5">
              <span className="text-[8.5px] font-extrabold text-white block uppercase tracking-tight">{p.name}</span>
              <span className="text-[6px] text-white/80 font-medium block truncate">{p.title}</span>
            </div>
          )}

          {/* Details / Contact Block */}
          <div className="space-y-1 text-[6.5px] text-white/90">
            <span className="text-[6px] font-extrabold uppercase tracking-wider block text-white/70 border-b border-white/20 pb-0.5">CONTACT</span>
            <p className="truncate">📍 {p.location}</p>
            <p className="truncate">✉️ {p.email}</p>
            <p className="truncate">📞 {p.phone}</p>
          </div>

          {/* Skills Block */}
          <div className="space-y-1 text-[6.5px] text-white/90">
            <span className="text-[6px] font-extrabold uppercase tracking-wider block text-white/70 border-b border-white/20 pb-0.5">SKILLS</span>
            <div className="space-y-0.5">
              {p.skills.slice(0, 4).map((sk, i) => (
                <p key={i} className="truncate">• {sk}</p>
              ))}
            </div>
          </div>

          {/* Education Mini Block */}
          <div className="space-y-1 text-[6.5px] text-white/90">
            <span className="text-[6px] font-extrabold uppercase tracking-wider block text-white/70 border-b border-white/20 pb-0.5">EDUCATION</span>
            {p.education.slice(0, 1).map((ed, i) => (
              <div key={i} className="space-y-0.5">
                <p className="font-bold text-white truncate">{ed.institution}</p>
                <p className="text-white/80 text-[6px] truncate">{ed.degree}</p>
                <p className="text-white/60 text-[5.5px]">{ed.years}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Main Body Content */}
        <div className="flex-1 p-3 flex flex-col space-y-2 min-w-0 bg-white">
          {!isPhoto && (
            <div className="pb-1 border-b border-zinc-200">
              <h2 className="text-[10px] font-extrabold text-zinc-900 uppercase tracking-tight">{p.name}</h2>
              <p className="text-[7px] text-zinc-600 font-semibold">{p.title}</p>
            </div>
          )}

          {/* Render Sections in exact Order */}
          {sectionsToDisplay.map((sec) => {
            if (sec.key === "summary") {
              return (
                <div key={sec.key} className="space-y-0.5">
                  <h3 className="text-[7px] font-extrabold uppercase tracking-wider border-b border-zinc-200 pb-0.5" style={{ color: accent }}>{sec.label}</h3>
                  <p className="text-[6.5px] text-zinc-600 leading-normal line-clamp-3">{p.summary}</p>
                </div>
              );
            }
            if (sec.key === "experience") {
              return (
                <div key={sec.key} className="space-y-1">
                  <h3 className="text-[7px] font-extrabold uppercase tracking-wider border-b border-zinc-200 pb-0.5" style={{ color: accent }}>{sec.label}</h3>
                  {p.experience.map((exp, idx) => (
                    <div key={idx} className="space-y-0.5">
                      <div className="flex items-center justify-between font-bold text-[6.5px] text-zinc-900">
                        <span className="truncate">{exp.role} — {exp.company}</span>
                        <span className="text-[5.5px] text-zinc-500 shrink-0">{exp.years}</span>
                      </div>
                      {exp.bullets.map((b, bi) => (
                        <p key={bi} className="text-[6px] text-zinc-600 leading-tight truncate">• {b}</p>
                      ))}
                    </div>
                  ))}
                </div>
              );
            }
            if (sec.key === "projects") {
              return (
                <div key={sec.key} className="space-y-1">
                  <h3 className="text-[7px] font-extrabold uppercase tracking-wider border-b border-zinc-200 pb-0.5" style={{ color: accent }}>{sec.label}</h3>
                  {p.projects.map((proj, idx) => (
                    <div key={idx} className="space-y-0.5">
                      <p className="text-[6.5px] font-bold text-zinc-900 truncate">{proj.title} <span className="text-[5.5px] font-normal text-zinc-500">({proj.tech})</span></p>
                      <p className="text-[6px] text-zinc-600 leading-tight truncate">• {proj.description}</p>
                    </div>
                  ))}
                </div>
              );
            }
            return null;
          })}
        </div>

        {/* PDF/DOCX Badge */}
        <div className="absolute bottom-1.5 right-1.5 flex gap-0.5 z-10">
          <span className="px-1 py-0.5 text-[6px] font-bold bg-zinc-100/90 text-zinc-600 rounded-2xs border border-zinc-200 shadow-2xs">PDF</span>
          <span className="px-1 py-0.5 text-[6px] font-bold bg-zinc-100/90 text-zinc-600 rounded-2xs border border-zinc-200 shadow-2xs">DOCX</span>
        </div>
      </div>
    );
  }

  // ── 2. CENTERED / PROFILE CARD LAYOUT (Student Profile Card / Academic) ──
  if (tmpl.headerStyle === "centered" || tmpl.headerStyle === "profile_card") {
    return (
      <div className="w-full aspect-[1/1.41] bg-white text-zinc-900 shadow-sm border border-zinc-200/90 rounded-md p-3 overflow-hidden select-none relative flex flex-col space-y-2 text-[7.5px] leading-[1.2]">
        {/* Centered Header */}
        <div className="flex flex-col items-center text-center space-y-1 pb-1.5 border-b border-zinc-200">
          {isPhoto && (
            <img
              src={p.photoUrl}
              alt={p.name}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover border-2 shadow-2xs shrink-0"
              style={{ borderColor: accent }}
            />
          )}
          <div>
            <h2 className="text-[10px] font-extrabold uppercase tracking-tight" style={{ color: accent }}>{p.name}</h2>
            <p className="text-[6.5px] text-zinc-600 font-semibold">{p.title}</p>
            <p className="text-[6px] text-zinc-500 mt-0.5">{p.email} • {p.phone} • {p.location}</p>
          </div>
        </div>

        {/* Dynamic Full Content Sections */}
        <div className="space-y-2 flex-1 min-w-0">
          {sectionsToDisplay.map((sec) => {
            if (sec.key === "summary") {
              return (
                <div key={sec.key} className="space-y-0.5">
                  <h3 className="text-[7px] font-extrabold uppercase tracking-wider text-center border-b border-zinc-200 pb-0.5" style={{ color: accent }}>{sec.label}</h3>
                  <p className="text-[6.5px] text-zinc-600 text-center leading-normal line-clamp-2 px-1">{p.summary}</p>
                </div>
              );
            }
            if (sec.key === "skills") {
              return (
                <div key={sec.key} className="space-y-1">
                  <h3 className="text-[7px] font-extrabold uppercase tracking-wider border-b border-zinc-200 pb-0.5" style={{ color: accent }}>{sec.label}</h3>
                  <div className="flex flex-wrap gap-1">
                    {p.skills.map((sk, idx) => (
                      <span key={idx} className="px-1.5 py-0.5 rounded-2xs text-[6px] font-medium bg-zinc-100 text-zinc-700 border border-zinc-200">{sk}</span>
                    ))}
                  </div>
                </div>
              );
            }
            if (sec.key === "education") {
              return (
                <div key={sec.key} className="space-y-1">
                  <h3 className="text-[7px] font-extrabold uppercase tracking-wider border-b border-zinc-200 pb-0.5" style={{ color: accent }}>{sec.label}</h3>
                  {p.education.map((ed, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[6.5px]">
                      <div>
                        <span className="font-bold text-zinc-900">{ed.institution}</span> — <span className="text-zinc-600">{ed.degree}</span>
                      </div>
                      <span className="text-[6px] text-zinc-500 font-medium">{ed.years}</span>
                    </div>
                  ))}
                </div>
              );
            }
            if (sec.key === "experience" || sec.key === "projects") {
              return (
                <div key={sec.key} className="space-y-1">
                  <h3 className="text-[7px] font-extrabold uppercase tracking-wider border-b border-zinc-200 pb-0.5" style={{ color: accent }}>{sec.label}</h3>
                  {p.experience.slice(0, 1).map((exp, idx) => (
                    <div key={idx} className="space-y-0.5">
                      <div className="flex items-center justify-between text-[6.5px] font-bold text-zinc-900">
                        <span>{exp.role} @ {exp.company}</span>
                        <span className="text-[5.5px] text-zinc-500">{exp.years}</span>
                      </div>
                      {exp.bullets.map((b, bi) => (
                        <p key={bi} className="text-[6px] text-zinc-600 leading-tight truncate">• {b}</p>
                      ))}
                    </div>
                  ))}
                </div>
              );
            }
            return null;
          })}
        </div>

        {/* PDF/DOCX Badge */}
        <div className="absolute bottom-1.5 right-1.5 flex gap-0.5 z-10">
          <span className="px-1 py-0.5 text-[6px] font-bold bg-zinc-100/90 text-zinc-600 rounded-2xs border border-zinc-200 shadow-2xs">PDF</span>
          <span className="px-1 py-0.5 text-[6px] font-bold bg-zinc-100/90 text-zinc-600 rounded-2xs border border-zinc-200 shadow-2xs">DOCX</span>
        </div>
      </div>
    );
  }

  // ── 3. STANDARD / BANNER LAYOUT (Executive Banner, Corporate Portrait, Modern Minimal) ──
  return (
    <div className="w-full aspect-[1/1.41] bg-white text-zinc-900 shadow-sm border border-zinc-200/90 rounded-md p-3 overflow-hidden select-none relative flex flex-col space-y-2 text-[7.5px] leading-[1.2]">
      {/* Header Row */}
      <div className="flex items-center justify-between gap-2.5 pb-1.5 border-b border-zinc-200">
        {tmpl.photoPlacement === "top_left" && isPhoto && (
          <img
            src={p.photoUrl}
            alt={p.name}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg object-cover border-2 shadow-2xs shrink-0"
            style={{ borderColor: accent }}
          />
        )}

        <div className="flex-1 min-w-0">
          <h2 className="text-[10.5px] font-extrabold uppercase tracking-tight" style={{ color: accent }}>{p.name}</h2>
          <p className="text-[6.5px] text-zinc-700 font-bold truncate">{p.title}</p>
          <p className="text-[6px] text-zinc-500 truncate mt-0.5">{p.email} | {p.phone} | {p.location}</p>
        </div>

        {(tmpl.photoPlacement === "top_right" || tmpl.photoPlacement === "inline") && isPhoto && (
          <img
            src={p.photoUrl}
            alt={p.name}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg object-cover border-2 shadow-2xs shrink-0"
            style={{ borderColor: accent }}
          />
        )}
      </div>

      {/* Dynamic Sections in Template Order */}
      <div className="space-y-2 flex-1 min-w-0">
        {sectionsToDisplay.map((sec) => {
          if (sec.key === "summary") {
            return (
              <div key={sec.key} className="space-y-0.5">
                <h3 className="text-[7px] font-extrabold uppercase tracking-wider border-b border-zinc-200 pb-0.5" style={{ color: accent }}>{sec.label}</h3>
                <p className="text-[6.5px] text-zinc-600 leading-normal line-clamp-2">{p.summary}</p>
              </div>
            );
          }

          if (sec.key === "skills") {
            return (
              <div key={sec.key} className="space-y-1">
                <h3 className="text-[7px] font-extrabold uppercase tracking-wider border-b border-zinc-200 pb-0.5" style={{ color: accent }}>{sec.label}</h3>
                <p className="text-[6.5px] text-zinc-700 font-medium leading-tight">
                  {p.skills.join(" • ")}
                </p>
              </div>
            );
          }

          if (sec.key === "experience") {
            return (
              <div key={sec.key} className="space-y-1">
                <h3 className="text-[7px] font-extrabold uppercase tracking-wider border-b border-zinc-200 pb-0.5" style={{ color: accent }}>{sec.label}</h3>
                {p.experience.map((exp, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="flex items-center justify-between text-[6.5px] font-bold text-zinc-900">
                      <span className="truncate">{exp.role} — {exp.company}</span>
                      <span className="text-[5.5px] text-zinc-500 shrink-0">{exp.years}</span>
                    </div>
                    {exp.bullets.map((b, bi) => (
                      <p key={bi} className="text-[6px] text-zinc-600 leading-tight truncate">• {b}</p>
                    ))}
                  </div>
                ))}
              </div>
            );
          }

          if (sec.key === "education") {
            return (
              <div key={sec.key} className="space-y-1">
                <h3 className="text-[7px] font-extrabold uppercase tracking-wider border-b border-zinc-200 pb-0.5" style={{ color: accent }}>{sec.label}</h3>
                {p.education.map((ed, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[6.5px]">
                    <span className="font-bold text-zinc-900 truncate">{ed.institution} — <span className="font-normal text-zinc-600">{ed.degree}</span></span>
                    <span className="text-[5.5px] text-zinc-500 shrink-0">{ed.years}</span>
                  </div>
                ))}
              </div>
            );
          }

          if (sec.key === "projects") {
            return (
              <div key={sec.key} className="space-y-1">
                <h3 className="text-[7px] font-extrabold uppercase tracking-wider border-b border-zinc-200 pb-0.5" style={{ color: accent }}>{sec.label}</h3>
                {p.projects.map((proj, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <p className="text-[6.5px] font-bold text-zinc-900 truncate">{proj.title} <span className="text-[5.5px] font-normal text-zinc-500">[{proj.tech}]</span></p>
                    <p className="text-[6px] text-zinc-600 leading-tight truncate">• {proj.description}</p>
                  </div>
                ))}
              </div>
            );
          }

          return null;
        })}
      </div>

      {/* PDF/DOCX Badge */}
      <div className="absolute bottom-1.5 right-1.5 flex gap-0.5 z-10">
        <span className="px-1 py-0.5 text-[6px] font-bold bg-zinc-100/90 text-zinc-600 rounded-2xs border border-zinc-200 shadow-2xs">PDF</span>
        <span className="px-1 py-0.5 text-[6px] font-bold bg-zinc-100/90 text-zinc-600 rounded-2xs border border-zinc-200 shadow-2xs">DOCX</span>
      </div>
    </div>
  );
}
