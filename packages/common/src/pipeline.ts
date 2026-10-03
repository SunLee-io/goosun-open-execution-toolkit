/**
 * Chain-agnostic pipeline contracts: risk gate, router, builder, reconciler.
 * STATUS: interface spec — implementation is grant milestone work. No implementation in this file.
 */
import type {
  Account, Amount, Balance, ChainId, ExecutionIntent, Fill, Position, ReconciliationRecord,
  RiskDecision, RiskRule, RouteCandidate, Timestamp, VenueCapability,
} from './types'

/** Read-only context assembled before risk evaluation. Every field carries its own observation time. */
export interface MarketContext {
  chain: ChainId
  account: Account
  balances: Balance[]
  positions: Position[]
  venues: VenueCapability[]
  candidates: RouteCandidate[]
  /** Latest slot / block seen by the context reader. */
  headBlock: number
  observedAt: Timestamp
}

export interface RiskPolicy {
  policyId: string
  policyVersion: string
  killSwitch: boolean
  allowedChains: ChainId[]
  maxSlippageBps: number
  maxQuoteAgeMs: number
  maxBlockDrift: number
  maxFeeBps: number
  maxNotionalPerOrder: Amount
  maxPositionPerAsset: Amount
  maxDailyExposure: Amount
  maxLeverage: number
  /** EVM only: unlimited approvals are blocked unless true. */
  allowUnlimitedApproval: boolean
  decisionTtlMs: number
}

/** A single rule. Must return MISSING_INPUT (→ BLOCK) when it cannot evaluate. */
export interface RiskRuleEvaluator {
  rule: RiskRule
  evaluate(intent: ExecutionIntent, context: MarketContext, policy: RiskPolicy, now: Date): RiskDecision['checks'][number]
}

/** Kill switch is evaluated first; any FAIL or MISSING_INPUT yields BLOCK. */
export interface RiskGate {
  evaluate(intent: ExecutionIntent, context: MarketContext, policy: RiskPolicy, now?: Date): Promise<RiskDecision>
}

export interface RouteDecision { chosen: RouteCandidate; rejected: { candidate: RouteCandidate; reason: string }[]; reason: string }
export interface ExecutionRouter {
  choose(intent: ExecutionIntent, candidates: RouteCandidate[], decision: RiskDecision): RouteDecision
}

/** Human- and machine-readable summary shown to the user before signing. */
export interface SigningSummary {
  chain: ChainId
  signer: string
  sells: { asset: string; amount: Amount }[]
  minimumReceives: { asset: string; amount: Amount }[]
  programsOrContracts: string[]
  approvals: { token: string; spender: string; amount: Amount | 'UNLIMITED' }[]
  expiresAt: Timestamp
  intentHash: string
}

/**
 * Builds an UNSIGNED transaction. Must throw RISK_DECISION_REQUIRED unless decision.decision === 'ALLOW',
 * decision.intentHash matches, and decision.expiresAt is in the future. Never accepts key material.
 */
export interface UnsignedTransactionBuilder<TUnsigned> {
  build(intent: ExecutionIntent, route: RouteDecision, decision: RiskDecision): Promise<{ unsigned: TUnsigned; summary: SigningSummary }>
}

export interface Reconciler {
  /** Never re-submits. Ambiguous outcomes return result=PENDING for later re-check. */
  reconcile(intent: ExecutionIntent, txId: string | null): Promise<{ record: ReconciliationRecord; fills: Fill[] }>
}
