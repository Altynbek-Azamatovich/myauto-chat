import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, messages, title } = await req.json();
    
    if (!userId || !messages || messages.length <= 1) {
      return new Response(JSON.stringify({ success: false, error: "Invalid data" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Create conversation
    const { data: conversation, error: convError } = await supabase
      .from('chat_conversations')
      .insert({
        user_id: userId,
        title: title || 'Разговор'
      })
      .select()
      .single();

    if (convError) throw convError;

    // Save all messages
    const messagesToSave = messages.map((msg: any) => ({
      conversation_id: conversation.id,
      user_id: userId,
      role: msg.isBot ? 'assistant' : 'user',
      content: msg.text
    }));

    const { error: msgError } = await supabase
      .from('chat_messages')
      .insert(messagesToSave);

    if (msgError) throw msgError;

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Save session error:", error);
    return new Response(JSON.stringify({ success: false, error: "Failed to save" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
