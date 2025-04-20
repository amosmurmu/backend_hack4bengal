import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { supabase } from '../config/db';

console.log(process.env.SUPABASE_URL);
const createTestUser = async () => {
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'test01@gmail.com',
    password: 'test1234',
    email_confirm: true,
  });
  if (error) {
    console.error('Error creating test user:', error);
    return;
  }
  console.log('Test user created:', data);
};

createTestUser();
