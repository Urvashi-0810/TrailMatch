import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import type { ApiResponse } from "./api"

// Color palette
const PRIMARY = [29, 78, 216] as const   // blue-700
const DARK = [15, 23, 42] as const       // slate-900
const MUTED = [100, 116, 139] as const   // slate-500
const GREEN = [22, 163, 74] as const     // green-600
const ORANGE = [234, 88, 12] as const    // orange-600
const WHITE = [255, 255, 255] as const   // white
const LIGHT_BG = [241, 245, 249] as const // slate-100

function setColor(doc: jsPDF, color: readonly [number, number, number]) {
  doc.setTextColor(color[0], color[1], color[2])
}

function drawSectionHeader(doc: jsPDF, title: string, y: number): number {
  if (y > 260) {
    doc.addPage()
    y = 20
  }
  doc.setFillColor(PRIMARY[0], PRIMARY[1], PRIMARY[2])
  doc.rect(14, y, 182, 9, "F")
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  setColor(doc, WHITE)
  doc.text(title, 18, y + 6.5)
  setColor(doc, DARK)
  return y + 14
}

function drawKeyValue(doc: jsPDF, key: string, value: string, x: number, y: number): number {
  doc.setFontSize(8)
  doc.setFont("helvetica", "normal")
  setColor(doc, MUTED)
  doc.text(key, x, y)
  doc.setFontSize(10)
  doc.setFont("helvetica", "bold")
  setColor(doc, DARK)
  doc.text(value, x, y + 5)
  return y + 12
}

function wrapText(doc: jsPDF, text: string, x: number, y: number, maxWidth: number, fontSize: number = 9): number {
  doc.setFontSize(fontSize)
  doc.setFont("helvetica", "normal")
  setColor(doc, DARK)
  const lines = doc.splitTextToSize(text, maxWidth) as string[]
  for (const line of lines) {
    if (y > 275) {
      doc.addPage()
      y = 20
    }
    doc.text(line, x, y)
    y += fontSize * 0.45 + 1
  }
  return y + 2
}

function drawBulletList(doc: jsPDF, items: string[], x: number, startY: number, maxWidth: number): number {
  let y = startY
  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  setColor(doc, DARK)
  for (const item of items) {
    if (y > 275) {
      doc.addPage()
      y = 20
    }
    doc.text("•", x, y)
    const lines = doc.splitTextToSize(item, maxWidth - 6) as string[]
    for (const line of lines) {
      if (y > 275) {
        doc.addPage()
        y = 20
      }
      doc.text(line, x + 5, y)
      y += 4.5
    }
  }
  return y + 1
}

export function generateReportPdf(
  data: ApiResponse,
  selectedSections: string[],
  includePersonalInfo: boolean
) {
  const doc = new jsPDF("p", "mm", "a4")
  const pageWidth = doc.internal.pageSize.getWidth()
  const { patient, report, trial_matches, processing_time_ms, workflow_id } = data

  // ─── COVER PAGE ───────────────────────────────────────────
  // Top accent bar
  doc.setFillColor(PRIMARY[0], PRIMARY[1], PRIMARY[2])
  doc.rect(0, 0, pageWidth, 4, "F")

  // Logo / title block
  doc.setFillColor(LIGHT_BG[0], LIGHT_BG[1], LIGHT_BG[2])
  doc.rect(14, 30, 182, 50, "F")

  doc.setFontSize(28)
  doc.setFont("helvetica", "bold")
  setColor(doc, PRIMARY)
  doc.text("TrialMatch AI", 24, 50)

  doc.setFontSize(14)
  doc.setFont("helvetica", "normal")
  setColor(doc, MUTED)
  doc.text("Clinical Trial & Treatment Matching Report", 24, 60)

  doc.setFontSize(9)
  setColor(doc, MUTED)
  doc.text(`Report ID: ${report.report_id}`, 24, 70)
  doc.text(`Workflow: ${workflow_id}`, 100, 70)

  // Patient info section
  let y = 100
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  setColor(doc, DARK)
  doc.text("Patient Information", 14, y)

  doc.setDrawColor(PRIMARY[0], PRIMARY[1], PRIMARY[2])
  doc.setLineWidth(0.5)
  doc.line(14, y + 2, 80, y + 2)
  y += 10

  drawKeyValue(doc, "Patient ID", includePersonalInfo ? patient.patient_id : "Redacted", 14, y)
  drawKeyValue(doc, "Age", `${patient.age} years`, 100, y)
  y += 14
  drawKeyValue(doc, "Gender", patient.gender, 14, y)
  drawKeyValue(doc, "Conditions", patient.conditions.join(", ") || "None", 100, y)
  y += 14
  drawKeyValue(doc, "Medications", patient.medications.join(", ") || "None", 14, y)
  y += 14
  drawKeyValue(doc, "Allergies", patient.allergies.join(", ") || "None", 14, y)
  y += 14

  // Metadata
  doc.setFillColor(LIGHT_BG[0], LIGHT_BG[1], LIGHT_BG[2])
  doc.roundedRect(14, y, 182, 20, 2, 2, "F")
  doc.setFontSize(8)
  setColor(doc, MUTED)
  doc.text(`Generated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`, 20, y + 8)
  doc.text(`Processing Time: ${(processing_time_ms / 1000).toFixed(1)}s`, 20, y + 14)
  doc.text(`Matched Trials: ${trial_matches.length}`, 120, y + 8)
  doc.text("Format: PDF/A", 120, y + 14)

  // Disclaimer at bottom of cover
  doc.setFontSize(7)
  setColor(doc, MUTED)
  doc.text(
    "This report is AI-generated and for informational purposes only. Consult qualified healthcare professionals before making medical decisions.",
    14,
    280
  )

  // Bottom accent bar on cover
  doc.setFillColor(PRIMARY[0], PRIMARY[1], PRIMARY[2])
  doc.rect(0, 293, pageWidth, 4, "F")

  // ─── EXECUTIVE SUMMARY PAGE ───────────────────────────────
  if (selectedSections.includes("summary")) {
    doc.addPage()
    y = 20
    y = drawSectionHeader(doc, "EXECUTIVE SUMMARY", y)
    y = wrapText(doc, report.executive_summary, 14, y, 182)
    y += 4

    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")
    setColor(doc, DARK)
    doc.text("Patient Summary", 14, y)
    y += 5
    y = wrapText(doc, report.patient_summary, 14, y, 182)
  }

  // ─── CLINICAL TRIAL MATCHES ───────────────────────────────
  if (selectedSections.includes("trials") && trial_matches.length > 0) {
    doc.addPage()
    y = 20
    y = drawSectionHeader(doc, "CLINICAL TRIAL MATCHES", y)

    // Summary table
    const tableData = trial_matches.map((t) => [
      t.trial_id,
      t.trial_name.length > 50 ? t.trial_name.substring(0, 47) + "..." : t.trial_name,
      t.phase,
      `${Math.round(t.match_score * 100)}%`,
      t.location,
    ])

    autoTable(doc, {
      startY: y,
      head: [["Trial ID", "Name", "Phase", "Match", "Location"]],
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: [PRIMARY[0], PRIMARY[1], PRIMARY[2]],
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: "bold",
      },
      bodyStyles: { fontSize: 7.5 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 14, right: 14 },
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = (doc as any).lastAutoTable?.finalY ?? y + 40
    y += 8

    // Detailed trial cards
    for (const trial of trial_matches) {
      if (y > 220) {
        doc.addPage()
        y = 20
      }

      // Trial card background
      doc.setFillColor(LIGHT_BG[0], LIGHT_BG[1], LIGHT_BG[2])
      doc.roundedRect(14, y, 182, 10, 2, 2, "F")

      doc.setFontSize(10)
      doc.setFont("helvetica", "bold")
      setColor(doc, PRIMARY)
      doc.text(`${trial.trial_id} — ${trial.phase}`, 18, y + 7)

      const matchPct = `${Math.round(trial.match_score * 100)}% Match`
      doc.setFontSize(10)
      doc.setFont("helvetica", "bold")
      setColor(doc, GREEN)
      doc.text(matchPct, 170, y + 7)

      y += 14

      doc.setFontSize(10)
      doc.setFont("helvetica", "bold")
      setColor(doc, DARK)
      doc.text(trial.trial_name, 14, y, { maxWidth: 182 })
      const nameLines = doc.splitTextToSize(trial.trial_name, 182) as string[]
      y += nameLines.length * 5 + 2

      // Study summary
      y = wrapText(doc, trial.details.study_summary, 14, y, 182)
      y += 2

      // Key details in two columns
      drawKeyValue(doc, "Intervention", trial.details.intervention, 14, y)
      drawKeyValue(doc, "Duration", trial.details.trial_duration, 100, y)
      y += 14
      drawKeyValue(doc, "Location", trial.location, 14, y)
      drawKeyValue(doc, "Sponsor", trial.sponsor, 100, y)
      y += 14

      // Eligibility criteria
      if (trial.eligibility.matched_criteria.length > 0) {
        doc.setFontSize(9)
        doc.setFont("helvetica", "bold")
        setColor(doc, GREEN)
        doc.text("✓ Matched Criteria", 14, y)
        y += 5
        y = drawBulletList(doc, trial.eligibility.matched_criteria, 18, y, 170)
      }

      if (trial.eligibility.requires_verification.length > 0) {
        doc.setFontSize(9)
        doc.setFont("helvetica", "bold")
        setColor(doc, ORANGE)
        doc.text("⚠ Requires Verification", 14, y)
        y += 5
        y = drawBulletList(doc, trial.eligibility.requires_verification, 18, y, 170)
      }

      // Side effects
      if (trial.risks.side_effects.length > 0) {
        doc.setFontSize(9)
        doc.setFont("helvetica", "bold")
        setColor(doc, ORANGE)
        doc.text("Side Effects:", 14, y)
        doc.setFont("helvetica", "normal")
        setColor(doc, DARK)
        doc.text(trial.risks.side_effects.join(", "), 44, y)
        y += 6
      }

      // Separator
      doc.setDrawColor(220, 220, 220)
      doc.setLineWidth(0.2)
      doc.line(14, y, 196, y)
      y += 6
    }
  }

  // ─── CONDITIONS ───────────────────────────────────────────
  if (selectedSections.includes("conditions")) {
    doc.addPage()
    y = 20
    y = drawSectionHeader(doc, "MEDICAL CONDITIONS & ANALYSIS", y)

    y = wrapText(doc, report.patient_summary, 14, y, 182)
    y += 6

    if (patient.conditions.length > 0) {
      doc.setFontSize(10)
      doc.setFont("helvetica", "bold")
      setColor(doc, DARK)
      doc.text("Identified Conditions", 14, y)
      y += 6
      y = drawBulletList(doc, patient.conditions, 18, y, 170)
    }

    if (patient.medications.length > 0) {
      y += 4
      doc.setFontSize(10)
      doc.setFont("helvetica", "bold")
      setColor(doc, DARK)
      doc.text("Current Medications", 14, y)
      y += 6
      y = drawBulletList(doc, patient.medications, 18, y, 170)
    }

    if (patient.allergies.length > 0) {
      y += 4
      doc.setFontSize(10)
      doc.setFont("helvetica", "bold")
      setColor(doc, ORANGE)
      doc.text("Known Allergies", 14, y)
      y += 6
      y = drawBulletList(doc, patient.allergies, 18, y, 170)
    }
  }

  // ─── RISK SUMMARY ────────────────────────────────────────
  if (selectedSections.includes("treatments")) {
    doc.addPage()
    y = 20
    y = drawSectionHeader(doc, "RISK SUMMARY & TREATMENT CONSIDERATIONS", y)
    y = wrapText(doc, report.risk_summary, 14, y, 182)
  }

  // ─── RECOMMENDATIONS TIMELINE ────────────────────────────
  if (selectedSections.includes("timeline")) {
    doc.addPage()
    y = 20
    y = drawSectionHeader(doc, "RECOMMENDATIONS & NEXT STEPS", y)

    for (const rec of report.trial_recommendations) {
      if (y > 260) {
        doc.addPage()
        y = 20
      }

      // Recommendation badge
      doc.setFillColor(GREEN[0], GREEN[1], GREEN[2])
      doc.roundedRect(14, y, 42, 6, 1, 1, "F")
      doc.setFontSize(7)
      doc.setFont("helvetica", "bold")
      setColor(doc, WHITE)
      doc.text(rec.recommendation, 16, y + 4.5)

      doc.setFontSize(9)
      doc.setFont("helvetica", "bold")
      setColor(doc, DARK)
      doc.text(`${rec.trial_id} — ${rec.trial_name}`, 60, y + 4.5, { maxWidth: 136 })
      y += 10

      doc.setFontSize(9)
      doc.setFont("helvetica", "normal")
      setColor(doc, MUTED)
      y = wrapText(doc, rec.rationale, 14, y, 182)
      y += 4
    }

    // Conclusion
    y += 6
    if (y > 240) {
      doc.addPage()
      y = 20
    }
    y = drawSectionHeader(doc, "CONCLUSION", y)
    y = wrapText(doc, report.conclusion, 14, y, 182)
  }

  // ─── PAGE NUMBERS ─────────────────────────────────────────
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(7)
    setColor(doc, MUTED)
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      289,
      { align: "center" }
    )
    doc.text("TrialMatch AI — Confidential", 14, 289)
    doc.text(report.report_id, pageWidth - 14, 289, { align: "right" })
  }

  // Save
  doc.save(`TrialMatch_Report_${report.report_id}.pdf`)
}
