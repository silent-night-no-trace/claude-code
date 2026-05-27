import { describe, expect, test } from 'bun:test'
import {
  buildBaselineFromLines,
  diffAgainstBaseline,
  normalizeDiagnosticLine,
  parseBaseline,
  serializeBaseline,
} from '../../scripts/verify-typecheck.js'

describe('typecheck baseline gate', () => {
  test('normalizes file diagnostics without line and column noise', () => {
    expect(
      normalizeDiagnosticLine(
        "bridge/bridgeMessaging.ts(154,65): error TS2339: Property 'request' does not exist on type 'never'.",
      ),
    ).toBe(
      "bridge/bridgeMessaging.ts :: TS2339 :: Property 'request' does not exist on type 'never'.",
    )
  })

  test('preserves non-standard diagnostic lines as raw entries', () => {
    expect(normalizeDiagnosticLine('Found 17 errors in 2 files.')).toBe(
      '__raw__ :: Found 17 errors in 2 files.',
    )
  })

  test('serializes and parses baseline counts losslessly', () => {
    const baseline = buildBaselineFromLines([
      'a.ts(1,1): error TS1000: alpha',
      'a.ts(2,2): error TS1000: alpha',
      'b.ts(3,4): error TS2000: beta',
    ])

    const roundTrip = parseBaseline(serializeBaseline(baseline))

    expect([...roundTrip.counts.entries()]).toEqual([
      ['a.ts :: TS1000 :: alpha', 2],
      ['b.ts :: TS2000 :: beta', 1],
    ])
    expect(roundTrip.total).toBe(3)
  })

  test('flags only regressions beyond the committed baseline', () => {
    const baseline = buildBaselineFromLines([
      'a.ts(1,1): error TS1000: alpha',
      'b.ts(1,1): error TS2000: beta',
    ])
    const current = buildBaselineFromLines([
      'a.ts(7,9): error TS1000: alpha',
      'a.ts(8,9): error TS1000: alpha',
      'b.ts(1,1): error TS2000: beta',
      'c.ts(2,3): error TS3000: gamma',
    ])

    expect(diffAgainstBaseline(baseline, current)).toEqual([
      {
        key: 'a.ts :: TS1000 :: alpha',
        baselineCount: 1,
        currentCount: 2,
      },
      {
        key: 'c.ts :: TS3000 :: gamma',
        baselineCount: 0,
        currentCount: 1,
      },
    ])
  })
})
