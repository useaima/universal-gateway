export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { token, action } = req.body;
  
  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
  const apiKey = process.env.RECAPTCHA_API_KEY;
  const siteKey = process.env.RECAPTCHA_SITE_KEY;

  if (!token || !action) {
    return res.status(400).json({ error: 'Missing token or action.' });
  }

  if (!projectId || !apiKey || !siteKey) {
    return res.status(503).json({ error: 'reCAPTCHA Enterprise is not fully configured on the server.' });
  }

  // Google Cloud reCAPTCHA Enterprise REST API endpoint
  const url = `https://recaptchaenterprise.googleapis.com/v1/projects/${projectId}/assessments?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: {
          token: token,
          siteKey: siteKey,
          expectedAction: action,
        }
      })
    });

    const data = await response.json();
    
    if (data.error) {
      return res.status(400).json({ success: false, error: `Google API Error: ${data.error.message}` });
    }
    
    // Check if verification was successful and token is valid
    if (data.tokenProperties && data.tokenProperties.valid) {
      // Score is between 0.0 and 1.0 (1.0 is very likely a good interaction)
      const score = data.riskAnalysis ? data.riskAnalysis.score : 0;
      const actionMatches = data.tokenProperties.action === action;
      
      if (actionMatches && score >= 0.5) {
        return res.status(200).json({ success: true, score, data });
      } else {
        return res.status(403).json({
          success: false,
          error: actionMatches ? 'reCAPTCHA score too low.' : 'reCAPTCHA action mismatch.',
          score,
        });
      }
    } else {
      const reason = data.tokenProperties ? data.tokenProperties.invalidReason : 'Unknown error';
      return res.status(403).json({ success: false, error: `Invalid token: ${reason}` });
    }
    
  } catch (error) {
    console.error("reCAPTCHA Verification Error:", error);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}
