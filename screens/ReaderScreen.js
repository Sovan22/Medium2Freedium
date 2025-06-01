import { FontAwesome5 } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useShareIntent } from 'expo-share-intent';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, BackHandler, StyleSheet, TouchableOpacity, View } from 'react-native';
import RNExitApp from 'react-native-exit-app';
import { WebView } from 'react-native-webview';
import { extractArticleTitle } from '../utils/linkHandler';

const ReaderScreen = ({ route, navigation }) => {
  const { url, isShareIntent = false } = route.params;
  const [isPageReady, setIsPageReady] = useState(false);
  const webViewRef = useRef(null);
  const {resetShareIntent} = useShareIntent();
  // Set the navigation title
  useEffect(() => {
    const title = extractArticleTitle(url);
    navigation.setOptions({
      title,
      headerRight: () => (
        <TouchableOpacity onPress={() => webViewRef.current?.reload()}>
        {/* Use white icon so it’s visible against the blue header */}
        <FontAwesome5 name="redo" size={20} color="#fff" />
      </TouchableOpacity>
      ),
      headerRightContainerStyle: { paddingRight: 5 }
    });
  }, [url, navigation]);

  // Handle Android back button
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (isShareIntent) {
          RNExitApp.exitApp();
        } else {
          navigation.goBack();
        }
        return true;
      };
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [navigation, isShareIntent])
  );

  // Intercept header back and gestures to exit the app back to the originating app
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      e.preventDefault();
      if (isShareIntent) {
        RNExitApp.exitApp();
      } else {
        navigation.dispatch(e.data.action);
      }
    });
    return unsubscribe;
  }, [navigation, isShareIntent]);

  const handleError = () => {
    Alert.alert(
      'Error Loading Article',
      'There was a problem loading the article. Please try again later.',
      [{ text: 'Go Back', onPress: () => navigation.goBack() }]
    );
  };

  const handleWebViewMessage = (event) => {
    if (event.nativeEvent.data === 'goHome') {
      console.log('goHome',isPageReady)
      Alert.alert(
        'Invalid Link',
        'Please share a valid Medium article link.',
        [{ text: 'OK', onPress: () => {
            resetShareIntent() 
            navigation.goBack()
          } 
        }]
      );
    }
    else if (event.nativeEvent.data === 'contentReady') {
      // Scroll after content is ready
      // console.log('contentReady',isPageReady)
      webViewRef.current?.injectJavaScript(`
        window.scrollBy(0, 50);
        true;
      `);
      setIsPageReady(true); // Show the WebView
    }
  };

  const injectedJS = `
    (function() {
      function hideElementsByTextContent(tag, textIncludes) {
        const elements = document.getElementsByTagName(tag);
        for (let i = 0; i < elements.length; i++) {
          const el = elements[i];
          if (el.innerText && el.innerText.includes(textIncludes)) {
            el.style.display = 'none';
          }
        }
      }

      function checkForErrorText() {
        const elements = document.getElementsByTagName('p');
        for (let i = 0; i < elements.length; i++) {
          if (elements[i].innerText.includes("Unable to identify the Medium article URL")) {
            window.ReactNativeWebView.postMessage("goHome");
            return true;
          }
        }
        hideTargets();
        return false;
      }

      function hideTargets() {
        hideElementsByTextContent('div', 'Freedium');
        hideElementsByTextContent('p', '< Go to the original');
        // Optional: hideElementsByTextContent('div', 'Attila Vágó');
        setTimeout(() => {
          window.ReactNativeWebView.postMessage("contentReady");
        }, 200);
      }
        
      checkForErrorText();
      
      const observer = new MutationObserver(() => {
        // hideTargets();
        checkForErrorText();
      });
      observer.observe(document.body, { childList: true, subtree: true });

      true;
    })();
  `;

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ uri: url }}
        style={[styles.webview, { opacity: isPageReady ? 1 : 0 }]}
        onError={handleError}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        injectedJavaScript={injectedJS}
        onMessage={handleWebViewMessage}
        startInLoadingState={false}
        scalesPageToFit={true}
        renderLoading={() => null}
      />

      {!isPageReady && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
});

export default ReaderScreen;
