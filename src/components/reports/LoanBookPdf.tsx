import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import type { LoanBookData } from '@/types/domain.types'
import { formatCurrency, formatDate } from '@/lib/formatters'

const S = StyleSheet.create({
  page:         { padding: 36, fontFamily: 'Helvetica', fontSize: 9, color: '#1e293b' },
  header:       { marginBottom: 18 },
  title:        { fontSize: 16, fontFamily: 'Helvetica-Bold', color: '#0f172a', marginBottom: 3 },
  subtitle:     { fontSize: 10, color: '#64748b' },
  meta:         { fontSize: 8, color: '#94a3b8', marginTop: 2 },

  kpiRow:       { flexDirection: 'row', gap: 8, marginBottom: 18 },
  kpiBox:       { flex: 1, backgroundColor: '#f8fafc', borderRadius: 4, padding: 10 },
  kpiLabel:     { fontSize: 7, color: '#64748b', marginBottom: 3, textTransform: 'uppercase' },
  kpiValue:     { fontSize: 13, fontFamily: 'Helvetica-Bold', color: '#0f172a' },

  sectionTitle: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#334155', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },

  tableHeader:  { flexDirection: 'row', backgroundColor: '#1e293b', padding: '5 8', borderRadius: 3, marginBottom: 2 },
  tableRow:     { flexDirection: 'row', padding: '4 8', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', borderBottomStyle: 'solid' },
  tableRowAlt:  { flexDirection: 'row', padding: '4 8', backgroundColor: '#f8fafc', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', borderBottomStyle: 'solid' },
  thText:       { fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#e2e8f0' },
  tdText:       { fontSize: 8, color: '#374151' },

  colBorrower:  { flex: 3 },
  colDate:      { flex: 2 },
  colPrincipal: { flex: 2.5, textAlign: 'right' },
  colRepaid:    { flex: 2.5, textAlign: 'right' },
  colOutstanding:{ flex: 2.5, textAlign: 'right' },
  colRate:      { flex: 1.5, textAlign: 'center' },
  colStatus:    { flex: 2, textAlign: 'center' },

  footer:       { position: 'absolute', bottom: 24, left: 36, right: 36, flexDirection: 'row', justifyContent: 'space-between' },
  footerText:   { fontSize: 7, color: '#94a3b8' },
})

const STATUS_LABEL: Record<string, string> = {
  applied: 'Applied', under_review: 'Review', approved: 'Approved', rejected: 'Rejected',
  disbursed: 'Disbursed', repaying: 'Repaying', completed: 'Completed',
  defaulted: 'Defaulted', written_off: 'Written Off',
}

interface Props { data: LoanBookData }

export function LoanBookPdf({ data }: Props) {
  const { group, generatedAt, loans, totals } = data
  const cur = group.currency

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={S.page}>

        {/* Header */}
        <View style={S.header}>
          <Text style={S.title}>{group.name} — Loan Book</Text>
          <Text style={S.subtitle}>All loans as of {formatDate(generatedAt)}</Text>
          <Text style={S.meta}>Generated {formatDate(generatedAt)} · THEKA LANGA</Text>
        </View>

        {/* KPI boxes */}
        <View style={S.kpiRow}>
          <View style={S.kpiBox}>
            <Text style={S.kpiLabel}>Active Principal</Text>
            <Text style={S.kpiValue}>{formatCurrency(totals.activePrincipal, cur)}</Text>
          </View>
          <View style={S.kpiBox}>
            <Text style={S.kpiLabel}>Outstanding Balance</Text>
            <Text style={S.kpiValue}>{formatCurrency(totals.activeOutstanding, cur)}</Text>
          </View>
          <View style={S.kpiBox}>
            <Text style={S.kpiLabel}>Total Loans</Text>
            <Text style={S.kpiValue}>{loans.length}</Text>
          </View>
          <View style={S.kpiBox}>
            <Text style={S.kpiLabel}>Completed</Text>
            <Text style={S.kpiValue}>{totals.completedCount}</Text>
          </View>
          <View style={S.kpiBox}>
            <Text style={S.kpiLabel}>Defaults</Text>
            <Text style={S.kpiValue}>{totals.defaultCount}</Text>
          </View>
        </View>

        {/* Table */}
        <Text style={S.sectionTitle}>Loan Register ({loans.length} entries)</Text>
        <View style={S.tableHeader}>
          <Text style={[S.thText, S.colBorrower]}>Borrower</Text>
          <Text style={[S.thText, S.colDate]}>Applied</Text>
          <Text style={[S.thText, S.colPrincipal]}>Principal</Text>
          <Text style={[S.thText, S.colRepaid]}>Repaid</Text>
          <Text style={[S.thText, S.colOutstanding]}>Outstanding</Text>
          <Text style={[S.thText, S.colRate]}>Rate %</Text>
          <Text style={[S.thText, S.colStatus]}>Status</Text>
        </View>
        {loans.map((l, i) => (
          <View key={l.borrowerName + l.appliedAt + i} style={i % 2 === 0 ? S.tableRow : S.tableRowAlt}>
            <Text style={[S.tdText, S.colBorrower]}>{l.borrowerName}</Text>
            <Text style={[S.tdText, S.colDate]}>{formatDate(l.appliedAt)}</Text>
            <Text style={[S.tdText, S.colPrincipal]}>{formatCurrency(l.principal, cur)}</Text>
            <Text style={[S.tdText, S.colRepaid]}>{formatCurrency(l.amountRepaid, cur)}</Text>
            <Text style={[S.tdText, S.colOutstanding]}>{formatCurrency(l.outstanding, cur)}</Text>
            <Text style={[S.tdText, S.colRate]}>{l.interestRate.toFixed(1)}%</Text>
            <Text style={[S.tdText, S.colStatus]}>{STATUS_LABEL[l.status] ?? l.status}</Text>
          </View>
        ))}
        {loans.length === 0 && (
          <Text style={{ fontSize: 8, color: '#94a3b8', padding: '8 8' }}>No loans found for this group.</Text>
        )}

        {/* Footer */}
        <View style={S.footer} fixed>
          <Text style={S.footerText}>THEKA LANGA · Confidential · {group.name}</Text>
          <Text style={S.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>

      </Page>
    </Document>
  )
}
