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
      subject: `Sign in to ${host}`,
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

  const brandColor = '#1F2937'; // gray-900
  const color = {
    background: '#FFFDF8',
    text: '#1F2937', // gray-900
    mainBackground: '#FFFDF8',
    buttonBackground: brandColor,
    buttonBorder: brandColor,
    buttonText: '#FFFDF8',
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign in to ${escapedHost}</title>
</head>
<body style="background: ${color.background}; margin: 0; font-family: Helvetica, Arial, sans-serif;">
  <div style="max-width: 600px; margin: 20px auto; background: ${color.mainBackground}; border-radius: 10px; border-width: 3px; border-style: solid; border-color: ${color.buttonBorder}; padding: 20px;">
    <div style="text-align: center; font-size: 22px; color: ${color.text}; padding: 10px 0;">
      Sign in to <strong>${escapedHost}</strong>
    </div>
    <div style="text-align: center; padding: 20px 0;">
      <a href="${url}"
         target="_blank"
         style="display: inline-block; font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${color.buttonText}; background: ${color.buttonBackground}; text-decoration: none; border-radius: 5px; padding: 10px 20px; border-width: 3px; border-style: solid; border-color: ${color.buttonBorder}; font-weight: bold;"
         role="button">
        Sign in
      </a>
    </div>
    <div style="text-align: center; font-size: 16px; line-height: 22px; color: ${color.text}; padding: 0 0 10px;">
      If you did not request this email, you can safely ignore it.
    </div>
  </div>
</body>
</html>
`;
}

function text({ url, host }: { url: string; host: string }) {
  return `Sign in to ${host}\n${url}\n\n`;
}
