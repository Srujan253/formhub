import Form from '../model/Form.js';

// Send invite emails via Brevo
export const sendInvites = async (req, res) => {
  try {
    const { emails, formTitle, formDescription, shareToken, publicUrl, formId } = req.body;

    if (!emails || emails.length === 0) {
      return res.status(400).json({ message: 'At least one email is required' });
    }

    // Try to find form by shareToken or formId
    let form = null;
    if (shareToken) {
      form = await Form.findOne({ shareToken });
    }
    if (!form && formId) {
      form = await Form.findById(formId);
    }

    if (!form) {
      return res.status(404).json({ message: 'Form not found. Try refreshing the page.' });
    }

    const BREVO_API_KEY = process.env.BREVO_API_KEY;
    const SENDER_EMAIL = process.env.SENDER_EMAIL || 'noreply@formhub.app';
    const SENDER_NAME = process.env.SENDER_NAME || 'FormHub';

    if (!BREVO_API_KEY) {
      return res.status(500).json({ message: 'Email service not configured. Please set BREVO_API_KEY in .env' });
    }

    const formUrl = publicUrl || `${req.protocol}://${req.get('host')}/s/${form.shareToken}`;
    const title = formTitle || form.title;
    const description = formDescription || form.description || '';

    // Generate QR code URL using a free API for the email
    const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(formUrl)}&color=312e81&bgcolor=ffffff&format=png&margin=10`;

    // Build the email payload for Brevo
    const emailPayload = {
      sender: {
        name: SENDER_NAME,
        email: SENDER_EMAIL,
      },
      to: emails.map((email) => ({ email })),
      subject: title,
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin:0;padding:0;font-family:'Inter','Segoe UI',system-ui,-apple-system,sans-serif;background-color:#f8f9ff;">
          <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" style="max-width:540px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 32px rgba(99,102,241,0.08);border:1px solid #f0f0ff;">
                  
                  <!-- Header Banner -->
                  <tr>
                    <td style="padding:36px 32px 24px;text-align:center;background:linear-gradient(135deg,#6366f1,#4f46e5);border-radius:20px 20px 0 0;">
                      <div style="width:52px;height:52px;background:rgba(255,255,255,0.2);border-radius:16px;display:inline-block;line-height:52px;margin-bottom:14px;">
                        <span style="font-size:24px;">✨</span>
                      </div>
                      <h1 style="color:#ffffff;font-size:24px;font-weight:800;margin:0 0 4px;">FormHub</h1>
                      <p style="color:rgba(255,255,255,0.7);font-size:12px;font-weight:500;margin:0;">Survey Invitation</p>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding:32px 32px 24px;">
                      <h2 style="color:#1f2937;font-size:20px;font-weight:700;margin:0 0 12px;">You're invited to a survey!</h2>
                      <p style="color:#6b7280;font-size:14px;line-height:1.7;margin:0 0 24px;">
                        You have been invited to participate in a survey. Your response is valuable and will help us gather important insights. Please take a few minutes to complete it.
                      </p>
                      
                      <!-- Form Info Card -->
                      <div style="background:#f8f9ff;border:1px solid #e0e1ff;border-radius:16px;padding:20px 24px;margin-bottom:24px;">
                        <p style="color:#4f46e5;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 6px;">📋 Survey Details</p>
                        <p style="color:#1f2937;font-size:18px;font-weight:700;margin:0 0 6px;">${title}</p>
                        ${description ? `<p style="color:#6b7280;font-size:13px;line-height:1.6;margin:0;">${description}</p>` : ''}
                      </div>

                      <!-- CTA Button -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                        <tr>
                          <td align="center">
                            <a href="${formUrl}" style="display:inline-block;padding:16px 48px;background:linear-gradient(135deg,#6366f1,#4f46e5);color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;border-radius:14px;box-shadow:0 6px 20px rgba(99,102,241,0.3);">
                              Fill Out Survey →
                            </a>
                          </td>
                        </tr>
                      </table>

                      <!-- Link -->
                      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:14px 18px;margin-bottom:28px;">
                        <p style="color:#9ca3af;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin:0 0 6px;">🔗 Direct Link</p>
                        <a href="${formUrl}" style="color:#4f46e5;font-size:12px;word-break:break-all;text-decoration:none;font-weight:500;">${formUrl}</a>
                      </div>

                      <!-- QR Code Section -->
                      <div style="text-align:center;padding:20px 0 8px;">
                        <p style="color:#6b7280;font-size:12px;font-weight:600;margin:0 0 14px;">Or scan this QR code:</p>
                        <div style="display:inline-block;padding:16px;background:#ffffff;border:2px solid #f0f0ff;border-radius:16px;box-shadow:0 2px 12px rgba(99,102,241,0.06);">
                          <img src="${qrCodeImageUrl}" alt="QR Code" width="160" height="160" style="display:block;border-radius:8px;" />
                        </div>
                        <p style="color:#9ca3af;font-size:10px;margin:10px 0 0;">Scan with your phone camera</p>
                      </div>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding:20px 32px 28px;text-align:center;border-top:1px solid #f3f4f6;">
                      <p style="color:#9ca3af;font-size:11px;margin:0 0 4px;">
                        Powered by <strong style="color:#6366f1;">FormHub</strong> • Modern Form Builder
                      </p>
                      <p style="color:#d1d5db;font-size:10px;margin:0;">
                        This email was sent because someone invited you to participate in a survey.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };

    // Send via Brevo API
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Brevo API error:', result);
      return res.status(response.status).json({
        message: result.message || 'Failed to send emails via Brevo',
        error: result,
      });
    }

    res.status(200).json({
      success: true,
      message: `Invitations sent to ${emails.length} recipient(s)`,
      data: result,
    });
  } catch (error) {
    console.error('Email send error:', error);
    res.status(500).json({ message: 'Error sending invitations', error: error.message });
  }
};
