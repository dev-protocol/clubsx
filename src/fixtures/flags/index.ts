import { whenDefined, type UndefinedOr } from '@devprotocol/util-ts'

export enum FeatureFlags {
  AchievementsOnMarketplace = 'achievements-on-marketplace',
}
export enum FeatureFlagValues {
  Enable = 'enable',
}
export const flags: Map<FeatureFlags, FeatureFlagValues[]> = new Map([
  [FeatureFlags.AchievementsOnMarketplace, [FeatureFlagValues.Enable]],
])

export const getFlagsByParams = ({
  url,
}: {
  url: URL
}): Map<FeatureFlags, UndefinedOr<FeatureFlagValues>> => {
  const _flags: [FeatureFlags, UndefinedOr<FeatureFlagValues>][] = Array.from(
    flags.entries(),
  ).map(([flag, values]) => {
    return [
      flag,
      whenDefined(url.searchParams.get(`flag:${flag}`), (value) =>
        values.includes(value as FeatureFlagValues)
          ? (value as FeatureFlagValues)
          : undefined,
      ),
    ]
  })

  return new Map(_flags)
}
