module.exports = ({ config }) => {
  const { edgeToEdgeEnabled, ...android } = config.android || {};
  return {
    ...config,
    android,
    plugins: (config.plugins || []).filter(
      plugin => (Array.isArray(plugin) ? plugin[0] : plugin) !== 'expo-status-bar'
    ),
  };
};


// Trainer audio plugin configuration
const trainerPreviousConfig = module.exports;
module.exports = context => {
  const base = typeof trainerPreviousConfig === 'function'
    ? trainerPreviousConfig(context)
    : trainerPreviousConfig;
  return {
    ...base,
    plugins: [
      ...(base.plugins || []).filter(plugin =>
        (Array.isArray(plugin) ? plugin[0] : plugin) !== 'expo-audio'
      ),
      'expo-audio',
    ],
  };
};
