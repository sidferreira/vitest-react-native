/**
 * React Navigation + Gesture Handler integration tests
 *
 * Based on https://reactnavigation.org/docs/testing
 *
 * Key patterns from the docs:
 * 1. Wrap with NavigationContainer (not the static version)
 * 2. Test outcomes (visible screens), not actions
 * 3. Import gesture handler setup so native modules are mocked
 */
import React, { useEffect, useState } from 'react'
import { View, Text, Pressable } from 'react-native'
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

jest.setTimeout(10_000)

// ─────────────────────────────────────────────────────────────────────────────
// Screen components
// ─────────────────────────────────────────────────────────────────────────────

function HomeScreen({ navigation }: any) {
  return (
    <View>
      <Text>Home screen</Text>
      <Pressable
        accessibilityLabel="Go to details"
        onPress={() => navigation.navigate('Details')}
      >
        <Text>Go to Details</Text>
      </Pressable>
    </View>
  )
}

function DetailsScreen({ navigation }: any) {
  return (
    <View>
      <Text>Details screen</Text>
      <Pressable
        accessibilityLabel="Go back"
        onPress={() => navigation.goBack()}
      >
        <Text>Go Back</Text>
      </Pressable>
    </View>
  )
}

function SettingsScreen() {
  return (
    <View>
      <Text>Settings screen</Text>
    </View>
  )
}

function ProfileScreen() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
      setData('ditto')
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  if (loading) return <Text>Loading...</Text>
  return <Text>{data}</Text>
}

// ─────────────────────────────────────────────────────────────────────────────
// Navigators
// ─────────────────────────────────────────────────────────────────────────────

const Tab = createBottomTabNavigator()
const Stack = createNativeStackNavigator()

function MyTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  )
}

function MyStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Details" component={DetailsScreen} />
    </Stack.Navigator>
  )
}

function ProfileTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  )
}

// Wraps any navigator in both gesture handler root and navigation container.
// This mirrors the recommended test setup from the React Navigation docs.
function AppWrapper({ children }: { children: React.ReactNode }) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        {children}
      </NavigationContainer>
    </GestureHandlerRootView>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab navigation tests
// Docs: "navigates to settings by tab bar button press"
// ─────────────────────────────────────────────────────────────────────────────

describe('Tab navigation', () => {
  it('renders the initial Home tab', () => {
    render(
      <AppWrapper>
        <MyTabs />
      </AppWrapper>
    )

    expect(screen.getByText('Home screen')).toBeTruthy()
  })

  it('navigates to Settings by pressing the Settings tab', () => {
    render(
      <AppWrapper>
        <MyTabs />
      </AppWrapper>
    )

    // The tab label button aria-label follows the pattern "<name>, tab, N of N"
    const settingsTab = screen.getByLabelText('Settings, tab, 2 of 2')
    fireEvent.press(settingsTab)

    expect(screen.getByText('Settings screen')).toBeVisible()
  })

  it('Home tab remains accessible after switching back', () => {
    render(
      <AppWrapper>
        <MyTabs />
      </AppWrapper>
    )

    const settingsTab = screen.getByLabelText('Settings, tab, 2 of 2')
    fireEvent.press(settingsTab)

    const homeTab = screen.getByLabelText('Home, tab, 1 of 2')
    fireEvent.press(homeTab)

    expect(screen.getByText('Home screen')).toBeVisible()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Stack navigation tests
// Docs: "shows surprise text after navigating to surprise screen"
// ─────────────────────────────────────────────────────────────────────────────

describe('Stack navigation', () => {
  it('renders the initial Home screen', () => {
    render(
      <AppWrapper>
        <MyStack />
      </AppWrapper>
    )

    expect(screen.getByText('Home screen')).toBeTruthy()
  })

  it('navigates to Details screen on button press', () => {
    render(
      <AppWrapper>
        <MyStack />
      </AppWrapper>
    )

    fireEvent.press(screen.getByLabelText('Go to details'))

    expect(screen.getByText('Details screen')).toBeVisible()
  })

  it('goes back to Home from Details screen', () => {
    render(
      <AppWrapper>
        <MyStack />
      </AppWrapper>
    )

    fireEvent.press(screen.getByLabelText('Go to details'))
    fireEvent.press(screen.getByLabelText('Go back'))

    expect(screen.getByText('Home screen')).toBeVisible()
  })

  it('does not show Details screen before navigating', () => {
    render(
      <AppWrapper>
        <MyStack />
      </AppWrapper>
    )

    expect(screen.queryByText('Details screen')).toBeNull()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// useFocusEffect / data fetching on focus
// Docs: "loads data on Pokemon info screen after focus"
// ─────────────────────────────────────────────────────────────────────────────

describe('Data fetching on tab focus', () => {
  it('shows loading state when Profile tab is first rendered', () => {
    render(
      <AppWrapper>
        <ProfileTabs />
      </AppWrapper>
    )

    const profileTab = screen.getByLabelText('Profile, tab, 2 of 2')
    fireEvent.press(profileTab)

    expect(screen.getByText('Loading...')).toBeVisible()
  })

  it('shows loaded data after timers run', async () => {
    render(
      <AppWrapper>
        <ProfileTabs />
      </AppWrapper>
    )

    const profileTab = screen.getByLabelText('Profile, tab, 2 of 2')
    fireEvent.press(profileTab)

    expect(screen.getByText('Loading...')).toBeVisible()

    await waitFor(() => expect(screen.getByText('ditto')).toBeVisible(), { timeout: 2000 })
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// NavigationContainer with initialState
// Docs: "create a reusable test navigator with createTestStackNavigator"
// ─────────────────────────────────────────────────────────────────────────────

describe('NavigationContainer with initialState', () => {
  it('starts on Details screen when initialState points there', () => {
    render(
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer
          initialState={{
            routes: [{ name: 'Home' }, { name: 'Details' }],
            index: 1,
          }}
        >
          <MyStack />
        </NavigationContainer>
      </GestureHandlerRootView>
    )

    expect(screen.getByText('Details screen')).toBeVisible()
  })

  it('renders deeplinked screen without navigating', () => {
    render(
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer
          initialState={{
            routes: [{ name: 'Home' }, { name: 'Details' }],
            index: 1,
          }}
        >
          <MyStack />
        </NavigationContainer>
      </GestureHandlerRootView>
    )

    // Home is in the stack but Details is the active screen
    expect(screen.getByText('Details screen')).toBeVisible()
    expect(screen.queryByText('Home screen')).toBeNull()
  })
})
