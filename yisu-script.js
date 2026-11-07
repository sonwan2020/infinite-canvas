/**
 * YISU video: POST /v1/videos (JSON), then poll GET /v1/videos/{id}.
 * size must be an aspect ratio enum (16:9/9:16/1:1/3:4/4:3, default 4:3);
 * duration is an integer between 5 and 14 (default 5);
 * metadata.quality is 480p/720p/1080p (default 720p).
 * References only accept public HTTP(S) URLs; data URLs are rejected by the gateway.
 * generateAudio / watermark / mode are not supported by this API.
 */
async function generateVideo({
  prompt,
  images,
  videos,
  audios,
  params: { seconds, ratio, size, resolution },
  model,
  apiKey,
  request,
  poll,
}) {
  if (images.length || videos.length || audios.length) {
    throw new Error("YISU references require public HTTP(S) URLs, not local files");
  }
  const ratios = ["16:9", "9:16", "1:1", "3:4", "4:3"];
  const pixels = /^\d+x\d+$/.test(size || "") ? size.split("x").map(Number) : null;
  const pixelRatio = pixels ? (() => {
    const gcd = (a, b) => (b ? gcd(b, a % b) : a);
    const d = gcd(pixels[0], pixels[1]);
    return `${pixels[0] / d}:${pixels[1] / d}`;
  })() : "";
  const aspectRatio = ratios.includes(ratio) ? ratio : ratios.includes(pixelRatio) ? pixelRatio : "4:3";
  const duration = Math.floor(Number(seconds)) || 5;
  if (duration < 5 || duration > 14) {
    throw new Error("YISU duration must be an integer between 5 and 14 seconds");
  }
  const quality = ["480p", "720p", "1080p"].includes(resolution) ? resolution : "720p";

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };
  const task = await request({
    method: "post",
    url: "/videos",
    headers,
    data: {
      model: model,
      prompt: prompt,
      size: aspectRatio,
      duration: duration,
      metadata: { quality: quality },
    },
  });

  return await poll(
    async () => {
      const state = await request({
        method: "get",
        url: `/videos/${task.id}`,
        headers,
      });
      if (state.status === "failed") {
        throw new Error(state.error || "video generation failed");
      }
      const url = state.output_url || state.video_url || state.url;
      if (url && (state.status === "completed" || state.status === "succeeded")) {
        return { url };
      }
      return null;
    },
    (result) => result,
    { intervalMs: 3000, timeoutMs: 300000 },
  );
}

return await generateVideo({
  prompt,
  images,
  videos,
  audios,
  params,
  model,
  baseUrl,
  apiKey,
  request,
  poll,
});

