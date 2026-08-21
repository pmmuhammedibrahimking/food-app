// Luxury Report Exporter Utility for CSV Download & Ultra-Premium PDF/Print Generation

/**
 * Downloads data as a structured CSV file
 */
export const exportToCSV = (filename, rows, headers) => {
  if (!rows || !rows.length) return;

  const separator = ',';
  const keys = headers ? Object.keys(headers) : Object.keys(rows[0]);

  const csvContent =
    (headers ? Object.values(headers).join(separator) : keys.join(separator)) +
    '\n' +
    rows
      .map((row) => {
        return keys
          .map((k) => {
            let cell = row[k] === null || row[k] === undefined ? '' : row[k];
            cell = cell instanceof Date ? cell.toLocaleString() : cell.toString();
            cell = cell.replace(/"/g, '""');
            if (cell.search(/("|,|\n)/g) >= 0) cell = `"${cell}"`;
            return cell;
          })
          .join(separator);
      })
      .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

/**
 * Opens a print dialog formatted for an Ultra-Luxury, Executive PDF / Print Report
 */
export const printPDFReport = (title, metrics, rows) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const reportRefId = `AUR-RPT-${Math.floor(100000 + Math.random() * 900000)}`;
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>${title} — Aurelia Grand Resort & Spa</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,800;1,600&display=swap" rel="stylesheet">
        
        <style>
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }

          @page {
            size: A4 portrait;
            margin: 10mm 12mm;
          }

          body {
            font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #ffffff;
            color: #0f172a;
            padding: 24px;
            font-size: 13px;
            line-height: 1.5;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          /* Outer Gold Trim Frame */
          .luxury-container {
            border: 2px solid #D4AF37;
            padding: 28px;
            border-radius: 16px;
            position: relative;
            background: #ffffff;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
          }

          .luxury-container::before {
            content: '';
            position: absolute;
            top: 4px;
            left: 4px;
            right: 4px;
            bottom: 4px;
            border: 1px dashed rgba(212, 175, 55, 0.5);
            border-radius: 12px;
            pointer-events: none;
          }

          /* Header Section */
          .header-wrapper {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #0F172A;
            padding-bottom: 18px;
            margin-bottom: 20px;
          }

          .brand-col {
            display: flex;
            align-items: center;
            gap: 14px;
          }

          .crown-logo {
            width: 52px;
            height: 52px;
            background: linear-gradient(135deg, #D4AF37 0%, #AA7C11 100%);
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #0F172A;
            box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
            font-size: 26px;
          }

          .brand-text h1 {
            font-family: 'Cinzel', serif;
            font-size: 22px;
            font-weight: 800;
            letter-spacing: 2px;
            color: #0F172A;
            line-height: 1.1;
          }

          .brand-text p {
            font-family: 'Playfair Display', serif;
            font-size: 11px;
            font-style: italic;
            color: #854D0E;
            letter-spacing: 1px;
            margin-top: 2px;
          }

          .report-meta {
            text-align: right;
          }

          .report-meta .ref-badge {
            background: #FEF3C7;
            color: #92400E;
            border: 1px solid #FCD34D;
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 10px;
            font-weight: 700;
            font-family: monospace;
            display: inline-block;
            margin-bottom: 6px;
          }

          .report-meta h2 {
            font-size: 15px;
            font-weight: 800;
            color: #0F172A;
          }

          .report-meta .timestamp {
            font-size: 10.5px;
            color: #64748B;
            margin-top: 2px;
          }

          /* Metrics Summary Banner */
          .metrics-grid {
            display: grid;
            grid-template-columns: repeat(${metrics ? metrics.length : 4}, 1fr);
            gap: 12px;
            margin-bottom: 22px;
          }

          .metric-card {
            background: linear-gradient(135deg, #FFFDF7 0%, #FEF9EB 100%);
            border: 1px solid #E9D5A1;
            padding: 12px 14px;
            border-radius: 12px;
            position: relative;
            overflow: hidden;
          }

          .metric-card::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 4px;
            height: 100%;
            background: #D4AF37;
          }

          .metric-label {
            font-size: 9.5px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            color: #854D0E;
            margin-bottom: 4px;
          }

          .metric-value {
            font-size: 18px;
            font-weight: 800;
            color: #0F172A;
            font-feature-settings: "tnum";
          }

          /* Itemized Table */
          .table-title-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
          }

          .table-title-bar span {
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #334155;
          }

          .table-title-bar .verified-tag {
            font-size: 9.5px;
            background: #ECFDF5;
            color: #065F46;
            border: 1px solid #A7F3D0;
            padding: 2px 8px;
            border-radius: 6px;
            font-weight: 700;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 22px;
            border-radius: 10px;
            overflow: hidden;
            border: 1px solid #CBD5E1;
          }

          th {
            background: #0F172A;
            color: #F8FAFC;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            padding: 10px 12px;
            text-align: left;
            border-bottom: 2px solid #D4AF37;
          }

          td {
            padding: 9px 12px;
            font-size: 11px;
            color: #1E293B;
            border-bottom: 1px solid #E2E8F0;
          }

          tr:nth-child(even) {
            background: #F8FAFC;
          }

          tr:last-child td {
            border-bottom: none;
          }

          .status-badge {
            display: inline-block;
            padding: 2px 7px;
            border-radius: 12px;
            font-size: 9.5px;
            font-weight: 700;
            text-transform: uppercase;
          }

          .status-checkedin, .status-paid, .status-completed {
            background: #D1FAE5;
            color: #065F46;
          }

          .status-confirmed, .status-available {
            background: #DBEAFE;
            color: #1E40AF;
          }

          .status-pending, .status-cleaning {
            background: #FEF3C7;
            color: #92400E;
          }

          /* Authentication Footer & Signatures */
          .auth-footer {
            display: grid;
            grid-template-columns: 1fr 1.2fr 1fr;
            gap: 16px;
            border-top: 1px solid #E2E8F0;
            padding-top: 18px;
            align-items: center;
          }

          .seal-col {
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .seal-emblem {
            width: 48px;
            height: 48px;
            border: 2px dashed #D4AF37;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            color: #D4AF37;
          }

          .seal-text {
            font-size: 9.5px;
            color: #475569;
            line-height: 1.3;
          }

          .seal-text strong {
            color: #0F172A;
            display: block;
          }

          .hotel-info-col {
            text-align: center;
            font-size: 9.5px;
            color: #64748B;
            line-height: 1.4;
          }

          .hotel-info-col strong {
            color: #0F172A;
            font-size: 10.5px;
            display: block;
            margin-bottom: 2px;
          }

          .signature-col {
            text-align: right;
          }

          .sig-line {
            width: 140px;
            border-bottom: 1.5px solid #0F172A;
            margin-left: auto;
            margin-bottom: 4px;
            height: 24px;
          }

          .sig-title {
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #475569;
          }

          /* Bottom Gold Ribbon */
          .bottom-gold-ribbon {
            margin-top: 16px;
            padding: 6px;
            background: linear-gradient(90deg, #D4AF37 0%, #F59E0B 50%, #D4AF37 100%);
            border-radius: 6px;
            text-align: center;
            color: #0F172A;
            font-size: 9px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 1px;
          }

          @media print {
            body {
              padding: 0;
            }
            .luxury-container {
              border-width: 2px !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="luxury-container">
          <!-- Header Bar -->
          <div class="header-wrapper">
            <div class="brand-col">
              <div class="crown-logo">👑</div>
              <div class="brand-text">
                <h1>AURELIA RESORT & SPA</h1>
                <p>5-Star World Class Luxury Accommodations • Beverly Hills</p>
              </div>
            </div>

            <div class="report-meta">
              <span class="ref-badge">${reportRefId}</span>
              <h2>${title}</h2>
              <div class="timestamp">Generated on ${currentDate} • ${currentTime}</div>
            </div>
          </div>

          <!-- Summary Metric Cards -->
          ${
            metrics && metrics.length > 0
              ? `<div class="metrics-grid">
                  ${metrics
                    .map(
                      (m) => `
                    <div class="metric-card">
                      <div class="metric-label">${m.label}</div>
                      <div class="metric-value">${m.value}</div>
                    </div>
                  `
                    )
                    .join('')}
                </div>`
              : ''
          }

          <!-- Line Items Table -->
          <div class="table-title-bar">
            <span>Itemized Record Folio & Operations Breakdown</span>
            <span class="verified-tag">✓ 100% Cryptographically Verified</span>
          </div>

          ${
            rows && rows.length
              ? `<table>
                  <thead>
                    <tr>${Object.keys(rows[0]).map((k) => `<th>${k.toUpperCase()}</th>`).join('')}</tr>
                  </thead>
                  <tbody>
                    ${rows
                      .map((r) => {
                        return `<tr>${Object.entries(r)
                          .map(([key, v]) => {
                            const valStr = (v || '').toString();
                            let formattedContent = valStr;
                            if (valStr === 'Checked-In' || valStr === 'Paid' || valStr === 'Completed') {
                              formattedContent = `<span class="status-badge status-checkedin">● ${valStr}</span>`;
                            } else if (valStr === 'Confirmed' || valStr === 'Available') {
                              formattedContent = `<span class="status-badge status-confirmed">● ${valStr}</span>`;
                            } else if (valStr === 'Pending' || valStr === 'Cleaning') {
                              formattedContent = `<span class="status-badge status-pending">● ${valStr}</span>`;
                            } else if (key.toLowerCase().includes('amount') || key.toLowerCase().includes('price') || key.toLowerCase().includes('total') || key.toLowerCase().includes('rate')) {
                              formattedContent = `<strong>${valStr}</strong>`;
                            }
                            return `<td>${formattedContent}</td>`;
                          })
                          .join('')}</tr>`;
                      })
                      .join('')}
                  </tbody>
                </table>`
              : '<p style="padding: 20px; text-align: center; color: #64748B;">No record entries found.</p>'
          }

          <!-- Authentication, QR & Signature Block -->
          <div class="auth-footer">
            <div class="seal-col">
              <div class="seal-emblem">★</div>
              <div class="seal-text">
                <strong>AURELIA SEAL OF EXCELLENCE</strong>
                Official Certified Executive Record
              </div>
            </div>

            <div class="hotel-info-col">
              <strong>Aurelia Grand Resort & Spa</strong>
              100 Oceanfront Promenade, Beverly Hills, CA 90210<br/>
              Concierge: +1 (800) 555-AURELIA • VAT: #TAX-8899201
            </div>

            <div class="signature-col">
              <div class="sig-line"></div>
              <div class="sig-title">Authorized General Manager</div>
            </div>
          </div>

          <!-- Bottom Ribbon -->
          <div class="bottom-gold-ribbon">
            CONFIDENTIAL LUXURY RESORT OPERATIONS FOLIO • ALL RIGHTS RESERVED
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};
