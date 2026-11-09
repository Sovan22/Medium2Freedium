import { FontAwesome5 } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, BackHandler, StyleSheet, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { extractArticleTitle } from '../utils/linkHandler';

const ReaderScreen = ({ route, navigation }) => {
  const { url } = route.params;
  const [isLoading, setIsLoading] = useState(true);
  const webViewRef = useRef(null);
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
        navigation.goBack();
        return true;
      };
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [navigation])
  );

  const handleError = (syntheticEvent) => {
    setIsLoading(false);
    const { nativeEvent } = syntheticEvent || {};
    console.error('WebView load error', nativeEvent);
    Alert.alert(
      'Error Loading Article',
      'There was a problem loading the article. Please try again later.',
      [{ text: 'Go Back', onPress: () => navigation.goBack() }]
    );
  };

  const handleHttpError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent || {};
    console.error('WebView HTTP error', nativeEvent);
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ uri: url }}
        style={styles.webview}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        onError={handleError}
        onHttpError={handleHttpError}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={false}
        scalesPageToFit={true}
        renderLoading={() => null}
      />

      {isLoading && (
        <View pointerEvents="none" style={styles.loadingContainer}>
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
