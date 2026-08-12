import { supabase } from './supabase.js';

const API_URL = import.meta.env.VITE_API_URL || 'https://trackathon-backend-yxsw.onrender.com/api';

async function getHeaders(isMultipart = false): Promise<HeadersInit> {
  const headers: HeadersInit = {};
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  
  // Get active session token from Supabase client
  const sessionResult = await supabase.auth.getSession();
  const session = sessionResult?.data?.session ?? null;
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }
  
  return headers;
}

export const api = {
  async get(endpoint: string) {
    const headers = await getHeaders();
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'GET',
      headers
    });
    
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Request failed with status ${res.status}`);
    }
    return res.json();
  },

  async post(endpoint: string, body: any, isMultipart = false) {
    const headers = await getHeaders(isMultipart);
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: isMultipart ? body : JSON.stringify(body)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Request failed with status ${res.status}`);
    }
    return res.json();
  },

  async put(endpoint: string, body: any, isMultipart = false) {
    const headers = await getHeaders(isMultipart);
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: isMultipart ? body : JSON.stringify(body)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Request failed with status ${res.status}`);
    }
    return res.json();
  },

  async delete(endpoint: string) {
    const headers = await getHeaders();
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Request failed with status ${res.status}`);
    }
    return res.json();
  }
};
export default api;
