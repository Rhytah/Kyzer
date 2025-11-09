import { serve } from "https://deno.land/std@0.214.0/http/server.ts";
import OpenAI from "npm:openai";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  try {
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Missing OPENAI_API_KEY environment variable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { title = "", content = "", voice = "alloy" } = await req.json();

    const trimmedContent = (content ?? "").toString().trim();
    if (trimmedContent.length < 40) {
      return new Response(
        JSON.stringify({ error: "Lesson content is too short to generate narration." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const client = new OpenAI({ apiKey });

    const narrationPrompt = [
      {
        role: "system" as const,
        content:
          "You are an instructional designer creating friendly, concise narration scripts for corporate training. Keep sentences short, conversational, and easy to follow. Avoid referencing slides or visuals unless provided explicitly.",
      },
      {
        role: "user" as const,
        content: `Lesson Title: ${title}\n\nLesson Content:\n${trimmedContent}\n\nReturn a JSON object with keys "script" (the full narration ready to be spoken aloud) and "summary" (one sentence summary of the narration).`,
      },
    ];

    const scriptResponse = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: narrationPrompt,
      temperature: 0.6,
      response_format: { type: "json_object" },
    });

    const rawContent = scriptResponse.choices?.[0]?.message?.content ?? "{}";
    let scriptText = "";
    let summaryText = "";

    try {
      const parsed = JSON.parse(rawContent);
      scriptText = (parsed.script || parsed.narration || "").toString().trim();
      summaryText = (parsed.summary || "").toString().trim();
    } catch (_err) {
      scriptText = rawContent.trim();
    }

    if (!scriptText) {
      return new Response(
        JSON.stringify({ error: "The AI response did not contain narration text." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const speechResult = await client.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice,
      input: scriptText,
      format: "mp3",
    });

    const audioArrayBuffer = await speechResult.arrayBuffer();
    const audioBytes = new Uint8Array(audioArrayBuffer);
    let audioBase64 = "";
    const chunkSize = 0x8000; // 32KB chunks to avoid call stack limits
    for (let i = 0; i < audioBytes.length; i += chunkSize) {
      const chunk = audioBytes.subarray(i, i + chunkSize);
      audioBase64 += String.fromCharCode.apply(null, chunk as unknown as number[]);
    }
    audioBase64 = btoa(audioBase64);

    return new Response(
      JSON.stringify({
        script: scriptText,
        summary: summaryText,
        audioBase64,
        mimeType: "audio/mpeg",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("generate-narration error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

