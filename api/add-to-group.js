// api/add-to-group.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'email required in JSON body' });

    const OKTA_DOMAIN = process.env.OKTA_DOMAIN;         // https://dev-123456.okta.com
    const API_TOKEN = process.env.OKTA_API_TOKEN;       // SSWS token (server side only)
    const GROUP_ID = process.env.ADMIN_GROUP_ID;        // admin group id

    // 1) find user by email
    const findUrl = `${OKTA_DOMAIN}/api/v1/users?filter=profile.email eq "${email}"`;
    const findResp = await fetch(findUrl, {
      headers: { Authorization: `SSWS ${API_TOKEN}`, Accept: 'application/json' }
    });
    const users = await findResp.json();
    if (!Array.isArray(users) || users.length === 0) {
      return res.status(404).json({ error: 'user not found' });
    }
    const userId = users[0].id;

    // 2) add user to group
    const addUrl = `${OKTA_DOMAIN}/api/v1/groups/${GROUP_ID}/users/${userId}`;
    const addResp = await fetch(addUrl, {
      method: 'PUT',
      headers: { Authorization: `SSWS ${API_TOKEN}` }
    });

    if (addResp.status === 204) return res.status(200).json({ ok: true, userId });
    const text = await addResp.text();
    return res.status(addResp.status).json({ error: text });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal server error' });
  }
}
