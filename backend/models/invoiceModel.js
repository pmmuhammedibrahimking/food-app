/**
 * Invoice Data Model & Billing Calculator
 */

export const generateInvoiceData = (bookingId, bookingData = null) => {
  const id = bookingId || 'BK-9021';

  // Default fallback booking if not provided
  const booking = bookingData || {
    id: id,
    guestName: 'Lord Alexander Wright',
    guestEmail: 'alexander.wright@royals.co.uk',
    guestPhone: '+44 7911 123456',
    vipStatus: 'Diamond',
    roomNumber: '401',
    roomCategory: 'Penthouse Suite',
    nightlyRate: 1500,
    checkIn: '2026-08-05',
    checkOut: '2026-08-12',
    totalNights: 7,
    paymentStatus: 'Paid'
  };

  const nightlyTotal = (booking.nightlyRate || 350) * (booking.totalNights || 3);
  
  // Room Service / Incidentals Line Items
  const incidentals = [
    { description: 'Artisanal Truffle & Caviar Omelette (Room Service)', amount: 45, date: '2026-08-06' },
    { description: 'Vintage Dom Pérignon Champagne (Lounge Bar)', amount: 350, date: '2026-08-07' },
    { description: 'Hydrotherapy Spa & Couples Massage', amount: 280, date: '2026-08-08' }
  ];

  const incidentalsTotal = incidentals.reduce((sum, item) => sum + item.amount, 0);
  const subtotal = nightlyTotal + incidentalsTotal;

  // Tax calculations
  const resortTaxRate = 0.12; // 12% Resort Occupancy Tax
  const cityTaxRate = 0.05;   // 5% City Tourism Tax
  
  const resortTax = Math.round(subtotal * resortTaxRate);
  const cityTax = Math.round(subtotal * cityTaxRate);
  const totalTaxes = resortTax + cityTax;

  const taxesBreakdown = [
    { name: 'Resort Occupancy Tax (12%)', rate: '12%', amount: resortTax },
    { name: 'City Luxury Tourism Tax (5%)', rate: '5%', amount: cityTax }
  ];

  // Discount calculations
  const isVip = booking.vipStatus === 'Diamond' || booking.vipStatus === 'Gold' || booking.roomCategory?.includes('Penthouse');
  const vipDiscount = isVip ? Math.round(subtotal * 0.10) : 0; // 10% VIP discount
  const promoDiscount = 50; // $50 Concierge Welcome Discount
  const totalDiscounts = vipDiscount + promoDiscount;

  const discountsBreakdown = [
    { name: `VIP Membership Discount (${isVip ? '10%' : '5%'})`, amount: vipDiscount },
    { name: 'Early Concierge Booking Promo', amount: promoDiscount }
  ];

  // Grand Total Calculation
  const grandTotal = subtotal + totalTaxes - totalDiscounts;

  // Payment History Breakdown
  const paymentHistory = [
    {
      id: 'PAY-8910',
      date: booking.checkIn || '2026-08-05',
      method: 'Visa Signature •••• 4242',
      status: 'Completed',
      amount: Math.round(grandTotal * 0.5)
    },
    {
      id: 'PAY-9042',
      date: '2026-08-07',
      method: 'Express Concierge Wire / Card',
      status: 'Completed',
      amount: grandTotal - Math.round(grandTotal * 0.5)
    }
  ];

  const totalPaid = paymentHistory.reduce((sum, p) => sum + p.amount, 0);
  const balanceDue = Math.max(0, grandTotal - totalPaid);

  return {
    invoiceNumber: `INV-${id.replace('BK-', '').replace('BKG-', '')}`,
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: booking.checkOut || new Date().toISOString().split('T')[0],
    booking,
    lineItems: [
      {
        description: `Accommodation: ${booking.roomCategory || 'Suite'} (Room ${booking.roomNumber || '101'})`,
        quantity: `${booking.totalNights || 3} Nights`,
        unitPrice: booking.nightlyRate || 350,
        total: nightlyTotal
      },
      ...incidentals.map((inc) => ({
        description: `${inc.description} (${inc.date})`,
        quantity: '1',
        unitPrice: inc.amount,
        total: inc.amount
      }))
    ],
    subtotal,
    taxes: taxesBreakdown,
    totalTaxes,
    discounts: discountsBreakdown,
    totalDiscounts,
    grandTotal,
    paymentHistory,
    totalPaid,
    balanceDue
  };
};
