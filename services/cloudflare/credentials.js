// Runtime secrets only. A/B names take precedence; legacy names remain supported.
export function nimKeys(env) {
  const primary = env.NVIDIA_API_KEY_A || env.NVIDIA_API_KEY;
  const secondary = env.NVIDIA_API_KEY_B || env.NVIDIA_SECONDARY_API_KEY;
  return { primary, secondary, review: secondary || primary };
}
