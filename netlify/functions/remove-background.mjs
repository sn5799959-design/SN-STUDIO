import { InferenceClient } from "@huggingface/inference";

export default async (request) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (request.method === "OPTIONS") {
    return new Response("", {
      status: 204,
      headers,
    });
  }

  if (request.method !== "POST") {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Method not allowed.",
      }),
      {
        status: 405,
        headers,
      }
    );
  }

  try {
    const token = process.env.HF_TOKEN;

    if (!token) {
      throw new Error("HF_TOKEN is not configured in Netlify.");
    }

    const body = await request.json();

    if (!body.image) {
      throw new Error("No image was received.");
    }

    const imageData = body.image;
    const base64 = imageData.includes(",")
      ? imageData.split(",")[1]
      : imageData;

    const imageBuffer = Buffer.from(base64, "base64");

    const client = new InferenceClient(token);

    const result = await client.imageSegmentation({
      model: "briaai/RMBG-2.0",
      provider: "fal-ai",
      data: imageBuffer,
    });

    if (!result || !result.length) {
      throw new Error(
        "Hugging Face returned no segmentation mask."
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        result,
      }),
      {
        status: 200,
        headers,
      }
    );
  } catch (error) {
    console.error("Background removal error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error:
          error?.message ||
          "Background removal failed.",
      }),
      {
        status: 500,
        headers,
      }
    );
  }
};
