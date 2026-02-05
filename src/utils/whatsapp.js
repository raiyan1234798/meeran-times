/**
 * Generate WhatsApp Link for Bill
 * @param {Object} billDetails
 * @returns {string} WhatsApp URL
 */
export const generateWhatsAppLink = (phone, billDetails) => {
    const { total, items, billId, date } = billDetails;

    let message = `*🧾 Meeran Times - Bill Invoice*\n\n`;
    message += `Date: ${date}\n`;
    message += `Bill ID: #${billId}\n`;
    message += `------------------------\n`;

    items.forEach(item => {
        message += `${item.name} x ${item.qty} = ₹${item.price * item.qty}\n`;
    });

    message += `------------------------\n`;
    message += `*Grand Total: ₹${total.toLocaleString()}*\n\n`;
    message += `Thank you for shopping with us!`;

    const encodedMsg = encodeURIComponent(message);
    const phoneParam = phone ? `phone=${phone}&` : '';

    return `https://api.whatsapp.com/send?${phoneParam}text=${encodedMsg}`;
};
