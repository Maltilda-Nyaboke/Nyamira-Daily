// The culture archive (decision #122). Withdrawn items never show; the AI-training export takes only items whose
// holders gave that separate consent.
import { entries } from './content.js';
export const visible = (list) => list.filter((e) => e.data.consentPublish && !e.data.withdrawn);
export const forTraining = (list) => visible(list).filter((e) => e.data.consentAiTraining);
export async function archiveItems() {
  return visible(await entries('archive')).sort((a, b) => b.data.recordedOn - a.data.recordedOn);
}
