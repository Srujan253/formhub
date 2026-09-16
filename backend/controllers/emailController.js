import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import Form from '../model/Form.js';

// Initialize AWS SES client
const getSesClient = () => {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const sessionToken = process.env.AWS_SESSION_TOKEN;
  const region = process.env.AWS_REGION || 'eu-north-1';

  if (!accessKeyId || !secretAccessKey) {
    throw new Error('AWS credentials missing. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in your environment.');
  }

  const credentials = {
    accessKeyId,
    secretAccessKey,
  };

  if (sessionToken) {
    credentials.sessionToken = sessionToken;
  }

  return new SESClient({
    region,
    credentials,
  });
};

// Send invite emails via AWS SES (Optimized for Primary Inbox)
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

    const SENDER_EMAIL = process.env.SENDER_EMAIL || 'noreply@villdesign.com';
    const SENDER_NAME = process.env.SENDER_NAME || 'Pulse';

    const formUrl = publicUrl || `${req.protocol}://${req.get('host')}/s/${form.shareToken}`;
    const title = formTitle || form.title;
    const description = formDescription || form.description || '';

    // Clean, transactional template optimized to bypass Promotions tab
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f6f8fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; color: #24292f; line-height: 1.5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f8fa; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width: 560px; background-color: #ffffff; border: 1px solid #d0d7de; border-radius: 12px; overflow: hidden; text-align: left;">
          
          <!-- Header Bar -->
          <tr>
            <td style="padding: 24px 32px; border-bottom: 1px solid #eaeef2;">
              <div style="font-size: 18px; font-weight: 700; color: #4338ca; display: inline-block;">
                ⚡ Pulse
              </div>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 32px 32px 24px;">
              <p style="font-size: 15px; margin: 0 0 16px; color: #24292f;">
                Hello,
              </p>
              <p style="font-size: 15px; margin: 0 0 24px; color: #57606a;">
                You have been invited to complete the following form:
              </p>

              <!-- Form Box -->
              <div style="background-color: #f6f8fa; border: 1px solid #e1e4e8; border-radius: 8px; padding: 20px; margin-bottom: 28px;">
                <h2 style="font-size: 18px; font-weight: 600; margin: 0 0 8px; color: #0969da;">
                  ${title}
                </h2>
                ${description ? `<p style="font-size: 14px; margin: 0; color: #57606a; white-space: pre-wrap;">${description}</p>` : ''}
              </div>

              <!-- Button CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 28px;">
                <tr>
                  <td>
                    <a href="${formUrl}" style="background-color: #4f46e5; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; padding: 12px 28px; border-radius: 6px; display: inline-block;">
                      Complete Form &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Plain Link Backup -->
              <p style="font-size: 13px; color: #57606a; margin: 0 0 8px;">
                Button not working? Copy and paste this URL into your browser:
              </p>
              <p style="font-size: 12px; word-break: break-all; margin: 0 0 24px; color: #0969da;">
                <a href="${formUrl}" style="color: #0969da;">${formUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #f6f8fa; border-top: 1px solid #eaeef2; font-size: 12px; color: #6e7781;">
              Sent via <strong>Pulse</strong> on behalf of the form administrator.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const ses = getSesClient();

    // Send email to each recipient
    const sendPromises = emails.map(async (recipientEmail) => {
      const params = {
        Source: `"${SENDER_NAME}" <${SENDER_EMAIL}>`,
        ReplyToAddresses: [SENDER_EMAIL],
        Destination: {
          ToAddresses: [recipientEmail],
        },
        Message: {
          Subject: {
            Data: `Form Request: ${title}`,
            Charset: 'UTF-8',
          },
          Body: {
            Html: {
              Data: htmlContent,
              Charset: 'UTF-8',
            },
            Text: {
              Data: `Hello,\n\nYou have been invited to complete the form: ${title}\n\n${description ? description + '\n\n' : ''}Please access and fill out the form using this link:\n${formUrl}\n\n--\nSent via Pulse`,
              Charset: 'UTF-8',
            },
          },
        },
      };

      const command = new SendEmailCommand(params);
      return ses.send(command);
    });

    await Promise.all(sendPromises);

    res.status(200).json({
      success: true,
      message: `Invitations sent to ${emails.length} recipient(s) via AWS SES`,
    });
  } catch (error) {
    console.error('AWS SES Error:', error);
    res.status(500).json({
      message: error.message || 'Error sending invitations via AWS SES',
      error: error.name || 'AWSSESError',
    });
  }
};
