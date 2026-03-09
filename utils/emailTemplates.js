const buildEmailLayout = (title, bodyHtml) => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${title} | Ease Shopping</title>
  </head>
  <body style="margin:0;padding:0;background:#f3f5f7;font-family:Arial,Helvetica,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f3f5f7">
      <tr>
        <td align="center" style="padding:24px;">
          <table width="600" cellpadding="0" cellspacing="0" border="0"
            style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;box-shadow:0 2px 10px rgba(0,0,0,0.05);">
            <tr>
              <td style="padding:24px 24px 8px;text-align:left;color:#0f172a;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:16px;font-size:11px;color:#94a3b8;border-top:1px solid #e5e7eb;">
                &copy; 2025 Ease Shopping. All rights reserved.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

const codeBlock = (code) =>
  `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:16px 0;">
    <tr>
      <td align="center" style="background:#0b1220;border-radius:10px;padding:14px 16px;">
        <span style="display:inline-block;font-size:28px;font-family:monospace;letter-spacing:6px;color:#ffffff;">${code}</span>
      </td>
    </tr>
  </table>`;

exports.verificationEmailTemplate = ({ name, code }) =>
  buildEmailLayout(
    "Verify Your Email",
    `<h2 style="margin:0 0 12px;font-size:22px;">Verify your email address</h2>
     <p style="margin:0 0 20px;font-size:14px;color:#475569;">
       Hi ${name}, use the code below to verify your <strong>Ease Shopping</strong> account.
     </p>
     ${codeBlock(code)}
     <p style="margin:0 0 16px;font-size:14px;color:#334155;">
       This code expires in <strong>15 minutes</strong>.
     </p>
     <p style="font-size:12px;color:#94a3b8;margin:0;">
       If you did not create an account, you can safely ignore this email.
     </p>`
  );

exports.passwordResetEmailTemplate = ({ name, code }) =>
  buildEmailLayout(
    "Password Reset",
    `<h2 style="margin:0 0 12px;font-size:22px;">Password Reset</h2>
     <p style="margin:0 0 20px;font-size:14px;color:#475569;">
       Hi ${name}, here is your password reset code for your <strong>Ease Shopping</strong> account.
     </p>
     ${codeBlock(code)}
     <p style="margin:0 0 16px;font-size:14px;color:#334155;">
       This code expires in <strong>10 minutes</strong>.
     </p>
     <p style="font-size:12px;color:#94a3b8;margin:0;">
       Do not share this code with anyone. Ease Shopping support will never ask for it.
     </p>`
  );
