import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import type { MemberStatementData } from '@/types/domain.types'
import { formatCurrency, formatDate, formatPeriod } from '@/lib/formatters'

const S = StyleSheet.create({
  page:         { padding: 36, fontFamily: 'Helvetica', fontSize: 9, color: '#1e293b' },
  header:       { marginBottom: 16 },
  title:        { fontSize: 16, fontFamily: 'Helvetica-Bold', color: '#0f172a', marginBottom: 3 },
  subtitle:     { fontSize: 10, color: '#64748b' },
  meta:         { fontSize: 8, color: '#94a3b8', marginTop: 2 },

  infoRow:      { flexDirection: 'row', gap: 8, marginBottom: 16 },
  infoBox:      { flex: 1, backgroundColor: '#f8fafc', borderRadius: 4, padding: 10 },
  infoLabel:    { fontSize: 7, color: '#64748b', marginBottom: 3, textTransform: 'uppercase' },
  infoValue:    { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#0f172a' },

  sectionTitle: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#334155', marginBottom: 6, marginTop: 14, textTransform: 'uppercase', letterSpacing: 0.5 },

  tableHeader:  { flexDirection: 'row', backgroundColor: '#1e293b', padding: '5 8', borderRadius: 3, marginBottom: 2 },
  tableRow:     { flexDirection: 'row', padding: '4 8', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', borderBottomStyle: 'solid' },
  tableRowAlt:  { flexDirection: 'row', padding: '4 8', backgroundColor: '#f8fafc', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', borderBottomStyle: 'solid' },
  thText:       { fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#e2e8f0' },
  tdText:       { fontSize: 8, color: '#374151' },

  colPeriod:    { flex: 2 },
  colDue:       { flex: 2 },
  colAmount:    { flex: 2, textAlign: 'right' },
  colStatus:    { flex: 1.5, textAlign: 'center' },

  colLoanDate:  { flex: 2 },
  colPrincipal: { flex: 2, textAlign: 'right' },
  colRepaid:    { flex: 2, textAlign: 'right' },
  colOutstanding:{ flex: 2, textAlign: 'right' },
  colLoanStatus:{ flex: 2, textAlign: 'center' },

  footer:       { position: 'absolute', bottom: 24, left: 36, right: 36, flexDirection: 'row', justifyContent: 'space-between' },
  footerText:   { fontSize: 7, color: '#94a3b8' },
})

const STATUS_LABEL: Record<string, string> = {
  paid: 'Paid', partial: 'Partial', late: 'Late',
  pending: 'Pending', waived: 'Waived', defaulted: 'Defaulted', reversed: 'Reversed',
  applied: 'Applied', under_review: 'Review', approved: 'Approved', rejected: 'Rejected',
  disbursed: 'Disbursed', repaying: 'Repaying', completed: 'Completed', written_off: 'Written Off',
}

const BAND_LABEL: Record<string, string> = {
  excellent: 'Excellent', good: 'Good', fair: 'Fair', poor: 'Poor', high_risk: 'High Risk',
}

interface Props { data: MemberStatementData }

export function MemberStatementPdf({ data }: Props) {
  const { group, member, generatedAt, contributions, loans, totals } = data
  const cur = group.currency

  return (
    <Document>
      <Page size="A4" style={S.page}>

        {/* Header */}
        <View style={S.header}>
          <Text style={S.title}>{member.name}</Text>
          <Text style={S.subtitle}>Member Statement — {group.name}</Text>
          <Text style={S.meta}>Generated {formatDate(generatedAt)} · THEKA LANGA</Text>
        </View>

        {/* Summary boxes */}
        <View style={S.infoRow}>
          <View style={S.infoBox}>
            <Text style={S.infoLabel}>Total Contributed</Text>
            <Text style={S.infoValue}>{formatCurrency(totals.totalContributed, cur)}</Text>
          </View>
          <View style={S.infoBox}>
            <Text style={S.infoLabel}>Active Loans</Text>
            <Text style={S.infoValue}>{totals.activeLoansCount}</Text>
          </View>
          <View style={S.infoBox}>
            <Text style={S.infoLabel}>Loan Outstanding</Text>
            <Text style={S.infoValue}>{formatCurrency(totals.loanOutstanding, cur)}</Text>
          </View>
          <View style={S.infoBox}>
            <Text style={S.infoLabel}>Credit Score</Text>
            <Text style={S.infoValue}>{member.creditScore}</Text>
            <Text style={{ fontSize: 7, color: '#64748b', marginTop: 2 }}>{BAND_LABEL[member.creditScoreBand] ?? member.creditScoreBand}</Text>
          </View>
        </View>

        {/* Contributions table */}
        <Text style={S.sectionTitle}>Contribution History ({contributions.length} records)</Text>
        <View style={S.tableHeader}>
          <Text style={[S.thText, S.colPeriod]}>Period</Text>
          <Text style={[S.thText, S.colDue]}>Due Date</Text>
          <Text style={[S.thText, S.colAmount]}>Expected</Text>
          <Text style={[S.thText, S.colAmount]}>Paid</Text>
          <Text style={[S.thText, S.colAmount]}>Fine</Text>
          <Text style={[S.thText, S.colStatus]}>Status</Text>
        </View>
        {contributions.map((c, i) => (
          <View key={`${c.cyclePeriod}-${c.dueDate}`} style={i % 2 === 0 ? S.tableRow : S.tableRowAlt}>
            <Text style={[S.tdText, S.colPeriod]}>{formatPeriod(c.cyclePeriod)}</Text>
            <Text style={[S.tdText, S.colDue]}>{formatDate(c.dueDate)}</Text>
            <Text style={[S.tdText, S.colAmount]}>{formatCurrency(c.expectedAmount, cur)}</Text>
            <Text style={[S.tdText, S.colAmount]}>{formatCurrency(c.paidAmount, cur)}</Text>
            <Text style={[S.tdText, S.colAmount]}>{c.fineAmount > 0 ? formatCurrency(c.fineAmount, cur) : '—'}</Text>
            <Text style={[S.tdText, S.colStatus]}>{STATUS_LABEL[c.status] ?? c.status}</Text>
          </View>
        ))}
        {contributions.length === 0 && (
          <Text style={{ fontSize: 8, color: '#94a3b8', padding: '8 8' }}>No contribution records found.</Text>
        )}

        {/* Loans table */}
        {loans.length > 0 && (
          <>
            <Text style={S.sectionTitle}>Loan History ({loans.length} loans)</Text>
            <View style={S.tableHeader}>
              <Text style={[S.thText, S.colLoanDate]}>Applied</Text>
              <Text style={[S.thText, S.colPrincipal]}>Principal</Text>
              <Text style={[S.thText, S.colRepaid]}>Repaid</Text>
              <Text style={[S.thText, S.colOutstanding]}>Outstanding</Text>
              <Text style={[S.thText, S.colLoanStatus]}>Status</Text>
            </View>
            {loans.map((l, i) => (
              <View key={l.appliedAt + i} style={i % 2 === 0 ? S.tableRow : S.tableRowAlt}>
                <Text style={[S.tdText, S.colLoanDate]}>{formatDate(l.appliedAt)}</Text>
                <Text style={[S.tdText, S.colPrincipal]}>{formatCurrency(l.principal, cur)}</Text>
                <Text style={[S.tdText, S.colRepaid]}>{formatCurrency(l.amountRepaid, cur)}</Text>
                <Text style={[S.tdText, S.colOutstanding]}>{formatCurrency(l.outstanding, cur)}</Text>
                <Text style={[S.tdText, S.colLoanStatus]}>{STATUS_LABEL[l.status] ?? l.status}</Text>
              </View>
            ))}
          </>
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
