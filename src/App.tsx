/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { analyzeNGOText } from './services/geminiService';
import { AnalysisResult } from './types';
import { AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const defaultSampleText = `[14:02] Field worker Amit: "REPORTS FROM SECTOR 7: THREE FAMILIES WITHOUT FOOD FOR 2 DAYS."
[14:05] Comm Center: "HEAVY RAIN DAMAGED THE ROOF OF THE MAKESHIFT SCHOOL IN BLOCK B."
[14:12] Dr. Sarah (Clinic A): "we urgently need basic meds and antipyretics for fever at the main clinic, running out fast"
[14:15] Logistics: "ROAD TO BLOCK C IS FLOODED, TRUCKS CAN'T PASS THROUGH THE MAIN JUNCTION. need help clearing it."`;

export default function App() {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const parsedResult = await analyzeNGOText(inputText);
      setResult(parsedResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col font-sans bg-[#F3F4F6] text-[#1A1C1E] overflow-hidden">
      <header className="h-16 bg-[#1A1C1E] text-white flex items-center justify-between px-6 border-b-4 border-[#D97706] shrink-0">
        <div className="font-extrabold text-xl tracking-tight flex items-center gap-2 uppercase">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
          VOLUNTEER.IQ
        </div>
        <div className="flex gap-6 text-[11px] sm:text-xs text-gray-400 uppercase tracking-wide font-medium">
          <div>SYSTEM: <span className="text-[#10B981]">ACTIVE</span></div>
          <div className="hidden sm:block">SOURCE: MANUAL</div>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5 p-5 min-h-0 overflow-y-auto lg:overflow-hidden">
        {/* Input Panel */}
        <section className="bg-white border border-[#D1D5DB] flex flex-col rounded shadow-sm lg:h-full lg:max-h-full min-h-[300px]">
          <div className="px-4 py-3 border-b border-[#D1D5DB] bg-[#F9FAFB] font-semibold text-[13px] uppercase flex justify-between items-center rounded-t">
            <span>RAW INTELLIGENCE INGEST</span>
            {isLoading && <span className="text-[10px] text-[#D97706] flex items-center gap-1 font-bold"><Loader2 className="w-3 h-3 animate-spin"/> PROCESSING</span>}
          </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Paste raw, unstructured situational reports here.

Acceptable formats:
• Multi-issue WhatsApp chains
• Radio / Comms transcripts
• Unformatted field nurse notes
• Supply shortage alerts

Example:
[14:02] Sector 7: 3 families without food
[14:15] Clinic A: Urgent need for basic meds`}
            className="flex-1 p-4 font-mono text-[13px] leading-relaxed text-[#4B5563] border-none outline-none resize-none bg-white min-h-[150px] lg:min-h-0 w-full"
          />
          <div className="p-3 bg-[#F9FAFB] border-t border-[#D1D5DB] rounded-b flex flex-col gap-2">
            <button
              onClick={() => setInputText(defaultSampleText)}
              className="text-xs text-[#6B7280] font-medium hover:text-[#1A1C1E] underline self-start tracking-wide uppercase px-1"
            >
              Load Sample Data
            </button>
            <button
              onClick={handleAnalyze}
              disabled={isLoading || !inputText.trim()}
              className="w-full bg-[#1A1C1E] text-white border-none py-2 px-3 text-xs rounded font-semibold text-center disabled:opacity-50 hover:bg-black transition-colors flex justify-center items-center gap-2 uppercase tracking-wide"
            >
              {isLoading ? 'ANALYZING THREATS...' : 'ANALYZE INPUT SOURCE'}
            </button>
          </div>
        </section>

        {/* Action Panel */}
        <section className="flex flex-col gap-3 min-h-0 lg:h-full">
          {(result || error) && (
            <div className="px-4 py-2 font-semibold text-[13px] uppercase text-[#1A1C1E]">
              <span>ACTIONABLE DECISIONS & PRIORITIES</span>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 text-red-900 border border-red-200 text-sm flex items-start gap-3 rounded shadow-sm mx-1">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {result && (
            <div className="mx-1 bg-[#1A1C1E] text-white p-4 rounded shadow-sm flex flex-col gap-2 shrink-0">
              <div className="text-[10px] text-[#9CA3AF] uppercase font-bold tracking-wider mb-1">Deployment Strategy</div>
              <p className="text-[13px] font-medium leading-relaxed">{result.summary.deployment_plan}</p>
              <div className="flex gap-4 mt-2 text-xs font-mono">
                <div>TOTAL: <span className="font-bold">{result.summary.total_issues}</span></div>
                <div className="text-[#EF4444]">CRITICAL: <span className="font-bold">{result.summary.critical_count}</span></div>
                <div className="text-[#F97316]">HIGH: <span className="font-bold">{result.summary.high_count}</span></div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2 overflow-y-auto pb-6 pl-1 pr-2 pt-1">
            <AnimatePresence>
              {result?.issues.map((issue, idx) => {
                let borderColor = 'border-l-[#D1D5DB]';
                if (issue.urgency === 'Critical') borderColor = 'border-l-[#DC2626]';
                else if (issue.urgency === 'High') borderColor = 'border-l-[#EA580C]';
                else if (issue.urgency === 'Medium') borderColor = 'border-l-[#D97706]';
                else if (issue.urgency === 'Low') borderColor = 'border-l-[#65A30D]';

                let riskBoxClass = 'bg-gray-50 border-gray-200 text-gray-700';
                if (issue.urgency === 'Critical') riskBoxClass = 'bg-[#FEF2F2] border-[#FEE2E2] text-[#991B1B]';
                else if (issue.urgency === 'High') riskBoxClass = 'bg-[#FFFBEB] border-[#FEF3C7] text-[#92400E]';

                return (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: idx * 0.1, duration: 0.2 }}
                    key={`${issue.issue_title}-${idx}`}
                    className={`bg-white border border-[#D1D5DB] border-l-[6px] ${borderColor} p-3 md:p-4 rounded grid grid-cols-1 md:grid-cols-[40px_1fr_240px] gap-4 items-start shadow-sm relative ${issue.top_priority ? 'ring-2 ring-[#DC2626] ring-offset-1' : ''}`}
                  >
                    <div className="font-mono text-2xl font-bold text-[#9CA3AF] leading-none hidden md:block mt-1">
                      {String(issue.priority_rank).padStart(2, '0')}
                    </div>

                    <div className="flex flex-col min-w-0">
                      <div className="flex flex-wrap gap-1.5 items-center mb-2">
                        {issue.top_priority && (
                          <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-[#DC2626] text-white tracking-widest shadow-sm">
                            TOP PRIORITY
                          </span>
                        )}
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                            issue.category === 'Food / Hunger' ? 'bg-[#FEE2E2] text-[#991B1B]' :
                            issue.category === 'Medical' ? 'bg-[#DBEAFE] text-[#1E40AF]' :
                            issue.category === 'Infrastructure' ? 'bg-[#ECFDF5] text-[#065F46]' :
                            issue.category === 'Shelter' ? 'bg-[#FEF3C7] text-[#92400E]' :
                            'bg-[#F3F4F6] text-[#4B5563]'
                        }`}>
                          {issue.category}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-[#F3F4F6] text-[#1F2937] tracking-wider">
                          LOC: {issue.location}
                        </span>
                        {issue.time_detected && issue.time_detected !== "Not specified" && (
                          <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-blue-50 text-blue-700 tracking-wider">
                            TIME: {issue.time_detected}
                          </span>
                        )}
                      </div>
                      <h2 className="text-[17px] font-bold mb-1 text-[#1A1C1E]">{issue.issue_title}</h2>
                      <p className="text-[13px] text-[#4B5563] mb-3 leading-relaxed">{issue.reason}</p>
                      
                      {issue.risk_if_ignored !== "None" && (
                        <div className={`p-2 px-3 border rounded text-[11px] font-medium leading-tight ${riskBoxClass}`}>
                          RISK: {issue.risk_if_ignored}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 h-full md:items-end md:text-right">
                      {issue.attention_flag && (
                        <div className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase w-fit md:ml-auto ${
                          issue.urgency === 'Critical' ? 'bg-[#FEE2E2] text-[#991B1B]' :
                          issue.urgency === 'High' ? 'bg-[#FFEDD5] text-[#9A3412]' :
                          'bg-[#F3F4F6] text-[#4B5563]'
                        }`}>
                          {issue.attention_flag}
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 md:grid-cols-1 gap-2 text-xs mt-1 mb-3 md:mb-auto w-full">
                        <div className="md:flex md:justify-between md:items-start md:gap-3 md:w-full">
                          <div className="text-[10px] text-[#9CA3AF] uppercase pt-0.5 hidden md:block">Volunteer</div>
                          <div className="font-semibold text-[#1A1C1E] md:text-right md:w-full leading-tight">
                            <span className="text-[10px] text-[#9CA3AF] uppercase md:hidden block mb-0.5">Volunteer</span>
                            {issue.volunteer_type}
                          </div>
                        </div>
                        <div className="md:flex md:justify-between md:items-start md:gap-3 md:w-full mt-1">
                          <div className="text-[10px] text-[#9CA3AF] uppercase pt-0.5 hidden md:block">Action</div>
                          <div className="font-semibold text-[#1A1C1E] md:text-right md:w-full leading-tight">
                            <span className="text-[10px] text-[#9CA3AF] uppercase md:hidden block mb-0.5">Action</span>
                            {issue.action}
                          </div>
                        </div>
                      </div>

                      <button className="bg-[#1A1C1E] hover:bg-black transition-colors text-white border-none py-2 px-3 text-xs w-full rounded font-semibold text-center uppercase mt-auto tracking-wide cursor-pointer h-[34px] flex items-center justify-center">
                        {issue.urgency === 'Critical' ? 'DISPATCH UNIT' : 
                         issue.urgency === 'High' ? 'PROCURE & SEND' : 
                         issue.urgency === 'Medium' ? 'ASSESS NOW' : 'LOG DECISION'}
                      </button>
                    </div>

                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </section>
      </main>
    </div>
  );
}

