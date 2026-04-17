export interface HCP {
  id: number;
  name: string;
  specialty?: string | null;
  hospital?: string | null;
  city?: string | null;
  email?: string | null;
  phone?: string | null;
  notes?: string | null;
}

export type Channel = "visit" | "call" | "email" | "chat" | "other";
export type Outcome = "positive" | "neutral" | "negative" | "follow_up" | "no_show";
export type Sentiment = "positive" | "neutral" | "negative";

export interface Interaction {
  id: number;
  hcp_id: number;
  channel: Channel;
  outcome: Outcome | null;
  sentiment: Sentiment | null;
  summary: string | null;
  raw_notes: string | null;
  products_discussed: string[] | null;
  next_step: string | null;
  occurred_at: string;
  created_at: string;
  updated_at: string;
}

export interface InteractionList {
  items: Interaction[];
  total: number;
  limit: number;
  offset: number;
}

export interface InteractionCreate {
  hcp_id: number;
  channel: Channel;
  outcome?: Outcome | null;
  sentiment?: Sentiment | null;
  summary?: string | null;
  raw_notes?: string | null;
  products_discussed?: string[] | null;
  next_step?: string | null;
  occurred_at?: string | null;
}

export interface InteractionUpdate {
  channel?: Channel | null;
  outcome?: Outcome | null;
  sentiment?: Sentiment | null;
  summary?: string | null;
  raw_notes?: string | null;
  products_discussed?: string[] | null;
  next_step?: string | null;
  occurred_at?: string | null;
}

export type ChatRole = "user" | "assistant" | "system" | "tool";

export interface ChatMessage {
  role: ChatRole;
  content: string;
  tool_name?: string | null;
  tool_call_id?: string | null;
}

export interface ToolEvent {
  tool: string;
  args: Record<string, unknown>;
  result: unknown;
  error?: string | null;
}

export interface ChatRequest {
  hcp_id?: number | null;
  message: string;
  history: ChatMessage[];
}

export interface ChatResponse {
  reply: string;
  tool_events: ToolEvent[];
}
