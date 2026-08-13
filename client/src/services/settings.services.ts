import { api } from "../api/apiClient";


interface Branding {
  app_title: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
}

export async function updateSettings(branding: Partial<Branding>) {
  const { data } = await api.patch('/settings', { branding });
  return data;
}