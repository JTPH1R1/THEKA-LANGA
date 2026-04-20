// Centralised TanStack Query key factory.
// All cache keys are defined here — never hardcoded in hooks or components.
// This prevents stale cache bugs and makes invalidation explicit.

export const queryKeys = {
  // ─── Auth ─────────────────────────────────────────────────────────────────
  session:  ()           => ['session'] as const,
  profile:  (id: string) => ['profile', id] as const,

  // ─── KYC ──────────────────────────────────────────────────────────────────
  kycProfile:   (profileId: string) => ['kyc', 'profile', profileId] as const,
  kycDocuments: (profileId: string) => ['kyc', 'documents', profileId] as const,
  kycSelfies:   (profileId: string) => ['kyc', 'selfies', profileId] as const,
  kycAddresses: (profileId: string) => ['kyc', 'addresses', profileId] as const,
  kycQueue:     ()                  => ['kyc', 'queue'] as const,

  // ─── Groups ───────────────────────────────────────────────────────────────
  groups:      (filters?: object) => ['groups', filters ?? {}] as const,
  groupDetail: (groupId: string)  => ['group', groupId] as const,
  groupRules:  (groupId: string)  => ['group', groupId, 'rules'] as const,
  groupSummary:(groupId: string)  => ['group', groupId, 'summary'] as const,

  // ─── Members ──────────────────────────────────────────────────────────────
  groupMembers:   (groupId: string)              => ['group', groupId, 'members'] as const,
  groupMember:    (groupId: string, memberId: string) => ['group', groupId, 'member', memberId] as const,
  joinRequests:   (groupId: string)              => ['group', groupId, 'join-requests'] as const,
  memberPortfolio:(groupId: string, profileId: string) => ['portfolio', groupId, profileId] as const,

  // ─── Elections ────────────────────────────────────────────────────────────
  elections:  (groupId: string)    => ['elections', groupId] as const,
  election:   (electionId: string) => ['election', electionId] as const,
  candidates: (electionId: string) => ['election', electionId, 'candidates'] as const,

  // ─── Contributions ────────────────────────────────────────────────────────
  contributions:   (groupId: string, filters?: object) => ['contributions', groupId, filters ?? {}] as const,
  myContributions: (profileId: string)                  => ['my-contributions', profileId] as const,

  // ─── Loans ────────────────────────────────────────────────────────────────
  loans:          (groupId: string, filters?: object) => ['loans', groupId, filters ?? {}] as const,
  loan:           (loanId: string)                    => ['loan', loanId] as const,
  loanRepayments: (loanId: string)                    => ['loan', loanId, 'repayments'] as const,
  loanGuarantors: (loanId: string)                    => ['loan', loanId, 'guarantors'] as const,
  myLoans:        (profileId: string)                 => ['my-loans', profileId] as const,

  // ─── Dashboard ────────────────────────────────────────────────────────────
  dashboardKpis: (profileId: string) => ['dashboard', 'kpis', profileId] as const,
  activityFeed:  (profileId: string) => ['dashboard', 'activity', profileId] as const,
  creditScore:   (profileId: string) => ['credit-score', profileId] as const,
  creditHistory: (profileId: string) => ['credit-score', profileId, 'history'] as const,

  // ─── Personal Finance ─────────────────────────────────────────────────────
  personalTransactions: (profileId: string, filters?: object) => ['personal', 'transactions', profileId, filters ?? {}] as const,
  personalBudgets:      (profileId: string, month: string)    => ['personal', 'budgets', profileId, month] as const,
  shoppingLists:        (profileId: string)                   => ['personal', 'shopping', profileId] as const,
  shoppingList:         (listId: string)                      => ['personal', 'shopping', 'list', listId] as const,

  // ─── Reports ─────────────────────────────────────────────────────────────────
  reportCycleSummary:    (groupId: string, period: string)   => ['report', 'cycle',  groupId, period]   as const,
  reportMemberStatement: (groupId: string, memberId: string) => ['report', 'member', groupId, memberId] as const,
  reportLoanBook:        (groupId: string)                   => ['report', 'loans',  groupId]            as const,

  // ─── Notifications ────────────────────────────────────────────────────────
  notifications: (profileId: string) => ['notifications', profileId] as const,

  // ─── Audit ────────────────────────────────────────────────────────────────
  auditLog: (filters?: object) => ['audit', filters ?? {}] as const,

  // ─── Admin ────────────────────────────────────────────────────────────────
  adminStats:  ()              => ['admin', 'stats'] as const,
  adminUsers:  (filters?: object) => ['admin', 'users', filters ?? {}] as const,
  adminGroups: (filters?: object) => ['admin', 'groups', filters ?? {}] as const,
  adminJobs:   ()              => ['admin', 'jobs'] as const,
  adminErrors: ()              => ['admin', 'errors'] as const,
} as const
