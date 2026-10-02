import { 
  collection, 
  getDocs, 
  setDoc, 
  doc, 
  writeBatch 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';

export async function checkAndSeedInitialData() {
  try {
    const batchesSnap = await getDocs(collection(db, 'batches'));
    if (!batchesSnap.empty) {
      return; // Already seeded
    }

    const batch = writeBatch(db);

    // 1. Initial Batches
    const initialBatches = [
      {
        id: 'batch_jee_top_2026',
        batchName: 'JEE Super 30 - Advanced Physics & Maths',
        fees: 45000,
        subject: 'Physics, Chemistry, Mathematics',
        grade: 'Class 12 / JEE Repeater',
        batchTiming: '04:30 PM - 07:30 PM IST',
        syllabus: 'Rotational Dynamics, Integral Calculus, Thermodynamics, Organic Reaction Mechanisms',
        capacity: 40,
        enrolledCount: 34,
        status: 'active',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'batch_neet_med_2026',
        batchName: 'NEET Conqueror - Complete Biology & Chem',
        fees: 42000,
        subject: 'Botany, Zoology, Chemistry',
        grade: 'Class 11 & 12 / NEET',
        batchTiming: '09:00 AM - 12:30 PM IST',
        syllabus: 'Genetics & Evolution, Human Physiology, Chemical Equilibrium, Ecology',
        capacity: 50,
        enrolledCount: 47,
        status: 'active',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'batch_foundation_10',
        batchName: 'Foundation X - Board Olympiad Mastery',
        fees: 28000,
        subject: 'Science & Mathematics',
        grade: 'Class 10 CBSE/State',
        batchTiming: '05:00 PM - 07:00 PM IST',
        syllabus: 'Electricity, Light, Heredity, Trigonometry, Quadratic Equations',
        capacity: 45,
        enrolledCount: 38,
        status: 'active',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'batch_crash_jee_2026',
        batchName: 'JEE Main Crash Course 90 Days',
        fees: 18000,
        subject: 'PCM Rapid Revision',
        grade: 'Class 12 JEE',
        batchTiming: '07:30 PM - 09:30 PM IST',
        syllabus: 'High-weightage topic drills, PYQs solving, formula maps',
        capacity: 60,
        enrolledCount: 15,
        status: 'upcoming',
        createdAt: new Date().toISOString(),
      }
    ];

    initialBatches.forEach(b => {
      batch.set(doc(db, 'batches', b.id), b);
    });

    // 2. Admissions Applications
    const initialAdmissions = [
      {
        id: 'adm_101',
        studentName: 'Aarav Sharma',
        parentName: 'Vikram Sharma',
        grade: 'Class 12 (PCM)',
        previousScore: '94.2%',
        phone: '+91 98765 43210',
        email: 'aarav.sharma@example.com',
        status: 'approved',
        appliedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
        notes: 'Targeting IIT Bombay CSE. Strong academic track record.',
      },
      {
        id: 'adm_102',
        studentName: 'Priya Verma',
        parentName: 'Sanjay Verma',
        grade: 'Class 11 (PCB)',
        previousScore: '91.8%',
        phone: '+91 98111 22334',
        email: 'priya.verma@example.com',
        status: 'pending',
        appliedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
        notes: 'Interested in NEET regular morning batch with hostel inquiry.',
      },
      {
        id: 'adm_103',
        studentName: 'Rohan Deshmukh',
        parentName: 'Anil Deshmukh',
        grade: 'Class 10 (CBSE)',
        previousScore: '88.5%',
        phone: '+91 97234 56789',
        email: 'rohan.d@example.com',
        status: 'approved',
        appliedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
        notes: 'Wants admission into Foundation X evening batch.',
      },
      {
        id: 'adm_104',
        studentName: 'Kavita Patel',
        parentName: 'Mahesh Patel',
        grade: 'Class 12 (JEE)',
        previousScore: '76.0%',
        phone: '+91 99887 76655',
        email: 'kavita.p@example.com',
        status: 'rejected',
        appliedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
        notes: 'Batch prerequisites not met; recommended foundational revision.',
      }
    ];

    initialAdmissions.forEach(a => {
      batch.set(doc(db, 'admissions', a.id), a);
    });

    // 3. Study Notes Store
    const initialNotes = [
      {
        id: 'note_rotational_dynamics',
        title: 'JEE Advanced: Rotational Dynamics Formula & Theory Bible',
        subject: 'Physics',
        grade: 'Class 11 & 12',
        price: 399,
        isFreeSample: true,
        pagesCount: 84,
        description: 'Comprehensive formulas, shortcuts, and 120 solved advanced level problems with anti-piracy watermarking.',
        downloadCount: 1420,
        watermarkEnabled: true,
        sampleText: `PAGE 1 SAMPLE PREVIEW:\n\nCHAPTER 7: ROTATIONAL MOTION & MOMENT OF INERTIA\n\n1. Concept of Center of Mass:\nFor continuous mass distribution, R_cm = (1/M) ∫ r dm.\n\n2. Parallel Axes Theorem:\nI = I_cm + M*d^2\n(Where d is perpendicular distance between parallel axes).\n\n3. Perpendicular Axes Theorem (Laminar bodies only):\nI_z = I_x + I_y\n\n[CONFIDENTIAL: Anti-Piracy Watermark applied automatically with Student Name & Mobile]`,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'note_human_physiology',
        title: 'NEET Master: Human Physiology NCERT Extracted Notes',
        subject: 'Biology',
        grade: 'Class 11',
        price: 499,
        isFreeSample: true,
        pagesCount: 112,
        description: 'High yield diagrams, mnemonics, NCERT hidden lines, and 200+ previous year questions.',
        downloadCount: 2310,
        watermarkEnabled: true,
        sampleText: `PAGE 1 SAMPLE PREVIEW:\n\nUNIT 5: HUMAN PHYSIOLOGY - DIGESTION & RESPIRATION\n\n- Dental Formula in Human Adult: 2123 / 2123\n- Pepsinogen is converted to active Pepsin by HCl.\n- Oxygen-Haemoglobin dissociation curve is sigmoid; shifts right with ↑pCO2, ↑H+, ↑Temperature.\n\n[Protected Document - Watermarked on every page for subscriber security]`,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'note_organic_reactions',
        title: 'Organic Chemistry Name Reactions & Mechanisms Roadmaps',
        subject: 'Chemistry',
        grade: 'Class 12 / JEE / NEET',
        price: 349,
        isFreeSample: true,
        pagesCount: 72,
        description: 'Complete synthesis charts, Aldol condensation, Cannizzaro, Reimer-Tiemann, and Grignard conversions.',
        downloadCount: 1850,
        watermarkEnabled: true,
        sampleText: `PAGE 1 SAMPLE PREVIEW:\n\nORGANIC REACTION CONVERSIONS MAP\n\n1. Aldol Condensation: Requires α-hydrogen, base catalysed enolate formation.\n2. Cannizzaro Reaction: Non-enolizable aldehydes undergo self redox disproportionation.\n3. Diazotization: Aniline + NaNO2 + HCl (0-5°C) -> Benzene Diazonium Chloride.\n\n[Anti-Piracy Security Enabled]`,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'note_calculus_sheets',
        title: 'Integral Calculus Cheat Sheets & Problem Hacks',
        subject: 'Mathematics',
        grade: 'Class 12 / JEE',
        price: 299,
        isFreeSample: false,
        pagesCount: 56,
        description: 'Indefinite integrals, Definite integrals properties, and Differential Equations step-by-step.',
        downloadCount: 980,
        watermarkEnabled: true,
        sampleText: `PAGE 1: Standard substitution techniques and trigonometric transforms for JEE Mains & Advanced.`,
        createdAt: new Date().toISOString(),
      }
    ];

    initialNotes.forEach(n => {
      batch.set(doc(db, 'notes', n.id), n);
    });

    // 4. Video Lectures
    const initialVideos = [
      {
        id: 'vid_phy_rotation',
        title: 'Rotational Motion - Torque & Angular Momentum in 60 Mins',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        videoType: 'youtube',
        subject: 'Physics',
        batchId: 'batch_jee_top_2026',
        batchName: 'JEE Super 30 - Advanced Physics & Maths',
        duration: '58 mins',
        pdfMaterialUrl: 'https://example.com/materials/physics-rotational.pdf',
        description: 'Deep dive into angular impulse, rolling without slipping, and previous 10 years JEE Advanced problems.',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'vid_bio_genetics',
        title: 'Principles of Inheritance & Mendelian Laws with Pedigree Analysis',
        videoUrl: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
        videoType: 'youtube',
        subject: 'Biology',
        batchId: 'batch_neet_med_2026',
        batchName: 'NEET Conqueror - Complete Biology & Chem',
        duration: '74 mins',
        pdfMaterialUrl: 'https://example.com/materials/genetics-pedigree.pdf',
        description: 'Step-by-step pedigree chart solving method, autosomal dominant vs recessive traits, and sex-linked disorders.',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'vid_chem_equilibrium',
        title: 'Chemical Equilibrium & Le Chatelier Principle Simplified',
        videoUrl: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
        videoType: 'youtube',
        subject: 'Chemistry',
        batchId: 'batch_jee_top_2026',
        batchName: 'JEE Super 30 - Advanced Physics & Maths',
        duration: '62 mins',
        pdfMaterialUrl: 'https://example.com/materials/equilibrium-chemsheet.pdf',
        description: 'Equilibrium constants Kp vs Kc, reaction quotient Q, and effect of temperature & pressure variations.',
        createdAt: new Date().toISOString(),
      }
    ];

    initialVideos.forEach(v => {
      batch.set(doc(db, 'videos', v.id), v);
    });

    // 5. Mock Test Series
    const initialMockTests = [
      {
        id: 'mock_jee_phy_01',
        topic: 'JEE Full Physics Mock - Mechanics & Electrodynamics',
        subject: 'Physics',
        grade: 'Class 12 / JEE',
        totalQuestions: 5,
        passingMarks: 12,
        durationMinutes: 15,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'mock_neet_bio_01',
        topic: 'NEET Biology Unit Test: Cell Biology & Biomolecules',
        subject: 'Biology',
        grade: 'Class 11 / NEET',
        totalQuestions: 5,
        passingMarks: 15,
        durationMinutes: 15,
        createdAt: new Date().toISOString(),
      }
    ];

    initialMockTests.forEach(mt => {
      batch.set(doc(db, 'mock_tests', mt.id), mt);
    });

    // 6. Test Results
    const initialResults = [
      {
        id: 'res_001',
        testId: 'mock_jee_phy_01',
        testTopic: 'JEE Full Physics Mock - Mechanics & Electrodynamics',
        studentName: 'Aarav Sharma',
        studentEmail: 'aarav.sharma@example.com',
        score: 20,
        totalMarks: 20,
        percentage: 100,
        passed: true,
        submittedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
      },
      {
        id: 'res_002',
        testId: 'mock_jee_phy_01',
        testTopic: 'JEE Full Physics Mock - Mechanics & Electrodynamics',
        studentName: 'Rohan Deshmukh',
        studentEmail: 'rohan.d@example.com',
        score: 16,
        totalMarks: 20,
        percentage: 80,
        passed: true,
        submittedAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
      },
      {
        id: 'res_003',
        testId: 'mock_neet_bio_01',
        testTopic: 'NEET Biology Unit Test: Cell Biology & Biomolecules',
        studentName: 'Priya Verma',
        studentEmail: 'priya.verma@example.com',
        score: 18,
        totalMarks: 20,
        percentage: 90,
        passed: true,
        submittedAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
      },
      {
        id: 'res_004',
        testId: 'mock_neet_bio_01',
        testTopic: 'NEET Biology Unit Test: Cell Biology & Biomolecules',
        studentName: 'Kavita Patel',
        studentEmail: 'kavita.p@example.com',
        score: 10,
        totalMarks: 20,
        percentage: 50,
        passed: false,
        submittedAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
      }
    ];

    initialResults.forEach(r => {
      batch.set(doc(db, 'test_results', r.id), r);
    });

    // 7. Blog Articles
    const initialBlogs = [
      {
        id: 'blog_jee_time_mgmt',
        title: 'How to Score 99+ Percentile in JEE: Complete 6-Month Roadmap',
        category: 'JEE Preparation',
        excerpt: 'Proven timetable, revision cycles, and mistake analysis notebook technique used by top 100 rankers.',
        content: `Cracking JEE with a 99+ percentile requires disciplined revision cycles rather than solving 10 different books. \n\n1. Priority to High Weightage Topics: Focus on Modern Physics, Coordinate Geometry, Thermodynamics, and Chemical Bonding first.\n2. Error Log Notebook: Maintain a dedicated notebook noting every silly mistake during mock tests.\n3. Timed Practice: Solve 30 questions in 60 minutes strictly to build exam stamina.\n4. Weekly Revision: Saturday evenings must be reserved solely for revision of older notes.`,
        author: 'Er. Rajesh Singhania (Head of Academics)',
        readTime: '6 mins read',
        published: true,
        createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
      },
      {
        id: 'blog_neet_ncert_tips',
        title: 'Mastering NCERT Biology for 360/360 in NEET 2026',
        category: 'NEET Strategy',
        excerpt: 'Read between the lines: diagram labels, summary points, and scientist introductions that frequently appear in questions.',
        content: `NEET Biology papers are 100% NCERT-based. Here is how toppers extract every single mark:\n\n- Do not skip the unit introductory pages and scientist biographies.\n- Pay special attention to tables and figure captions.\n- Create one-page flowcharts for complex cycles like Krebs cycle, Calvin cycle, and hormonal control.`,
        author: 'Dr. Sunita Mehta (Senior Biology Faculty)',
        readTime: '5 mins read',
        published: true,
        createdAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
      }
    ];

    initialBlogs.forEach(bl => {
      batch.set(doc(db, 'blogs', bl.id), bl);
    });

    // 8. Contact Inquiries
    const initialInquiries = [
      {
        id: 'inq_001',
        name: 'Deepak Agrawal',
        email: 'deepak.a@example.com',
        phone: '+91 98223 34455',
        subject: 'Inquiry for Class 11 JEE 2-Year Classroom Program',
        message: 'Hello, I want to know about the batch starting date, hostel facility, and scholarship test dates.',
        status: 'pending',
        createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
      },
      {
        id: 'inq_002',
        name: 'Meena Saxena',
        email: 'meena.saxena@example.com',
        phone: '+91 97112 23344',
        subject: 'Study Material & Postal Notes Dispatch',
        message: 'Can I purchase the complete printed study package for Class 10 Foundation? Do you ship to Lucknow?',
        status: 'contacted',
        createdAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
      },
      {
        id: 'inq_003',
        name: 'Vikram Rajput',
        email: 'vikram.r@example.com',
        phone: '+91 99334 45566',
        subject: 'Demo Class Request for NEET Chemistry',
        message: 'Attended the demo class yesterday. Very satisfied with teaching, enrolling today.',
        status: 'resolved',
        createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
      }
    ];

    initialInquiries.forEach(inq => {
      batch.set(doc(db, 'inquiries', inq.id), inq);
    });

    await batch.commit();
    console.log('Initial demo data seeded successfully into Firestore!');
  } catch (error) {
    console.warn('Seeding check note:', error);
  }
}
