// WhatsApp message generation & URL builder for Raheja Resident App

export function sanitizePhone(phone) {
  if (!phone) return '';
  let cleaned = phone.replace(/\D/g, '');
  // Default to India country code 91 if user entered 10 digits
  if (cleaned.length === 10) {
    cleaned = '91' + cleaned;
  }
  return cleaned;
}

export function formatDateTime(date = new Date()) {
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

export function formatUnitLocation(flat) {
  if (!flat) return 'N/A';
  const f = String(flat).trim();
  if (/^(flat|villa|unit)/i.test(f)) return f;
  return `Flat/Villa ${f}`;
}

/**
 * Builds formatted WhatsApp message for Grocery Orders
 * NOTE: Delivery PIN is NOT sent in WhatsApp - it is kept private for resident doorstep verification.
 */
export function buildGroceryOrderMessage({
  resident,
  items,
  customNote,
  totalAmount,
  deliveryPin,
  dailySerialNo,
  orderId,
  orderTimestamp
}) {
  const timeStr = formatDateTime(orderTimestamp ? new Date(orderTimestamp) : new Date());
  const flat = resident?.flatNo || 'N/A';
  const unitStr = formatUnitLocation(flat);
  const tower = resident?.tower || 'N/A';
  const society = resident?.societyName || 'Raheja Exotica';
  const residentName = resident?.name || 'Resident';
  const residentPhone = resident?.phone ? `(+91 ${resident.phone})` : '';

  let lines = [];
  lines.push(`🛒 *NEW GROCERY DELIVERY ORDER*`);
  lines.push(`━━━━━━━━━━━━━━━━━━━━━`);
  if (orderId) {
    lines.push(`🆔 *Order ID:* #${orderId}`);
  }
  if (dailySerialNo !== undefined && dailySerialNo !== null) {
    lines.push(`📋 *Daily Order S.No:* #${dailySerialNo}`);
  }
  lines.push(`🕒 *Order Time:* ${timeStr}`);
  lines.push(`🏢 *Society:* ${society}`);
  lines.push(`📍 *Delivery Location:* ${tower}, ${unitStr}`);
  lines.push(`👤 *Resident:* ${residentName} ${residentPhone}`.trim());
  lines.push(`━━━━━━━━━━━━━━━━━━━━━`);
  lines.push(`📦 *ITEMS TO DELIVER:*`);

  items.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    lines.push(`${index + 1}. *${item.name}* (${item.pack || 'Standard'})`);
    lines.push(`   └ Qty: *${item.quantity}* × ₹${item.price} = *₹${itemTotal}*`);
  });

  if (customNote && customNote.trim()) {
    lines.push(`\n📝 *Additional Custom Items / Note:*`);
    lines.push(`"${customNote.trim()}"`);
  }

  lines.push(`━━━━━━━━━━━━━━━━━━━━━`);
  lines.push(`💰 *Estimated Total:* *₹${totalAmount}*`);
  lines.push(`🛵 *Delivery:* Please deliver to ${unitStr}, ${tower}`);
  lines.push(`🔐 *Delivery Verification:* Resident will share their 4-digit code at doorstep`);
  lines.push(`💳 *Payment:* Cash / UPI on Delivery`);
  lines.push(`━━━━━━━━━━━━━━━━━━━━━`);
  lines.push(`_Sent via Raheja Resident App_`);

  return lines.join('\n');
}

/**
 * Builds formatted WhatsApp message for Restaurant Orders
 * NOTE: Delivery PIN is NOT sent in WhatsApp - it is kept private for resident doorstep verification.
 */
export function buildRestaurantOrderMessage({
  resident,
  items,
  specialInstructions,
  totalAmount,
  deliveryPin,
  dailySerialNo,
  orderId,
  orderTimestamp
}) {
  const timeStr = formatDateTime(orderTimestamp ? new Date(orderTimestamp) : new Date());
  const flat = resident?.flatNo || 'N/A';
  const unitStr = formatUnitLocation(flat);
  const tower = resident?.tower || 'N/A';
  const society = resident?.societyName || 'Raheja Exotica';
  const residentName = resident?.name || 'Resident';
  const residentPhone = resident?.phone ? `(+91 ${resident.phone})` : '';

  let lines = [];
  lines.push(`🍽️ *NEW FOOD DELIVERY ORDER*`);
  lines.push(`━━━━━━━━━━━━━━━━━━━━━`);
  if (orderId) {
    lines.push(`🆔 *Order ID:* #${orderId}`);
  }
  if (dailySerialNo !== undefined && dailySerialNo !== null) {
    lines.push(`📋 *Daily Order S.No:* #${dailySerialNo}`);
  }
  lines.push(`🕒 *Order Time:* ${timeStr}`);
  lines.push(`🏢 *Society:* ${society}`);
  lines.push(`📍 *Delivery Location:* ${tower}, ${unitStr}`);
  lines.push(`👤 *Resident:* ${residentName} ${residentPhone}`.trim());
  lines.push(`━━━━━━━━━━━━━━━━━━━━━`);
  lines.push(`🍛 *FOOD ITEMS:*`);

  items.forEach((item, index) => {
    const vegBadge = item.isVeg ? '🟢 Veg' : '🔴 Non-Veg';
    const itemTotal = item.price * item.quantity;
    lines.push(`${index + 1}. *${item.name}* [${vegBadge}]`);
    lines.push(`   └ Qty: *${item.quantity}* × ₹${item.price} = *₹${itemTotal}*`);
  });

  if (specialInstructions && specialInstructions.trim()) {
    lines.push(`\n👨‍🍳 *Special Cooking Instructions:*`);
    lines.push(`"${specialInstructions.trim()}"`);
  }

  lines.push(`━━━━━━━━━━━━━━━━━━━━━`);
  lines.push(`💰 *Total Bill:* *₹${totalAmount}*`);
  lines.push(`🛵 *Delivery:* Please deliver hot to ${unitStr}, ${tower}`);
  lines.push(`🔐 *Delivery Verification:* Resident will share their 4-digit code at doorstep`);
  lines.push(`💳 *Payment:* Cash / UPI on Delivery`);
  lines.push(`━━━━━━━━━━━━━━━━━━━━━`);
  lines.push(`_Sent via Raheja Resident App_`);

  return lines.join('\n');
}

/**
 * Builds formatted WhatsApp message for Club House Enquiries
 */
export function buildClubHouseEnquiryMessage({ resident, amenityName }) {
  const flat = resident?.flatNo || 'N/A';
  const unitStr = formatUnitLocation(flat);
  const tower = resident?.tower || 'N/A';
  const society = resident?.societyName || 'Raheja Exotica';
  const residentName = resident?.name || 'Resident';
  const residentPhone = resident?.phone ? `(+91 ${resident.phone})` : '';

  let lines = [];
  lines.push(`🏛️ *CLUB HOUSE ENQUIRY / BOOKING*`);
  lines.push(`━━━━━━━━━━━━━━━━━━━━━`);
  lines.push(`🏢 *Society:* ${society}`);
  lines.push(`📍 *Resident:* ${residentName} ${residentPhone} (${unitStr}, ${tower})`);
  lines.push(`━━━━━━━━━━━━━━━━━━━━━`);
  lines.push(`Hello Club House Desk, I would like to enquire / book slots for:`);
  lines.push(`👉 *${amenityName}*`);
  lines.push(`\nPlease let me know the available timings and booking procedure.`);
  lines.push(`\n_Sent via Raheja Resident App_`);

  return lines.join('\n');
}

/**
 * Generates WhatsApp Web and Direct Mobile Link
 */
export function getWhatsAppUrl(phone, message) {
  const cleanPhone = sanitizePhone(phone);
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}
