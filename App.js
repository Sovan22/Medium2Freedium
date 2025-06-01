import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useShareIntent } from 'expo-share-intent';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Linking } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import HomeScreen from './screens/HomeScreen';
import ReaderScreen from './screens/ReaderScreen';
import { convertToFreedium, isMediumLink } from './utils/linkHandler';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();

export default function App() {
  const [initialUrl, setInitialUrl] = useState(null);
  const navigationRef = useRef(null);
  const [appIsReady, setAppIsReady] = useState(false);
  
  // Initialize the share intent hook
  const { hasShareIntent, shareIntent, resetShareIntent, error } = useShareIntent();

  // Handle the initial URL that opened the app
  useEffect(() => {
    const getInitialUrl = async () => {
      try {
        // Get the URL that opened the app
        const url = await Linking.getInitialURL();
        if (url) {
          handleUrl(url);
        }
        
        // Hide the splash screen
        await SplashScreen.hideAsync();
        setAppIsReady(true);
      } catch (e) {
        console.warn('Error getting initial URL:', e);
        await SplashScreen.hideAsync();
        setAppIsReady(true);
      }
    };

    getInitialUrl();
  }, []);

  // Listen for incoming links while the app is open
  useEffect(() => {
    // Handle deep linking when app is already open
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleUrl(url);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Handle share intent from other apps
  useEffect(() => {
    if (hasShareIntent && shareIntent) {
      console.log('Received share intent:', shareIntent);
      // Process shared text with share flag
      if (shareIntent.webUrl) {
        handleUrl(shareIntent.webUrl, true);
      } else {
        Alert.alert(
          'Invalid Link',
          'Please share a valid Medium article link.',
          [{ text: 'OK', onPress: () => resetShareIntent() }]
        );
      }
    }
  }, [hasShareIntent, shareIntent]);

  // Process the URL (flag share intent to adjust back behavior)
  const handleUrl = (url, isShareIntent = false) => {
    if (!url) return;

    console.log('Received URL:', url);

    // Expo Go deep link prefix: strip '/--/' and extract the real link
    // let link = url;
    // // Capture entire shared text (including pre-link text) after '/--/'
    // const expoMatch = url.match(/\/--\/(.+)/);
    // if (expoMatch && expoMatch[1]) {
    //   link = expoMatch[1];
    // }
    // // Only act on actual deep links, custom scheme, or HTTP Medium links
    // const isCustomScheme = !!expoMatch || link.startsWith('medium2freedium://');
    // const isHttpMediumLink = /^https?:\/\/(?:www\.)?medium\.com\//i.test(link);
    // if (!isCustomScheme && !isHttpMediumLink) return;

    // At this point, link is a valid Medium URL

    // Check if it's a Medium link
    if (isMediumLink(url)) {
      const freediumUrl = convertToFreedium(url);
      if (navigationRef.current) {
        navigationRef.current.navigate('Reader', { url: freediumUrl, isShareIntent : true });
      } else {
        setInitialUrl(freediumUrl);
      }
    } else {
      // Show an alert for invalid links
      Alert.alert(
        'Invalid Link',
        'The shared link is not a Medium article. Please share a valid Medium article link.',
        [{ text: 'OK' }]
      );
    }
  };

  // Handle the stored initial URL once navigation is ready
  const onNavigationReady = () => {
    if (initialUrl) {
      navigationRef.current.navigate('Reader', { url: initialUrl, isShareIntent : true });
      setInitialUrl(null);
    }
  };

  if (!appIsReady) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer
        ref={navigationRef}
        onReady={onNavigationReady}
      >
        <Stack.Navigator 
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#007bff',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="Reader" 
            component={ReaderScreen}
            options={({ route }) => ({ 
              title: 'Article Reader',
              headerBackTitle: 'Back'
            })}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
