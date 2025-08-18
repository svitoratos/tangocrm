// Admin configuration - central place to manage admin access
export const ADMIN_EMAILS = [
  "stevenvitoratos@gmail.com", // Your email
  "svitoratos13@gmail.com", // Admin email for testing/development
  "stephanosvitoratos13@gmail.com", // Admin email
  // Add more admin emails here as needed
  // "admin2@example.com",
  // "admin3@example.com",
];

export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email);
}

export function getAdminEmails(): string[] {
  return [...ADMIN_EMAILS];
} 