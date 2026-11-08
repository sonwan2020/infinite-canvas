/**
 * YISU video: POST /v1/videos (JSON), then poll GET /v1/videos/{id}.
 * model and prompt are required; size must be an aspect ratio enum
 * (16:9/9:16/1:1/3:4/4:3, default 4:3); duration is an integer between
 * 5 and 14 (default 5); metadata.quality is 480p/720p/1080p (default 720p).
 * References must be public HTTP(S) URLs: images go in `images` (at most 9),
 * video and audio go in metadata.references as {type, url}. data: / blob:
 * URLs and local files are rejected by the gateway, and there is no upload
 * endpoint, so they cannot be sent from this app.
 * Polling must always use the id from the creation response; queued,
 * running and uploading are non-terminal. The real API finishes with
 * status "completed" (the docs also mention "succeeded") and the video
 * URL in output_url; failed carries error. generateAudio / watermark /
 * mode are not supported.
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
  const referenceImages = [];
  for (const image of images) {
    if (!/^https?:\/\//i.test(image || "")) {
      throw new Error("YISU image references must be public HTTP(S) URLs; data: and blob: URLs are rejected");
    }
    referenceImages.push(image);
  }
  if (referenceImages.length > 9) {
    throw new Error("YISU accepts at most 9 image references");
  }
  if (videos.length || audios.length) {
    throw new Error("YISU video and audio references must be public HTTP(S) URLs in metadata.references ({type, url}); local files are not supported");
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
  const data = {
    model: model,
    prompt: prompt,
    size: aspectRatio,
    duration: duration,
    metadata: { quality: quality },
  };
  if (referenceImages.length) {
    data.images = referenceImages;
  }
  const task = await request({
    method: "post",
    url: "/videos",
    headers,
    data,
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
      if (state.output_url && (state.status === "completed" || state.status === "succeeded")) {
        return { url: state.output_url };
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
