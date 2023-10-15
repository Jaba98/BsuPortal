import React, { useState, useEffect, useRef } from 'react';
import { AppRegistry,StyleSheet,View,StatusBar,BackHandler,Text,Alert,Linking,SafeAreaView} from 'react-native';
import { WebView} from 'react-native-webview';
import SplashScreen from './SplashScreen';
import NetInfo from '@react-native-community/netinfo';
import  openInAppBrowser  from './InappBrowser';

const BsuPortal = () => {
  const [showSplashScreen, setShowSplashScreen] = useState(true); 
  const webViewRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(true);
  const [originalUrl, setOriginalUrl] = useState('https://portal.bsu.edu.ge/'); // Track the original URL
  
  // --- useEffect ტექნიკის დაბრუნების ღილაკის დასამუშავებლად---
  useEffect(() => {

    // უკანა ღილაკის დაჭერის ფუნქცია
    const backAction = () => {
      if (webViewRef.current) {
        webViewRef.current.goBack();
        console.log('Hardware back button pressed. Navigating back in WebView.');
        return true;
      }
      return false;
    };

    // მოვლენის მსმენელის დამატება აპარატურის უკან ღილაკისთვის
    BackHandler.addEventListener('hardwareBackPress', backAction);

    // 3 წამის შემდეგ დამალეთ დახრილი ეკრანი
    setTimeout(() => {
      console.log('Splash screen hidden after 3 seconds.');
      setShowSplashScreen(false);
    }, 3000);

    // გასუფთავება: ამოიღეთ მოვლენის მსმენელი კომპონენტის დემონტაჟის დროს
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', backAction);
    };
  }, []);

  // --- useEffect ინტერნეტ კავშირის მონიტორინგისთვის ---
  useEffect(() => {
    // გამოიწერეთ ქსელის მდგომარეობის ცვლილებები
    const unsubscribe = NetInfo.addEventListener((state) => {
      console.log('Internet connectivity status changed:', state.isConnected);
      setIsConnected(state.isConnected);

      if (!state.isConnected) {
        console.log('No Internet. Showing error message.');
        Alert.alert(
          'Არ არის ინტერნეტ კავშირი',
          'გთხოვთ, შეამოწმოთ თქვენი ინტერნეტ კავშირი და სცადოთ ხელახლა.',
          [
            {
              text: 'განახლება',
              onPress: () => {
                webViewRef.current.reload();
              },
            },
          ]
        );
      }
    });

    // გასუფთავება: გამოწერის გაუქმება კომპონენტის დამონტაჟებისას
    return () => {
      unsubscribe();
    };
    
  }, []);

        // --- handleWebViewNavigation ფუნქცია WebView ნავიგაციისთვის --
        const handleWebViewNavigation = (event) => {
             const { url, navigationType } = event;
             console.log(`URL: ${url}, Navigation Type: ${navigationType}`);
            
        }
   return (
    <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#03a9f3" barStyle="dark-content" />

      {showSplashScreen ? (
        <View style={styles.splashContainer}>
          <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />
          <SplashScreen />
        </View>
      ) : (
        <>
          {!isConnected && (
            <View style={styles.internetMessageContainer}>
              <Text style={styles.internetMessageText}>Please turn on the Internet.</Text>
            </View>
          )}

          <WebView
             ref={webViewRef}
             // მიუთითეთ წყაროს URL WebView-ისთვის, გამოიყენეთ „newUrl“, თუ ეს შესაძლებელია, ან ნაგულისხმევი URL
             source={{ uri: originalUrl }} // Use the current URL in the WebView source
             style={styles.webView}
             // ჩართეთ გადახვევა WebView-ში
             scrollEnabled={true}
             // ჩართეთ JavaScript-ის შესრულება WebView-ში
             javaScriptEnabled={true}
             // გამოძახება „ჩატვირთვის“ მდგომარეობის დასაყენებლად ჭეშმარიტად, როდესაც WebView ჩატვირთვას დაიწყებს
             onLoadStart={() => setLoading(true)}
             // გამოძახება „ჩატვირთვის“ მდგომარეობის დასაყენებლად false-ზე, როდესაც WebView დაასრულებს ჩატვირთვას
             onLoadEnd={() => setLoading(false)}
             // გამოძახება „ჩატვირთვის“ მდგომარეობის დასაყენებლად false-ზე, როდესაც WebView დაასრულებს ჩატვირთვას
             onLoad={() => {
              setLoading(true); // Hide loading indicator
            }}
             // გამოიყენეთ WKWebView ძრავა iOS-ზე გაუმჯობესებული შესრულებისა და თანმიმდევრულობისთვის
             useWebKit={true}
             // გამორთეთ შინაარსის ავტომატური მასშტაბირება ეკრანზე მორგებისთვის
             scalesPageToFit={true}
             // დააყენეთ მომხმარებლის აგენტის სათაური WebView-ისთვის
             userAgent={
               'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.81 Mobile Safari/537.36'
             }
             // გამორთეთ მხარდაჭერა მრავალი ფანჯრის ან ჩანართისთვის WebView-ში
             setSupportMultipleWindows={false}
             // ჩართეთ გაზიარებული ქუქიები მომხმარებლის სესიების შესანარჩუნებლად WebView-სა და აპს შორის
             sharedCookiesEnabled={true}
             // შერეული კონტენტის ჩატვირთვის დაშვება (HTTP კონტენტი HTTPS გვერდზე)
             mixedContentMode="always"
             // შეიტანეთ მორგებული JavaScript კოდი WebView-ში ხედვის პორტის მეტა ტეგის დასაყენებლად
             injectedJavaScript={`
                  const meta = document.createElement('meta');
                  meta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0');
                  meta.setAttribute('name', 'viewport');
                  document.getElementsByTagName('head')[0].appendChild(meta);'});
                  });
                `}

                onNavigationStateChange={(navState) => {
                  handleWebViewNavigation(navState);
                  const { url } = navState;

                }}
                
              onShouldStartLoadWithRequest={(event) => {
                const authorizedUrl = `${setOriginalUrl}authorize.php?url=${encodeURIComponent(url)}`;
                const { url } = event;
                console.log('onShouldStartLoadWithRequest URL:', url);
                if (!url.startsWith('https://portal.bsu')) {
                  console.log('Blocked navigation to URL:', url);
                   // Open the redirected URL using the function from InAppBrowser.js
                  openInAppBrowser(url);
                  console.log('Opening InAppBrowser for URL:', url);
              
                  return false; // Block navigation for URLs that do not start with 'https://portal.bsu'
                }

                // Check if the URL contains the download.php key
                if (url.includes('Download.php?Key=')) {
                  console.log('Download.php:', url);
                  openInAppBrowser(url);
                  return false; // Return false to cancel the WebView navigation
                }
                 // Check if the URL ends with a common file extension (e.g., PDF, Excel, Word)
                 const fileExtensions = [
                  '.pdf', 'pdf', '.xlsx', 'xlsx', '.xls', 'xls', '.doc', 'doc', '.docx', 'docx', '.zip', '.rar', '.RAR',
                  '.ppt', 'ppt', '.pptx', 'pptx',
                ];
                 const lowercaseUrl = url.toLowerCase();
                 const hasValidExtension = fileExtensions.some(extension => lowercaseUrl.endsWith(extension));
                  
                  if (hasValidExtension) {
                    // Handle the file download
                    console.log('hasValidExtension:', url);
                    openInAppBrowser(url);
                  }
                // Allow other requests to load
                return true;
              }}

               /> 
             </>
           )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  downloadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  downloadingText: {
    color: '#000000', // Change to the desired text color
    fontSize: 18, // Adjust the font size as needed
  },

  splashContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  webView: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
   redirectedUrlText: {
    color: '#03a9f3', // Change 'red' to the desired color
    fontSize: 16, // Adjust the font size as needed
  },

  internetMessageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  internetMessageText: {
    color: '#000000',
    fontSize: 18,
  },

});

// დაარეგისტრირეთ კომპონენტი AppRegistry-ით
AppRegistry.registerComponent('BsuPortal', () => BsuPortal);

// კომპონენტის ექსპორტი, როგორც ნაგულისხმევი ექსპორტი
 export default BsuPortal;