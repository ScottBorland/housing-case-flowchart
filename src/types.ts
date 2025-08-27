// --- Core case structures from your JSON ---

export interface Decision {
  Decision_DecisionFlowchartBox: string;      // e.g. "3", "13a"
  Decision_DecisionOutcome: string;           // e.g. "Yes" | "No" | ...
  Decision_DecisionMadeDate?: string;         // e.g. "2024-11-03 00:00:00" (optional/NaT possible)
  Decision_DecisionType?: string;             // you started displaying this too
}

export interface CaseInformation {
  Case_Id: string;
  CustomerId: string;
  "Case_AssignedTo$Officer$": string;
  Case_DateCreated: string;                   // keep as string (you’re formatting in UI)
  Case_DateClosed?: string | null;            // null/undefined if still open
  Decision_Tree: Record<string, Decision>;    // "1", "2", "13a" etc. as keys
}

export interface CaseData {
  Case_information: CaseInformation;
}

// If Cases.json is a mapping of caseId -> CaseData:
export type CasesFile = Record<string, CaseData>;


// --- Node data shapes for React Flow custom nodes ---

export type DateHeaderData = {
  label: string; // "📅 2023-05-18 00:00:00" (we format in the node)
};

export type CaseInfoNodeData = {
  Case_Id: string;
  CustomerId: string;
  "Case_AssignedTo$Officer$": string;
  Case_DateCreated: string;
  Case_DateClosed?: string | null;
};

export type HorizontalNodeData = {
  // Using the raw field names if you prefer; or keep your normalized props.
  Decision_DecisionType: string;
  Decision_DecisionOutcome: string;
};

// Union used in createNodesFromJson + App state
export type AnyNodeData = DateHeaderData | CaseInfoNodeData | HorizontalNodeData;
