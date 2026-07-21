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
  projects: { title: string; tech: string; description: string; bullets?: string[] }[];
  certifications?: string[];
  achievements?: string[];
}

// ── REALISTIC INDIAN PERSONAS (Expanded with extra entries for dynamic page-fill scaling) ──
const INDIAN_PERSONAS: Record<string, PersonaData> = {
  modern: {
    name: "Aarav Sharma",
    title: "Senior Software Engineer",
    email: "aarav.sharma@tech.in",
    phone: "+91 98765 43210",
    location: "Bengaluru, KA",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    summary: "Senior Software Engineer with 6+ years of experience building high-throughput microservices, distributed cloud systems, and real-time backend platforms at scale. Expert in Spring Boot, AWS, Kafka, and containerized deployments. Proven track record of optimizing DB queries and leading development teams.",
    skills: ["Java, Spring Boot", "Microservices & REST", "Kafka & Redis", "AWS & Docker", "SQL & MongoDB", "Kubernetes & Helm", "Git & CI/CD Pipelines"],
    education: [
      { institution: "IIT Bombay", degree: "B.Tech Computer Science", years: "2015 – 2019" },
      { institution: "Delhi Public School, R.K. Puram", degree: "CBSE Class XII (PCM) - 95.8%", years: "2013 – 2015" },
      { institution: "St. Xavier's School", degree: "CBSE Class X - 10 CGPA", years: "2011 – 2013" },
    ],
    experience: [
      {
        company: "Flipkart Internet Pvt Ltd",
        role: "Senior Software Engineer",
        years: "2021 – Present",
        bullets: [
          "Architected Big Billion Days checkout engine processing 120,000 requests/sec with 99.99% uptime.",
          "Reduced database query latency by 45% through Redis caching and PostgreSQL index optimization.",
          "Designed multi-PSP failover payment gateway handler reducing checkout drop-off rates by 14%.",
          "Mentored 8 junior software engineers and led agile sprint planning reviews.",
        ],
      },
      {
        company: "Swiggy Labs",
        role: "Software Engineer II",
        years: "2019 – 2021",
        bullets: [
          "Built real-time delivery tracking service handling 2M+ active daily orders.",
          "Implemented Kafka message queues eliminating order drop issues during peak meal hours.",
          "Migrated legacy APIs from Node.js to Go, improving request throughput by 65%.",
        ],
      },
      {
        company: "Infosys R&D",
        role: "Systems Associate",
        years: "2018 – 2019",
        bullets: [
          "Developed backend REST services and automated unit testing modules.",
          "Improved test suite coverage from 55% to 88% using JUnit and Mockito frameworks.",
        ],
      },
    ],
    projects: [
      { 
        title: "Distributed Payment Gateway Adapter", 
        tech: "Java 17, Spring Boot, AWS", 
        description: "Multi-PSP failover service handling $40M daily digital transactions with automatic reconciliation.",
        bullets: [
          "Implemented automatic retry and circuit breaker patterns using Resilience4j.",
          "Integrated with 5 major Indian payment gateways with dynamic routing capabilities."
        ]
      },
      { 
        title: "Real-time Order Tracking Engine", 
        tech: "Node.js, Kafka, Redis", 
        description: "Reduced order tracking API latency from 450ms to 42ms via WebSockets.",
        bullets: [
          "Scaled tracking architecture to support 150k concurrent driver location updates.",
          "Optimized geospatial lookups using Redis Geohash commands."
        ]
      },
      { 
        title: "Cloud Log Aggregator Service", 
        tech: "Golang, Elasticsearch, Kibana", 
        description: "Centralized monitoring system collecting logs from 120+ microservices in real-time.",
        bullets: [
          "Designed zero-loss buffer queues processing 50 GB of structured logs daily.",
          "Created automated alerts triggering PagerDuty calls during high anomaly rates."
        ]
      },
    ],
    certifications: ["AWS Certified Solutions Architect – Associate", "Oracle Certified Professional Java SE 17", "Certified ScrumMaster (CSM)", "Google Cloud Cloud Architect"],
    achievements: [
      "Flipkart Tech Innovation Award 2023 - Recognized for Big Billion Days checkout reliability.",
      "National Cyber Olympiad Rank 14 - Secured top percentile out of 250,000 participants.",
      "ACM ICPC Regional Qualifier - Represented college team in national competitive coding.",
      "1st Place Inter-College Hackathon - Developed real-time disaster management alert portal."
    ],
  },

  recruiter_scan: {
    name: "Priya Ananya Patel",
    title: "Full Stack Lead & Cloud Developer",
    email: "priya.patel@dev.in",
    phone: "+91 98123 45678",
    location: "Hyderabad, TS",
    photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
    summary: "Full Stack Lead specializing in React/Next.js frontend systems, Node.js GraphQL APIs, and automated CI/CD cloud deployments across fintech platforms. Passionate about performant design systems and web accessibility.",
    skills: ["React & Next.js", "TypeScript & Node.js", "GraphQL & REST APIs", "PostgreSQL & Prisma", "Docker & Kubernetes", "Tailwind CSS", "Jest & Playwright"],
    education: [
      { institution: "BITS Pilani", degree: "B.E. Computer Science", years: "2016 – 2020" },
      { institution: "Hyderabad Public School", degree: "Class XII Science (PCM) - 97.4%", years: "2014 – 2016" },
      { institution: "Chirec International School", degree: "CBSE Class X - 9.8 CGPA", years: "2012 – 2014" },
    ],
    experience: [
      {
        company: "Razorpay Software",
        role: "Lead Frontend Engineer",
        years: "2021 – Present",
        bullets: [
          "Led development of merchant onboarding dashboard used by 250,000+ Indian businesses.",
          "Optimized bundle rendering performance reducing initial page load from 3.2s to 0.9s.",
          "Created modular Design System UI component library adopted across 14 product squads.",
          "Established automated frontend end-to-end testing pipeline using Playwright.",
        ],
      },
      {
        company: "MakeMyTrip India",
        role: "Software Developer",
        years: "2020 – 2021",
        bullets: [
          "Developed hotel booking web app serving 5M+ monthly active travelers.",
          "Integrated UPI & Netbanking payment SDKs with zero checkout security drop-offs.",
          "Re-architected core search filter panel reducing interactive latency by 30%.",
        ],
      },
    ],
    projects: [
      { 
        title: "Merchant Analytics Dashboard", 
        tech: "React, Next.js, Recharts, Tailwind", 
        description: "Real-time revenue monitoring portal processing 10M+ transaction logs per day.",
        bullets: [
          "Designed dynamic charting libraries supporting multi-year aggregation analysis.",
          "Implemented localized payment flow UI supports for 8 vernacular Indian languages."
        ]
      },
      { 
        title: "Automated Developer Onboarding Tool", 
        tech: "Node.js, Docker, GitHub Actions", 
        description: "Accelerated developer environment setup from 2 days to 15 minutes.",
        bullets: [
          "Created pre-configured Docker containers containing mock API microservices.",
          "Developed CLI script to automate environment configs and database seeds."
        ]
      },
    ],
    certifications: ["Meta Certified Front-End Developer", "Docker Certified Associate", "AWS Certified Cloud Practitioner"],
    achievements: [
      "Razorpay Hackathon Winner 2022 - Developed instant refunds widget plugin.",
      "KVPY Scholar Fellowship Winner - Awarded prestigious national science scholarship.",
      "CBSE Merit Certificate for Math - Scored a perfect 100/100 in board examinations."
    ],
  },

  skills_first: {
    name: "Rohan Verma",
    title: "Backend Systems Architect",
    email: "rohan.v@systems.in",
    phone: "+91 97654 32109",
    location: "Bengaluru, KA",
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
    summary: "Backend Systems Architect with 8+ years designing fault-tolerant databases, distributed caching layers, and high-security enterprise banking APIs. Expert in Go, microservices, and Kubernetes orchestration.",
    skills: ["Go, C++, Rust", "Distributed Systems", "Kubernetes (EKS)", "PostgreSQL, Redis", "gRPC & Protobuf", "Docker & Linux", "Apache Kafka"],
    education: [
      { institution: "NIT Trichy", degree: "B.Tech Computer Science", years: "2013 – 2017" },
      { institution: "National Public School, Indiranagar", degree: "Class XII CBSE (96.2%)", years: "2011 – 2013" },
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
          "Supervised a high-performing backend core infrastructure team of 14 SDEs.",
        ],
      },
      {
        company: "Oracle India",
        role: "Senior Backend Developer",
        years: "2017 – 2020",
        bullets: [
          "Built cloud database management APIs used by 500+ enterprise client databases.",
          "Implemented security patch updates and database indexing tuning configurations.",
          "Designed modular reporting plugins reducing report generation time from 15 mins to 20 seconds.",
        ],
      },
    ],
    projects: [
      { 
        title: "High-Throughput Settlement Engine", 
        tech: "Go, gRPC, Cassandra", 
        description: "Zero-data-loss financial transaction engine processing 30k TPS with strict consistency.",
        bullets: [
          "Created transactional logging adapters using double-entry bookkeeping validation.",
          "Maintained 99.999% uptime during regional network outages."
        ]
      },
      { 
        title: "Distributed Lock Manager", 
        tech: "Rust, Raft Consensus", 
        description: "Fault-tolerant cluster lock coordinator with sub-millisecond lease times.",
        bullets: [
          "Developed light consensus heartbeats minimizing thread congestion overheads.",
          "Implemented memory-safe lock state trackers utilizing Rust ownership patterns."
        ]
      },
    ],
    certifications: ["Certified Kubernetes Administrator (CKA)", "AWS Solutions Architect Pro", "Google Professional Cloud Architect"],
    achievements: [
      "PhonePe Tech Fellow 2023 - Selected as one of top 3 technical contributors company-wide.",
      "ACM ICPC Regional Finalist - Placed top 15 in Chennai regional competitive programming.",
      "Ranked 420 in JEE Advanced - Secured top percentile admission to premium technical institutes."
    ],
  },

  project_first: {
    name: "Ananya Rao",
    title: "Lead Product Manager",
    email: "ananya.rao@product.in",
    phone: "+91 99887 76655",
    location: "Mumbai, MH",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    summary: "Product Leader scaling consumer internet apps, conversion funnels, and AI features across edtech and fintech platforms. Expertise in growth strategy and data-driven product roadmaps.",
    skills: ["Product Strategy", "Growth & Funnels", "A/B Testing & Mixpanel", "SQL Analytics", "Agile & Scrum", "User Research", "Jira & Confluence"],
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
          "Managed cross-functional team of 12 software engineers, UI/UX designers, and growth analysts.",
        ],
      },
      {
        company: "BYJU'S Edtech",
        role: "Product Manager",
        years: "2020 – 2021",
        bullets: [
          "Launched interactive video learning module used by 2M+ school students.",
          "Improved student class completion rates by 35% through reward gamification.",
          "Reduced churn rates by 12% via target analytics onboarding modifications.",
        ],
      },
    ],
    projects: [
      { 
        title: "AI Food Recommendation Engine", 
        tech: "Mixpanel, Python, SQL", 
        description: "Grew average order value by ₹85 per user across 20 metro cities.",
        bullets: [
          "Constructed cohort models analyzing high-value customer order histories.",
          "Launched dynamic discount widgets yielding a 14% improvement in cart conversions."
        ]
      },
      { 
        title: "Instant UPI Checkout Funnel", 
        tech: "Figma, Amplitude", 
        description: "Reduced checkout funnel drop-off rate from 18% to 4.2% through smart routing.",
        bullets: [
          "Conducted usability interviews with 150+ target merchants.",
          "Collaborated with fintech partners to enable quick authorization prompts."
        ]
      },
    ],
    certifications: ["Certified Scrum Product Owner (CSPO)", "Reforge Growth Series Certificate", "Pragmatic Institute Level VI"],
    achievements: [
      "IIM Ahmedabad Gold Medalist - Graduated top of class in MBA cohort.",
      "Product Leader of the Year 2022 - Awarded for Zomato Gold growth.",
      "JEE Advanced Air 189 - Ranked top tier nationwide in college entrance."
    ],
  },

  academic_premium: {
    name: "Aditya Reddy",
    title: "AI Researcher & Machine Learning Lead",
    email: "aditya.reddy@research.in",
    phone: "+91 98450 12345",
    location: "Chennai, TN",
    photoUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80",
    summary: "AI Researcher developing Computer Vision pipelines, Large Language Model fine-tuning, and Deep Learning models for autonomous systems. Passionate about low-resource NLP.",
    skills: ["PyTorch & TensorFlow", "Large Language Models (LLMs)", "Computer Vision (OpenCV)", "Python & C++ CUDA", "Transformers", "Git & Linux", "MLOps & MLflow"],
    education: [
      { institution: "IIT Madras", degree: "M.S. Artificial Intelligence", years: "2018 – 2020" },
      { institution: "College of Engineering Guindy", degree: "B.E. Computer Science", years: "2014 – 2018" },
      { institution: "SBOA Matriculation, Chennai", degree: "Class XII State Board - 98.4%", years: "2012 – 2014" },
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
      { 
        title: "Multilingual Indic Speech Recognition", 
        tech: "PyTorch, Transformers, CUDA", 
        description: "Achieved state-of-the-art 94% accuracy across 12 Indian languages.",
        bullets: [
          "Fine-tuned Whisper models with localized Indian voice recordings.",
          "Reduced parameter size by 40% using structured knowledge distillation."
        ]
      },
      { 
        title: "Autonomous Vehicle Obstacle Detection", 
        tech: "TensorFlow, OpenCV, ROS", 
        description: "Real-time 60 FPS object detection model running on NVIDIA Jetson edge hardware.",
        bullets: [
          "Designed custom YOLOv8 architectures optimized for low-power edge units.",
          "Reduced collision warning API response latencies to under 5ms."
        ]
      },
    ],
    certifications: ["DeepLearning.AI TensorFlow Developer", "NVIDIA CUDA Specialist", "Google Cloud Professional MLE"],
    achievements: [
      "Best Paper Award at CVPR 2022 - Awarded for low-resource model research.",
      "Prime Minister's Research Fellowship (PMRF) - Awarded to top PhD candidates in India.",
      "NTSE Scholar - Recipient of prestigious national talent search scholarship."
    ],
  },

  one_page_dense: {
    name: "Kavya Iyer",
    title: "DevOps & Cloud Infrastructure Lead",
    email: "kavya.iyer@cloud.in",
    phone: "+91 97111 22334",
    location: "Pune, MH",
    photoUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80",
    summary: "DevOps Lead managing multi-region AWS/GCP Kubernetes clusters, Infrastructure-as-Code automation, and zero-downtime microservice deployments across banking platforms.",
    skills: ["AWS & GCP Cloud", "Kubernetes & Helm", "Terraform & IaC", "CI/CD GitHub Actions", "Prometheus & Grafana", "Bash & Python", "Ansible & Packer"],
    education: [
      { institution: "IIIT Hyderabad", degree: "B.Tech Computer Science", years: "2015 – 2019" },
      { institution: "Chinmaya Vidyalaya, Chennai", degree: "Class XII Science (96.5%)", years: "2013 – 2015" },
    ],
    experience: [
      {
        company: "Paytm Payments Bank",
        role: "Lead DevOps Engineer",
        years: "2021 – Present",
        bullets: [
          "Automated Terraform deployment templates reducing cluster provisioning time from 4h to 12m.",
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
          "Reduced cloud computing cost by 38% via Kubernetes cluster auto-scaling setup.",
        ],
      },
    ],
    projects: [
      { 
        title: "Multi-Region Disaster Recovery Mesh", 
        tech: "AWS EKS, Terraform, Istio", 
        description: "Zero-downtime regional failover infrastructure handling 20M daily active users.",
        bullets: [
          "Designed multi-region traffic routing adapters using AWS Route53 profiles.",
          "Conducted automated failover drills with zero packet or data loss."
        ]
      },
      { 
        title: "Automated CI/CD Vulnerability Scanner", 
        tech: "Python, Trivy, SonarQube", 
        description: "Reduced production deployment security vulnerabilities by 90%.",
        bullets: [
          "Created automated blocking alerts inside Github Actions pipelines.",
          "Configured compliance reports auto-sent to security team Slack channels."
        ]
      },
    ],
    certifications: ["AWS Certified DevOps Engineer Pro", "Certified Kubernetes Administrator (CKA)", "Terraform Associate"],
    achievements: [
      "Paytm Engineering Award 2023 - Recognized for database disaster recovery.",
      "AWS Community Builder 2022 - Selected for technical cloud contributions.",
      "Top 50 Women in Tech India - Listed by national tech publication."
    ],
  },
};

// ── 20 DISTINCT PHOTO PERSONAS (Fully enriched with text, experiences, projects, and custom certifications) ──
const PHOTO_INDIAN_PERSONAS: Record<string, PersonaData> = {
  auto_generate_photo: {
    name: "Priya V. Ananya",
    title: "Lead Systems Engineer & Cloud Architect",
    email: "priya.v@cloud.in",
    phone: "+91 98765 00112",
    location: "Bengaluru, KA",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    summary: "Cloud Systems Lead with 7+ years building enterprise microservices, API gateways, and automated DevOps architectures for banking sectors. Specialist in high-performance computing, distributed databases, and security compliance.",
    skills: ["AWS & Kubernetes", "Java & Spring Boot", "Docker & Terraform", "PostgreSQL & Redis", "Kafka & Redis", "Git & CI/CD Pipelines"],
    education: [
      { institution: "IIT Bombay", degree: "B.Tech Computer Science", years: "2015 – 2019" },
      { institution: "National Public School", degree: "CBSE Class XII - 96.2%", years: "2013 – 2015" }
    ],
    experience: [
      { 
        company: "Flipkart Tech", 
        role: "Lead Systems Architect", 
        years: "2021 – Present", 
        bullets: [
          "Scaled payment transaction systems to support 100k concurrent requests/sec.",
          "Reduced cloud infrastructure latency by 35% through smart Redis caching layers.",
          "Mentored 10 backend engineers and conducted weekly architecture design audits."
        ] 
      },
      {
        company: "Swiggy Labs",
        role: "Senior Backend Developer",
        years: "2019 – 2021",
        bullets: [
          "Optimized food order routing engine latency from 1.2s to 120ms during peak hours.",
          "Built event-driven microservices processing 2.4M transactions daily."
        ]
      }
    ],
    projects: [
      { 
        title: "Cloud Payment Routing Engine", 
        tech: "Java, AWS EKS", 
        description: "Real-time payment adapter handling ₹50M daily GMV with multi-provider failover.",
        bullets: [
          "Integrated resilient failover switch handling API failure rates above 1.5%.",
          "Automated ledger reconciliation with zero transaction variance audits."
        ]
      }
    ],
    certifications: ["AWS Solutions Architect Pro", "HashiCorp Terraform Certified", "Certified Kubernetes Security Specialist"],
    achievements: ["Flipkart Innovator Award 2022", "Top Ranker ACM ICPC Regionals", "National Talent Scholar"],
  },
  photo_executive: {
    name: "Aarav Sharma",
    title: "Senior Engineering Director",
    email: "aarav.sharma@executive.in",
    phone: "+91 98111 22334",
    location: "Delhi NCR",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    summary: "Engineering Director scaling 100+ SDE organizations, distributed databases, real-time telemetry, and high-frequency messaging platforms for automotive EV domains.",
    skills: ["Engineering Leadership", "Distributed Systems", "Go, C++, Rust", "Microservices & Kubernetes", "Scrum & Agile Development"],
    education: [
      { institution: "IIT Delhi", degree: "B.Tech Computer Science", years: "2012 – 2016" },
      { institution: "Modern School, Barakhamba", degree: "CBSE Class XII - 95.4%", years: "2010 – 2012" }
    ],
    experience: [
      { 
        company: "Tesla India R&D", 
        role: "Director of Software", 
        years: "2020 – Present", 
        bullets: [
          "Scaled engineering team from 20 to 120 engineers across 3 locations in India.",
          "Architected telemetry platform processing 10B vehicle points daily.",
          "Delivered high-performance EV battery mapping software on schedule."
        ] 
      },
      {
        company: "Samsung R&D Noida",
        role: "Senior Engineering Manager",
        years: "2016 – 2020",
        bullets: [
          "Led development of camera processing applications for flagship galaxy devices.",
          "Optimized image processing pipeline latencies by 32%."
        ]
      }
    ],
    projects: [
      { 
        title: "Vehicle Telemetry Stream Engine", 
        tech: "Go, Apache Kafka", 
        description: "Stream processing infrastructure scaling to 10M concurrent IoT devices.",
        bullets: [
          "Maintained zero telemetry data loss during heavy cell tower disconnect cycles.",
          "Implemented custom parser engine handling multiple network packet headers."
        ]
      }
    ],
    certifications: ["AWS Certified DevOps Professional", "Certified Scrum Trainer", "Stanford Executive Leadership Program"],
    achievements: ["Engineering Leadership Excellence Award", "Samsung Special Patent Innovator", "IIT Delhi Alumni Scholar"],
  },
  photo_side_panel: {
    name: "Ananya Rao",
    title: "Creative Design Director",
    email: "ananya.r@design.in",
    phone: "+91 98222 33445",
    location: "Mumbai, MH",
    photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
    summary: "Creative Director crafting digital mobile app experiences and multi-platform design systems for leading Indian tech consumer brands. Specialist in user-centric product discovery and Figma systems.",
    skills: ["Figma & Design Systems", "UI/UX Prototyping", "User Research", "Design Tokens", "Typography", "Adobe Creative Suite"],
    education: [
      { institution: "NID Ahmedabad", degree: "B.Des Interaction Design", years: "2015 – 2019" },
      { institution: "Cathedral School, Mumbai", degree: "ISC Board - 94.8%", years: "2013 – 2015" }
    ],
    experience: [
      { 
        company: "Swiggy Design Studio", 
        role: "Lead UI/UX Designer", 
        years: "2021 – Present", 
        bullets: [
          "Redesigned checkout flow increasing conversion rates by 24% globally.",
          "Created company-wide Figma design library and tokens supporting 4 internal brands.",
          "Conducted usability testing sessions across 12 tier-1 and tier-2 cities."
        ] 
      },
      {
        company: "Myntra Tech",
        role: "Senior UI Designer",
        years: "2019 – 2021",
        bullets: [
          "Designed fashion studio personalized feed interface resulting in 18% CTR growth.",
          "Built visual assets, guidelines, and responsive layouts for shopping festivals."
        ]
      }
    ],
    projects: [
      { 
        title: "10-Minute Grocery Delivery App", 
        tech: "Figma, Protopie", 
        description: "Designed mobile app ordering experience for 2M active food buyers.",
        bullets: [
          "Completed comprehensive competitive analysis across 4 instant delivery systems.",
          "Created interactive motion prototypes detailing shopping cart states."
        ]
      }
    ],
    certifications: ["Nielsen Norman UX Certification", "HFI Certified Usability Analyst", "IDF Design Specialist"],
    achievements: ["India Design Mark Winner", "Kyoorius Design Fellow", "NID Academic Merit Scholarship"],
  },
  photo_student_card: {
    name: "Rohan Verma",
    title: "Software Development Engineer",
    email: "rohan.verma@campus.in",
    phone: "+91 98333 44556",
    location: "Hyderabad, TS",
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
    summary: "High-performing Computer Science graduate with strong algorithms, backend systems, and competitive coding background. Winner of national coding hackathons and active open-source contributor.",
    skills: ["Python & C++", "Data Structures & Algos", "SQL & DBMS", "React & Node.js", "Git & Github", "AWS Cloud Foundation", "Linux Shell Scripting"],
    education: [
      { institution: "BITS Pilani", degree: "B.E. Computer Science", years: "2020 – 2024" },
      { institution: "DPS Indiranagar, Bengaluru", degree: "CBSE Class XII - 97.8%", years: "2018 – 2020" },
      { institution: "Bishop Cotton Boys School", degree: "ICSE Class X - 96.4%", years: "2016 – 2018" }
    ],
    experience: [
      { 
        company: "Amazon India", 
        role: "SDE Intern", 
        years: "2023 – 2024", 
        bullets: [
          "Built automated catalog validation tool saving 40 SDE hours weekly.",
          "Integrated security scanners checking 1,000 product packages/sec.",
          "Wrote automated unit tests achieving 94% overall code coverage."
        ] 
      },
      {
        company: "HackerEarth India",
        role: "Campus Coding Lead",
        years: "2022 – 2023",
        bullets: [
          "Organized 4 university hackathons with 1,200+ active participants.",
          "Created programming challenge questions for campus competitive hackathons."
        ]
      }
    ],
    projects: [
      { 
        title: "Peer-to-Peer Code Review Portal", 
        tech: "React, Node.js, Socket.io", 
        description: "Real-time collaborative code editor used by 500+ university students.",
        bullets: [
          "Developed synchronous text editor sync using CRDT algorithm.",
          "Configured automated code execution environment using Docker containers."
        ]
      },
      {
        title: "Smart Dorm Automation System",
        tech: "ESP32, Python, MQTT",
        description: "IoT student dorm device automated access control saving energy bills.",
        bullets: [
          "Implemented secure Bluetooth login triggers reducing card tap times.",
          "Configured sensor dashboards sending telemetry stats via MQTT."
        ]
      }
    ],
    certifications: ["AWS Certified Cloud Practitioner", "HackerRank Problem Solving Gold", "Google TensorFlow Developer"],
    achievements: ["ACM ICPC Regional Rank 12", "Smart India Hackathon Winner 2022", "KVPY Fellow Rank 23"],
  },
  photo_corporate: {
    name: "Aditya Reddy",
    title: "Corporate Finance & Strategy Lead",
    email: "aditya.reddy@finance.in",
    phone: "+91 98444 55667",
    location: "Mumbai, MH",
    photoUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80",
    summary: "Corporate Finance Specialist managing investment portfolio strategy, corporate valuation, and financial risk assessment for enterprise banking. Expert in financial modeling and M&A analytics.",
    skills: ["Financial Modeling", "Corporate Valuation", "M&A Analytics", "Bloomberg Terminal", "Excel Macros", "Investment Portfolio Management"],
    education: [
      { institution: "IIM Ahmedabad", degree: "MBA Finance", years: "2017 – 2019" },
      { institution: "IIT Madras", degree: "B.Tech Civil Engineering", years: "2013 – 2017" },
      { institution: "Loyola School, Jamshedpur", degree: "ISC Board - 96.8%", years: "2011 – 2013" }
    ],
    experience: [
      { 
        company: "Goldman Sachs India", 
        role: "Senior Financial Analyst", 
        years: "2020 – Present", 
        bullets: [
          "Executed ₹500 Cr M&A advisory transactions in India tech sectors.",
          "Built financial valuation models for 12+ consumer startups raising Series B.",
          "Presented strategic recommendations and pitchbooks to executive board members."
        ] 
      },
      {
        company: "ICICI Bank Corporate Group",
        role: "Strategy Associate",
        years: "2019 – 2020",
        bullets: [
          "Analyzed infrastructure loan portfolios valued above ₹2,000 Crores.",
          "Prepared quarterly risk assessment reports for bank directors."
        ]
      }
    ],
    projects: [
      { 
        title: "Automated Credit Risk Scoring Engine", 
        tech: "Python, Financial Models", 
        description: "Reduced loan default risk evaluation turnaround from 3 days to 4 hours.",
        bullets: [
          "Implemented quantitative risk scoring using historical merchant credit profiles.",
          "Optimized macro models with multi-variable market sensitivity analysis."
        ]
      },
      {
        title: "Fintech Venture Capital Research",
        tech: "Excel, Bloomberg API",
        description: "Strategic diligence report on Indian neo-banking sector investment trends.",
        bullets: [
          "Assessed competitive market indexes across 14 top financial companies.",
          "Authored report utilized by investment committee for capital allocation."
        ]
      }
    ],
    certifications: ["CFA Charterholder Level 3 Passed", "Bloomberg Certified Expert", "Financial Risk Manager (FRM) Certified"],
    achievements: ["Goldman Sachs Leadership Award", "IIM Gold Medalist for Strategy", "IIT Madras Academic Merit Award"],
  },
  photo_creative_tech: {
    name: "Kavya Iyer",
    title: "Full Stack Product Engineer",
    email: "kavya.iyer@creative.in",
    phone: "+91 98555 66778",
    location: "Bengaluru, KA",
    photoUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80",
    summary: "Product Engineer combining modern WebGL creative frontend animations with scalable GraphQL microservices, real-time databases, and interactive design systems.",
    skills: ["React & Three.js", "TypeScript & Node.js", "GraphQL & Prisma", "Tailwind CSS", "PostgreSQL & Redis", "WebGL & GSAP", "Docker & CI/CD"],
    education: [
      { institution: "IIIT Hyderabad", degree: "B.Tech Computer Science", years: "2016 – 2020" },
      { institution: "PSBB Chennai", degree: "CBSE Class XII - 96.5%", years: "2014 – 2016" },
      { institution: "Chinmaya Vidyalaya", degree: "CBSE Class X - 10 CGPA", years: "2012 – 2014" }
    ],
    experience: [
      { 
        company: "CRED Tech", 
        role: "Senior Frontend Engineer", 
        years: "2021 – Present", 
        bullets: [
          "Built interactive 3D payment success animations inside core consumer app.",
          "Optimized web vitals score to 98/100 globally across all CRED web services.",
          "Implemented accessible UI components conforming strictly to WCAG guidelines."
        ] 
      },
      {
        company: "InMobi Ads",
        role: "Software Developer",
        years: "2020 – 2021",
        bullets: [
          "Created modular interactive ad builder dashboard utilized by 50+ enterprise clients.",
          "Reduced ad canvas load times by 40% using optimized Webpack bundle codes."
        ]
      }
    ],
    projects: [
      { 
        title: "3D Interactive Design Studio", 
        tech: "Three.js, React, WebGL", 
        description: "Browser-based 3D model editor processing 50k monthly interactive sessions.",
        bullets: [
          "Optimized polygon mesh rendering reducing browser memory usage by 55%.",
          "Built export wrappers supports for standard obj, gltf, and fbx file coordinates."
        ]
      },
      {
        title: "Collaborative Whiteboard Canvas",
        tech: "React, Socket.io, Node.js",
        description: "Real-time collaborative diagramming portal for virtual design workshops.",
        bullets: [
          "Engineered vector canvas operations syncing in under 15ms via WebSockets.",
          "Designed canvas snapshots backend auto-saved to secure AWS S3 buckets."
        ]
      }
    ],
    certifications: ["Meta Certified Front-End Developer", "Three.js Journey Graduate", "Certified ScrumMaster"],
    achievements: ["CRED Hackathon Champion 2023", "IIIT Hyderabad Best Thesis Award", "Top Ranker National Coding League"],
  },
  photo_academic: {
    name: "Vikram Sengupta",
    title: "AI Research Assistant",
    email: "vikram.s@academic.in",
    phone: "+91 98666 77889",
    location: "Kolkata, WB",
    photoUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80",
    summary: "Academic AI researcher publishing papers in deep learning, neural speech synthesis, and low-resource NLP speech systems for regional languages.",
    skills: ["PyTorch & TensorFlow", "NLP & Transformers", "Python & CUDA", "LaTeX Scientific Papers", "Linux & Git", "HuggingFace Hub"],
    education: [
      { institution: "IIT Kharagpur", degree: "M.Tech AI & Data Science", years: "2018 – 2020" },
      { institution: "Jadavpur University", degree: "B.E. Electronics Engineering", years: "2014 – 2018" }
    ],
    experience: [
      { 
        company: "IISc Research R&D", 
        role: "Research Associate", 
        years: "2020 – Present", 
        bullets: [
          "Published 4 peer-reviewed papers in prestigious IEEE and NeurIPS conferences.",
          "Trained multilingual transformer speech synthesis models for regional dialects.",
          "Secured research funding grants valued at ₹25 Lakhs from Science Research Board."
        ] 
      }
    ],
    projects: [
      { 
        title: "Indic Natural Speech Synthesizer", 
        tech: "PyTorch, CUDA", 
        description: "Neural speech model generating natural audio across 8 Indian regional languages.",
        bullets: [
          "Achieved state-of-the-art mean opinion scores in speech naturalness.",
          "Released open-source dataset containing 200 hours of clean audio samples."
        ]
      }
    ],
    certifications: ["DeepLearning.AI AI Specialist", "NVIDIA CUDA Optimization Program"],
    achievements: ["Prime Minister's Research Fellow", "Jadavpur University Gold Medalist", "Best Poster Award IEEE SPS"],
  },
  photo_split_hero: {
    name: "Neha Kulkarni",
    title: "Cybersecurity & DevSecOps Lead",
    email: "neha.k@security.in",
    phone: "+91 98777 88990",
    location: "Gurgaon, HR",
    photoUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80",
    summary: "DevSecOps Lead specializing in cloud security automation, automated penetration testing, and zero-trust identity access management.",
    skills: ["AWS Security & IAM", "Penetration Testing", "Docker Security", "Python & Bash Scripts", "SIEM & Splunk", "Trivy & SonarQube"],
    education: [
      { institution: "DTU Delhi", degree: "B.Tech Information Technology", years: "2016 – 2020" },
      { institution: "Delhi Public School, Rohini", degree: "CBSE Class XII - 95.8%", years: "2014 – 2016" }
    ],
    experience: [
      { 
        company: "Razorpay Financials", 
        role: "Senior Security Specialist", 
        years: "2021 – Present", 
        bullets: [
          "Conducted penetration testing across 50+ microservices resolving vulnerabilities.",
          "Automated CI/CD security scanning using Trivy, stopping unverified container builds.",
          "Fixed critical security vulnerabilities in payment gateway adapter layers."
        ] 
      },
      {
        company: "Wipro CyberSentry",
        role: "Security Analyst",
        years: "2020 – 2021",
        bullets: [
          "Monitored threat intelligence feeds for financial enterprise clients.",
          "Investigated 150+ automated network incident alerts weekly."
        ]
      }
    ],
    projects: [
      { 
        title: "Zero-Trust API Gateway Shield", 
        tech: "Python, Docker, OAuth2", 
        description: "Protected financial endpoints against high-rate DDoS and OWASP threats.",
        bullets: [
          "Developed rate limiter middleware reducing malicious spikes by 99.8%.",
          "Configured secure OAuth2 client credential authorizations."
        ]
      }
    ],
    certifications: ["CISSP Certified Specialist", "CEH Master", "AWS Certified Security Specialty"],
    achievements: ["Top Bug Bounty Hall of Fame 2022", "DTU Technical Merit Award", "NASSCOM Cyber Security Champion"],
  },
  photo_clean_vertical: {
    name: "Siddharth Gupta",
    title: "Embedded Hardware & Firmware Engineer",
    email: "siddharth.g@firmware.in",
    phone: "+91 98888 99001",
    location: "Bengaluru, KA",
    photoUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80",
    summary: "Embedded Firmware Engineer writing real-time micro-controller C/C++ drivers, RTOS kernels, and automotive CAN bus communication systems.",
    skills: ["Embedded C/C++", "FreeRTOS & ESP32", "STM32 & ARM Cortex", "CAN Bus & MQTT", "Altium Designer", "Logic Analyzers"],
    education: [
      { institution: "BITS Pilani, Goa", degree: "B.E. Electronics", years: "2016 – 2020" },
      { institution: "St. Paul's School, Goa", degree: "Class XII Science - 95.2%", years: "2014 – 2016" }
    ],
    experience: [
      { 
        company: "Ather Energy", 
        role: "Senior Firmware Engineer", 
        years: "2021 – Present", 
        bullets: [
          "Developed Battery Management System (BMS) cell firmware for Ather 450X.",
          "Optimized FreeRTOS task schedules reducing idle power drain by 22%.",
          "Designed safety diagnostic alert triggers for thermal battery packs."
        ] 
      },
      {
        company: "Bosch Engineering",
        role: "Firmware Developer",
        years: "2020 – 2021",
        bullets: [
          "Wrote low-level C device drivers for automotive infotainment systems.",
          "Conformed firmware code structures to MISRA-C compliance rules."
        ]
      }
    ],
    projects: [
      { 
        title: "Smart EV Battery Telemetry Unit", 
        tech: "ESP32, FreeRTOS, C++", 
        description: "Real-time cellular IoT device sending BMS metrics to AWS cloud.",
        bullets: [
          "Configured secure TLS certificate handshakes inside IoT firmware.",
          "Reduced telemetry data buffers using custom run-length encoding."
        ]
      }
    ],
    certifications: ["ARM Accredited Engineer", "RTOS Architecture Specialist", "Altium Design Certification"],
    achievements: ["Ather Hardware Innovation Award", "BITS Pilani Project Merit Fellowship", "National Olympiad in Physics State Top 5"],
  },
  photo_personal_brand: {
    name: "Meera Joshi",
    title: "Brand Designer & UI Strategist",
    email: "meera.j@branding.in",
    phone: "+91 98999 00112",
    location: "Mumbai, MH",
    photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80",
    summary: "Brand Strategist crafting personal identities, executive portfolios, and visual media design guidelines for startup founders.",
    skills: ["Brand Strategy & Identity", "Figma & Illustrator", "Visual Storytelling", "Copywriting", "Art Direction", "Typography"],
    education: [
      { institution: "NID Ahmedabad", degree: "B.Des Graphic Design", years: "2015 – 2019" },
      { institution: "La Martiniere, Kolkata", degree: "ISC Board - 93.4%", years: "2013 – 2015" }
    ],
    experience: [
      { 
        company: "Ogilvy India", 
        role: "Lead Brand Strategist", 
        years: "2020 – Present", 
        bullets: [
          "Led digital rebranding for top D2C consumer startup.",
          "Created brand guidelines adopted across marketing teams.",
          "Won awards for visual identity campaign designs."
        ] 
      },
      {
        company: "Dentsu Webchutney",
        role: "Senior Graphic Designer",
        years: "2019 – 2020",
        bullets: [
          "Conceptualized social media campaigns generating 1.5M views.",
          "Designed logo marks, icons, and layout spreads."
        ]
      }
    ],
    projects: [
      { 
        title: "D2C Brand Identity Overhaul", 
        tech: "Figma, Illustrator", 
        description: "Unified brand aesthetics and increased web store conversions by 40%.",
        bullets: [
          "Recreated full visual design asset system including typography tokens.",
          "Conducted targeted visual branding interviews with 200+ consumers."
        ]
      }
    ],
    certifications: ["Adobe Certified Expert", "Brand Strategy Bootcamp Graduate"],
    achievements: ["Kyoorius Design Gold Winner 2022", "Ogilvy Campaign of the Month", "Creative Focus Talent Scholarship"],
  },
  photo_premium_identity: {
    name: "Rahul Deshmukh",
    title: "Senior Engineering Manager",
    email: "rahul.d@manager.in",
    phone: "+91 99000 11223",
    location: "Pune, MH",
    photoUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&auto=format&fit=crop&q=80",
    summary: "Engineering Manager leading 25+ developers, cloud infrastructure, and enterprise agile Scrum delivery across banking systems.",
    skills: ["Engineering Management", "Agile & Scrum Delivery", "System Architecture", "Team Mentorship", "AWS Cloud Systems", "Budgeting & Hiring"],
    education: [
      { institution: "VJTI Mumbai", degree: "B.Tech Computer Engineering", years: "2011 – 2015" },
      { institution: "Ruparel College, Mumbai", degree: "HSC Board - 94.6%", years: "2009 – 2011" }
    ],
    experience: [
      { 
        company: "Barclays Technology", 
        role: "Engineering Manager", 
        years: "2019 – Present", 
        bullets: [
          "Managed 3 engineering squads building retail payments core systems.",
          "Reduced production bug rates by 45% through robust CI/CD pipelines.",
          "Delivered high-value security updates on schedule under tight timelines."
        ] 
      },
      {
        company: "Cognizant India",
        role: "Senior Lead Architect",
        years: "2015 – 2019",
        bullets: [
          "Led development of cloud hosting adapters for banking clients.",
          "Supervised a technical migration team of 8 senior developers."
        ]
      }
    ],
    projects: [
      { 
        title: "Enterprise Payments Core", 
        tech: "Java, AWS", 
        description: "High-volume banking core servicing 5M daily merchant credit card transactions.",
        bullets: [
          "Designed database failover logic achieving sub-second sync backups.",
          "Optimized credit verification pipelines reducing request latency by 60%."
        ]
      }
    ],
    certifications: ["Certified Scrum Master", "AWS Solutions Architect Professional", "ITIL Foundation Certified"],
    achievements: ["Barclays Leadership Fellow", "Cognizant Technical Star Award", "VJTI Class Valedictorian"],
  },
  photo_executive_board: {
    name: "Karan Malhotra",
    title: "Executive Vice President",
    email: "karan.m@board.in",
    phone: "+91 99111 22334",
    location: "Mumbai, MH",
    photoUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80",
    summary: "Senior Business Executive managing ₹500 Cr annual revenue operations and corporate growth strategy across conglomerate sectors.",
    skills: ["P&L Management", "Strategic Growth", "Board Governance", "M&A Advisory", "Global Logistics", "Enterprise Finance"],
    education: [
      { institution: "IIM Calcutta", degree: "MBA Executive", years: "2012 – 2014" },
      { institution: "IIT Kharagpur", degree: "B.Tech Mechanical Engineering", years: "2008 – 2012" }
    ],
    experience: [
      { 
        company: "Reliance Industries", 
        role: "VP Strategy", 
        years: "2018 – Present", 
        bullets: [
          "Drove operational efficiency saving ₹45 Crores annually.",
          "Led strategic market expansion into 15 new regions across India.",
          "Secured executive board approvals for logistics operations strategy."
        ] 
      },
      {
        company: "Tata Group Strategic Office",
        role: "Senior Manager Strategy",
        years: "2014 – 2018",
        bullets: [
          "Conducted market sizing and feasibility analysis for clean energy investments.",
          "Facilitated key joint venture collaborations with global automotive partners."
        ]
      }
    ],
    projects: [
      { 
        title: "Retail Logistics Transformation", 
        tech: "SAP S/4HANA", 
        description: "Streamlined supply chain logistics across 2,000 retail store networks.",
        bullets: [
          "Reduced warehouse processing turnarounds by 28% utilizing real-time tracking.",
          "Integrated predictive ordering modules optimizing inventory stock balances."
        ]
      }
    ],
    certifications: ["Corporate Governance Certified", "Six Sigma Black Belt", "SAP Certified Logistics Consultant"],
    achievements: ["ET Business Leader 2023", "Reliance President's Award", "IIM Calcutta Alumni Merit Star"],
  },
  photo_magazine_cover: {
    name: "Diya Kapoor",
    title: "Fashion & Media Creative Lead",
    email: "diya.k@media.in",
    phone: "+91 99222 33445",
    location: "Delhi NCR",
    photoUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&auto=format&fit=crop&q=80",
    summary: "Creative Lead producing editorial fashion campaigns, magazine typography, and brand media layouts for print and web.",
    skills: ["Editorial Typography", "Art Direction", "Adobe InDesign & Photoshop", "Media Production", "Fashion Styling", "Copywriting"],
    education: [
      { institution: "NIFT Delhi", degree: "B.Des Fashion Communication", years: "2016 – 2020" },
      { institution: "Stephens College, Delhi", degree: "B.A. English Honors", years: "2013 – 2016" }
    ],
    experience: [
      { 
        company: "Vogue India", 
        role: "Senior Art Lead", 
        years: "2021 – Present", 
        bullets: [
          "Directed cover shoot design for 12 monthly magazine issues.",
          "Managed digital marketing creative assets for social media.",
          "Curated visual content for brand launches and luxury client events."
        ] 
      },
      {
        company: "Elle India",
        role: "Associate Art Director",
        years: "2020 – 2021",
        bullets: [
          "Designed editorial pages, layouts, and typography grids.",
          "Managed vendor relations for monthly print publication cycles."
        ]
      }
    ],
    projects: [
      { 
        title: "Digital Magazine Interactive Edition", 
        tech: "Adobe InDesign, WebGL", 
        description: "Created interactive digital edition generating 1.2M online readers.",
        bullets: [
          "Integrated rich video embeds and audio cues within layouts.",
          "Improved tablet page load performance by 35% through asset optimization."
        ]
      }
    ],
    certifications: ["Adobe Certified Expert", "UX Design Bootcamp Certificate"],
    achievements: ["Vogue Excellence Award 2022", "NIFT Graduation Gold Award", "Top Creative Contributor India Fashion Week"],
  },
  photo_designer_portfolio: {
    name: "Sneha Choudhury",
    title: "Senior Product Designer",
    email: "sneha.c@portfolio.in",
    phone: "+91 99333 44556",
    location: "Bengaluru, KA",
    photoUrl: "https://images.unsplash.com/photo-1548142813-c348350df52b?w=200&auto=format&fit=crop&q=80",
    summary: "Product Designer crafting intuitive SaaS interfaces, developer workspaces, Behance portfolios, and Figma design systems.",
    skills: ["Figma & Design Systems", "UX Research", "Prototyping", "HTML/CSS", "Wireframing", "Webflow Development"],
    education: [
      { institution: "NID Bengaluru", degree: "B.Des Digital Media", years: "2016 – 2020" },
      { institution: "Baldwin Girls School, Bengaluru", degree: "ISC Board - 94.8%", years: "2014 – 2016" }
    ],
    experience: [
      { 
        company: "Postman Tech", 
        role: "Senior Product Designer", 
        years: "2021 – Present", 
        bullets: [
          "Designed API documentation workspace interface used by millions of developers.",
          "Improved user onboarding completion by 28% through step-by-step tooltip widgets.",
          "Conducted user research sessions globally and constructed user journey personas."
        ] 
      },
      {
        company: "Flipkart Design",
        role: "UX Designer",
        years: "2020 – 2021",
        bullets: [
          "Designed interface layouts for regional language grocery onboarding.",
          "Analyzed heatmaps identifying user friction points on product checkouts."
        ]
      }
    ],
    projects: [
      { 
        title: "Developer API Canvas Workspace", 
        tech: "Figma, React", 
        description: "Workspace UI utilized by 10M+ software engineers globally.",
        bullets: [
          "Designed drag-and-drop node canvas interface mapping backend APIs.",
          "Conducted usability verification tests with 200+ core developers."
        ]
      }
    ],
    certifications: ["Nielsen Norman UX Master", "Google UX Design Professional Certificate"],
    achievements: ["Behance Featured Portfolio 2023", "NID Design Fellow Award", "Postman Star Design Award"],
  },
  photo_identity_card: {
    name: "Varun Saxena",
    title: "Chief Information Security Officer",
    email: "varun.s@ciso.in",
    phone: "+91 99444 55667",
    location: "Hyderabad, TS",
    photoUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80",
    summary: "CISO managing enterprise cybersecurity infrastructure, security operations center (SOC), and cloud compliance frameworks.",
    skills: ["Enterprise Cyber Security", "SOC Operations", "ISO 27001", "Threat Mitigation", "IAM & Cloud Security", "Penetration Testing"],
    education: [
      { institution: "IIT Hyderabad", degree: "M.Tech Cybersecurity", years: "2013 – 2015" },
      { institution: "NIT Warangal", degree: "B.Tech Computer Science", years: "2009 – 2013" }
    ],
    experience: [
      { 
        company: "Infosys Security", 
        role: "CISO Advisory Lead", 
        years: "2019 – Present", 
        bullets: [
          "Protected cloud infrastructure across 100+ enterprise clients globally.",
          "Achieved ISO 27001 audit compliance with zero minor non-conformities.",
          "Conducted incident response threat mitigation drills for 500+ employees."
        ] 
      },
      {
        company: "Wipro Cybersecurity",
        role: "Lead Security Architect",
        years: "2015 – 2019",
        bullets: [
          "Designed security firewalls and identity access gates for MNC banking clients.",
          "Conducted system vulnerability checks identifying 34 critical security bugs."
        ]
      }
    ],
    projects: [
      { 
        title: "Global SOC Alert Triage Engine", 
        tech: "Python, SIEM", 
        description: "Automated cyber threat triage reducing response time by 80%.",
        bullets: [
          "Integrated AI threat parser prioritizing critical alerts.",
          "Configured secure automated slack warnings to trigger SOC response."
        ]
      }
    ],
    certifications: ["CISM & CISSP Certified", "CompTIA Security+ Certified"],
    achievements: ["CISO Leader Award 2023", "Infosys Technical Fellow", "NIT Warangal Academic Star"],
  },
  photo_startup_founder: {
    name: "Pooja Sundaram",
    title: "Founder & Product Officer",
    email: "pooja.s@startup.in",
    phone: "+91 99555 66778",
    location: "Bengaluru, KA",
    photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
    summary: "Tech Founder building AI consumer products, raising venture seed funding, and managing YC startup growth strategies.",
    skills: ["Product Strategy", "Seed Fundraising", "AI Product Development", "Growth Funnels", "Technical Leadership", "Agile Roadmap"],
    education: [
      { institution: "IIT Madras", degree: "B.Tech Computer Science", years: "2015 – 2019" },
      { institution: "KV IIT Madras, Chennai", degree: "CBSE Class XII - 96.8%", years: "2013 – 2015" }
    ],
    experience: [
      { 
        company: "Krutrim AI (YC W22)", 
        role: "Co-Founder & CEO", 
        years: "2021 – Present", 
        bullets: [
          "Built Indic LLM app serving 500k active monthly users globally.",
          "Raised $2.5M seed funding from top VC funds in India and Silicon Valley.",
          "Managed team of 15 SDEs and ML researchers on product execution."
        ] 
      },
      {
        company: "InMobi Tech",
        role: "Product SDE II",
        years: "2019 – 2021",
        bullets: [
          "Developed target personalization algorithms raising publisher revenue by 18%.",
          "Engineered ad rendering pipelines scaling to 15k requests/sec."
        ]
      }
    ],
    projects: [
      { 
        title: "Multilingual Indic AI Assistant", 
        tech: "Python, PyTorch", 
        description: "Consumer AI voice assistant processing 1M daily conversations.",
        bullets: [
          "Fine-tuned transformer models supporting speech inputs in 6 Indian languages.",
          "Reduced inference resource footprints by 45% using model pruning."
        ]
      }
    ],
    certifications: ["Y Combinator Founder W22", "DeepLearning.AI NLP Graduate"],
    achievements: ["Forbes 30 Under 30 Asia", "IIT Madras Entrepreneurship Fellow", "National Talent Search Scholar"],
  },
  photo_newspaper_editorial: {
    name: "Ritu Bhattacharya",
    title: "Senior Technology Editor",
    email: "ritu.b@editorial.in",
    phone: "+91 99666 77889",
    location: "Kolkata, WB",
    photoUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80",
    summary: "Technology Journalist and Editorial Lead publishing investigative tech journalism, business profiles, and reports.",
    skills: ["Tech Journalism", "Editorial Writing", "Media Strategy", "Investigative Research", "Copyediting", "SEO Strategy"],
    education: [
      { institution: "St. Xavier's College", degree: "B.A. Mass Communication", years: "2014 – 2017" },
      { institution: "Loreto House, Kolkata", degree: "Class XII Humanities - 94.6%", years: "2012 – 2014" }
    ],
    experience: [
      { 
        company: "The Economic Times", 
        role: "Senior Tech Editor", 
        years: "2020 – Present", 
        bullets: [
          "Published 150+ investigative tech startup stories and company profiles.",
          "Managed weekly technology editorial column read by 500k+ subscribers.",
          "Conducted interviews with top tech startup CEOs and global venture capital leads."
        ] 
      },
      {
        company: "MediaNama India",
        role: "Lead Tech Reporter",
        years: "2017 – 2020",
        bullets: [
          "Covered Indian digital policy, cybersecurity regulations, and telecom news.",
          "Authored investigative reports on mobile payment gateway standards."
        ]
      }
    ],
    projects: [
      { 
        title: "Indian Startup Ecosystem Report", 
        tech: "Data Analytics, Journalism", 
        description: "Comprehensive report cited by top VC investors and media platforms.",
        bullets: [
          "Analyzed funding rounds of 200+ startup companies from 2020 to 2023.",
          "Created interactive charts and summaries highlighting target sector growths."
        ]
      }
    ],
    certifications: ["Ramnath Goenka Excellence in Journalism", "SEO Content Strategy Certification"],
    achievements: ["Press Club Award 2022", "St. Xavier's Valedictorian Award", "Kolkata Young Media Fellow"],
  },
  photo_profile_dashboard: {
    name: "Tarun Nambiar",
    title: "UI/UX & Product Dashboard Engineer",
    email: "tarun.n@dashboard.in",
    phone: "+91 99777 88990",
    location: "Kochi, KL",
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
    summary: "Dashboard Engineer specializing in real-time web UI analytics portals, data visualization, and micro-frontends.",
    skills: ["React & Next.js", "D3.js & Recharts", "TypeScript & Tailwind", "Dashboard UI", "Webpack & Micro-frontends", "Node.js API"],
    education: [
      { institution: "NIT Calicut", degree: "B.Tech Computer Science", years: "2016 – 2020" },
      { institution: "Chinmaya Vidyalaya, Kochi", degree: "Class XII Science - 95.8%", years: "2014 – 2016" }
    ],
    experience: [
      { 
        company: "Freshworks Inc", 
        role: "Senior UI Engineer", 
        years: "2021 – Present", 
        bullets: [
          "Built customer support analytics dashboard used by 60k businesses globally.",
          "Reduced chart rendering lag by 60% through custom canvas implementations.",
          "Coordinated front-end sprint delivery cycles and technical code reviews."
        ] 
      },
      {
        company: "TCS Innovation Labs",
        role: "UI Developer",
        years: "2020 – 2021",
        bullets: [
          "Developed web UI dashboards for global manufacturing clients.",
          "Optimized page responsiveness reducing initial image load by 30%."
        ]
      }
    ],
    projects: [
      { 
        title: "Real-Time Telemetry Dashboard", 
        tech: "React, D3.js, WebSockets", 
        description: "Live monitoring console processing 10k telemetry data points per second.",
        bullets: [
          "Designed dynamic charts plotting system load metrics with sub-second lag.",
          "Configured WebSocket reconnection adapters preventing telemetry gaps."
        ]
      }
    ],
    certifications: ["Meta Certified Front-End Developer", "D3.js Visualization Specialist"],
    achievements: ["Freshworks Hackathon Winner", "NIT Calicut Innovation Fellow", "Top Performer TCS Group"],
  },
  photo_european_cv: {
    name: "Ishita Chatterjee",
    title: "Global Software Architect",
    email: "ishita.c@global.in",
    phone: "+91 99888 99001",
    location: "Berlin / Bengaluru",
    photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
    summary: "Global Software Engineer matching European hiring standards, building cross-border cloud platforms and ERP integrations.",
    skills: ["Java, Go & Python", "Europass CV Standards", "Cloud Architecture", "Multilingual (English, German)", "Docker & Kubernetes", "SAP BTP"],
    education: [
      { institution: "TU Munich / IIT Madras", degree: "M.Sc Computer Science", years: "2017 – 2019" },
      { institution: "La Martiniere, Kolkata", degree: "ICSE & ISC Board - 96.2%", years: "2011 – 2017" }
    ],
    experience: [
      { 
        company: "SAP SE Germany", 
        role: "Senior Cloud Architect", 
        years: "2020 – Present", 
        bullets: [
          "Architected SAP BTP cloud microservices for global digital supply chains.",
          "Led cross-border engineering teams across Germany, India, and USA.",
          "Designed high-security authorization connectors complying with EU GDPR rules."
        ] 
      },
      {
        company: "Siemens R&D Bengaluru",
        role: "Software Developer",
        years: "2019 – 2020",
        bullets: [
          "Developed web microservices for industrial automation control panels.",
          "Improved backend request latency by 25% using Go implementation."
        ]
      }
    ],
    projects: [
      { 
        title: "Global ERP Data Connector", 
        tech: "Go, Kubernetes, SAP BTP", 
        description: "Enterprise data bridge connecting European & Asian cloud databases.",
        bullets: [
          "Configured secure TLS certificate channels passing strict security clearances.",
          "Designed database adapters syncing 500k ERP records daily."
        ]
      }
    ],
    certifications: ["SAP Certified Cloud Architect", "Go Programming Language Certified", "German Language Level B2"],
    achievements: ["SAP European Tech Fellow", "DAAD Scholarship Winner", "IIT Madras Academic Honor"],
  },
  photo_consulting_profile: {
    name: "Aditi Mukherjee",
    title: "Senior Management Consultant",
    email: "aditi.m@consulting.in",
    phone: "+91 99999 00112",
    location: "Mumbai, MH",
    photoUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80",
    summary: "Strategy Consultant advising Fortune 500 executives on digital transformation, operational efficiency, and market entry strategies.",
    skills: ["Strategy Consulting", "Digital Transformation", "Financial Valuation", "Executive Presentations", "P&L Optimization", "Market Diligence"],
    education: [
      { institution: "IIM Bangalore", degree: "MBA Strategy", years: "2017 – 2019" },
      { institution: "St. Xavier's College, Mumbai", degree: "B.A. Economics Honors", years: "2014 – 2017" }
    ],
    experience: [
      { 
        company: "McKinsey & Company", 
        role: "Engagement Manager", 
        years: "2020 – Present", 
        bullets: [
          "Advised CXOs of top 5 Indian private banks on digital banking strategy and roadmaps.",
          "Led team of 6 management consultants on digital transformation client projects.",
          "Delivered operating model designs reducing overheads by 18%."
        ] 
      },
      {
        company: "KPMG Advisory India",
        role: "Consultant Strategy",
        years: "2019 – 2020",
        bullets: [
          "Assessed market entry feasibility for global automotive companies in India.",
          "Created client pitch decks and financial analysis worksheets."
        ]
      }
    ],
    projects: [
      { 
        title: "Private Bank Digital Strategy", 
        tech: "McKinsey Benchmarking", 
        description: "Created digital roadmap increasing retail banking revenues by ₹120 Crores.",
        bullets: [
          "Led research on digital onboarding adoption across 10 metro cities.",
          "Formulated mobile app redesign strategy yielding 35% user growth."
        ]
      }
    ],
    certifications: ["McKinsey Certified Engagement Lead", "Certified Financial Analyst Level 1"],
    achievements: ["IIM Bangalore Gold Medalist", "St. Xavier's College Economics Rank 1", "National Case Study Winner"],
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

    const sectionCount = tmpl.sectionOrder.length;
    // Dynamically set spacing: fewer sections get larger spacing gaps to distribute layout beautifully
    const listGap = sectionCount <= 5 ? "space-y-4" : (sectionCount === 6 ? "space-y-3" : "space-y-2.5");

    // ── Helper to render a section block with clean, un-overflowed typography ──
    const renderSectionBlock = (secKey: string, secLabel: string) => {
      // Calibrate bounds dynamically based on section count to prevent bottom overflow
      let expLimit = 2;
      let bulletLimit = 2;
      let projLimit = 2;
      let certLimit = 2;
      let achLimit = 2;

      if (sectionCount >= 7) {
        // High density: reduce bullets to 1 to fit A4 frame perfectly
        bulletLimit = 1;
      } else if (sectionCount <= 5) {
        // Fewer sections: keep a solid balance
        expLimit = 2;
        bulletLimit = 2;
        projLimit = 2;
      }

    if (secKey === "summary" && p.summary) {
      return (
        <div key={secKey} className="space-y-0.5 text-left">
          <h3 className="text-[7px] font-extrabold uppercase tracking-wider border-b border-zinc-200 pb-0.5" style={{ color: accent }}>{secLabel}</h3>
          <p className="text-[5.5px] text-zinc-600 leading-snug">{p.summary}</p>
        </div>
      );
    }

    if (secKey === "skills" && p.skills?.length) {
      if (tmpl.id === "skills_first" || tmpl.id === "developer_portfolio" || tmpl.id === "photo_creative_tech" || tmpl.id === "photo_academic" || tmpl.id === "tech_spec") {
        const mid = Math.ceil(p.skills.length / 2);
        const group1 = p.skills.slice(0, mid);
        const group2 = p.skills.slice(mid);
        return (
          <div key={secKey} className="space-y-0.5 text-left">
            <h3 className="text-[7px] font-extrabold uppercase tracking-wider border-b border-zinc-200 pb-0.5" style={{ color: accent }}>{secLabel}</h3>
            <div className="space-y-0.5 text-[5.5px]">
              <div className="truncate">
                <span className="font-bold text-zinc-900">Core Stack: </span>
                <span className="text-zinc-600">{group1.join(", ")}</span>
              </div>
              {group2.length > 0 && (
                <div className="truncate">
                  <span className="font-bold text-zinc-900">Tools &amp; Libraries: </span>
                  <span className="text-zinc-600">{group2.join(", ")}</span>
                </div>
              )}
            </div>
          </div>
        );
      }

      if (tmpl.id === "recruiter_scan" || tmpl.id === "photo_side_panel" || tmpl.id === "impact_focused" || tmpl.id === "timeline_prof") {
        return (
          <div key={secKey} className="space-y-0.5 text-left">
            <h3 className="text-[7px] font-extrabold uppercase tracking-wider border-b border-zinc-200 pb-0.5" style={{ color: accent }}>{secLabel}</h3>
            <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[5.5px] text-zinc-700">
              {p.skills.map((sk, idx) => (
                <span key={idx} className="truncate">• {sk}</span>
              ))}
            </div>
          </div>
        );
      }

      return (
        <div key={secKey} className="space-y-0.5 text-left">
          <h3 className="text-[7px] font-extrabold uppercase tracking-wider border-b border-zinc-200 pb-0.5" style={{ color: accent }}>{secLabel}</h3>
          <p className="text-[5.5px] text-zinc-800 font-medium leading-tight whitespace-normal break-words">
            {p.skills.join(" • ")}
          </p>
        </div>
      );
    }

    if (secKey === "education" && p.education?.length) {
      return (
        <div key={secKey} className="space-y-0.5 text-left">
          <h3 className="text-[7px] font-extrabold uppercase tracking-wider border-b border-zinc-200 pb-0.5" style={{ color: accent }}>{secLabel}</h3>
          {p.education.slice(0, expLimit).map((ed, idx) => (
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
        <div key={secKey} className="space-y-1 text-left">
          <h3 className="text-[7px] font-extrabold uppercase tracking-wider border-b border-zinc-200 pb-0.5" style={{ color: accent }}>{secLabel}</h3>
          {p.experience.slice(0, expLimit).map((exp, idx) => (
            <div key={idx} className="space-y-0.5">
              <div className="flex items-center justify-between text-[5.5px] font-bold text-zinc-900">
                <span className="truncate">{exp.role} — {exp.company}</span>
                <span className="text-[5px] text-zinc-500 shrink-0 ml-1">{exp.years}</span>
              </div>
              {exp.bullets.slice(0, bulletLimit).map((b, bi) => (
                <p key={bi} className="text-[5px] text-zinc-600 leading-tight">• {b}</p>
              ))}
            </div>
          ))}
        </div>
      );
    }

    if (secKey === "projects" && p.projects?.length) {
      return (
        <div key={secKey} className="space-y-1 text-left">
          <h3 className="text-[7px] font-extrabold uppercase tracking-wider border-b border-zinc-200 pb-0.5" style={{ color: accent }}>{secLabel}</h3>
          {p.projects.slice(0, projLimit).map((proj, idx) => (
            <div key={idx} className="space-y-0.5">
              <p className="text-[5.5px] font-bold text-zinc-900 truncate">{proj.title} <span className="text-[5px] font-normal text-zinc-500">[{proj.tech}]</span></p>
              <p className="text-[5px] text-zinc-600 leading-tight">• {proj.description}</p>
              {proj.bullets && proj.bullets.slice(0, bulletLimit - 1).map((b, bi) => (
                <p key={bi} className="text-[4.8px] text-zinc-500 leading-tight pl-2">• {b}</p>
              ))}
            </div>
          ))}
        </div>
      );
    }

    if (secKey === "certifications" && p.certifications?.length) {
      return (
        <div key={secKey} className="space-y-0.5 text-left">
          <h3 className="text-[7px] font-extrabold uppercase tracking-wider border-b border-zinc-200 pb-0.5" style={{ color: accent }}>{secLabel}</h3>
          <div className="space-y-0.5 text-[5px] text-zinc-600">
            {p.certifications.slice(0, certLimit).map((cert, idx) => (
              <p key={idx} className="truncate">• {cert}</p>
            ))}
          </div>
        </div>
      );
    }

    if (secKey === "achievements" && p.achievements?.length) {
      return (
        <div key={secKey} className="space-y-0.5 text-left">
          <h3 className="text-[7px] font-extrabold uppercase tracking-wider border-b border-zinc-200 pb-0.5" style={{ color: accent }}>{secLabel}</h3>
          <div className="space-y-0.5 text-[5px] text-zinc-600">
            {p.achievements.slice(0, achLimit).map((ach, idx) => (
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
          <div className="space-y-2.5">
            {isPhoto ? (
              <div className="flex flex-col items-center text-center space-y-1 mb-0.5">
                <img
                  src={p.photoUrl}
                  alt={p.name}
                  className="w-13 h-13 rounded-full object-cover border-2 border-white/90 shrink-0 shadow-sm"
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
                {p.skills.slice(0, 6).map((sk, i) => (
                  <p key={i} className="truncate">• {sk}</p>
                ))}
              </div>
            </div>
          </div>

          {/* Education Mini Block */}
          <div className="space-y-0.5 text-[5.5px] text-white/90 pt-1">
            <span className="text-[5px] font-extrabold uppercase tracking-wider block text-white/70 border-b border-white/20 pb-0.5">EDUCATION</span>
            {p.education.map((ed, i) => (
              <div key={i} className="space-y-0.5">
                <p className="font-bold text-white truncate">{ed.institution}</p>
                <p className="text-white/80 text-[5px] truncate">{ed.degree}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Main Body Content */}
        <div className="flex-1 p-2.5 flex flex-col min-w-0 bg-white" style={{ gap: sectionCount <= 5 ? "16px" : "10px" }}>
          {!isPhoto && (
            <div className="pb-1 border-b border-zinc-200">
              <h2 className="text-[9px] font-extrabold text-zinc-900 uppercase tracking-tight">{p.name}</h2>
              <p className="text-[6px] text-zinc-600 font-semibold">{p.title}</p>
            </div>
          )}

          {/* Render Sections in exact Order */}
          <div className={`flex-1 min-w-0 flex flex-col ${listGap}`}>
            {sectionsToDisplay.map((sec) => renderSectionBlock(sec.key, sec.label))}
          </div>
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
      <div className="w-full aspect-[1/1.41] bg-white text-zinc-900 shadow-xs border border-zinc-200 rounded-md p-3 overflow-hidden select-none relative flex flex-col space-y-2.5 text-[6.5px] leading-tight">
        <div className="pb-1 border-b border-zinc-200">
          <h2 className="text-[9px] font-extrabold uppercase tracking-tight" style={{ color: accent }}>{p.name}</h2>
          <p className="text-[5.5px] text-zinc-700 font-bold">{p.title}</p>
          <p className="text-[5px] text-zinc-500 mt-0.5">{p.email} | {p.phone} | {p.location}</p>
        </div>
        <div className={`flex-1 min-w-0 pl-2 border-l border-zinc-300 ml-1 relative flex flex-col ${listGap} py-0.5`}>
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
      <div className="w-full aspect-[1/1.41] bg-white text-zinc-900 shadow-xs border border-zinc-200 rounded-md p-3 overflow-hidden select-none relative flex flex-col space-y-2.5 text-[6.5px] leading-tight">
        <div className="pb-1 border-b border-zinc-200 text-center">
          <h2 className="text-[9px] font-extrabold uppercase tracking-tight" style={{ color: accent }}>{p.name}</h2>
          <p className="text-[5.5px] text-zinc-700 font-bold">{p.title}</p>
          <p className="text-[5px] text-zinc-500 mt-0.5">{p.email} • {p.phone} • {p.location}</p>
        </div>
        <div className="grid grid-cols-2 gap-2.5 flex-1 min-w-0 py-0.5">
          <div className="border-r border-zinc-200 pr-1.5 flex flex-col space-y-3.5">
            {renderSectionBlock("education", "EDUCATION")}
            {renderSectionBlock("skills", "TECHNICAL SKILLS")}
            {renderSectionBlock("certifications", "CERTIFICATIONS")}
          </div>
          <div className="pl-0.5 flex flex-col space-y-3.5">
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
      <div className="w-full aspect-[1/1.41] bg-white text-zinc-900 shadow-xs border border-zinc-200 rounded-md p-3 overflow-hidden select-none relative flex flex-col space-y-2.5 text-[6.5px] leading-tight">
        <div className="pb-1 border-b border-zinc-300 text-center">
          <h2 className="text-[9px] font-serif font-extrabold uppercase tracking-tight" style={{ color: accent }}>{p.name}</h2>
          <p className="text-[5.5px] font-serif text-zinc-700 italic">{p.title}</p>
          <p className="text-[5px] text-zinc-500 mt-0.5">{p.email} | {p.phone} | {p.location}</p>
        </div>
        <div className={`flex-1 min-w-0 flex flex-col ${listGap} py-0.5`}>
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
      <div className="w-full aspect-[1/1.41] bg-white text-zinc-900 shadow-xs border border-zinc-200 rounded-md p-3 overflow-hidden select-none relative flex flex-col space-y-2.5 text-[6.5px] leading-tight">
        {/* Centered Header */}
        <div className="flex flex-col items-center text-center space-y-0.5 pb-1 border-b border-zinc-200">
          {isPhoto && (
            <img
              src={p.photoUrl}
              alt={p.name}
              className="w-14 h-14 rounded-full object-cover border border-zinc-300 shadow-sm shrink-0 mb-0.5"
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
        <div className={`flex-1 min-w-0 flex flex-col ${listGap} py-0.5`}>
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
    <div className="w-full aspect-[1/1.41] bg-white text-zinc-900 shadow-xs border border-zinc-200 rounded-md p-3 overflow-hidden select-none relative flex flex-col space-y-2.5 text-[6.5px] leading-tight">
      {/* Header Row */}
      <div className="flex items-center justify-between gap-2 pb-1 border-b border-zinc-200">
        {tmpl.photoPlacement === "top_left" && isPhoto && (
          <img
            src={p.photoUrl}
            alt={p.name}
            className="w-13 h-13 rounded-lg object-cover border shadow-sm shrink-0"
            style={{ borderColor: accent }}
          />
        )}

        <div className="flex-1 min-w-0 text-left">
          <h2 className="text-[9px] font-extrabold uppercase tracking-tight" style={{ color: accent }}>{p.name}</h2>
          <p className="text-[5.5px] text-zinc-700 font-bold truncate">{p.title}</p>
          <p className="text-[5px] text-zinc-500 truncate mt-0.5">{p.email} | {p.phone} | {p.location}</p>
        </div>

        {(tmpl.photoPlacement === "top_right" || tmpl.photoPlacement === "inline") && isPhoto && (
          <img
            src={p.photoUrl}
            alt={p.name}
            className="w-13 h-13 rounded-lg object-cover border shadow-sm shrink-0"
            style={{ borderColor: accent }}
          />
        )}
      </div>

      {/* Dynamic Sections in Template Order */}
      <div className={`flex-1 min-w-0 flex flex-col ${listGap} py-0.5`}>
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
