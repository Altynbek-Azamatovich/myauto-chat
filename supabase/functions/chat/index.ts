import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, userId } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

    // Get user's car info for personalized responses
    let carContext = "";
    if (userId) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data: profile } = await supabase
        .from('profiles')
        .select('car_brand, car_model, car_year, city')
        .eq('id', userId)
        .single();

      const { data: vehicles } = await supabase
        .from('user_vehicles')
        .select('model, year, mileage, car_brands(brand_name)')
        .eq('user_id', userId);

      const { data: chatHistory } = await supabase
        .from('chat_messages')
        .select('content, role')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (profile?.car_brand || profile?.car_model) {
        carContext += `\n\nИНФО О МАШИНЕ:`;
        if (profile.car_brand) carContext += ` ${profile.car_brand}`;
        if (profile.car_model) carContext += ` ${profile.car_model}`;
        if (profile.car_year) carContext += ` ${profile.car_year}`;
        if (profile.city) carContext += `, г.${profile.city}`;
      }

      if (vehicles && vehicles.length > 0) {
        carContext += `\nГАРАЖ:`;
        for (const v of vehicles) {
          const brandName = (v.car_brands as any)?.brand_name || '';
          carContext += ` ${brandName} ${v.model} ${v.year}, ${v.mileage}км;`;
        }
      }

      if (chatHistory && chatHistory.length > 0) {
        carContext += `\nКОНТЕКСТ ПРОШЛЫХ БЕСЕД:`;
        const reversed = chatHistory.reverse().slice(0, 10);
        for (const msg of reversed) {
          carContext += `\n[${msg.role}]: ${msg.content.substring(0, 100)}`;
        }
      }
    }

    const systemPrompt = `Ты — лаконичный помощник водителя в Казахстане. Знаешь цены в тенге, ПДД РК и СТО. Отвечай без воды, максимум 2-3 предложения. Используй простой язык.${carContext}`;

    // Convert messages to Gemini format
    const geminiContents = [];
    
    // Add system instruction as first user message context
    geminiContents.push({
      role: "user",
      parts: [{ text: `[System]: ${systemPrompt}` }]
    });
    geminiContents.push({
      role: "model", 
      parts: [{ text: "Понял, я помощник водителя в Казахстане. Отвечаю кратко и по делу." }]
    });

    // Add conversation messages
    for (const msg of messages) {
      geminiContents.push({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }]
      });
    }

    console.log("Calling Gemini API directly");

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: geminiContents,
          generationConfig: {
            maxOutputTokens: 500,
            temperature: 0.7,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Слишком много запросов, попробуйте позже." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "Ошибка AI сервиса" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Transform Gemini SSE stream to OpenAI-compatible SSE stream
    const transformStream = new TransformStream({
      transform(chunk, controller) {
        const text = new TextDecoder().decode(chunk);
        const lines = text.split('\n');
        
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (!jsonStr) continue;
          
          try {
            const geminiData = JSON.parse(jsonStr);
            const content = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
            
            if (content) {
              // Convert to OpenAI-compatible format
              const openAiChunk = {
                choices: [{
                  delta: { content },
                  index: 0,
                }]
              };
              controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(openAiChunk)}\n\n`));
            }
            
            // Check for finish
            if (geminiData?.candidates?.[0]?.finishReason) {
              controller.enqueue(new TextEncoder().encode(`data: [DONE]\n\n`));
            }
          } catch {
            // Skip unparseable chunks
          }
        }
      }
    });

    const stream = response.body!.pipeThrough(transformStream);

    return new Response(stream, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Неизвестная ошибка" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
