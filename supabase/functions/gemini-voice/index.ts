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
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;
    const historyJson = formData.get("history") as string;

    if (!audioFile) {
      throw new Error("Audio file is required");
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    // Convert audio to base64
    const audioBuffer = await audioFile.arrayBuffer();
    const audioBase64 = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));

    // Parse conversation history
    let historyContents: any[] = [];
    if (historyJson) {
      try {
        const history = JSON.parse(historyJson);
        historyContents = history.map((msg: any) => ({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }]
        }));
      } catch { /* ignore parse errors */ }
    }

    const systemPrompt = "Ты — лаконичный голосовой помощник водителя в Казахстане. Отвечай кратко, 1-2 предложения. Знаешь цены в тенге, ПДД РК и СТО. Говори как друг-механик.";

    const contents = [
      { role: "user", parts: [{ text: `[System]: ${systemPrompt}` }] },
      { role: "model", parts: [{ text: "Понял, отвечаю кратко как друг-механик." }] },
      ...historyContents,
      {
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType: audioFile.type || "audio/webm",
              data: audioBase64,
            }
          },
          { text: "Ответь на голосовое сообщение пользователя. Сначала напиши транскрипцию того что сказал пользователь в формате [ТРАНСКРИПЦИЯ]: текст, затем свой ответ в формате [ОТВЕТ]: текст" }
        ]
      }
    ];

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents,
          generationConfig: {
            maxOutputTokens: 300,
            temperature: 0.7,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini voice error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Слишком много запросов, попробуйте позже." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error("Gemini API error");
    }

    const geminiResponse = await response.json();
    const fullText = geminiResponse.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Parse transcript and response
    let userTranscript = "";
    let aiResponse = fullText;

    const transcriptMatch = fullText.match(/\[ТРАНСКРИПЦИЯ\]:\s*(.*?)(?=\[ОТВЕТ\]|$)/s);
    const responseMatch = fullText.match(/\[ОТВЕТ\]:\s*(.*)/s);

    if (transcriptMatch) userTranscript = transcriptMatch[1].trim();
    if (responseMatch) aiResponse = responseMatch[1].trim();

    // If parsing failed, treat entire text as response
    if (!userTranscript && !responseMatch) {
      aiResponse = fullText;
    }

    // Generate TTS for AI response using ElevenLabs
    let audioResponseBase64 = null;
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY_1") || Deno.env.get("ELEVENLABS_API_KEY");
    
    if (ELEVENLABS_API_KEY && aiResponse) {
      try {
        const ttsResponse = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/CwhRBWXzGAHq8TQ4Fs17?output_format=mp3_44100_128`,
          {
            method: "POST",
            headers: {
              "xi-api-key": ELEVENLABS_API_KEY,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              text: aiResponse,
              model_id: "eleven_turbo_v2_5",
              voice_settings: {
                stability: 0.5,
                similarity_boost: 0.75,
              },
            }),
          }
        );

        if (ttsResponse.ok) {
          const ttsBuffer = await ttsResponse.arrayBuffer();
          audioResponseBase64 = btoa(String.fromCharCode(...new Uint8Array(ttsBuffer)));
        }
      } catch (e) {
        console.error("TTS error:", e);
      }
    }

    return new Response(
      JSON.stringify({
        userTranscript,
        aiResponse,
        audioBase64: audioResponseBase64,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Voice error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
