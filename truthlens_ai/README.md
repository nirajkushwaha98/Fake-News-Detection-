# TruthLens AI (Phase 1 Expo Prototype)
> **"See it. Hear it. Verify it."**  
> Accessible Multimodal Misinformation Screening & Verification Assistant

---

## 1. File Structure

```text
truthlens_ai/
│
├── app.py                      # Master application entry point & CLI pipeline
├── requirements.txt            # Python dependencies (pip install -r requirements.txt)
├── README.md                   # Comprehensive Expo guide, setup & documentation
├── train_model.py              # ML training pipeline (TF-IDF + PassiveAggressive)
│
├── models/                     # Trained model weights & metrics
│   ├── fake_news_model.pkl
│   ├── tfidf_vectorizer.pkl
│   └── metrics.json
│
├── modules/                    # Core modular feature engines
│   ├── text_analyzer.py        # NLP, sensationalism, urgency & claim extraction
│   ├── ocr.py                  # Image OCR engine (JPG, JPEG, PNG)
│   ├── voice_analyzer.py       # Speech-to-text & voice input pipeline
│   ├── evidence_search.py      # Live reference search & stance classification
│   ├── risk_engine.py          # 4-component transparent 0-100 risk scoring
│   └── accessibility.py        # Accessible formatting & Text-to-Speech synthesis
│
└── assets/                     # Demo media files & test inputs
```

---

## 2. Exact Windows Installation Commands

Open **Command Prompt** (`cmd.exe`) or **PowerShell** on Windows:

```powershell
# Step 1: Navigate to the project directory
cd truthlens_ai

# Step 2: (Optional but recommended) Create a virtual environment
python -m venv venv

# Step 3: Activate the virtual environment
# In Command Prompt:
venv\Scripts\activate
# OR in PowerShell:
.\venv\Scripts\Activate.ps1

# Step 4: Upgrade pip
python -m pip install --upgrade pip

# Step 5: Install required dependencies
pip install -r requirements.txt
```

*(Note: If Tesseract OCR binary is not installed on Windows, the web application runs client-side WebAssembly Tesseract.js out of the box with zero external installation required!)*

---

## 3. Exact Run Commands

### Run the Interactive Python Assistant:
```bash
python app.py
```

### Verify Custom Text via Command Line:
```bash
python app.py "BREAKING: NASA leaks secret document confirming 15 days of total darkness across Earth!"
```

### Train / Re-train ML Model:
```bash
python train_model.py
```

---

## 4. How to Test Each Feature

| Feature | How to Test | Expected Output |
| :--- | :--- | :--- |
| **1. Text Analysis** | Paste a sensational WhatsApp forward or news claim into the app. | Extracted claim, 0-100 Risk Score, Assessment (*Potentially Misleading* / *High Misinformation Risk*), highlighted sensational words, and "Why this result?". |
| **2. Image OCR** | Upload a news headline graphic, screenshot, or meme (JPG, JPEG, PNG). | Image is processed, extracted text is displayed, and passed into verification pipeline. |
| **3. Voice & Audio** | Record via microphone or upload an audio clip (`.wav`, `.mp3`). | Audio is transcribed into text in real-time, analyzed, and synthesized back via "🔊 Listen to Result". |
| **4. Accessibility** | Toggle **♿ Accessibility Mode**. | High-contrast visual theme, magnified text, WCAG compliant contrast, screen-reader landmarks, and one-click "Read Result Aloud". |
| **5. Evidence Search** | Verify any claim. | External factual records returned with classification (🟢 Supporting, 🟡 Unclear, 🔴 Contradicting) or mandatory fallback: *"I searched for related information but could not find sufficiently relevant or reliable coverage. Not finding evidence does not by itself prove that the claim is false."* |

---

## 5. Phase-2 & Phase-3 Scalable Roadmap

- **Phase 1 (Completed for Expo)**: Multimodal Input (Text, Image OCR, Voice STT), Transparent 0-100 Risk Score, Explainability Engine, Real Evidence Cross-referencing, WCAG Accessibility Mode, Text-to-Speech, Session Dashboard, Local History.
- **Phase 2 (Hackathon Main Phase)**: Old image + new context detection (reverse image search indexing), Cross-modal text-image semantic consistency, Domain publisher reputation graph, Multi-hop claim reasoning.
- **Phase 3 (Enterprise & Global Scale)**: Audio frequency deepfake forensics, GAN artifact pixel-level analysis, 20+ multilingual languages, WhatsApp & Telegram verification bot integration.
