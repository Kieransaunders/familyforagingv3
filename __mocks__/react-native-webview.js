const React = require('react');
const { View } = require('react-native');

// Minimal WebView mock that supports ref + injectJavaScript and event firing
const WebView = React.forwardRef((props, ref) => {
  const instance = React.useRef({
    injectJavaScript: () => {},
  });

  // Wire the forwarded ref (callback or object ref)
  React.useEffect(() => {
    if (typeof ref === 'function') {
      ref(instance.current);
    } else if (ref && 'current' in ref) {
      ref.current = instance.current;
    }
  }, [ref]);

  return React.createElement(View, { testID: 'webview', ...props });
});

module.exports = { WebView };
