import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fnxufhbguwkqemxfylyf.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZueHVmaGJndXdrcWVteGZ5bHlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2OTk5NzQsImV4cCI6MjA5MzI3NTk3NH0.dh_8e3K04u-XU7u97_YV1dqPS7wbOqo6pG4T82PqZdQILAGAY-MO-DITO-ANG-ANON-KEY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})