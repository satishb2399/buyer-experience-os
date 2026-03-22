import { Resend } from 'resend';

// HTML entity escaping to prevent injection
function esc(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://buying.sbrealty.co');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { firstName, lastName, email, phone, loanType, message } = req.body;

    if (!firstName || !lastName || !email) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, error: 'Invalid email address' });
    }

    const fromAddr = process.env.FROM_EMAIL || 'info@sbrealty.co';

    // Sanitize all user inputs
    const s = {
      firstName: esc(firstName),
      lastName: esc(lastName),
      email: esc(email),
      phone: esc(phone),
      loanType: esc(loanType),
      message: esc(message)
    };

    // Email 1: Notify Andrew
    await resend.emails.send({
      from: 'The Satish Brahmbhatt Real Estate Group <' + fromAddr + '>',
      to: 'amorcos@fahmloans.com',
      subject: 'New Buyer Referral: ' + s.firstName + ' ' + s.lastName,
      html: '<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#2D2D2D;line-height:1.8"><div style="background:#1B2A4A;padding:24px 32px;border-radius:10px 10px 0 0"><h2 style="color:#C5A55A;margin:0;font-size:18px">New Buyer Referral</h2><p style="color:rgba(255,255,255,0.7);margin:4px 0 0;font-size:13px">From The Satish Brahmbhatt Real Estate Group</p></div><div style="padding:28px 32px;border:1px solid #e0e0e0;border-top:none;border-radius:0 0 10px 10px"><p style="font-size:15px">Hi Andrew,</p><p style="font-size:15px">A new buyer from our Buyer Experience OS would like to connect about financing.</p><div style="background:#F5F0E8;padding:20px 24px;border-radius:8px;margin:20px 0;border-left:4px solid #C5A55A"><p style="margin:6px 0"><strong>Name:</strong> ' + s.firstName + ' ' + s.lastName + '</p><p style="margin:6px 0"><strong>Email:</strong> <a href="mailto:' + s.email + '">' + s.email + '</a></p><p style="margin:6px 0"><strong>Phone:</strong> ' + (s.phone || 'Not provided') + '</p><p style="margin:6px 0"><strong>Loan Type:</strong> ' + (s.loanType || 'Not specified') + '</p>' + (s.message ? '<p style="margin:6px 0"><strong>Message:</strong> ' + s.message + '</p>' : '') + '</div><p style="font-size:13px;color:#8a95a5">Source: Buyer Experience OS — buying.sbrealty.co</p></div></div>'
    });

    // Email 2: Intro to buyer with Pre-Qualify CTA
    await resend.emails.send({
      from: 'The Satish Brahmbhatt Real Estate Group <' + fromAddr + '>',
      to: email,
      subject: s.firstName + ', meet your lending partner — Andrew Morcos',
      html: '<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#2D2D2D;line-height:1.8"><div style="background:#1B2A4A;padding:28px 32px;border-radius:10px 10px 0 0;text-align:center"><p style="color:#C5A55A;font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px">The Satish Brahmbhatt Real Estate Group</p><h1 style="color:#FFF;margin:0;font-size:22px">Your Lending Partner</h1></div><div style="padding:32px;border:1px solid #e0e0e0;border-top:none"><p style="font-size:16px">Hi ' + s.firstName + ',</p><p style="font-size:15px">Thank you for reaching out about your home purchase. We\'ve connected you with our preferred lending partner, <strong>Andrew Morcos</strong> at <strong>First Alliance Home Mortgage</strong>.</p><p style="font-size:15px">Andrew specializes in finding the right financing solution — whether you\'re exploring conventional, FHA, VA, or down payment assistance options.</p><div style="background:#1B2A4A;border-radius:10px;padding:28px;margin:28px 0;text-align:center"><img src="https://cdn.prod.website-files.com/658f30a87b1a52ef8ad0b746/68d2b0f332332b13ae73e412_68d2b0f2eed3737d87c1063b_erasebg-transformed%2520(27).avif" alt="Andrew Morcos" style="width:90px;height:90px;border-radius:50%;border:3px solid #C5A55A;object-fit:cover;margin:0 auto 12px;display:block"><h3 style="color:#FFF;margin:0 0 2px;font-size:18px">Andrew Morcos</h3><p style="color:#C5A55A;font-size:13px;font-weight:600;margin:0 0 4px">VP Business Development</p><p style="color:rgba(255,255,255,0.65);font-size:12px;margin:0 0 12px">NMLS #190629</p><p style="margin:4px 0"><a href="tel:2015199712" style="color:rgba(255,255,255,0.8);text-decoration:none;font-size:14px">&#128222; (201) 519-9712</a></p><p style="margin:4px 0"><a href="mailto:amorcos@fahmloans.com" style="color:#C5A55A;text-decoration:none;font-size:14px">&#9993; amorcos@fahmloans.com</a></p><p style="color:rgba(255,255,255,0.65);font-size:11px;margin:8px 0 0">First Alliance Home Mortgage, LLC | NMLS #5034</p></div><div style="text-align:center;margin:32px 0"><a href="https://amorcos.fahmloans.com" style="display:inline-block;background:#C5A55A;color:#1B2A4A;padding:18px 48px;border-radius:8px;text-decoration:none;font-size:16px;font-weight:700">Pre-Qualify Now</a></div><p style="font-size:14px;color:#5a6a7a;text-align:center">Click the button above to start your pre-qualification on Andrew\'s secure portal. It takes about 10 minutes.</p><div style="background:#F5F0E8;padding:24px;border-radius:8px;margin:28px 0"><h3 style="color:#1B2A4A;font-size:15px;margin:0 0 12px">What Happens Next</h3><p style="margin:6px 0;font-size:14px"><strong>1.</strong> Complete the pre-qualification form on Andrew\'s portal</p><p style="margin:6px 0;font-size:14px"><strong>2.</strong> Andrew reviews your info and calls you to discuss options</p><p style="margin:6px 0;font-size:14px"><strong>3.</strong> Once pre-approved, we activate your custom home search</p></div><p style="font-size:14px;color:#5a6a7a">Andrew typically reaches out within <strong>24 hours</strong>. Questions? Call or text him at <a href="tel:2015199712" style="color:#1B2A4A;font-weight:600">(201) 519-9712</a>.</p><hr style="border:none;border-top:2px solid #C5A55A;margin:28px 0;max-width:60px"><p style="font-size:15px;font-weight:700;color:#1B2A4A;margin-bottom:2px">The Satish Brahmbhatt Real Estate Group</p><p style="font-size:13px;color:#8a95a5;margin:0">Central Pennsylvania | Maryland</p></div><div style="padding:16px 32px;background:#f5f5f5;border-radius:0 0 10px 10px;border:1px solid #e0e0e0;border-top:none"><p style="font-size:11px;color:#aaa;line-height:1.6;margin:0">This email is for informational purposes only and does not constitute a loan commitment or guarantee of rates or terms. All lending decisions are made by First Alliance Home Mortgage, LLC. Equal Housing Lender. NMLS #5034.</p></div></div>'
    });

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Send error:', error);
    return res.status(500).json({ success: false, error: 'An error occurred. Please try again.' });
  }
}
