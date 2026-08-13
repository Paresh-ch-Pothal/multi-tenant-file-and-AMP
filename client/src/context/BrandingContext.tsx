import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useAuth } from './authContext';
import { api } from '../api/apiClient';

interface Branding {
  app_title: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
}

interface BrandingContextValue {
  branding: Branding | null;
  loading: boolean;
  refetch: () => Promise<void>; // 1. Added refetch to the interface
}

const defaultBranding: Branding = {
  app_title: 'File Portal',
  logo_url: null,
  primary_color: '#2563EB',
  secondary_color: '#7C3AED',
};

const BrandingContext = createContext<BrandingContextValue>({
  branding: null,
  loading: true,
  refetch: async () => {}, // 2. Provided default fallback
});

function applyBranding(branding: Branding) {
  const root = document.documentElement;
  root.style.setProperty('--brand-primary', branding.primary_color);
  root.style.setProperty('--brand-secondary', branding.secondary_color);
}

export function BrandingProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [branding, setBranding] = useState<Branding | null>(null);
  const [loading, setLoading] = useState(true);

  // 3. Extracted loading logic so it can be called on demand via refetch
  const loadBranding = useCallback(async () => {
    setLoading(true);
    try {
      if (isAuthenticated) {
        const { data } = await api.get('/settings');
        setBranding(data.branding);
        applyBranding(data.branding);
      } else {
        const subdomain = window.location.hostname.split('.')[0];
        const isLocalOrRoot = ['localhost', '127', 'yourapp'].includes(subdomain);
        if (!isLocalOrRoot) {
          const { data } = await api.get(`/settings?subdomain=${subdomain}`);
          setBranding(data.branding);
          applyBranding(data.branding);
        } else {
          setBranding(defaultBranding);
          applyBranding(defaultBranding);
        }
      }
    } catch {
      setBranding(defaultBranding);
      applyBranding(defaultBranding);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadBranding();
  }, [loadBranding]);

  return (
    <BrandingContext.Provider value={{ branding, loading, refetch: loadBranding }}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  return useContext(BrandingContext);
}