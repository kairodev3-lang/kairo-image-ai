const SIZES = {
  "1:1": "1024x1024", "16:9": "1536x1024", "4:3": "1536x1024",
  "3:2": "1536x1024", "9:16": "1024x1536"
};
const QUALITY = { standard: "medium", high: "high", ultra: "high" };
const STYLES = {
  realistic: "photorealistic photography",
  anime: "anime illustration",
  "3d": "3D render",
  cyberpunk: "cyberpunk, neon lights",
  "digital-art": "digital art",
  fantasy: "fantasy art"
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Méthode non autorisée." });
  if (!process.env.OPENAI_API_KEY) return res.status(500).json({ error: "Clé API manquante sur le serveur." });

  const { prompt, style, aspectRatio, quality, detail } = req.body || {};
  if (typeof prompt !== "string" || !prompt.trim() || prompt.length > 1000) {
    return res.status(400).json({ error: "Description invalide." });
  }

  const full = `${prompt.trim()}. Style: ${STYLES[style] || "photorealistic"}. Niveau de détail: ${Number(detail) || 80}%.`;

  try {
    const r = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt: full,
        size: SIZES[aspectRatio] || "1024x1024",
        quality: QUALITY[quality] || "medium",
        n: 1
      })
    });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: data.error?.message || "Erreur du service IA." });
    return res.status(200).json({ imageBase64: data.data[0].b64_json, mimeType: "image/png" });
  } catch {
    return res.status(500).json({ error: "Erreur serveur." });
  }
}
