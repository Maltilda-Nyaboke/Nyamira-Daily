// Contact form rules (decision #122), shared by the worker and its tests.
export const TOPICS = ['general', 'tip', 'concern', 'correction', 'reply', 'partnership', 'careers', 'story', 'volunteer'];

// Returns { error } or { value } with trimmed, bounded fields. A reply address is optional: tips may be anonymous.
export function validateContact(fields) {
  const topic = TOPICS.includes(fields.topic) ? fields.topic : null;
  if (!topic) return { error: 'Choose what your message is about.' };
  const message = (fields.message || '').trim();
  if (message.length < 10) return { error: 'Please write at least 10 characters.' };
  if (message.length > 3000) return { error: 'The message is too long (3,000 characters at most).' };
  const name = (fields.name || '').trim();
  const contact = (fields.contact || '').trim();
  const ward = (fields.ward || '').trim();
  if (name.length > 120 || contact.length > 200 || ward.length > 60) return { error: 'One or more fields are too long.' };
  if (contact && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact) && !/^\+?[0-9 ()-]{9,20}$/.test(contact)) {
    return { error: 'Enter a phone number or an email address we can reply to, or leave it empty.' };
  }
  if (fields.consent !== 'yes') return { error: 'Tick the box to agree to how we handle your message.' };
  return { value: { topic, message, name: name || null, contact: contact || null, ward: ward || null } };
}
