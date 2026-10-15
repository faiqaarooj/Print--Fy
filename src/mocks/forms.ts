/**
 * SAMPLE FORMS - the university admin will add real documents later
 */

export interface UniversityForm {
  id: string;
  title: string;
  category: 'Leave' | 'Certificates' | 'Clearance';
  description: string;
  pages: number;
  format: string;
  fileUrl: string | null; // null simulates form without file uploaded yet
  previewDetails: {
    office: string;
    subject: string;
    fields: string[];
  };
}

export const sampleUniversityForms: UniversityForm[] = [
  {
    id: 'form-leave-app',
    title: 'Leave Application',
    category: 'Leave',
    description: 'Request permission to be absent from classes for personal reasons.',
    pages: 1,
    format: 'PDF • 1 page • A4',
    fileUrl: null, // Demo: null shows "File not added yet" in real mode, or demo toast
    previewDetails: {
      office: 'STUDENT AFFAIRS OFFICE',
      subject: 'Request for leave of absence',
      fields: [
        'Student name',
        'Student ID',
        'Semester / section',
        'Department',
        'From date (DD / MM / YYYY)',
        'To date (DD / MM / YYYY)',
        'Reason for leave',
      ],
    },
  },
  {
    id: 'form-med-leave',
    title: 'Medical Leave',
    category: 'Leave',
    description: 'Apply for health-related leave with a medical certificate attached.',
    pages: 1,
    format: 'PDF • 1 page • A4',
    fileUrl: null,
    previewDetails: {
      office: 'HEALTH & WELLNESS CLINIC',
      subject: 'Application for medical exemption',
      fields: [
        'Patient / Student name',
        'Roll number',
        'Attending physician name',
        'Hospital / Clinic registration',
        'Admission / Rest period',
        'Medical certificate summary',
      ],
    },
  },
  {
    id: 'form-bonafide',
    title: 'Bonafide Certificate Request',
    category: 'Certificates',
    description: 'Request proof of enrollment for a bank, scholarship, or visa application.',
    pages: 1,
    format: 'PDF • 1 page • A4',
    fileUrl: null,
    previewDetails: {
      office: 'REGISTRAR OFFICE',
      subject: 'Issuance of Bonafide / Enrollment Certificate',
      fields: [
        'Full name',
        'Registration number',
        'Current degree program',
        'Purpose of certificate (Bank / Visa / Internship)',
        'Academic year',
      ],
    },
  },
  {
    id: 'form-clearance',
    title: 'No-Dues Clearance',
    category: 'Clearance',
    description: 'Collect departmental, library, and hostel clearance before semester end.',
    pages: 2,
    format: 'PDF • 2 pages • A4',
    fileUrl: null,
    previewDetails: {
      office: 'ACADEMIC SERVICES',
      subject: 'Final Clearance Certificate (No Dues)',
      fields: [
        'Student roll number',
        'Department chair signature',
        'Central library clearance stamp',
        'Hostel warden clearance',
        'Accounts finance verification',
      ],
    },
  },
  {
    id: 'form-transcript',
    title: 'Transcript Request',
    category: 'Certificates',
    description: 'Request your academic transcript from the examination office.',
    pages: 1,
    format: 'PDF • 1 page • A4',
    fileUrl: null,
    previewDetails: {
      office: 'EXAMINATION CONTROLLER',
      subject: 'Official Academic Transcript Application',
      fields: [
        'Student name',
        'Degree & Major',
        'Graduation / Completion year',
        'Mailing address or desk collection',
        'Urgent / Regular processing',
      ],
    },
  },
  {
    id: 'form-hostel-leave',
    title: 'Hostel Leave',
    category: 'Leave',
    description: 'Seek warden approval for an overnight stay or a visit home.',
    pages: 1,
    format: 'PDF • 1 page • A4',
    fileUrl: null,
    previewDetails: {
      office: 'CAMPUS RESIDENCE & HOSTELS',
      subject: 'Night Out / Hostel Exit Permission',
      fields: [
        'Resident name',
        'Room / Hall number',
        'Destination address',
        'Emergency contact phone',
        'Expected return time',
      ],
    },
  },
];
