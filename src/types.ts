export type Urgency = 'Critical' | 'High' | 'Medium' | 'Low';
export type Category = 'Food / Hunger' | 'Medical' | 'Shelter' | 'Education' | 'Infrastructure' | 'Other';
export type VolunteerType = 'Medical' | 'Logistics' | 'Construction' | 'Teaching' | 'General Support';
export type AttentionFlag = '🚨 Immediate Action Required' | '⚠️ High Attention Needed' | 'Monitor' | 'Low Priority';

export interface Issue {
  issue_title: string;
  category: Category;
  location: string;
  time_detected: string;
  urgency: Urgency;
  priority_rank: number;
  top_priority: boolean;
  attention_flag: AttentionFlag;
  reason: string;
  volunteer_type: VolunteerType;
  action: string;
  risk_if_ignored: string;
}

export interface AnalysisSummary {
  total_issues: number;
  critical_count: number;
  high_count: number;
  deployment_plan: string;
}

export interface AnalysisResult {
  issues: Issue[];
  summary: AnalysisSummary;
}
