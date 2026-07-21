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
  education: { institution: string; degree: string; years: string }[];
  experience: { company: string; role: string; years: string; bullets: string[] }[];
  projects: { title: string; tech: string; description: string }[];
  certifications?: string[];
  achievements?: string[];
}

// ── BALANCED INDIAN PERSONAS (Calibrated to fill 100% A4 page height cleanly without overflow or empty space) ──
const INDIAN_PERSONAS: Record<string, PersonaData> = {
  modern: {
    name: "Aarav Sharma",
    title: "Senior Software Engineer",
    email: "aarav.sharma@tech.in",
    phone: "+91 98765 43210",
    location: "Bengaluru, KA",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    summary: "Senior Software Engineer with 6+ years of experience building high-throughput microservices, distributed cloud systems, and real-time backend platforms at scale.",
    skills: ["Java, Spring Boot", "Microservices & REST", "Kafka & Redis", "AWS & Docker", "SQL & MongoDB"],
    education: [
      { institution: "IIT Bombay", degree: "B.Tech Computer Science", years: "2015 – 2019" },
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
        ],
      },
      {
        company: "Swiggy Labs",
        role: "Software Engineer II",
        years: "2019 – 2021",
        bullets: [
          "Built real-time delivery tracking service handling 2M+ active daily orders.",
        ],
      },
    ],
    projects: [
      { title: "Distributed Payment Gateway Adapter", tech: "Java 17, Spring Boot", description: "Multi-PSP failover service handling $40M daily transactions." },
      { title: "Real-time Order Tracking Engine", tech: "Node.js, Redis", description: "Reduced tracking API latency from 450ms to 42ms." },
    ],
    certifications: ["AWS Certified Solutions Architect", "Oracle Certified Java Professional"],
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
    skills: ["React & Next.js", "TypeScript & Node.js", "GraphQL & REST APIs", "PostgreSQL & Prisma", "Docker & Kubernetes"],
    education: [
      { institution: "BITS Pilani", degree: "B.E. Computer Science", years: "2016 – 2020" },
      { institution: "Hyderabad Public School", degree: "Class XII Science", years: "2014 – 2016" },
    ],
    experience: [
      {
        company: "Razorpay Software",
        role: "Lead Frontend Engineer",
        years: "2021 – Present",
        bullets: [
          "Led merchant onboarding dashboard used by 250,000+ Indian businesses.",
          "Optimized bundle rendering performance reducing initial page load from 3.2s to 0.9s.",
        ],
      },
      {
        company: "MakeMyTrip India",
        role: "Software Developer",
        years: "2020 – 2021",
        bullets: [
          "Developed hotel booking web app serving 5M+ monthly active travelers.",
        ],
      },
    ],
    projects: [
      { title: "Merchant Analytics Dashboard", tech: "React, Next.js, Tailwind", description: "Real-time revenue monitoring portal processing 10M+ logs." },
      { title: "Automated Developer Onboarding Tool", tech: "Node.js, Docker", description: "Accelerated developer environment setup from 2 days to 15 mins." },
    ],
    certifications: ["Meta Certified Front-End Developer", "Docker Certified Associate"],
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
    skills: ["Go, C++, Rust", "Distributed Systems", "Kubernetes (EKS)", "PostgreSQL, Redis", "gRPC & Protobuf"],
    education: [
      { institution: "NIT Trichy", degree: "B.Tech Computer Science", years: "2013 – 2017" },
      { institution: "National Public School", degree: "Class XII CBSE", years: "2011 – 2013" },
    ],
    experience: [
      {
        company: "PhonePe India",
        role: "Principal Backend Architect",
        years: "2020 – Present",
        bullets: [
          "Architected core UPI settlement system handling 45M daily UPI transactions.",
          "Designed multi-datacenter active-active database replication cluster.",
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
      { title: "High-Throughput Settlement Engine", tech: "Go, gRPC, Cassandra", description: "Zero-data-loss financial transaction engine processing 30k TPS." },
      { title: "Distributed Lock Manager", tech: "Rust, Raft Consensus", description: "Fault-tolerant cluster lock coordinator with sub-millisecond lease times." },
    ],
    certifications: ["Certified Kubernetes Administrator", "AWS Solutions Architect Pro"],
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
    skills: ["Product Roadmap Strategy", "User Growth & Funnels", "A/B Testing & Mixpanel", "SQL Analytics", "Agile Leadership"],
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
      { title: "AI Personalized Food Recommendation Feed", tech: "Mixpanel, Python", description: "Grew average order value by ₹85 per user across 20 metro cities." },
      { title: "Instant UPI Checkout Funnel", tech: "Figma, Amplitude", description: "Reduced checkout funnel drop-off rate from 18% to 4.2%." },
    ],
    certifications: ["Certified Scrum Product Owner", "Reforge Growth Series Certificate"],
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
    skills: ["PyTorch & TensorFlow", "Large Language Models (LLMs)", "Computer Vision (OpenCV)", "Python & C++ CUDA", "Transformers & HuggingFace"],
    education: [
      { institution: "IIT Madras", degree: "M.S. Artificial Intelligence", years: "2018 – 2020" },
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
        ],
      },
    ],
    projects: [
      { title: "Multilingual Indic Speech Recognition", tech: "PyTorch, CUDA", description: "Achieved state-of-the-art 94% accuracy across 12 Indian languages." },
      { title: "Autonomous Vehicle Obstacle Detection", tech: "TensorFlow, ROS", description: "Real-time 60 FPS object detection model running on edge hardware." },
    ],
    certifications: ["DeepLearning.AI TensorFlow Developer", "NVIDIA CUDA Optimization Specialist"],
    achievements: ["Best Paper Award at CVPR 2022", "Prime Minister's Research Fellowship"],
  },

  one_page_dense: {
    name: "Kavya Iyer",
    title: "DevOps & Cloud Infrastructure Lead",
    email: "kavya.iyer@cloud.in",
    phone: "+91 97111 22334",
    location: "Pune, MH",
    photoUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80",
    summary: "DevOps Lead managing multi-region AWS/GCP Kubernetes clusters, Infrastructure-as-Code automation, and zero-downtime microservice deployments.",
    skills: ["AWS & GCP Cloud", "Kubernetes & Helm", "Terraform & Ansible", "CI/CD GitHub Actions", "Prometheus & Grafana"],
    education: [
      { institution: "IIIT Hyderabad", degree: "B.Tech Computer Science", years: "2015 – 2019" },
      { institution: "Chinmaya Vidyalaya", degree: "Class XII Science", years: "2013 – 2015" },
    ],
    experience: [
      {
        company: "Paytm Payments Bank",
        role: "Lead DevOps Engineer",
        years: "2021 – Present",
        bullets: [
          "Automated Terraform deployment templates reducing cluster provisioning time from 4h to 12m.",
          "Maintained 99.999% SLA uptime across 350+ Kubernetes microservices.",
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
      { title: "Multi-Region Disaster Recovery Mesh", tech: "AWS EKS, Terraform", description: "Zero-downtime regional failover infrastructure handling 20M daily active users." },
      { title: "Automated CI/CD Vulnerability Scanner", tech: "Python, Trivy", description: "Reduced production deployment security vulnerabilities by 90%." },
    ],
    certifications: ["AWS Certified DevOps Engineer Pro", "Certified Kubernetes Administrator"],
    achievements: ["Paytm Engineering Award 2023", "AWS Community Builder 2022"],
  },
};

// ── 20 DISTINCT PHOTO PERSONAS (Each photo template has its own unique photo URL & Indian candidate profile) ──
const PHOTO_INDIAN_PERSONAS: Record<string, PersonaData> = {
  auto_generate_photo: {
    name: "Priya V. Ananya",
    title: "Lead Systems Engineer & Cloud Architect",
    email: "priya.v@cloud.in",
    phone: "+91 98765 00112",
    location: "Bengaluru, KA",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    summary: "Cloud Systems Lead with 7+ years building enterprise microservices and automated DevOps architectures.",
    skills: ["AWS & Kubernetes", "Java & Spring Boot", "Docker & Terraform", "PostgreSQL & Redis"],
    education: [{ institution: "IIT Bombay", degree: "B.Tech Computer Science", years: "2015 – 2019" }],
    experience: [{ company: "Flipkart Tech", role: "Lead Systems Architect", years: "2021 – Present", bullets: ["Scaled transaction systems to 100k requests/sec.", "Reduced infrastructure latency by 35%."] }],
    projects: [{ title: "Cloud Payment Routing Engine", tech: "Java, AWS EKS", description: "Real-time payment adapter handling ₹50M daily GMV." }],
    certifications: ["AWS Solutions Architect Pro"],
    achievements: ["Flipkart Innovator Award"],
  },
  photo_executive: {
    name: "Aarav Sharma",
    title: "Senior Engineering Director",
    email: "aarav.sharma@executive.in",
    phone: "+91 98111 22334",
    location: "Delhi NCR",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    summary: "Engineering Director scaling 100+ engineer organizations and distributed cloud platforms.",
    skills: ["Engineering Leadership", "Distributed Systems", "Go, C++, Rust", "Microservices"],
    education: [{ institution: "IIT Delhi", degree: "B.Tech Computer Science", years: "2012 – 2016" }],
    experience: [{ company: "Tesla India R&D", role: "Director of Software", years: "2020 – Present", bullets: ["Scaled engineering team from 20 to 120 engineers.", "Architected telemetry platform processing 10B points."] }],
    projects: [{ title: "Vehicle Telemetry Stream Engine", tech: "Go, Apache Kafka", description: "Stream processing infrastructure scaling to 10M devices." }],
    certifications: ["AWS Certified DevOps Professional"],
    achievements: ["Engineering Leadership Excellence Award"],
  },
  photo_side_panel: {
    name: "Ananya Rao",
    title: "Creative Design Director",
    email: "ananya.r@design.in",
    phone: "+91 98222 33445",
    location: "Mumbai, MH",
    photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
    summary: "Creative Director crafting digital mobile app experiences for leading Indian tech platforms.",
    skills: ["Figma & Design Systems", "UI/UX Prototyping", "User Research", "Design Tokens"],
    education: [{ institution: "NID Ahmedabad", degree: "B.Des Interaction Design", years: "2015 – 2019" }],
    experience: [{ company: "Swiggy Design Studio", role: "Lead UI/UX Designer", years: "2021 – Present", bullets: ["Redesigned checkout flow increasing conversions by 24%.", "Created company-wide Figma design library."] }],
    projects: [{ title: "10-Minute Grocery Delivery App", tech: "Figma, Protopie", description: "Designed mobile app ordering experience for 2M active buyers." }],
    certifications: ["Nielsen Norman UX Certification"],
    achievements: ["India Design Mark Winner"],
  },
  photo_student_card: {
    name: "Rohan Verma",
    title: "Software Development Engineer",
    email: "rohan.verma@campus.in",
    phone: "+91 98333 44556",
    location: "Hyderabad, TS",
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
    summary: "High-performing Computer Science graduate with strong algorithms, backend systems, and competitive coding background.",
    skills: ["Python & C++", "Data Structures", "SQL & DBMS", "React & Node.js"],
    education: [{ institution: "BITS Pilani", degree: "B.E. Computer Science", years: "2020 – 2024" }],
    experience: [{ company: "Amazon India", role: "SDE Intern", years: "2023 – 2024", bullets: ["Built automated catalog validation tool saving 40 engineering hours weekly."] }],
    projects: [{ title: "Peer-to-Peer Code Review Portal", tech: "React, Node.js, Socket.io", description: "Real-time collaborative code editor used by 500+ students." }],
    certifications: ["AWS Certified Cloud Practitioner"],
    achievements: ["ACM ICPC Regional Rank 12"],
  },
  photo_corporate: {
    name: "Aditya Reddy",
    title: "Corporate Finance & Strategy Lead",
    email: "aditya.reddy@finance.in",
    phone: "+91 98444 55667",
    location: "Mumbai, MH",
    photoUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80",
    summary: "Corporate Finance Specialist managing investment portfolio strategy and financial risk assessment.",
    skills: ["Financial Modeling", "Corporate Valuation", "M&A Analytics", "Bloomberg Terminal"],
    education: [{ institution: "IIM Ahmedabad", degree: "MBA Finance", years: "2017 – 2019" }],
    experience: [{ company: "Goldman Sachs India", role: "Senior Financial Analyst", years: "2020 – Present", bullets: ["Executed ₹500 Cr M&A advisory transactions.", "Built financial valuation models for tech startups."] }],
    projects: [{ title: "Automated Credit Risk Scoring Engine", tech: "Python, Financial Models", description: "Reduced loan default risk evaluation turnaround from 3 days to 4 hours." }],
    certifications: ["CFA Charterholder Level 3"],
    achievements: ["Goldman Sachs Leadership Award"],
  },
  photo_creative_tech: {
    name: "Kavya Iyer",
    title: "Full Stack Product Engineer",
    email: "kavya.iyer@creative.in",
    phone: "+91 98555 66778",
    location: "Bengaluru, KA",
    photoUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80",
    summary: "Product Engineer combining modern WebGL creative frontend animations with scalable GraphQL APIs.",
    skills: ["React & Three.js", "TypeScript & Node.js", "GraphQL & Prisma", "Tailwind CSS"],
    education: [{ institution: "IIIT Hyderabad", degree: "B.Tech Computer Science", years: "2016 – 2020" }],
    experience: [{ company: "CRED Tech", role: "Senior Frontend Engineer", years: "2021 – Present", bullets: ["Built interactive 3D payment success animations.", "Optimized web vitals score to 98/100."] }],
    projects: [{ title: "3D Interactive Design Studio", tech: "Three.js, React, WebGL", description: "Browser-based 3D model editor processing 50k monthly sessions." }],
    certifications: ["Meta Certified Front-End Developer"],
    achievements: ["CRED Hackathon Champion 2023"],
  },
  photo_academic: {
    name: "Vikram Sengupta",
    title: "AI Research Assistant",
    email: "vikram.s@academic.in",
    phone: "+91 98666 77889",
    location: "Kolkata, WB",
    photoUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80",
    summary: "Academic AI researcher publishing papers in deep learning, neural speech synthesis, and natural language processing.",
    skills: ["PyTorch & TensorFlow", "NLP & Transformers", "Python & CUDA", "LaTeX Research Papers"],
    education: [{ institution: "IIT Kharagpur", degree: "M.Tech AI & Data Science", years: "2018 – 2020" }],
    experience: [{ company: "IISc Research R&D", role: "Research Associate", years: "2020 – Present", bullets: ["Published 4 peer-reviewed paper in IEEE & NeurIPS.", "Trained multilingual transformer speech synthesis models."] }],
    projects: [{ title: "Indic Natural Speech Synthesizer", tech: "PyTorch, CUDA", description: "Neural speech model generating natural audio across 8 Indian languages." }],
    certifications: ["DeepLearning.AI AI Specialist"],
    achievements: ["Prime Minister's Research Fellow"],
  },
  photo_split_hero: {
    name: "Neha Kulkarni",
    title: "Cybersecurity & DevSecOps Lead",
    email: "neha.k@security.in",
    phone: "+91 98777 88990",
    location: "Gurgaon, HR",
    photoUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80",
    summary: "DevSecOps Lead specializing in cloud security automation, penetration testing, and zero-trust identity architectures.",
    skills: ["AWS Security & IAM", "Penetration Testing", "Docker Security", "Python & Bash"],
    education: [{ institution: "DTU Delhi", degree: "B.Tech Information Technology", years: "2016 – 2020" }],
    experience: [{ company: "Razorpay Financials", role: "Senior Security Specialist", years: "2021 – Present", bullets: ["Conducted security audits across 50+ microservices.", "Automated CI/CD security scanning."] }],
    projects: [{ title: "Zero-Trust API Gateway Shield", tech: "Python, Docker, OAuth2", description: "Protected financial endpoints against DDoS and OWASP threats." }],
    certifications: ["CISSP Certified Specialist", "CEH Master"],
    achievements: ["Top Bug Bounty Hall of Fame"],
  },
  photo_clean_vertical: {
    name: "Siddharth Gupta",
    title: "Embedded Hardware & Firmware Engineer",
    email: "siddharth.g@firmware.in",
    phone: "+91 98888 99001",
    location: "Bengaluru, KA",
    photoUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80",
    summary: "Embedded Firmware Engineer writing real-time micro-controller C/C++ drivers and automotive CAN bus protocols.",
    skills: ["Embedded C/C++", "FreeRTOS & ESP32", "STM32 & ARM Cortex", "CAN Bus & MQTT"],
    education: [{ institution: "BITS Pilani, Goa", degree: "B.E. Electronics", years: "2016 – 2020" }],
    experience: [{ company: "Ather Energy", role: "Senior Firmware Engineer", years: "2021 – Present", bullets: ["Developed Battery Management System (BMS) firmware.", "Reduced MCU power consumption by 22%."] }],
    projects: [{ title: "Smart EV Battery Telemetry Unit", tech: "ESP32, FreeRTOS, C++", description: "Real-time IoT device sending battery metrics to cloud." }],
    certifications: ["ARM Accredited Engineer"],
    achievements: ["Ather Hardware Innovation Award"],
  },
  photo_personal_brand: {
    name: "Meera Joshi",
    title: "Brand Designer & UI Strategist",
    email: "meera.j@branding.in",
    phone: "+91 98999 00112",
    location: "Mumbai, MH",
    photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80",
    summary: "Brand Strategist crafting personal identities, executive portfolios, and visual media campaigns for consumer brands.",
    skills: ["Brand Strategy & Identity", "Figma & Illustrator", "Visual Storytelling", "Copywriting"],
    education: [{ institution: "NID Ahmedabad", degree: "B.Des Graphic Design", years: "2015 – 2019" }],
    experience: [{ company: "Ogilvy India", role: "Lead Brand Strategist", years: "2020 – Present", bullets: ["Led rebranding for leading D2C ecommerce startup.", "Created digital brand guidelines."] }],
    projects: [{ title: "D2C Brand Identity Overhaul", tech: "Figma, Illustrator", description: "Increased brand recognition and web store conversions by 40%." }],
    certifications: ["Adobe Certified Expert"],
    achievements: ["Kyoorius Design Gold Winner"],
  },
  photo_premium_identity: {
    name: "Rahul Deshmukh",
    title: "Senior Engineering Manager",
    email: "rahul.d@manager.in",
    phone: "+91 99000 11223",
    location: "Pune, MH",
    photoUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&auto=format&fit=crop&q=80",
    summary: "Engineering Manager leading 25+ developers, cloud infrastructure, and enterprise agile delivery.",
    skills: ["Engineering Management", "Agile & Scrum Delivery", "System Architecture", "Team Mentorship"],
    education: [{ institution: "VJTI Mumbai", degree: "B.Tech Computer Engineering", years: "2011 – 2015" }],
    experience: [{ company: "Barclays Technology", role: "Engineering Manager", years: "2019 – Present", bullets: ["Managed 3 engineering squads building payments engine.", "Reduced production bug rates by 45%."] }],
    projects: [{ title: "Enterprise Payments Core", tech: "Java, AWS", description: "High-volume banking core servicing 5M daily merchant transactions." }],
    certifications: ["Certified Scrum Master"],
    achievements: ["Barclays Leadership Fellow"],
  },
  photo_executive_board: {
    name: "Karan Malhotra",
    title: "Executive Vice President",
    email: "karan.m@board.in",
    phone: "+91 99111 22334",
    location: "Mumbai, MH",
    photoUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80",
    summary: "Senior Business Executive managing ₹500 Cr annual revenue operations and corporate growth.",
    skills: ["P&L Management", "Strategic Growth", "Board Governance", "M&A Advisory"],
    education: [{ institution: "IIM Calcutta", degree: "MBA Executive", years: "2012 – 2014" }],
    experience: [{ company: "Reliance Industries", role: "VP Strategy", years: "2018 – Present", bullets: ["Drove operational efficiency saving ₹45 Crores.", "Led strategic market expansion into 15 new regions."] }],
    projects: [{ title: "Retail Logistics Transformation", tech: "SAP S/4HANA", description: "Streamlined supply chain logistics across 2,000 retail stores." }],
    certifications: ["Corporate Governance Certified"],
    achievements: ["ET Business Leader 2023"],
  },
  photo_magazine_cover: {
    name: "Diya Kapoor",
    title: "Fashion & Media Creative Lead",
    email: "diya.k@media.in",
    phone: "+91 99222 33445",
    location: "Delhi NCR",
    photoUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&auto=format&fit=crop&q=80",
    summary: "Creative Lead producing editorial fashion campaigns, magazine typography, and brand media.",
    skills: ["Editorial Typography", "Art Direction", "Adobe InDesign & Photoshop", "Media Production"],
    education: [{ institution: "NIFT Delhi", degree: "B.Des Fashion Communication", years: "2016 – 2020" }],
    experience: [{ company: "Vogue India", role: "Senior Art Lead", years: "2021 – Present", bullets: ["Directed cover shoot design for 12 monthly magazine issues.", "Managed digital social campaigns."] }],
    projects: [{ title: "Digital Magazine Interactive Edition", tech: "Adobe InDesign, WebGL", description: "Created interactive digital edition generating 1.2M readers." }],
    certifications: ["Adobe Certified Expert"],
    achievements: ["Vogue Excellence Award 2022"],
  },
  photo_designer_portfolio: {
    name: "Sneha Choudhury",
    title: "Senior Product Designer",
    email: "sneha.c@portfolio.in",
    phone: "+91 99333 44556",
    location: "Bengaluru, KA",
    photoUrl: "https://images.unsplash.com/photo-1548142813-c348350df52b?w=200&auto=format&fit=crop&q=80",
    summary: "Product Designer crafting intuitive SaaS interfaces, Behance portfolios, and Figma design tokens.",
    skills: ["Figma & Design Systems", "UX Research", "Prototyping", "HTML/CSS"],
    education: [{ institution: "NID Bengaluru", degree: "B.Des Digital Media", years: "2016 – 2020" }],
    experience: [{ company: "Postman Tech", role: "Senior Product Designer", years: "2021 – Present", bullets: ["Designed API documentation workspace interface.", "Improved user onboarding completion by 28%."] }],
    projects: [{ title: "Developer API Canvas", tech: "Figma, React", description: "Workspace UI utilized by 10M+ software engineers globally." }],
    certifications: ["Nielsen Norman UX Master"],
    achievements: ["Behance Featured Portfolio 2023"],
  },
  photo_identity_card: {
    name: "Varun Saxena",
    title: "Chief Information Security Officer",
    email: "varun.s@ciso.in",
    phone: "+91 99444 55667",
    location: "Hyderabad, TS",
    photoUrl: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=200&auto=format&fit=crop&q=80",
    summary: "CISO managing enterprise cybersecurity infrastructure, compliance frameworks, and threat intelligence.",
    skills: ["Enterprise Cyber Security", "SOC Operations", "ISO 27001", "Threat Mitigation"],
    education: [{ institution: "IIT Hyderabad", degree: "M.Tech Cybersecurity", years: "2013 – 2015" }],
    experience: [{ company: "Infosys Security", role: "CISO Advisory Lead", years: "2019 – Present", bullets: ["Protected cloud infrastructure across 100+ enterprise clients.", "Achieved ISO 27001 audit compliance."] }],
    projects: [{ title: "Global SOC Alert Triage Engine", tech: "Python, SIEM", description: "Automated cyber threat triage reducing response time by 80%." }],
    certifications: ["CISM & CISSP Certified"],
    achievements: ["CISO Leader Award 2023"],
  },
  photo_startup_founder: {
    name: "Pooja Sundaram",
    title: "Founder & Product Officer",
    email: "pooja.s@startup.in",
    phone: "+91 99555 66778",
    location: "Bengaluru, KA",
    photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
    summary: "Tech Founder building AI consumer products, raising seed funding, and managing YC startup growth.",
    skills: ["Product Strategy", "Seed Fundraising", "AI Product Development", "Growth Funnels"],
    education: [{ institution: "IIT Madras", degree: "B.Tech Computer Science", years: "2015 – 2019" }],
    experience: [{ company: "Krutrim AI (YC W22)", role: "Co-Founder & CEO", years: "2021 – Present", bullets: ["Built Indic LLM app serving 500k active monthly users.", "Raised $2.5M seed funding from top VC funds."] }],
    projects: [{ title: "Multilingual Indic AI Assistant", tech: "Python, PyTorch", description: "Consumer AI voice assistant processing 1M daily conversations." }],
    certifications: ["Y Combinator Founder W22"],
    achievements: ["Forbes 30 Under 30 Asia"],
  },
  photo_newspaper_editorial: {
    name: "Ritu Bhattacharya",
    title: "Senior Technology Editor",
    email: "ritu.b@editorial.in",
    phone: "+91 99666 77889",
    location: "Kolkata, WB",
    photoUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80",
    summary: "Technology Journalist and Editorial Lead publishing long-form investigative tech journalism and corporate profiles.",
    skills: ["Tech Journalism", "Editorial Writing", "Media Strategy", "Investigative Research"],
    education: [{ institution: "St. Xavier's College", degree: "B.A. Mass Communication", years: "2014 – 2017" }],
    experience: [{ company: "The Economic Times", role: "Senior Tech Editor", years: "2020 – Present", bullets: ["Published 150+ investigative tech startup stories.", "Managed weekly technology editorial column."] }],
    projects: [{ title: "Indian Startup Ecosystem Report", tech: "Data Analytics, Journalism", description: "Comprehensive report cited by top VC investors and media." }],
    certifications: ["Ramnath Goenka Excellence in Journalism"],
    achievements: ["Press Club Award 2022"],
  },
  photo_profile_dashboard: {
    name: "Tarun Nambiar",
    title: "UI/UX & Product Dashboard Engineer",
    email: "tarun.n@dashboard.in",
    phone: "+91 99777 88990",
    location: "Kochi, KL",
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
    summary: "Dashboard Engineer specializing in real-time web UI analytics portals, data visualization, and micro-frontends.",
    skills: ["React & Next.js", "D3.js & Recharts", "TypeScript & Tailwind", "Dashboard UI"],
    education: [{ institution: "NIT Calicut", degree: "B.Tech Computer Science", years: "2016 – 2020" }],
    experience: [{ company: "Freshworks Inc", role: "Senior UI Engineer", years: "2021 – Present", bullets: ["Built customer support analytics dashboard used by 60k businesses.", "Reduced chart rendering lag by 60%."] }],
    projects: [{ title: "Real-Time Telemetry Dashboard", tech: "React, D3.js, WebSockets", description: "Live monitoring console processing 10k data points per second." }],
    certifications: ["Meta Certified Front-End Developer"],
    achievements: ["Freshworks Hackathon Winner"],
  },
  photo_european_cv: {
    name: "Ishita Chatterjee",
    title: "Global Software Architect",
    email: "ishita.c@global.in",
    phone: "+91 99888 99001",
    location: "Berlin / Bengaluru",
    photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
    summary: "Global Software Engineer matching European hiring standards, building cross-border cloud platforms.",
    skills: ["Java, Go & Python", "Europass CV Standards", "Cloud Architecture", "Multilingual (English, German)"],
    education: [{ institution: "TU Munich / IIT Madras", degree: "M.Sc Computer Science", years: "2017 – 2019" }],
    experience: [{ company: "SAP SE Germany", role: "Senior Cloud Architect", years: "2020 – Present", bullets: ["Architected SAP BTP cloud microservices.", "Led cross-border engineering teams across EU & India."] }],
    projects: [{ title: "Global ERP Data Connector", tech: "Go, Kubernetes, SAP BTP", description: "Enterprise data bridge connecting European & Asian subsidiaries." }],
    certifications: ["SAP Certified Cloud Architect"],
    achievements: ["SAP European Tech Fellow"],
  },
  photo_consulting_profile: {
    name: "Aditi Mukherjee",
    title: "Senior Management Consultant",
    email: "aditi.m@consulting.in",
    phone: "+91 99999 00112",
    location: "Mumbai, MH",
    photoUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80",
    summary: "Strategy Consultant advising Fortune 500 executives on digital transformation, operational efficiency, and market entry.",
    skills: ["Strategy Consulting", "Digital Transformation", "Financial Valuation", "Executive Presentations"],
    education: [{ institution: "IIM Bangalore", degree: "MBA Strategy", years: "2017 – 2019" }],
    experience: [{ company: "McKinsey & Company", role: "Engagement Manager", years: "2020 – Present", bullets: ["Advised CXOs of top 5 Indian private banks on digital banking strategy.", "Led team of 6 management consultants."] }],
    projects: [{ title: "Private Bank Digital Strategy", tech: "McKinsey Benchmarking", description: "Created digital roadmap increasing retail banking revenues by ₹120 Crores." }],
    certifications: ["McKinsey Certified Engagement Lead"],
    achievements: ["IIM Bangalore Gold Medalist"],
  },
};

export function TemplatePreviewWireframe({ tmpl }: { tmpl: TemplateDefinition }) {
  const accent = tmpl.accentColor || "#1e293b";
  const isPhoto = tmpl.supportsPhoto;

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

  // ── Helper to render a section block with clean, un-overflowed typography ──
  const renderSectionBlock = (secKey: string, secLabel: string) => {
    if (secKey === "summary" && p.summary) {
      return (
        <div key={secKey} className="space-y-0.5">
          <h3 className="text-[7px] font-extrabold uppercase tracking-wider border-b border-zinc-200 pb-0.5" style={{ color: accent }}>{secLabel}</h3>
          <p className="text-[5.5px] text-zinc-600 leading-snug line-clamp-2">{p.summary}</p>
        </div>
      );
    }

    if (secKey === "skills" && p.skills?.length) {
      if (tmpl.id === "skills_first" || tmpl.id === "developer_portfolio" || tmpl.id === "photo_creative_tech" || tmpl.id === "photo_academic" || tmpl.id === "tech_spec") {
        const mid = Math.ceil(p.skills.length / 2);
        const group1 = p.skills.slice(0, mid);
        const group2 = p.skills.slice(mid);
        return (
          <div key={secKey} className="space-y-0.5">
            <h3 className="text-[7px] font-extrabold uppercase tracking-wider border-b border-zinc-200 pb-0.5" style={{ color: accent }}>{secLabel}</h3>
            <div className="space-y-0.5 text-[5.5px]">
              <div className="truncate">
                <span className="font-bold text-zinc-900">Core: </span>
                <span className="text-zinc-600">{group1.join(", ")}</span>
              </div>
              {group2.length > 0 && (
                <div className="truncate">
                  <span className="font-bold text-zinc-900">Tools: </span>
                  <span className="text-zinc-600">{group2.join(", ")}</span>
                </div>
              )}
            </div>
          </div>
        );
      }

      if (tmpl.id === "recruiter_scan" || tmpl.id === "photo_side_panel" || tmpl.id === "impact_focused" || tmpl.id === "timeline_prof") {
        return (
          <div key={secKey} className="space-y-0.5">
            <h3 className="text-[7px] font-extrabold uppercase tracking-wider border-b border-zinc-200 pb-0.5" style={{ color: accent }}>{secLabel}</h3>
            <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[5.5px] text-zinc-700">
              {p.skills.slice(0, 4).map((sk, idx) => (
                <span key={idx} className="truncate">• {sk}</span>
              ))}
            </div>
          </div>
        );
      }

      return (
        <div key={secKey} className="space-y-0.5">
          <h3 className="text-[7px] font-extrabold uppercase tracking-wider border-b border-zinc-200 pb-0.5" style={{ color: accent }}>{secLabel}</h3>
          <p className="text-[5.5px] text-zinc-800 font-medium leading-tight truncate">
            {p.skills.join(" • ")}
          </p>
        </div>
      );
    }

    if (secKey === "education" && p.education?.length) {
      return (
        <div key={secKey} className="space-y-0.5">
          <h3 className="text-[7px] font-extrabold uppercase tracking-wider border-b border-zinc-200 pb-0.5" style={{ color: accent }}>{secLabel}</h3>
          {p.education.slice(0, 2).map((ed, idx) => (
            <div key={idx} className="flex items-center justify-between text-[5.5px]">
              <div className="truncate">
                <span className="font-bold text-zinc-900">{ed.institution}</span> — <span className="text-zinc-600">{ed.degree}</span>
              </div>
              <span className="text-[5px] text-zinc-500 font-medium shrink-0 ml-1">{ed.years}</span>
            </div>
          ))}
        </div>
      );
    }

    if (secKey === "experience" && p.experience?.length) {
      return (
        <div key={secKey} className="space-y-0.5">
          <h3 className="text-[7px] font-extrabold uppercase tracking-wider border-b border-zinc-200 pb-0.5" style={{ color: accent }}>{secLabel}</h3>
          {p.experience.slice(0, 2).map((exp, idx) => (
            <div key={idx} className="space-y-0.5">
              <div className="flex items-center justify-between text-[5.5px] font-bold text-zinc-900">
                <span className="truncate">{exp.role} — {exp.company}</span>
                <span className="text-[5px] text-zinc-500 shrink-0 ml-1">{exp.years}</span>
              </div>
              {exp.bullets.slice(0, 2).map((b, bi) => (
                <p key={bi} className="text-[5px] text-zinc-600 leading-tight truncate">• {b}</p>
              ))}
            </div>
          ))}
        </div>
      );
    }

    if (secKey === "projects" && p.projects?.length) {
      return (
        <div key={secKey} className="space-y-0.5">
          <h3 className="text-[7px] font-extrabold uppercase tracking-wider border-b border-zinc-200 pb-0.5" style={{ color: accent }}>{secLabel}</h3>
          {p.projects.slice(0, 2).map((proj, idx) => (
            <div key={idx} className="space-y-0.5">
              <p className="text-[5.5px] font-bold text-zinc-900 truncate">{proj.title} <span className="text-[5px] font-normal text-zinc-500">[{proj.tech}]</span></p>
              <p className="text-[5px] text-zinc-600 leading-tight truncate">• {proj.description}</p>
            </div>
          ))}
        </div>
      );
    }

    if (secKey === "certifications" && p.certifications?.length) {
      return (
        <div key={secKey} className="space-y-0.5">
          <h3 className="text-[7px] font-extrabold uppercase tracking-wider border-b border-zinc-200 pb-0.5" style={{ color: accent }}>{secLabel}</h3>
          <div className="space-y-0.5 text-[5px] text-zinc-600">
            {p.certifications.slice(0, 2).map((cert, idx) => (
              <p key={idx} className="truncate">• {cert}</p>
            ))}
          </div>
        </div>
      );
    }

    if (secKey === "achievements" && p.achievements?.length) {
      return (
        <div key={secKey} className="space-y-0.5">
          <h3 className="text-[7px] font-extrabold uppercase tracking-wider border-b border-zinc-200 pb-0.5" style={{ color: accent }}>{secLabel}</h3>
          <div className="space-y-0.5 text-[5px] text-zinc-600">
            {p.achievements.slice(0, 2).map((ach, idx) => (
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
      <div className="w-full aspect-[1/1.41] bg-white text-zinc-900 shadow-xs border border-zinc-200 rounded-md p-0 overflow-hidden select-none relative flex text-[6.5px] leading-tight">
        {/* Left Solid Colored Sidebar */}
        <div className="w-[34%] p-2 flex flex-col justify-between shrink-0 text-white" style={{ backgroundColor: accent }}>
          <div className="space-y-2">
            {isPhoto ? (
              <div className="flex flex-col items-center text-center space-y-1 mb-0.5">
                <img
                  src={p.photoUrl}
                  alt={p.name}
                  className="w-10 h-10 rounded-full object-cover border border-white/80 shrink-0"
                />
                <span className="text-[7.5px] font-bold text-white leading-none tracking-tight block mt-0.5 truncate max-w-full">{p.name}</span>
                <span className="text-[5.5px] text-white/80 font-medium block truncate max-w-full">{p.title}</span>
              </div>
            ) : (
              <div className="border-b border-white/30 pb-1 mb-0.5">
                <span className="text-[8.5px] font-extrabold text-white block uppercase tracking-tight truncate">{p.name}</span>
                <span className="text-[5.5px] text-white/80 font-medium block truncate">{p.title}</span>
              </div>
            )}

            {/* Details / Contact Block */}
            <div className="space-y-0.5 text-[5.5px] text-white/90">
              <span className="text-[5px] font-extrabold uppercase tracking-wider block text-white/70 border-b border-white/20 pb-0.5">CONTACT</span>
              <p className="truncate">📍 {p.location}</p>
              <p className="truncate">✉️ {p.email}</p>
              <p className="truncate">📞 {p.phone}</p>
            </div>

            {/* Skills Block */}
            <div className="space-y-0.5 text-[5.5px] text-white/90">
              <span className="text-[5px] font-extrabold uppercase tracking-wider block text-white/70 border-b border-white/20 pb-0.5">TECHNICAL SKILLS</span>
              <div className="space-y-0.5">
                {p.skills.slice(0, 5).map((sk, i) => (
                  <p key={i} className="truncate">• {sk}</p>
                ))}
              </div>
            </div>
          </div>

          {/* Education Mini Block */}
          <div className="space-y-0.5 text-[5.5px] text-white/90 pt-1">
            <span className="text-[5px] font-extrabold uppercase tracking-wider block text-white/70 border-b border-white/20 pb-0.5">EDUCATION</span>
            {p.education.slice(0, 1).map((ed, i) => (
              <div key={i} className="space-y-0.5">
                <p className="font-bold text-white truncate">{ed.institution}</p>
                <p className="text-white/80 text-[5px] truncate">{ed.degree}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Main Body Content */}
        <div className="flex-1 p-2 flex flex-col justify-between min-w-0 bg-white">
          {!isPhoto && (
            <div className="pb-1 border-b border-zinc-200">
              <h2 className="text-[9px] font-extrabold text-zinc-900 uppercase tracking-tight">{p.name}</h2>
              <p className="text-[6px] text-zinc-600 font-semibold">{p.title}</p>
            </div>
          )}

          {/* Render Sections in exact Order */}
          {sectionsToDisplay.map((sec) => renderSectionBlock(sec.key, sec.label))}
        </div>

        {/* PDF/DOCX Badge */}
        <div className="absolute bottom-1 right-1 flex gap-0.5 z-10">
          <span className="px-1 py-0.5 text-[5px] font-bold bg-zinc-100 text-zinc-600 rounded-2xs border border-zinc-200 shadow-2xs">PDF</span>
          <span className="px-1 py-0.5 text-[5px] font-bold bg-zinc-100 text-zinc-600 rounded-2xs border border-zinc-200 shadow-2xs">DOCX</span>
        </div>
      </div>
    );
  }

  // ── 2. TIMELINE LAYOUT (Timeline Professional) ──
  if (tmpl.headerStyle === "timeline") {
    return (
      <div className="w-full aspect-[1/1.41] bg-white text-zinc-900 shadow-xs border border-zinc-200 rounded-md p-2 overflow-hidden select-none relative flex flex-col justify-between text-[6.5px] leading-tight">
        <div className="pb-1 border-b border-zinc-200">
          <h2 className="text-[9px] font-extrabold uppercase tracking-tight" style={{ color: accent }}>{p.name}</h2>
          <p className="text-[5.5px] text-zinc-700 font-bold">{p.title}</p>
          <p className="text-[5px] text-zinc-500 mt-0.5">{p.email} | {p.phone} | {p.location}</p>
        </div>
        <div className="flex-1 min-w-0 pl-2 border-l border-zinc-300 ml-1 relative flex flex-col justify-between py-0.5">
          {sectionsToDisplay.map((sec) => (
            <div key={sec.key} className="relative">
              <div className="absolute -left-[11px] top-1 w-1.5 h-1.5 rounded-full bg-zinc-800 border border-white shrink-0" />
              {renderSectionBlock(sec.key, sec.label)}
            </div>
          ))}
        </div>
        <div className="absolute bottom-1 right-1 flex gap-0.5 z-10">
          <span className="px-1 py-0.5 text-[5px] font-bold bg-zinc-100 text-zinc-600 rounded-2xs border border-zinc-200 shadow-2xs">PDF</span>
          <span className="px-1 py-0.5 text-[5px] font-bold bg-zinc-100 text-zinc-600 rounded-2xs border border-zinc-200 shadow-2xs">DOCX</span>
        </div>
      </div>
    );
  }

  // ── 3. DUAL BLOCK LAYOUT (Dual Section 50/50) ──
  if (tmpl.headerStyle === "dual_block") {
    return (
      <div className="w-full aspect-[1/1.41] bg-white text-zinc-900 shadow-xs border border-zinc-200 rounded-md p-2 overflow-hidden select-none relative flex flex-col justify-between text-[6.5px] leading-tight">
        <div className="pb-1 border-b border-zinc-200 text-center">
          <h2 className="text-[9px] font-extrabold uppercase tracking-tight" style={{ color: accent }}>{p.name}</h2>
          <p className="text-[5.5px] text-zinc-700 font-bold">{p.title}</p>
          <p className="text-[5px] text-zinc-500 mt-0.5">{p.email} • {p.phone} • {p.location}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 flex-1 min-w-0 py-0.5">
          <div className="border-r border-zinc-200 pr-1.5 flex flex-col justify-between">
            {renderSectionBlock("education", "EDUCATION")}
            {renderSectionBlock("skills", "TECHNICAL SKILLS")}
            {renderSectionBlock("certifications", "CERTIFICATIONS")}
          </div>
          <div className="pl-0.5 flex flex-col justify-between">
            {renderSectionBlock("summary", "PROFILE SUMMARY")}
            {renderSectionBlock("experience", "EMPLOYMENT HISTORY")}
            {renderSectionBlock("projects", "KEY PROJECTS")}
          </div>
        </div>
        <div className="absolute bottom-1 right-1 flex gap-0.5 z-10">
          <span className="px-1 py-0.5 text-[5px] font-bold bg-zinc-100 text-zinc-600 rounded-2xs border border-zinc-200 shadow-2xs">PDF</span>
          <span className="px-1 py-0.5 text-[5px] font-bold bg-zinc-100 text-zinc-600 rounded-2xs border border-zinc-200 shadow-2xs">DOCX</span>
        </div>
      </div>
    );
  }

  // ── 4. NUMBERED LAYOUT (IEEE Research Paper) ──
  if (tmpl.headerStyle === "numbered") {
    let secCounter = 1;
    return (
      <div className="w-full aspect-[1/1.41] bg-white text-zinc-900 shadow-xs border border-zinc-200 rounded-md p-2 overflow-hidden select-none relative flex flex-col justify-between text-[6.5px] leading-tight">
        <div className="pb-1 border-b border-zinc-300 text-center">
          <h2 className="text-[9px] font-serif font-extrabold uppercase tracking-tight" style={{ color: accent }}>{p.name}</h2>
          <p className="text-[5.5px] font-serif text-zinc-700 italic">{p.title}</p>
          <p className="text-[5px] text-zinc-500 mt-0.5">{p.email} | {p.phone} | {p.location}</p>
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
          {sectionsToDisplay.map((sec) => {
            const numLabel = `${secCounter++}.0  ${sec.label}`;
            return renderSectionBlock(sec.key, numLabel);
          })}
        </div>
        <div className="absolute bottom-1 right-1 flex gap-0.5 z-10">
          <span className="px-1 py-0.5 text-[5px] font-bold bg-zinc-100 text-zinc-600 rounded-2xs border border-zinc-200 shadow-2xs">PDF</span>
          <span className="px-1 py-0.5 text-[5px] font-bold bg-zinc-100 text-zinc-600 rounded-2xs border border-zinc-200 shadow-2xs">DOCX</span>
        </div>
      </div>
    );
  }

  // ── 5. CENTERED / PROFILE CARD LAYOUT (Student Profile Card / Academic) ──
  if (tmpl.headerStyle === "centered" || tmpl.headerStyle === "profile_card") {
    return (
      <div className="w-full aspect-[1/1.41] bg-white text-zinc-900 shadow-xs border border-zinc-200 rounded-md p-2 overflow-hidden select-none relative flex flex-col justify-between text-[6.5px] leading-tight">
        {/* Centered Header */}
        <div className="flex flex-col items-center text-center space-y-0.5 pb-1 border-b border-zinc-200">
          {isPhoto && (
            <img
              src={p.photoUrl}
              alt={p.name}
              className="w-9 h-9 rounded-full object-cover border border-zinc-300 shadow-2xs shrink-0 mb-0.5"
              style={{ borderColor: accent }}
            />
          )}
          <div>
            <h2 className="text-[9px] font-extrabold uppercase tracking-tight" style={{ color: accent }}>{p.name}</h2>
            <p className="text-[5.5px] text-zinc-600 font-semibold">{p.title}</p>
            <p className="text-[5px] text-zinc-500 mt-0.5">{p.email} • {p.phone} • {p.location}</p>
          </div>
        </div>

        {/* Dynamic Full Content Sections */}
        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
          {sectionsToDisplay.map((sec) => renderSectionBlock(sec.key, sec.label))}
        </div>

        {/* PDF/DOCX Badge */}
        <div className="absolute bottom-1 right-1 flex gap-0.5 z-10">
          <span className="px-1 py-0.5 text-[5px] font-bold bg-zinc-100 text-zinc-600 rounded-2xs border border-zinc-200 shadow-2xs">PDF</span>
          <span className="px-1 py-0.5 text-[5px] font-bold bg-zinc-100 text-zinc-600 rounded-2xs border border-zinc-200 shadow-2xs">DOCX</span>
        </div>
      </div>
    );
  }

  // ── 6. STANDARD / BANNER LAYOUT (Executive Banner, Corporate Portrait, Modern Minimal) ──
  return (
    <div className="w-full aspect-[1/1.41] bg-white text-zinc-900 shadow-xs border border-zinc-200 rounded-md p-2 overflow-hidden select-none relative flex flex-col justify-between text-[6.5px] leading-tight">
      {/* Header Row */}
      <div className="flex items-center justify-between gap-2 pb-1 border-b border-zinc-200">
        {tmpl.photoPlacement === "top_left" && isPhoto && (
          <img
            src={p.photoUrl}
            alt={p.name}
            className="w-9 h-9 rounded-md object-cover border shadow-2xs shrink-0"
            style={{ borderColor: accent }}
          />
        )}

        <div className="flex-1 min-w-0">
          <h2 className="text-[9px] font-extrabold uppercase tracking-tight" style={{ color: accent }}>{p.name}</h2>
          <p className="text-[5.5px] text-zinc-700 font-bold truncate">{p.title}</p>
          <p className="text-[5px] text-zinc-500 truncate mt-0.5">{p.email} | {p.phone} | {p.location}</p>
        </div>

        {(tmpl.photoPlacement === "top_right" || tmpl.photoPlacement === "inline") && isPhoto && (
          <img
            src={p.photoUrl}
            alt={p.name}
            className="w-9 h-9 rounded-md object-cover border shadow-2xs shrink-0"
            style={{ borderColor: accent }}
          />
        )}
      </div>

      {/* Dynamic Sections in Template Order */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        {sectionsToDisplay.map((sec) => renderSectionBlock(sec.key, sec.label))}
      </div>

      {/* PDF/DOCX Badge */}
      <div className="absolute bottom-1 right-1 flex gap-0.5 z-10">
        <span className="px-1 py-0.5 text-[5px] font-bold bg-zinc-100 text-zinc-600 rounded-2xs border border-zinc-200 shadow-2xs">PDF</span>
        <span className="px-1 py-0.5 text-[5px] font-bold bg-zinc-100 text-zinc-600 rounded-2xs border border-zinc-200 shadow-2xs">DOCX</span>
      </div>
    </div>
  );
}
