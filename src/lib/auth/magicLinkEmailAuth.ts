import type { EmailProviderSendVerificationRequestParams } from 'next-auth/providers/email';

export async function sendVerificationRequest(
  params: EmailProviderSendVerificationRequestParams
) {
  const { identifier: to, provider, url, theme } = params;
  const { host } = new URL(url);

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${provider.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: provider.from,
      to,
      subject: `Welcome to BlizzardBerry - Your Magic Link`,
      html: html({ url, host, theme }),
      text: text({ url, host }),
    }),
  });

  if (!res.ok) {
    throw new Error('Resend error: ' + JSON.stringify(await res.json()));
  }
}

function html({ url, host, theme }: { url: string; host: string; theme: any }) {
  const escapedHost = host.replace(/\./g, '.'); // Zero-width space for visual clarity

  const brandColor = '#FFC480'; // primary from globals.css
  const color = {
    background: '#FFFDF8', // background
    text: '#1F2937', // foreground
    mutedText: '#4B5563', // muted-foreground
    buttonBackground: brandColor,
    buttonBorder: '#1F2937', // border
    buttonText: '#1F2937', // primary-foreground
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to BlizzardBerry</title>
</head>
<body style="background: ${color.background}; margin: 0; font-family: 'Geist Sans', Helvetica, Arial, sans-serif; color: ${color.text};">
  <div style="max-width: 600px; margin: 20px auto; background: ${color.background}; border-radius: 10px; border-width: 3px; border-style: solid; border-color: ${color.buttonBorder}; padding: 20px;">
    <div style="text-align: center; font-size: 24px; font-weight: bold; color: ${color.text}; padding: 10px 0;">
      Welcome to ${escapedHost}!
    </div>
    <div style="text-align: center; font-size: 16px; line-height: 24px; color: ${color.mutedText}; padding: 10px 20px;">
      We're excited to have you on board. Click the button below to sign in to your new account and start exploring the future of UX.
    </div>
    <div style="text-align: center; padding: 20px 0;">
      <a href="${url}"
         target="_blank"
         style="display: inline-block; font-size: 18px; font-family: 'Geist Sans', Helvetica, Arial, sans-serif; color: ${color.buttonText}; background: ${color.buttonBackground}; text-decoration: none; border-radius: 5px; padding: 12px 24px; border-width: 3px; border-style: solid; border-color: ${color.buttonBorder}; font-weight: bold; transition: transform 0.2s;"
         role="button">
        Sign In with Magic Link
      </a>
    </div>
    <div style="text-align: center; font-size: 14px; line-height: 22px; color: ${color.mutedText}; padding: 10px 20px;">
      If the button doesn't work, copy and paste this link into your browser:<br>
      <a href="${url}" style="color: ${color.buttonBackground}; text-decoration: underline; word-break: break-all;">${url}</a>
    </div>
    <div style="text-align: center; font-size: 14px; line-height: 22px; color: ${color.mutedText}; padding: 10px 20px;">
      If you didn't sign up for ${escapedHost}, you can safely ignore this email.
    </div>
    <div style="text-align: center; font-size: 12px; color: ${color.mutedText}; padding: 20px 0 0;">
      ${escapedHost} - Building the Future of UX
    </div>
  </div>
</body>
</html>
`;
}

function text({ url, host }: { url: string; host: string }) {
  return `
Welcome to BlizzardBerry!

We're excited to have you on board. To sign in to your new account, click the link below:
${url}

If the link doesn't work, copy and paste it into your browser.

If you didn't sign up for BlizzardBerry, you can safely ignore this email.

BlizzardBerry - Building the Future of UX
`;
}
