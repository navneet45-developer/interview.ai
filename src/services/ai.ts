/**
 * src/services/ai.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Centralized AI service layer.
 *
 * Architecture:
 *   1. geminiProvider()  — primary, uses @google/genai
 *   2. groqProvider()    — fallback, uses groq-sdk
 *   3. generateAI()      — smart wrapper that auto-switches on failure
 *
 * Error handling:
 *   429  quota exceeded   → switch to Groq
 *   503  unavailable      → switch to Groq
 *   timeout              → switch to Groq
 *   network failure      → switch to Groq
 *   malformed JSON       → return safe fallback string
 *
 * Users never see AI provider errors — all failures return safe defaults.
 */

import { GoogleGenAI, Type } from '@google/genai';
import Groq from 'groq-sdk';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AIRequestOptions {
  prompt: string;
  /** Gemini response schema (optional). When provided Gemini uses structured output. */
  schema?: any;
  /** Expected response MIME type for Gemini */
  mimeType?: string;
  /** Sampling temperature 0-1 */
  temperature?: number;
  /** Max tokens for Groq fallback */
  maxTokens?: number;
}

export interface AIResponse {
  text: string;
  provider: 'gemini' | 'groq' | 'fallback';
  error?: string;
}

// ─── Error Classification ─────────────────────────────────────────────────────

const FALLBACK_ERRORS = new Set([
  '429',
  '503',
  'quota',
  'rate limit',
  'resource_exhausted',
  'service unavailable',
  'overloaded',
  'timeout',
  'econnreset',
  'etimedout',
  'enotfound',
  'fetch failed',
  'network',
]);

function shouldFallback(err: any): boolean {
  const msg = String(err?.message || err?.status || err?.code || '').toLowerCase();
  const status = err?.status || err?.statusCode || 0;
  if (status === 429 || status === 503) return true;
  for (const keyword of FALLBACK_ERRORS) {
    if (msg.includes(keyword)) return true;
  }
  return false;
}

// ─── Provider: Gemini ─────────────────────────────────────────────────────────

let _geminiClient: GoogleGenAI | null = null;

export function geminiProvider(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === 'MY_GEMINI_API_KEY') return null;
  if (!_geminiClient) {
    _geminiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });
  }
  return _geminiClient;
}

async function callGemini(opts: AIRequestOptions): Promise<string> {
  const client = geminiProvider();
  if (!client) throw new Error('Gemini not configured');

  const config: any = {
    temperature: opts.temperature ?? 0.7,
  };
  if (opts.mimeType) config.responseMimeType = opts.mimeType;
  if (opts.schema) config.responseSchema = opts.schema;

  const response = await client.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: opts.prompt,
    config,
  });

  return response.text || '';
}

// ─── Provider: Groq ───────────────────────────────────────────────────────────

let _groqClient: Groq | null = null;

export function groqProvider(): Groq | null {
  const key = process.env.GROQ_API_KEY;
  if (!key || key === 'YOUR_GROQ_API_KEY') return null;
  if (!_groqClient) {
    _groqClient = new Groq({ apiKey: key });
  }
  return _groqClient;
}

async function callGroq(opts: AIRequestOptions): Promise<string> {
  const client = groqProvider();
  if (!client) throw new Error('Groq not configured');

  // Groq does not support structured output schemas — we embed JSON instructions
  let systemPrompt =
    'You are a professional AI assistant. Return only valid JSON when asked, with no markdown fences.';
  if (opts.mimeType === 'application/json' || opts.schema) {
    systemPrompt +=
      ' Respond ONLY with a raw JSON object or array. No explanation, no markdown backticks.';
  }

  const completion = await client.chat.completions.create({
    model: 'llama3-8b-8192',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: opts.prompt },
    ],
    temperature: opts.temperature ?? 0.7,
    max_tokens: opts.maxTokens ?? 2048,
  });

  return completion.choices[0]?.message?.content || '';
}

// ─── Cache ────────────────────────────────────────────────────────────────────

interface CacheEntry {
  result: string;
  ts: number;
}

const _cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function cacheKey(opts: AIRequestOptions): string {
  return `${opts.prompt.slice(0, 120)}__${opts.temperature ?? 0.7}`;
}

function getCache(opts: AIRequestOptions): string | null {
  const key = cacheKey(opts);
  const entry = _cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL_MS) {
    _cache.delete(key);
    return null;
  }
  return entry.result;
}

function setCache(opts: AIRequestOptions, result: string): void {
  _cache.set(cacheKey(opts), { result, ts: Date.now() });
}

// ─── Public: generateAI ──────────────────────────────────────────────────────

/**
 * Main AI generation function.
 * 1. Tries Gemini first.
 * 2. On quota/network/503 errors → auto-switches to Groq.
 * 3. If both fail → returns { text: '', provider: 'fallback', error }.
 * 4. Results are cached for 5 minutes to prevent duplicate requests.
 */
export async function generateAI(opts: AIRequestOptions): Promise<AIResponse> {
  // Check cache first (skips duplicate resume/question requests)
  const cached = getCache(opts);
  if (cached) return { text: cached, provider: 'gemini' };

  // ── Try Gemini ──
  if (geminiProvider()) {
  try {
    const text = await callGemini(opts);
    setCache(opts, text);
    return { text, provider: 'gemini' };
  } catch (err: any) {
    const message = String(err?.message || '');

    console.warn(
      `[AI] Gemini failed (${message}). Switching to Groq...`
    );
  }
}

  // ── Try Groq ──
  if (groqProvider()) {
    try {
      const text = await callGroq(opts);
      setCache(opts, text);
      return { text, provider: 'groq' };
    } catch (err: any) {
      const message = String(err?.message || '');
      console.error('[AI] Groq fallback also failed:', message);
      return { text: '', provider: 'fallback', error: message };
    }
  }

  // Neither provider is configured
  return {
    text: '',
    provider: 'fallback',
    error: 'No AI provider configured. Set GEMINI_API_KEY or GROQ_API_KEY in your .env file.',
  };
}

/**
 * Safe JSON parse helper.
 * Strips markdown fences, then parses. Returns null on any failure.
 */
export function safeParseJSON<T = any>(raw: string): T | null {
  try {
    const cleaned = raw
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();
    return JSON.parse(cleaned) as T;
  } catch {
    return null;
  }
}

// Re-export Type so server.ts still works with a single import
export { Type };
