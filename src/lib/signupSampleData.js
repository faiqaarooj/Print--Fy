// SAMPLE DATA for Print-Fy Sign Up decorative preview panel
// All numbers and file names are SAMPLE / mock values for UI demonstration only.
// aria-hidden="true" will be used on this decorative panel; no real network calls are made.

export const signupSampleData = {
  printQueue: {
    title: "PRINT QUEUE",
    count: "7 jobs",
    totalTime: "38 min total",
  },
  nextUp: {
    badge: "NEXT UP",
    fileName: "Assignment 1.pdf", // Fix applied: was 'Assignment 1 .pdf' in Figma
    specifications: "A3 · Color · 24 pages  •  12 min",
    time: "10:42",
  },
  printingNow: {
    badge: "PRINTING NOW",
    fileName: "Annual_Report_2026.pdf",
    timeRemaining: "08:15 remaining",
    progressPercent: 64,
    eta: "Finishes 10:38",
  },
  queueTimeline: {
    badge: "QUEUE TIMELINE",
    heading: "On track for 11:26",
    summary: "3 jobs ahead  •  48 min scheduled",
  },
  labReport: {
    title: "Lab report DSA",
    details: "Queued · A4 color · 18 sheets",
    startsLabel: "Starts",
    startTime: "10:58",
    durationLabel: "Duration",
    durationTime: "09 min",
  },
  onTimeRate: {
    badge: "ON-TIME RATE",
    rate: "92%",
    timeframe: "Today",
    progressPercent: 92,
  },
  liveQueue: {
    printerName: "PRODUCTION PRINTER 01",
    heading: "Live queue",
    statusBadge: "RUNNING",
    currentJob: {
      tag: "NOW",
      name: "Annual Report",
      time: "08:15",
      progressPercent: 64,
    },
    nextJob: {
      tag: "NEXT",
      name: "Brand Guidelines",
      time: "10:42",
    },
    laterJob: {
      tag: "LATER",
      name: "Lab reports DSA",
      time: "10:58",
    },
    estimatedCompletionLabel: "Estimated queue completion",
    estimatedCompletionTime: "11:26",
  },
};
