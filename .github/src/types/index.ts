// Agent Output Data Contracts

export interface PlannerOutput {
  dailyTopic: string;
  weeklyTheme: string;
  monthlyTheme: string;
  postingSchedule: string;
  audienceEmotion: string;
  targetAudience: string;
  imageTheme: string;
}

export interface QuoteWriterOutput {
  quoteIsan: string;
  thaiMeaning: string;
  emotion: string;
  keywords: string[];
}

export interface CopywriterOutput {
  openingHook: string;
  body: string;
  cta: string;
  emojis: string[];
  hashtags: string[];
}

export interface ImagePromptOutput {
  prompt: string;
  theme: string;
  style: string;
  cameraSpec: string;
  lighting: string;
  mood: string;
  negativePrompt: string;
}

export interface PublisherOutput {
  postId: number;
  fbPostId: string | null;
  status: 'SCHEDULED' | 'PUBLISHED' | 'FAILED';
  publishedAt: string | null;
  dryRun: boolean;
  error?: string;
}

export interface AnalyticsOutput {
  postId?: number;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  followersGained: number;
  engagementRate: number;
  bestTopic: string;
  bestPostingTime: string;
  suggestions: string[];
}

// CEO Workflow State & Execution Result

export interface ValidationResult {
  isValid: boolean;
  reason?: string;
  hash?: string;
}

export interface FullWorkflowResult {
  success: boolean;
  postId?: number;
  fbPostId?: string | null;
  planner: PlannerOutput;
  quote: QuoteWriterOutput;
  copywriter: CopywriterOutput;
  imagePrompt: ImagePromptOutput;
  publisher?: PublisherOutput;
  analytics?: AnalyticsOutput;
  validation: ValidationResult;
  executedAt: string;
}

// Database Entity Interfaces

export interface QuoteEntity {
  id?: number;
  quote_isan: string;
  thai_meaning: string;
  emotion: string;
  keywords: string;
  hash_code: string;
  created_at?: string;
}

export interface CaptionEntity {
  id?: number;
  opening_hook: string;
  body: string;
  cta: string;
  emojis: string;
  hashtags: string;
  created_at?: string;
}

export interface ImagePromptEntity {
  id?: number;
  prompt: string;
  theme: string;
  style: string;
  camera_spec: string;
  lighting: string;
  mood: string;
  negative_prompt: string;
  created_at?: string;
}

export interface PostEntity {
  id?: number;
  quote_id: number;
  caption_id: number;
  image_prompt_id: number;
  status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'FAILED';
  scheduled_at?: string;
  published_at?: string;
  fb_post_id?: string;
  error_log?: string;
  created_at?: string;
}

export interface ScheduleEntity {
  id?: number;
  post_id: number;
  scheduled_time: string;
  status: 'PENDING' | 'EXECUTED' | 'FAILED';
  retries: number;
  last_error?: string;
  created_at?: string;
}

export interface AnalyticsEntity {
  id?: number;
  post_id: number;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  followers_gained: number;
  engagement_rate: number;
  report_period?: string;
  created_at?: string;
}

export interface LogEntity {
  id?: number;
  agent_name: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  action: string;
  details: string;
  timestamp?: string;
}

export interface HistoryEntity {
  id?: number;
  action_type: string;
  payload_json: string;
  created_at?: string;
}
