// Initialize Newly console log capture before anything else
try {
  require('./utils/errorLogger');
} catch (_) {}

// Polyfills
try {
  require('./utils/polyfills/alert');
} catch (_) {}

import 'expo-router/entry';
