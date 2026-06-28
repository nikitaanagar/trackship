export const downloadInvoicePDF = (booking) => {
  const printWindow = window.open('', '_blank', 'width=800,height=900');
  if (!printWindow) {
    alert('Please allow popups to download/print the invoice.');
    return;
  }
  
  const total = booking.payment.amount;
  const subtotal = (total / 1.18).toFixed(2);
  const gst = (total - subtotal).toFixed(2);
  const qrCodeHtml = booking.qrCode 
    ? `<img src="${booking.qrCode}" style="width: 120px; height: 120px; border: 1px solid #e2e8f0; padding: 4px; border-radius: 8px;" />`
    : `<img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${booking.trackingId}" style="width: 120px; height: 120px; border: 1px solid #e2e8f0; padding: 4px; border-radius: 8px;" />`;

  const dateStr = new Date(booking.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
  
  const paidDateStr = booking.payment.paidAt 
    ? new Date(booking.payment.paidAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Pending';

  const htmlContent = `
    <html>
      <head>
        <title>Tax Invoice - ${booking.trackingId}</title>
        <style>
          body {
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            color: #0F172A;
            margin: 0;
            padding: 40px;
            background: #ffffff;
            -webkit-print-color-adjust: exact;
          }
          .invoice-container {
            max-width: 700px;
            margin: 0 auto;
            border: 1px solid #e2e8f0;
            padding: 30px;
            border-radius: 12px;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #f1f5f9;
            padding-bottom: 20px;
            margin-bottom: 25px;
          }
          .logo {
            font-size: 24px;
            font-weight: 800;
            color: #2563EB;
          }
          .title {
            text-align: right;
          }
          .title h1 {
            margin: 0;
            font-size: 22px;
            color: #0F172A;
          }
          .title p {
            margin: 4px 0 0 0;
            font-size: 12px;
            color: #64748B;
          }
          .details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
            font-size: 13px;
          }
          .details-box h3 {
            margin: 0 0 8px 0;
            font-size: 11px;
            color: #64748B;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .details-box p {
            margin: 3px 0;
            line-height: 1.4;
          }
          .table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
            font-size: 13px;
          }
          .table th {
            background: #f8fafc;
            text-align: left;
            padding: 10px 12px;
            color: #475569;
            border-bottom: 1px solid #e2e8f0;
            font-weight: 600;
          }
          .table td {
            padding: 12px;
            border-bottom: 1px solid #f1f5f9;
          }
          .totals {
            margin-left: auto;
            width: 250px;
            margin-bottom: 30px;
            font-size: 13px;
          }
          .totals-row {
            display: flex;
            justify-content: space-between;
            padding: 6px 0;
          }
          .totals-row.grand {
            border-top: 1px solid #e2e8f0;
            padding-top: 10px;
            font-weight: 700;
            font-size: 16px;
            color: #2563EB;
          }
          .footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-top: 1px solid #e2e8f0;
            padding-top: 20px;
            margin-top: 40px;
            font-size: 11px;
            color: #64748B;
          }
          .footer-text {
            max-width: 400px;
          }
          @media print {
            body {
              padding: 0;
            }
            .invoice-container {
              border: none;
              padding: 0;
            }
            .no-print {
              display: none;
            }
          }
          .print-btn-container {
            text-align: center;
            margin-bottom: 20px;
          }
          .print-btn {
            background-color: #2563EB;
            color: white;
            border: none;
            padding: 10px 20px;
            font-size: 14px;
            font-weight: 600;
            border-radius: 8px;
            cursor: pointer;
            box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
            transition: background-color 0.2s;
          }
          .print-btn:hover {
            background-color: #1d4ed8;
          }
        </style>
      </head>
      <body>
        <div class="print-btn-container no-print">
          <button class="print-btn" onclick="window.print()">Download / Save PDF</button>
        </div>
        <div class="invoice-container">
          <div class="header">
            <div class="logo">TrackShip</div>
            <div class="title">
              <h1>TAX INVOICE</h1>
              <p>Booking ID: ${booking.trackingId}</p>
            </div>
          </div>
          
          <div class="details-grid">
            <div class="details-box">
              <h3>Sender Details</h3>
              <p><strong>Name:</strong> ${booking.sender?.name || 'Customer'}</p>
              <p><strong>Email:</strong> ${booking.sender?.email || 'N/A'}</p>
              <p><strong>Address:</strong> ${booking.pickupAddress.street}, ${booking.pickupAddress.city}, ${booking.pickupAddress.state} - ${booking.pickupAddress.pincode}</p>
            </div>
            <div class="details-box">
              <h3>Recipient Details</h3>
              <p><strong>Name:</strong> ${booking.recipient?.name}</p>
              <p><strong>Phone:</strong> ${booking.recipient?.phone}</p>
              <p><strong>Address:</strong> ${booking.recipient?.address?.street}, ${booking.recipient?.address?.city}, ${booking.recipient?.address?.state} - ${booking.recipient?.address?.pincode}</p>
            </div>
          </div>

          <div class="details-grid" style="background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; grid-template-columns: 1.2fr 0.8fr;">
            <div class="details-box">
              <h3>Payment Details</h3>
              <p><strong>Method:</strong> ${booking.payment.method === 'online' ? 'Pay Now (Razorpay)' : 'Pay on Delivery (UPI)'}</p>
              <p><strong>Payment Status:</strong> <span style="color: ${booking.payment.status === 'paid' ? '#16A34A' : '#D97706'}">${booking.payment.status.toUpperCase()}</span></p>
              <p><strong>Payment ID:</strong> ${booking.payment.transactionId || 'N/A'}</p>
              <p><strong>Payment Date:</strong> ${paidDateStr}</p>
            </div>
            <div class="details-box" style="text-align: right; display: flex; flex-direction: column; align-items: flex-end; justify-content: center;">
              ${qrCodeHtml}
              <p style="font-size: 10px; margin-top: 5px; color: #64748B; margin-bottom: 0;">Scan to track parcel</p>
            </div>
          </div>

          <table class="table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Category</th>
                <th>Weight</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Courier Booking (Tracking ID: ${booking.trackingId})</td>
                <td style="text-transform: capitalize;">${booking.parcel.category}</td>
                <td>${booking.parcel.weight} kg</td>
                <td style="text-align: right;">₹${subtotal}</td>
              </tr>
            </tbody>
          </table>

          <div class="totals">
            <div class="totals-row">
              <span>Subtotal:</span>
              <span>₹${subtotal}</span>
            </div>
            <div class="totals-row">
              <span>GST (18%):</span>
              <span>₹${gst}</span>
            </div>
            <div class="totals-row grand">
              <span>Total Paid:</span>
              <span>₹${total}</span>
            </div>
          </div>

          <div class="footer">
            <div class="footer-text">
              <strong>Thank you for shipping with TrackShip!</strong><br />
              This is a computer-generated tax invoice and does not require a physical signature. For support, contact support@trackship.com.
            </div>
            <div style="text-align: right;">
              Invoice Date: ${dateStr}
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};
