import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '25mb' }));

// Health Check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'TruthLens AI Backend',
    version: '1.0.0-phase1',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    time: new Date().toISOString()
  });
});

// Live Evidence Search Proxy (Wikipedia API for grounded, real citations)
app.get('/api/evidence', async (req, res) => {
  try {
    const query = req.query.q as string;
    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: 'Query parameter q is required' });
    }

    const cleanQuery = encodeURIComponent(query.trim().slice(0, 150));
    const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${cleanQuery}&utf8=&format=json&origin=*`;
    
    const response = await fetch(wikiUrl);
    if (!response.ok) {
      throw new Error(`Wikipedia API responded with status ${response.status}`);
    }

    const data = await response.json();
    const searchResults = data?.query?.search || [];

    const evidenceItems = searchResults.slice(0, 4).map((item: any) => {
      // Strip HTML tags from snippet
      const cleanSnippet = item.snippet
        ? item.snippet.replace(/<\/?[^>]+(>|$)/g, '')
        : 'Encyclopedic record available for cross-referencing.';

      return {
        id: `wiki-${item.pageid}`,
        title: item.title,
        source: 'Wikipedia Encyclopedic Database',
        summary: cleanSnippet,
        url: `https://en.wikipedia.org/?curid=${item.pageid}`,
        timestamp: item.timestamp,
        wordCount: item.wordcount,
      };
    });

    res.json({
      query,
      found: evidenceItems.length > 0,
      evidence: evidenceItems
    });
  } catch (error: any) {
    console.error('Evidence proxy error:', error);
    res.status(500).json({
      error: 'Failed to fetch live evidence',
      message: error?.message || 'Unknown error'
    });
  }
});

// Server-side AI-Assisted Deep Verification route (using @google/genai if key available)
app.post('/api/verify-deep', async (req, res) => {
  try {
    const { text, inputType } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Valid text is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(200).json({
        hasAI: false,
        message: 'No GEMINI_API_KEY detected in environment. Using deterministic local NLP & evidence engine.'
      });
    }

    // Call @google/genai server-side
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are TruthLens AI, an objective, rigorous misinformation screening engine.
Analyze the following claim or news snippet submitted via ${inputType || 'text'}:
"${text.slice(0, 2000)}"

Return a valid JSON object ONLY with the following structure:
{
  "extractedClaim": "Concise summary of the core falsifiable claim",
  "assessment": "Potentially Reliable" OR "Potentially Misleading" OR "High Misinformation Risk",
  "riskScore": number between 0 and 100,
  "reasons": ["List 2-4 specific objective reasons for this assessment"],
  "sensationalKeywords": ["List any sensational or emotionally charged keywords detected"],
  "factualConsistency": "High" OR "Moderate" OR "Low" OR "Unverified",
  "suggestedVerificationSteps": ["1-2 steps a user can take to verify"]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const contentText = response.text || '{}';
    let parsedResult = {};
    try {
      parsedResult = JSON.parse(contentText);
    } catch {
      parsedResult = { raw: contentText };
    }

    res.json({
      hasAI: true,
      result: parsedResult
    });
  } catch (err: any) {
    console.error('AI verification error:', err);
    res.status(500).json({
      hasAI: false,
      error: 'AI verification encountered an error. Falling back to local NLP engine.',
      details: err?.message
    });
  }
});

// Setup Vite middleware in dev or static files in prod
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
} else {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

app.listen(PORT, () => {
  console.log(`TruthLens AI server running at http://0.0.0.0:${PORT}`);
});
