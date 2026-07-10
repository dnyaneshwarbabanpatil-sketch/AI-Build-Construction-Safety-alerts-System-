import React from "react";
import { 
  HardHat, 
  LayoutDashboard, 
  Camera, 
  MessageSquare, 
  FileText, 
  Activity, 
  Shield, 
  Bell, 
  LogOut, 
  User, 
  MapPin,
  Globe2
} from "lucide-react";

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  user: { name: string; role: string; email: string } | null;
  onLogout: () => void;
  lang: "EN" | "HI" | "MR";
  setLang: (lang: "EN" | "HI" | "MR") => void;
  activeViolationsCount: number;
}

export default function Sidebar({ 
  currentTab, 
  setCurrentTab, 
  user, 
  onLogout,
  lang,
  setLang,
  activeViolationsCount
}: SidebarProps) {
  
  const menuItems = [
    { id: "dashboard", label: lang === "EN" ? "Dashboard" : lang === "HI" ? "डैशबोर्ड" : "डैशबोर्ड", icon: LayoutDashboard },
    { id: "camera", label: lang === "EN" ? "Live Scanning" : lang === "HI" ? "लाइव स्कैनिंग" : "लाइव स्कॅनिंग", icon: Camera },
    { id: "assistant", label: lang === "EN" ? "Safety Copilot" : lang === "HI" ? "सुरक्षा कॉपायलट" : "सुरक्षा कॉपायलट", icon: MessageSquare },
    { id: "reports", label: lang === "EN" ? "Compliance Reports" : lang === "HI" ? "सुरक्षा रिपोर्ट" : "सुरक्षा अहवाल", icon: FileText },
    { id: "progress", label: lang === "EN" ? "Site Progress" : lang === "HI" ? "साइट प्रगति" : "साईट प्रगती", icon: Activity },
    { id: "admin", label: lang === "EN" ? "Admin Controls" : lang === "HI" ? "एडमिन पैनल" : "अॅडमिन पॅनेल", icon: Shield },
    { id: "notifications", label: lang === "EN" ? "Alert Dispatch" : lang === "HI" ? "अलर्ट प्रेषण" : "अलर्ट प्रेषण", icon: Bell },
  ];

  return (
    <aside id="sidebar-container" className="w-64 bg-[#111317] border-r border-[#262a33] flex flex-col h-screen sticky top-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#262a33] flex items-center gap-3">
        <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-black font-black shadow-[0_0_15px_rgba(245,158,11,0.3)] animate-pulse">
          <HardHat size={22} className="stroke-[2.5]" />
        </div>
        <div>
          <span className="font-display font-bold text-lg tracking-tight text-white flex items-center gap-1">
            Build<span className="text-amber-400">Guard</span>
          </span>
          <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block -mt-1">
            AI SITE SECURITY
          </span>
        </div>
      </div>

      {/* Multilingual Switcher */}
      <div className="px-5 pt-4 pb-2 flex items-center justify-between text-xs border-b border-[#262a33]/50">
        <span className="text-gray-400 flex items-center gap-1.5">
          <Globe2 size={13} className="text-amber-400" />
          {lang === "EN" ? "Language" : lang === "HI" ? "भाषा" : "भाषा"}
        </span>
        <div className="flex bg-black/40 p-0.5 rounded-lg border border-[#262a33]">
          {(["EN", "HI", "MR"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold transition-all ${
                lang === l 
                  ? "bg-amber-500 text-black shadow-sm" 
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Active Site Marker */}
      <div className="p-4 mx-3 my-3 bg-amber-500/5 border border-amber-500/10 rounded-xl flex items-center gap-3">
        <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
          <MapPin size={16} />
        </div>
        <div className="overflow-hidden">
          <span className="text-[10px] font-mono text-amber-400 uppercase block tracking-wider">
            MONITORED ZONE
          </span>
          <span className="text-xs text-white font-medium truncate block">
            Manhattan East Terminal
          </span>
        </div>
      </div>

      {/* Navigation menu */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        <span className="px-3 text-[10px] font-mono text-gray-500 uppercase tracking-widest block mb-2">
          ENGINEERING CONSOLE
        </span>
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              id={`nav-item-${item.id}`}
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-250 group ${
                isActive 
                  ? "bg-amber-500/10 border-l-4 border-amber-400 text-amber-400 font-semibold" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <div className="flex items-center gap-3">
                <IconComponent 
                  size={18} 
                  className={`transition-colors ${isActive ? "text-amber-400" : "text-gray-400 group-hover:text-amber-400"}`} 
                />
                <span className="text-sm">{item.label}</span>
              </div>
              {item.id === "dashboard" && activeViolationsCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-full animate-pulse">
                  {activeViolationsCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Session Info footer */}
      <div className="p-4 border-t border-[#262a33] bg-black/20">
        {user ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#262a33] flex items-center justify-center text-amber-400 border border-white/5">
                <User size={16} />
              </div>
              <div className="overflow-hidden">
                <h4 className="text-xs font-bold text-white truncate">{user.name}</h4>
                <p className="text-[10px] font-mono text-amber-400 uppercase tracking-wider">{user.role}</p>
              </div>
            </div>
            <button
              id="btn-logout"
              onClick={onLogout}
              className="w-full py-2 bg-[#262a33]/40 hover:bg-red-500/10 hover:text-red-400 border border-[#262a33] hover:border-red-500/20 text-gray-400 text-xs font-medium rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <LogOut size={14} />
              {lang === "EN" ? "Sign Out" : lang === "HI" ? "लॉग आउट" : "लॉग आउट"}
            </button>
          </div>
        ) : (
          <button
            id="btn-authenticate-sidebar"
            onClick={() => setCurrentTab("auth")}
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-semibold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
          >
            <Shield size={14} />
            {lang === "EN" ? "Sign In / Register" : "साइन इन / रजिस्टर"}
          </button>
        )}
      </div>
    </aside>
  );
}
