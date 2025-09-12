# KYC Apps — Fixed Build & Deployment

## Local Setup
1. **Node 20+** is recommended.
2. Install deps: `npm i`
3. Create `.env` from `.env.example` and set `VITE_GEMINI_API_KEY`.
4. Dev: `npm run dev`
5. Build: `npm run build`
6. Preview: `npm run preview` (serves built app on port 4173).

> **Warning**: Calling Gemini from the browser exposes your API key. For production, proxy the request via a tiny backend (Cloud Run/Functions) and keep the key server-side.

## Docker (Local)
```bash
docker build -t kyc-app:latest .
docker run -it --rm -p 4173:4173 --env-file .env kyc-app:latest
```

## Deploy to Google Cloud Run (static app via Node preview)
1. **Project**: `gcloud config set project YOUR_PROJECT`
2. **Build & push**:
   ```bash
   gcloud builds submit --tag gcr.io/YOUR_PROJECT/kyc-app:latest
   ```
3. **Deploy**:
   ```bash
   gcloud run deploy kyc-app      --image gcr.io/YOUR_PROJECT/kyc-app:latest      --platform managed      --region asia-south1      --allow-unauthenticated      --set-env-vars VITE_GEMINI_API_KEY=YOUR_KEY
   ```
4. Open the Cloud Run URL.

## (Recommended) Secure Gemini Behind a Proxy
Create a tiny Cloud Run service (Node/Express) that accepts `POST /profile` with `username` and calls Gemini using **server-side** API key, then returns JSON. Change the frontend to call your proxy instead of calling Gemini directly.

### Example server (Express)
```js
// server/index.js
import express from 'express'
import cors from 'cors'
import { GoogleGenAI } from '@google/genai'

const app = express()
app.use(cors())
app.use(express.json())

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
const MODEL = 'gemini-2.0-flash-exp'

app.post('/profile', async (req, res) => {
  try {
    const { username } = req.body
    if(!username) return res.status(400).json({ error: 'username required' })
    const prompt = `Return STRICT JSON for Instagram handle ${username} with all required keys`

    const out = await genAI.models.generateContent({
      model: MODEL,
      contents: [{ role: "user", parts: [{ text: prompt }]}],
      generationConfig: { temperature: 0.2 }
    })
    const text = out.response.text()
    const s = text.indexOf('{'); const e = text.lastIndexOf('}')
    const data = JSON.parse(text.slice(s, e+1))
    res.json(data)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.listen(process.env.PORT || 8080, () => console.log('API running'))
```

**Dockerize** and deploy this API to Cloud Run, set `GEMINI_API_KEY` in Cloud Run **Secrets/Vars**. Update your frontend `fetchClientProfile` to call this API URL.

## Troubleshooting
- React version mismatch fixed (`react` & `react-dom` both 18.2.0).
- Replaced corrupted files (`App.tsx`, `index.tsx`, `Header.tsx`, `SearchForm.tsx`, `Spinner.tsx`, `ProfileReport.tsx`).
- Added `types.ts` with complete `ProfileData` interface.
- Added `Dockerfile` and `.env.example`.
- If Vite preview port differs, adjust `EXPOSE` and Cloud Run container port accordingly.
