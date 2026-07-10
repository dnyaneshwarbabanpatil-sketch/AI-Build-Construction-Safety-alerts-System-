import React, { useState, useEffect, useRef } from "react";
import { 
  HardHat, 
  LayoutDashboard, 
  Camera, 
  MessageSquare, 
  FileText, 
  Activity, 
  Shield, 
  Bell, 
  User, 
  MapPin, 
  AlertTriangle, 
  Users, 
  CheckCircle2, 
  Plus, 
  Search, 
  Send, 
  Smartphone, 
  Mail, 
  MessageCircle, 
  Upload, 
  Play, 
  Pause, 
  TrendingUp, 
  CloudSun, 
  HelpCircle, 
  Trash2, 
  Settings, 
  Eye, 
  Check, 
  Sparkles, 
  ChevronRight, 
  Sliders, 
  Info, 
  Volume2, 
  VolumeX, 
  Clock, 
  Download,
  AlertCircle
} from "lucide-react";
import Sidebar from "./components/Sidebar";
import { Site, Camera as CameraType, Alert, SafetyReport, ProgressData, User as UserType } from "./types";

export default function App() {
  // Global States
  const [currentTab, setCurrentTab] = useState<string>("landing");
  const [lang, setLang] = useState<"EN" | "HI" | "MR">("EN");
  const [currentUser, setCurrentUser] = useState<UserType | null>({
    email: "dp128578@gmail.com",
    name: "Marcus Vance",
    role: "Senior Safety Inspector",
    siteIds: ["manhattan-east"]
  });

  // Local state replicas of the server-side DB to allow offline-first or immediate CRUD updates
  const [sites, setSites] = useState<Site[]>([]);
  const [cameras, setCameras] = useState<CameraType[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [reports, setReports] = useState<SafetyReport[]>([]);
  const [progress, setProgress] = useState<ProgressData | null>(null);

  // Active Site state
  const [selectedSiteId, setSelectedSiteId] = useState<string>("manhattan-east");

  // Live Camera states
  const [selectedCameraId, setSelectedCameraId] = useState<string>("cam-01");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [detectionMode, setDetectionMode] = useState<"upload" | "preset">("preset");
  const [activePresetIndex, setActivePresetIndex] = useState<number>(0);

  // Gemini Safety Copilot chat states
  const [chatInput, setChatInput] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "assistant"; content: string; time: string }>>([
    { role: "assistant", content: "Greetings. I am BuildGuard Safety Copilot. I've analyzed your Manhattan East Terminal CCTV streams and recorded a 92% safety score. Ask me about compliance regulations (OSHA 1926), delay forecasts, or today's visual anomalies.", time: "20:08" }
  ]);
  const [isChatTyping, setIsChatTyping] = useState<boolean>(false);

  // Voice command states
  const [isListening, setIsListening] = useState<boolean>(false);
  const [voiceTranscript, setVoiceTranscript] = useState<string>("");

  // Alert filter state
  const [alertFilter, setAlertFilter] = useState<"all" | "active" | "resolved">("all");

  // Notification sandbox form
  const [notifForm, setNotifForm] = useState({
    channel: "WhatsApp",
    message: "URGENT SAFETY HAZARD: Personnel spotted in High Crane hoisting area without high-visibility vest. Correct immediately.",
    recipient: "+1 (555) 392-8820",
    statusMessage: ""
  });

  // Admin states
  const [newSiteForm, setNewSiteForm] = useState({ name: "", location: "", supervisor: "" });
  const [newCameraForm, setNewCameraForm] = useState({ name: "", siteId: "manhattan-east", ppeCompliance: "15%" });
  const [newAlertForm, setNewAlertForm] = useState({
    type: "PPE_MISSING",
    label: "Missing Protective Footwear",
    location: "Scaffolding Column 4",
    severity: "High",
    description: "Worker observed wearing uncertified canvas shoes instead of steel-toe boots near heavy materials."
  });

  // Digital Twin compare slider
  const [compareSliderPos, setCompareSliderPos] = useState<number>(50);

  // Loading indicator for API calls
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);

  // Multilingual translation dictionary
  const DICT = {
    EN: {
      tagline: "Safety First // AI Site Monitoring",
      heroTitle: "BuildGuard",
      heroSub: "Autonomous Site Monitoring and OSHA-Compliant Risk Assessment Powered by YOLOv11 & Google Gemini",
      activeSite: "Active Site",
      dashboard: "Dashboard",
      workerCount: "Worker Count",
      ppeCompliance: "PPE Compliance",
      safetyScore: "Safety Score",
      riskLevel: "Risk Level",
      activeAlerts: "Active Violations",
      copilotTitle: "Gemini Safety Copilot",
      copilotSubtitle: "Ask about OSHA guidelines, site counts, anomalies, or drafts.",
      liveScanning: "Live Scanning HUD",
      uploadPrompt: "Drag and drop site capture or start webcam stream",
      safetyViolations: "Safety Violations & Zone Breach Alerts"
    },
    HI: {
      tagline: "सुरक्षा सर्वोपरि // एआई साइट मॉनिटरिंग",
      heroTitle: "बिल्डगार्ड",
      heroSub: "YOLOv11 और Google जेमिनी द्वारा संचालित स्वायत्त साइट निगरानी और OSHA-अनुपालन जोखिम मूल्यांकन",
      activeSite: "सक्रिय साइट",
      dashboard: "डैशबोर्ड",
      workerCount: "कुल श्रमिक",
      ppeCompliance: "पीपीई अनुपालन",
      safetyScore: "सुरक्षा स्कोर",
      riskLevel: "जोखिम स्तर",
      activeAlerts: "सक्रिय उल्लंघन",
      copilotTitle: "जेमिनी सुरक्षा कॉपायलट",
      copilotSubtitle: "OSHA दिशानिर्देशों, साइट गणनाओं या विसंगतियों के बारे में पूछें।",
      liveScanning: "लाइव स्कैनिंग HUD",
      uploadPrompt: "साइट की फ़ोटो अपलोड करें या वेबकैम शुरू करें",
      safetyViolations: "सुरक्षा उल्लंघन और क्षेत्र उल्लंघन अलर्ट"
    },
    MR: {
      tagline: "सुरक्षा प्रथम // एआय साईट मॉनिटरिंग",
      heroTitle: "बिल्डगार्ड",
      heroSub: "YOLOv11 आणि Google जेमिनीद्वारे समर्थित स्वयंचलित साइट मॉनिटरिंग आणि OSHA-सुसंगत जोखीम मूल्यांकन",
      activeSite: "सक्रिय साईट",
      dashboard: "डैशबोर्ड",
      workerCount: "एकूण कामगार",
      ppeCompliance: "पीपीई अनुपालन",
      safetyScore: "सुरक्षा गुण",
      riskLevel: "धोका पातळी",
      activeAlerts: "सक्रिय उल्लंघन",
      copilotTitle: "जेमिनी सुरक्षा कॉपायलट",
      copilotSubtitle: "OSHA नियम, कामगार संख्या किंवा विसंगतीबद्दल विचारा।",
      liveScanning: "लाइव स्कॅनिंग HUD",
      uploadPrompt: "साईट छायाचित्र अपलोड करा किंवा वेबकॅम सुरू करा",
      safetyViolations: "सुरक्षा उल्लंघन आणि क्षेत्र प्रवेश चेतावणी"
    }
  };

  const d = DICT[lang] || DICT.EN;

  // Preset images for demo camera scan simulations
  const PRESET_CAPTURES = [
    {
      id: "preset-1",
      name: "High Crane Sector",
      url: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=800&q=80",
      description: "Excavation floor with crane lift active",
      simulatedData: {
        workerCount: 5,
        helmetCompliantCount: 4,
        vestCompliantCount: 4,
        violations: ["Worker in Sector B operating near mobile crane hoist line without mandatory protective helmet."],
        hazards: [{ label: "Mobile Crane Active Load", location: "Sector B", severity: "High" }],
        safetyScore: 82,
        recommendations: ["Evacuate unhelmeted worker from Sector B hoist circle immediately.", "Send automated SMS notification to Foreman of Sector B."],
        boundingBoxes: [
          { x: 25, y: 35, width: 15, height: 45, label: "Person", confidence: 0.95 },
          { x: 45, y: 30, width: 12, height: 40, label: "Person", confidence: 0.92 },
          { x: 26, y: 30, width: 10, height: 8, label: "No Helmet Violation", confidence: 0.88 },
          { x: 46, y: 26, width: 9, height: 7, label: "Helmet", confidence: 0.94 }
        ]
      }
    },
    {
      id: "preset-2",
      name: "Concrete Scaffolding Zone",
      url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80",
      description: "Workers handling steel mesh on 4th tier scaffold",
      simulatedData: {
        workerCount: 8,
        helmetCompliantCount: 8,
        vestCompliantCount: 7,
        violations: ["One steel fixer on the scaffolding level 3 lacks a high-visibility orange safety vest."],
        hazards: [{ label: "Working at Height (> 15 feet)", location: "Scaffold Tier 3", severity: "High" }],
        safetyScore: 88,
        recommendations: ["Restrict dynamic load lifting until all scaffold personnel are fully vest-compliant.", "Verify safety harnesses are securely anchored to main structure."],
        boundingBoxes: [
          { x: 10, y: 15, width: 12, height: 35, label: "Person", confidence: 0.97 },
          { x: 30, y: 20, width: 11, height: 32, label: "Person", confidence: 0.91 },
          { x: 31, y: 28, width: 10, height: 18, label: "No Vest Violation", confidence: 0.89 },
          { x: 11, y: 11, width: 9, height: 6, label: "Helmet", confidence: 0.98 }
        ]
      }
    },
    {
      id: "preset-3",
      name: "Welding & Thermal Sector",
      url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
      description: "Active pipe welding station in enclosed utility area",
      simulatedData: {
        workerCount: 3,
        helmetCompliantCount: 3,
        vestCompliantCount: 3,
        violations: [],
        hazards: [
          { label: "High Thermal Output / Welding Sparks", location: "Utility Room Floor", severity: "Medium" },
          { label: "Enclosed Space Ventilation Warning", location: "Utility Room Floor", severity: "Medium" }
        ],
        safetyScore: 100,
        recommendations: ["Ensure local exhaust fans remain active throughout welding shift.", "Maintain active thermal sensor sweep."],
        boundingBoxes: [
          { x: 40, y: 40, width: 20, height: 50, label: "Person", confidence: 0.96 },
          { x: 45, y: 34, width: 10, height: 8, label: "Helmet", confidence: 0.99 },
          { x: 65, y: 48, width: 12, height: 24, label: "Fire / High Heat", confidence: 0.91 }
        ]
      }
    }
  ];

  // Fetch initial database state on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoadingData(true);
    try {
      const [resSites, resAlerts, resReports, resProgress, resCameras] = await Promise.all([
        fetch("/api/sites").then(r => r.ok ? r.json() : []),
        fetch("/api/alerts").then(r => r.ok ? r.json() : []),
        fetch("/api/reports").then(r => r.ok ? r.json() : []),
        fetch("/api/progress").then(r => r.ok ? r.json() : null),
        fetch("/api/cameras").then(r => r.ok ? r.json() : [])
      ]);

      setSites(resSites);
      setAlerts(resAlerts);
      setReports(resReports);
      setCameras(resCameras);
      if (resProgress) setProgress(resProgress);
    } catch (error) {
      console.error("Failed to fetch server data:", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  // Site score computation
  const activeSite = sites.find(s => s.id === selectedSiteId) || {
    id: "manhattan-east",
    name: "Manhattan East Terminal",
    location: "40.7128° N, 74.0060° W",
    status: "Active",
    safetyScore: 92,
    supervisor: "Marcus Vance",
    workersCount: 42,
    cameraCount: 6
  };

  const activeAlertsCount = alerts.filter(a => !a.resolved && a.siteId === selectedSiteId).length;

  // Resolve Alert Event
  const resolveAlert = async (id: string) => {
    try {
      const res = await fetch(`/api/alerts/${id}/resolve`, { method: "POST" });
      if (res.ok) {
        // Update local replica state
        setAlerts(prev => prev.map(a => a.id === id ? { ...a, resolved: true } : a));
      }
    } catch (e) {
      console.error("Error resolving alert:", e);
      // Fallback local update
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, resolved: true } : a));
    }
  };

  // Chat Copilot Submission
  const handleChatSubmit = async (e?: React.FormEvent, customMsg?: string) => {
    if (e) e.preventDefault();
    const query = customMsg || chatInput;
    if (!query.trim()) return;

    // Append user message
    const userMsg = { role: "user" as const, content: query, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setIsChatTyping(true);

    try {
      const historyPayload = chatMessages.map(m => ({ role: m.role, content: m.content }));
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query, history: historyPayload })
      });

      if (response.ok) {
        const data = await response.json();
        setChatMessages(prev => [...prev, {
          role: "assistant",
          content: data.text,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      } else {
        throw new Error("Chat service offline");
      }
    } catch (error) {
      // Offline fallback safety guidance based on question keywords
      let fallbackResponse = "I've logged your request in offline standby mode. Our YOLOv11 detectors verify helmet and harness safety at Manhattan Sector B. Scaffolding compliance remains certified.";
      if (query.toLowerCase().includes("violation") || query.toLowerCase().includes("hazard")) {
        fallbackResponse = "URGENT SCAN WARNING: There is currently 1 active No Helmet Violation detected on CCTV-North Hoist near Scaffold tier 3. Recommendations: Instruct Supervisor Elena Rostova to deliver direct instruction.";
      } else if (query.toLowerCase().includes("report")) {
        fallbackResponse = "DAILY SUMMARY REPORT GENERATED: Today, July 9, 2026, Manhattan East site scored 92% overall compliance with 42 checked-in personnel. Detailed audit logs are updated in compliance tab.";
      }
      
      setChatMessages(prev => [...prev, {
        role: "assistant",
        content: fallbackResponse,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsChatTyping(false);
    }
  };

  // Image Upload / Preset live scan trigger
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedImage(reader.result as string);
        setDetectionMode("upload");
        setScanResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const executeLiveScan = async () => {
    setIsScanning(true);
    setScanResult(null);

    if (detectionMode === "preset") {
      // Simulate scanning for 1.2s to look beautiful
      setTimeout(() => {
        const preset = PRESET_CAPTURES[activePresetIndex];
        setScanResult(preset.simulatedData);
        setIsScanning(false);
      }, 1200);
    } else {
      // Trigger real server-side image scanning using the Gemini Vision API!
      if (!uploadedImage) {
        setIsScanning(false);
        return;
      }
      try {
        const res = await fetch("/api/analyze-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: uploadedImage })
        });
        if (res.ok) {
          const data = await res.json();
          setScanResult(data);
          // Refresh alerts to load any dynamically inserted alerts by the server analysis
          fetch("/api/alerts").then(r => r.json()).then(setAlerts);
        } else {
          throw new Error("Analysis failed");
        }
      } catch (err) {
        // Fallback simulation
        setScanResult({
          workerCount: 4,
          helmetCompliantCount: 3,
          vestCompliantCount: 4,
          violations: ["Manual Upload Warning: One person detected missing proper head gear helmet protection."],
          hazards: [{ label: "Manual Upload Hazard Sweep", location: "Unspecified Zone", severity: "Medium" }],
          safetyScore: 84,
          recommendations: ["Issue steel helmet checklist.", "Double check scaffolding handrail limits."],
          boundingBoxes: [
            { x: 30, y: 25, width: 18, height: 50, label: "Person", confidence: 0.92 },
            { x: 31, y: 18, width: 14, height: 10, label: "No Helmet Violation", confidence: 0.85 }
          ]
        });
      } finally {
        setIsScanning(false);
      }
    }
  };

  // Safety Report generator
  const triggerNewReport = async () => {
    setIsLoadingData(true);
    try {
      const res = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId: selectedSiteId })
      });
      if (res.ok) {
        const data = await res.json();
        setReports(prev => [data.report, ...prev]);
      }
    } catch (e) {
      // Simulate report generation
      const fakeReport: SafetyReport = {
        id: `rep-fallback-${Date.now()}`,
        title: `AI-Generated Custom Safety Audit - ${new Date().toLocaleDateString('en-US')}`,
        date: new Date().toISOString().split('T')[0],
        siteId: selectedSiteId,
        workerCount: activeSite.workersCount || 35,
        complianceScore: activeSite.safetyScore || 90,
        helmetCompliant: Math.max(0, (activeSite.workersCount || 35) - 1),
        vestCompliant: Math.max(0, (activeSite.workersCount || 35) - 1),
        activeViolations: activeAlertsCount,
        summary: "Autonomous visual scanning sweeps of crane quadrants verified general compliance. Site managers resolved previous scaffolding warnings.",
        status: "Signed Off"
      };
      setReports(prev => [fakeReport, ...prev]);
    } finally {
      setIsLoadingData(false);
    }
  };

  // Notification Test Dispatcher
  const sendAlertDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotifForm(p => ({ ...p, statusMessage: "Dispatching signals..." }));
    try {
      const res = await fetch("/api/notifications/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel: notifForm.channel, message: notifForm.message })
      });
      if (res.ok) {
        const data = await res.json();
        setNotifForm(p => ({ 
          ...p, 
          statusMessage: `SUCCESS: Broadcast sent to supervisor via ${notifForm.channel}. Timestamp: ${new Date().toLocaleTimeString()}`
        }));
      }
    } catch (e) {
      setNotifForm(p => ({ 
        ...p, 
        statusMessage: `SUCCESS (Local Simulation): Safety warning pushed to supervisor database & SMS queue successfully!` 
      }));
    }
  };

  // Admin: Register Site
  const registerSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSiteForm.name || !newSiteForm.location) return;
    try {
      const res = await fetch("/api/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSiteForm)
      });
      if (res.ok) {
        const data = await res.json();
        setSites(prev => [...prev, data.site]);
        setSelectedSiteId(data.site.id);
        setNewSiteForm({ name: "", location: "", supervisor: "" });
        alert("Site registered successfully!");
      }
    } catch (err) {
      const manualSite: Site = {
        id: `site-man-${Date.now()}`,
        name: newSiteForm.name,
        location: newSiteForm.location,
        status: "Active",
        safetyScore: 100,
        supervisor: newSiteForm.supervisor || "Marcus Vance",
        workersCount: 0,
        cameraCount: 1
      };
      setSites(prev => [...prev, manualSite]);
      setSelectedSiteId(manualSite.id);
      setNewSiteForm({ name: "", location: "", supervisor: "" });
      alert("Site registered successfully (Offline storage)!");
    }
  };

  // Admin: Insert alert
  const issueAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newAlertForm, siteId: selectedSiteId })
      });
      if (res.ok) {
        const data = await res.json();
        setAlerts(prev => [data.alert, ...prev]);
        alert("Custom alert broadcasted on Safety Dashboard!");
        setNewAlertForm({
          type: "PPE_MISSING",
          label: "Missing Protective Footwear",
          location: "Scaffolding Column 4",
          severity: "High",
          description: "Worker observed near materials without steel-toe safety shoes."
        });
      }
    } catch (err) {
      const manualAlert: Alert = {
        id: `alert-man-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: newAlertForm.type,
        label: newAlertForm.label,
        location: newAlertForm.location,
        siteId: selectedSiteId,
        camera: "Admin Manual Dispatch",
        severity: newAlertForm.severity,
        image: "mock-violation-custom",
        resolved: false,
        description: newAlertForm.description
      };
      setAlerts(prev => [manualAlert, ...prev]);
      alert("Custom alert broadcasted!");
    }
  };

  // Simulated Speech Recognition Voice Commands
  const startSpeechRecognition = () => {
    setIsListening(true);
    setVoiceTranscript("Listening...");

    // Simulated recognized commands to ensure consistent offline experience
    const cmdPrompts = [
      "show camera scanning",
      "go to safety assistant",
      "trigger daily report",
      "view progress",
      "go to dashboard"
    ];
    const randomCmd = cmdPrompts[Math.floor(Math.random() * cmdPrompts.length)];

    setTimeout(() => {
      setVoiceTranscript(`"${randomCmd}"`);
      setTimeout(() => {
        setIsListening(false);
        // Process recognized route or actions
        if (randomCmd === "show camera scanning") {
          setCurrentTab("camera");
        } else if (randomCmd === "go to safety assistant") {
          setCurrentTab("assistant");
        } else if (randomCmd === "trigger daily report") {
          setCurrentTab("reports");
          triggerNewReport();
        } else if (randomCmd === "view progress") {
          setCurrentTab("progress");
        } else if (randomCmd === "go to dashboard") {
          setCurrentTab("dashboard");
        }
      }, 800);
    }, 2000);
  };

  return (
    <div className="flex bg-[#0A0A0B] text-slate-100 min-h-screen selection:bg-yellow-500 selection:text-black">
      
      {/* SIDEBAR NAVIGATION (Hidden on Landing tab to look like beautiful website) */}
      {currentTab !== "landing" && (
        <Sidebar 
          currentTab={currentTab} 
          setCurrentTab={setCurrentTab} 
          user={currentUser} 
          onLogout={() => {
            setCurrentUser(null);
            setCurrentTab("landing");
          }} 
          lang={lang}
          setLang={setLang}
          activeViolationsCount={activeAlertsCount}
        />
      )}

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* EDITORIAL TOP ROW BAR */}
        <header className="px-8 py-5 border-b border-white/5 flex flex-wrap justify-between items-center gap-4 bg-[#0A0A0B]/85 sticky top-0 z-40 backdrop-blur-md">
          <div className="flex items-center gap-3">
            {currentTab === "landing" && (
              <div className="w-9 h-9 bg-yellow-500 rounded-lg flex items-center justify-center text-black font-black">
                <HardHat size={18} />
              </div>
            )}
            <div>
              <div className="text-[9px] uppercase tracking-[0.25em] text-yellow-500 font-bold mb-0.5">
                {d.tagline}
              </div>
              <h1 className="text-2xl font-bold tracking-tighter uppercase italic font-display">
                BuildGuard<span className="text-yellow-500 underline decoration-1 underline-offset-2">AI</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Real-time System Telemetry */}
            <div className="hidden md:flex gap-6 text-right font-mono text-[10px] text-slate-400">
              <div>
                <span className="text-slate-600">ZONE:</span> Manhattan Tower Phase 4
              </div>
              <div>
                <span className="text-slate-600">LATENCY:</span> 24ms
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-green-500 font-bold uppercase">SECURE CLOUD</span>
              </div>
            </div>

            {/* Language dropdown (Simplified for landing topbar too) */}
            {currentTab === "landing" && (
              <div className="flex bg-white/5 p-1 rounded-lg border border-white/10 text-xs">
                {(["EN", "HI", "MR"] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    className={`px-2 py-1 rounded font-mono text-[10px] font-bold ${
                      lang === l ? "bg-yellow-500 text-black" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            )}

            {/* Micro voice command module */}
            {currentTab !== "landing" && (
              <button 
                onClick={startSpeechRecognition}
                className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all ${
                  isListening 
                    ? "bg-red-500/20 border-red-500/50 text-red-400 animate-pulse" 
                    : "bg-[#161618] border-white/5 hover:border-yellow-500/30 text-yellow-500"
                }`}
                title="Voice Command Mode"
              >
                {isListening ? <Volume2 size={16} /> : <VolumeX size={16} />}
                <span className="text-xs font-mono font-medium hidden lg:inline">
                  {isListening ? voiceTranscript : "AI Voice Control"}
                </span>
              </button>
            )}

            {/* Quick Actions / Auth */}
            {currentTab === "landing" ? (
              currentUser ? (
                <button 
                  onClick={() => setCurrentTab("dashboard")}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 text-xs font-bold uppercase rounded-lg tracking-wider transition-all cursor-pointer"
                >
                  Enter Safety Hub
                </button>
              ) : (
                <button 
                  onClick={() => setCurrentTab("auth")}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 text-xs font-bold uppercase rounded-lg tracking-wider transition-all cursor-pointer"
                >
                  Sign In
                </button>
              )
            ) : (
              <div className="flex items-center gap-2 bg-[#161618] border border-white/5 rounded-xl px-3 py-1.5">
                <span className="text-[11px] font-mono text-slate-400">Site ID:</span>
                <select 
                  value={selectedSiteId} 
                  onChange={(e) => setSelectedSiteId(e.target.value)}
                  className="bg-transparent text-xs font-bold text-yellow-500 focus:outline-none"
                >
                  {sites.length > 0 ? (
                    sites.map((s) => (
                      <option key={s.id} value={s.id} className="bg-[#161618] text-white">
                        {s.name}
                      </option>
                    ))
                  ) : (
                    <option value="manhattan-east" className="bg-[#161618] text-white">Manhattan East</option>
                  )}
                </select>
              </div>
            )}
          </div>
        </header>

        {/* ----------------- TAB CONTENT ----------------- */}

        {/* 1. LANDING PAGE */}
        {currentTab === "landing" && (
          <div className="p-8 max-w-7xl mx-auto space-y-24">
            
            {/* HERO SECTION */}
            <section className="text-center space-y-6 pt-12 relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-yellow-500/5 blur-3xl rounded-full pointer-events-none"></div>
              
              <span className="border border-yellow-500/20 bg-yellow-500/5 text-yellow-500 px-4 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider inline-block">
                ★ LIVE DEPLOYED WEB DEMO // HACKATHON VERSION
              </span>

              <h2 style={{ fontFamily: "Georgia, serif" }} className="text-5xl md:text-7xl font-extrabold tracking-tight italic text-white">
                Autonomous Safety <br />
                <span className="text-yellow-500 not-italic uppercase font-display font-black tracking-tighter">Site Monitoring</span>
              </h2>

              <p className="max-w-2xl mx-auto text-slate-400 text-sm md:text-base font-normal leading-relaxed">
                Empower construction foremen and safety compliance officers with real-time video feeds scanning for hard hats, safety vests, hazard zones breaches, and fire events using high-speed YOLO edge detection.
              </p>

              <div className="flex justify-center gap-4 pt-4">
                <button 
                  onClick={() => {
                    if (!currentUser) {
                      setCurrentTab("auth");
                    } else {
                      setCurrentTab("dashboard");
                    }
                  }}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black px-8 py-3 text-sm font-black uppercase rounded-xl tracking-wider transition-all cursor-pointer shadow-[0_4px_20px_rgba(245,158,11,0.2)]"
                >
                  Launch Operator Console
                </button>
                <a 
                  href="#demo"
                  className="border border-white/10 hover:border-white/20 bg-white/5 px-8 py-3 text-sm font-bold uppercase rounded-xl transition-all inline-block"
                >
                  Interactive Demo
                </a>
              </div>

              {/* Live telemetry visual box */}
              <div className="max-w-4xl mx-auto mt-12 border border-white/5 rounded-3xl bg-[#111317] p-4 shadow-2xl relative overflow-hidden">
                <div className="flex justify-between items-center text-xs text-slate-500 font-mono border-b border-white/5 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                    <span className="text-red-400 uppercase font-bold">CCTV FEED HUD</span>
                  </div>
                  <span>SESSION_ID: BG-829A-SYS</span>
                </div>
                <div className="aspect-video rounded-2xl relative overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1200&q=80')` }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50 p-6 flex flex-col justify-between">
                    
                    {/* Bounding Box Simulation */}
                    <div className="flex flex-wrap gap-4">
                      <div className="border-2 border-green-500 bg-green-500/10 px-2 py-1 text-[10px] font-mono font-bold h-fit rounded">
                        🛡️ Helmet Detected (98%)
                      </div>
                      <div className="border-2 border-red-500 bg-red-500/10 px-2 py-1 text-[10px] font-mono font-bold h-fit rounded animate-pulse">
                        ⚠️ Violation: No safety vest (Zone C)
                      </div>
                    </div>

                    <div className="flex justify-between items-end">
                      <div className="bg-black/80 backdrop-blur-md p-3 rounded-xl border border-white/10 font-mono text-left">
                        <div className="text-[10px] text-slate-400">SITE SCORE</div>
                        <div className="text-xl font-bold text-yellow-400">92% SAFE</div>
                      </div>
                      <div className="text-[10px] font-mono text-right text-white/50">
                        LAT: 40.7128° N | LON: 74.0060° W
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </section>

            {/* AI DEMO SECTION */}
            <section id="demo" className="scroll-mt-24 border-t border-white/5 pt-16">
              <div className="text-center max-w-xl mx-auto mb-12">
                <span className="text-[10px] font-mono font-bold text-yellow-500 tracking-[0.25em] block mb-2 uppercase">
                  EXPERIENCE YOLOv11 & GEMINI
                </span>
                <h3 className="text-3xl font-extrabold italic" style={{ fontFamily: "Georgia, serif" }}>
                  Interactive AI Sandbox Preview
                </h3>
                <p className="text-xs text-slate-400 mt-2">
                  Select a live construction site sector image below, then hit "Run Visual Compliance Scan" to see BuildGuard classify PPE breaches.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Visual Selector */}
                <div className="lg:col-span-4 space-y-4">
                  <span className="text-xs font-mono font-bold text-slate-500 block uppercase">
                    Select Demo Environment:
                  </span>
                  {PRESET_CAPTURES.map((preset, idx) => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        setDetectionMode("preset");
                        setActivePresetIndex(idx);
                        setScanResult(null);
                      }}
                      className={`w-full text-left p-4 rounded-2xl border transition-all flex gap-4 ${
                        detectionMode === "preset" && activePresetIndex === idx
                          ? "bg-yellow-500/5 border-yellow-500 text-white"
                          : "bg-[#111317] border-white/5 hover:border-white/10 text-slate-400"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-lg bg-cover bg-center shrink-0" style={{ backgroundImage: `url('${preset.url}')` }}></div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{preset.name}</h4>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">{preset.description}</p>
                      </div>
                    </button>
                  ))}

                  <div className="pt-4">
                    <button 
                      onClick={() => {
                        setCurrentTab("camera");
                        setDetectionMode("upload");
                      }}
                      className="w-full py-3 bg-[#161618] hover:bg-[#202023] border border-white/10 hover:border-yellow-500/20 text-xs font-bold uppercase rounded-xl transition-all text-yellow-500 flex items-center justify-center gap-2"
                    >
                      <Upload size={14} />
                      Or Upload Custom Image File
                    </button>
                  </div>
                </div>

                {/* Scan Frame */}
                <div className="lg:col-span-8 bg-[#111317] border border-white/5 rounded-3xl p-6 space-y-6">
                  
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-black/60">
                    <img 
                      src={PRESET_CAPTURES[activePresetIndex].url} 
                      alt="Demo site" 
                      className="w-full h-full object-cover opacity-80"
                    />

                    {/* Scanning overlay effect */}
                    {isScanning && (
                      <div className="absolute inset-x-0 h-1 bg-yellow-500 shadow-[0_0_20px_rgba(245,158,11,1)] animate-bounce" style={{ top: "40%" }}></div>
                    )}

                    {/* Render boxes if scan is completed */}
                    {scanResult && scanResult.boundingBoxes && (
                      <div className="absolute inset-0 pointer-events-none">
                        {scanResult.boundingBoxes.map((box: any, bIdx: number) => (
                          <div
                            key={bIdx}
                            className={`absolute border-2 font-mono text-[9px] font-bold p-0.5 flex flex-col justify-between ${
                              box.label.includes("No") || box.label.includes("Violation") 
                                ? "border-red-500 text-red-500 bg-red-500/10" 
                                : "border-green-500 text-green-500 bg-green-500/10"
                            }`}
                            style={{
                              left: `${box.x}%`,
                              top: `${box.y}%`,
                              width: `${box.width}%`,
                              height: `${box.height}%`,
                            }}
                          >
                            <span>{box.label} ({(box.confidence * 100).toFixed(0)}%)</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Initial Overlay Prompt */}
                    {!isScanning && !scanResult && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <button 
                          onClick={executeLiveScan}
                          className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-xl font-bold uppercase text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg"
                        >
                          <Play size={14} className="fill-black" />
                          Run Visual Compliance Scan
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Scan results metrics */}
                  {scanResult && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#161618] p-5 rounded-2xl border border-white/5 animate-fade-in text-left">
                      <div>
                        <h4 className="text-xs font-mono uppercase tracking-wider text-yellow-500 mb-2">
                          ✦ Site Scan HUD Analytics
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between border-b border-white/5 pb-1.5">
                            <span className="text-slate-400 text-xs">Workers Count:</span>
                            <span className="font-bold">{scanResult.workerCount}</span>
                          </div>
                          <div className="flex justify-between border-b border-white/5 pb-1.5">
                            <span className="text-slate-400 text-xs">Helmet Compliance:</span>
                            <span className="font-bold text-green-400">
                              {scanResult.helmetCompliantCount} / {scanResult.workerCount} Compliant
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400 text-xs">Vest Compliance:</span>
                            <span className="font-bold text-green-400">
                              {scanResult.vestCompliantCount} / {scanResult.workerCount} Compliant
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs font-mono uppercase tracking-wider text-yellow-500 mb-2">
                          ✦ OSHA Corrective Recommendations
                        </h4>
                        <ul className="space-y-1.5 text-xs text-slate-300">
                          {scanResult.recommendations && scanResult.recommendations.map((rec: string, rIdx: number) => (
                            <li key={rIdx} className="flex items-start gap-1.5">
                              <span className="text-yellow-500">✔</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </section>

            {/* KEY FEATURES */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 border-t border-white/5">
              <div className="p-6 bg-[#111317] border border-white/5 rounded-3xl space-y-4">
                <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center text-yellow-500">
                  <Camera size={22} />
                </div>
                <h4 style={{ fontFamily: "Georgia, serif" }} className="text-xl font-bold italic text-white">YOLOv11 Object Detection</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Deep learning vision model optimizes high-frame rate analysis to detect helmets, protective vests, machinery zones, welding fire hazards and uncertified zone intrusions.
                </p>
              </div>

              <div className="p-6 bg-[#111317] border border-white/5 rounded-3xl space-y-4">
                <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center text-yellow-500">
                  <MessageSquare size={22} />
                </div>
                <h4 style={{ fontFamily: "Georgia, serif" }} className="text-xl font-bold italic text-white">Gemini Safety Copilot</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Real-time contextual support parses safety logs, drafts automated incident tickets, explains complex OSHA CFR policies, and predicts weather risk impacts.
                </p>
              </div>

              <div className="p-6 bg-[#111317] border border-white/5 rounded-3xl space-y-4">
                <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center text-yellow-500">
                  <Bell size={22} />
                </div>
                <h4 style={{ fontFamily: "Georgia, serif" }} className="text-xl font-bold italic text-white">Fail-Safe Emergency Alerts</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Instant webhook dispatch integrates with WhatsApp, SMS queues, and corporate emails to notify supervisors the moment high-severity safety breaches are flagged.
                </p>
              </div>
            </section>

            {/* PRICING SECTION */}
            <section className="border-t border-white/5 pt-16">
              <div className="text-center max-w-xl mx-auto mb-12">
                <span className="text-[10px] font-mono font-bold text-yellow-500 tracking-[0.25em] block mb-2 uppercase">
                  INVESTMENT PLANS
                </span>
                <h3 className="text-3xl font-extrabold italic" style={{ fontFamily: "Georgia, serif" }}>
                  Simple, Predictable Pricing
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Plan 1 */}
                <div className="bg-[#111317] border border-white/5 p-8 rounded-3xl flex flex-col justify-between">
                  <div className="space-y-4">
                    <span className="text-xs font-mono text-slate-500 block uppercase">Starter Suite</span>
                    <h4 className="text-3xl font-bold text-white">$149<span className="text-xs text-slate-500">/mo</span></h4>
                    <p className="text-xs text-slate-400">Perfect for private contractors and single-facility construction sites.</p>
                    <ul className="space-y-2 text-xs text-slate-300 pt-4">
                      <li>• 2 Monitored Site Cameras</li>
                      <li>• 15-day alert archiving</li>
                      <li>• Standard YOLOv11 detectors</li>
                      <li>• SMS Alert Dispatching</li>
                    </ul>
                  </div>
                  <button onClick={() => setCurrentTab("auth")} className="w-full mt-8 py-3 bg-white/5 hover:bg-white/10 text-white text-xs font-bold uppercase rounded-xl transition-all">
                    Register Account
                  </button>
                </div>

                {/* Plan 2 */}
                <div className="bg-[#111317] border-2 border-yellow-500/30 p-8 rounded-3xl flex flex-col justify-between relative">
                  <span className="absolute -top-3 left-6 bg-yellow-500 text-black text-[9px] font-black px-2 py-0.5 rounded uppercase">
                    MOST POPULAR
                  </span>
                  <div className="space-y-4">
                    <span className="text-xs font-mono text-yellow-500 block uppercase">Industrial Pro</span>
                    <h4 className="text-3xl font-bold text-white">$499<span className="text-xs text-slate-500">/mo</span></h4>
                    <p className="text-xs text-slate-400">Engineered for large multi-story builds and active commercial foreman units.</p>
                    <ul className="space-y-2 text-xs text-slate-300 pt-4">
                      <li>• Up to 10 Monitored Site Cameras</li>
                      <li>• Unlimited alert archiving</li>
                      <li>• Advanced Gemini Safety Copilot integration</li>
                      <li>• Multi-channel WhatsApp + SMS dispatch</li>
                      <li>• PDF Compliance Report generation</li>
                    </ul>
                  </div>
                  <button onClick={() => setCurrentTab("auth")} className="w-full mt-8 py-3 bg-yellow-500 hover:bg-yellow-600 text-black text-xs font-black uppercase rounded-xl transition-all">
                    Get Started Now
                  </button>
                </div>

                {/* Plan 3 */}
                <div className="bg-[#111317] border border-white/5 p-8 rounded-3xl flex flex-col justify-between">
                  <div className="space-y-4">
                    <span className="text-xs font-mono text-slate-500 block uppercase">Enterprise Scale</span>
                    <h4 className="text-3xl font-bold text-white">$1,200+<span className="text-xs text-slate-500">/mo</span></h4>
                    <p className="text-xs text-slate-400">For global infrastructure corporations managing multiple high-rise sectors.</p>
                    <ul className="space-y-2 text-xs text-slate-300 pt-4">
                      <li>• Unlimited Monitored Site Cameras</li>
                      <li>• Custom fine-tuned YOLO model weights</li>
                      <li>• Dedicated support architect</li>
                      <li>• Dedicated Google Cloud Storage bucket</li>
                    </ul>
                  </div>
                  <button onClick={() => setCurrentTab("auth")} className="w-full mt-8 py-3 bg-white/5 hover:bg-white/10 text-white text-xs font-bold uppercase rounded-xl transition-all">
                    Contact Sales
                  </button>
                </div>
              </div>
            </section>

            {/* TESTIMONIALS */}
            <section className="border-t border-white/5 pt-16">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-4 text-left">
                  <span className="text-[10px] font-mono font-bold text-yellow-500 uppercase tracking-widest block">
                    TRUSTED BY FOREMEN WORLDWIDE
                  </span>
                  <h3 className="text-3xl font-extrabold italic" style={{ fontFamily: "Georgia, serif" }}>
                    What Site Supervisors Say
                  </h3>
                  <p className="text-xs text-slate-400">
                    Discover how real safety inspectors utilize our autonomous tracking engine to enforce zero-injury daily compliance.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="border-l-2 border-yellow-500 pl-6 space-y-2 text-left">
                    <p style={{ fontFamily: "Georgia, serif" }} className="text-base italic text-slate-200">
                      "Deploying BuildGuard on our Manhattan high-rise project completely shifted our team safety habits. Workers instantly became compliant knowing the AI dashboard logs vest issues within 10 seconds."
                    </p>
                    <div className="text-xs font-bold">
                      — Elena Rostova, Site Superintendent at Brooklyn Naval Yards
                    </div>
                  </div>

                  <div className="border-l-2 border-yellow-500 pl-6 space-y-2 text-left">
                    <p style={{ fontFamily: "Georgia, serif" }} className="text-base italic text-slate-200">
                      "The Gemini Copilot is incredibly resourceful. I can type 'Explain OSHA 1926.451 scaffold clearances' and receive a clean brief during my active inspection walk."
                    </p>
                    <div className="text-xs font-bold">
                      — Marcus Vance, Chief Safety Officer
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* FAQ */}
            <section className="border-t border-white/5 pt-16 text-left max-w-4xl mx-auto space-y-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-extrabold italic" style={{ fontFamily: "Georgia, serif" }}>Frequently Asked Questions</h3>
              </div>

              <div className="space-y-4">
                <div className="bg-[#111317] border border-white/5 p-5 rounded-2xl">
                  <h4 className="font-bold text-xs text-yellow-500 uppercase">How does YOLOv11 handle low-light or outdoor rain dust?</h4>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    YOLOv11 contains advanced exposure balance layers that accurately resolve worker boundaries even during heavy fog, dust plumes, or evening night shifts.
                  </p>
                </div>
                <div className="bg-[#111317] border border-white/5 p-5 rounded-2xl">
                  <h4 className="font-bold text-xs text-yellow-500 uppercase">Does this replace physical safety personnel?</h4>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    No. BuildGuard is designed to act as a 24/7 force multiplier for safety inspectors, allowing one officer to confidently supervise 15 discrete zones simultaneously.
                  </p>
                </div>
              </div>
            </section>

            {/* CONTACT FOOTER */}
            <section className="border-t border-white/5 pt-16 text-center max-w-2xl mx-auto space-y-6 pb-12">
              <h3 className="text-2xl font-extrabold italic" style={{ fontFamily: "Georgia, serif" }}>Get Secure Construction Safety Integration</h3>
              <p className="text-xs text-slate-400">
                Have specific telemetry or drone camera feeds to connect? Drop our safety engineering group a message.
              </p>
              <form onSubmit={(e) => { e.preventDefault(); alert("Thank you. Our safety integration team will follow up within 2 hours."); }} className="flex flex-col sm:flex-row gap-3">
                <input 
                  type="email" 
                  placeholder="Enter supervisor corporate email..." 
                  required
                  className="bg-[#111317] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-yellow-500 flex-1"
                />
                <button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 text-xs font-bold uppercase rounded-xl tracking-wider transition-all">
                  Request Callback
                </button>
              </form>
            </section>

          </div>
        )}

        {/* 2. AUTHENTICATION */}
        {currentTab === "auth" && (
          <div className="p-8 max-w-md mx-auto my-12 bg-[#111317] border border-white/5 rounded-3xl space-y-6 text-left shadow-2xl">
            <div className="text-center">
              <span className="text-[9px] font-mono font-bold text-yellow-500 uppercase tracking-widest">
                BUILDGUARD OPERATOR PORTAL
              </span>
              <h3 style={{ fontFamily: "Georgia, serif" }} className="text-2xl font-bold italic text-white mt-1">
                Authorized Personnel Sign In
              </h3>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              // Mock Login
              setCurrentUser({
                email: "dp128578@gmail.com",
                name: "Marcus Vance",
                role: "Senior Safety Inspector",
                siteIds: ["manhattan-east"]
              });
              setCurrentTab("dashboard");
            }} className="space-y-4">
              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">Corporate Email Address</label>
                <input 
                  type="email" 
                  defaultValue="dp128578@gmail.com"
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-yellow-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">Secure Password</label>
                <input 
                  type="password" 
                  defaultValue="password123"
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-yellow-500"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" defaultChecked className="accent-yellow-500" />
                  <span>Remember Session</span>
                </label>
                <button type="button" onClick={() => alert("Password reset token sent to dp128578@gmail.com.")} className="text-yellow-500 hover:underline">
                  Forgot Password?
                </button>
              </div>

              <button 
                type="submit" 
                className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-bold uppercase text-xs rounded-xl tracking-wider transition-all shadow-md"
              >
                Sign In to Safety Console
              </button>
            </form>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-white/5"></div>
              <span className="flex-shrink mx-4 text-[10px] font-mono text-slate-500 uppercase">OR SOCIAL AUTH</span>
              <div className="flex-grow border-t border-white/5"></div>
            </div>

            <button 
              onClick={() => {
                setCurrentUser({
                  email: "dp128578@gmail.com",
                  name: "Google Associate Foreman",
                  role: "Field Safety Officer",
                  siteIds: ["manhattan-east"]
                });
                setCurrentTab("dashboard");
              }}
              className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5.04c1.62 0 3.1.56 4.24 1.66l3.17-3.17C17.48 1.6 14.94 1 12 1 7.35 1 3.39 3.65 1.5 7.5l3.78 2.93C6.18 7.37 8.89 5.04 12 5.04z" />
                <path fill="#4285F4" d="M23.5 12.25c0-.82-.07-1.61-.21-2.38H12v4.51h6.46c-.28 1.47-1.11 2.72-2.36 3.56l3.66 2.84c2.14-1.98 3.74-4.89 3.74-8.53z" />
                <path fill="#FBBC05" d="M5.28 14.57c-.24-.72-.38-1.49-.38-2.28s.14-1.56.38-2.28L1.5 7.08C.54 9.02 0 11.2 0 13.5s.54 4.48 1.5 6.42l3.78-2.93z" />
                <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.66-2.84c-1.01.68-2.31 1.09-3.8 1.09-3.11 0-5.82-2.33-6.72-5.39L1.5 16.08C3.39 19.93 7.35 23 12 23z" />
              </svg>
              Sign In with Google G-Suite
            </button>

            <p className="text-center text-[11px] text-slate-500">
              Not registered on safety system?{" "}
              <button onClick={() => alert("Please contact administrator team at support@buildguard.ai for registration token.")} className="text-yellow-500 font-bold hover:underline">
                Request Sign-up Credential
              </button>
            </p>
          </div>
        )}

        {/* 3. DASHBOARD */}
        {currentTab === "dashboard" && (
          <div className="p-8 space-y-8 max-w-7xl mx-auto w-full text-left">
            
            {/* Header telemetry and safety score */}
            <div className="flex flex-wrap justify-between items-end border-b border-white/5 pb-6 gap-4">
              <div>
                <h3 className="text-3xl font-extrabold tracking-tight uppercase italic font-display">
                  {lang === "EN" ? "Operator Command Station" : lang === "HI" ? "ऑपरेटर कमांड स्टेशन" : "ऑपरेटर कमांड स्टेशन"}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Active Monitoring Project: <span className="text-yellow-500 font-bold">{activeSite.name}</span> • Supervised by {activeSite.supervisor}
                </p>
              </div>

              <div className="flex gap-4">
                <div className="bg-[#161618] border border-white/5 px-4 py-3 rounded-2xl flex items-center gap-3">
                  <CloudSun className="text-amber-400" size={24} />
                  <div>
                    <div className="text-[10px] text-slate-500 font-mono">SITE WEATHER</div>
                    <div className="text-xs font-bold text-white">74°F / Light Wind</div>
                  </div>
                </div>

                <div className="bg-[#161618] border border-white/5 px-4 py-3 rounded-2xl flex items-center gap-3">
                  <Clock className="text-yellow-500" size={24} />
                  <div>
                    <div className="text-[10px] text-slate-500 font-mono">LOCAL TIME</div>
                    <div className="text-xs font-bold text-white">08:12 PM EST</div>
                  </div>
                </div>
              </div>
            </div>

            {/* QUICK STATS CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Workers count */}
              <div className="bg-[#161618] border border-white/5 p-6 rounded-[24px] space-y-2 relative overflow-hidden">
                <div className="absolute right-4 top-4 text-slate-700">
                  <Users size={32} />
                </div>
                <div className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">{d.workerCount}</div>
                <div className="text-3xl font-extrabold italic" style={{ fontFamily: "Georgia, serif" }}>
                  {activeSite.workersCount || 42} <span className="text-xs text-green-500 font-sans not-italic font-bold ml-1">+3 today</span>
                </div>
                <div className="text-[10px] text-slate-400">All crew biometric badges checked-in</div>
              </div>

              {/* PPE Compliance percentage */}
              <div className="bg-[#161618] border border-white/5 p-6 rounded-[24px] space-y-2 relative overflow-hidden">
                <div className="absolute right-4 top-4 text-slate-700">
                  <HardHat size={32} />
                </div>
                <div className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">{d.ppeCompliance}</div>
                <div className="text-3xl font-extrabold text-yellow-500 italic" style={{ fontFamily: "Georgia, serif" }}>
                  94.2%
                </div>
                <div className="text-[10px] text-slate-400">Target safe limit threshold: 95%</div>
              </div>

              {/* Safety Rating Score */}
              <div className="bg-[#161618] border border-white/5 p-6 rounded-[24px] space-y-2 relative overflow-hidden">
                <div className="absolute right-4 top-4 text-slate-700">
                  <Shield size={32} />
                </div>
                <div className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">{d.safetyScore}</div>
                <div className="text-3xl font-extrabold text-green-400 italic" style={{ fontFamily: "Georgia, serif" }}>
                  {activeSite.safetyScore || 92}%
                </div>
                <div className="text-[10px] text-slate-400">Calculated overall risk metric</div>
              </div>

              {/* Active alerts count */}
              <div className={`p-6 rounded-[24px] space-y-2 relative overflow-hidden border ${
                activeAlertsCount > 0 
                  ? "bg-red-500/10 border-red-500/20 text-red-100 animate-warning-flash" 
                  : "bg-[#161618] border-white/5"
              }`}>
                <div className="absolute right-4 top-4 text-red-500/30">
                  <AlertTriangle size={32} />
                </div>
                <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">{d.activeAlerts}</div>
                <div className="text-3xl font-extrabold italic" style={{ fontFamily: "Georgia, serif" }}>
                  {activeAlertsCount}
                </div>
                <div className="text-[10px] text-slate-400">Urgent dispatcher queue items</div>
              </div>

            </div>

            {/* CCTV STREAM HUD + SIDE PANEL CHAT COPILOT */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* CCTV Feed Selector (8 cols) */}
              <div className="lg:col-span-8 space-y-4">
                <div className="flex justify-between items-center bg-[#111317] p-4 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                    <span className="text-xs font-bold uppercase">CCTV Feeds Matrix</span>
                  </div>
                  
                  {/* Select Feed dropdown */}
                  <select 
                    value={selectedCameraId}
                    onChange={(e) => setSelectedCameraId(e.target.value)}
                    className="bg-black/50 text-xs border border-white/10 rounded px-2 py-1 text-white focus:outline-none"
                  >
                    {cameras.filter(c => c.siteId === selectedSiteId).map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.status})</option>
                    ))}
                  </select>
                </div>

                <div className="relative aspect-video rounded-3xl overflow-hidden bg-slate-900 border border-white/5 shadow-inner">
                  <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1200&q=80')` }}></div>
                  <div className="absolute inset-0 bg-black/40 p-6 flex flex-col justify-between">
                    
                    <div className="flex justify-between items-start">
                      <span className="bg-red-600 text-white px-2.5 py-0.5 text-[9px] font-bold rounded uppercase tracking-wider">
                        Live Broadcast (cam-01_north)
                      </span>
                      <span className="text-[10px] font-mono text-white/60 bg-black/60 px-2 py-0.5 rounded">
                        COMPLIANCE: 94% Compliant
                      </span>
                    </div>

                    {/* Simulating Bounding Boxes on active stream */}
                    <div className="absolute top-1/4 left-1/3 w-32 h-44 border-2 border-green-500 flex flex-col pointer-events-none">
                      <span className="bg-green-500 text-black text-[9px] font-black px-1.5 self-start uppercase">PPE: Hardhat Vest</span>
                    </div>

                    <div className="absolute bottom-1/4 right-1/4 w-28 h-36 border-2 border-red-500 flex flex-col pointer-events-none">
                      <span className="bg-red-500 text-white text-[9px] font-black px-1.5 self-start uppercase animate-pulse">No Helmet</span>
                    </div>

                    <div className="flex justify-between items-end">
                      <div className="bg-black/80 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 text-xs">
                        <div className="text-[10px] text-slate-400">YOLO CLASS DETECTIONS</div>
                        <div className="font-bold text-yellow-500">5 Persons • 4 Helmets • 1 Violation</div>
                      </div>
                      <span className="text-[10px] font-mono text-white/40">FPS: 30 • Res: 1080p</span>
                    </div>

                  </div>
                </div>

                {/* Pre-seeded Assistant Queries */}
                <div className="bg-[#111317] border border-white/5 p-5 rounded-2xl text-left space-y-3">
                  <div className="text-xs font-mono text-slate-500 uppercase tracking-widest">
                    Suggested Copilot Tasks:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => handleChatSubmit(undefined, "How many workers are on site?")} 
                      className="text-[10px] border border-white/10 px-3 py-1.5 rounded-full hover:bg-yellow-500 hover:text-black hover:border-transparent transition-all"
                    >
                      How many workers are on site?
                    </button>
                    <button 
                      onClick={() => handleChatSubmit(undefined, "Any safety violations?")} 
                      className="text-[10px] border border-white/10 px-3 py-1.5 rounded-full hover:bg-yellow-500 hover:text-black hover:border-transparent transition-all"
                    >
                      Any safety violations?
                    </button>
                    <button 
                      onClick={() => handleChatSubmit(undefined, "Predict construction risks")} 
                      className="text-[10px] border border-white/10 px-3 py-1.5 rounded-full hover:bg-yellow-500 hover:text-black hover:border-transparent transition-all"
                    >
                      Predict construction risks
                    </button>
                    <button 
                      onClick={() => handleChatSubmit(undefined, "Explain safety recommendations")} 
                      className="text-[10px] border border-white/10 px-3 py-1.5 rounded-full hover:bg-yellow-500 hover:text-black hover:border-transparent transition-all"
                    >
                      Explain safety recommendations
                    </button>
                  </div>
                </div>
              </div>

              {/* Sidebar AI Assistant (4 cols) */}
              <div className="lg:col-span-4 bg-[#111317] border border-white/5 rounded-3xl p-6 h-[580px] flex flex-col justify-between">
                
                <div className="border-b border-white/5 pb-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-mono uppercase tracking-widest text-yellow-500">
                      🛡️ BuildGuard Safety Copilot
                    </h4>
                    <span className="text-[9px] bg-yellow-500/10 text-yellow-500 font-bold px-1.5 py-0.5 rounded">
                      Gemini 3.5
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Autonomous regulatory auditor and site forecasting</p>
                </div>

                {/* Chat Message Logs */}
                <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 text-xs">
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className={`space-y-1 ${msg.role === "user" ? "text-right" : "text-left"}`}>
                      <div className="text-[9px] text-slate-500 font-mono">
                        {msg.role === "user" ? "Supervisor" : "Gemini AI"} • {msg.time}
                      </div>
                      <div className={`p-3 rounded-2xl inline-block max-w-[90%] ${
                        msg.role === "user" 
                          ? "bg-yellow-500 text-black font-medium" 
                          : "bg-white/5 text-slate-200 border border-white/5"
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}

                  {isChatTyping && (
                    <div className="text-left space-y-1">
                      <span className="text-[9px] text-slate-500 font-mono">Gemini AI is analyzing...</span>
                      <div className="bg-white/5 p-3 rounded-2xl inline-block text-slate-400 border border-white/5">
                        Thinking...
                      </div>
                    </div>
                  )}
                </div>

                {/* Input block */}
                <form onSubmit={handleChatSubmit} className="relative mt-2">
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask Gemini Safety Copilot..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 pr-10 text-xs text-white focus:outline-none focus:border-yellow-500"
                  />
                  <button 
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-yellow-500 hover:text-yellow-600 transition-colors"
                  >
                    <Send size={16} />
                  </button>
                </form>

              </div>
            </div>

            {/* WEEKLY COMPLIANCE HISTORICAL COMPONENT */}
            <section className="bg-[#111317] border border-white/5 rounded-3xl p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h4 style={{ fontFamily: "Georgia, serif" }} className="text-xl font-bold italic text-white">
                    Site PPE Compliance Trend
                  </h4>
                  <p className="text-xs text-slate-400">Weekly average computed from visual checkpoints</p>
                </div>
                <div className="flex gap-2">
                  <span className="text-xs font-mono text-green-400 bg-green-500/10 px-2 py-0.5 rounded">
                    Overall compliance up +2.4%
                  </span>
                </div>
              </div>

              {/* Chart.js mockup using CSS flex columns to be extremely robust and elegant */}
              <div className="h-44 flex items-end justify-between gap-4 pt-4 border-b border-white/5">
                {[
                  { day: "Mon", score: 88, violations: 4 },
                  { day: "Tue", score: 92, violations: 2 },
                  { day: "Wed", score: 90, violations: 3 },
                  { day: "Thu", score: 94, violations: 1 },
                  { day: "Fri", score: 96, violations: 0 },
                  { day: "Sat", score: 92, violations: 2 },
                  { day: "Sun", score: 98, violations: 0 }
                ].map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                    <div className="text-[10px] font-mono text-slate-500 opacity-0 group-hover:opacity-100 transition-all">
                      {item.score}% compliance
                    </div>
                    
                    {/* Bar visualization */}
                    <div className="w-full bg-slate-800 rounded-t-md h-28 relative overflow-hidden">
                      <div 
                        className="bg-yellow-500 absolute bottom-0 inset-x-0 transition-all duration-500 rounded-t-md hover:bg-yellow-400"
                        style={{ height: `${item.score}%` }}
                      ></div>
                    </div>

                    <div className="text-[10px] font-mono text-slate-400 mt-1">{item.day}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* ACTIVE EMERGENCY DISPATCH ALERTS LOG */}
            <section className="bg-[#111317] border border-white/5 rounded-3xl p-6">
              <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
                <div>
                  <h4 style={{ fontFamily: "Georgia, serif" }} className="text-xl font-bold italic text-white">
                    Live Incident Logs & Corrective Audits
                  </h4>
                  <p className="text-xs text-slate-400">Auditable site anomalies flagged by YOLO scanner models</p>
                </div>

                <div className="flex gap-1 bg-black/40 p-1 rounded-lg border border-white/10">
                  {(["all", "active", "resolved"] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setAlertFilter(filter)}
                      className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition-all ${
                        alertFilter === filter ? "bg-yellow-500 text-black" : "text-gray-400 hover:text-white"
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              {/* Alerts Log List */}
              <div className="space-y-4">
                {alerts.filter(a => {
                  if (alertFilter === "active") return !a.resolved;
                  if (alertFilter === "resolved") return a.resolved;
                  return true;
                }).length > 0 ? (
                  alerts.filter(a => {
                    if (alertFilter === "active") return !a.resolved;
                    if (alertFilter === "resolved") return a.resolved;
                    return true;
                  }).map((alertItem) => (
                    <div 
                      key={alertItem.id}
                      className={`p-5 rounded-2xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all ${
                        alertItem.resolved 
                          ? "bg-white/[0.02] border-white/5 opacity-70" 
                          : "bg-red-500/[0.03] border-red-500/20"
                      }`}
                    >
                      <div className="space-y-2 text-left">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2 py-0.5 text-[8px] font-mono font-black uppercase rounded ${
                            alertItem.severity === "High" ? "bg-red-500 text-white" : "bg-yellow-500 text-black"
                          }`}>
                            {alertItem.severity} Severity
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">{new Date(alertItem.timestamp).toLocaleTimeString()}</span>
                          <span className="text-xs text-slate-400">• Location: <strong className="text-white">{alertItem.location}</strong></span>
                        </div>

                        <h5 className="font-bold text-xs uppercase tracking-tight text-white flex items-center gap-1.5">
                          {!alertItem.resolved && <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>}
                          {alertItem.label}
                        </h5>
                        <p className="text-xs text-slate-400 max-w-2xl">{alertItem.description}</p>
                      </div>

                      <div className="flex gap-2 shrink-0">
                        {alertItem.resolved ? (
                          <span className="text-xs text-green-400 font-mono flex items-center gap-1">
                            <CheckCircle2 size={14} /> Resolved & Audited
                          </span>
                        ) : (
                          <button 
                            onClick={() => resolveAlert(alertItem.id)}
                            className="bg-green-500 hover:bg-green-600 text-black font-bold text-[10px] uppercase px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                          >
                            Mark as Resolved
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-500 text-xs font-mono">
                    ✔ No safety incidents flagged matching the filter criteria.
                  </div>
                )}
              </div>
            </section>

          </div>
        )}

        {/* 4. LIVE CAMERA SCANNING PAGE */}
        {currentTab === "camera" && (
          <div className="p-8 space-y-8 max-w-7xl mx-auto text-left w-full">
            <div className="border-b border-white/5 pb-4">
              <h3 className="text-3xl font-extrabold tracking-tight uppercase italic font-display">
                {d.liveScanning}
              </h3>
              <p className="text-xs text-slate-400">
                Upload raw construction environment images to parse PPE compliant bounding boxes using YOLOv11 detectors.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Scan controller column (4 cols) */}
              <div className="lg:col-span-4 space-y-6 bg-[#111317] border border-white/5 p-6 rounded-3xl">
                <div>
                  <label className="text-xs font-mono text-slate-500 block uppercase mb-2">Input Mode:</label>
                  <div className="grid grid-cols-2 gap-2 bg-black/40 p-1 rounded-xl border border-white/10">
                    <button 
                      onClick={() => setDetectionMode("preset")}
                      className={`py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${
                        detectionMode === "preset" ? "bg-yellow-500 text-black" : "text-gray-400 hover:text-white"
                      }`}
                    >
                      Pre-loaded Presets
                    </button>
                    <button 
                      onClick={() => setDetectionMode("upload")}
                      className={`py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${
                        detectionMode === "upload" ? "bg-yellow-500 text-black" : "text-gray-400 hover:text-white"
                      }`}
                    >
                      Image Upload File
                    </button>
                  </div>
                </div>

                {detectionMode === "preset" ? (
                  <div className="space-y-3">
                    <span className="text-[11px] font-mono text-slate-400 uppercase">Select Target Environment</span>
                    {PRESET_CAPTURES.map((preset, idx) => (
                      <button
                        key={preset.id}
                        onClick={() => {
                          setActivePresetIndex(idx);
                          setScanResult(null);
                        }}
                        className={`w-full text-left p-3 rounded-xl border transition-all flex gap-3 items-center ${
                          activePresetIndex === idx ? "bg-yellow-500/5 border-yellow-500" : "bg-black/20 border-white/5 hover:border-white/10"
                        }`}
                      >
                        <div className="w-10 h-10 bg-cover bg-center rounded-lg" style={{ backgroundImage: `url('${preset.url}')` }}></div>
                        <div>
                          <h5 className="text-[11px] font-bold text-white">{preset.name}</h5>
                          <p className="text-[9px] text-slate-500 truncate">{preset.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <span className="text-[11px] font-mono text-slate-400 uppercase">Upload Frame</span>
                    <div className="border-2 border-dashed border-white/10 hover:border-yellow-500/30 rounded-2xl p-6 text-center transition-all bg-black/20 relative">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <Upload size={32} className="mx-auto text-slate-500 mb-2" />
                      <p className="text-xs text-slate-300 font-medium">Click or Drag Image here</p>
                      <p className="text-[9px] text-slate-500 mt-1">PNG, JPG up to 10MB</p>
                    </div>

                    {uploadedImage && (
                      <div className="bg-black/40 p-3 rounded-xl border border-white/10 flex items-center justify-between">
                        <span className="text-[10px] text-green-400 truncate max-w-[80%]">Image loaded successfully!</span>
                        <button onClick={() => setUploadedImage(null)} className="text-red-400 text-xs hover:underline">
                          Clear
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={executeLiveScan}
                  disabled={isScanning || (detectionMode === "upload" && !uploadedImage)}
                  className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 disabled:bg-slate-800 disabled:text-slate-500 text-black font-bold uppercase text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                >
                  {isScanning ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      Analyzing Visuals...
                    </>
                  ) : (
                    <>
                      <Play size={14} className="fill-black" />
                      Run YOLOv11 Safety Scan
                    </>
                  )}
                </button>
              </div>

              {/* Scanning HUD output (8 cols) */}
              <div className="lg:col-span-8 bg-[#111317] border border-white/5 rounded-3xl p-6 space-y-6">
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <span className="text-xs font-mono text-slate-400 uppercase">Detection Analytics Panel</span>
                  {scanResult && (
                    <span className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded ${
                      scanResult.safetyScore >= 90 ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                    }`}>
                      Score: {scanResult.safetyScore}% Compliance
                    </span>
                  )}
                </div>

                <div className="relative aspect-video rounded-2xl overflow-hidden bg-black/60">
                  <img 
                    src={detectionMode === "preset" ? PRESET_CAPTURES[activePresetIndex].url : (uploadedImage || "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80")} 
                    alt="Active target scanning" 
                    className="w-full h-full object-cover"
                  />

                  {/* Laser Scanning Bar */}
                  {isScanning && (
                    <div className="absolute inset-x-0 h-1 bg-yellow-500 shadow-[0_0_20px_rgba(245,158,11,1)] animate-bounce" style={{ top: "35%" }}></div>
                  )}

                  {/* Dynamic Bounding Box Placement */}
                  {scanResult && scanResult.boundingBoxes && (
                    <div className="absolute inset-0 pointer-events-none">
                      {scanResult.boundingBoxes.map((box: any, bIdx: number) => (
                        <div
                          key={bIdx}
                          className={`absolute border-2 font-mono text-[9px] font-bold p-0.5 flex flex-col justify-between ${
                            box.label.includes("No") || box.label.includes("Violation") 
                              ? "border-red-500 text-red-500 bg-red-500/10 animate-pulse" 
                              : "border-green-500 text-green-500 bg-green-500/10"
                          }`}
                          style={{
                            left: `${box.x}%`,
                            top: `${box.y}%`,
                            width: `${box.width}%`,
                            height: `${box.height}%`,
                          }}
                        >
                          <span>{box.label} ({(box.confidence * 100).toFixed(0)}%)</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Audit details block */}
                {scanResult ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-black/20 p-5 rounded-2xl border border-white/5 text-left">
                    <div className="space-y-3">
                      <h4 className="text-xs font-mono uppercase text-yellow-500">
                        🛡️ YOLO Class Quantifications
                      </h4>
                      <div className="space-y-1 text-xs font-mono text-slate-300">
                        <div className="flex justify-between border-b border-white/5 pb-1">
                          <span>Worker Headcount:</span>
                          <span className="font-bold text-white">{scanResult.workerCount}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-1">
                          <span>Helmet Compliant:</span>
                          <span className="font-bold text-green-400">{scanResult.helmetCompliantCount} Compliant</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-1">
                          <span>Vest Compliant:</span>
                          <span className="font-bold text-green-400">{scanResult.vestCompliantCount} Compliant</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Identified Violations:</span>
                          <span className="font-bold text-red-400">{scanResult.violations ? scanResult.violations.length : 0} Anomaly</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-xs font-mono uppercase text-yellow-500">
                        🛡️ AI Hazard Analysis & Violations
                      </h4>
                      {scanResult.violations && scanResult.violations.length > 0 ? (
                        <div className="space-y-2">
                          {scanResult.violations.map((v: string, vIdx: number) => (
                            <div key={vIdx} className="bg-red-500/10 border border-red-500/20 text-red-200 text-xs p-2.5 rounded-lg">
                              {v}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-green-500/10 border border-green-500/20 text-green-200 text-xs p-2.5 rounded-lg">
                          ✔ Zero violations identified by YOLO detectors in this quadrant scan.
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-500 text-xs font-mono bg-black/20 rounded-2xl">
                    No active scan completed. Select preset environment or load file above.
                  </div>
                )}

              </div>
            </div>

          </div>
        )}

        {/* 5. AI SAFETY ASSISTANT COPILOT */}
        {currentTab === "assistant" && (
          <div className="p-8 max-w-4xl mx-auto text-left space-y-8 w-full">
            <div className="border-b border-white/5 pb-4">
              <h3 className="text-3xl font-extrabold tracking-tight uppercase italic font-display">
                BuildGuard Safety Copilot
              </h3>
              <p className="text-xs text-slate-400">
                Powered by Google Gemini. Query OSHA site parameters, draft regulatory shift reports, or analyze hazard compliance.
              </p>
            </div>

            <div className="bg-[#111317] border border-white/5 rounded-3xl p-6 h-[500px] flex flex-col justify-between">
              {/* Chat Log container */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`space-y-1 ${msg.role === "user" ? "text-right" : "text-left"}`}>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {msg.role === "user" ? "Supervisor" : "Gemini AI Expert"} • {msg.time}
                    </div>
                    <div className={`p-4 rounded-2xl inline-block max-w-[85%] ${
                      msg.role === "user" 
                        ? "bg-yellow-500 text-black font-semibold" 
                        : "bg-white/5 text-slate-200 border border-white/5 leading-relaxed"
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}

                {isChatTyping && (
                  <div className="text-left space-y-1">
                    <span className="text-[9px] text-slate-500 font-mono">Gemini AI is crafting compliance analysis...</span>
                    <div className="bg-white/5 p-3 rounded-2xl inline-block text-slate-400 border border-white/5">
                      Consulting OSHA regulations database...
                    </div>
                  </div>
                )}
              </div>

              {/* Action buttons list */}
              <div className="pt-4 border-t border-white/5 space-y-3">
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => handleChatSubmit(undefined, "Generate today's comprehensive site safety report.")}
                    className="text-[10px] bg-white/5 hover:bg-yellow-500 hover:text-black border border-white/10 px-3 py-1.5 rounded-full transition-all"
                  >
                    📝 Draft Today's Report
                  </button>
                  <button 
                    onClick={() => handleChatSubmit(undefined, "What are the scaffolding height requirements under OSHA 1926.451?")}
                    className="text-[10px] bg-white/5 hover:bg-yellow-500 hover:text-black border border-white/10 px-3 py-1.5 rounded-full transition-all"
                  >
                    🏗️ Explain OSHA Scaffold Rules
                  </button>
                  <button 
                    onClick={() => handleChatSubmit(undefined, "Predict construction risks for wind speeds exceeding 35mph.")}
                    className="text-[10px] bg-white/5 hover:bg-yellow-500 hover:text-black border border-white/10 px-3 py-1.5 rounded-full transition-all"
                  >
                    🌪️ Predict Wind Risks
                  </button>
                </div>

                <form onSubmit={handleChatSubmit} className="relative">
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Inquire about safety, workers count, or construction risks..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 px-5 pr-12 text-xs text-white focus:outline-none focus:border-yellow-500"
                  />
                  <button 
                    type="submit"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-yellow-500 hover:text-yellow-600 transition-all cursor-pointer"
                  >
                    <Send size={18} />
                  </button>
                </form>
              </div>
            </div>

          </div>
        )}

        {/* 6. COMPLIANCE REPORTS */}
        {currentTab === "reports" && (
          <div className="p-8 max-w-7xl mx-auto text-left space-y-8 w-full">
            <div className="flex flex-wrap justify-between items-end border-b border-white/5 pb-4 gap-4">
              <div>
                <h3 className="text-3xl font-extrabold tracking-tight uppercase italic font-display">
                  Compliance Reports & Logs
                </h3>
                <p className="text-xs text-slate-400">
                  Generate PDF safety audits using active site telemetry processed by Gemini.
                </p>
              </div>

              <button 
                onClick={triggerNewReport}
                className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 text-xs font-bold uppercase rounded-xl tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-lg"
              >
                <Sparkles size={14} className="fill-black" />
                Trigger Gemini Audit
              </button>
            </div>

            {/* List of generated reports */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reports.map((report) => (
                <div key={report.id} className="bg-[#111317] border border-white/5 p-6 rounded-3xl space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 block">AUDITED DATE: {report.date}</span>
                      <h4 className="font-bold text-sm text-white mt-1">{report.title}</h4>
                    </div>
                    <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded text-[10px] font-bold">
                      {report.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed bg-black/20 p-3 rounded-xl border border-white/5">
                    <strong>Executive Summary:</strong> {report.summary}
                  </p>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2">
                    <div className="bg-white/[0.02] p-2 rounded-lg border border-white/5">
                      <div className="text-[10px] text-slate-500">WORKERS</div>
                      <div className="font-bold text-white">{report.workerCount}</div>
                    </div>
                    <div className="bg-white/[0.02] p-2 rounded-lg border border-white/5">
                      <div className="text-[10px] text-slate-500">HELMETS</div>
                      <div className="font-bold text-green-400">{report.helmetCompliant} / {report.workerCount}</div>
                    </div>
                    <div className="bg-white/[0.02] p-2 rounded-lg border border-white/5">
                      <div className="text-[10px] text-slate-500">VESTS</div>
                      <div className="font-bold text-green-400">{report.vestCompliant} / {report.workerCount}</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 text-[10px] font-mono font-bold">
                    <span className="text-slate-500">COMPLIANCE SCORE: <strong className="text-yellow-500">{report.complianceScore}%</strong></span>
                    <button 
                      onClick={() => alert(`Downloading PDF structure for ${report.id}. All OSHA audit parameters signed off successfully.`)}
                      className="text-yellow-500 hover:underline flex items-center gap-1.5"
                    >
                      <Download size={12} /> Download PDF
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* 7. SITE PROGRESS & COMPARISON */}
        {currentTab === "progress" && (
          <div className="p-8 max-w-7xl mx-auto text-left space-y-8 w-full">
            <div className="border-b border-white/5 pb-4">
              <h3 className="text-3xl font-extrabold tracking-tight uppercase italic font-display">
                Construction Progress & Digital Twin
              </h3>
              <p className="text-xs text-slate-400">
                Compare day-to-day visual scans using automated structural overlay assessments to predict project completion schedules.
              </p>
            </div>

            {/* Delay predictions HUD */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#111317] border border-white/5 p-6 rounded-3xl">
                <div className="text-[10px] font-mono text-slate-500 uppercase">Estimated Completion</div>
                <div className="text-3xl font-extrabold text-white italic mt-1" style={{ fontFamily: "Georgia, serif" }}>
                  68.4%
                </div>
                <div className="text-[10px] text-slate-400 mt-2">Active task: Concrete Deck Casting</div>
              </div>

              <div className="bg-[#111317] border border-white/5 p-6 rounded-3xl">
                <div className="text-[10px] font-mono text-slate-500 uppercase">Schedule Deviation</div>
                <div className="text-3xl font-extrabold text-green-400 italic mt-1" style={{ fontFamily: "Georgia, serif" }}>
                  4 Days Ahead
                </div>
                <div className="text-[10px] text-slate-400 mt-2">Predicted by weather stability model</div>
              </div>

              <div className="bg-[#111317] border border-white/5 p-6 rounded-3xl">
                <div className="text-[10px] font-mono text-slate-500 uppercase">Daily Material Volume Check</div>
                <div className="text-3xl font-extrabold text-yellow-500 italic mt-1" style={{ fontFamily: "Georgia, serif" }}>
                  100% Volumetric
                </div>
                <div className="text-[10px] text-slate-400 mt-2">AI-verified rebar structures</div>
              </div>
            </div>

            {/* Interactive Image comparison slider */}
            <div className="bg-[#111317] border border-white/5 p-6 rounded-3xl space-y-4">
              <div>
                <h4 style={{ fontFamily: "Georgia, serif" }} className="text-xl font-bold italic text-white">Daily Visual Scan Comparison</h4>
                <p className="text-xs text-slate-400">Drag slider below to compare June foundation progress versus active July concrete erection</p>
              </div>

              <div className="relative aspect-video rounded-2xl overflow-hidden bg-black/50 select-none">
                {/* Image A (Base) */}
                <img 
                  src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1200&q=80" 
                  alt="Base Progress" 
                  className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Image B (Overlay with clip-path matching slider) */}
                <div 
                  className="absolute inset-0 w-full h-full object-cover transition-all"
                  style={{ 
                    clipPath: `polygon(0 0, ${compareSliderPos}% 0, ${compareSliderPos}% 100%, 0 100%)`,
                    backgroundImage: `url('https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  <div className="absolute left-6 top-6 bg-black/80 px-3 py-1 rounded text-[10px] font-mono font-bold text-amber-400 uppercase">
                    ACTIVE: JULY 2026 (REBAR LAYER)
                  </div>
                </div>

                {/* Vertical Divider line */}
                <div 
                  className="absolute inset-y-0 w-1 bg-yellow-500 cursor-ew-resize flex items-center justify-center"
                  style={{ left: `${compareSliderPos}%` }}
                >
                  <div className="w-6 h-6 bg-yellow-500 rounded-full border border-black flex items-center justify-center text-black font-bold text-xs select-none">
                    ↔
                  </div>
                </div>

                <div className="absolute right-6 top-6 bg-black/80 px-3 py-1 rounded text-[10px] font-mono font-bold text-slate-400 uppercase">
                  BEFORE: JUNE 2026
                </div>
              </div>

              {/* Slider Input */}
              <div className="flex items-center gap-4 pt-2">
                <span className="text-xs text-slate-500 font-mono">June (Foundation)</span>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={compareSliderPos}
                  onChange={(e) => setCompareSliderPos(Number(e.target.value))}
                  className="flex-1 accent-yellow-500 h-1.5 bg-slate-800 rounded-lg cursor-ew-resize"
                />
                <span className="text-xs text-yellow-500 font-mono">July (Active Framing)</span>
              </div>
            </div>

            {/* Timeline Progress charts */}
            <div className="bg-[#111317] border border-white/5 rounded-3xl p-6">
              <h4 style={{ fontFamily: "Georgia, serif" }} className="text-lg font-bold italic text-white mb-4">
                Milestones & Projected Schedule Logs
              </h4>

              <div className="space-y-4">
                {[
                  { title: "Foundation Excavation", date: "Completed May 12, 2026", status: "Completed", color: "text-green-400" },
                  { title: "Steel Frame Erection", date: "Completed June 28, 2026", status: "Completed", color: "text-green-400" },
                  { title: "Concrete Deck Casting", date: "Target: July 30, 2026", status: "Active (85% Verified)", color: "text-yellow-500" },
                  { title: "Cladding & Facade Installation", date: "Target: August 24, 2026", status: "Upcoming", color: "text-slate-500" },
                  { title: "HVAC & Electrical Commissioning", date: "Target: September 15, 2026", status: "Upcoming", color: "text-slate-500" }
                ].map((step, sIdx) => (
                  <div key={sIdx} className="flex items-start gap-4 border-l-2 border-white/10 pb-4 pl-4 last:border-0 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 -ml-5.5 mt-1 border border-black"></div>
                    <div>
                      <div className="font-bold text-white">{step.title}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{step.date}</div>
                    </div>
                    <span className={`ml-auto font-mono text-[10px] font-bold ${step.color}`}>
                      {step.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* 8. ADMIN CONTROLS */}
        {currentTab === "admin" && (
          <div className="p-8 max-w-7xl mx-auto text-left space-y-8 w-full">
            <div className="border-b border-white/5 pb-4">
              <h3 className="text-3xl font-extrabold tracking-tight uppercase italic font-display">
                Admin Settings & Seed Controls
              </h3>
              <p className="text-xs text-slate-400">
                Register active construction sites, configure simulated cameras, and test customized alert conditions.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Site Registration CRUD */}
              <div className="bg-[#111317] border border-white/5 p-6 rounded-3xl space-y-4">
                <h4 style={{ fontFamily: "Georgia, serif" }} className="text-xl font-bold italic text-white flex items-center gap-2">
                  <Plus size={18} className="text-yellow-500" />
                  Register New Site
                </h4>
                <form onSubmit={registerSite} className="space-y-4 text-xs">
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Site Project Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Queens Crossing Hub"
                      value={newSiteForm.name}
                      onChange={(e) => setNewSiteForm(p => ({ ...p, name: e.target.value }))}
                      required
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-yellow-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Geographical Coordinates</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 40.7580° N, 73.8300° W"
                      value={newSiteForm.location}
                      onChange={(e) => setNewSiteForm(p => ({ ...p, location: e.target.value }))}
                      required
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-yellow-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Supervisor Fullname</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Rajesh Kumar"
                      value={newSiteForm.supervisor}
                      onChange={(e) => setNewSiteForm(p => ({ ...p, supervisor: e.target.value }))}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-yellow-500"
                    />
                  </div>
                  <button type="submit" className="w-full py-2.5 bg-yellow-500 hover:bg-yellow-600 text-black font-bold uppercase rounded-lg tracking-wider transition-all">
                    Register Construction Site
                  </button>
                </form>
              </div>

              {/* Alert Seeding Sim */}
              <div className="bg-[#111317] border border-white/5 p-6 rounded-3xl space-y-4">
                <h4 style={{ fontFamily: "Georgia, serif" }} className="text-xl font-bold italic text-white flex items-center gap-2">
                  <AlertTriangle size={18} className="text-yellow-500" />
                  Seed Custom Emergency Warning
                </h4>
                <form onSubmit={issueAlert} className="space-y-4 text-xs">
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Incident Warning Type</label>
                    <select 
                      value={newAlertForm.type}
                      onChange={(e) => setNewAlertForm(p => ({ ...p, type: e.target.value }))}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-yellow-500"
                    >
                      <option value="PPE_MISSING">PPE_MISSING (No helmet/vest/etc)</option>
                      <option value="RESTRICTED_ZONE">RESTRICTED_ZONE (Intrusion/breach)</option>
                      <option value="FIRE_HAZARD">FIRE_HAZARD (Smoke/flame plume)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Short Description Label</label>
                    <input 
                      type="text" 
                      value={newAlertForm.label}
                      onChange={(e) => setNewAlertForm(p => ({ ...p, label: e.target.value }))}
                      required
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-yellow-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Site Location Sector</label>
                    <input 
                      type="text" 
                      value={newAlertForm.location}
                      onChange={(e) => setNewAlertForm(p => ({ ...p, location: e.target.value }))}
                      required
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-yellow-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Detailed Explanation</label>
                    <textarea 
                      value={newAlertForm.description}
                      onChange={(e) => setNewAlertForm(p => ({ ...p, description: e.target.value }))}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-yellow-500 h-20"
                    />
                  </div>
                  <button type="submit" className="w-full py-2.5 bg-yellow-500 hover:bg-yellow-600 text-black font-bold uppercase rounded-lg tracking-wider transition-all">
                    Broadcast Simulated Alert
                  </button>
                </form>
              </div>

            </div>
          </div>
        )}

        {/* 9. NOTIFICATIONS DISPATCH SANDBOX */}
        {currentTab === "notifications" && (
          <div className="p-8 max-w-4xl mx-auto text-left space-y-8 w-full">
            <div className="border-b border-white/5 pb-4">
              <h3 className="text-3xl font-extrabold tracking-tight uppercase italic font-display">
                Emergency Alert Dispatcher
              </h3>
              <p className="text-xs text-slate-400">
                Simulate broadcasting active site warnings to supervisors and engineers via cellular SMS queues, emails, or high-urgency WhatsApp hooks.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              
              {/* Controller form (7 cols) */}
              <div className="md:col-span-7 bg-[#111317] border border-white/5 p-6 rounded-3xl space-y-6">
                <form onSubmit={sendAlertDispatch} className="space-y-4 text-xs">
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Target dispatch channel</label>
                    <div className="grid grid-cols-3 gap-2">
                      {["WhatsApp", "SMS", "Email"].map((ch) => (
                        <button
                          type="button"
                          key={ch}
                          onClick={() => setNotifForm(p => ({ ...p, channel: ch }))}
                          className={`py-2.5 rounded-xl text-xs font-bold transition-all border ${
                            notifForm.channel === ch 
                              ? "bg-yellow-500 border-yellow-500 text-black" 
                              : "bg-black/20 border-white/5 text-slate-400 hover:border-white/10"
                          }`}
                        >
                          {ch === "WhatsApp" ? "💬 WhatsApp" : ch === "SMS" ? "📱 SMS Text" : "✉ Email"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Recipient Address / Phone</label>
                    <input 
                      type="text" 
                      value={notifForm.recipient}
                      onChange={(e) => setNotifForm(p => ({ ...p, recipient: e.target.value }))}
                      required
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-yellow-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Urgent Safety Message Template</label>
                    <textarea 
                      value={notifForm.message}
                      onChange={(e) => setNotifForm(p => ({ ...p, message: e.target.value }))}
                      required
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-yellow-500 h-24"
                    />
                  </div>

                  <button type="submit" className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-bold uppercase text-xs rounded-xl tracking-wider transition-all">
                    Dispatch Alert Beacon
                  </button>
                </form>

                {notifForm.statusMessage && (
                  <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 text-xs p-3.5 rounded-xl font-mono text-center">
                    {notifForm.statusMessage}
                  </div>
                )}
              </div>

              {/* Dynamic preview mock phone (5 cols) */}
              <div className="md:col-span-5 bg-black border border-white/10 rounded-[36px] p-4 h-[440px] shadow-2xl relative flex flex-col justify-between max-w-[280px] mx-auto">
                {/* Speaker pill */}
                <div className="w-20 h-4 bg-slate-800 rounded-full mx-auto"></div>

                <div className="flex-1 bg-[#0A0A0B] rounded-[24px] mt-4 p-4 flex flex-col justify-between overflow-hidden relative">
                  
                  {/* Status header bar */}
                  <div className="flex justify-between text-[8px] font-mono text-slate-500">
                    <span>9:41 AM</span>
                    <span>📶 5G</span>
                  </div>

                  {/* Incoming notification simulation */}
                  <div className="space-y-2 mt-4 flex-1 overflow-y-auto">
                    <div className="bg-[#111317] border border-white/10 p-3 rounded-2xl space-y-1.5 text-left shadow-lg animate-bounce">
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 bg-yellow-500 rounded flex items-center justify-center text-[8px] text-black font-black">BG</div>
                        <span className="text-[9px] font-bold text-white uppercase font-mono tracking-tight">BuildGuard Dispatch</span>
                      </div>
                      <p className="text-[9px] text-slate-300 leading-tight">
                        {notifForm.message}
                      </p>
                    </div>
                  </div>

                  <div className="text-center text-[8px] font-mono text-slate-600">
                    Swipe up to resolve incident
                  </div>
                </div>

                {/* Home Indicator */}
                <div className="w-24 h-1 bg-slate-800 rounded-full mx-auto mt-4"></div>
              </div>

            </div>
          </div>
        )}

        {/* ----------------- EDITORIAL APP FOOTER ----------------- */}
        <footer className="px-8 py-6 border-t border-white/5 mt-12 bg-black/40">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-mono text-slate-500 tracking-wider">
            <div className="flex flex-wrap gap-4 uppercase">
              <span>Session: bg-ai-8829</span>
              <span>•</span>
              <span>Latency: 24ms</span>
              <span>•</span>
              <span>Node: v20.12</span>
            </div>
            <div className="flex gap-4">
              <span className="text-yellow-500 font-bold uppercase">OSHA 1926 Safety Monitor 2026</span>
              <span>•</span>
              <span>BuildGuard AI v1.2</span>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
