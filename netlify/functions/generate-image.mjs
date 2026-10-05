export default async (req) => {
  // Allow browser requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Only POST requests are allowed." }),
      {
        status: 405,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }

  try {
    const body = await req.json();

    const prompt = body.prompt?.trim();
    const style = body.style || "Cinematic";
    const aspectRatio = body.aspectRatio || "16:9";

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Please enter an image prompt." }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    const token = Netlify.env.get("HF_TOKEN");

    if (!token) {
      return new Response(
        JSON.stringify({
          error: "HF_TOKEN is not configured in Netlify.",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Convert the selected aspect ratio into image dimensions
    const sizes = {
      "1:1": { width: 1024, height: 1024 },
      "16:9": { width: 1024, height: 576 },
      "9:16": { width: 576, height: 1024 },
      "4:3": { width: 1024, height: 768 },
      "3:4": { width: 768, height: 1024 },
    };

    const size = sizes[aspectRatio] || sizes["16:9"];

    const finalPrompt = `${prompt}. Style: ${style}. High quality, detailed, professional composition, suitable for a creative studio.`;

    // Hugging Face Inference Provider
    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-3-medium-diffusers",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: finalPrompt,
          parameters: {
            width: size.width,
            height: size.height,
            num_inference_steps: 28,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      console.error("Hugging Face error:", errorText);

      return new Response(
        JSON.stringify({
          error: "Image generation failed.",
          details: errorText,
        }),
        {
          status: response.status,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Hugging Face returns the generated image as binary data
    const imageBuffer = await response.arrayBuffer();

    const contentType =
      response.headers.get("content-type") || "image/png";

    // Convert image to Base64 so the React app can display it
    const base64 = Buffer.from(imageBuffer).toString("base64");

    const imageUrl = `data:${contentType};base64,${base64}`;

    return new Response(
      JSON.stringify({
        success: true,
        image: imageUrl,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("Function error:", error);

    return new Response(
      JSON.stringify({
        error: "Something went wrong while generating the image.",
        details: error.message,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
};
