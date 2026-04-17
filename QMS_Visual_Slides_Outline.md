# QMS Visual Presentation Slides - Drawing Guide

## Slide 1: Title Slide
```
┌─────────────────────────────────────┐
│                                     │
│        QMS MODULES ANALYSIS         │
│    Life Sciences Supply Chain OS    │
│                                     │
│         Sandesh Yadav               │
│                                     │
└─────────────────────────────────────┘
```

## Slide 2: QMS Module Overview
```
┌─────────────────────────────────────┐
│           9 QMS MODULES             │
│                                     │
│  1. In-Process Quality              │
│  2. Deviation Management            │
│  3. CAPA                            │
│  4. In-Product Quality              │
│  5. Product Complaints              │
│  6. Recall Management               │
│  7. Adverse Event Reporting         │
│  8. QMS Management                  │
│  9. Supplier Management             │
│                                     │
└─────────────────────────────────────┘
```

## Slide 3: In-Process Quality Flow
```
┌─────────────────────────────────────┐
│      IN-PROCESS QUALITY FLOW        │
│                                     │
│  Setup → Monitor → Record →         │
│   ↓       ↓        ↓                │
│  Alert → Decision                   │
│                                     │
│  API Example: Paracetamol           │
│  • pH: 7.0-7.5 every 30 min        │
│  • Temperature: 58-62°C continuous  │
│  • Purity: >99.5% mid-batch test    │
│                                     │
│  Raw Material Example: Lactose      │
│  • Moisture: <5% on receipt         │
│  • Particle size: 50-200 microns    │
│  • Microbial limits: <100 CFU/g     │
│                                     │
└─────────────────────────────────────┘
```

## Slide 4: Deviation Management Process
```
┌─────────────────────────────────────┐
│      DEVIATION MANAGEMENT           │
│                                     │
│    Detection                        │
│        ↓                            │
│    Documentation                    │
│        ↓                            │
│    Investigation (24-48 hrs)        │
│        ↓                            │
│    Risk Assessment                  │
│        ↓                            │
│    Correction                       │
│        ↓                            │
│    CAPA (if needed)                 │
│                                     │
│  API Example: Aspirin Synthesis     │
│  • Temp: 60°C → went to 68°C        │
│  • Root cause: Faulty controller    │
│  • Action: Extra purity testing     │
│                                     │
│  Raw Material Example: Gelatin      │
│  • Received 2 days past expiry      │
│  • Root cause: Supplier error       │
│  • Action: Return + emergency order │
└─────────────────────────────────────┘
```

## Slide 5: CAPA Cycle
```
┌─────────────────────────────────────┐
│           CAPA CYCLE                │
│                                     │
│      Initiation                     │
│         ↓                           │
│    Root Cause ←──────┐              │
│    Analysis          │              │
│         ↓           │               │
│    Corrective  ──→  Closure         │
│    Action           ↑               │
│         ↓           │               │
│    Preventive ──→  Verification     │
│    Action                           │
│         ↓           ↑               │
│    Implementation ───┘              │
│                                     │
│  API Example: Metformin Moisture    │
│  • Problem: Repeated failures       │
│  • Root Cause: Insufficient drying  │
│  • Corrective: Extend drying 2→4hrs │
│  • Preventive: Update all API SOPs  │
│                                     │
│  Raw Material: Tablet Hardness      │
│  • Problem: Hardness variation      │
│  • Root Cause: Cellulose variance   │
│  • Preventive: Add particle test    │
└─────────────────────────────────────┘
```

## Slide 6: Product Quality Testing
```
┌─────────────────────────────────────┐
│        IN-PRODUCT QUALITY           │
│                                     │
│  Raw Materials    APIs    Finished  │
│       ↓            ↓         ↓      │
│   Sampling → Testing → Documentation│
│                        ↓            │
│               Review → Release/Hold │
│                                     │
│  Example Tests:                     │
│  • API: Assay, Impurities           │
│  • Tablets: Hardness, Dissolution   │
│  • Raw: Moisture, Particle Size     │
│                                     │
└─────────────────────────────────────┘
```

## Slide 7: Complaint to Recall Flow
```
┌─────────────────────────────────────┐
│    COMPLAINT → RECALL PROCESS       │
│                                     │
│  Customer Complaint                 │
│         ↓                           │
│  Classification (Critical/Major)    │
│         ↓                           │
│  Investigation                      │
│         ↓                           │
│  Risk Assessment                    │
│       ↙   ↘                         │
│  Response  Recall Decision          │
│            ↓                        │
│      Market Removal                 │
│                                     │
│  Example: Bitter taste → pH issue   │
│  → Batch recall                     │
└─────────────────────────────────────┘
```

## Slide 8: Supplier Management
```
┌─────────────────────────────────────┐
│      SUPPLIER MANAGEMENT            │
│                                     │
│  Qualification                      │
│       ↓                             │
│  Audit & Approval                   │
│       ↓                             │
│  Ongoing Monitoring                 │
│       ↓                             │
│  Performance Review                 │
│       ↓                             │
│  Re-qualification (every 2-3 yrs)   │
│                                     │
│  API Example: Warfarin Supplier     │
│  • On-site facility audit          │
│  • Quality agreement review        │
│  • Trial supply with extra testing │
│                                     │
│  Raw Material: Cellulose Supplier   │
│  • Monthly quality scorecards       │
│  • Trend analysis of inspections   │
│  • Performance metrics tracking    │
└─────────────────────────────────────┘
```

## Slide 9: Role Perspectives
```
┌─────────────────────────────────────┐
│         ROLE PERSPECTIVES           │
│                                     │
│  QA OFFICER          PRODUCTION MGR │
│  • Compliance Focus  • Efficiency   │
│  • Risk Assessment   • Cost Control │
│  • Standards Setting • Team Coord   │
│  • Release Authority • Process Opt  │
│                                     │
│  QA Example: "This batch fails      │
│  moisture spec - must investigate   │
│  before release"                    │
│                                     │
│  Prod Example: "Can we expedite     │
│  testing to meet delivery deadline  │
│  while maintaining quality?"        │
│                                     │
│         SME CONTEXT                 │
│  • Same person = multiple roles     │
│  • Limited budget for systems       │
│  • Regulatory compliance critical   │
│  • Manual processes common          │
└─────────────────────────────────────┘
```

## Slide 10: Integration Map
```
┌─────────────────────────────────────┐
│        QMS INTEGRATION              │
│                                     │
│    Supplier Mgmt                    │
│         ↓                           │
│    In-Process Quality               │
│         ↓                           │
│    In-Product Quality               │
│         ↓                           │
│    Market Release                   │
│         ↓                           │
│    Complaint/AE Monitoring          │
│         ↓                           │
│    Recall (if needed)               │
│                                     │
│  Deviation Mgmt ←→ CAPA (supports all)│
│  QMS Management (oversees all)       │
└─────────────────────────────────────┘
```

## Slide 11: Complaint & Recall Examples
```
┌─────────────────────────────────────┐
│     REAL-WORLD EXAMPLES             │
│                                     │
│  PRODUCT COMPLAINT:                 │
│  Patient: "Bitter taste in syrup"   │
│  Investigation: pH 4.2 (spec 6-8)   │
│  Root cause: Wrong buffer solution  │
│  Action: Recalled batch #AB123      │
│                                     │
│  ADVERSE EVENT:                     │
│  Doctor reports: "Skin rash after   │
│  new antibiotic"                    │
│  Assessment: Known rare side effect │
│  Action: Updated product labeling    │
│                                     │
│  RECALL EXAMPLE:                    │
│  Nitrosamine in BP tablets          │
│  Class II recall - 50,000 bottles   │
│  98% recovery in 30 days            │
└─────────────────────────────────────┘
```

## Slide 12: QMS Technology in SMEs
```
┌─────────────────────────────────────┐
│        QMS TECHNOLOGY NEEDS         │
│                                     │
│  LARGE PHARMA        vs     SME     │
│  • Enterprise QMS           • Basic │
│  • Automated workflows      • Manual│
│  • 24/7 monitoring         • Batch │
│  • Multiple sites          • Single│
│                                     │
│  SME PRIORITIES:                    │
│  1. Regulatory compliance first     │
│  2. Cost-effective solutions        │
│  3. Easy to use systems            │
│  4. Scalable as company grows      │
│                                     │
│  KEY CHALLENGE:                     │
│  Balance automation vs affordability│
│  while maintaining FDA compliance   │
└─────────────────────────────────────┘
```

---