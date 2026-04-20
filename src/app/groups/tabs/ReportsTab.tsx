import { useState } from 'react'
import { BlobProvider } from '@react-pdf/renderer'
import { FileText, Users, BookOpen, Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useDistinctPeriods } from '@/hooks/useContributions'
import { useGroupMembers } from '@/hooks/useGroupMembers'
import { useCycleSummaryData, useMemberStatementData, useLoanBookData } from '@/hooks/useReports'
import { CycleSummaryPdf } from '@/components/reports/CycleSummaryPdf'
import { MemberStatementPdf } from '@/components/reports/MemberStatementPdf'
import { LoanBookPdf } from '@/components/reports/LoanBookPdf'
import { formatPeriod } from '@/lib/formatters'

type ReportType = 'cycle' | 'member' | 'loans'

interface Props {
  groupId: string
  currency: string
}

function DownloadBtn({ document: doc, fileName }: { document: React.ReactElement; fileName: string }) {
  return (
    <BlobProvider document={doc}>
      {({ url, loading }) => (
        <a
          href={url ?? '#'}
          download={fileName}
          onClick={(e) => { if (!url) e.preventDefault() }}
          className="inline-block"
        >
          <Button disabled={loading || !url} className="gap-2">
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
            {loading ? 'Generating PDF…' : 'Download PDF'}
          </Button>
        </a>
      )}
    </BlobProvider>
  )
}

function CycleReport({ groupId }: { groupId: string }) {
  const { data: periods = [], isLoading: loadingPeriods } = useDistinctPeriods(groupId)
  const [period, setPeriod] = useState('')
  const selectedPeriod = period || periods[0] || ''

  const { data, isLoading, error } = useCycleSummaryData(groupId, selectedPeriod)

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-xs text-slate-400 uppercase tracking-wide">Cycle Period</label>
        {loadingPeriods ? (
          <div className="h-9 w-48 bg-slate-800 animate-pulse rounded-md" />
        ) : periods.length === 0 ? (
          <p className="text-sm text-slate-500">No contribution periods found. Generate a schedule first.</p>
        ) : (
          <Select value={selectedPeriod} onValueChange={setPeriod}>
            <SelectTrigger className="w-48 bg-slate-800 border-slate-700 text-slate-100">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              {periods.map((p) => (
                <SelectItem key={p} value={p} className="text-slate-100 focus:bg-slate-700">{formatPeriod(p)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {isLoading && <p className="text-sm text-slate-400">Loading report data…</p>}
      {error && <p className="text-sm text-rose-400">Error: {error.message}</p>}
      {data && (
        <div className="space-y-3">
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Members', value: data.rows.length },
              { label: 'Paid', value: data.totals.membersPaid },
              { label: 'Partial', value: data.totals.membersPartial },
              { label: 'Overdue', value: data.totals.membersOverdue },
            ].map(({ label, value }) => (
              <div key={label} className="bg-slate-800/50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-slate-100">{value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
          <DownloadBtn
            document={<CycleSummaryPdf data={data} />}
            fileName={`cycle-summary-${selectedPeriod}.pdf`}
          />
        </div>
      )}
    </div>
  )
}

function MemberReport({ groupId }: { groupId: string }) {
  const { data: members = [], isLoading: loadingMembers } = useGroupMembers(groupId)
  const activeMembers = members.filter((m) => m.status === 'active')
  const [memberId, setMemberId] = useState('')
  const selectedId = memberId || activeMembers[0]?.profileId || ''

  const { data, isLoading, error } = useMemberStatementData(groupId, selectedId)

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-xs text-slate-400 uppercase tracking-wide">Member</label>
        {loadingMembers ? (
          <div className="h-9 w-64 bg-slate-800 animate-pulse rounded-md" />
        ) : activeMembers.length === 0 ? (
          <p className="text-sm text-slate-500">No active members found.</p>
        ) : (
          <Select value={selectedId} onValueChange={setMemberId}>
            <SelectTrigger className="w-64 bg-slate-800 border-slate-700 text-slate-100">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              {activeMembers.map((m) => (
                <SelectItem key={m.profileId} value={m.profileId} className="text-slate-100 focus:bg-slate-700">
                  {m.profile?.preferredName ?? m.profile?.fullLegalName ?? m.profileId}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {isLoading && <p className="text-sm text-slate-400">Loading member data…</p>}
      {error && <p className="text-sm text-rose-400">Error: {error.message}</p>}
      {data && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Contributions', value: data.contributions.length },
              { label: 'Active Loans', value: data.totals.activeLoansCount },
              { label: 'Loans Total', value: data.loans.length },
            ].map(({ label, value }) => (
              <div key={label} className="bg-slate-800/50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-slate-100">{value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
          <DownloadBtn
            document={<MemberStatementPdf data={data} />}
            fileName={`member-statement-${data.member.name.replace(/\s+/g, '-').toLowerCase()}.pdf`}
          />
        </div>
      )}
    </div>
  )
}

function LoanBookReport({ groupId }: { groupId: string }) {
  const { data, isLoading, error } = useLoanBookData(groupId)

  return (
    <div className="space-y-4">
      {isLoading && <p className="text-sm text-slate-400">Loading loan data…</p>}
      {error && <p className="text-sm text-rose-400">Error: {error.message}</p>}
      {data && (
        <div className="space-y-3">
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Total Loans', value: data.loans.length },
              { label: 'Active', value: data.loans.filter((l) => ['disbursed', 'repaying'].includes(l.status)).length },
              { label: 'Completed', value: data.totals.completedCount },
              { label: 'Defaulted', value: data.totals.defaultCount },
            ].map(({ label, value }) => (
              <div key={label} className="bg-slate-800/50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-slate-100">{value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
          <DownloadBtn
            document={<LoanBookPdf data={data} />}
            fileName={`loan-book-${data.group.name.replace(/\s+/g, '-').toLowerCase()}.pdf`}
          />
        </div>
      )}
    </div>
  )
}

const REPORT_TYPES: { id: ReportType; label: string; icon: React.ElementType; description: string }[] = [
  { id: 'cycle',  label: 'Cycle Summary',    icon: FileText,  description: 'Contribution overview for a specific period' },
  { id: 'member', label: 'Member Statement', icon: Users,     description: 'Individual contribution and loan history' },
  { id: 'loans',  label: 'Loan Book',        icon: BookOpen,  description: 'Full register of all group loans' },
]

export function ReportsTab({ groupId }: Props) {
  const [activeType, setActiveType] = useState<ReportType>('cycle')

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-100 mb-1">Generate Reports</h2>
        <p className="text-sm text-slate-400">Download PDF reports for this group.</p>
      </div>

      {/* Report type selector */}
      <div className="grid grid-cols-3 gap-3">
        {REPORT_TYPES.map(({ id, label, icon: Icon, description }) => (
          <button
            key={id}
            onClick={() => setActiveType(id)}
            className={`rounded-xl border p-4 text-left transition-colors ${
              activeType === id
                ? 'border-teal-500 bg-teal-500/10'
                : 'border-slate-700 bg-slate-800/40 hover:border-slate-600'
            }`}
          >
            <Icon className={`size-5 mb-2 ${activeType === id ? 'text-teal-400' : 'text-slate-400'}`} />
            <p className={`text-sm font-medium ${activeType === id ? 'text-slate-100' : 'text-slate-300'}`}>{label}</p>
            <p className="text-xs text-slate-500 mt-0.5">{description}</p>
          </button>
        ))}
      </div>

      {/* Report parameters + preview */}
      <div className="rounded-xl border border-slate-700 bg-slate-800/30 p-5">
        {activeType === 'cycle'  && <CycleReport  groupId={groupId} />}
        {activeType === 'member' && <MemberReport groupId={groupId} />}
        {activeType === 'loans'  && <LoanBookReport groupId={groupId} />}
      </div>
    </div>
  )
}
