/**
 * @goosun/open-execution-bnb — BNB Chain (BSC + opBNB) interface spec.
 * STATUS: interface spec, implementation is grant milestone (BNB M1–M3). Nothing here is delivered.
 */
import type {
  Amount, Balance, Connection, ExecutionIntent, Fill, ReconciliationRecord, RiskDecision, Timestamp,
} from '../../common/src/types'
import type { RouteDecision, SigningSummary } from '../../common/src/pipeline'
import type { RouteCandidate } from '../../common/src/types'

export type BnbChainId = 'eip155:56' | 'eip155:204'
export type Hex = `0x${string}`

// ── M1: RPC abstraction + provider failover ────────────────────────────────

export interface RpcEndpoint {
  id: string
  chain: BnbChainId
  /** URL without credentials; credentials (if any) are injected by the caller's own transport. */
  url: string
  weight: number
}

export interface FailoverPolicy {
  /** A provider whose head lags the best observed head by more than this many blocks is STALE_HEAD. */
  maxHeadLagBlocks: number
  requestTimeoutMs: number
  /** Consecutive failures before a provider is marked DOWN and skipped. */
  failureThreshold: number
  cooldownMs: number
  /** Only these JSON-RPC methods may be sent through the read pool. */
  readMethodAllowlist: string[]
}

export interface BnbRpcClient {
  /** Verifies eth_chainId on every new provider; mismatches are WRONG_CHAIN and never used. */
  request<T>(chain: BnbChainId, method: string, params: unknown[]): Promise<{ result: T; provider: string; block: number }>
  health(chain: BnbChainId): Promise<Connection[]>
}

// ── M1: wallet / BEP-20 token / allowance normalization ────────────────────

export interface Bep20Token { chain: BnbChainId; address: Hex; symbol: string; decimals: number; canonical: boolean; bridgedFrom?: { chain: BnbChainId; address: Hex } }

export interface AllowanceState {
  chain: BnbChainId; owner: Hex; token: Hex; spender: Hex
  allowance: Amount
  unlimited: boolean
  block: number
  observedAt: Timestamp
}

export interface BnbAccountAdapter {
  getBalances(chain: BnbChainId, owner: Hex, tokens: Bep20Token[]): Promise<{ balances: Balance[]; block: number }>
  getNonce(chain: BnbChainId, owner: Hex): Promise<number>
  getAllowance(chain: BnbChainId, owner: Hex, token: Hex, spender: Hex): Promise<AllowanceState>
  /** Exact-amount approve calldata (unsigned). */
  buildApprove(chain: BnbChainId, token: Hex, spender: Hex, amount: Amount): UnsignedEvmTx
  /** approve(spender, 0) calldata (unsigned). */
  buildRevoke(chain: BnbChainId, token: Hex, spender: Hex): UnsignedEvmTx
}

// ── M1: transaction + receipt normalization ────────────────────────────────

export interface UnsignedEvmTx {
  chain: BnbChainId
  to: Hex
  data: Hex
  value: string
  gasLimit?: string
  /** BSC: legacy gasPrice or EIP-1559 fields as supported; opBNB: L2 fee fields + L1 data fee estimate. */
  fee: { type: 'legacy'; gasPrice: string } | { type: 'eip1559'; maxFeePerGas: string; maxPriorityFeePerGas: string }
  l1DataFeeEstimate?: string
  nonce?: number
}

export interface NormalizedReceipt {
  chain: BnbChainId
  txHash: Hex
  block: number
  status: 'SUCCESS' | 'REVERTED' | 'OUT_OF_GAS' | 'NOT_FOUND'
  revertReason: string | null
  gasUsed: string
  effectiveGasPrice: string
  /** opBNB only */
  l1Fee?: string
  transfers: { token: Hex | 'BNB'; from: Hex; to: Hex; amount: Amount }[]
}

export interface ReceiptNormalizer {
  normalize(chain: BnbChainId, txHash: Hex): Promise<NormalizedReceipt>
  toFill(receipt: NormalizedReceipt, intent: ExecutionIntent, owner: Hex): Fill | null
}

// ── M2: BNB DEX route adapter + quote aggregation ──────────────────────────

export interface BnbRouteRequest { chain: BnbChainId; tokenIn: Hex | 'BNB'; tokenOut: Hex | 'BNB'; amountIn: Amount; slippageBps: number; recipient: Hex }

export interface BnbRouteCandidate extends RouteCandidate {
  chain: BnbChainId
  router: Hex
  path: (Hex | 'BNB')[]
  requiresApproval: { token: Hex; spender: Hex; amount: Amount } | null
  gasEstimate: string
}

/** One adapter per venue (e.g. PancakeSwap on BSC and on opBNB). Router addresses are pinned and verified on-chain. */
export interface BnbDexRouteAdapter {
  venueId: string
  supportedChains: BnbChainId[]
  quote(req: BnbRouteRequest): Promise<BnbRouteCandidate[]>
  buildSwap(candidate: BnbRouteCandidate, deadline: Timestamp): UnsignedEvmTx
}

export interface QuoteAggregator {
  /** Collects candidates from all registered adapters; failures are recorded, never silently dropped. */
  collect(req: BnbRouteRequest): Promise<{ candidates: BnbRouteCandidate[]; failures: { venueId: string; reason: string }[] }>
}

// ── M2: gas + approval validation ──────────────────────────────────────────

export interface GasPolicy { maxGasPriceGwei: Record<BnbChainId, number>; maxGasLimit: number; maxFeeShareBps: number }
export type GasApprovalReason = 'GAS_PRICE_ABOVE_CAP' | 'GAS_LIMIT_ABOVE_CAP' | 'FEE_SHARE_ABOVE_CAP' | 'ALLOWANCE_INSUFFICIENT' | 'UNLIMITED_APPROVAL_BLOCKED' | 'SPENDER_NOT_PINNED'
export interface GasApprovalValidator {
  validate(tx: UnsignedEvmTx, candidate: BnbRouteCandidate, allowance: AllowanceState | null, policy: GasPolicy, allowUnlimitedApproval: boolean):
    { ok: boolean; reasons: GasApprovalReason[] }
}

// ── Signing boundary + reconciliation ──────────────────────────────────────

/** Throws RISK_DECISION_REQUIRED unless decision is ALLOW, matches, and is unexpired. Never accepts key material. */
export interface BnbSigningBoundary {
  build(intent: ExecutionIntent, route: RouteDecision, decision: RiskDecision): Promise<{ unsigned: UnsignedEvmTx[]; summary: SigningSummary }>
}

export interface BnbReconciler {
  reconcile(intent: ExecutionIntent, txHash: Hex | null): Promise<{ record: ReconciliationRecord; fills: Fill[] }>
}
