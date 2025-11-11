/**
 * Generates a referral link with the user's email as a query parameter
 * @param userEmail - The email of the referring user
 * @param baseUrl - The base URL of the application (optional, will use window.location.origin in browser)
 * @returns The referral link with the ref query parameter
 */
export function generateReferralLink(
  userEmail: string,
  baseUrl?: string
): string {
  const base =
    baseUrl || (typeof window !== "undefined" ? window.location.origin : "");
  const encodedEmail = encodeURIComponent(userEmail);
  return `${base}/signup?ref=${encodedEmail}`;
}

/**
 * Extracts the referral email from a URL's query parameters
 * @param url - The URL to extract from (optional, will use current location in browser)
 * @returns The referral email if found, null otherwise
 */
export function extractReferralEmail(url?: string): string | null {
  let searchParams: URLSearchParams;

  if (url) {
    try {
      const urlObj = new URL(url);
      searchParams = urlObj.searchParams;
    } catch {
      return null;
    }
  } else if (typeof window !== "undefined") {
    searchParams = new URLSearchParams(window.location.search);
  } else {
    return null;
  }

  return searchParams.get("ref");
}
