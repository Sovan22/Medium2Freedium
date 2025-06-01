import { FontAwesome5 } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Image, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { convertToFreedium, isMediumLink } from '../utils/linkHandler';

const HomeScreen = ({ navigation }) => {
  // State for pasted URL
  const [url, setUrl] = useState('');
  const isValidLink = isMediumLink(url);  // validate Medium URL

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="always"
      >
        <View style={styles.header}>
        <Image 
          source={require('../assets/images/splash-icon.png')} 
          style={styles.image}
          resizeMode="cover"
        />
          {/* <Text style={styles.title}>Medium2Freedium</Text> */}
          <Text style={styles.subtitle}>Read Medium articles for free</Text>
        </View>
        
        {/* Paste link section */}
        <View style={styles.pasteContainer}>
          <Text style={styles.instructionTitle}>Paste Article Link:</Text>
            {url.length > 0 && !isValidLink && (
              <Text style={styles.errorText}>Enter a valid Medium URL</Text>
            )}
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Paste Medium article URL"
              placeholderTextColor="rgba(0,0,0,0.5)"
              value={url}
              onChangeText={setUrl}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
            {url.length > 0 && (
              <TouchableOpacity style={styles.clearButton} onPress={() => setUrl('')}>
                <FontAwesome5 name="times" size={18} color="#888" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Reader', { url: convertToFreedium(url) })}
            disabled={!isValidLink}
            >
            <Text style={styles.buttonText}>Read Article</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.instructionContainer}>
          <Text style={styles.instructionTitle}>How to use:</Text>
          
          <View style={styles.step}>
            <Text style={styles.stepNumber}>1</Text>
            <Text style={styles.stepText}>Find a Medium article you want to read</Text>
          </View>
          
          <View style={styles.step}>
            <Text style={styles.stepNumber}>2</Text>
            <Text style={styles.stepText}>Share the article link to Medium2Freedium</Text>
          </View>
          
          <View style={styles.step}>
            <Text style={styles.stepNumber}>3</Text>
            <Text style={styles.stepText}>Read the article without any paywall!</Text>
          </View>
        </View>
        
        {Platform.OS === 'android' ? <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Sharing instructions for Medium app</Text>
          <Text style={styles.infoText}>
          Tap the share button on the article, select "Share link via.." and choose "Medium2Freedium"   
          </Text>
        </View> : null}
        
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Sharing instructions</Text>
          <Text style={styles.infoText}>
            {Platform.OS === 'ios' 
              ? 'In Browser, tap the Share button and select "Medium2Freedium"'
              : 'In Broswer, tap the three dots menu, select "Share..." and choose "Medium2Freedium"'
            }
          </Text>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            This app converts Medium links to Freedium format, allowing you to bypass the Medium paywall.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 20,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  pasteContainer: {
    width: '100%',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingRight: 40,  
    marginBottom: 10,
    fontSize: 16,
    color: '#000',
  },
  inputWrapper: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    overflow: 'visible',
  },
  clearButton: {
    // position relative inside inputWrapper
    marginLeft: -40,
    marginBottom: 10,
    zIndex: 10,
    elevation: 10,
    padding: 8,
    alignSelf: 'center',
  },
  button: {
    backgroundColor: '#007bff',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  image: {
    width: 250,
    height: 100,
  },
  instructionContainer: {
    width: '100%',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  instructionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#007bff',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 30,
    fontWeight: 'bold',
    marginRight: 10,
  },
  stepText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  infoContainer: {
    width: '100%',
    backgroundColor: '#e6f7ff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#0066cc',
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  footer: {
    marginTop: 10,
    padding: 10,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  errorText: {
    color: '#d00',
    marginTop: -5,
    marginBottom: 10,
    fontSize: 14,
  },
});

export default HomeScreen;
