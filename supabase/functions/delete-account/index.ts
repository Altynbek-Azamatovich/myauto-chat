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
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the user from the JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Invalid user token');
    }

    const userId = user.id;
    console.log('Deleting account for user:', userId);

    // Delete user's data from related tables (in order of dependencies)
    
    // Delete chat messages
    await supabase
      .from('chat_messages')
      .delete()
      .eq('user_id', userId);
    
    // Delete chat conversations
    await supabase
      .from('chat_conversations')
      .delete()
      .eq('user_id', userId);

    // Delete help responses
    await supabase
      .from('help_responses')
      .delete()
      .eq('responder_id', userId);

    // Delete help requests
    await supabase
      .from('help_requests')
      .delete()
      .eq('user_id', userId);

    // Delete service history (through vehicles)
    const { data: vehicles } = await supabase
      .from('user_vehicles')
      .select('id')
      .eq('user_id', userId);

    if (vehicles && vehicles.length > 0) {
      const vehicleIds = vehicles.map(v => v.id);
      await supabase
        .from('service_history')
        .delete()
        .in('vehicle_id', vehicleIds);
    }

    // Delete user vehicles
    await supabase
      .from('user_vehicles')
      .delete()
      .eq('user_id', userId);

    // Delete reviews
    await supabase
      .from('reviews')
      .delete()
      .eq('user_id', userId);

    // Delete notifications
    await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId);

    // Delete profile
    await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    // Delete user roles
    await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId);

    // Delete avatar from storage
    const { data: avatarFiles } = await supabase.storage
      .from('avatars')
      .list(userId);

    if (avatarFiles && avatarFiles.length > 0) {
      const filesToDelete = avatarFiles.map(file => `${userId}/${file.name}`);
      await supabase.storage.from('avatars').remove(filesToDelete);
    }

    // Finally, delete the user from auth
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
    
    if (deleteError) {
      console.error('Error deleting user from auth:', deleteError);
      throw new Error('Failed to delete user account');
    }

    console.log('Account deleted successfully for user:', userId);

    return new Response(
      JSON.stringify({ success: true, message: 'Account deleted successfully' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error: any) {
    console.error('Error in delete-account function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to delete account'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
