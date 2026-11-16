import wardRecords from './wards.json' with { type: 'json' };
import facilities from './facilities.json' with { type: 'json' };
import { resolveWards } from '../lib/facility-registry.js';

export { facilities, wardRecords };
const wards = resolveWards(wardRecords, facilities);

export default wards;
