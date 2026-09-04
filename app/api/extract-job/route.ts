import { NextRequest, NextResponse } from "next/server";

// POST /api/extract-job
// Body: { image: string } — base64 WITHOUT the data:... prefix
// Response: { company: string, position: string, email: string }
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json({ success: false, error: "Gambar diperlukan" }, { status: 400 });
    }

    // Call Groq Vision API
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "qwen/qwen3.6-27b",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: 'Analyze this job posting screenshot. Extract: company name, job position/title, HR/recruitment email address, and WhatsApp/phone number if present. Normalize the output: company and position should use Title Case (capitalize first letter of each word, lowercase the rest, e.g. "Metro Busana", "Staff Accounting"). The email must be a valid email with NO spaces, lowercase, e.g. "metrobusana.plt@gmail.com". The whatsapp field should be the phone number with digits only (no spaces, dashes, or +), e.g. "089688290484". If no phone number is present, whatsapp should be an empty string "". Return ONLY valid JSON with no explanation: {"company": "...", "position": "...", "email": "...", "whatsapp": "..."}',
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${image}`,
                },
              },
            ],
          },
        ],
        max_tokens: 300,
        temperature: 0.1,
        response_format: { type: "json_object" },
      }),
    });

    if (!groqRes.ok) {
      const err = await groqRes.text();
      console.error("Groq API error:", err);
      return NextResponse.json({ success: false, error: "Gagal memproses gambar" }, { status: 502 });
    }

    const data = await groqRes.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json({ success: false, error: "Tidak ada response dari AI" }, { status: 500 });
    }

    // Parse JSON from response (handle markdown code blocks + thinking tags)
    const jsonStr = content
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .replace(/<think>[\s\S]*?<\/think>/g, "")
      .trim();
    const result = JSON.parse(jsonStr);

    return NextResponse.json({
      success: true,
      data: {
        company: result.company || "",
        position: result.position || "",
        email: result.email || "",
        whatsapp: result.whatsapp || "",
      },
    });
  } catch (error) {
    console.error("POST /api/extract-job error:", error);
    return NextResponse.json({ success: false, error: "Gagal mengekstrak data dari screenshot" }, { status: 500 });
  }
}
