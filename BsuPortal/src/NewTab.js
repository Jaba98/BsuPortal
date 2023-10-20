import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, BackHandler, Text, ProgressBarAndroid,ProgressViewIOS, Platform, } from 'react-native';
import { WebView } from 'react-native-webview';
import { downloadFile } from './DownloadFile';


const NewTab = ({ route, navigation }) => {
  const { redirectedUrl } = route.params;
  const webViewRef = useRef(null);
  const fileExtensions = [
    '.pdf', 'pdf', '.xlsx', 'xlsx', '.xls', 'xls', '.doc', 'doc', '.docx', 'docx', '.zip', '.rar', '.RAR',
    '.ppt', 'ppt', '.pptx', 'pptx',
  ];
  const [progress, setProgress] = useState(0); // Add a state variable for progress
  const [showProgressBar, setShowProgressBar] = useState(true); // Initially set to true

  const webViewJS = `
  (function() {
    document.addEventListener('click', function(e) {
      if (e.target && e.target.tagName === 'A' && e.target.href) {
        // Check if the clicked link is a download link (e.g., PDF, ZIP, etc.)
        if (e.target.download) {
          // Handle the download link here, for example, by sending it to your app's native module.
        }
      }
    });
  })();
`;


  const extractDomain = (url) => {
    let domain = url;
    if (url.indexOf('://') > -1) {
      domain = url.split('/')[2];
    } else {
      domain = url.split('/')[0];
    }
    domain = domain.split(':')[0];
    if (domain.startsWith('www.')) {
      domain = domain.substring(4);
    }
    return domain;
  };

  const backAction = () => {
    if (webViewRef.current) {
      webViewRef.current.goBack();
      console.log('Hardware back button pressed. Navigating back in WebView.');
      return true;
    }
    return false;
  };

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', backAction);
    };
  }, []);
  const handleWebViewNavigation = (event) => {
    const { url, navigationType } = event;
  
    // Continue with your code to load the URL
    return true;
  };

  return (
    <View style={styles.container}>
        {/* Conditionally render the progress bar based on visibility */}
        {showProgressBar && (
        <View style={styles.progressBarContainer}>
          {/* Change the color of the progress bar */}
          {Platform.OS === 'android' ? (
            <ProgressBarAndroid
              styleAttr="Horizontal"
              indeterminate={false}
              progress={progress}
              color="#03a9f3" // Change the color of the progress bar
              style={{ height: 2 }}
            />
          ) : (
            <ProgressViewIOS
              progress={progress}
              progressTintColor="#03a9f3"
              style={{ height: 2 }}
            />
          )}
        </View>
      )}

      <WebView
        ref={webViewRef}
        source={{ uri: redirectedUrl }}
        style={styles.webView}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        //startInLoadingState={isLoading} // Set startInLoadingState based on isLoading state
        setSupportMultipleWindows={false}
        mixedContentMode="always"
        useWebKit={true}
        ignoreSslError={true}
        onLoadProgress={({ nativeEvent }) => {
          const { progress } = nativeEvent;
          setProgress(progress);
          setShowProgressBar(true);

          if (progress === 1.0) {
            // Hide the progress bar and its background when fully loaded
            setShowProgressBar(false);
          }
        }}
        userAgent={
          'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.81 Mobile Safari/537.36'
        }
        injectedJavaScript={webViewJS}
        onNavigationStateChange={(navState) => {
          // Extract the domain from the URL using the extractDomain function
          const domain = extractDomain(navState.url);
          handleWebViewNavigation(navState);
          // Render a custom header title with yellow text color
          navigation.setOptions({
            headerTitle: () => (
              <Text style={{ color: '#03a9f3', fontSize: 18, textAlign: 'center' }}>
                {domain || redirectedUrl}
              </Text>
            ),
          });
        }}

        onShouldStartLoadWithRequest={(event) => {
          if (event && event.url) {
            const { url } = event;
            console.log('Attempting to open URL:', url);
                    // Convert the URL to lowercase before checking
            const lowercaseUrl = url.toLowerCase();
        
            // Check if the URL ends with a common file extension
            const hasValidExtension = fileExtensions.some(extension => lowercaseUrl.endsWith(extension));
        
            if (hasValidExtension) {
              downloadFile(url);
              return false; // Return false to prevent WebView navigation
            }
          }
        
          // Allow other requests to load in the WebView
          return true;
        }}

      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    margin: 10,
  },
  webView: {
    flex: 1,
  },
  progressBarContainer: {
    backgroundColor: '#fff', // Change the background color of the progress bar container
  },
});

export default NewTab;
