import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

// Temporary mock database state to support full CRUD operations
const db = {
  sites: [
    { id: "manhattan-east", name: "Manhattan East Terminal", location: "40.7128° N, 74.0060° W", status: "Active", safetyScore: 92, supervisor: "Marcus Vance", workersCount: 42, cameraCount: 6 },
    { id: "brooklyn-naval", name: "Brooklyn Naval Yard Phase 3", location: "40.7015° N, 73.9733° W", status: "Active", safetyScore: 84, supervisor: "Elena Rostova", workersCount: 28, cameraCount: 4 },
    { id: "queens-crossing", name: "Queens Crossing Hub", location: "40.7580° N, 73.8300° W", status: "Planning", safetyScore: 100, supervisor: "Rajesh Kumar", workersCount: 0, cameraCount: 2 }
  ],
  cameras: [
    { id: "cam-01", name: "CCTV - North Hoist Area", status: "Active", siteId: "manhattan-east", streamUrl: "mock-stream-1", ppeCompliance: "94%" },
    { id: "cam-02", name: "CCTV - Main Excavation Pit", status: "Active", siteId: "manhattan-east", streamUrl: "mock-stream-2", ppeCompliance: "88%" },
    { id: "cam-03", name: "CCTV - Concrete Pouring Wing", status: "Warning", siteId: "manhattan-east", streamUrl: "mock-stream-3", ppeCompliance: "78%" },
    { id: "cam-04", name: "CCTV - South Perimeter Gate", status: "Active", siteId: "manhattan-east", streamUrl: "mock-stream-4", ppeCompliance: "100%" },
    { id: "cam-05", name: "CCTV - Loading Dock Sector A", status: "Active", siteId: "brooklyn-naval", streamUrl: "mock-stream-5", ppeCompliance: "92%" }
  ],
  alerts: [
    { id: "alert-1", timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(), type: "PPE_MISSING", label: "No Helmet Violation", location: "North Hoist Sector B", siteId: "manhattan-east", camera: "cam-01", severity: "High", image: "mock-violation-1", resolved: false, description: "Personnel operating in crane hoisting zone without hard hat helmet." },
    { id: "alert-2", timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), type: "RESTRICTED_ZONE", label: "Zone Intrusion", location: "Excavation Pit 2", siteId: "manhattan-east", camera: "cam-02", severity: "Medium", image: "mock-violation-2", resolved: true, description: "Unauthorized personnel entered deep excavation pit floor during live operation." },
    { id: "alert-3", timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), type: "FIRE_HAZARD", label: "High Thermal / Smoke Alert", location: "Material Depot East", siteId: "brooklyn-naval", camera: "cam-05", severity: "High", image: "mock-violation-3", resolved: false, description: "Visual smoke plume detected near combustible gas cylinder storage." }
  ],
  reports: [
    { id: "rep-01", title: "Daily Safety Inspection Report - July 09, 2026", date: "2026-07-09", siteId: "manhattan-east", workerCount: 42, complianceScore: 92, helmetCompliant: 41, vestCompliant: 40, activeViolations: 2, summary: "Overall compliance remains strong, though two active PPE violations were logged in Sector B. Hoist operations were briefly paused for retraining on high-visibility vest protocols.", status: "Signed Off" },
    { id: "rep-02", title: "Daily Safety Inspection Report - July 08, 2026", date: "2026-07-08", siteId: "manhattan-east", workerCount: 39, complianceScore: 96, helmetCompliant: 39, vestCompliant: 39, activeViolations: 0, summary: "Zero violations recorded throughout the entire 12-hour concrete casting shift. Excellent safety culture maintained.", status: "Archived" }
  ],
  progress: {
    completionPercentage: 68.4,
    delayPrediction: "4 Days ahead of schedule",
    timeline: [
      { date: "May 2026", task: "Foundation Excavation", status: "Completed", progress: 100 },
      { date: "June 2026", task: "Steel Frame Erection", status: "Completed", progress: 100 },
      { date: "July 2026", task: "Concrete Deck Casting", status: "Active", progress: 85 },
      { date: "August 2026", task: "Cladding & Facade Installation", status: "Upcoming", progress: 15 },
      { date: "September 2026", task: "Interior Fit-outs & HVAC Setup", status: "Upcoming", progress: 0 }
    ],
    dailyComparisons: [
      { id: "comp-1", date: "2026-07-09", imgBefore: "day-before-1", imgAfter: "day-after-1", progressScore: "+1.2% Concrete Curving", analysis: "AI analyzed concrete pouring status and verified completion of secondary hoist columns. No structural deviations detected." },
      { id: "comp-2", date: "2026-07-08", imgBefore: "day-before-2", imgAfter: "day-after-2", progressScore: "+2.5% Steel Column Welds", analysis: "AI verified 42 structural column welds in Sector C against construction blue-prints. All welds passed volumetric validation." }
    ]
  }
};

// Initialize Gemini
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
  console.log("Gemini API initialized successfully.");
} else {
  console.warn("Warning: GEMINI_API_KEY is not set. AI features will fallback to mock responses.");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // API ROUTING

  // 1. Analyze Frame/Image Endpoint
  app.post("/api/analyze-image", async (req, res) => {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: "Missing image data" });
    }

    if (!ai) {
      return res.json(getSimulatedDetections());
    }

    try {
      const base64Data = image.replace(/^data:image\/\w+;base64,/, "");

      const prompt = `Analyze this construction site image for safety compliance and risk assessment.
Perform a strict visual safety audit and detect:
- Workers/People
- PPE: Hard Hats/Helmets, High-Visibility Vests, safety gloves
- Machinery: Cranes, Excavators, Concrete mixers
- Thermal/Fire hazards: Fire, Smoke plumes, electrical sparks
- Zone breaches: Persons standing inside crane hazard sectors

You MUST output your response in JSON format matching the following structure:
{
  "workerCount": number,
  "helmetCompliantCount": number,
  "vestCompliantCount": number,
  "violations": ["string describing specific safety issues found"],
  "hazards": [
    { "label": "Fire/Smoke/Heavy Machinery/etc", "location": "Zone A/B/C/etc", "severity": "Low" | "Medium" | "High" }
  ],
  "safetyScore": number (0-100, where 100 means full compliance),
  "recommendations": ["specific action items for site safety manager"],
  "boundingBoxes": [
    { "x": number (percentage 0-100), "y": number (percentage 0-100), "width": number (percentage 0-100), "height": number (percentage 0-100), "label": "Person" | "Helmet" | "Vest" | "Crane" | "Excavator" | "Fire" | "No Helmet Violation" | "No Vest Violation", "confidence": number (0-1) }
  ]
}

Ensure the boundingBoxes represent logical regions on the image canvas. Output a valid, clean JSON.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Data,
            },
          },
          prompt
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              workerCount: { type: Type.INTEGER },
              helmetCompliantCount: { type: Type.INTEGER },
              vestCompliantCount: { type: Type.INTEGER },
              violations: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              hazards: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    label: { type: Type.STRING },
                    location: { type: Type.STRING },
                    severity: { type: Type.STRING }
                  },
                  required: ["label", "location", "severity"]
                }
              },
              safetyScore: { type: Type.INTEGER },
              recommendations: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              boundingBoxes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    x: { type: Type.NUMBER },
                    y: { type: Type.NUMBER },
                    width: { type: Type.NUMBER },
                    height: { type: Type.NUMBER },
                    label: { type: Type.STRING },
                    confidence: { type: Type.NUMBER }
                  },
                  required: ["x", "y", "width", "height", "label", "confidence"]
                }
              }
            },
            required: ["workerCount", "helmetCompliantCount", "vestCompliantCount", "violations", "hazards", "safetyScore", "recommendations", "boundingBoxes"]
          }
        }
      });

      const resultText = response.text || "{}";
      const data = JSON.parse(resultText);

      // Save a dynamic simulated alert to the list if compliance is low
      if (data.violations && data.violations.length > 0) {
        const newAlert = {
          id: `alert-dynamic-${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: data.violations[0].toLowerCase().includes("helmet") ? "PPE_MISSING" : "RESTRICTED_ZONE",
          label: data.violations[0].toLowerCase().includes("helmet") ? "No Helmet Violation" : "Safety Alert",
          location: "Live Camera Upload Zone",
          siteId: "manhattan-east",
          camera: "Webcam / File Upload",
          severity: data.safetyScore < 70 ? "High" : "Medium",
          image: "upload-capture",
          resolved: false,
          description: data.violations[0]
        };
        db.alerts.unshift(newAlert);
      }

      res.json(data);
    } catch (error: any) {
      console.error("Gemini analysis error:", error);
      res.status(500).json({ error: error.message || "Failed to analyze image", fallback: getSimulatedDetections() });
    }
  });

  // 2. Chat Endpoint for AI Safety Copilot
  app.post("/api/chat", async (req, res) => {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Missing message" });
    }

    if (!ai) {
      return res.json({
        text: "I am currently running in Offline/Demo mode. Active construction safety criteria for site **Manhattan East Terminal** requires all workers in Sector B to wear helmets (PPE Compliance: 94%). Let me know how I can help you draft a Daily Safety Audit or analyze scaffolding regulations."
      });
    }

    try {
      const systemInstruction = `You are "BuildGuard Safety Copilot", a leading safety automation expert and AI site coordinator.
You assist construction safety officers, foreman, and field engineers.
Provide deep structural analysis, risk calculations, delay forecasting summaries, and explain compliance issues beautifully.
Keep your tone authoritative, professional, helpful, and concise. Access to the current context:
- Today is July 9, 2026.
- Manhattan East Terminal: 42 active workers, 6 CCTV streams, safety rating: A- (92%). Active warning: Worker without Helmet in North Hoist Sector B.
- Brooklyn Naval Yard Phase 3: 28 active workers, 4 CCTV streams, safety rating: B (84%). Active warning: Smoke detected near combustibles material depot.
Feel free to reference these current safety stats if appropriate! Mention OSHA specifications (e.g. 29 CFR 1926) if answering regulatory queries.`;

      const contents = [];
      if (history && Array.isArray(history)) {
        for (const h of history) {
          contents.push({
            role: h.role === "user" ? "user" : "model",
            parts: [{ text: h.content }]
          });
        }
      }
      contents.push({ role: "user", parts: [{ text: message }] });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: { systemInstruction }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Chat API error:", error);
      res.status(500).json({ error: error.message || "Failed to generate chat response" });
    }
  });

  // 3. Get / Post Sites (CRUD)
  app.get("/api/sites", (req, res) => {
    res.json(db.sites);
  });

  app.post("/api/sites", (req, res) => {
    const { name, location, supervisor } = req.body;
    if (!name || !location) {
      return res.status(400).json({ error: "Name and location are required." });
    }
    const newSite = {
      id: `site-${Date.now()}`,
      name,
      location,
      status: "Active",
      safetyScore: 100,
      supervisor: supervisor || "Unassigned",
      workersCount: 0,
      cameraCount: 0
    };
    db.sites.push(newSite);
    res.json({ message: "Site registered successfully", site: newSite });
  });

  // 4. Get Alerts (and update alert status)
  app.get("/api/alerts", (req, res) => {
    res.json(db.alerts);
  });

  app.post("/api/alerts/:id/resolve", (req, res) => {
    const { id } = req.params;
    const alert = db.alerts.find(a => a.id === id);
    if (alert) {
      alert.resolved = true;
      res.json({ message: "Alert marked as resolved", alert });
    } else {
      res.status(404).json({ error: "Alert not found" });
    }
  });

  app.post("/api/alerts", (req, res) => {
    const { type, label, location, siteId, camera, severity, description } = req.body;
    const newAlert = {
      id: `alert-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: type || "PPE_MISSING",
      label: label || "Safety Hazard Alert",
      location: location || "Sector Gate North",
      siteId: siteId || "manhattan-east",
      camera: camera || "CCTV Camera",
      severity: severity || "High",
      image: "mock-violation-custom",
      resolved: false,
      description: description || "Uncertified entry or PPE safety rule breach logged."
    };
    db.alerts.unshift(newAlert);
    res.json({ message: "New custom alert issued", alert: newAlert });
  });

  // 5. Get Cameras list
  app.get("/api/cameras", (req, res) => {
    res.json(db.cameras);
  });

  // 6. Reports Endpoints & Report Generation via Gemini
  app.get("/api/reports", (req, res) => {
    res.json(db.reports);
  });

  app.post("/api/reports/generate", async (req, res) => {
    const { siteId } = req.body;
    const targetSite = db.sites.find(s => s.id === (siteId || "manhattan-east")) || db.sites[0];

    let executiveSummary = "Routine inspection completed with standard metrics. All core scaffolding is cleared.";
    
    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: `Draft a 2-3 sentence highly professional Safety Audit Executive Summary for the site "${targetSite.name}".
Supervised by ${targetSite.supervisor}. Safety score is ${targetSite.safetyScore}%. We had some warnings around hoist safety. Focus on site productivity and safety sign-offs.`,
        });
        if (response.text) {
          executiveSummary = response.text.trim();
        }
      } catch (e) {
        console.warn("Failed to get summary from Gemini, using default.");
      }
    }

    const workerCount = targetSite.workersCount || 35;
    const helmetCompliant = Math.max(0, workerCount - 1);
    const vestCompliant = Math.max(0, workerCount - 2);

    const newReport = {
      id: `rep-${Date.now()}`,
      title: `AI-Generated Comprehensive Safety Report - ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`,
      date: new Date().toISOString().split('T')[0],
      siteId: targetSite.id,
      workerCount,
      complianceScore: targetSite.safetyScore,
      helmetCompliant,
      vestCompliant,
      activeViolations: db.alerts.filter(a => !a.resolved && a.siteId === targetSite.id).length,
      summary: executiveSummary,
      status: "Signed Off"
    };

    db.reports.unshift(newReport);
    res.json({ message: "Safety Report generated and signed off successfully", report: newReport });
  });

  // 7. Notification Test Trigger
  app.post("/api/notifications/test", (req, res) => {
    const { channel, message } = req.body;
    res.json({
      success: true,
      message: `Safety warning successfully broadcasted to supervisors via ${channel || "WhatsApp/SMS/Email"}.`,
      details: {
        channel: channel || "All (Fail-Safe)",
        payload: message || "Immediate safety alert: PPE violation in North Zone B.",
        timestamp: new Date().toISOString()
      }
    });
  });

  // 8. Progress and Delay Prediction Timeline Data
  app.get("/api/progress", (req, res) => {
    res.json(db.progress);
  });

  // Helper simulated detections
  function getSimulatedDetections() {
    const seed = Math.random();
    const workerCount = Math.floor(seed * 6) + 3; // 3 to 8
    const helmetCompliantCount = Math.max(0, workerCount - (seed > 0.6 ? 1 : 0));
    const vestCompliantCount = Math.max(0, workerCount - (seed > 0.4 ? 1 : 0));
    
    const violations = [];
    if (helmetCompliantCount < workerCount) {
      violations.push("Worker in restricted Crane Zone A found without Hard Hat helmet compliance.");
    }
    if (vestCompliantCount < workerCount) {
      violations.push("Ground worker near active loader lacks High-Visibility reflective safety vest.");
    }
    if (seed > 0.7) {
      violations.push("Restricted machinery zone entered by unauthorized personnel.");
    }

    const hazards = [
      { label: "Active Mobile Crane Operation", location: "Hoist Sector B", severity: "High" },
      { label: "Unsecured Scaffolding Railing", location: "Facade West", severity: "Medium" }
    ];

    if (seed > 0.8) {
      hazards.push({ label: "Sub-surface combustible smoke warning", location: "Excavation Pit 2", severity: "High" });
    }

    const boundingBoxes = [
      { x: 15, y: 20, width: 22, height: 60, label: "Person", confidence: 0.94 },
      { x: 19, y: 15, width: 14, height: 10, label: "Helmet", confidence: 0.89 },
      { x: 16, y: 28, width: 20, height: 35, label: "Vest", confidence: 0.91 },
      { x: 45, y: 10, width: 45, height: 75, label: "Excavator", confidence: 0.96 },
      { x: 5, y: 55, width: 30, height: 35, label: "Person", confidence: 0.88 }
    ];

    if (helmetCompliantCount < workerCount) {
      boundingBoxes.push({ x: 7, y: 50, width: 12, height: 9, label: "No Helmet Violation", confidence: 0.95 });
    } else {
      boundingBoxes.push({ x: 12, y: 51, width: 10, height: 8, label: "Helmet", confidence: 0.92 });
    }

    const recommendations = [
      "Deploy automatic sirens in High Hazard Sector B while crane is in dynamic motion.",
      "Issue immediate digital compliance alerts to site manager for non-helmet personnel in Hoist Sector B.",
      "Verify scaffold anchorages at the West Sector prior to the morning shift."
    ];

    return {
      workerCount,
      helmetCompliantCount,
      vestCompliantCount,
      violations,
      hazards,
      safetyScore: Math.floor(95 - (violations.length * 8)),
      recommendations,
      boundingBoxes
    };
  }

  // VITE DEV SERVER OR STATIC SERVING MIDDLEWARE
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server middleware loaded.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving production static assets from dist/");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`BuildGuard API running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
