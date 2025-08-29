
export const sanitizeInput = {
  // Sanitize string input by trimming and limiting length
  string: (input: string, maxLength: number = 255): string => {
    if (typeof input !== 'string') return '';
    return input.trim().substring(0, maxLength);
  },

  // Sanitize email input
  email: (email: string): string => {
    if (typeof email !== 'string') return '';
    return email.trim().toLowerCase().substring(0, 255);
  },

  // Sanitize HTML to prevent XSS
  html: (input: string): string => {
    if (typeof input !== 'string') return '';
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  },

  // Validate and sanitize phone numbers
  phone: (phone: string): string => {
    if (typeof phone !== 'string') return '';
    return phone.replace(/[^\d\s\-\(\)\+]/g, '').substring(0, 20);
  },

  // Validate slug format
  slug: (slug: string): boolean => {
    if (typeof slug !== 'string') return false;
    const slugRegex = /^[a-z0-9-]+$/;
    return slugRegex.test(slug) && slug.length <= 100;
  },
};

export const validateInput = {
  email: (email: string): { valid: boolean; error?: string } => {
    if (!email || typeof email !== 'string') {
      return { valid: false, error: 'Email é obrigatório' };
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { valid: false, error: 'Formato de email inválido' };
    }
    
    if (email.length > 255) {
      return { valid: false, error: 'Email muito longo' };
    }
    
    return { valid: true };
  },

  name: (name: string): { valid: boolean; error?: string } => {
    if (!name || typeof name !== 'string') {
      return { valid: false, error: 'Nome é obrigatório' };
    }
    
    if (name.trim().length < 2) {
      return { valid: false, error: 'Nome deve ter pelo menos 2 caracteres' };
    }
    
    if (name.length > 100) {
      return { valid: false, error: 'Nome muito longo' };
    }
    
    return { valid: true };
  },

  phone: (phone?: string): { valid: boolean; error?: string } => {
    if (!phone) return { valid: true }; // Optional field
    
    if (phone.length > 20) {
      return { valid: false, error: 'Telefone muito longo' };
    }
    
    return { valid: true };
  },
};

// Rate limiting utility for client-side
export class ClientRateLimit {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();
  
  constructor(
    private maxAttempts: number = 5,
    private windowMs: number = 15 * 60 * 1000 // 15 minutes
  ) {}
  
  canAttempt(key: string): boolean {
    const now = Date.now();
    const current = this.attempts.get(key);
    
    if (!current || now > current.resetTime) {
      this.attempts.set(key, { count: 1, resetTime: now + this.windowMs });
      return true;
    }
    
    if (current.count >= this.maxAttempts) {
      return false;
    }
    
    current.count++;
    return true;
  }
  
  getRemainingTime(key: string): number {
    const current = this.attempts.get(key);
    if (!current) return 0;
    
    return Math.max(0, current.resetTime - Date.now());
  }
}

// Content Security Policy helpers
export const CSP_DIRECTIVES = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'", "'unsafe-inline'", "https://js.stripe.com"],
  styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
  imgSrc: ["'self'", "data:", "https:", "blob:"],
  connectSrc: ["'self'", "https://*.supabase.co", "https://api.stripe.com"],
  fontSrc: ["'self'", "https://fonts.gstatic.com"],
  frameSrc: ["'self'", "https://js.stripe.com"],
};
