import React, { useState } from 'react';
import { 
  TrendingUp, 
  Download, 
  Trash2, 
  Calendar, 
  Dumbbell, 
  Activity, 
  FileText, 
  Info,
  CheckCircle2,
  Gauge,
  UserCheck
} from 'lucide-react';
import { SessionLog, PatientProfile } from '../types';

interface MonitorViewProps {
  logs: SessionLog[];
  profile: PatientProfile;
  onClearLogs: () => void;
  onUpdateBaselineStrength: (newBaseline: number) => void;
}

export default function MonitorView({ 
  logs, 
  profile, 
  onClearLogs,
  onUpdateBaselineStrength
}: MonitorViewProps) {
  const [selectedLog, setSelectedLog] = useState<SessionLog | null>(null);
  const [calibrationInput, setCalibrationInput] = useState<number>(profile.baselineStrengthKg);
  const [showCalibrationFeedback, setShowCalibrationFeedback] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportComplete, setExportComplete] = useState<boolean>(false);

  // Group log elements for data visual graphs (grip strength trend)
  const sortedLogs = [...logs].sort((a,b) => a.date.localeCompare(b.date));
  
  // Simulated clinical PDF report trigger
  const handleExportPDF = () => {
    setIsExporting(true);
    setExportComplete(false);
    setTimeout(() => {
      setIsExporting(false);
      setExportComplete(true);
      
      // Smooth dynamic timeout cleanup
      setTimeout(() => setExportComplete(false), 5000);
    }, 2200);
  };

  const handleApplyCalibration = () => {
    onUpdateBaselineStrength(calibrationInput);
    setShowCalibrationFeedback(true);
    setTimeout(() => setShowCalibrationFeedback(false), 4000);
  };

  // SVG Graph parameters
  const svgWidth = 500;
  const svgHeight = 150;
  const padding = 34;

  const getGraphCoords = () => {
    if (sortedLogs.length === 0) return '';
    
    const maxForce = Math.max(...sortedLogs.map(l => l.maxForceKg), 20);
    
    // Map logs to coordinate systems
    return sortedLogs.map((log, index) => {
      const x = padding + (index / (Math.max(1, sortedLogs.length - 1))) * (svgWidth - padding * 2);
      const y = svgHeight - padding - (log.maxForceKg / maxForce) * (svgHeight - padding * 2);
      return { x, y, log };
    });
  };

  const coords = getGraphCoords();
  
  // Format coordinate list for SVG path
  const linePathString = coords && typeof coords !== 'string' 
    ? coords.map(c => `${c.x},${c.y}`).join(' L ')
    : '';

  return (
    <div id="monitor-view-container" className="space-y-8 animate-fade-in text-left">
      
      {/* View Header */}
      <section>
        <h2 className="text-2xl font-bold text-on-surface">Clinical Monitor</h2>
        <p className="text-on-surface-variant text-base mt-1">
          Review dynamic physiological logs, coordinate trends, and export medical reports to your neurological specialist.
        </p>
      </section>

      {/* Grip strength force trajectory line graph */}
      <section className="card-surface p-6 rounded-xl bg-white">
        <div className="flex justify-between items-center mb-4">
          <div className="text-left">
            <span className="text-[11px] font-bold text-primary uppercase tracking-wider block">Biofeedback History</span>
            <h3 className="font-bold text-lg text-on-surface">Peak Squeeze Trajectory (kg)</h3>
          </div>
          <button 
            id="btn-export-clinical-pdf"
            onClick={handleExportPDF}
            className="px-4 py-2 bg-primary text-on-primary hover:bg-primary-container font-bold text-sm rounded-lg flex items-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <Download size={15} />
            {isExporting ? 'Generating Report...' : 'Export Clinician Report'}
          </button>
        </div>

        {/* Dynamic PDF Export Feedback status alert */}
        {exportComplete && (
          <div className="mb-4 bg-emerald-50 text-emerald-900 border border-emerald-300 p-3 rounded-lg text-xs font-medium flex items-center gap-2">
            <CheckCircle2 size={16} className="text-secondary" />
            Clinical PDF report successfully compiled for **{profile.therapistName}**! (Mock download triggered)
          </div>
        )}

        {/* NATIVE HIGH RESOLUTION ACCESSIBLE SVG CHART */}
        <div className="bg-surface-container-low border border-outline-variant rounded-xl p-4 overflow-x-auto">
          {logs.length < 2 ? (
            <div className="h-32 flex items-center justify-center text-on-surface-variant text-sm py-8">
              Complete at least 2 sessions to trace your diagnostic trajectory.
            </div>
          ) : (
            <div className="min-w-[460px]">
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto overflow-visible">
                {/* Horizontal reference grid lines */}
                {[0, 0.5, 1.0].map((ratio, idx) => {
                  const y = padding + ratio * (svgHeight - padding * 2);
                  return (
                    <line 
                      key={idx} 
                      x1={padding} 
                      y1={y} 
                      x2={svgWidth - padding} 
                      y2={y} 
                      stroke="#c2c6d4" 
                      strokeWidth="1" 
                      strokeDasharray="4,4" 
                    />
                  );
                })}

                {/* Main trajectory path line */}
                {linePathString && (
                  <path 
                    d={`M ${linePathString}`} 
                    fill="none" 
                    stroke="#00478d" 
                    strokeWidth="3.5" 
                    strokeLinecap="round"
                    className="animate-draw-line"
                  />
                )}

                {/* Touch-interactive nodes plotted as points */}
                {typeof coords !== 'string' && coords.map((pt, idx) => (
                  <g key={idx} className="cursor-pointer group/node" onClick={() => setSelectedLog(pt.log)}>
                    <circle 
                      cx={pt.x} 
                      cy={pt.y} 
                      r="6.5" 
                      fill="#005eb8" 
                      stroke="#ffffff" 
                      strokeWidth="2" 
                      className="transition-all hover:scale-125 focus:ring-2 focus:ring-primary"
                    />
                    {/* Display peak value text hover representation */}
                    <text 
                      x={pt.x} 
                      y={pt.y - 12} 
                      textAnchor="middle" 
                      className="text-[11px] font-black fill-primary opacity-0 group-hover/node:opacity-100 transition-opacity bg-white px-1 font-mono"
                    >
                      {pt.log.maxForceKg}kg
                    </text>
                  </g>
                ))}

                {/* X-axis date keys */}
                {typeof coords !== 'string' && coords.map((pt, idx) => (
                  <text 
                    key={idx} 
                    x={pt.x} 
                    y={svgHeight - 10} 
                    textAnchor="middle" 
                    className="text-[10px] font-bold fill-on-surface-variant font-mono"
                  >
                    {pt.log.date.substring(5)}
                  </text>
                ))}
              </svg>
            </div>
          )}
        </div>
        <p className="text-[11px] text-on-surface-variant mt-2 text-center">
          * Interactive Graph: Hover or tap individual plotted points above to inspect detail parameters.
        </p>
      </section>

      {/* Manual Baseline Calibration input panel */}
      <section className="card-surface p-6 rounded-xl bg-white border border-outline-variant grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">Clinical Administration</span>
          <h3 className="font-bold text-lg text-on-surface mt-0.5">Recalibrate Target Baseline</h3>
          <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
            Every fortnight, the clinician recalculates the patient&apos;s baseline MVC (Maximum Voluntary Contraction). Adjust this value here to scale matching targets safely.
          </p>
        </div>

        <div className="flex flex-col justify-center gap-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <input 
                id="clinical-recalibration-input"
                type="number" 
                value={calibrationInput}
                onChange={(e) => setCalibrationInput(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full p-3 border-2 border-outline rounded-lg text-base font-extrabold text-on-surface tracking-wide focus:border-primary focus:outline-none"
              />
              <span className="absolute right-3 top-3 text-sm font-bold text-on-surface-variant">kg</span>
            </div>
            
            <button 
              id="btn-apply-calibration"
              onClick={handleApplyCalibration}
              className="px-5 py-3.5 bg-secondary text-white font-bold rounded-lg hover:opacity-90 active:scale-95 transition-all text-sm cursor-pointer whitespace-nowrap"
            >
              Update Baseline
            </button>
          </div>

          {showCalibrationFeedback && (
            <div className="bg-amber-50 text-amber-900 text-xs p-2.5 rounded-md flex items-center gap-2 border border-amber-300">
              <UserCheck size={14} className="text-amber-800" />
              Patient baseline strength calibrated successfully to **{profile.baselineStrengthKg} kg**!
            </div>
          )}
        </div>
      </section>

      {/* Audit Logs list block */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant font-sans">
            EXERCISE SESSION AUDIT LOGS ({logs.length})
          </h3>
          {logs.length > 0 && (
            <button 
              id="btn-clear-clinical-history"
              onClick={() => {
                if(confirm('Are you sure you want to purge all therapy logs? This cannot be undone.')){
                  onClearLogs();
                }
              }}
              className="text-xs text-rose-700 hover:text-rose-900 font-bold flex items-center gap-1.5 p-1 px-2.5 hover:bg-rose-50 rounded-lg transition-all"
            >
              <Trash2 size={13} />
              Reset Logs
            </button>
          )}
        </div>

        {selectedLog && (
          <div id="selected-audit-detail" className="bg-primary/5 border border-primary/25 rounded-xl p-5 animate-fade-in relative">
            <button 
              onClick={() => setSelectedLog(null)} 
              className="absolute right-4 top-4 hover:bg-primary/10 p-1 rounded-full text-primary"
            >
              ✕
            </button>
            <h4 className="font-bold text-primary text-base flex items-center gap-1.5">
              <Activity size={16} />
              Session Log Detail: {selectedLog.exerciseName}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-xs">
              <div>
                <span className="text-on-surface-variant font-sans font-bold">Date</span>
                <p className="font-semibold text-sm">{selectedLog.date}</p>
              </div>
              <div>
                <span className="text-on-surface-variant font-sans font-bold">Reps Performed</span>
                <p className="font-semibold text-sm text-secondary">{selectedLog.repsDone} / {selectedLog.targetReps}</p>
              </div>
              <div>
                <span className="text-on-surface-variant font-sans font-bold">Duration</span>
                <p className="font-semibold text-sm">{Math.floor(selectedLog.durationSec / 60)}m {selectedLog.durationSec % 60}s</p>
              </div>
              <div>
                <span className="text-on-surface-variant font-sans font-bold">Tremor Assessment</span>
                <p className="font-semibold text-sm">
                  Index {selectedLog.tremorIndex}/10 {' '}
                  {selectedLog.tremorIndex >= 6 ? '⚠️ Unstable' : '🟢 Steady'}
                </p>
              </div>
            </div>
            
            <div className="border-t border-primary/15 mt-3 pt-3">
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">Clinical Supervisor Performance Notes</span>
              <p className="text-sm font-medium italic mt-1 text-on-surface">
                &quot;{selectedLog.notes}&quot;
              </p>
            </div>
          </div>
        )}

        <div className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm">
          {logs.length === 0 ? (
            <div className="p-8 text-center text-on-surface-variant text-sm">
              No clinical activities logged today. Go to the Exercise room to start!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-surface-container-low text-on-surface-variant font-bold border-b border-outline-variant text-xs">
                    <th className="p-4 font-bold">DATE</th>
                    <th className="p-4 font-bold">EXERCISE REGIME</th>
                    <th className="p-4 font-bold text-center">REPS</th>
                    <th className="p-4 font-bold">AVG/MAX LOAD</th>
                    <th className="p-4 font-bold text-center">TREMOR</th>
                    <th className="p-4 font-bold text-right">METRICS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-highest">
                  {[...logs].reverse().map((log) => (
                    <tr 
                      key={log.id} 
                      onClick={() => setSelectedLog(log)}
                      className="hover:bg-primary/5 cursor-pointer transition-colors"
                    >
                      <td className="p-4 font-medium text-xs whitespace-nowrap">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-on-surface-variant" />
                          {log.date}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-on-surface">
                        {log.exerciseName}
                      </td>
                      <td className="p-4 text-center font-bold text-secondary">
                        {log.repsDone}
                      </td>
                      <td className="p-4 font-bold">
                        <span className="text-xs text-on-surface-variant">{log.avgForceKg}kg avg</span>
                        <span className="block text-primary text-[10px]">Peak {log.maxForceKg}kg</span>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-block px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                          log.tremorIndex >= 6 ? 'bg-rose-50 text-rose-850 border border-rose-200' :
                          log.tremorIndex >= 3 ? 'bg-amber-50 text-amber-850 border border-amber-200' :
                          'bg-emerald-50 text-emerald-850 border border-emerald-205'
                        }`}>
                          Idx {log.tremorIndex}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <span className="text-xs font-bold text-primary block">
                          {log.successRate}% Acc.
                        </span>
                        <span className="text-[10px] text-on-surface-variant">
                          {Math.floor(log.durationSec / 60)}m {log.durationSec % 60}s
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
