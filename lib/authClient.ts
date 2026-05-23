export interface UserSession {
  userId: string;
  email: string;
  name?: string;
}

// Client-side helper to read basic auth state from cookies
export function getLocalSession(): UserSession | null {
  if (typeof window === "undefined") return null;
  try {
    const sessionStr = document.cookie
      .split("; ")
      .find((row) => row.startsWith("rf_session="))
      ?.split("=")[1];
    
    if (!sessionStr) return null;
    return JSON.parse(decodeURIComponent(sessionStr)) as UserSession;
  } catch (err) {
    return null;
  }
}
