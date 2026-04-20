import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import type { CycleSummaryData } from '@/types/domain.types'
import { formatCurrency, formatPeriod, formatDate } from '@/lib/formatters'

const S = StyleSheet.create({
  page:         { padding: 36, fontFamily: 'Helvetica', fontSize: 9, color: '#1e293b' },
  header:       { marginBottom: 20 },
  title:        { fontSize: 18, fontFamily: 'Helvetica-Bold', color: '#0f172a', marginBottom: 3 },
  subtitle:     { fontSize: 10, color: '#64748b' },
  meta:         { fontSize: 8, color: '#94a3b8', marginTop: 2 },

  kpiRow:       { flexDirection: 'row', gap: 8, marginBottom: 18 },
  kpiBox:       { flex: 1, backgroundColor: '#f8fafc', borderRadius: 4, padding: 10 },
  kpiLabel:     { fontSize: 7, color: '#64748b', marginBottom: 3, textTransform: 'uppercase' },
  kpiValue:     { fontSize: 13, fontFamily: 'Helvetica-Bold', color: '#0f172a' },
  kpiSub:       { fontSize: 7, color: '#94a3b8', marginTop: 2 },

  sectionTitle: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#334155', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },

  tableHeader:  { flexDirection: 'row', backgroundColor: '#1e293b', padding: '5 8', borderRadius: 3, marginBottom: 2 },
  tableRow:     { flexDirection: 'row', padding: '4 8', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', borderBottomStyle: 'solid' },
  tableRowAlt:  { flexDirection: 'row', padding: '4 8', backgroundColor: '#f8fafc', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', borderBottomStyle: 'solid' },
  thText:       { fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#e2e8f0' },
  tdText:       { fontSize: 8, color: '#374151' },

  colName:      { flex: 3 },
  colAmount:    { flex: 2, textAlign: 'right' },
  colStatus:    { flex: 1.5, textAlign: 'center' },

  footer:       { position: 'absolute', bottom: 24, left: 36, right: 36, flexDirection: 'row', justifyContent: 'space-between' },
  footerText:   { fontSize: 7, color: '#94a3b8' },
})

const STATUS_LABEL: Record<string, string> = {
  paid: 'Paid', partial: 'Partial', late: 'Late',
  pending: 'Pending', waived: 'Waived', defaulted: 'Defaulted', reversed: 'Reversed',
}

interface Props { data: CycleSummaryData }

export function CycleSummaryPdf({ data }: Props) {
  const { group, cyclePeriod, generatedAt, rows, totals } = data
  const cur = group.currency

  return (
    <Document>
      <Page size="A4" style={S.page}>

        {/* Header */}
        <View style={S.header}>
          <Text style={S.title}>{group.name}</Text>
          <Text style={S.subtitle}>Cycle Contribution Summary — {formatPeriod(cyclePeriod)}</Text>
          <Text style={S.meta}>Generated {formatDate(generatedAt)} · THEKA LANGA</Text>
        </View>

        {/* KPI boxes */}
        <View style={S.kpiRow}>
          <View style={S.kpiBox}>
            <Text style={S.kpiLabel}>Total Expected</Text>
            <Text style={S.kpiValue}>{formatCurrency(totals.expected, cur)}</Text>
          </View>
          <View style={S.kpiBox}>
            <Text style={S.kpiLabel}>Collected</Text>
            <Text style={S.kpiValue}>{formatCurrency(totals.collected, cur)}</Text>
          </View>
          <View style={S.kpiBox}>
            <Text style={S.kpiLabel}>Outstanding</Text>
            <Text style={S.kpiValue}>{formatCurrency(totals.outstanding, cur)}</Text>
          </View>
          <View style={S.kpiBox}>
            <Text style={S.kpiLabel}>Members</Text>
            <Text style={S.kpiValue}>{rows.length}</Text>
            <Text style={S.kpiSub}>{totals.membersPaid} paid · {totals.membersPartial} partial · {totals.membersOverdue} overdue</Text>
          </View>
        </View>

        {/* Table */}
        <Text style={S.sectionTitle}>Member Breakdown</Text>
        <View style={S.tableHeader}>
          <Text style={[S.thText, S.colName]}>Member</Text>
          <Text style={[S.thText, S.colAmount]}>Expected</Text>
          <Text style={[S.thText, S.colAmount]}>Paid</Text>
          <Text style={[S.thText, S.colAmount]}>Fine</Text>
          <Text style={[S.thText, S.colStatus]}>Status</Text>
        </View>
        {rows.map((r, i) => (
          <View key={r.memberId} style={i % 2 === 0 ? S.tableRow : S.tableRowAlt}>
            <Text style={[S.tdText, S.colName]}>{r.memberName}</Text>
            <Text style={[S.tdText, S.colAmount]}>{formatCurrency(r.expectedAmount, cur)}</Text>
            <Text style={[S.tdText, S.colAmount]}>{formatCurrency(r.paidAmount, cur)}</Text>
            <Text style={[S.tdText, S.colAmount]}>{r.fineAmount > 0 ? formatCurrency(r.fineAmount, cur) : '—'}</Text>
            <Text style={[S.tdText, S.colStatus]}>{STATUS_LABEL[r.status] ?? r.status}</Text>
          </View>
        ))}

        {/* Footer */}
        <View style={S.footer} fixed>
          <Text style={S.footerText}>THEKA LANGA · Confidential</Text>
          <Text style={S.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>

      </Page>
    </Document>
  )
}
