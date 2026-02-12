import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();
    
    if (!imageBase64) {
      throw new Error("Image data is required");
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const systemPrompt = "Ты — механик-эксперт. По фото давай четкий вердикт: что сломалось, сколько стоит ремонт в Казахстане (в тенге) и можно ли ехать дальше. Максимально кратко, 2-3 предложения. Средние цены: замена бампера 30-80к₸, покраска детали 25-50к₸, замена масла 5-15к₸, диагностика 5-10к₸, замена тормозных колодок 8-20к₸. Предупреждай что нужен осмотр вживую для точного диагноза.";

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: `${systemPrompt}\n\nЧто вы видите на этом изображении автомобиля? Есть ли проблемы?` },
              {
                inlineData: {
                  mimeType: "image/jpeg",
                  data: imageBase64
                }
              }
            ]
          }],
          generationConfig: {
            maxOutputTokens: 500,
            temperature: 0.3,
          },
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Превышен лимит запросов. Попробуйте позже." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      throw new Error("Failed to analyze image");
    }

    const geminiResponse = await response.json();
    const analysis = geminiResponse.candidates?.[0]?.content?.parts?.[0]?.text || "Не удалось проанализировать изображение";

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Photo analysis error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
