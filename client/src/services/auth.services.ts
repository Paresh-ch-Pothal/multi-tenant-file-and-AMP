import { api } from "../api/apiClient";


export async function loginWithGoogle(credential: string) {
  const { data } = await api.post('/auth/google', { credential });
  return data; // { token, user }
}

export async function bootstrapTenant(params: {
  credential: string;
  company_name: string;
  subdomain: string;
}) {
  const { data } = await api.post('/tenant/bootstrap', params);
  return data; // { token, tenant, user }
}