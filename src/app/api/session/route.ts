import { NextResponse } from "next/server";

export async function POST() {
  const apiKey = process.env.ASSEMBLYAI_API_KEY;
  const agentId = process.env.ASSEMBLYAI_AGENT_ID;

  if (!apiKey || !agentId) {
    const missing = [];
    if (!apiKey) missing.push("ASSEMBLYAI_API_KEY");
    if (!agentId) missing.push("ASSEMBLYAI_AGENT_ID");
    console.warn(`[DEV] Missing environment variables: ${missing.join(", ")}`);
    // If no key is set, we return a mock token flag so the client can fallback to a mock mode
    return NextResponse.json({ mockMode: true }, { status: 200 });
  }

  try {
    const start = Date.now();
    const response = await fetch(
      "https://agents.assemblyai.com/v1/token?expires_in_seconds=300&max_session_duration_seconds=8640",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    const data = await response.json();
    const duration = Date.now() - start;
    console.log(`[API] AssemblyAI token fetch took ${duration}ms`);

    if (!response.ok) {
      throw new Error(`Failed to generate token: ${response.status}`);
    }

    return NextResponse.json({ token: data.token, mockMode: false });
  } catch (error) {
    console.error("AssemblyAI Token Error:", error);
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}
