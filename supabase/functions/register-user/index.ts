import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, password } = await req.json();
    console.log('Registering user with phone:', phone);

    if (!phone || !password) {
      throw new Error('Phone and password are required');
    }

    // Initialize Supabase admin client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Convert phone to email format
    const emailFromPhone = `${phone.replace(/[^0-9]/g, '')}@phone.app`;

    // Create user with admin API (bypasses email signup restrictions)
    const { data: user, error: createError } = await supabase.auth.admin.createUser({
      email: emailFromPhone,
      password: password,
      email_confirm: true,
      user_metadata: {
        phone: phone
      }
    });

    if (createError) {
      console.error('Error creating user:', createError);
      throw createError;
    }

    console.log('User created successfully:', user.user?.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'User registered successfully',
        userId: user.user?.id 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error: any) {
    console.error('Error in register-user function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to register user',
        details: error.toString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
