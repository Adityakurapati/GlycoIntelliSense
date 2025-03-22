// // supabase.js
// import { createClient } from '@supabase/supabase-js';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const supabaseUrl='https://uqvcymqhscdynyzwvpsl.supabase.co';
// const supabaseAnonKey='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxdmN5bXFoc2NkeW55end2cHNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAyMTYzNTYsImV4cCI6MjA1NTc5MjM1Nn0.7d70xPJPcEPZe9SPiIvcTspVR5CJDW_ShKpAV1PlSLQ';

// const supabase=createClient( supabaseUrl, supabaseAnonKey, {
//         auth: {
//                 storage: AsyncStorage,
//                 autoRefreshToken: true,
//                 persistSession: true,
//                 detectSessionInUrl: false,
//         },
// } );

// export default supabase;