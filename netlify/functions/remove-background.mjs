export default async (req) => {
  // CORS
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
      JSON.stringify({
        error: "Only POST requests are allowed.",
      }),
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
    const token = Netlify.env.get("HF_TOKEN");

    if (!token) {
      return new Response(
        JSON.stringify({
          error: "HF_TOKEN is not configured.",
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

    const formData = await req.formData();
    const image = formData.get("image");

    if (!image) {
      return new Response(
        JSON.stringify({
          error: "No image was uploaded.",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    const imageBuffer = await image.arrayBuffer();

    const response = await fetch(
      "https://router.huggingface.co/fal-ai/fal-ai/imageutils-v2",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": image.type || "image/png",
        },
        body: imageBuffer,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      console.error(
        "Background removal error:",
        errorText
      );

      return new Response(
        JSON.stringify({
          error: "Background removal failed.",
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

    const contentType =
      response.headers.get("content-type") ||
      "image/png";

    const outputBuffer = await response.arrayBuffer();

    const base64 = Buffer.from(outputBuffer).toString(
      "base64"
    );

    const resultImage =
      `data:${contentType};base64,${base64}`;

    return new Response(
      JSON.stringify({
        success: true,
        image: resultImage,
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
    console.error(
      "Background remover function error:",
      error
    );

    return new Response(
      JSON.stringify({
        error:
          "Something went wrong while removing the background.",
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
