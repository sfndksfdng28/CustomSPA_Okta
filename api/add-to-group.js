// api/add-to-group.js  (Vercel Serverless / Node.js)
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'Missing userId in body' });

    const OKTA_DOMAIN = process.env.OKTA_DOMAIN; // e.g. dev-123456.okta.com
    const OKTA_API_TOKEN = process.env.OKTA_API_TOKEN; // SSWS token (sensitive)
    const OKTA_GROUP_ID = process.env.OKTA_GROUP_ID;

    if (!OKTA_DOMAIN || !OKTA_API_TOKEN || !OKTA_GROUP_ID) {
      return res.status(500).json({ error: 'Server misconfigured: missing OKTA env vars' });
    }

    const endpoint = `https://${OKTA_DOMAIN}/api/v1/groups/${OKTA_GROUP_ID}/users/${userId}`;

    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Authorization': `SSWS ${OKTA_API_TOKEN}`,
        'Accept': 'application/json'
      }
    });

    if (response.status === 204) {
      return res.status(204).end(); // success no content
    } else {
      const body = await response.text();
      // return the upstream status and body for easier debugging
      return res.status(response.status).json({ oktaStatus: response.status, body });
    }
  } catch (err) {
    console.error('add-to-group error', err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
}
