// Configuration for Print-Fy Application

// TODO: If a specific domain is required (e.g. university campus domain like "campus.edu"),
// configure it here. Empty string means any valid email domain is permitted.
export const ALLOWED_EMAIL_DOMAIN = "";

// Role-based home redirects
export const ROLE_HOME = {
  student: "/dashboard",
  // Dedicated operator dashboard route
  operator: "/operator",
  // Default fallback
  admin: "/",
};

// Application operational mode
export const DEMO_MODE = true;

// Campus Desk Timezone (Intl.DateTimeFormat formatting)
export const DESK_TIMEZONE = "Asia/Karachi";

// Grace period for late arrivals
// TODO: The rule for students who miss their booked slot is undecided: don't invent one.
export const GRACE_MINUTES = null;

// Arrival window threshold for queue position
// TODO: Arrival window threshold for queue position is undecided: don't invent one. The server must also reject early arrival.
export const ARRIVAL_WINDOW_POSITION = null;

// Queue polling interval in seconds
export const POLL_SECONDS = 6;

// Campus Support and Desk Details
// TODO: University admin will configure official desk contact values
export const HELPLINE_PHONE = "";
export const SUPPORT_EMAIL = "";
export const DESK_HOURS = "";
export const DESK_LOCATION = "";

