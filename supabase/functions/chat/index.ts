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

    const systemPrompt = `Ты — помощник водителя в Казахстане. Отвечай кратко: всегда 2–3 предложения, без воды.
Знаешь: ПДД РК (правила дорожного движения Казахстана), цены в тенге, СТО и автотематику.
Отвечай на том же языке, на котором задан вопрос: на казахском или русском.${carContext}`;

    // Convert messages to Gemini format
    const geminiContents = [];
    
    // Add system instruction as first user message context
    geminiContents.push({
      role: "user",
      parts: [{ text: `[System]: ${systemPrompt}` }]
    });
    geminiContents.push({
      role: "model",
      parts: [{ text: "Түсіндім. Қазақстанда жүргізушіге көмектесемін. Қысқа және нақты жауап беремін. Понял. Отвечаю кратко и по делу на казахском или русском." }]
    });

    // Add conversation messages
    for (const msg of messages) {
      geminiContents.push({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }]
      });
    }

    console.log("Calling Gemini API (gemini-1.5-flash)");

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
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

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    return new Response(JSON.stringify({ content: text }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Неизвестная ошибка" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
