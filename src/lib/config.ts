// Configuration for Print-Fy Application

// TODO: If a specific domain is required (e.g. university campus domain like "campus.edu"),
// configure it here. Empty string means any valid email domain is permitted.
export const ALLOWED_EMAIL_DOMAIN: string = "";

// Role-based home redirects
export const ROLE_HOME: Record<string, string> = {
  // Dedicated student dashboard route
  student: "/dashboard",
  // TODO: Add dedicated operator dashboard route when implemented
  operator: "/",
  // Default fallback
  admin: "/",
};

// Application operational mode
export const DEMO_MODE: boolean = true;

// Campus Desk Timezone (Intl.DateTimeFormat formatting)
export const DESK_TIMEZONE: string = "Asia/Karachi";

// Grace period for late arrivals
// TODO: The rule for students who miss their booked slot is undecided: don't invent one.
export const GRACE_MINUTES: number | null = null;

// Arrival window threshold for queue position
// TODO: Arrival window threshold for queue position is undecided: don't invent one. The server must also reject early arrival.
export const ARRIVAL_WINDOW_POSITION: number | null = null;

// Queue polling interval in seconds
export const POLL_SECONDS: number = 6;

// Campus Support and Desk Details
// TODO: University admin will configure official desk contact values
export const HELPLINE_PHONE: string = "";
export const SUPPORT_EMAIL: string = "";
export const DESK_HOURS: string = "";
export const DESK_LOCATION: string = "";

