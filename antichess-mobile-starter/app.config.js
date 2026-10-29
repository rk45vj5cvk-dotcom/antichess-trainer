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
