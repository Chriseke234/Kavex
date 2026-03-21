exports.handler = async (event) => {
  const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type' };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers };

  try {
    const { originState, destinationCountry, destinationCity, weightKg } = JSON.parse(event.body);
    const weight = weightKg || 1;
    let estimates = [];

    // 1. Domestic Calculation (Within Nigeria)
    if (destinationCountry === 'Nigeria') {
      const isSameState = originState === destinationCity;

      // GIG
      const gigBase = isSameState ? 800 : 1500;
      const gigRate = isSameState ? 150 : 200;
      estimates.push({
        carrier: 'GIG Logistics',
        cost: gigBase + (weight * gigRate),
        currency: 'NGN',
        estimatedDays: isSameState ? '1-2' : '3-5'
      });

      // Sendbox (20% discount applied)
      estimates.push({
        carrier: 'Sendbox (Kavex Partner)',
        cost: (1000 + (weight * 180)) * 0.8,
        currency: 'NGN',
        estimatedDays: isSameState ? '1-3' : '4-6'
      });

      // DHL Nigeria
      estimates.push({
        carrier: 'DHL Nigeria',
        cost: 2500 + (weight * 350),
        currency: 'NGN',
        estimatedDays: '1-2'
      });
    } else {
      // 2. International Estimates
      const rates = {
        'UK': { base: 25000, perKg: 3500, days: '3-5' },
        'USA': { base: 35000, perKg: 4500, days: '4-7' },
        'UAE': { base: 20000, perKg: 3000, days: '3-5' },
        'Asia': { base: 40000, perKg: 5000, days: '5-9' },
        'Europe': { base: 30000, perKg: 4000, days: '3-5' }
      };

      const zone = rates[destinationCountry] || rates['Europe'];
      estimates.push({
        carrier: 'Kavex Global Air',
        cost: zone.base + (weight * zone.perKg),
        currency: 'NGN',
        estimatedDays: zone.days
      });
    }

    return {
        statusCode: 200,
        headers,
        body: JSON.stringify(estimates)
    };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
