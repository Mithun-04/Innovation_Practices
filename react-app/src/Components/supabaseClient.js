import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ayblkwfzlmtlmsheoabf.supabase.co"; 
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5Ymxrd2Z6bG10bG1zaGVvYWJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk2Mzg2MDIsImV4cCI6MjA1NTIxNDYwMn0.3tUK2A9lsr-xvH7V30vCC3nnLknNOwwS3Z1F5TiW39s";  // Replace with your Supabase anon key
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;