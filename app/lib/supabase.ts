import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lujfahankslcpcywiugh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1amZhaGFua3NsY3BjeXdpdWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1OTcxNzYsImV4cCI6MjEwNDE3MzE3Nn0.hT67qiXSALzl561rCCbfg44C7P9yAQl-EeKiQnGL3kg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);