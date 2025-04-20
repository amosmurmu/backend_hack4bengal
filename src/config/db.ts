import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';
// console.log(supabaseUrl, supabaseKey);
export const supabase = createClient(supabaseUrl, supabaseKey);
export async function testConnection() {
  try {
    const { data, error } = await supabase.from('users').select('*').limit(1);

    if (error) throw error;
    console.log('Supabase connection successful');
    return { success: true, data };
  } catch (error) {
    console.error('Supabase connection failed:', error);
    return { sucess: false, error };
  }
}
