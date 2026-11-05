import { User, Examination, Student, ClassGroup, ExaminationSubmission, ActivityLogItem, Question } from '../types';

export const SEED_TEACHERS: User[] = [
  {
    id: 'TCH-002',
    username: 'bethlehem.worku',
    password: 'examly-demo',
    name: 'Bethlehem Worku',
    role: 'Teacher',
    avatarText: 'BW',
    email: 'bethlehem.worku@examly.edu'
  },
  {
    id: 'TCH-003',
    username: 'daniel.mengistu',
    password: 'examly-demo',
    name: 'Daniel Mengistu',
    role: 'Teacher',
    avatarText: 'DM',
    email: 'daniel.mengistu@examly.edu'
  }
];

export const SEED_CLASSES: ClassGroup[] = [
  { id: 'CLS-10A', name: 'Grade 10A', academicYear: '2026/2027', studentCount: 7 },
  { id: 'CLS-10B', name: 'Grade 10B', academicYear: '2026/2027', studentCount: 6 },
  { id: 'CLS-11A', name: 'Grade 11A', academicYear: '2026/2027', studentCount: 7 },
  { id: 'CLS-11B', name: 'Grade 11B', academicYear: '2026/2027', studentCount: 6 },
  { id: 'CLS-09A', name: 'Grade 9A', academicYear: '2026/2027', studentCount: 5 },
  { id: 'CLS-12A', name: 'Grade 12A', academicYear: '2026/2027', studentCount: 4 }
];

export const SEED_STUDENTS: Student[] = [
  // ==========================================
  // Grade 10A (7 Students)
  // ==========================================
  {
    id: 'STU-002',
    studentId: 'STU-1002',
    name: 'Hana Bekele',
    username: 'hana.bekele',
    password: 'examly-demo',
    className: 'Grade 10A',
    classId: 'CLS-10A',
    status: 'Active',
    connectionStatus: 'Connected',
    submissionStatus: 'Submitted'
  },
  {
    id: 'STU-003',
    studentId: 'STU-1003',
    name: 'Samuel Girma',
    username: 'samuel.girma',
    password: 'examly-demo',
    className: 'Grade 10A',
    classId: 'CLS-10A',
    status: 'Active',
    connectionStatus: 'Connected',
    submissionStatus: 'Not submitted'
  },
  {
    id: 'STU-004',
    studentId: 'STU-1004',
    name: 'Mekdes Alemu',
    username: 'mekdes.alemu',
    password: 'examly-demo',
    className: 'Grade 10A',
    classId: 'CLS-10A',
    status: 'Active',
    connectionStatus: 'Connected',
    submissionStatus: 'Not submitted'
  },
  {
    id: 'STU-005',
    studentId: 'STU-1005',
    name: 'Dawit Kebede',
    username: 'dawit.kebede',
    password: 'examly-demo',
    className: 'Grade 10A',
    classId: 'CLS-10A',
    status: 'Active',
    connectionStatus: 'Connected',
    submissionStatus: 'Not submitted'
  },
  {
    id: 'STU-006',
    studentId: 'STU-1006',
    name: 'Liya Tadesse',
    username: 'liya.tadesse',
    password: 'examly-demo',
    className: 'Grade 10A',
    classId: 'CLS-10A',
    status: 'Active',
    connectionStatus: 'Connected',
    submissionStatus: 'Submitted'
  },
  {
    id: 'STU-007',
    studentId: 'STU-1007',
    name: 'Yared Haile',
    username: 'yared.haile',
    password: 'examly-demo',
    className: 'Grade 10A',
    classId: 'CLS-10A',
    status: 'Active',
    connectionStatus: 'Connected',
    submissionStatus: 'Not submitted'
  },
  {
    id: 'STU-008',
    studentId: 'STU-1008',
    name: 'Saron Berhanu',
    username: 'saron.berhanu',
    password: 'examly-demo',
    className: 'Grade 10A',
    classId: 'CLS-10A',
    status: 'Active',
    connectionStatus: 'Disconnected',
    submissionStatus: 'Not submitted'
  },

  // ==========================================
  // Grade 10B (6 Students)
  // ==========================================
  {
    id: 'STU-009',
    studentId: 'STU-1009',
    name: 'Yonas Berhanu',
    username: 'yonas.berhanu',
    password: 'examly-demo',
    className: 'Grade 10B',
    classId: 'CLS-10B',
    status: 'Active',
    connectionStatus: 'Connected',
    submissionStatus: 'Not submitted'
  },
  {
    id: 'STU-010',
    studentId: 'STU-1010',
    name: 'Selamawit Tefera',
    username: 'selamawit.tefera',
    password: 'examly-demo',
    className: 'Grade 10B',
    classId: 'CLS-10B',
    status: 'Active',
    connectionStatus: 'Connected',
    submissionStatus: 'Submitted'
  },
  {
    id: 'STU-011',
    studentId: 'STU-1011',
    name: 'Biniyam Kassaye',
    username: 'biniyam.kassaye',
    password: 'examly-demo',
    className: 'Grade 10B',
    classId: 'CLS-10B',
    status: 'Active',
    connectionStatus: 'Disconnected',
    submissionStatus: 'Not submitted'
  },
  {
    id: 'STU-012',
    studentId: 'STU-1012',
    name: 'Ruth Negash',
    username: 'ruth.negash',
    password: 'examly-demo',
    className: 'Grade 10B',
    classId: 'CLS-10B',
    status: 'Active',
    connectionStatus: 'Connected',
    submissionStatus: 'Submitted'
  },
  {
    id: 'STU-013',
    studentId: 'STU-1013',
    name: 'Kalkidan Desta',
    username: 'kalkidan.desta',
    password: 'examly-demo',
    className: 'Grade 10B',
    classId: 'CLS-10B',
    status: 'Active',
    connectionStatus: 'Connected',
    submissionStatus: 'Not submitted'
  },
  {
    id: 'STU-014',
    studentId: 'STU-1014',
    name: 'Nathnael Wondimu',
    username: 'nathnael.wondimu',
    password: 'examly-demo',
    className: 'Grade 10B',
    classId: 'CLS-10B',
    status: 'Active',
    connectionStatus: 'Connected',
    submissionStatus: 'Submitted'
  },

  // ==========================================
  // Grade 11A (7 Students - Natural Science)
  // ==========================================
  {
    id: 'STU-015',
    studentId: 'STU-1015',
    name: 'Ephrem Solomon',
    username: 'ephrem.solomon',
    password: 'examly-demo',
    className: 'Grade 11A',
    classId: 'CLS-11A',
    status: 'Active',
    connectionStatus: 'Connected',
    submissionStatus: 'Not submitted'
  },
  {
    id: 'STU-016',
    studentId: 'STU-1016',
    name: 'Bethlehem Haile',
    username: 'bethlehem.haile',
    password: 'examly-demo',
    className: 'Grade 11A',
    classId: 'CLS-11A',
    status: 'Active',
    connectionStatus: 'Connected',
    submissionStatus: 'Not submitted'
  },
  {
    id: 'STU-017',
    studentId: 'STU-1017',
    name: 'Natnael Desta',
    username: 'natnael.desta',
    password: 'examly-demo',
    className: 'Grade 11A',
    classId: 'CLS-11A',
    status: 'Active',
    connectionStatus: 'Disconnected',
    submissionStatus: 'Not submitted'
  },
  {
    id: 'STU-018',
    studentId: 'STU-1018',
    name: 'Rahel Mulugeta',
    username: 'rahel.mulugeta',
    password: 'examly-demo',
    className: 'Grade 11A',
    classId: 'CLS-11A',
    status: 'Active',
    connectionStatus: 'Connected',
    submissionStatus: 'Not submitted'
  },
  {
    id: 'STU-019',
    studentId: 'STU-1019',
    name: 'Kidus Yohannes',
    username: 'kidus.yohannes',
    password: 'examly-demo',
    className: 'Grade 11A',
    classId: 'CLS-11A',
    status: 'Active',
    connectionStatus: 'Connected',
    submissionStatus: 'Not submitted'
  },
  {
    id: 'STU-020',
    studentId: 'STU-1020',
    name: 'Fikirte Assefa',
    username: 'fikirte.assefa',
    password: 'examly-demo',
    className: 'Grade 11A',
    classId: 'CLS-11A',
    status: 'Active',
    connectionStatus: 'Connected',
    submissionStatus: 'Not submitted'
  },
  {
    id: 'STU-021',
    studentId: 'STU-1021',
    name: 'Surafel Getachew',
    username: 'surafel.getachew',
    password: 'examly-demo',
    className: 'Grade 11A',
    classId: 'CLS-11A',
    status: 'Active',
    connectionStatus: 'Connected',
    submissionStatus: 'Not submitted'
  },

  // ==========================================
  // Grade 11B (6 Students - Social Science)
  // ==========================================
  {
    id: 'STU-022',
    studentId: 'STU-1022',
    name: 'Amen Daniel',
    username: 'amen.daniel',
    password: 'examly-demo',
    className: 'Grade 11B',
    classId: 'CLS-11B',
    status: 'Active',
    connectionStatus: 'Connected',
    submissionStatus: 'Not submitted'
  },
  {
    id: 'STU-023',
    studentId: 'STU-1023',
    name: 'Tsion Abera',
    username: 'tsion.abera',
    password: 'examly-demo',
    className: 'Grade 11B',
    classId: 'CLS-11B',
    status: 'Active',
    connectionStatus: 'Connected',
    submissionStatus: 'Not submitted'
  },
  {
    id: 'STU-024',
    studentId: 'STU-1024',
    name: 'Robel Shimelis',
    username: 'robel.shimelis',
    password: 'examly-demo',
    className: 'Grade 11B',
    classId: 'CLS-11B',
    status: 'Active',
    connectionStatus: 'Connected',
    submissionStatus: 'Not submitted'
  },
  {
    id: 'STU-025',
    studentId: 'STU-1025',
    name: 'Mahlet Girma',
    username: 'mahlet.girma',
    password: 'examly-demo',
    className: 'Grade 11B',
    classId: 'CLS-11B',
    status: 'Active',
    connectionStatus: 'Disconnected',
    submissionStatus: 'Not submitted'
  },
  {
    id: 'STU-026',
    studentId: 'STU-1026',
    name: 'Brook Zewdu',
    username: 'brook.zewdu',
    password: 'examly-demo',
    className: 'Grade 11B',
    classId: 'CLS-11B',
    status: 'Active',
    connectionStatus: 'Connected',
    submissionStatus: 'Not submitted'
  },
  {
    id: 'STU-027',
    studentId: 'STU-1027',
    name: 'Gelila Teshome',
    username: 'gelila.teshome',
    password: 'examly-demo',
    className: 'Grade 11B',
    classId: 'CLS-11B',
    status: 'Active',
    connectionStatus: 'Connected',
    submissionStatus: 'Not submitted'
  },

  // ==========================================
  // Grade 9A (5 Students)
  // ==========================================
  {
    id: 'STU-028',
    studentId: 'STU-1028',
    name: 'Aman Demisse',
    username: 'aman.demisse',
    password: 'examly-demo',
    className: 'Grade 9A',
    classId: 'CLS-09A',
    status: 'Active',
    connectionStatus: 'Connected',
    submissionStatus: 'Not submitted'
  },
  {
    id: 'STU-029',
    studentId: 'STU-1029',
    name: 'Hiwot Gashaw',
    username: 'hiwot.gashaw',
    password: 'examly-demo',
    className: 'Grade 9A',
    classId: 'CLS-09A',
    status: 'Active',
    connectionStatus: 'Connected',
    submissionStatus: 'Not submitted'
  },
  {
    id: 'STU-030',
    studentId: 'STU-1030',
    name: 'Biruk Mengistu',
    username: 'biruk.mengistu',
    password: 'examly-demo',
    className: 'Grade 9A',
    classId: 'CLS-09A',
    status: 'Active',
    connectionStatus: 'Connected',
    submissionStatus: 'Not submitted'
  },
  {
    id: 'STU-031',
    studentId: 'STU-1031',
    name: 'Meron Assefa',
    username: 'meron.assefa',
    password: 'examly-demo',
    className: 'Grade 9A',
    classId: 'CLS-09A',
    status: 'Active',
    connectionStatus: 'Disconnected',
    submissionStatus: 'Not submitted'
  },
  {
    id: 'STU-032',
    studentId: 'STU-1032',
    name: 'Yohannes Fikru',
    username: 'yohannes.fikru',
    password: 'examly-demo',
    className: 'Grade 9A',
    classId: 'CLS-09A',
    status: 'Active',
    connectionStatus: 'Connected',
    submissionStatus: 'Not submitted'
  },

  // ==========================================
  // Grade 12A (4 Students - Senior Preparatory)
  // ==========================================
  {
    id: 'STU-033',
    studentId: 'STU-1033',
    name: 'Nahom Teshome',
    username: 'nahom.teshome',
    password: 'examly-demo',
    className: 'Grade 12A',
    classId: 'CLS-12A',
    status: 'Active',
    connectionStatus: 'Connected',
    submissionStatus: 'Not submitted'
  },
  {
    id: 'STU-034',
    studentId: 'STU-1034',
    name: 'Helina Tadesse',
    username: 'helina.tadesse',
    password: 'examly-demo',
    className: 'Grade 12A',
    classId: 'CLS-12A',
    status: 'Active',
    connectionStatus: 'Connected',
    submissionStatus: 'Not submitted'
  },
  {
    id: 'STU-035',
    studentId: 'STU-1035',
    name: 'Eyob Mamo',
    username: 'eyob.mamo',
    password: 'examly-demo',
    className: 'Grade 12A',
    classId: 'CLS-12A',
    status: 'Active',
    connectionStatus: 'Connected',
    submissionStatus: 'Not submitted'
  },
  {
    id: 'STU-036',
    studentId: 'STU-1036',
    name: 'Dagmawi Sisay',
    username: 'dagmawi.sisay',
    password: 'examly-demo',
    className: 'Grade 12A',
    classId: 'CLS-12A',
    status: 'Active',
    connectionStatus: 'Connected',
    submissionStatus: 'Not submitted'
  },

  // ==========================================
  // Unassigned Transfer Students (Ready to test Search / Paste IDs in class management!)
  // ==========================================
  {
    id: 'STU-037',
    studentId: 'STU-2001',
    name: 'Bezawit Ashenafi',
    username: 'bezawit.ashenafi',
    password: 'examly-demo',
    className: '',
    status: 'Active',
    connectionStatus: 'Connected',
    submissionStatus: 'Not submitted'
  },
  {
    id: 'STU-038',
    studentId: 'STU-2002',
    name: 'Michael Tedros',
    username: 'michael.tedros',
    password: 'examly-demo',
    className: '',
    status: 'Active',
    connectionStatus: 'Connected',
    submissionStatus: 'Not submitted'
  },
  {
    id: 'STU-039',
    studentId: 'STU-2003',
    name: 'Semhal Gebre',
    username: 'semhal.gebre',
    password: 'examly-demo',
    className: '',
    status: 'Active',
    connectionStatus: 'Connected',
    submissionStatus: 'Not submitted'
  },
  {
    id: 'STU-040',
    studentId: 'STU-2004',
    name: 'Temesgen Ayalew',
    username: 'temesgen.ayalew',
    password: 'examly-demo',
    className: '',
    status: 'Active',
    connectionStatus: 'Connected',
    submissionStatus: 'Not submitted'
  }
];

// STRICTLY CHOOSE (MULTIPLE CHOICE) AND TRUE/FALSE QUESTIONS
export const SEED_QUESTION_BANK: Question[] = [
  // Mathematics
  {
    id: 'QB-001',
    questionNumber: 1,
    text: 'What is the value of x in the equation 2x + 6 = 16?',
    type: 'Multiple choice',
    marks: 2,
    options: [
      { id: 'A', text: '4' },
      { id: 'B', text: '5' },
      { id: 'C', text: '6' },
      { id: 'D', text: '8' }
    ],
    correctAnswer: 'B',
    explanation: 'Subtract 6 from both sides: 2x = 10, then divide by 2: x = 5.',
    subject: 'Mathematics',
    topic: 'Algebra',
    difficulty: 'Easy'
  },
  {
    id: 'QB-002',
    questionNumber: 2,
    text: 'Which of the following numbers is a prime number?',
    type: 'Multiple choice',
    marks: 2,
    options: [
      { id: 'A', text: '9' },
      { id: 'B', text: '11' },
      { id: 'C', text: '15' },
      { id: 'D', text: '21' }
    ],
    correctAnswer: 'B',
    explanation: '11 has no positive divisors other than 1 and 11.',
    subject: 'Mathematics',
    topic: 'Number theory',
    difficulty: 'Easy'
  },
  {
    id: 'QB-003',
    questionNumber: 3,
    text: 'A square with side length 5 has an area of 25.',
    type: 'True/false',
    marks: 2,
    options: [
      { id: 'A', text: 'True' },
      { id: 'B', text: 'False' }
    ],
    correctAnswer: 'A',
    explanation: 'Area of a square = side * side = 5 * 5 = 25.',
    subject: 'Mathematics',
    topic: 'Geometry',
    difficulty: 'Easy'
  },
  {
    id: 'QB-004',
    questionNumber: 4,
    text: 'What is the square root of 144?',
    type: 'Multiple choice',
    marks: 2,
    options: [
      { id: 'A', text: '10' },
      { id: 'B', text: '11' },
      { id: 'C', text: '12' },
      { id: 'D', text: '14' }
    ],
    correctAnswer: 'C',
    explanation: '12 * 12 = 144.',
    subject: 'Mathematics',
    topic: 'Arithmetic',
    difficulty: 'Easy'
  },
  {
    id: 'QB-005',
    questionNumber: 5,
    text: 'For the quadratic equation x² - 9 = 0, the solutions are x = 3 and x = -3.',
    type: 'True/false',
    marks: 2,
    options: [
      { id: 'A', text: 'True' },
      { id: 'B', text: 'False' }
    ],
    correctAnswer: 'A',
    explanation: 'x² = 9 => x = ±3.',
    subject: 'Mathematics',
    topic: 'Algebra',
    difficulty: 'Medium'
  },
  {
    id: 'QB-006',
    questionNumber: 6,
    text: 'In a right-angled triangle, if legs are of length 3 and 4, what is the hypotenuse length?',
    type: 'Multiple choice',
    marks: 2,
    options: [
      { id: 'A', text: '5' },
      { id: 'B', text: '6' },
      { id: 'C', text: '7' },
      { id: 'D', text: '8' }
    ],
    correctAnswer: 'A',
    explanation: 'By the Pythagorean theorem, 3² + 4² = 9 + 16 = 25, sqrt(25) = 5.',
    subject: 'Mathematics',
    topic: 'Trigonometry',
    difficulty: 'Medium'
  },

  // Physics
  {
    id: 'QB-007',
    questionNumber: 7,
    text: 'Light travels faster in water than in a vacuum.',
    type: 'True/false',
    marks: 2,
    options: [
      { id: 'A', text: 'True' },
      { id: 'B', text: 'False' }
    ],
    correctAnswer: 'B',
    explanation: 'Light travels fastest in a vacuum (approximately 300,000 km/s).',
    subject: 'Physics',
    topic: 'Optics',
    difficulty: 'Easy'
  },
  {
    id: 'QB-008',
    questionNumber: 8,
    text: 'Which unit is used to measure electric current?',
    type: 'Multiple choice',
    marks: 2,
    options: [
      { id: 'A', text: 'Volt' },
      { id: 'B', text: 'Ampere' },
      { id: 'C', text: 'Watt' },
      { id: 'D', text: 'Ohm' }
    ],
    correctAnswer: 'B',
    explanation: 'The ampere (symbol: A) is the base unit of electric current in the SI system.',
    subject: 'Physics',
    topic: 'Electricity',
    difficulty: 'Easy'
  },
  {
    id: 'QB-009',
    questionNumber: 9,
    text: "Newton's First Law of Motion states that an object at rest will remain at rest unless acted upon by an external force.",
    type: 'True/false',
    marks: 2,
    options: [
      { id: 'A', text: 'True' },
      { id: 'B', text: 'False' }
    ],
    correctAnswer: 'A',
    explanation: 'This is the definition of the Law of Inertia.',
    subject: 'Physics',
    topic: 'Mechanics',
    difficulty: 'Easy'
  },
  {
    id: 'QB-010',
    questionNumber: 10,
    text: 'What is the kinetic energy formula for an object with mass m and velocity v?',
    type: 'Multiple choice',
    marks: 2,
    options: [
      { id: 'A', text: 'KE = m * v' },
      { id: 'B', text: 'KE = 1/2 * m * v²' },
      { id: 'C', text: 'KE = m * g * h' },
      { id: 'D', text: 'KE = 2 * m * v' }
    ],
    correctAnswer: 'B',
    explanation: 'Kinetic energy equals half the mass times the velocity squared.',
    subject: 'Physics',
    topic: 'Energy',
    difficulty: 'Medium'
  },

  // Chemistry
  {
    id: 'QB-011',
    questionNumber: 11,
    text: 'What is the chemical symbol for Gold on the periodic table?',
    type: 'Multiple choice',
    marks: 2,
    options: [
      { id: 'A', text: 'Ag' },
      { id: 'B', text: 'Au' },
      { id: 'C', text: 'Fe' },
      { id: 'D', text: 'Gd' }
    ],
    correctAnswer: 'B',
    explanation: 'Au comes from the Latin word "Aurum".',
    subject: 'Chemistry',
    topic: 'Periodic Table',
    difficulty: 'Easy'
  },
  {
    id: 'QB-012',
    questionNumber: 12,
    text: 'A neutral aqueous solution has a pH value of 7 at 25°C.',
    type: 'True/false',
    marks: 2,
    options: [
      { id: 'A', text: 'True' },
      { id: 'B', text: 'False' }
    ],
    correctAnswer: 'A',
    explanation: 'Pure water has equal concentrations of H⁺ and OH⁻ ions, yielding pH 7.',
    subject: 'Chemistry',
    topic: 'Acids and Bases',
    difficulty: 'Easy'
  },
  {
    id: 'QB-013',
    questionNumber: 13,
    text: 'Which type of bond involves the sharing of electron pairs between atoms?',
    type: 'Multiple choice',
    marks: 2,
    options: [
      { id: 'A', text: 'Ionic bond' },
      { id: 'B', text: 'Covalent bond' },
      { id: 'C', text: 'Metallic bond' },
      { id: 'D', text: 'Hydrogen bond' }
    ],
    correctAnswer: 'B',
    explanation: 'Covalent bonding is the mutual sharing of valence electrons between atoms.',
    subject: 'Chemistry',
    topic: 'Chemical Bonding',
    difficulty: 'Medium'
  },

  // Biology
  {
    id: 'QB-014',
    questionNumber: 14,
    text: 'Photosynthesis occurs primarily inside the chloroplasts of plant cells.',
    type: 'True/false',
    marks: 2,
    options: [
      { id: 'A', text: 'True' },
      { id: 'B', text: 'False' }
    ],
    correctAnswer: 'A',
    explanation: 'Chloroplasts contain chlorophyll which absorbs sunlight to drive photosynthesis.',
    subject: 'Biology',
    topic: 'Cell Biology',
    difficulty: 'Easy'
  },
  {
    id: 'QB-015',
    questionNumber: 15,
    text: 'Which human organ is primarily responsible for gas exchange?',
    type: 'Multiple choice',
    marks: 2,
    options: [
      { id: 'A', text: 'Heart' },
      { id: 'B', text: 'Lungs' },
      { id: 'C', text: 'Liver' },
      { id: 'D', text: 'Kidneys' }
    ],
    correctAnswer: 'B',
    explanation: 'The lungs facilitate oxygen absorption and carbon dioxide release via alveoli.',
    subject: 'Biology',
    topic: 'Human Anatomy',
    difficulty: 'Easy'
  },
  {
    id: 'QB-016',
    questionNumber: 16,
    text: 'DNA is composed of two polynucleotide strands winding around each other in a double helix.',
    type: 'True/false',
    marks: 2,
    options: [
      { id: 'A', text: 'True' },
      { id: 'B', text: 'False' }
    ],
    correctAnswer: 'A',
    explanation: 'Watson and Crick described the famous antiparallel double helix structure of DNA.',
    subject: 'Biology',
    topic: 'Genetics',
    difficulty: 'Medium'
  },

  // Computer Science & Technology
  {
    id: 'QB-017',
    questionNumber: 17,
    text: 'How many bits are in a single standard byte?',
    type: 'Multiple choice',
    marks: 2,
    options: [
      { id: 'A', text: '4' },
      { id: 'B', text: '8' },
      { id: 'C', text: '16' },
      { id: 'D', text: '32' }
    ],
    correctAnswer: 'B',
    explanation: 'A byte is standardly composed of 8 bits.',
    subject: 'Computer Science',
    topic: 'Data Representation',
    difficulty: 'Easy'
  },
  {
    id: 'QB-018',
    questionNumber: 18,
    text: 'Binary search can be performed on an unsorted array without sorting it first.',
    type: 'True/false',
    marks: 2,
    options: [
      { id: 'A', text: 'True' },
      { id: 'B', text: 'False' }
    ],
    correctAnswer: 'B',
    explanation: 'Binary search requires elements to be in sorted order to divide search space in half.',
    subject: 'Computer Science',
    topic: 'Algorithms',
    difficulty: 'Medium'
  },
  {
    id: 'QB-019',
    questionNumber: 19,
    text: 'Which protocol secures web browser communications with cryptographic encryption?',
    type: 'Multiple choice',
    marks: 2,
    options: [
      { id: 'A', text: 'FTP' },
      { id: 'B', text: 'HTTP' },
      { id: 'C', text: 'HTTPS' },
      { id: 'D', text: 'SMTP' }
    ],
    correctAnswer: 'C',
    explanation: 'HTTPS uses TLS/SSL to encrypt HTTP traffic between client and server.',
    subject: 'Computer Science',
    topic: 'Networking',
    difficulty: 'Easy'
  },
  {
    id: 'QB-020',
    questionNumber: 20,
    text: 'In English grammar, a sentence must contain at least a subject and a predicate.',
    type: 'True/false',
    marks: 2,
    options: [
      { id: 'A', text: 'True' },
      { id: 'B', text: 'False' }
    ],
    correctAnswer: 'A',
    explanation: 'A complete independent clause requires a subject and a predicate verb.',
    subject: 'English',
    topic: 'Grammar',
    difficulty: 'Easy'
  }
];

export const SEED_EXAMINATIONS: Examination[] = [
  // 1. LIVE ACTIVE EXAMINATION: Demonstrates Live Monitoring, unified timer, live submissions
  {
    id: 'EXM-001',
    code: 'MTH-204',
    title: 'Mathematics — Midterm Assessment',
    description: 'Comprehensive multiple-choice and true/false assessment covering algebra, geometry, and number theory.',
    subject: 'Mathematics',
    classId: 'CLS-10A',
    className: 'Grade 10A, Grade 10B',
    assignedClassNames: ['Grade 10A', 'Grade 10B'],
    teacherUsername: 'faculty',
    teacherName: 'Faculty Lead',
    assignedStudentCount: 13,
    assignedStudentIds: [
      'STU-002', 'STU-003', 'STU-004', 'STU-005', 'STU-006', 'STU-007', 'STU-008',
      'STU-009', 'STU-010', 'STU-011', 'STU-012', 'STU-013', 'STU-014'
    ],
    examDate: 'Nov 03, 2026',
    startTime: '09:30 AM',
    duration: '60 min',
    durationMinutes: 60,
    totalMarks: 12,
    instructions: 'Choose the correct answer for each multiple-choice and true/false question. Your answers are saved automatically as you work.',
    academicTerm: 'First semester',
    status: 'Active', // Active examination live now!
    startedAt: Date.now() - (15 * 60 * 1000),
    endTime: Date.now() + (45 * 60 * 1000),
    resultsReleased: false,
    questions: [
      {
        id: 'EXM-001-Q1',
        questionNumber: 1,
        text: 'What is the value of x in the equation 2x + 6 = 16?',
        type: 'Multiple choice',
        marks: 2,
        options: [
          { id: 'A', text: '4' },
          { id: 'B', text: '5' },
          { id: 'C', text: '6' },
          { id: 'D', text: '8' }
        ],
        correctAnswer: 'B',
        explanation: '2x + 6 = 16 => 2x = 10 => x = 5.'
      },
      {
        id: 'EXM-001-Q2',
        questionNumber: 2,
        text: 'Which of the following numbers is a prime number?',
        type: 'Multiple choice',
        marks: 2,
        options: [
          { id: 'A', text: '9' },
          { id: 'B', text: '11' },
          { id: 'C', text: '15' },
          { id: 'D', text: '21' }
        ],
        correctAnswer: 'B',
        explanation: '11 has no positive divisors other than 1 and 11.'
      },
      {
        id: 'EXM-001-Q3',
        questionNumber: 3,
        text: 'A square with side length 5 has an area of 25.',
        type: 'True/false',
        marks: 2,
        options: [
          { id: 'A', text: 'True' },
          { id: 'B', text: 'False' }
        ],
        correctAnswer: 'A',
        explanation: 'Area of a square = side * side = 5 * 5 = 25.'
      },
      {
        id: 'EXM-001-Q4',
        questionNumber: 4,
        text: 'What is the square root of 144?',
        type: 'Multiple choice',
        marks: 2,
        options: [
          { id: 'A', text: '10' },
          { id: 'B', text: '11' },
          { id: 'C', text: '12' },
          { id: 'D', text: '14' }
        ],
        correctAnswer: 'C',
        explanation: '12 * 12 = 144.'
      },
      {
        id: 'EXM-001-Q5',
        questionNumber: 5,
        text: 'For the quadratic equation x² - 9 = 0, the solutions are x = 3 and x = -3.',
        type: 'True/false',
        marks: 2,
        options: [
          { id: 'A', text: 'True' },
          { id: 'B', text: 'False' }
        ],
        correctAnswer: 'A',
        explanation: 'x² = 9 => x = ±3.'
      },
      {
        id: 'EXM-001-Q6',
        questionNumber: 6,
        text: 'In a right-angled triangle, if legs are of length 3 and 4, what is the hypotenuse length?',
        type: 'Multiple choice',
        marks: 2,
        options: [
          { id: 'A', text: '5' },
          { id: 'B', text: '6' },
          { id: 'C', text: '7' },
          { id: 'D', text: '8' }
        ],
        correctAnswer: 'A',
        explanation: '3² + 4² = 25 => sqrt(25) = 5.'
      }
    ],
    createdAt: '2026-10-25T08:00:00Z',
    updatedAt: '2026-11-03T09:30:00Z'
  },

  // 2. READY EXAMINATION: Ready to start, assigned to Grade 11A, has + Add a class button
  {
    id: 'EXM-002',
    code: 'PHY-310',
    title: 'Physics — Optics & Electricity Test',
    description: 'Optics, electricity, and kinematics multiple-choice evaluation.',
    subject: 'Physics',
    classId: 'CLS-11A',
    className: 'Grade 11A',
    assignedClassNames: ['Grade 11A'],
    teacherUsername: 'faculty',
    teacherName: 'Faculty Lead',
    assignedStudentCount: 7,
    assignedStudentIds: ['STU-015', 'STU-016', 'STU-017', 'STU-018', 'STU-019', 'STU-020', 'STU-021'],
    examDate: 'Nov 05, 2026',
    startTime: '10:00 AM',
    duration: '45 min',
    durationMinutes: 45,
    totalMarks: 8,
    instructions: 'Answer all multiple choice and true/false questions carefully.',
    academicTerm: 'First semester',
    status: 'Ready', // Ready state: Teacher can click Start Exam!
    resultsReleased: false,
    questions: [
      {
        id: 'EXM-002-Q1',
        questionNumber: 1,
        text: 'Light travels faster in water than in a vacuum.',
        type: 'True/false',
        marks: 2,
        options: [
          { id: 'A', text: 'True' },
          { id: 'B', text: 'False' }
        ],
        correctAnswer: 'B',
        explanation: 'Light travels fastest in a vacuum.'
      },
      {
        id: 'EXM-002-Q2',
        questionNumber: 2,
        text: 'Which unit is used to measure electric current?',
        type: 'Multiple choice',
        marks: 2,
        options: [
          { id: 'A', text: 'Volt' },
          { id: 'B', text: 'Ampere' },
          { id: 'C', text: 'Watt' },
          { id: 'D', text: 'Ohm' }
        ],
        correctAnswer: 'B',
        explanation: 'The ampere (symbol: A) is the base unit of electric current.'
      },
      {
        id: 'EXM-002-Q3',
        questionNumber: 3,
        text: "Newton's First Law of Motion states that an object at rest will remain at rest unless acted upon by an external force.",
        type: 'True/false',
        marks: 2,
        options: [
          { id: 'A', text: 'True' },
          { id: 'B', text: 'False' }
        ],
        correctAnswer: 'A',
        explanation: 'Law of Inertia.'
      },
      {
        id: 'EXM-002-Q4',
        questionNumber: 4,
        text: 'What is the kinetic energy formula for an object with mass m and velocity v?',
        type: 'Multiple choice',
        marks: 2,
        options: [
          { id: 'A', text: 'KE = m * v' },
          { id: 'B', text: 'KE = 1/2 * m * v²' },
          { id: 'C', text: 'KE = m * g * h' },
          { id: 'D', text: 'KE = 2 * m * v' }
        ],
        correctAnswer: 'B',
        explanation: 'KE = 1/2 * m * v².'
      }
    ],
    createdAt: '2026-10-28T11:00:00Z',
    updatedAt: '2026-11-03T10:00:00Z'
  },

  // 3. UNASSIGNED READY EXAMINATION: Shows "Unassigned" and test the "+ Add a class" feature
  {
    id: 'EXM-003',
    code: 'CSC-101',
    title: 'Computer Science: Algorithms & Logic',
    description: 'Foundational computation, binary encoding, and algorithmic search techniques.',
    subject: 'Computer Science',
    classId: '',
    className: 'Unassigned',
    assignedClassNames: [],
    teacherUsername: 'faculty',
    teacherName: 'Faculty Lead',
    assignedStudentCount: 0,
    assignedStudentIds: [],
    examDate: 'Nov 08, 2026',
    startTime: '02:00 PM',
    duration: '45 min',
    durationMinutes: 45,
    totalMarks: 6,
    instructions: 'Complete all questions within the allocated time window.',
    academicTerm: 'First semester',
    status: 'Ready',
    resultsReleased: false,
    questions: [
      {
        id: 'EXM-003-Q1',
        questionNumber: 1,
        text: 'How many bits are in a single standard byte?',
        type: 'Multiple choice',
        marks: 2,
        options: [
          { id: 'A', text: '4' },
          { id: 'B', text: '8' },
          { id: 'C', text: '16' },
          { id: 'D', text: '32' }
        ],
        correctAnswer: 'B',
        explanation: '1 Byte = 8 bits.'
      },
      {
        id: 'EXM-003-Q2',
        questionNumber: 2,
        text: 'Binary search can be performed on an unsorted array without sorting it first.',
        type: 'True/false',
        marks: 2,
        options: [
          { id: 'A', text: 'True' },
          { id: 'B', text: 'False' }
        ],
        correctAnswer: 'B',
        explanation: 'Binary search requires sorted input.'
      },
      {
        id: 'EXM-003-Q3',
        questionNumber: 3,
        text: 'Which protocol secures web browser communications with cryptographic encryption?',
        type: 'Multiple choice',
        marks: 2,
        options: [
          { id: 'A', text: 'FTP' },
          { id: 'B', text: 'HTTP' },
          { id: 'C', text: 'HTTPS' },
          { id: 'D', text: 'SMTP' }
        ],
        correctAnswer: 'C',
        explanation: 'HTTPS provides encrypted communication.'
      }
    ],
    createdAt: '2026-10-30T10:00:00Z',
    updatedAt: '2026-11-03T11:00:00Z'
  },

  // 4. SCHEDULED EXAMINATION: Upcoming exam assigned to Grade 11A and Grade 12A
  {
    id: 'EXM-004',
    code: 'CHM-301',
    title: 'Chemistry — Chemical Bonding',
    description: 'Assessment covering periodic trends, chemical bonding, and acid-base equilibrium.',
    subject: 'Chemistry',
    classId: 'CLS-11A',
    className: 'Grade 11A, Grade 12A',
    assignedClassNames: ['Grade 11A', 'Grade 12A'],
    teacherUsername: 'faculty',
    teacherName: 'Faculty Lead',
    assignedStudentCount: 11,
    assignedStudentIds: [
      'STU-015', 'STU-016', 'STU-017', 'STU-018', 'STU-019', 'STU-020', 'STU-021',
      'STU-033', 'STU-034', 'STU-035', 'STU-036'
    ],
    examDate: 'Nov 12, 2026',
    startTime: '11:00 AM',
    duration: '60 min',
    durationMinutes: 60,
    totalMarks: 6,
    instructions: 'Read each question carefully. Formulas and periodic references are provided.',
    academicTerm: 'First semester',
    status: 'Ready',
    resultsReleased: false,
    questions: [
      {
        id: 'EXM-004-Q1',
        questionNumber: 1,
        text: 'What is the chemical symbol for Gold on the periodic table?',
        type: 'Multiple choice',
        marks: 2,
        options: [
          { id: 'A', text: 'Ag' },
          { id: 'B', text: 'Au' },
          { id: 'C', text: 'Fe' },
          { id: 'D', text: 'Gd' }
        ],
        correctAnswer: 'B',
        explanation: 'Au represents Gold.'
      },
      {
        id: 'EXM-004-Q2',
        questionNumber: 2,
        text: 'A neutral aqueous solution has a pH value of 7 at 25°C.',
        type: 'True/false',
        marks: 2,
        options: [
          { id: 'A', text: 'True' },
          { id: 'B', text: 'False' }
        ],
        correctAnswer: 'A',
        explanation: 'Neutral pH is 7.'
      },
      {
        id: 'EXM-004-Q3',
        questionNumber: 3,
        text: 'Which type of bond involves the sharing of electron pairs between atoms?',
        type: 'Multiple choice',
        marks: 2,
        options: [
          { id: 'A', text: 'Ionic bond' },
          { id: 'B', text: 'Covalent bond' },
          { id: 'C', text: 'Metallic bond' },
          { id: 'D', text: 'Hydrogen bond' }
        ],
        correctAnswer: 'B',
        explanation: 'Covalent bonds share electrons.'
      }
    ],
    createdAt: '2026-10-29T14:00:00Z',
    updatedAt: '2026-11-02T16:00:00Z'
  },

  // 5. COMPLETED EXAMINATION: Demonstrates Multi-Class Outcomes, Grade Distribution, and Submissions
  {
    id: 'EXM-005',
    code: 'ENG-102',
    title: 'English Language & Literature Proficiency',
    description: 'Grammar mechanics, vocabulary, and reading comprehension assessment.',
    subject: 'English',
    classId: 'CLS-10A',
    className: 'Grade 10A, Grade 10B',
    assignedClassNames: ['Grade 10A', 'Grade 10B'],
    teacherUsername: 'faculty',
    teacherName: 'Faculty Lead',
    assignedStudentCount: 13,
    assignedStudentIds: [
      'STU-002', 'STU-003', 'STU-004', 'STU-005', 'STU-006', 'STU-007', 'STU-008',
      'STU-009', 'STU-010', 'STU-011', 'STU-012', 'STU-013', 'STU-014'
    ],
    examDate: 'Nov 02, 2026',
    startTime: '08:30 AM',
    duration: '30 min',
    durationMinutes: 30,
    totalMarks: 10,
    instructions: 'Read questions and select the best response.',
    academicTerm: 'First semester',
    status: 'Completed',
    resultsReleased: true, // Graded and released to students!
    questions: [
      {
        id: 'EXM-005-Q1',
        questionNumber: 1,
        text: 'In English grammar, a sentence must contain at least a subject and a predicate.',
        type: 'True/false',
        marks: 2,
        options: [
          { id: 'A', text: 'True' },
          { id: 'B', text: 'False' }
        ],
        correctAnswer: 'A',
        explanation: 'A sentence requires a subject and predicate verb.'
      },
      {
        id: 'EXM-005-Q2',
        questionNumber: 2,
        text: 'Which word is an antonym for the word "benevolent"?',
        type: 'Multiple choice',
        marks: 2,
        options: [
          { id: 'A', text: 'Generous' },
          { id: 'B', text: 'Malevolent' },
          { id: 'C', text: 'Kind' },
          { id: 'D', text: 'Patient' }
        ],
        correctAnswer: 'B',
        explanation: 'Malevolent means wishing evil or harm to others.'
      },
      {
        id: 'EXM-005-Q3',
        questionNumber: 3,
        text: 'An active voice sentence places the actor before the verb.',
        type: 'True/false',
        marks: 2,
        options: [
          { id: 'A', text: 'True' },
          { id: 'B', text: 'False' }
        ],
        correctAnswer: 'A',
        explanation: 'In active voice, subject performs the action.'
      },
      {
        id: 'EXM-005-Q4',
        questionNumber: 4,
        text: 'Choose the correct spelling of the word denoting required participation:',
        type: 'Multiple choice',
        marks: 2,
        options: [
          { id: 'A', text: 'Nesessary' },
          { id: 'B', text: 'Necessary' },
          { id: 'C', text: 'Necesary' },
          { id: 'D', text: 'Nessessary' }
        ],
        correctAnswer: 'B',
        explanation: 'Correct spelling is Necessary (one c, two s).'
      },
      {
        id: 'EXM-005-Q5',
        questionNumber: 5,
        text: 'A metaphor makes a comparison without using words such as "like" or "as".',
        type: 'True/false',
        marks: 2,
        options: [
          { id: 'A', text: 'True' },
          { id: 'B', text: 'False' }
        ],
        correctAnswer: 'A',
        explanation: 'Similes use like/as; metaphors compare directly.'
      }
    ],
    createdAt: '2026-10-20T09:00:00Z',
    updatedAt: '2026-11-02T12:00:00Z'
  }
];

export const SEED_SUBMISSIONS: ExaminationSubmission[] = [
  // ==============================================================
  // SUBMISSIONS FOR EXM-005 (Completed English Examination)
  // Grade 10A (6 submissions) + Grade 10B (5 submissions) = 11 total
  // Demonstrates Grade distribution (A, B, C, D) and scoped class averages
  // ==============================================================
  // Grade 10A Submissions
  {
    id: 'SUB-2002',
    examId: 'EXM-005',
    examTitle: 'English Language & Literature Proficiency',
    examCode: 'ENG-102',
    studentId: 'STU-1002',
    studentName: 'Hana Bekele',
    studentUsername: 'hana.bekele',
    className: 'Grade 10A',
    submittedAt: 'Nov 02, 2026 · 09:15 AM',
    totalQuestions: 5,
    answeredCount: 5,
    unansweredCount: 0,
    status: 'Graded',
    score: 96,
    maxScore: 100,
    percentage: 96,
    grade: 'A',
    resultsReleased: true,
    teacherFeedback: 'Exceptional test performance, Hana! Flawless vocabulary selection and complete comprehension.',
    answers: {},
    questionGrading: {}
  },
  {
    id: 'SUB-2003',
    examId: 'EXM-005',
    examTitle: 'English Language & Literature Proficiency',
    examCode: 'ENG-102',
    studentId: 'STU-1003',
    studentName: 'Samuel Girma',
    studentUsername: 'samuel.girma',
    className: 'Grade 10A',
    submittedAt: 'Nov 02, 2026 · 09:18 AM',
    totalQuestions: 5,
    answeredCount: 5,
    unansweredCount: 0,
    status: 'Graded',
    score: 74,
    maxScore: 100,
    percentage: 74,
    grade: 'C',
    resultsReleased: true,
    teacherFeedback: 'Good effort, Samuel. Pay closer attention to active versus passive voice distinctions.',
    answers: {},
    questionGrading: {}
  },
  {
    id: 'SUB-2004',
    examId: 'EXM-005',
    examTitle: 'English Language & Literature Proficiency',
    examCode: 'ENG-102',
    studentId: 'STU-1004',
    studentName: 'Mekdes Alemu',
    studentUsername: 'mekdes.alemu',
    className: 'Grade 10A',
    submittedAt: 'Nov 02, 2026 · 09:20 AM',
    totalQuestions: 5,
    answeredCount: 5,
    unansweredCount: 0,
    status: 'Graded',
    score: 86,
    maxScore: 100,
    percentage: 86,
    grade: 'B',
    resultsReleased: true,
    teacherFeedback: 'Solid execution across both grammar and vocabulary questions.',
    answers: {},
    questionGrading: {}
  },
  {
    id: 'SUB-2005',
    examId: 'EXM-005',
    examTitle: 'English Language & Literature Proficiency',
    examCode: 'ENG-102',
    studentId: 'STU-1005',
    studentName: 'Dawit Kebede',
    studentUsername: 'dawit.kebede',
    className: 'Grade 10A',
    submittedAt: 'Nov 02, 2026 · 09:22 AM',
    totalQuestions: 5,
    answeredCount: 5,
    unansweredCount: 0,
    status: 'Graded',
    score: 78,
    maxScore: 100,
    percentage: 78,
    grade: 'B',
    resultsReleased: true,
    teacherFeedback: 'Very good score. Keep practicing literary devices and metaphor analysis.',
    answers: {},
    questionGrading: {}
  },
  {
    id: 'SUB-2006',
    examId: 'EXM-005',
    examTitle: 'English Language & Literature Proficiency',
    examCode: 'ENG-102',
    studentId: 'STU-1006',
    studentName: 'Liya Tadesse',
    studentUsername: 'liya.tadesse',
    className: 'Grade 10A',
    submittedAt: 'Nov 02, 2026 · 09:24 AM',
    totalQuestions: 5,
    answeredCount: 5,
    unansweredCount: 0,
    status: 'Graded',
    score: 88,
    maxScore: 100,
    percentage: 88,
    grade: 'A',
    resultsReleased: true,
    teacherFeedback: 'High accuracy throughout the multiple-choice section. Well done!',
    answers: {},
    questionGrading: {}
  },
  {
    id: 'SUB-2007',
    examId: 'EXM-005',
    examTitle: 'English Language & Literature Proficiency',
    examCode: 'ENG-102',
    studentId: 'STU-1007',
    studentName: 'Yared Haile',
    studentUsername: 'yared.haile',
    className: 'Grade 10A',
    submittedAt: 'Nov 02, 2026 · 09:25 AM',
    totalQuestions: 5,
    answeredCount: 5,
    unansweredCount: 0,
    status: 'Graded',
    score: 80,
    maxScore: 100,
    percentage: 80,
    grade: 'B',
    resultsReleased: true,
    teacherFeedback: 'Consistent answers and great grasp of reading comprehension.',
    answers: {},
    questionGrading: {}
  },

  // Grade 10B Submissions
  {
    id: 'SUB-2008',
    examId: 'EXM-005',
    examTitle: 'English Language & Literature Proficiency',
    examCode: 'ENG-102',
    studentId: 'STU-1009',
    studentName: 'Yonas Berhanu',
    studentUsername: 'yonas.berhanu',
    className: 'Grade 10B',
    submittedAt: 'Nov 02, 2026 · 09:14 AM',
    totalQuestions: 5,
    answeredCount: 5,
    unansweredCount: 0,
    status: 'Graded',
    score: 82,
    maxScore: 100,
    percentage: 82,
    grade: 'B',
    resultsReleased: true,
    teacherFeedback: 'Commendable grammar results, Yonas. Keep up the thorough revision.',
    answers: {},
    questionGrading: {}
  },
  {
    id: 'SUB-2009',
    examId: 'EXM-005',
    examTitle: 'English Language & Literature Proficiency',
    examCode: 'ENG-102',
    studentId: 'STU-1010',
    studentName: 'Selamawit Tefera',
    studentUsername: 'selamawit.tefera',
    className: 'Grade 10B',
    submittedAt: 'Nov 02, 2026 · 09:16 AM',
    totalQuestions: 5,
    answeredCount: 5,
    unansweredCount: 0,
    status: 'Graded',
    score: 92,
    maxScore: 100,
    percentage: 92,
    grade: 'A',
    resultsReleased: true,
    teacherFeedback: 'Top score in Grade 10B! Excellent vocabulary analysis.',
    answers: {},
    questionGrading: {}
  },
  {
    id: 'SUB-2010',
    examId: 'EXM-005',
    examTitle: 'English Language & Literature Proficiency',
    examCode: 'ENG-102',
    studentId: 'STU-1011',
    studentName: 'Biniyam Kassaye',
    studentUsername: 'biniyam.kassaye',
    className: 'Grade 10B',
    submittedAt: 'Nov 02, 2026 · 09:21 AM',
    totalQuestions: 5,
    answeredCount: 5,
    unansweredCount: 0,
    status: 'Graded',
    score: 68,
    maxScore: 100,
    percentage: 68,
    grade: 'D',
    resultsReleased: true,
    teacherFeedback: 'Needs revision in subject-verb agreement and vocabulary spelling.',
    answers: {},
    questionGrading: {}
  },
  {
    id: 'SUB-2011',
    examId: 'EXM-005',
    examTitle: 'English Language & Literature Proficiency',
    examCode: 'ENG-102',
    studentId: 'STU-1012',
    studentName: 'Ruth Negash',
    studentUsername: 'ruth.negash',
    className: 'Grade 10B',
    submittedAt: 'Nov 02, 2026 · 09:23 AM',
    totalQuestions: 5,
    answeredCount: 5,
    unansweredCount: 0,
    status: 'Graded',
    score: 76,
    maxScore: 100,
    percentage: 76,
    grade: 'C',
    resultsReleased: true,
    teacherFeedback: 'Satisfactory performance. Good understanding of reading passages.',
    answers: {},
    questionGrading: {}
  },
  {
    id: 'SUB-2012',
    examId: 'EXM-005',
    examTitle: 'English Language & Literature Proficiency',
    examCode: 'ENG-102',
    studentId: 'STU-1013',
    studentName: 'Kalkidan Desta',
    studentUsername: 'kalkidan.desta',
    className: 'Grade 10B',
    submittedAt: 'Nov 02, 2026 · 09:26 AM',
    totalQuestions: 5,
    answeredCount: 5,
    unansweredCount: 0,
    status: 'Graded',
    score: 64,
    maxScore: 100,
    percentage: 64,
    grade: 'D',
    resultsReleased: true,
    teacherFeedback: 'Review basic sentence structures and preposition usage rules.',
    answers: {},
    questionGrading: {}
  },
  {
    id: 'SUB-2013',
    examId: 'EXM-005',
    examTitle: 'English Language & Literature Proficiency',
    examCode: 'ENG-102',
    studentId: 'STU-1014',
    studentName: 'Nathnael Wondimu',
    studentUsername: 'nathnael.wondimu',
    className: 'Grade 10B',
    submittedAt: 'Nov 02, 2026 · 09:28 AM',
    totalQuestions: 5,
    answeredCount: 5,
    unansweredCount: 0,
    status: 'Graded',
    score: 88,
    maxScore: 100,
    percentage: 88,
    grade: 'A',
    resultsReleased: true,
    teacherFeedback: 'Outstanding reading analysis and vocabulary comprehension.',
    answers: {},
    questionGrading: {}
  },

  // ==============================================================
  // LIVE SUBMISSIONS FOR EXM-001 (Active Mathematics Examination)
  // Demonstrates live submissions in the Live Monitoring dashboard!
  // ==============================================================
  {
    id: 'SUB-1001',
    examId: 'EXM-001',
    examTitle: 'Mathematics — Midterm Assessment',
    examCode: 'MTH-204',
    studentId: 'STU-1002',
    studentName: 'Hana Bekele',
    studentUsername: 'hana.bekele',
    className: 'Grade 10A',
    submittedAt: 'Today · 09:50 AM',
    totalQuestions: 6,
    answeredCount: 6,
    unansweredCount: 0,
    status: 'Received',
    score: 10,
    maxScore: 12,
    percentage: 83,
    grade: 'B',
    resultsReleased: false,
    teacherFeedback: '',
    answers: {},
    questionGrading: {}
  },
  {
    id: 'SUB-1002',
    examId: 'EXM-001',
    examTitle: 'Mathematics — Midterm Assessment',
    examCode: 'MTH-204',
    studentId: 'STU-1006',
    studentName: 'Liya Tadesse',
    studentUsername: 'liya.tadesse',
    className: 'Grade 10A',
    submittedAt: 'Today · 09:53 AM',
    totalQuestions: 6,
    answeredCount: 6,
    unansweredCount: 0,
    status: 'Received',
    score: 12,
    maxScore: 12,
    percentage: 100,
    grade: 'A',
    resultsReleased: false,
    teacherFeedback: '',
    answers: {},
    questionGrading: {}
  },
  {
    id: 'SUB-1003',
    examId: 'EXM-001',
    examTitle: 'Mathematics — Midterm Assessment',
    examCode: 'MTH-204',
    studentId: 'STU-1010',
    studentName: 'Selamawit Tefera',
    studentUsername: 'selamawit.tefera',
    className: 'Grade 10B',
    submittedAt: 'Today · 09:55 AM',
    totalQuestions: 6,
    answeredCount: 6,
    unansweredCount: 0,
    status: 'Received',
    score: 10,
    maxScore: 12,
    percentage: 83,
    grade: 'B',
    resultsReleased: false,
    teacherFeedback: '',
    answers: {},
    questionGrading: {}
  },
  {
    id: 'SUB-1004',
    examId: 'EXM-001',
    examTitle: 'Mathematics — Midterm Assessment',
    examCode: 'MTH-204',
    studentId: 'STU-1012',
    studentName: 'Ruth Negash',
    studentUsername: 'ruth.negash',
    className: 'Grade 10B',
    submittedAt: 'Today · 09:58 AM',
    totalQuestions: 6,
    answeredCount: 6,
    unansweredCount: 0,
    status: 'Received',
    score: 8,
    maxScore: 12,
    percentage: 67,
    grade: 'C',
    resultsReleased: false,
    teacherFeedback: '',
    answers: {},
    questionGrading: {}
  }
];

export const SEED_ACTIVITY_LOGS: ActivityLogItem[] = [
  {
    id: 'ACT-001',
    action: 'Exam administrator launched Mathematics — Midterm Assessment live session',
    user: 'Faculty Lead',
    timestamp: 'Today, 9:30 AM',
    color: 'teal',
    examId: 'EXM-001'
  },
  {
    id: 'ACT-002',
    action: 'Assigned Grade 10A and Grade 10B to Mathematics — Midterm Assessment (13 students enrolled)',
    user: 'Faculty Lead',
    timestamp: 'Today, 9:25 AM',
    color: 'blue',
    examId: 'EXM-001'
  },
  {
    id: 'ACT-004',
    action: 'Published final assessment grades for English Language & Literature Proficiency',
    user: 'Faculty Lead',
    timestamp: 'Nov 02, 2026 · 12:00 PM',
    color: 'purple',
    examId: 'EXM-005'
  },
  {
    id: 'ACT-005',
    action: 'Scheduled Chemistry — Chemical Bonding for Nov 12, 2026',
    user: 'Faculty Lead',
    timestamp: 'Nov 01, 2026 · 04:15 PM',
    color: 'orange',
    examId: 'EXM-004'
  },
  {
    id: 'ACT-006',
    action: 'Added 10 new questions to the Central Question Bank',
    user: 'Faculty Lead',
    timestamp: 'Oct 30, 2026 · 11:30 AM',
    color: 'blue'
  }
];
