import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, BackHandler, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { ToastAndroid } from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';
import { Linking } from 'react-native';

const NewTab = ({ route, navigation }) => {
  const { redirectedUrl } = route.params;
  const webViewRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const fileExtensions = ['.pdf', 'pdf', '.xlsx', 'xlsx', '.xls', 'xls', '.doc', 'doc', '.docx', 'docx','zip','rar','RAR'];


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

        console.log(`URL: ${url}, Navigation Type: ${navigationType}`);
        if (navigationType === 'click' || navigationType === 'formsubmit') {
          // A link was clicked or a form was submitted, so we consider it as loading
          setIsLoading(true);
        } else if (navigationType === 'other') {
          if (isLoading && url !== redirectedUrl) {
            // This handles the completion of loading when other types of navigation occur
            setIsLoading(false);
          }
        }
         // განახორციელეთ HTTPS, თუ URL უკვე არ იწყება მისით
         if (!url.startsWith('https://')) {
          console.log('Insecure connection detected. Redirecting to HTTPS.');
          const secureUrl = 'https://' + url.replace(/^https?:\/\//i, '');
          webViewRef.current.injectJavaScript(`
            window.location.href = "${secureUrl}";
          `);
          return false;
        }
    // Continue with your code to load the URL


    return true;
  };

  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <Text style={{ color: '#03a9f3', fontSize: 18, textAlign: 'center' }}>
          {isLoading || !webViewRef.current?.state.url ? 'დაელოდეთ...' : extractDomain(webViewRef.current.state.url)}
        </Text>
      ),
    });
  }, [isLoading]);
  const downloadFile = (url) => {
    // Set up the config for the file download
    const config = {
      fileCache: true,
    };
  
    ToastAndroid.show('მიმდინარეობს ფაილის გადმოწერა...', ToastAndroid.SHORT);
    // Start the download
    RNFetchBlob.config(config)
      .fetch('GET', url)
      .then((res) => {
        // Get the file name from the URL
        const fileName = url.split('/').pop();
  
        // Move the downloaded file to the appropriate location with the correct name
        RNFetchBlob.fs
          .mv(res.path(), `${RNFetchBlob.fs.dirs.DownloadDir}/${fileName}`)
          .then(() => {
            console.log('File downloaded to:', `${RNFetchBlob.fs.dirs.DownloadDir}/${fileName}`);
  
            // Use 'fileName' in the addCompleteDownload function
            RNFetchBlob.android.addCompleteDownload({
              title: `${fileName}`,
              description: 'Download complete',
              mime: 'application/*',
              path: `${RNFetchBlob.fs.dirs.DownloadDir}/${fileName}`,
              showNotification: true,
            });
            ToastAndroid.show('ჩამოტვირთვა დასრულდა!', ToastAndroid.SHORT);
          })
          .catch((error) => {
            console.error('Error moving file:', error);
          });
      })
      .catch((error) => {
        console.error('Error downloading file:', error);
      });
  };
  
  
  

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ uri: redirectedUrl }}
        style={styles.webView}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={isLoading} // Set startInLoadingState based on isLoading state
        setSupportMultipleWindows={false}
        mixedContentMode="always"
        useWebKit={true}
        userAgent={
          'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.81 Mobile Safari/537.36'
        }
        injectedJavaScript={`
        const meta = document.createElement('meta');
        meta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0');
        meta.setAttribute('name', 'viewport');
        document.getElementsByTagName('head')[0].appendChild(meta);'});
        });
      `}
        onNavigationStateChange={(navState) => {
          // Extract the domain from the URL using the extractDomain function
          const domain = extractDomain(navState.url);

          // Render a custom header title with yellow text color
          navigation.setOptions({
            headerTitle: () => (
              <Text style={{ color: '#03a9f3', fontSize: 18, textAlign: 'center' }}>
                {domain || redirectedUrl}
              </Text>
            ),
          });
          handleWebViewNavigation(navState);
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
});

export default NewTab;
