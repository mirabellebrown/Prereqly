/** UCSB Economics B.A. — 2025–2026 major requirements sheet (demo reference). */

export const ECON_MAJOR_SHEET_LABEL = '2025–2026'

export const PRE_MAJOR_ADMISSION = {
  courses: ['ECON 1', 'ECON 2', 'ECON 10A'],
  minGpa: 2.85,
  minGrade: 'C',
  note: 'Grades in ECON 1, 2, and 10A count toward the 2.85 pre-major GPA. No grade below C is accepted.',
}

export const PREP_FOR_MAJOR = {
  statsOptions: ['ECON 5', 'PSTAT 120A'],
  mathOptionsLabel: 'MATH 2A–B, 3A–B, or 34A–B',
  minGrade: 'C',
  note: 'ECON 5 or PSTAT 120A and calculus must be completed with C or higher; these grades apply to the overall major GPA but not the pre-major GPA.',
  ucsbRequired: ['ECON 5', 'ECON 10A'],
}

export const UPPER_DIVISION_CORE = [
  { code: 'ECON 100B', title: 'Intermediate Macroeconomic Theory', units: 4 },
  { code: 'ECON 101', title: 'Statistics for Economists', units: 4 },
  { code: 'ECON 140A', title: 'Intermediate Microeconomic Theory II', units: 4 },
]

export const UPPER_DIVISION_ELECTIVE_UNITS = 28
export const UPPER_DIVISION_ELECTIVE_COUNT = 7

export const UPPER_DIVISION_REGULATIONS = {
  totalUnits: 40,
  maxEcon199Units: 4,
  econ199raDoesNotCount: true,
  areaDSummary:
    'Six UD electives from Area D (100C, 106, 107A–B, 112A–B, 113A–B, 114A–B, 115, 116A–B–C, 117A, 120, 122, 127, 130, 133, 134A–B–C, 135, 140B–C, 141, 145, 150A, 151–157, 160, 164, 170, 171, 174, 176–177, 180–181, 183–184, 187, 191AA–ZZ, 196A–B, 199, and others on the sheet).',
  additionalElectiveSummary:
    'One additional UD elective from Area D or ECON 118, 136A–B–C, 137A–B, 138A–B, or 185.',
}
