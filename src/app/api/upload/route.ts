import { put } from "@vercel/blob";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return Response.json({ error: "No file uploaded." }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return Response.json({ error: "Only image files are supported." }, { status: 400 });
    }

    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      return Response.json(
        { error: "BLOB_READ_WRITE_TOKEN is not configured." },
        { status: 500 },
      );
    }

    const blob = await put(`uploads/${Date.now()}-${file.name}`, file, {
      access: "public",
      addRandomSuffix: true,
      token,
    });

    return Response.json({ url: blob.url });
  } catch (error) {
    console.error("Blob upload failed:", error);
    return Response.json(
      { error: "Upload failed. Please try again." },
      { status: 500 },
    );
  }
}
