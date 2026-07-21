"use client";

import React from "react";
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
  certifications?: string[];
  achievements?: string[];
}

// Rich Indian Personas designed to fill full-page 1-page resumes top-to-bottom with zero empty gaps
const INDIAN_PERSONAS: Record<string, PersonaData> = {
  modern: {
    name: "Aarav Sharma",
    title: "Senior Software Engineer",
    email: "aarav.sharma@tech.in",
    phone: "+91 98765 43210",
    location: "Bengaluru, KA",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    summary: "Senior Software Engineer with 6+ years of experience building high-throughput microservices, distributed cloud systems, and real-time backend platforms at scale.",
    skills: ["Java, Spring Boot", "Microservices & REST", "Kafka & Redis", "AWS & Docker", "SQL & MongoDB", "System Design"],
    education: [
      { institution: "IIT Bombay", degree: "B.Tech Computer Science", years: "2015 – 2019", gpa: "9.2 CGPA" },
      { institution: "Delhi Public School, R.K. Puram", degree: "CBSE Class XII (PCM)", years: "2013 – 2015" },
    ],
    experience: [
      {
        company: "Flipkart Internet Pvt Ltd",
        role: "Senior Software Engineer",
        years: "2021 – Present",
        bullets: [
          "Architected Big Billion Days checkout engine processing 120,000 requests/sec with 99.99% uptime.",
          "Reduced database query latency by 45% through Redis caching and index optimization.",
          "Mentored 8 junior software engineers and led sprint planning reviews.",
        ],
      },
      {
        company: "Swiggy Labs",
        role: "Software Development Engineer II",
        years: "2019 – 2021",
        bullets: [
          "Built real-time delivery tracking service handling 2M+ active daily orders.",
          "Implemented Kafka message queues eliminating order drop issues during peak meal hours.",
        ],
      },
    ],
    projects: [
      { title: "Distributed Payment Gateway Adapter", tech: "Java 17, Spring Boot, AWS", description: "Multi-PSP failover service handling $40M daily digital transactions." },
      { title: "Real-time Order Tracking Engine", tech: "Node.js, Kafka, Redis", description: "Reduced order tracking API latency from 450ms to 42ms." },
    ],
    certifications: ["AWS Certified Solutions Architect – Associate", "Oracle Certified Professional Java SE 17"],
    achievements: ["Flipkart Tech Innovation Award 2023", "National Cyber Olympiad Rank 14"],
  },

  recruiter_scan: {
    name: "Priya Ananya Patel",
    title: "Full Stack Lead & Cloud Developer",
    email: "priya.patel@dev.in",
    phone: "+91 98123 45678",
    location: "Hyderabad, TS",
    photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
    summary: "Full Stack Lead specializing in React/Next.js frontend systems, Node.js GraphQL APIs, and automated CI/CD cloud deployments across fintech platforms.",
    skills: ["React & Next.js", "TypeScript & Node.js", "GraphQL & REST APIs", "PostgreSQL & Prisma", "Docker & Kubernetes", "CI/CD Pipelines"],
    education: [
      { institution: "BITS Pilani", degree: "B.E. Computer Science", years: "2016 – 2020", gpa: "9.4 CGPA" },
      { institution: "Hyderabad Public School", degree: "Class XII Science", years: "2014 – 2016" },
    ],
    experience: [
      {
        company: "Razorpay Software",
        role: "Lead Frontend Engineer",
        years: "2021 – Present",
        bullets: [
          "Led development of merchant onboarding dashboard used by 250,000+ Indian businesses.",
          "Optimized bundle rendering performance reducing initial page load time from 3.2s to 0.9s.",
          "Created modular Design System UI component library adopted across 14 product squads.",
        ],
      },
      {
        company: "MakeMyTrip India",
        role: "Software Developer",
        years: "2020 – 2021",
        bullets: [
          "Developed hotel booking web application serving 5M+ monthly active travelers.",
          "Integrated UPI & Netbanking payment SDKs with zero checkout security drop-offs.",
        ],
      },
    ],
    projects: [
      { title: "Merchant Analytics Dashboard", tech: "React, Next.js, Recharts, Tailwind", description: "Real-time revenue monitoring portal processing 10M+ transaction logs." },
      { title: "Automated Developer Onboarding Tool", tech: "Node.js, Docker, GitHub Actions", description: "Accelerated developer environment setup from 2 days to 15 minutes." },
    ],
    certifications: ["Meta Certified Professional Front-End Developer", "Docker Certified Associate"],
    achievements: ["Razorpay Hackathon Winner 2022", "KVPY Scholar Fellowship Winner"],
  },

  skills_first: {
    name: "Rohan Verma",
    title: "Backend Systems Architect",
    email: "rohan.v@systems.in",
    phone: "+91 97654 32109",
    location: "Bengaluru, KA",
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
    summary: "Backend Systems Architect with 8+ years designing fault-tolerant databases, distributed caching layers, and high-security enterprise banking APIs.",
    skills: ["Go, C++, Rust", "Distributed Systems", "Kubernetes (EKS)", "PostgreSQL, Redis", "gRPC & Protobuf", "System Security"],
    education: [
      { institution: "NIT Trichy", degree: "B.Tech Computer Science", years: "2013 – 2017" },
      { institution: "National Public School, Indiranagar", degree: "Class XII CBSE", years: "2011 – 2013" },
    ],
    experience: [
      {
        company: "PhonePe India",
        role: "Principal Backend Architect",
        years: "2020 – Present",
        bullets: [
          "Architected core UPI settlement system handling 45M daily UPI transactions.",
          "Designed multi-datacenter active-active database replication cluster.",
          "Reduced cloud server infrastructure expenditure by ₹2.4 Crores annually.",
        ],
      },
      {
        company: "Oracle India",
        role: "Senior Backend Developer",
        years: "2017 – 2020",
        bullets: [
          "Built cloud database management APIs used by 500+ enterprise client databases.",
        ],
      },
    ],
    projects: [
      { title: "High-Throughput Settlement Engine", tech: "Go, gRPC, Apache Cassandra", description: "Zero-data-loss financial transaction engine processing 30k TPS." },
      { title: "Distributed Lock Manager", tech: "Rust, Raft Consensus", description: "Fault-tolerant cluster lock coordinator with sub-millisecond lease times." },
    ],
    certifications: ["Certified Kubernetes Administrator (CKA)", "AWS Solutions Architect Professional"],
    achievements: ["PhonePe Tech Fellow 2023", "ACM ICPC Regional Finalist"],
  },

  project_first: {
    name: "Ananya Rao",
    title: "Lead Product Manager",
    email: "ananya.rao@product.in",
    phone: "+91 99887 76655",
    location: "Mumbai, MH",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    summary: "Product Leader scaling consumer internet apps, conversion funnels, and AI features across edtech and fintech platforms.",
    skills: ["Product Roadmap Strategy", "User Growth & Funnels", "A/B Testing & Mixpanel", "SQL Data Analytics", "Agile & Scrum Leadership", "UI/UX Prototyping"],
    education: [
      { institution: "IIM Ahmedabad", degree: "MBA Marketing & Strategy", years: "2018 – 2020" },
      { institution: "IIT Delhi", degree: "B.Tech Electrical Engineering", years: "2014 – 2018" },
    ],
    experience: [
      {
        company: "Zomato Ltd",
        role: "Group Product Manager",
        years: "2021 – Present",
        bullets: [
          "Led Gold Subscription loyalty product growing paid subscribers from 1M to 4.5M.",
          "Increased repeat order frequency by 28% through personalized AI recommendation feeds.",
          "Managed team of 12 software engineers, designers, and growth analysts.",
        ],
      },
      {
        company: "BYJU'S Edtech",
        role: "Product Manager",
        years: "2020 – 2021",
        bullets: [
          "Launched interactive video learning module used by 2M+ school students.",
        ],
      },
    ],
    projects: [
      { title: "AI Personalized Food Recommendation Feed", tech: "Mixpanel, Python, SQL", description: "Grew average order value by ₹85 per user across 20 metro cities." },
      { title: "Instant UPI Checkout Funnel", tech: "Figma, Amplitude", description: "Reduced checkout funnel drop-off rate from 18% to 4.2%." },
    ],
    certifications: ["Certified Scrum Product Owner (CSPO)", "Reforge Growth Series Certificate"],
    achievements: ["IIM Ahmedabad Gold Medalist", "Product Leader of the Year 2022"],
  },

  academic_premium: {
    name: "Aditya Reddy",
    title: "AI Researcher & Machine Learning Lead",
    email: "aditya.reddy@research.in",
    phone: "+91 98450 12345",
    location: "Chennai, TN",
    photoUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80",
    summary: "AI Researcher developing Computer Vision pipelines, Large Language Model fine-tuning, and Deep Learning models for autonomous systems.",
    skills: ["PyTorch & TensorFlow", "Large Language Models (LLMs)", "Computer Vision (OpenCV)", "Python & C++ CUDA", "Transformers & HuggingFace", "MLOps & MLflow"],
    education: [
      { institution: "IIT Madras", degree: "M.S. Artificial Intelligence", years: "2018 – 2020", gpa: "9.8 CGPA" },
      { institution: "College of Engineering Guindy", degree: "B.E. Computer Science", years: "2014 – 2018" },
    ],
    experience: [
      {
        company: "Google Research India",
        role: "Senior AI Research Scientist",
        years: "2020 – Present",
        bullets: [
          "Developed Indic-language LLM speech model supporting 12 official Indian languages.",
          "Co-authored 8 research papers in NeurIPS, CVPR, and ACL conferences.",
          "Filed 3 patents for low-resource NLP model compression techniques.",
        ],
      },
    ],
    projects: [
      { title: "Multilingual Indic Speech Recognition", tech: "PyTorch, Transformers, CUDA", description: "Achieved state-of-the-art 94% accuracy across 12 Indian languages." },
      { title: "Autonomous Vehicle Obstacle Detection", tech: "TensorFlow, OpenCV, ROS", description: "Real-time 60 FPS object detection model running on edge hardware." },
    ],
    certifications: ["DeepLearning.AI TensorFlow Developer", "NVIDIA CUDA Optimization Specialist"],
    achievements: ["Best Paper Award at CVPR 2022", "Prime Minister's Research Fellowship (PMRF)"],
  },

  one_page_dense: {
    name: "Kavya Iyer",
    title: "DevOps & Cloud Infrastructure Lead",
    email: "kavya.iyer@cloud.in",
    phone: "+91 97111 22334",
    location: "Pune, MH",
    photoUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80",
    summary: "DevOps Lead managing multi-region AWS/GCP Kubernetes clusters, Infrastructure-as-Code automation, and zero-downtime microservice deployments.",
    skills: ["AWS & GCP Cloud", "Kubernetes & Helm", "Terraform & Ansible", "CI/CD GitHub Actions", "Prometheus & Grafana", "Python & Bash Scripting"],
    education: [
      { institution: "IIIT Hyderabad", degree: "B.Tech Computer Science", years: "2015 – 2019" },
      { institution: "Chinioya Vidyalaya, Chennai", degree: "Class XII Science", years: "2013 – 2015" },
    ],
    experience: [
      {
        company: "Paytm Payments Bank",
        role: "Lead DevOps Engineer",
        years: "2021 – Present",
        bullets: [
          "Automated Terraform deployment templates reducing cluster provisioning time from 4 hours to 12 minutes.",
          "Maintained 99.999% SLA uptime across 350+ Kubernetes microservices.",
          "Implemented automated security scanning in CI/CD pipeline blocking vulnerability releases.",
        ],
      },
      {
        company: "Infosys Cloud Services",
        role: "Senior Cloud Engineer",
        years: "2019 – 2021",
        bullets: [
          "Migrated legacy enterprise workloads to AWS EKS cloud infrastructure.",
        ],
      },
    ],
    projects: [
      { title: "Multi-Region Disaster Recovery Mesh", tech: "AWS EKS, Terraform, Istio", description: "Zero-downtime regional failover infrastructure handling 20M daily active users." },
      { title: "Automated CI/CD Vulnerability Scanner", tech: "Python, Trivy, SonarQube", description: "Reduced production deployment security vulnerabilities by 90%." },
    ],
    certifications: ["AWS Certified DevOps Engineer – Professional", "Certified Kubernetes Administrator (CKA)"],
    achievements: ["Paytm Engineering Excellence Award 2023", "AWS Community Builder 2022"],
  },

  modern_minimal: {
    name: "Vikram Sengupta",
    title: "Enterprise Solutions Architect",
    email: "vikram.s@enterprise.in",
    phone: "+91 99000 11223",
    location: "Kolkata, WB",
    photoUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80",
    summary: "Enterprise Technology Architect specializing in cloud infrastructure migration, microservice design, and digital transformation for Fortune 500 companies.",
    skills: ["Cloud Architecture (AWS/GCP)", "Kubernetes & Microservices", "Enterprise Security", "DevOps Pipelines", "Stakeholder Management", "Terraform IaC"],
    education: [
      { institution: "IIT Kharagpur", degree: "M.Tech Software Engineering", years: "2014 – 2016" },
      { institution: "Jadavpur University", degree: "B.E. Computer Science", years: "2010 – 2014" },
    ],
    experience: [
      {
        company: "TCS Enterprise Solutions",
        role: "Principal Solutions Architect",
        years: "2020 – Present",
        bullets: [
          "Led ₹300 Crore cloud migration for legacy banking core saving ₹32 Crores annually.",
          "Architected zero-trust security framework serving 2M+ active daily users.",
          "Supervised architecture review board across 18 development teams.",
        ],
      },
      {
        company: "Wipro Technologies",
        role: "Senior Cloud Engineer",
        years: "2016 – 2020",
        bullets: [
          "Deployed high-availability database clusters with 99.999% SLA uptime.",
        ],
      },
    ],
    projects: [
      { title: "Bank Core Cloud Migration", tech: "AWS, Terraform, K8s", description: "Migrated 120+ microservices to cloud with zero unplanned downtime." },
      { title: "Disaster Recovery Automation", tech: "Python, AWS Route53", description: "Reduced disaster recovery failover time from 4 hours to 90 seconds." },
    ],
    certifications: ["AWS Certified Solutions Architect – Professional", "TOGAF 9 Enterprise Architect"],
    achievements: ["TCS Innovation Award 2022", "Keynote Speaker at Cloud Architecture Summit"],
  },

  impact_focused: {
    name: "Neha Kulkarni",
    title: "Cybersecurity & Risk Analyst",
    email: "neha.k@security.in",
    phone: "+91 98220 33445",
    location: "Gurgaon, HR",
    photoUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80",
    summary: "Cybersecurity Specialist specializing in penetration testing, vulnerability assessment, cloud security compliance, and incident response.",
    skills: ["Penetration Testing (Metasploit)", "SIEM & SOC Operations", "Cloud Security (AWS Security)", "ISO 27001 & SOC 2", "Python Security Scripts", "Network Security"],
    education: [
      { institution: "DTU Delhi", degree: "B.Tech Information Technology", years: "2016 – 2020" },
      { institution: "DPS Vasant Kunj", degree: "Class XII Science", years: "2014 – 2016" },
    ],
    experience: [
      {
        company: "CRED Financials",
        role: "Senior Security Engineer",
        years: "2021 – Present",
        bullets: [
          "Conducted penetration testing across 40+ microservices identifying 12 critical zero-day flaws.",
          "Automated SOC incident alert triage using Python scripts reducing response time by 75%.",
          "Achieved SOC 2 Type II and ISO 27001 security compliance certifications.",
        ],
      },
      {
        company: "Deloitte Cyber Risk",
        role: "Cyber Risk Consultant",
        years: "2020 – 2021",
        bullets: [
          "Performed vulnerability assessments for 15 financial banking clients.",
        ],
      },
    ],
    projects: [
      { title: "Automated API Vulnerability Scanner", tech: "Python, OWASP ZAP, Docker", description: "Integrated automated SAST/DAST security scans into CI/CD build pipeline." },
      { title: "Zero-Trust Identity Access Control", tech: "AWS IAM, Okta, OAuth2", description: "Enforced multi-factor authentication across 1,200 company employees." },
    ],
    certifications: ["Certified Information Systems Security Professional (CISSP)", "CEH Master Certified"],
    achievements: ["CRED Security Champion Award 2023", "Top 3 Hall of Fame Bug Bounty Hunter"],
  },

  developer_portfolio: {
    name: "Siddharth Gupta",
    title: "Embedded Systems & IoT Engineer",
    email: "siddharth.g@hardware.in",
    phone: "+91 97333 44556",
    location: "Bengaluru, KA",
    photoUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80",
    summary: "Hardware and Embedded Software Engineer building real-time micro-controller firmware, C/C++ RTOS kernels, and IoT hardware protocols.",
    skills: ["Embedded C & C++", "FreeRTOS & ESP32", "ARM Cortex & STM32", "SPI, I2C, UART, CAN", "PCB Design (KiCAD)", "IoT Protocols (MQTT)"],
    education: [
      { institution: "BITS Pilani, Goa Campus", degree: "B.E. Electronics & Instrumentation", years: "2016 – 2020" },
      { institution: "Modern School, Barakhamba Road", degree: "Class XII Science", years: "2014 – 2016" },
    ],
    experience: [
      {
        company: "Ather Energy",
        role: "Senior Embedded Firmware Lead",
        years: "2021 – Present",
        bullets: [
          "Developed Battery Management System (BMS) firmware processing 200 Hz cell voltage telemetry.",
          "Optimized FreeRTOS task scheduling reducing MCU power consumption by 22%.",
          "Engineered CAN bus communication protocols connecting motor controller to dashboard UI.",
        ],
      },
      {
        company: "Bosch India R&D",
        role: "Embedded Systems Engineer",
        years: "2020 – 2021",
        bullets: [
          "Programmed automotive sensor firmware for anti-lock braking (ABS) systems.",
        ],
      },
    ],
    projects: [
      { title: "Smart Electric Vehicle Telemetry Unit", tech: "ESP32, FreeRTOS, MQTT, C++", description: "Real-time cellular IoT device broadcasting battery telemetry to cloud." },
      { title: "High-Precision Motor Controller Board", tech: "KiCAD, STM32, CAN Bus", description: "Custom 4-layer PCB designed and manufactured for EV prototypes." },
    ],
    certifications: ["ARM Accredited Engineer (AAE)", "Embedded Linux System Developer"],
    achievements: ["Ather Hardware Innovation Award 2022", "1st Place National Robotics Championship"],
  },

  global_professional: {
    name: "Meera Joshi",
    title: "UI/UX Product Designer",
    email: "meera.joshi@design.in",
    phone: "+91 98999 88776",
    location: "Mumbai, MH",
    photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80",
    summary: "User Experience Designer crafting intuitive digital interfaces, design systems, and mobile app flows used by millions of daily active users.",
    skills: ["Figma & Design Systems", "User Research & Usability", "Wireframing & Prototyping", "Design Tokens", "HTML/CSS & Tailwind", "WCAG Accessibility"],
    education: [
      { institution: "National Institute of Design (NID)", degree: "B.Des Industrial & Interaction Design", years: "2016 – 2020" },
      { institution: "Cathedral & John Connon School", degree: "Class XII Arts & Design", years: "2014 – 2016" },
    ],
    experience: [
      {
        company: "Swiggy Design Studio",
        role: "Lead UI/UX Designer",
        years: "2021 – Present",
        bullets: [
          "Redesigned core mobile ordering checkout flow improving conversion rates by 24%.",
          "Created company-wide Figma design library utilized by 45+ product managers and developers.",
          "Conducted 60+ qualitative user research sessions across 8 tier-1 and tier-2 Indian cities.",
        ],
      },
      {
        company: "Fractal Analytics Studio",
        role: "UI Designer",
        years: "2020 – 2021",
        bullets: [
          "Designed interactive AI analytics dashboards for Fortune 500 retail clients.",
        ],
      },
    ],
    projects: [
      { title: "Swiggy Instamart Grocery Experience", tech: "Figma, Protopie", description: "Designed 10-minute grocery delivery app flow with over 2M daily active buyers." },
      { title: "Design System Tokens Migration", tech: "Figma Tokens, Style Dictionary", description: "Unified iOS, Android, and Web design tokens across 14 product squads." },
    ],
    certifications: ["Nielsen Norman Group UX Certification", "Figma Design Lead Certificate"],
    achievements: ["India Design Mark Winner 2023", "Cannes Future Lions Shortlist"],
  },
};

// Fill photo personas for photo templates using Indian personas
const PHOTO_INDIAN_PERSONAS: Record<string, PersonaData> = {
  ...INDIAN_PERSONAS,
  photo_executive: {
    name: "Arjun Mehta",
    title: "Executive Vice President of Operations",
    email: "arjun.mehta@executive.in",
    phone: "+91 98100 11223",
    location: "Delhi NCR",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    summary: "Senior Corporate Executive with 14+ years leading operations, cross-functional business strategy, and ₹400 Crore P&L management across multinational companies.",
    skills: ["P&L Management", "Strategic Operations", "Cross-Functional Leadership", "Corporate Mergers", "Budget Optimization", "Executive Governance"],
    education: [
      { institution: "ISB Hyderabad", degree: "Post Graduate Programme (MBA)", years: "2014 – 2015" },
      { institution: "IIT Delhi", degree: "B.Tech Mechanical Engineering", years: "2008 – 2012" },
    ],
    experience: [
      {
        company: "Tata Sons Pvt Ltd",
        role: "VP of Business Operations",
        years: "2019 – Present",
        bullets: [
          "Oversee operational strategy across 12 regional manufacturing units with 650+ staff.",
          "Increased operating margin by 26% over 3 fiscal years through Lean implementation.",
          "Negotiated strategic supplier partnerships saving ₹28 Crores annually.",
        ],
      },
      {
        company: "Mahindra & Mahindra",
        role: "Operations Director",
        years: "2015 – 2019",
        bullets: [
          "Managed automotive assembly line logistics and component supply chains.",
        ],
      },
    ],
    projects: [
      { title: "Enterprise ERP Digital Transformation", tech: "SAP S/4HANA", description: "Unified financial and supply chain systems across 4 corporate subsidiaries." },
    ],
    certifications: ["Certified Executive Leadership (CEL)", "Lean Six Sigma Master Black Belt"],
    achievements: ["Tata Business Executive of the Year 2023", "ET 40 Under 40 Business Leaders"],
  },

  photo_side_panel: {
    name: "Ishita Chatterjee",
    title: "Creative Art Director & UX Lead",
    email: "ishita.c@creative.in",
    phone: "+91 98333 22110",
    location: "Kolkata, WB",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    summary: "Creative Director crafting high-impact visual identity systems, mobile applications, and brand experiences for top Indian technology companies.",
    skills: ["Visual Brand Design", "Figma & Design Systems", "Interactive Prototyping", "User Research", "3D Motion Graphics", "Brand Strategy"],
    education: [
      { institution: "NIFT Delhi", degree: "B.Des Fashion Communication & Media", years: "2014 – 2018" },
    ],
    experience: [
      {
        company: "Ogivy India",
        role: "Lead Creative Designer",
        years: "2021 – Present",
        bullets: [
          "Directed design overhaul for digital banking app used by 4M+ active subscribers.",
          "Mentored team of 10 junior designers across digital branding campaigns.",
          "Created design system used across iOS, Android, and Web platforms.",
        ],
      },
    ],
    projects: [
      { title: "Fintech Mobile Wallet Redesign", tech: "Figma, Principle", description: "Increased daily active app usage by 34% post release." },
    ],
    certifications: ["Nielsen Norman Certified UX Director", "Adobe Certified Expert (ACE)"],
    achievements: ["Kyoorius Design Award Winner 2022", "Figma Community Featured Creator"],
  },
};

export function TemplatePreviewWireframe({ tmpl }: { tmpl: TemplateDefinition }) {
  const accent = tmpl.accentColor || "#1e293b";
  const isPhoto = tmpl.supportsPhoto;

  // Resolve persona from Indian Personas dataset with clean fallback
  const personaKeys = Object.keys(INDIAN_PERSONAS);
  const photoPersonaKeys = Object.keys(PHOTO_INDIAN_PERSONAS);

  const p = isPhoto
    ? (PHOTO_INDIAN_PERSONAS[tmpl.id] || PHOTO_INDIAN_PERSONAS[photoPersonaKeys[0]])
    : (INDIAN_PERSONAS[tmpl.id] || INDIAN_PERSONAS[personaKeys[0]]);

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

  // ── Helper to render a section block with clean text density ──
  const renderSectionBlock = (secKey: string, secLabel: string) => {
    if (secKey === "summary" && p.summary) {
      return (
        <div key={secKey} className="space-y-0.5">
          <h3 className="text-[7.5px] font-extrabold uppercase tracking-wider border-b border-zinc-200 pb-0.5" style={{ color: accent }}>{secLabel}</h3>
          <p className="text-[6.5px] text-zinc-600 leading-normal">{p.summary}</p>
        </div>
      );
    }

    if (secKey === "skills" && p.skills?.length) {
      // 1. Categorized format with bold labels (for skills_first, developer_portfolio, photo_creative_tech, photo_academic, tech_spec)
      if (tmpl.id === "skills_first" || tmpl.id === "developer_portfolio" || tmpl.id === "photo_creative_tech" || tmpl.id === "photo_academic" || tmpl.id === "tech_spec") {
        const mid = Math.ceil(p.skills.length / 2);
        const group1 = p.skills.slice(0, mid);
        const group2 = p.skills.slice(mid);
        return (
          <div key={secKey} className="space-y-0.5">
            <h3 className="text-[7.5px] font-extrabold uppercase tracking-wider border-b border-zinc-200 pb-0.5" style={{ color: accent }}>{secLabel}</h3>
            <div className="space-y-0.5 text-[6.5px]">
              <div>
                <span className="font-bold text-zinc-900">Languages &amp; Tools: </span>
                <span className="text-zinc-600">{group1.join(", ")}</span>
              </div>
              {group2.length > 0 && (
                <div>
                  <span className="font-bold text-zinc-900">Frameworks &amp; Systems: </span>
                  <span className="text-zinc-600">{group2.join(", ")}</span>
                </div>
              )}
            </div>
          </div>
        );
      }

      // 2. Vertical 2-Column Bullet Grid (for recruiter_scan, photo_side_panel, impact_focused, timeline_prof)
      if (tmpl.id === "recruiter_scan" || tmpl.id === "photo_side_panel" || tmpl.id === "impact_focused" || tmpl.id === "timeline_prof") {
        return (
          <div key={secKey} className="space-y-0.5">
            <h3 className="text-[7.5px] font-extrabold uppercase tracking-wider border-b border-zinc-200 pb-0.5" style={{ color: accent }}>{secLabel}</h3>
            <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[6.5px] text-zinc-700">
              {p.skills.map((sk, idx) => (
                <span key={idx} className="truncate">• {sk}</span>
              ))}
            </div>
          </div>
        );
      }

      // 3. Comma-Separated Clean Flow (for academic_premium, photo_split_hero, modern_minimal, research_paper)
      if (tmpl.id === "academic_premium" || tmpl.id === "photo_split_hero" || tmpl.id === "modern_minimal" || tmpl.id === "research_paper") {
        return (
          <div key={secKey} className="space-y-0.5">
            <h3 className="text-[7.5px] font-extrabold uppercase tracking-wider border-b border-zinc-200 pb-0.5" style={{ color: accent }}>{secLabel}</h3>
            <p className="text-[6.5px] text-zinc-700 font-normal leading-relaxed">
              {p.skills.join(", ")}
            </p>
          </div>
        );
      }

      // 4. Two-Column Compact Block (for one_page_dense, global_professional, photo_corporate, dual_section)
      if (tmpl.id === "one_page_dense" || tmpl.id === "global_professional" || tmpl.id === "photo_corporate" || tmpl.id === "dual_section") {
        const mid = Math.ceil(p.skills.length / 2);
        return (
          <div key={secKey} className="space-y-0.5">
            <h3 className="text-[7.5px] font-extrabold uppercase tracking-wider border-b border-zinc-200 pb-0.5" style={{ color: accent }}>{secLabel}</h3>
            <div className="flex justify-between text-[6.5px]">
              <div className="w-[48%] space-y-0.5">
                <span className="font-bold text-zinc-900 block">Core Skills:</span>
                <p className="text-zinc-600 truncate">{p.skills.slice(0, mid).join(", ")}</p>
              </div>
              <div className="w-[48%] space-y-0.5">
                <span className="font-bold text-zinc-900 block">Tools &amp; Tech:</span>
                <p className="text-zinc-600 truncate">{p.skills.slice(mid).join(", ")}</p>
              </div>
            </div>
          </div>
        );
      }

      // 5. Default Dot-Separated Line (`•`) for modern (Classic ATS) and executive photo templates
      return (
        <div key={secKey} className="space-y-0.5">
          <h3 className="text-[7.5px] font-extrabold uppercase tracking-wider border-b border-zinc-200 pb-0.5" style={{ color: accent }}>{secLabel}</h3>
          <p className="text-[6.5px] text-zinc-800 font-medium leading-relaxed">
            {p.skills.join(" • ")}
          </p>
        </div>
      );
    }

    if (secKey === "education" && p.education?.length) {
      return (
        <div key={secKey} className="space-y-1">
          <h3 className="text-[7.5px] font-extrabold uppercase tracking-wider border-b border-zinc-200 pb-0.5" style={{ color: accent }}>{secLabel}</h3>
          {p.education.map((ed, idx) => (
            <div key={idx} className="flex items-center justify-between text-[6.5px]">
              <div className="truncate">
                <span className="font-bold text-zinc-900">{ed.institution}</span> — <span className="text-zinc-600">{ed.degree}</span>
              </div>
              <span className="text-[5.5px] text-zinc-500 font-medium shrink-0 ml-1">{ed.years}</span>
            </div>
          ))}
        </div>
      );
    }

    if (secKey === "experience" && p.experience?.length) {
      return (
        <div key={secKey} className="space-y-1">
          <h3 className="text-[7.5px] font-extrabold uppercase tracking-wider border-b border-zinc-200 pb-0.5" style={{ color: accent }}>{secLabel}</h3>
          {p.experience.map((exp, idx) => (
            <div key={idx} className="space-y-0.5">
              <div className="flex items-center justify-between text-[6.5px] font-bold text-zinc-900">
                <span className="truncate">{exp.role} — {exp.company}</span>
                <span className="text-[5.5px] text-zinc-500 shrink-0 ml-1">{exp.years}</span>
              </div>
              {exp.bullets.map((b, bi) => (
                <p key={bi} className="text-[6px] text-zinc-600 leading-tight">• {b}</p>
              ))}
            </div>
          ))}
        </div>
      );
    }

    if (secKey === "projects" && p.projects?.length) {
      return (
        <div key={secKey} className="space-y-1">
          <h3 className="text-[7.5px] font-extrabold uppercase tracking-wider border-b border-zinc-200 pb-0.5" style={{ color: accent }}>{secLabel}</h3>
          {p.projects.map((proj, idx) => (
            <div key={idx} className="space-y-0.5">
              <p className="text-[6.5px] font-bold text-zinc-900 truncate">{proj.title} <span className="text-[5.5px] font-normal text-zinc-500">[{proj.tech}]</span></p>
              <p className="text-[6px] text-zinc-600 leading-tight">• {proj.description}</p>
            </div>
          ))}
        </div>
      );
    }

    if (secKey === "certifications" && p.certifications?.length) {
      return (
        <div key={secKey} className="space-y-0.5">
          <h3 className="text-[7.5px] font-extrabold uppercase tracking-wider border-b border-zinc-200 pb-0.5" style={{ color: accent }}>{secLabel}</h3>
          <div className="space-y-0.5 text-[6px] text-zinc-600">
            {p.certifications.map((cert, idx) => (
              <p key={idx} className="truncate">• {cert}</p>
            ))}
          </div>
        </div>
      );
    }

    if (secKey === "achievements" && p.achievements?.length) {
      return (
        <div key={secKey} className="space-y-0.5">
          <h3 className="text-[7.5px] font-extrabold uppercase tracking-wider border-b border-zinc-200 pb-0.5" style={{ color: accent }}>{secLabel}</h3>
          <div className="space-y-0.5 text-[6px] text-zinc-600">
            {p.achievements.map((ach, idx) => (
              <p key={idx} className="truncate">• {ach}</p>
            ))}
          </div>
        </div>
      );
    }

    return null;
  };

  // ── 1. SIDEBAR LAYOUT (Side Photo Panel / Modern Sidebar) ──
  if (tmpl.headerStyle === "side_panel" || tmpl.photoPlacement === "sidebar") {
    return (
      <div className="w-full aspect-[1/1.41] bg-white text-zinc-900 shadow-sm border border-zinc-200/90 rounded-md p-0 overflow-hidden select-none relative flex text-[7.5px] leading-[1.2]">
        {/* Left Solid Colored Sidebar */}
        <div className="w-[34%] p-2.5 flex flex-col space-y-2.5 shrink-0 text-white" style={{ backgroundColor: accent }}>
          {isPhoto ? (
            <div className="flex flex-col items-center text-center space-y-1 mb-1">
              <img
                src={p.photoUrl}
                alt={p.name}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-white/80 shadow-xs shrink-0"
              />
              <span className="text-[8px] font-bold text-white leading-none tracking-tight block mt-0.5">{p.name}</span>
              <span className="text-[6px] text-white/80 font-medium block truncate max-w-full">{p.title}</span>
            </div>
          ) : (
            <div className="border-b border-white/30 pb-1 mb-0.5">
              <span className="text-[9px] font-extrabold text-white block uppercase tracking-tight">{p.name}</span>
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
            <span className="text-[6px] font-extrabold uppercase tracking-wider block text-white/70 border-b border-white/20 pb-0.5">TECHNICAL SKILLS</span>
            <div className="space-y-0.5">
              {p.skills.map((sk, i) => (
                <p key={i} className="truncate">• {sk}</p>
              ))}
            </div>
          </div>

          {/* Education Mini Block */}
          <div className="space-y-1 text-[6.5px] text-white/90">
            <span className="text-[6px] font-extrabold uppercase tracking-wider block text-white/70 border-b border-white/20 pb-0.5">EDUCATION</span>
            {p.education.map((ed, i) => (
              <div key={i} className="space-y-0.5">
                <p className="font-bold text-white truncate">{ed.institution}</p>
                <p className="text-white/80 text-[6px] truncate">{ed.degree}</p>
                <p className="text-white/60 text-[5.5px]">{ed.years}</p>
              </div>
            ))}
          </div>

          {/* Certifications Block */}
          {p.certifications && (
            <div className="space-y-1 text-[6.5px] text-white/90">
              <span className="text-[6px] font-extrabold uppercase tracking-wider block text-white/70 border-b border-white/20 pb-0.5">CERTIFICATIONS</span>
              <div className="space-y-0.5 text-[5.5px]">
                {p.certifications.map((c, i) => (
                  <p key={i} className="truncate">• {c}</p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Main Body Content */}
        <div className="flex-1 p-3 flex flex-col space-y-2 justify-between min-w-0 bg-white">
          {!isPhoto && (
            <div className="pb-1 border-b border-zinc-200">
              <h2 className="text-[10px] font-extrabold text-zinc-900 uppercase tracking-tight">{p.name}</h2>
              <p className="text-[7px] text-zinc-600 font-semibold">{p.title}</p>
            </div>
          )}

          {/* Render Sections in exact Order */}
          {sectionsToDisplay.map((sec) => renderSectionBlock(sec.key, sec.label))}
        </div>

        {/* PDF/DOCX Badge */}
        <div className="absolute bottom-1.5 right-1.5 flex gap-0.5 z-10">
          <span className="px-1 py-0.5 text-[6px] font-bold bg-zinc-100/90 text-zinc-600 rounded-2xs border border-zinc-200 shadow-2xs">PDF</span>
          <span className="px-1 py-0.5 text-[6px] font-bold bg-zinc-100/90 text-zinc-600 rounded-2xs border border-zinc-200 shadow-2xs">DOCX</span>
        </div>
      </div>
    );
  }

  // ── 2. TIMELINE LAYOUT (Timeline Professional) ──
  if (tmpl.headerStyle === "timeline") {
    return (
      <div className="w-full aspect-[1/1.41] bg-white text-zinc-900 shadow-sm border border-zinc-200/90 rounded-md p-3 overflow-hidden select-none relative flex flex-col justify-between space-y-2 text-[7.5px] leading-[1.2]">
        <div className="pb-1.5 border-b border-zinc-200">
          <h2 className="text-[10.5px] font-extrabold uppercase tracking-tight" style={{ color: accent }}>{p.name}</h2>
          <p className="text-[6.5px] text-zinc-700 font-bold">{p.title}</p>
          <p className="text-[6px] text-zinc-500 mt-0.5">{p.email} | {p.phone} | {p.location}</p>
        </div>
        <div className="space-y-2 flex-1 min-w-0 pl-2 border-l-2 border-zinc-300 ml-1 relative flex flex-col justify-between">
          {sectionsToDisplay.map((sec) => (
            <div key={sec.key} className="relative">
              <div className="absolute -left-[13px] top-1 w-2 h-2 rounded-full bg-zinc-900 border-2 border-white shrink-0" />
              {renderSectionBlock(sec.key, sec.label)}
            </div>
          ))}
        </div>
        <div className="absolute bottom-1.5 right-1.5 flex gap-0.5 z-10">
          <span className="px-1 py-0.5 text-[6px] font-bold bg-zinc-100/90 text-zinc-600 rounded-2xs border border-zinc-200 shadow-2xs">PDF</span>
          <span className="px-1 py-0.5 text-[6px] font-bold bg-zinc-100/90 text-zinc-600 rounded-2xs border border-zinc-200 shadow-2xs">DOCX</span>
        </div>
      </div>
    );
  }

  // ── 3. DUAL BLOCK LAYOUT (Dual Section 50/50) ──
  if (tmpl.headerStyle === "dual_block") {
    return (
      <div className="w-full aspect-[1/1.41] bg-white text-zinc-900 shadow-sm border border-zinc-200/90 rounded-md p-3 overflow-hidden select-none relative flex flex-col justify-between space-y-2 text-[7.5px] leading-[1.2]">
        <div className="pb-1.5 border-b border-zinc-200 text-center">
          <h2 className="text-[10.5px] font-extrabold uppercase tracking-tight" style={{ color: accent }}>{p.name}</h2>
          <p className="text-[6.5px] text-zinc-700 font-bold">{p.title}</p>
          <p className="text-[6px] text-zinc-500 mt-0.5">{p.email} • {p.phone} • {p.location}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 flex-1 min-w-0">
          <div className="space-y-2 border-r border-zinc-200 pr-2 flex flex-col justify-between">
            {renderSectionBlock("education", "EDUCATION")}
            {renderSectionBlock("skills", "TECHNICAL SKILLS")}
            {renderSectionBlock("certifications", "CERTIFICATIONS")}
          </div>
          <div className="space-y-2 pl-0.5 flex flex-col justify-between">
            {renderSectionBlock("summary", "PROFILE SUMMARY")}
            {renderSectionBlock("experience", "EMPLOYMENT HISTORY")}
            {renderSectionBlock("projects", "KEY PROJECTS")}
          </div>
        </div>
        <div className="absolute bottom-1.5 right-1.5 flex gap-0.5 z-10">
          <span className="px-1 py-0.5 text-[6px] font-bold bg-zinc-100/90 text-zinc-600 rounded-2xs border border-zinc-200 shadow-2xs">PDF</span>
          <span className="px-1 py-0.5 text-[6px] font-bold bg-zinc-100/90 text-zinc-600 rounded-2xs border border-zinc-200 shadow-2xs">DOCX</span>
        </div>
      </div>
    );
  }

  // ── 4. NUMBERED LAYOUT (IEEE Research Paper) ──
  if (tmpl.headerStyle === "numbered") {
    let secCounter = 1;
    return (
      <div className="w-full aspect-[1/1.41] bg-white text-zinc-900 shadow-sm border border-zinc-200/90 rounded-md p-3 overflow-hidden select-none relative flex flex-col justify-between space-y-2 text-[7.5px] leading-[1.2]">
        <div className="pb-1.5 border-b border-zinc-300 text-center">
          <h2 className="text-[10.5px] font-serif font-extrabold uppercase tracking-tight" style={{ color: accent }}>{p.name}</h2>
          <p className="text-[6.5px] font-serif text-zinc-700 italic">{p.title}</p>
          <p className="text-[6px] text-zinc-500 mt-0.5">{p.email} | {p.phone} | {p.location}</p>
        </div>
        <div className="space-y-2 flex-1 min-w-0 flex flex-col justify-between">
          {sectionsToDisplay.map((sec) => {
            const numLabel = `${secCounter++}.0  ${sec.label}`;
            return renderSectionBlock(sec.key, numLabel);
          })}
        </div>
        <div className="absolute bottom-1.5 right-1.5 flex gap-0.5 z-10">
          <span className="px-1 py-0.5 text-[6px] font-bold bg-zinc-100/90 text-zinc-600 rounded-2xs border border-zinc-200 shadow-2xs">PDF</span>
          <span className="px-1 py-0.5 text-[6px] font-bold bg-zinc-100/90 text-zinc-600 rounded-2xs border border-zinc-200 shadow-2xs">DOCX</span>
        </div>
      </div>
    );
  }

  // ── 5. CENTERED / PROFILE CARD LAYOUT (Student Profile Card / Academic) ──
  if (tmpl.headerStyle === "centered" || tmpl.headerStyle === "profile_card") {
    return (
      <div className="w-full aspect-[1/1.41] bg-white text-zinc-900 shadow-sm border border-zinc-200/90 rounded-md p-3 overflow-hidden select-none relative flex flex-col justify-between space-y-2 text-[7.5px] leading-[1.2]">
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
            <h2 className="text-[10.5px] font-extrabold uppercase tracking-tight" style={{ color: accent }}>{p.name}</h2>
            <p className="text-[6.5px] text-zinc-600 font-semibold">{p.title}</p>
            <p className="text-[6px] text-zinc-500 mt-0.5">{p.email} • {p.phone} • {p.location}</p>
          </div>
        </div>

        {/* Dynamic Full Content Sections */}
        <div className="space-y-2 flex-1 min-w-0 flex flex-col justify-between">
          {sectionsToDisplay.map((sec) => renderSectionBlock(sec.key, sec.label))}
        </div>

        {/* PDF/DOCX Badge */}
        <div className="absolute bottom-1.5 right-1.5 flex gap-0.5 z-10">
          <span className="px-1 py-0.5 text-[6px] font-bold bg-zinc-100/90 text-zinc-600 rounded-2xs border border-zinc-200 shadow-2xs">PDF</span>
          <span className="px-1 py-0.5 text-[6px] font-bold bg-zinc-100/90 text-zinc-600 rounded-2xs border border-zinc-200 shadow-2xs">DOCX</span>
        </div>
      </div>
    );
  }

  // ── 6. STANDARD / BANNER LAYOUT (Executive Banner, Corporate Portrait, Modern Minimal) ──
  return (
    <div className="w-full aspect-[1/1.41] bg-white text-zinc-900 shadow-sm border border-zinc-200/90 rounded-md p-3 overflow-hidden select-none relative flex flex-col justify-between space-y-2 text-[7.5px] leading-[1.2]">
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
      <div className="space-y-2 flex-1 min-w-0 flex flex-col justify-between">
        {sectionsToDisplay.map((sec) => renderSectionBlock(sec.key, sec.label))}
      </div>

      {/* PDF/DOCX Badge */}
      <div className="absolute bottom-1.5 right-1.5 flex gap-0.5 z-10">
        <span className="px-1 py-0.5 text-[6px] font-bold bg-zinc-100/90 text-zinc-600 rounded-2xs border border-zinc-200 shadow-2xs">PDF</span>
        <span className="px-1 py-0.5 text-[6px] font-bold bg-zinc-100/90 text-zinc-600 rounded-2xs border border-zinc-200 shadow-2xs">DOCX</span>
      </div>
    </div>
  );
}
