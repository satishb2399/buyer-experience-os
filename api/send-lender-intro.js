let Resend;
try {
  Resend = require('resend').Resend;
} catch (e) {
  // Fallback if named import fails
  const mod = require('resend');
  Resend = mod.Resend || mod.default?.Resend || mod;
}

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ success: false, error: 'RESEND_API_KEY not configured' });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const { firstName, lastName, email, phone, loanType, message } = req.body;

  if (!firstName || !lastName || !email) {
    return res.status(400).json({ error: 'Missing required fields: firstName, lastName, email' });
  }

  const fromEmail = process.env.FROM_EMAIL || 'team@sbrealty.co';
  const fromName = 'The Satish Brahmbhatt Real Estate Group';

  try {
    // ==================== EMAIL 1: REFERRAL TO ANDREW ====================
    const andrewEmail = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: ['amorcos@fahmloans.com'],
      subject: `New Buyer Referral: ${firstName} ${lastName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #2D2D2D; line-height: 1.8;">
          <div style="background: #1B2A4A; padding: 24px 32px; border-radius: 10px 10px 0 0;">
            <h2 style="color: #C5A55A; margin: 0; font-size: 18px;">New Buyer Referral</h2>
            <p style="color: rgba(255,255,255,0.7); margin: 4px 0 0; font-size: 13px;">From The Satish Brahmbhatt Real Estate Group</p>
          </div>
          <div style="padding: 28px 32px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="font-size: 15px;">Hi Andrew,</p>
            <p style="font-size: 15px;">A new buyer from our Buyer Experience OS would like to connect about financing.</p>

            <div style="background: #F5F0E8; padding: 20px 24px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #C5A55A;">
              <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
                <tr><td style="padding: 6px 0; font-weight: 600; color: #1B2A4A; width: 120px;">Name:</td><td style="padding: 6px 0;">${firstName} ${lastName}</td></tr>
                <tr><td style="padding: 6px 0; font-weight: 600; color: #1B2A4A;">Email:</td><td style="padding: 6px 0;"><a href="mailto:${email}" style="color: #1B2A4A;">${email}</a></td></tr>
                <tr><td style="padding: 6px 0; font-weight: 600; color: #1B2A4A;">Phone:</td><td style="padding: 6px 0;"><a href="tel:${phone || ''}" style="color: #1B2A4A;">${phone || 'Not provided'}</a></td></tr>
                <tr><td style="padding: 6px 0; font-weight: 600; color: #1B2A4A;">Loan Type:</td><td style="padding: 6px 0;">${loanType || 'Not specified'}</td></tr>
                ${message ? `<tr><td style="padding: 6px 0; font-weight: 600; color: #1B2A4A; vertical-align: top;">Message:</td><td style="padding: 6px 0;">${message}</td></tr>` : ''}
              </table>
            </div>

            <p style="font-size: 14px; color: #5a6a7a;">Source: Buyer Experience OS at buying.sbrealty.co</p>

            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 24px 0;">
            <p style="font-size: 13px; color: #8a95a5;">This referral was sent automatically from The Satish Brahmbhatt Real Estate Group's Buyer Experience OS.</p>
          </div>
        </div>
      `
    });

    // ==================== EMAIL 2: INTRO TO BUYER ====================
    const buyerIntroEmail = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [email],
      subject: `${firstName}, meet your lending partner — Andrew Morcos`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #2D2D2D; line-height: 1.8;">

          <div style="background: #1B2A4A; padding: 28px 32px; border-radius: 10px 10px 0 0; text-align: center;">
            <p style="color: #C5A55A; font-size: 12px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 8px;">The Satish Brahmbhatt Real Estate Group</p>
            <h1 style="color: #FFFFFF; margin: 0; font-size: 22px; font-weight: 600;">Your Lending Partner</h1>
          </div>

          <div style="padding: 32px; border: 1px solid #e0e0e0; border-top: none;">
            <p style="font-size: 16px;">Hi ${firstName},</p>

            <p style="font-size: 15px;">Thank you for reaching out about your home purchase. We've connected you with our preferred lending partner, <strong>Andrew Morcos</strong> at <strong>First Alliance Home Mortgage</strong>.</p>

            <p style="font-size: 15px;">Andrew specializes in finding the right financing solution for every buyer — whether you're exploring conventional, FHA, VA, or down payment assistance options.</p>

            <!-- Andrew's Contact Card -->
            <div style="background: #1B2A4A; border-radius: 10px; padding: 28px; margin: 28px 0; text-align: center;">
              <div style="width: 80px; height: 80px; border-radius: 50%; border: 3px solid #C5A55A; margin: 0 auto 12px; background: #2a3d66; overflow: hidden;">
                <img src="https://cdn.prod.website-files.com/658f30a87b1a52ef8ad0b746/68d2b0f332332b13ae73e412_68d2b0f2eed3737d87c1063b_erasebg-transformed%2520(27).avif" alt="Andrew Morcos" style="width: 100%; height: 100%; object-fit: cover;">
              </div>
              <h3 style="color: #FFFFFF; margin: 0 0 2px; font-size: 18px;">Andrew Morcos</h3>
              <p style="color: #C5A55A; font-size: 13px; font-weight: 600; margin: 0 0 4px;">VP Business Development</p>
              <p style="color: rgba(255,255,255,0.5); font-size: 12px; margin: 0 0 16px;">NMLS #190629</p>
              <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 16px;">
                <p style="margin: 4px 0;"><a href="tel:2015199712" style="color: rgba(255,255,255,0.8); text-decoration: none; font-size: 14px;">📞 (201) 519-9712</a></p>
                <p style="margin: 4px 0;"><a href="mailto:amorcos@fahmloans.com" style="color: #C5A55A; text-decoration: none; font-size: 14px;">✉ amorcos@fahmloans.com</a></p>
                <p style="color: rgba(255,255,255,0.4); font-size: 11px; margin: 8px 0 0;">First Alliance Home Mortgage, LLC | NMLS #5034<br>2805 Eastern Blvd, York, PA</p>
              </div>
            </div>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 32px 0;">
              <a href="https://amorcos.firstalliancehomemortgage.com" style="display: inline-block; background: #C5A55A; color: #1B2A4A; padding: 18px 48px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: 700; letter-spacing: 0.02em;">Pre-Qualify Now</a>
            </div>

            <p style="font-size: 14px; color: #5a6a7a; text-align: center;">Click the button above to start your pre-qualification on Andrew's secure portal.<br>It takes about 10 minutes.</p>

            <!-- What Happens Next -->
            <div style="background: #F5F0E8; padding: 24px; border-radius: 8px; margin: 28px 0;">
              <h3 style="color: #1B2A4A; font-size: 15px; margin: 0 0 16px;">What Happens Next</h3>
              <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 12px 8px 0; vertical-align: top; width: 32px;">
                    <div style="width: 28px; height: 28px; border-radius: 50%; background: #C5A55A; color: #1B2A4A; text-align: center; line-height: 28px; font-weight: 700; font-size: 13px;">1</div>
                  </td>
                  <td style="padding: 8px 0;"><strong>Complete the pre-qualification form</strong> on Andrew's secure portal</td>
                </tr>
                <tr>
                  <td style="padding: 8px 12px 8px 0; vertical-align: top;">
                    <div style="width: 28px; height: 28px; border-radius: 50%; background: #C5A55A; color: #1B2A4A; text-align: center; line-height: 28px; font-weight: 700; font-size: 13px;">2</div>
                  </td>
                  <td style="padding: 8px 0;"><strong>Andrew reviews your information</strong> and calls you to discuss your options</td>
                </tr>
                <tr>
                  <td style="padding: 8px 12px 8px 0; vertical-align: top;">
                    <div style="width: 28px; height: 28px; border-radius: 50%; background: #C5A55A; color: #1B2A4A; text-align: center; line-height: 28px; font-weight: 700; font-size: 13px;">3</div>
                  </td>
                  <td style="padding: 8px 0;"><strong>Once pre-approved</strong>, we activate your custom home search and start monitoring the market daily</td>
                </tr>
              </table>
            </div>

            <p style="font-size: 14px; color: #5a6a7a;">Andrew typically reaches out within <strong>24 hours</strong> of receiving your application. If you have questions before then, call or text him directly at <a href="tel:2015199712" style="color: #1B2A4A; font-weight: 600;">(201) 519-9712</a>.</p>

            <p style="font-size: 15px; margin-top: 28px;">We look forward to guiding you through your home purchase.</p>

            <hr style="border: none; border-top: 2px solid #C5A55A; margin: 28px 0; max-width: 60px;">

            <p style="font-size: 15px; font-weight: 700; color: #1B2A4A; margin-bottom: 2px;">The Satish Brahmbhatt Real Estate Group</p>
            <p style="font-size: 13px; color: #8a95a5; margin: 0;">Central Pennsylvania | Maryland</p>
          </div>

          <div style="padding: 16px 32px; background: #f5f5f5; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; border-top: none;">
            <p style="font-size: 11px; color: #aaa; line-height: 1.6; margin: 0;">This email is for informational purposes only and does not constitute a loan commitment or guarantee of rates or terms. All lending decisions are made by First Alliance Home Mortgage, LLC. Equal Housing Lender. NMLS #5034.</p>
          </div>
        </div>
      `
    });

    return res.status(200).json({
      success: true,
      andrewEmailId: andrewEmail.data?.id || 'sent',
      buyerEmailId: buyerIntroEmail.data?.id || 'sent'
    });

  } catch (error) {
    console.error('Email send error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to send emails'
    });
  }
};
