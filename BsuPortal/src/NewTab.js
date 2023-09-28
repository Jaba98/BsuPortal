import React, { useEffect, useRef,useState } from 'react';
import { View, StyleSheet,BackHandler,Text} from 'react-native';
import { WebView } from 'react-native-webview'

const NewTab = ({ route,navigation }) => {
  // Get the redirected URL from the route parameters
  const { redirectedUrl } = route.params;
  const webViewRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

   // Function to extract the domain from a URL
   const extractDomain = (url) => {
    let domain = url;
    // Find & remove protocol (http, ftp, etc.) and get the domain
    if (url.indexOf('://') > -1) {
      domain = url.split('/')[2];
    } else {
      domain = url.split('/')[0];
    }
    // Find & remove port number
    domain = domain.split(':')[0];
    // Remove "www" if it exists at the beginning of the domain
    if (domain.startsWith('www.')) {
      domain = domain.substring(4);
    }
    return domain;
  };

  const backAction = () => {
    if (webViewRef.current) {
      webViewRef.current.goBack();
      console.log('Hardware back button pressed. Navigating back in WebView.');
      return true; // Return true to indicate that the back button press is handled
    }
    return false; // Return false if the WebView cannot go back
  };

     // --- useEffect ტექნიკის დაბრუნების ღილაკის დასამუშავებლად---
     useEffect(() => {
      BackHandler.addEventListener('hardwareBackPress', backAction);
    
      return () => {
        BackHandler.removeEventListener('hardwareBackPress', backAction);
      };
    }, []);

    // --- handleWebViewNavigation ფუნქცია WebView ნავიგაციისთვის ---
      const handleWebViewNavigation = (event) => {
        const { url, navigationType, loading } = event;
    
        if (loading) {
          // The WebView is currently loading a new page
          setIsLoading(true); // Set loading state to true when a new page starts loading
        } else {
          // The WebView has finished loading
          setIsLoading(false); // Set loading state to false when the page has finished loading
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

        return true;
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