export interface Site {
  id: string;
  name: string;
  location: string;
  status: string;
  safetyScore: number;
  supervisor: string;
  workersCount: number;
  cameraCount: number;
}

export interface Camera {
  id: string;
  name: string;
  status: string;
  siteId: string;
  streamUrl: string;
  ppeCompliance: string;
}

export interface Alert {
  id: string;
  timestamp: string;
  type: string;
  label: string;
  location: string;
  siteId: string;
  camera: string;
  severity: string;
  image: string;
  resolved: boolean;
  description: string;
}

export interface SafetyReport {
  id: string;
  title: string;
  date: string;
  siteId: string;
  workerCount: number;
  complianceScore: number;
  helmetCompliant: number;
  vestCompliant: number;
  activeViolations: number;
  summary: string;
  status: string;
}

export interface ProgressTimeline {
  date: string;
  task: string;
  status: string;
  progress: number;
}

export interface DailyComparison {
  id: string;
  date: string;
  imgBefore: string;
  imgAfter: string;
  progressScore: string;
  analysis: string;
}

export interface ProgressData {
  completionPercentage: number;
  delayPrediction: string;
  timeline: ProgressTimeline[];
  dailyComparisons: DailyComparison[];
}

export interface User {
  email: string;
  name: string;
  role: string;
  siteIds: string[];
}
