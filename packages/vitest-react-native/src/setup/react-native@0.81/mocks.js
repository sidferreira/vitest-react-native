const { mock } = require('./pirates');

// --- Custom mocks: inline logic, class definitions, or multi-method stubs ---

mock(
  "react-native/Libraries/Core/NativeExceptionsManager",
  () => `{
    __esModule: true,
    default: {
      reportfatalexception: vi.fn(),
      reportSoftException: vi.fn(),
      updateExceptionMessage: vi.fn(),
      dismissRedbox: vi.fn(),
      reportException: vi.fn(),
    }
  }`
);

mock(
  "react-native/Libraries/NativeComponent/NativeComponentRegistry",
  () => `{
    get: vi.fn((name, viewConfigProvider) => {
      const requireNativeComponent = require("react-native/Libraries/ReactNative/requireNativeComponent");
      return requireNativeComponent(name);
    }),
    getWithFallback_DEPRECATED: vi.fn((name, viewConfigProvider) => {
      const requireNativeComponent = require("react-native/Libraries/ReactNative/requireNativeComponent");
      return requireNativeComponent(name);
    }),
    setRuntimeConfigProvider: vi.fn(),
  }`
);

mock(
  "react-native/Libraries/ReactNative/requireNativeComponent",
  () => `(() => {
    const React = require('react')

    let nativeTag = 1

    return viewName => {
      const Component = class extends React.Component {
        _nativeTag = nativeTag++;

        render() {
          return React.createElement(viewName, this.props, this.props.children);
        }

        // The methods that exist on host components
        blur = vi.fn();
        focus = vi.fn();
        measure = vi.fn();
        measureInWindow = vi.fn();
        measureLayout = vi.fn();
        setNativeProps = vi.fn();
      };

      if (viewName === 'RCTView') {
        Component.displayName = 'View';
      } else {
        Component.displayName = viewName;
      }

      return Component;
    };
  })()`
);

mock(
  "react-native/Libraries/Components/View/ViewNativeComponent",
  () => `(() => {
    const React = require("react");
    const Component = class extends React.Component {
      render() {
        return React.createElement("View", this.props, this.props.children);
      }
    };

    Component.displayName = "View";

    return {
      __esModule: true,
      default: Component,
    };
  })()`
);

// --- Quick mocks: simple re-exports to upstream jest/mocks/ or trivial values ---

mock("react-native/Libraries/Core/InitializeCore",                                    () => `{}`);
mock("react-native/src/private/featureflags/specs/NativeReactNativeFeatureFlags",     () => `{ __esModule: true, default: null }`);
mock("react-native/Libraries/Utilities/verifyComponentAttributeEquivalence",          () => `() => {}`);
mock("react-native/Libraries/Utilities/BackHandler",                                  () => `{ __esModule: true, default: { addEventListener: vi.fn(() => ({ remove: vi.fn() })), exitApp: vi.fn(), removeEventListener: vi.fn() } }`);
mock("react-native/Libraries/Alert/RCTAlertManager",                                  () => `{ __esModule: true, alertWithArgs: vi.fn(), default: { alertWithArgs: vi.fn() } }`);
mock("react-native/Libraries/Utilities/useColorScheme",                               () => `{ __esModule: true, default: vi.fn(() => 'light') }`);

mock("react-native/Libraries/ReactNative/UIManager",                                  () => `({ __esModule: true, default: require('react-native/jest/mocks/UIManager').default })`);
mock("react-native/Libraries/BatchedBridge/NativeModules",                            () => `({ __esModule: true, default: require('react-native/jest/mocks/NativeModules').default })`);
mock("react-native/Libraries/AppState/AppState",                                      () => `{ __esModule: true, default: require('react-native/jest/mocks/AppState').default }`);
mock("react-native/Libraries/Linking/Linking",                                        () => `{ __esModule: true, default: require('react-native/jest/mocks/Linking').default }`);
mock("react-native/Libraries/Vibration/Vibration",                                    () => `{ __esModule: true, default: require('react-native/jest/mocks/Vibration').default }`);
mock("react-native/Libraries/Components/Clipboard/Clipboard",                         () => `{ __esModule: true, default: require('react-native/jest/mocks/Clipboard').default }`);

mock("react-native/Libraries/Image/Image",                                            () => `{ __esModule: true, default: require('react-native/jest/mocks/Image.js').default }`);
mock("react-native/Libraries/Text/Text",                                              () => `{ __esModule: true, default: require('react-native/jest/mocks/Text.js').default }`);
mock("react-native/Libraries/Components/TextInput/TextInput",                         () => `{ __esModule: true, default: require('react-native/jest/mocks/TextInput.js').default }`);
mock("react-native/Libraries/Modal/Modal",                                            () => `{ __esModule: true, default: require('react-native/jest/mocks/Modal.js').default }`);
mock("react-native/Libraries/Components/View/View",                                   () => `{ __esModule: true, default: require('react-native/jest/mocks/View.js').default }`);
mock("react-native/Libraries/Components/AccessibilityInfo/AccessibilityInfo",         () => `{ __esModule: true, default: require('react-native/jest/mocks/AccessibilityInfo').default }`);
mock("react-native/Libraries/Components/RefreshControl/RefreshControl",               () => `{ __esModule: true, default: require('react-native/jest/mocks/RefreshControl.js').default }`);
mock("react-native/Libraries/Components/ScrollView/ScrollView",                       () => `{ __esModule: true, default: require('react-native/jest/mocks/ScrollView.js').default }`);
mock("react-native/Libraries/Components/ActivityIndicator/ActivityIndicator",         () => `{ __esModule: true, default: require('react-native/jest/mocks/ActivityIndicator.js').default }`);

// --- VirtualizedList-based components: mock to avoid "Cannot redefine property: state" ---

mock("react-native/Libraries/Lists/FlatList", () => `{
  __esModule: true,
  default: (() => {
    const React = require('react');
    function FlatList({ data, renderItem, keyExtractor, testID, ListHeaderComponent, ListFooterComponent, ListEmptyComponent }) {
      const items = (data || []).map((item, index) => {
        const key = keyExtractor ? keyExtractor(item, index) : String(index);
        return React.createElement(React.Fragment, { key }, renderItem({ item, index, separators: {} }));
      });
      return React.createElement('FlatList', { testID }, ...items);
    }
    FlatList.displayName = 'FlatList';
    return FlatList;
  })()
}`);

mock("react-native/Libraries/Lists/SectionList", () => `{
  __esModule: true,
  default: (() => {
    const React = require('react');
    function SectionList({ sections, renderItem, renderSectionHeader, keyExtractor, testID }) {
      const children = [];
      (sections || []).forEach(section => {
        if (renderSectionHeader) {
          children.push(renderSectionHeader({ section }));
        }
        (section.data || []).forEach((item, index) => {
          const key = keyExtractor ? keyExtractor(item, index) : String(index);
          children.push(React.createElement(React.Fragment, { key }, renderItem({ item, index, section, separators: {} })));
        });
      });
      return React.createElement('SectionList', { testID }, ...children);
    }
    SectionList.displayName = 'SectionList';
    return SectionList;
  })()
}`);

// --- InteractionManager: mock to synchronously invoke callbacks (BatchedBridge unavailable) ---

mock("react-native/Libraries/Interaction/InteractionManager", () => `{
  __esModule: true,
  default: {
    runAfterInteractions: (cb) => { if (typeof cb === 'function') cb(); return { cancel: () => {} }; },
    createInteractionHandle: () => 1,
    clearInteractionHandle: () => {},
    setDeadline: () => {},
  }
}`);
