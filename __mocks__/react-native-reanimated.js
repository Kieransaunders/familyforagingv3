module.exports = {
  default: {},
  Easing: { linear: () => {} },
  useSharedValue: () => ({ value: 0 }),
  useAnimatedStyle: () => ({}),
  withTiming: v => v,
  withSpring: v => v,
  runOnJS: fn => fn,
};

