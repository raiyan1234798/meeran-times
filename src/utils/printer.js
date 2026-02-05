/**
 * Generate Thermal Printer Friendly HTML
 * @param {Object} billDetails
 */
export const printThermalBill = (billDetails) => {
  const { total, subTotal, tax, items, billId, date, customerName, salesman, paymentMethod, shopName, gstNo } = billDetails;

  // Create an iframe to print
  const printWindow = window.open('', '', 'width=400,height=600');

  const html = `
      <html>
      <head>
        <title>Receipt</title>
        <style>
          body { font-family: 'Courier New', monospace; width: 100%; margin: 0; padding: 0.5rem; color: #000; }
          .center { text-align: center; }
          .divider { border-top: 1px dashed #000; margin: 0.5rem 0; }
          .item-row { display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 0.2rem; }
          .total-row { display: flex; justify-content: space-between; font-weight: bold; margin-top: 0.5rem; }
          .text-sm { font-size: 0.8rem; }
          @page { margin: 0; }
        </style>
      </head>
      <body>
        <div class="center">
          <h2 style="margin:0;">${shopName || 'MEERAN TIMES'}</h2>
          <div class="text-sm">Sales and Service</div>
          <div class="text-sm">Veppamodu Jn, Nagercoil</div>
          <div class="text-sm">Ph: +91 91234 56789</div>
        </div>
        
        <div class="divider"></div>
        
        <div class="text-sm">
          Date: ${date}<br/>
          Bill No: #${billId}<br/>
          Customer: ${customerName || 'Walk-in'}<br/>
          ${gstNo ? `GST No: ${gstNo}<br/>` : ''}
          Salesman: ${salesman || 'N/A'}<br/>
          <strong>Payment: ${paymentMethod}</strong>
        </div>
        
        <div class="divider"></div>
        
        <!-- Items -->
        ${items.map(item => `
          <div class="item-row">
            <span style="flex:1">${item.name}</span>
          </div>
          <div class="item-row">
            <span class="text-sm">${item.qty} x ${item.price}</span>
            <span>${item.qty * item.price}</span>
          </div>
        `).join('')}
        
        <div class="divider"></div>
        
        <div class="item-row">
          <span>Subtotal</span>
          <span>${subTotal.toLocaleString()}</span>
        </div>
        <div class="item-row">
           <span>Tax (18%)</span>
           <span>${tax.toLocaleString()}</span>
        </div>
        
        <div class="divider"></div>
        
        <div class="total-row">
           <span>TOTAL</span>
           <span>Rs. ${total.toLocaleString()}</span>
        </div>
        
        <div class="divider"></div>
        <div class="center text-sm">
           Thank you for shopping!<br/>
           No Exchange / No Refund
        </div>
        
        <script>
           window.onload = function() { window.print(); window.close(); }
        </script>
      </body>
      </html>
    `;

  printWindow.document.write(html);
  printWindow.document.close();
};
