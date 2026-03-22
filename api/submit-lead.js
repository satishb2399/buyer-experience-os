export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://buying.sbrealty.co');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { firstName, lastName, email, phone, buyerType, timeline, propType, areas, priorities, notes, source, loanType, message } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, error: 'Invalid email address' });
    }

    // Determine if this is a lead form, lender referral, or contact form
    const isLenderReferral = (source || '').includes('Lender');
    const isContactForm = (source || '').includes('Contact');

    // Build tags
    const tags = isLenderReferral
      ? ['Lender Referral', 'Andrew Morcos', loanType || 'Loan Type TBD']
      : isContactForm
        ? ['Buyer Lead', 'Contact Form']
        : ['Buyer Lead', 'Buyer OS', buyerType || 'Type TBD'];

    // Build description
    let description = '';
    if (isLenderReferral) {
      description = 'Lender referral to Andrew Morcos at First Alliance Home Mortgage.\n' +
        'Loan Type: ' + (loanType || 'Not specified') + '\n' +
        'Message: ' + (message || 'None') + '\n' +
        'Source: Buyer Experience OS';
    } else if (isContactForm) {
      description = 'Contact form submission from Buyer Experience OS.\n' +
        'Message: ' + (message || 'None');
    } else {
      description = 'New buyer lead from Buyer Experience OS.\n' +
        'Buyer Type: ' + (buyerType || 'Not specified') + '\n' +
        'Timeline: ' + (timeline || 'Not specified') + '\n' +
        'Property Type: ' + (propType || 'Not specified') + '\n' +
        'Target Areas: ' + (areas || 'Not specified') + '\n' +
        'Priorities: ' + (priorities || 'Not specified') + '\n' +
        'Notes: ' + (notes || 'None');
    }

    const payload = {
      source: source || 'Buyer Experience OS',
      system: 'Buyer Experience OS',
      type: 'Registration',
      person: {
        firstName,
        lastName,
        emails: [{ value: email }],
        phones: phone ? [{ value: phone }] : [],
        tags
      },
      description
    };

    const resp = await fetch('https://api.followupboss.com/v1/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(process.env.FUB_API_KEY + ':').toString('base64')
      },
      body: JSON.stringify(payload)
    });

    if (!resp.ok) throw new Error('FUB API error: ' + resp.status);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Submit lead error:', error);
    return res.status(500).json({ success: false, error: 'Submission failed. Please try again.' });
  }
}
