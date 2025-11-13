/**
 * Supabase helper functions to handle type assertions
 * These helpers work around TypeScript strict mode issues with Supabase client
 */

import { createClient } from '@/lib/supabase/client'

/**
 * Get authenticated Supabase client with user
 */
export async function getAuthenticatedClient() {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return { supabase: null, user: null, error: 'Unauthorized' }
  }
  
  return { supabase, user, error: null }
}

/**
 * Get user profile with proper typing
 */
export async function getUserProfile(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  return { profile: data as any, error }
}

/**
 * Type-safe insert helper
 */
export async function insertRecord<T = any>(
  table: string,
  data: any
): Promise<{ data: T | null; error: any }> {
  const supabase = createClient()
  const result = await supabase
    .from(table)
    .insert(data as any)
    .select()
    .single()
  
  return { data: result.data as T, error: result.error }
}

/**
 * Type-safe update helper
 */
export async function updateRecord<T = any>(
  table: string,
  id: string,
  data: any
): Promise<{ data: T | null; error: any }> {
  const supabase = createClient()
  const result = await supabase
    .from(table)
    .update(data as any)
    .eq('id', id)
    .select()
    .single()
  
  return { data: result.data as T, error: result.error }
}

/**
 * Type-safe query helper
 */
export async function queryRecords<T = any>(
  table: string,
  selectQuery: string = '*'
): Promise<{ data: T[] | null; error: any }> {
  const supabase = createClient()
  const result = await supabase
    .from(table)
    .select(selectQuery)
  
  return { data: result.data as T[], error: result.error }
}
