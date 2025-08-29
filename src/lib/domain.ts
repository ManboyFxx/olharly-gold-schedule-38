
/**
 * Utility functions for domain detection and handling
 */

export interface DomainInfo {
  isLocalhost: boolean;
  isProduction: boolean;
  subdomain: string | null;
  hostname: string;
  baseUrl: string;
  isCustomDomain: boolean;
  organizationSlug: string | null;
}

/**
 * Detects the current domain information
 */
export const getDomainInfo = (): DomainInfo => {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const port = window.location.port;
  
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
  const isProduction = hostname.includes('olharly.online') || hostname.includes('olharly.com');
  const isCustomDomain = !isLocalhost && !isProduction;
  
  let subdomain: string | null = null;
  let organizationSlug: string | null = null;
  let baseUrl = `${protocol}//${hostname}`;
  
  if (port && port !== '80' && port !== '443') {
    baseUrl += `:${port}`;
  }
  
  if (isProduction) {
    const parts = hostname.split('.');
    if (parts.length > 2) {
      subdomain = parts[0];
      if (subdomain === 'www') {
        subdomain = null;
      } else {
        organizationSlug = subdomain;
      }
    }
  } else if (isLocalhost) {
    // Para localhost, podemos usar query parameters ou path para simular subdomínios
    const urlParams = new URLSearchParams(window.location.search);
    subdomain = urlParams.get('org') || null;
    organizationSlug = subdomain;
  } else if (isCustomDomain) {
    // Para domínios customizados, assumir que é da organização
    organizationSlug = hostname.split('.')[0];
  }
  
  return {
    isLocalhost,
    isProduction,
    subdomain,
    hostname,
    baseUrl,
    isCustomDomain,
    organizationSlug
  };
};

/**
 * Gets the organization slug from the current domain or URL
 */
export const getOrganizationSlug = (): string | null => {
  const domainInfo = getDomainInfo();
  
  // Se temos um subdomínio, use-o como slug
  if (domainInfo.subdomain) {
    return domainInfo.subdomain;
  }
  
  // Caso contrário, tente extrair do query parameter
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('org') || null;
};

/**
 * Generates a booking URL for an organization
 */
export const generateBookingUrl = (orgSlug: string): string => {
  const domainInfo = getDomainInfo();
  return `${domainInfo.baseUrl}/booking?org=${orgSlug}`;
};

/**
 * Generates a professional booking URL
 */
export const generateProfessionalUrl = (professionalSlug: string): string => {
  // Usar domínio atual + /slug (sem /booking)
  const baseUrl = `${window.location.protocol}//${window.location.host}`;
  return `${baseUrl}/${professionalSlug}`;
};
