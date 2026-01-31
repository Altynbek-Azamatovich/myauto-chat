import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, userId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Get user's car info for personalized responses
    let carContext = "";
    if (userId) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Get user profile with car info
      const { data: profile } = await supabase
        .from('profiles')
        .select('car_brand, car_model, car_year, city')
        .eq('id', userId)
        .single();

      // Get user's vehicles
      const { data: vehicles } = await supabase
        .from('user_vehicles')
        .select('model, year, mileage, car_brands(brand_name)')
        .eq('user_id', userId);

      // Get recent chat history for context (last 50 messages from past conversations)
      const { data: chatHistory } = await supabase
        .from('chat_messages')
        .select('content, role')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (profile?.car_brand || profile?.car_model) {
        carContext += `\n\nИНФОРМАЦИЯ О МАШИНЕ ПОЛЬЗОВАТЕЛЯ:`;
        if (profile.car_brand) carContext += `\n- Марка: ${profile.car_brand}`;
        if (profile.car_model) carContext += `\n- Модель: ${profile.car_model}`;
        if (profile.car_year) carContext += `\n- Год: ${profile.car_year}`;
        if (profile.city) carContext += `\n- Город: ${profile.city}`;
      }

      if (vehicles && vehicles.length > 0) {
        carContext += `\n\nАВТОМОБИЛИ В ГАРАЖЕ:`;
        for (const v of vehicles) {
          const brandName = (v.car_brands as any)?.brand_name || 'Неизвестно';
          carContext += `\n- ${brandName} ${v.model} ${v.year}, пробег: ${v.mileage} км`;
        }
      }

      if (chatHistory && chatHistory.length > 0) {
        carContext += `\n\nКОНТЕКСТ ИЗ ПРОШЛЫХ РАЗГОВОРОВ (помни это для персонализации):`;
        // Reverse to get chronological order
        const reversedHistory = chatHistory.reverse().slice(0, 10);
        for (const msg of reversedHistory) {
          carContext += `\n[${msg.role}]: ${msg.content.substring(0, 100)}...`;
        }
      }
    }

    const systemPrompt = `Ты AI помощник по автомобилям myAuto. Отвечай КРАТКО и ПО ДЕЛУ - водители не будут читать долго. Максимум 2-3 предложения. Используй простой язык без лишних терминов. Если нужно больше информации - спрашивай конкретно.${carContext}`;

    console.log("Sending request to AI Gateway");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error("Rate limit exceeded");
        return new Response(JSON.stringify({ error: "Слишком много запросов, попробуйте позже." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        console.error("Payment required");
        return new Response(JSON.stringify({ error: "Требуется пополнение баланса." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Ошибка AI сервиса" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Streaming response from AI Gateway");

    return new Response(response.body, {
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
