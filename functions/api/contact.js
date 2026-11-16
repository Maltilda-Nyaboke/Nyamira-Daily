// Contact form intake (decision #122). Stores the message in D1 for the editor and, when CONTACT_FORWARD_URL is
// set, forwards a copy to that address (a webhook that emails the editor's inbox). The inbox is never printed
// on the site. Off until CONTACT_INTAKE_ENABLED is 'true' and the settings below exist.
import { consumeSubmissionLimit, jsonResponse, readFormFields, readRetentionDays, sameOrigin, verifyTurnstile } from '../_shared/corrections.js';
import { validateContact } from '../_shared/contact.js';

export async function onRequestPost({ request, env }) {
  if (env.CONTACT_INTAKE_ENABLED !== 'true') return jsonResponse({ error: 'The contact form is not switched on yet.' }, 503);
  const retentionDays = readRetentionDays(env.CONTACT_RETENTION_DAYS);
  if (!env.DB || !env.TURNSTILE_SECRET_KEY || !env.CORRECTION_RATE_SALT || !env.CORRECTION_SITE_ORIGIN || !env.CORRECTION_SITE_HOST || retentionDays === null) {
    return jsonResponse({ error: 'The contact form is not fully set up.' }, 503);
  }
  if (!sameOrigin(request, env.CORRECTION_SITE_ORIGIN)) return jsonResponse({ error: 'This request is not allowed.' }, 403);

  const parsed = await readFormFields(request, ['topic', 'name', 'contact', 'ward', 'message', 'consent', 'website', 'cf-turnstile-response']);
  if (parsed.error) return jsonResponse({ error: parsed.error }, 400);
  const { fields } = parsed;
  if (fields.website) return jsonResponse({ error: 'The message could not be accepted.' }, 400);
  const checked = validateContact(fields);
  if (checked.error) return jsonResponse({ error: checked.error }, 400);
  if (!fields['cf-turnstile-response']) return jsonResponse({ error: 'Complete the anti-spam check before sending.' }, 400);
  const clientIp = request.headers.get('cf-connecting-ip');
  if (!clientIp) return jsonResponse({ error: 'The trusted client address is unavailable.' }, 503);

  try {
    await env.DB.prepare("DELETE FROM contact_messages WHERE created_at < datetime('now', ?)").bind(`-${retentionDays} days`).run();
    if (!(await verifyTurnstile(fields['cf-turnstile-response'], env.TURNSTILE_SECRET_KEY, env.CORRECTION_SITE_HOST))) {
      return jsonResponse({ error: 'The anti-spam check did not pass. Try again.' }, 400);
    }
    const within = await consumeSubmissionLimit(env.DB, clientIp, env.CORRECTION_RATE_SALT, { table: 'contact_rate_limits' });
    if (within === null) return jsonResponse({ error: 'Submission protection is not set up.' }, 503);
    if (!within) return jsonResponse({ error: 'Too many messages. Please try again later.' }, 429);

    const id = crypto.randomUUID();
    const v = checked.value;
    await env.DB.prepare('INSERT INTO contact_messages (id, topic, name, contact, ward, message, consent) VALUES (?, ?, ?, ?, ?, ?, 1)')
      .bind(id, v.topic, v.name, v.contact, v.ward, v.message).run();
    if (env.CONTACT_FORWARD_URL) {
      // Best effort: the message is already saved, so a failed forward never loses it
      try {
        await fetch(env.CONTACT_FORWARD_URL, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id, ...v }) });
      } catch (error) { console.error('Contact forward failed:', error); }
    }
    return jsonResponse({ received: true, reference: id }, 201);
  } catch (error) {
    console.error('Contact message failed:', error);
    return jsonResponse({ error: 'The message could not be saved. Please try again later.' }, 500);
  }
}

export function onRequest() {
  return jsonResponse({ error: 'Method not allowed.' }, 405);
}
