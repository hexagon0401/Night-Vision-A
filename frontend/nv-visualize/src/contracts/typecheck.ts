// Compiled by tsc; these assertions protect the frontend contract boundary.
import type { CaseBundle, EvidenceStatus, Location, Source } from './generated';

export const supportedStatus: EvidenceStatus = 'disputed';
// @ts-expect-error Direct evidence must use an explicit supported status.
export const unsupportedStatus: EvidenceStatus = 'confirmed';
// @ts-expect-error Unknown publication time must be null or an ISO string.
export const invalidPublication: Source['published_at_utc'] = 0;
// @ts-expect-error Physical and symbolic anchors must remain distinguishable.
export const invalidRole: Location['role'] = 'asset';

export function sourceReferences(bundle: CaseBundle): string[] {
  return bundle.claims?.flatMap(claim => claim.provenance.source_ids) ?? [];
}
