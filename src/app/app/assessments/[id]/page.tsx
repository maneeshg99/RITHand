"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  AlertCircle,
  Loader,
  BarChart3,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { cisControlsV8 } from "@/data/cis-controls-v8";
import {
  getAssessment,
  getAssessmentResponses,
  saveAssessmentResponse,
  completeAssessment,
} from "@/app/app/clients/actions";

type Assessment = {
  id: string;
  client_id: string;
  framework_id: string;
  title: string;
  status: string;
  overall_score: number | null;
  clients: { name: string } | null;
};

type AssessmentResponse = {
  id: string;
  assessment_id: string;
  control_id: string;
  section_id: string;
  maturity_level: number;
  evidence: string | null;
  gap_description: string | null;
  remediation_rec: string | null;
  priority: string | null;
  effort_estimate: string | null;
  notes: string | null;
};

type SafeguardFormState = {
  controlId: string;
  maturityLevel: number;
  evidence: string;
  gapDescription: string;
  remediationRec: string;
  priority: string;
  effortEstimate: string;
  notes: string;
};

const MATURITY_LEVELS = [
  { level: 0, label: "Not Assessed", color: "bg-gray-500" },
  { level: 1, label: "Not Implemented", color: "bg-red-500" },
  { level: 2, label: "Partially Implemented", color: "bg-orange-500" },
  { level: 3, label: "Implemented", color: "bg-yellow-500" },
  { level: 4, label: "Managed & Measurable", color: "bg-blue-500" },
  { level: 5, label: "Optimized", color: "bg-green-500" },
];

const PRIORITY_OPTIONS = [
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

const EFFORT_OPTIONS = [
  { value: "quick_win", label: "Quick Win" },
  { value: "moderate", label: "Moderate" },
  { value: "major_project", label: "Major Project" },
];

export default function AssessmentPage() {
  const params = useParams();
  const assessmentId = params.id as string;

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [responses, setResponses] = useState<Map<string, AssessmentResponse>>(
    new Map()
  );
  const [currentControlIndex, setCurrentControlIndex] = useState(0);
  const [view, setView] = useState<"wizard" | "summary">("wizard");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle"
  );
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout>(undefined);

  // Load assessment data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [assessRes, responsesRes] = await Promise.all([
          getAssessment(assessmentId),
          getAssessmentResponses(assessmentId),
        ]);

        if (assessRes.error) {
          setError(assessRes.error);
          setLoading(false);
          return;
        }

        setAssessment(assessRes.data);

        const responsesMap = new Map<string, AssessmentResponse>();
        if (responsesRes.data) {
          responsesRes.data.forEach((r) => {
            responsesMap.set(r.control_id, r);
          });
        }
        setResponses(responsesMap);
      } catch {
        setError("Failed to load assessment");
      }
      setLoading(false);
    };

    loadData();
  }, [assessmentId]);

  const currentControl = cisControlsV8[currentControlIndex];

  const handleSaveResponse = useCallback(
    async (controlId: string, formState: SafeguardFormState) => {
      setSaveStatus("saving");
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

      try {
        await saveAssessmentResponse(assessmentId, controlId, currentControl.id, {
          maturity_level: formState.maturityLevel,
          evidence: formState.evidence || undefined,
          gap_description: formState.gapDescription || undefined,
          remediation_rec: formState.remediationRec || undefined,
          priority: formState.priority || undefined,
          effort_estimate: formState.effortEstimate || undefined,
          notes: formState.notes || undefined,
        });

        // Update local state
        const newResponse: AssessmentResponse = {
          id: `${assessmentId}-${controlId}`,
          assessment_id: assessmentId,
          control_id: controlId,
          section_id: currentControl.id,
          maturity_level: formState.maturityLevel,
          evidence: formState.evidence || null,
          gap_description: formState.gapDescription || null,
          remediation_rec: formState.remediationRec || null,
          priority: formState.priority || null,
          effort_estimate: formState.effortEstimate || null,
          notes: formState.notes || null,
        };
        setResponses((prev) => new Map(prev).set(controlId, newResponse));

        setSaveStatus("saved");
        saveTimeoutRef.current = setTimeout(() => setSaveStatus("idle"), 2000);
      } catch {
        setSaveStatus("idle");
      }
    },
    [assessmentId, currentControl.id]
  );

  const handleCompleteAssessment = async () => {
    const avgMaturity =
      Array.from(responses.values()).reduce(
        (sum, r) => sum + r.maturity_level,
        0
      ) / Math.max(responses.size, 1);

    try {
      await completeAssessment(assessmentId, avgMaturity);
      setAssessment((prev) =>
        prev ? { ...prev, status: "completed", overall_score: avgMaturity } : null
      );
      setView("summary");
    } catch {
      setError("Failed to complete assessment");
    }
  };

  const isReadOnly = assessment?.status === "completed";
  const allControlsVisited = responses.size === cisControlsV8.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
          {error || "Assessment not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border p-4 md:p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {assessment.title}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {assessment.clients?.name}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setView(view === "wizard" ? "summary" : "wizard")
              }
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                view === "summary"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground hover:bg-muted/80"
              )}
            >
              {view === "wizard" ? (
                <>
                  <BarChart3 className="h-4 w-4" />
                  View Summary
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  Back to Wizard
                </>
              )}
            </button>
            {!isReadOnly && (
              <div
                className={cn(
                  "text-xs font-medium px-3 py-1.5 rounded transition-opacity",
                  saveStatus === "saving"
                    ? "text-blue-600"
                    : saveStatus === "saved"
                      ? "text-green-600"
                      : "text-gray-400"
                )}
              >
                {saveStatus === "saving" && "Saving..."}
                {saveStatus === "saved" && "Saved"}
                {saveStatus === "idle" && ""}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      {view === "wizard" ? (
        <WizardView
          assessment={assessment}
          currentControl={currentControl}
          currentControlIndex={currentControlIndex}
          responses={responses}
          isReadOnly={isReadOnly}
          allControlsVisited={allControlsVisited}
          onSaveResponse={handleSaveResponse}
          onNavigate={setCurrentControlIndex}
          onComplete={handleCompleteAssessment}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
      ) : (
        <SummaryView assessment={assessment} responses={responses} />
      )}
    </div>
  );
}

// ─── Wizard View Component ─────────────────────────────────────────────────

interface WizardViewProps {
  assessment: Assessment;
  currentControl: (typeof cisControlsV8)[0];
  currentControlIndex: number;
  responses: Map<string, AssessmentResponse>;
  isReadOnly: boolean;
  allControlsVisited: boolean;
  onSaveResponse: (
    controlId: string,
    formState: SafeguardFormState
  ) => Promise<void>;
  onNavigate: (index: number) => void;
  onComplete: () => Promise<void>;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

function WizardView({
  assessment,
  currentControl,
  currentControlIndex,
  responses,
  isReadOnly,
  allControlsVisited,
  onSaveResponse,
  onNavigate,
  onComplete,
  sidebarOpen,
  onToggleSidebar,
}: WizardViewProps) {
  const [completingAssessment, setCompletingAssessment] = useState(false);

  const handleComplete = async () => {
    setCompletingAssessment(true);
    await onComplete();
    setCompletingAssessment(false);
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Sidebar */}
      <div
        className={cn(
          "border-r border-border bg-card transition-all duration-300 overflow-hidden flex flex-col",
          sidebarOpen ? "w-64" : "w-0"
        )}
      >
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">
            CIS Controls
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {responses.size} of {cisControlsV8.length} assessed
          </p>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {cisControlsV8.map((control, idx) => {
            const controlResponses = Array.from(responses.values()).filter(
              (r) => r.section_id === control.id
            );
            const hasAllSafeguards =
              controlResponses.length === control.safeguards.length;
            const hasAnySafeguard = controlResponses.length > 0;

            let indicator = "empty";
            if (hasAllSafeguards) indicator = "full";
            else if (hasAnySafeguard) indicator = "partial";

            return (
              <button
                key={control.id}
                onClick={() => onNavigate(idx)}
                className={cn(
                  "w-full text-left p-3 rounded-lg mb-1 transition-colors flex items-center gap-2",
                  idx === currentControlIndex
                    ? "bg-primary/10 border border-primary text-primary"
                    : "hover:bg-muted text-foreground"
                )}
              >
                <div
                  className={cn(
                    "h-2.5 w-2.5 rounded-full flex-shrink-0",
                    indicator === "full"
                      ? "bg-green-500"
                      : indicator === "partial"
                        ? "bg-yellow-500"
                        : "bg-gray-400"
                  )}
                />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold">{control.id}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {control.title}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <button
          onClick={onToggleSidebar}
          className="md:hidden absolute left-4 top-20 z-10 p-2 rounded-lg bg-card border border-border hover:bg-muted transition-colors"
        >
          {sidebarOpen ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-4xl">
            {/* Control Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">
                {currentControl.id}: {currentControl.title}
              </h2>
              <p className="text-muted-foreground">{currentControl.description}</p>
              <div className="flex gap-2 mt-4 flex-wrap">
                {currentControl.ig1 && (
                  <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
                    IG1
                  </span>
                )}
                {currentControl.ig2 && (
                  <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
                    IG2
                  </span>
                )}
                {currentControl.ig3 && (
                  <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
                    IG3
                  </span>
                )}
              </div>
            </div>

            {/* Safeguards */}
            <div className="space-y-6">
              {currentControl.safeguards.map((safeguard) => (
                <SafeguardCard
                  key={safeguard.id}
                  safeguard={safeguard}
                  response={responses.get(safeguard.id)}
                  isReadOnly={isReadOnly}
                  onSave={(formState) =>
                    onSaveResponse(safeguard.id, formState)
                  }
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="border-t border-border p-4 md:p-6 bg-card">
          <div className="max-w-4xl ml-auto mr-auto flex items-center justify-between">
            <button
              onClick={() => onNavigate(Math.max(0, currentControlIndex - 1))}
              disabled={currentControlIndex === 0}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                currentControlIndex === 0
                  ? "text-muted-foreground cursor-not-allowed"
                  : "text-foreground border border-border hover:bg-muted"
              )}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous Control
            </button>

            {!isReadOnly && allControlsVisited && (
              <button
                onClick={handleComplete}
                disabled={completingAssessment}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <Check className="h-4 w-4" />
                Complete Assessment
              </button>
            )}

            <button
              onClick={() =>
                onNavigate(Math.min(cisControlsV8.length - 1, currentControlIndex + 1))
              }
              disabled={currentControlIndex === cisControlsV8.length - 1}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                currentControlIndex === cisControlsV8.length - 1
                  ? "text-muted-foreground cursor-not-allowed"
                  : "text-foreground border border-border hover:bg-muted"
              )}
            >
              Next Control
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Safeguard Card Component ──────────────────────────────────────────────

interface SafeguardCardProps {
  safeguard: (typeof cisControlsV8)[0]["safeguards"][0];
  response?: AssessmentResponse;
  isReadOnly: boolean;
  onSave: (formState: SafeguardFormState) => Promise<void>;
}

function SafeguardCard({
  safeguard,
  response,
  isReadOnly,
  onSave,
}: SafeguardCardProps) {
  const [formState, setFormState] = useState<SafeguardFormState>({
    controlId: safeguard.id,
    maturityLevel: response?.maturity_level ?? 0,
    evidence: response?.evidence ?? "",
    gapDescription: response?.gap_description ?? "",
    remediationRec: response?.remediation_rec ?? "",
    priority: response?.priority ?? "medium",
    effortEstimate: response?.effort_estimate ?? "moderate",
    notes: response?.notes ?? "",
  });

  const handleFieldChange = async (field: string, value: unknown) => {
    const newState = { ...formState, [field]: value };
    setFormState(newState);
    await onSave(newState);
  };

  const showGapFields = formState.maturityLevel < 3;

  return (
    <div className="p-4 rounded-lg border border-border bg-card space-y-4">
      {/* Safeguard Header */}
      <div>
        <h3 className="text-lg font-semibold text-foreground">
          {safeguard.id}: {safeguard.title}
        </h3>
        <p className="text-sm text-muted-foreground mt-2">{safeguard.description}</p>
        <div className="flex gap-2 mt-3 flex-wrap">
          {safeguard.ig1 && (
            <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
              IG1
            </span>
          )}
          {safeguard.ig2 && (
            <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
              IG2
            </span>
          )}
          {safeguard.ig3 && (
            <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
              IG3
            </span>
          )}
          <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-700">
            {safeguard.assetType}
          </span>
          <span className="px-2 py-1 rounded text-xs font-medium bg-indigo-100 text-indigo-700">
            {safeguard.securityFunction}
          </span>
        </div>
      </div>

      {/* Maturity Level Selector */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-foreground">
          Maturity Level
        </label>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
          {MATURITY_LEVELS.map((ml) => (
            <button
              key={ml.level}
              onClick={() => handleFieldChange("maturityLevel", ml.level)}
              disabled={isReadOnly}
              className={cn(
                "p-3 rounded-lg text-center transition-all border-2",
                formState.maturityLevel === ml.level
                  ? "border-foreground bg-foreground/10"
                  : "border-transparent hover:border-border",
                isReadOnly && "cursor-not-allowed opacity-75"
              )}
            >
              <div
                className={cn(
                  "h-3 w-3 rounded-full mx-auto mb-1",
                  ml.color
                )}
              />
              <div className="text-xs font-semibold">{ml.level}</div>
              <div className="text-[10px] text-muted-foreground whitespace-normal">
                {ml.label}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Evidence */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">
          Evidence
        </label>
        <textarea
          value={formState.evidence}
          onChange={(e) => handleFieldChange("evidence", e.target.value)}
          disabled={isReadOnly}
          placeholder="Provide evidence of this safeguard's implementation..."
          className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-75 resize-none"
          rows={3}
        />
      </div>

      {/* Gap Fields (shown when maturity < 3) */}
      {showGapFields && (
        <>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              Gap Description
            </label>
            <textarea
              value={formState.gapDescription}
              onChange={(e) =>
                handleFieldChange("gapDescription", e.target.value)
              }
              disabled={isReadOnly}
              placeholder="Describe the gap between current and target state..."
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-75 resize-none"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Remediation Recommendation
            </label>
            <textarea
              value={formState.remediationRec}
              onChange={(e) =>
                handleFieldChange("remediationRec", e.target.value)
              }
              disabled={isReadOnly}
              placeholder="Recommended steps to remediate this gap..."
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-75 resize-none"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Priority
              </label>
              <select
                value={formState.priority}
                onChange={(e) => handleFieldChange("priority", e.target.value)}
                disabled={isReadOnly}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-75"
              >
                {PRIORITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Effort Estimate
              </label>
              <select
                value={formState.effortEstimate}
                onChange={(e) => handleFieldChange("effortEstimate", e.target.value)}
                disabled={isReadOnly}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-75"
              >
                {EFFORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </>
      )}

      {/* Notes */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">
          Notes
        </label>
        <textarea
          value={formState.notes}
          onChange={(e) => handleFieldChange("notes", e.target.value)}
          disabled={isReadOnly}
          placeholder="Additional notes..."
          className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-75 resize-none"
          rows={2}
        />
      </div>
    </div>
  );
}

// ─── Summary View Component ────────────────────────────────────────────────

interface SummaryViewProps {
  assessment: Assessment;
  responses: Map<string, AssessmentResponse>;
}

function SummaryView({ assessment, responses }: SummaryViewProps) {
  // Calculate metrics
  const allResponses = Array.from(responses.values());
  const overallScore =
    allResponses.length > 0
      ? allResponses.reduce((sum, r) => sum + r.maturity_level, 0) /
        allResponses.length
      : 0;

  // Group responses by control
  const responsesByControl = new Map<string, AssessmentResponse[]>();
  cisControlsV8.forEach((control) => {
    const controlResponses = allResponses.filter(
      (r) => r.section_id === control.id
    );
    if (controlResponses.length > 0) {
      responsesByControl.set(control.id, controlResponses);
    }
  });

  // Find top gaps
  const topGaps = allResponses
    .filter((r) => r.maturity_level < 3)
    .sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return (
        (priorityOrder[a.priority as keyof typeof priorityOrder] ?? 999) -
        (priorityOrder[b.priority as keyof typeof priorityOrder] ?? 999)
      );
    })
    .slice(0, 10);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="max-w-5xl">
        {/* Overall Score */}
        <div className="mb-8 p-6 rounded-lg border border-border bg-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Overall Maturity Score
          </h3>
          <div className="flex items-end gap-8">
            <div>
              <div className="text-5xl font-bold text-primary">
                {overallScore.toFixed(1)}
              </div>
              <p className="text-sm text-muted-foreground mt-2">out of 5.0</p>
            </div>
            <div className="flex-1">
              <div className="h-2 bg-gray-300 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all",
                    overallScore < 2
                      ? "bg-red-500"
                      : overallScore < 3
                        ? "bg-orange-500"
                        : overallScore < 4
                          ? "bg-yellow-500"
                          : "bg-green-500"
                  )}
                  style={{ width: `${(overallScore / 5) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Radar Chart */}
        <div className="mb-8 p-6 rounded-lg border border-border bg-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Maturity by Control
          </h3>
          <RadarChart responses={responsesByControl} />
        </div>

        {/* Control Breakdown */}
        <div className="mb-8 space-y-4">
          <h3 className="text-lg font-semibold text-foreground">
            Control Details
          </h3>
          {cisControlsV8.map((control) => {
            const controlResponses = responsesByControl.get(control.id) || [];
            const avgMaturity =
              controlResponses.length > 0
                ? controlResponses.reduce((sum, r) => sum + r.maturity_level, 0) /
                  controlResponses.length
                : 0;

            return (
              <div
                key={control.id}
                className="p-4 rounded-lg border border-border bg-card space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-foreground">
                      {control.id}: {control.title}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {controlResponses.length} of {control.safeguards.length} safeguards
                      assessed
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {avgMaturity.toFixed(1)}
                    </div>
                  </div>
                </div>
                <div className="h-2 bg-gray-300 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-all",
                      avgMaturity < 2
                        ? "bg-red-500"
                        : avgMaturity < 3
                          ? "bg-orange-500"
                          : avgMaturity < 4
                            ? "bg-yellow-500"
                            : "bg-green-500"
                    )}
                    style={{ width: `${(avgMaturity / 5) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Top Gaps */}
        {topGaps.length > 0 && (
          <div className="p-6 rounded-lg border border-border bg-card">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Top Gaps
            </h3>
            <div className="space-y-4">
              {topGaps.map((gap) => {
                const safeguard = cisControlsV8
                  .flatMap((c) => c.safeguards)
                  .find((s) => s.id === gap.control_id);
                const control = cisControlsV8.find(
                  (c) => c.id === gap.section_id
                );

                return (
                  <div
                    key={gap.id}
                    className="p-4 rounded-lg border border-border bg-muted/20 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-foreground">
                          {control?.id}: {safeguard?.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Current: Level {gap.maturity_level}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "text-xs font-bold uppercase px-2 py-1 rounded",
                          gap.priority === "critical"
                            ? "bg-red-100 text-red-700"
                            : gap.priority === "high"
                              ? "bg-orange-100 text-orange-700"
                              : gap.priority === "medium"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-700"
                        )}
                      >
                        {gap.priority}
                      </span>
                    </div>
                    {gap.gap_description && (
                      <div>
                        <p className="text-xs font-semibold text-foreground">
                          Gap:
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {gap.gap_description}
                        </p>
                      </div>
                    )}
                    {gap.remediation_rec && (
                      <div>
                        <p className="text-xs font-semibold text-foreground">
                          Remediation:
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {gap.remediation_rec}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Radar Chart Component ────────────────────────────────────────────────

interface RadarChartProps {
  responses: Map<string, AssessmentResponse[]>;
}

function RadarChart({ responses }: RadarChartProps) {
  const size = 300;
  const center = size / 2;
  const radius = 100;
  const levels = 5;

  // Calculate averages for each control
  const controlAverages: Array<{ control: string; value: number }> = [];
  cisControlsV8.forEach((control) => {
    const controlResponses = responses.get(control.id);
    const avg =
      controlResponses && controlResponses.length > 0
        ? controlResponses.reduce((sum, r) => sum + r.maturity_level, 0) /
          controlResponses.length
        : 0;
    controlAverages.push({ control: control.id, value: avg });
  });

  const pointCount = controlAverages.length;
  const angleSlice = (Math.PI * 2) / pointCount;

  // Generate radar points
  const points = controlAverages.map((item, i) => {
    const angle = angleSlice * i - Math.PI / 2;
    const r = (item.value / 5) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y, ...item };
  });

  // Generate grid lines and labels
  const gridPoints = Array.from({ length: pointCount }, (_, i) => {
    const angle = angleSlice * i - Math.PI / 2;
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    return { x, y, control: controlAverages[i].control };
  });

  // Generate concentric circles
  const circles = Array.from({ length: levels }, (_, i) => {
    return ((i + 1) / levels) * radius;
  });

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${size} ${size}`}
      className="max-w-2xl mx-auto"
    >
      {/* Concentric circles */}
      {circles.map((r, i) => (
        <circle
          key={`circle-${i}`}
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          className="text-border"
          opacity="0.5"
        />
      ))}

      {/* Grid lines */}
      {gridPoints.map((point, i) => (
        <line
          key={`grid-${i}`}
          x1={center}
          y1={center}
          x2={point.x}
          y2={point.y}
          stroke="currentColor"
          strokeWidth="1"
          className="text-border"
          opacity="0.3"
        />
      ))}

      {/* Data polygon */}
      <polygon
        points={points.map((p) => `${p.x},${p.y}`).join(" ")}
        fill="currentColor"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="2"
        className="text-primary"
      />

      {/* Data points */}
      {points.map((point, i) => (
        <circle
          key={`point-${i}`}
          cx={point.x}
          cy={point.y}
          r="4"
          fill="currentColor"
          className="text-primary"
        />
      ))}

      {/* Labels */}
      {gridPoints.map((point, i) => {
        const label = controlAverages[i].control;
        const labelRadius = radius + 30;
        const angle = angleSlice * i - Math.PI / 2;
        const labelX = center + labelRadius * Math.cos(angle);
        const labelY = center + labelRadius * Math.sin(angle);

        return (
          <text
            key={`label-${i}`}
            x={labelX}
            y={labelY}
            textAnchor="middle"
            dy="0.3em"
            className="text-xs font-semibold fill-foreground"
          >
            {label}
          </text>
        );
      })}

      {/* Center value labels for each ring */}
      {Array.from({ length: levels }).map((_, i) => {
        const ringValue = Math.round(((i + 1) / levels) * 5 * 10) / 10;
        return (
          <text
            key={`ringLabel-${i}`}
            x={center + 5}
            y={center - ((i + 1) / levels) * radius + 5}
            className="text-[10px] fill-muted-foreground"
          >
            {ringValue}
          </text>
        );
      })}
    </svg>
  );
}
