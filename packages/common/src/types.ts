/**
 * GOOSUN Open Execution Toolkit — common data model.
 * STATUS: interface spec (v0, schemaVersion 0.1.0). Implementation is grant milestone work.
 * Mirrors schemas/*.schema.json. Written fresh for this repository.
 */

export type SchemaVersion = '0.1.0'
export type ChainId = 'solana:mainnet' | 'solana:devnet' | 'solana:testnet' | `eip155:${number}`
export type Timestamp = string // RFC 3339 UTC
export type Hash = `0x${string}`
export type Address = string

export type AssetKind = 'native' | 'spl' | 'spl-token-2022' | 'bep20' | 'erc20' | 'offchain'
export interface AssetRef { chain: ChainId; kind: AssetKind; address?: Address; symbol?: string; decimals: number }

/** Exact base-unit amount. `raw` is an integer string; never use floats for on-chain values. */
export interface Amount { raw: string; decimals: number }

export type Side = 'BUY' | 'SELL'
/** PAPER: no chain access. SHADOW: real quotes + simulation, never signed. DEVNET: test networks. LIVE: mainnet, user-signed. */
export type Mode = 'PAPER' | 'SHADOW' | 'DEVNET' | 'LIVE'
export type ReasonCode = string

export interface Account {
  schemaVersion: SchemaVersion; accountId: string; chain: ChainId; address: Address
  kind: 'wallet' | 'venue_account'
  /** Always 'user'. The toolkit never custodies keys or funds. */
  custody: 'user'
  label?: string; createdAt?: Timestamp
}

export type ConnectionHealth = 'HEALTHY' | 'DEGRADED' | 'STALE_HEAD' | 'WRONG_CHAIN' | 'DOWN' | 'UNKNOWN'
export interface Connection {
  schemaVersion: SchemaVersion; connectionId: string; chain: ChainId
  /** Provider name only. Never credentials. */
  provider: string
  role: 'read' | 'simulate' | 'broadcast'; health: ConnectionHealth
  latestBlock?: number; latencyMs?: number; checkedAt: Timestamp
}

export interface Balance {
  schemaVersion: SchemaVersion; accountId: string; asset: AssetRef; amount: Amount
  tokenAccount?: Address; extensions?: string[]; observedAtBlock?: number; observedAt: Timestamp; source: string
}

export interface Position {
  schemaVersion: SchemaVersion; accountId: string; asset: AssetRef; quantity: Amount
  costBasis?: Amount; quoteAsset?: AssetRef; notionalQuote?: Amount; leverage?: number; updatedAt: Timestamp
}

export type OrderStatus = 'CREATED' | 'UNSIGNED_RETURNED' | 'SIGNED' | 'SUBMITTED' | 'CONFIRMED' | 'FAILED' | 'EXPIRED' | 'AMBIGUOUS' | 'RECONCILED'
export interface Order {
  schemaVersion: SchemaVersion; orderId: string; intentHash: Hash; accountId: string; chain: ChainId; venue: string
  side?: Side; sellAsset: AssetRef; buyAsset: AssetRef; sellAmount: Amount; minBuyAmount: Amount
  status: OrderStatus; createdAt: Timestamp; updatedAt?: Timestamp
}

export interface Fill {
  schemaVersion: SchemaVersion; fillId: string; orderId: string; chain: ChainId
  /** Solana signature or EVM transaction hash. */
  txId: string
  /** Slot (Solana) or block number (EVM). */
  block: number
  sold: Amount; bought: Amount; sellAsset: AssetRef; buyAsset: AssetRef; networkFee: Amount; venueFee?: Amount; executedAt: Timestamp
}

/** `null` means unknown — never coerce unknown to zero. */
export interface PnL {
  schemaVersion: SchemaVersion; accountId: string; quoteAsset: AssetRef; periodStart: Timestamp; periodEnd: Timestamp
  realized: Amount | null; unrealized: Amount | null; fees: Amount | null; method: 'FIFO' | 'AVERAGE_COST'; valuationSource?: string
}

export type CapabilityState = 'DESIGN' | 'IMPLEMENTED' | 'TESTED' | 'DEVNET_VERIFIED' | 'MAINNET_VERIFIED' | 'DISABLED'
export interface VenueCapability {
  schemaVersion: SchemaVersion; venueId: string; chain: ChainId; kind: 'DEX_AGGREGATOR' | 'DEX_AMM' | 'WALLET'
  capabilities: Record<string, { state: CapabilityState; evidence?: string }>
  contracts?: { role: string; address: Address; verifiedAtBlock?: number }[]
  reviewedAt: Timestamp
}

export type RiskRule =
  | 'KILL_SWITCH' | 'SCHEMA' | 'CHAIN_ALLOWED' | 'ACCOUNT_OWNERSHIP' | 'BALANCE_SUFFICIENT' | 'SLIPPAGE' | 'STALE_QUOTE'
  | 'BLOCKHASH_VALIDITY' | 'FEE' | 'GAS_CAP' | 'APPROVAL' | 'POSITION_LIMIT' | 'NOTIONAL_LIMIT' | 'DAILY_EXPOSURE'
  | 'LEVERAGE_LIMIT' | 'CIRCUIT_BREAKER' | 'TOKEN_EXTENSION' | 'SIMULATION_MATCH'
export interface RiskCheck { rule: RiskRule; result: 'PASS' | 'FAIL' | 'MISSING_INPUT'; observed?: string; limit?: string; reason?: ReasonCode }
export interface RiskDecision {
  schemaVersion: SchemaVersion; decisionId: string; intentHash: Hash; decision: 'ALLOW' | 'BLOCK'
  policyId: string; policyVersion?: string; checks: RiskCheck[]; reasons: ReasonCode[]; evaluatedAt: Timestamp; expiresAt: Timestamp
}

export interface RouteCandidate {
  routeId: string; venueId: string; expectedOut: Amount; minOut: Amount; priceImpactBps?: number
  estimatedFee?: Amount; hops?: number; quotedAt: Timestamp; expiresAt?: Timestamp
}
export type IntentStatus = 'PROPOSED' | 'BLOCKED' | 'ALLOWED' | 'UNSIGNED_RETURNED' | 'SIGNED' | 'SUBMITTED' | 'RECONCILED' | 'EXPIRED'
export interface ExecutionIntent {
  schemaVersion: SchemaVersion; intentId: string; intentHash?: Hash; agentId: string; accountId: string; chain: ChainId; mode: Mode
  action: 'SWAP'; sellAsset: AssetRef; buyAsset: AssetRef; sellAmount: Amount; maxSlippageBps: number
  /** Free-text rationale from the agent. Recorded, never executed. */
  rationale?: string
  route?: { chosen?: string; candidates?: RouteCandidate[]; reason?: string }
  status: IntentStatus; createdAt: Timestamp
}

export interface ReconciliationRecord {
  schemaVersion: SchemaVersion; recordId: string; intentHash: Hash; orderId: string; chain: ChainId; txId?: string; block?: number
  onchainStatus: 'SUCCESS' | 'FAILED' | 'DROPPED' | 'EXPIRED' | 'NOT_FOUND'
  expected: { sold: Amount; minBought: Amount }
  actual?: { sold?: Amount; bought?: Amount; networkFee?: Amount }
  result: 'MATCH' | 'WITHIN_TOLERANCE' | 'MISMATCH' | 'NOT_EXECUTED' | 'PENDING'
  mismatches?: ReasonCode[]
  /** Must always be false. A duplicate submission is an incident. */
  duplicateSubmission: false
  reconciledAt: Timestamp
}
