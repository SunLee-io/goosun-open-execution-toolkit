/**
 * @goosun/open-execution-solana — Solana interface spec.
 * STATUS: interface spec, implementation is grant milestone (Solana M1–M3). Nothing here is delivered.
 * No dependency on any Solana SDK is declared yet; transactions cross the boundary as base64 strings.
 */
import type {
  Account, Amount, Balance, ExecutionIntent, Fill, ReconciliationRecord, RiskDecision, RouteCandidate, Timestamp,
} from '../../common/src/types'
import type { RouteDecision, SigningSummary } from '../../common/src/pipeline'

export type SolanaCluster = 'solana:mainnet' | 'solana:devnet'
export type Base58 = string
export type Base64 = string

// ── M1: account adapter + SPL normalization ────────────────────────────────

export interface MintInfo {
  mint: Base58
  program: 'spl-token' | 'spl-token-2022'
  decimals: number
  /** Token-2022 extensions present on the mint, e.g. 'transferFeeConfig', 'permanentDelegate', 'transferHook'. */
  extensions: string[]
  /** Transfer fee in bps if the transferFeeConfig extension is active for the current epoch. */
  transferFeeBps?: number
  freezeAuthority: Base58 | null
}

export interface SolanaAccountAdapter {
  /** Native SOL (lamports) + all SPL / Token-2022 token accounts owned by `owner`, normalized to Balance. */
  getBalances(cluster: SolanaCluster, owner: Base58): Promise<{ balances: Balance[]; slot: number }>
  /** Derive the associated token account for (owner, mint, program). Pure function. */
  associatedTokenAddress(owner: Base58, mint: Base58, program: MintInfo['program']): Base58
  getMint(cluster: SolanaCluster, mint: Base58): Promise<MintInfo>
  toAccount(cluster: SolanaCluster, owner: Base58, label?: string): Account
}

// ── M1: Versioned Transaction builder + signing boundary ───────────────────

export interface V0BuildOptions {
  computeUnitLimit?: number
  /** micro-lamports per compute unit */
  computeUnitPriceMicroLamports?: number
  addressLookupTables?: Base58[]
}

export interface SimulationResult {
  ok: boolean
  err: string | null
  unitsConsumed: number | null
  /** Token balance deltas for the signer derived from simulation, per mint. */
  tokenDeltas: { mint: Base58 | 'SOL'; delta: Amount }[]
  logsTruncated: boolean
  slot: number
}

export interface UnsignedV0Transaction {
  /** base64 serialized VersionedTransaction with empty signatures. */
  transaction: Base64
  recentBlockhash: string
  lastValidBlockHeight: number
  sizeBytes: number
  simulation: SimulationResult
}

/**
 * Signing boundary. Only unsigned transactions leave this interface; key material is never accepted.
 * `build` throws RISK_DECISION_REQUIRED unless `decision` is ALLOW, matches the intent, and is unexpired.
 */
export interface SolanaSigningBoundary {
  build(intent: ExecutionIntent, route: RouteDecision, decision: RiskDecision, options?: V0BuildOptions):
    Promise<{ unsigned: UnsignedV0Transaction; summary: SigningSummary }>
}

// ── M2: Jupiter quote + route adapters ─────────────────────────────────────

export interface JupiterQuoteRequest {
  inputMint: Base58
  outputMint: Base58
  amount: Amount
  slippageBps: number
  onlyDirectRoutes?: boolean
  maxAccounts?: number
}

export interface NormalizedJupiterRoute extends RouteCandidate {
  inputMint: Base58
  outputMint: Base58
  legs: { amm: string; inputMint: Base58; outputMint: Base58; feeAmount?: Amount }[]
  /** Slot at which the quote was produced (contextSlot), used by the stale-quote guard. */
  contextSlot: number
  /** Raw provider response kept for audit; never trusted for amounts without normalization. */
  raw: unknown
}

export interface JupiterQuoteAdapter {
  quote(req: JupiterQuoteRequest): Promise<NormalizedJupiterRoute[]>
}

export interface JupiterRouteAdapter {
  /** Turn a chosen normalized route into instructions + ALTs for the v0 builder. No signing. */
  toInstructions(route: NormalizedJupiterRoute, owner: Base58): Promise<{ instructions: Base64[]; addressLookupTables: Base58[] }>
}

// ── M2: stale-quote guard ──────────────────────────────────────────────────

export interface StaleQuoteInputs {
  quotedAt: Timestamp
  contextSlot: number
  currentSlot: number
  blockhashValid: boolean
  now: Timestamp
}
export interface StaleQuotePolicy { maxQuoteAgeMs: number; maxSlotDrift: number }
export type StaleQuoteReason = 'QUOTE_TOO_OLD' | 'SLOT_DRIFT_EXCEEDED' | 'BLOCKHASH_EXPIRED' | 'QUOTE_TIME_INVALID'
export interface StaleQuoteGuard {
  check(inputs: StaleQuoteInputs, policy: StaleQuotePolicy): { fresh: boolean; reasons: StaleQuoteReason[] }
}

// ── M3: reconciliation ─────────────────────────────────────────────────────

export interface SolanaReconciler {
  /**
   * Uses getTransaction (maxSupportedTransactionVersion: 0) pre/post token balances and fee.
   * If the signature is unknown and lastValidBlockHeight has passed → onchainStatus=EXPIRED, never re-submit.
   */
  reconcile(cluster: SolanaCluster, intent: ExecutionIntent, signature: Base58 | null, lastValidBlockHeight: number):
    Promise<{ record: ReconciliationRecord; fills: Fill[] }>
}
