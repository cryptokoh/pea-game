/**
 * Supabase Client Configuration
 * Pure Extracts Adventures (PEA)
 *
 * Three client instances for cross-schema access:
 * - gameClient: game schema (player profiles, XP, quests)
 * - repsClient: reps schema (contacts, leads, orders, KPIs)
 * - publicClient: public schema (wholesale orders, invoices, pricing)
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://uqyfsqenjakqyzixfcta.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxeWZzcWVuamFrcXl6aXhmY3RhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1NTQzMjAsImV4cCI6MjA4NTEzMDMyMH0.SFFaYsDxdlHCFU30aV3Qzi6SI7759o2bePCaqKAHkTA';

const authOptions = {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
};

export const gameClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    ...authOptions,
    db: { schema: 'game' }
});

export const repsClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    ...authOptions,
    db: { schema: 'reps' }
});

export const publicClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    ...authOptions,
    db: { schema: 'public' }
});

// Auth convenience — use gameClient for auth (same underlying auth for all)
export const auth = gameClient.auth;
