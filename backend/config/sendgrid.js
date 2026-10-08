import sgMail from "@sendgrid/mail";

export const sendRegistrationOtp = async (email, otp) => {
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL;
  if (!apiKey || !fromEmail) {
    throw new Error("SendGrid is not configured");
  }

  sgMail.setApiKey(apiKey);
  await sgMail.send({
    to: email,
    from: { email: fromEmail, name: "Foodaroo" },
    subject: "Your Foodaroo sign-up code",
    text: `FOODAROO\n\nVerify your email\n\nYour sign-up code is ${otp}. Enter it in Foodaroo to finish creating your account.\n\nThis code expires in 10 minutes. If you did not request it, you can ignore this email.`,
    html: `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background-color:#f2f0e8;font-family:Arial,Helvetica,sans-serif;color:#22231f;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">Your Foodaroo sign-up code expires in 10 minutes.</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f2f0e8;">
      <tr>
        <td align="center" style="padding:36px 14px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:520px;background-color:#fffefa;border:1px solid #e4e1d7;border-radius:8px;overflow:hidden;">
            <tr>
              <td style="padding:22px 28px;background-color:#252722;color:#fffefa;">
                <span style="display:inline-block;width:30px;height:30px;line-height:30px;text-align:center;border-radius:9px 9px 9px 3px;background-color:#e25336;color:#ffffff;font-size:20px;font-weight:bold;vertical-align:middle;">f</span>
                <span style="margin-left:8px;color:#ffffff;font-size:20px;font-weight:bold;vertical-align:middle;">foodaroo<span style="color:#efc66f;">.</span></span>
              </td>
            </tr>
            <tr>
              <td style="padding:34px 28px 12px;">
                <p style="margin:0 0 8px;color:#b83c26;font-size:10px;font-weight:bold;letter-spacing:1.2px;">ONE QUICK CHECK</p>
                <h1 style="margin:0;color:#22231f;font-size:27px;line-height:1.2;">Verify your email</h1>
                <p style="margin:14px 0 0;color:#62645d;font-size:15px;line-height:1.6;">Use this six-digit code to finish creating your Foodaroo account.</p>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:18px 28px 10px;">
                <div style="padding:19px 12px;border:1px solid #f0d4cc;border-radius:6px;background-color:#fff5f1;color:#b83c26;font-family:Courier New,monospace;font-size:32px;font-weight:bold;letter-spacing:8px;">${otp}</div>
                <p style="margin:13px 0 0;color:#62645d;font-size:12px;line-height:1.5;">This code expires in <strong style="color:#22231f;">10 minutes</strong>.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:22px 28px 30px;">
                <div style="height:1px;background-color:#e4e1d7;"></div>
                <p style="margin:18px 0 0;color:#77786f;font-size:12px;line-height:1.6;">If you didn’t request this code, you can safely ignore this email. Your account won’t be created unless the code is verified.</p>
                <p style="margin:18px 0 0;color:#929188;font-size:11px;">Good food, good mood.<br />The Foodaroo team</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`,
  });
};
