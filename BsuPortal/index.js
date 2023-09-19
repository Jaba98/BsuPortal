import React, { useState, useEffect, useRef } from 'react';
import {
  AppRegistry,StyleSheet,View,StatusBar,BackHandler,Text,Alert,Linking,SafeAreaView,TouchableOpacity} from 'react-native';
import { WebView} from 'react-native-webview';
import SplashScreen from './src/SplashScreen';
import NetInfo from '@react-native-community/netinfo';
import { Image } from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';


const BsuPortal = () => {
  const [showSplashScreen, setShowSplashScreen] = useState(true); 
  const webViewRef = useRef(null);
  const [newUrl, setNewUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(true);
  const [showHeader, setShowHeader] = useState(false);
  const [redirectedUrl, setRedirectedUrl] = useState('');
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
          'No Internet Connection',
          'Please check your internet connection and try again.',
          [
            {
              text: 'Refresh',
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


  // --- handleWebViewNavigation ფუნქცია WebView ნავიგაციისთვის ---
  const handleWebViewNavigation = (event) => {
    const { url, navigationType } = event;
    console.log(url, 'მუშაობს')


    // Remove "https://" prefix from the URL
     const urlWithoutHttps = url.replace(/^https:\/\/(www\.)?/, '');
     // Set the redirected URL
     setRedirectedUrl(urlWithoutHttps);

     // Check if the URL starts with '//portal' to hide/show the header
    if (url.startsWith('https://portal')) {
      setShowHeader(false);
    } else {
      setShowHeader(true);
    }

    if (!isConnected) {
      console.log('No Internet. Preventing WebView navigation.');
      return false;
    }
    
    // განახორციელეთ HTTPS, თუ URL უკვე არ იწყება მისით
    if (!url.startsWith('https://')) {
      console.log('Insecure connection detected. Redirecting to HTTPS.');
      const secureUrl = 'https://' + url;
      webViewRef.current.injectJavaScript(`
        window.location.href = "${secureUrl}";
      `);
      return false
    }

    return true;

  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#03a9f3" barStyle="dark-content" />

      {showHeader && (
         <View style={styles.header}>
          <View style={styles.headerTextSt}>
             <Text numberOfLines={1} ellipsizeMode="tail" style={styles.redirectedUrlText}>
               {redirectedUrl}
             </Text>
           </View>
           <TouchableOpacity
        style={styles.closeButtonContainer}
        onPress={() => {
          if (webViewRef.current) {
            // Navigate back to the original URL when the button is pressed
            const secureUrl = 'https://' + originalUrl.replace(/^https:\/\/(www\.)?/, '');
            webViewRef.current.injectJavaScript(`
              window.location.href = "${secureUrl}";
            `);
          }
        }}
      >
        {/* Replace the "Close" text with an Image */}
        <Image
          source={require('./image/Close_ic.png')} // Provide the correct image path
          style={styles.closeButtonImage} // Adjust the width and height as needed
        />
      </TouchableOpacity>
         </View>
      )}

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

          {/* WebView კომპონენტი */}
          <WebView
             ref={webViewRef}
             // მიუთითეთ წყაროს URL WebView-ისთვის, გამოიყენეთ „newUrl“, თუ ეს შესაძლებელია, ან ნაგულისხმევი URL
             source={{ uri: newUrl || 'https://portal.bsu.edu.ge/' }}
             style={styles.webView}
             // ჩართეთ გადახვევა WebView-ში
             scrollEnabled={true}
             // ჩართეთ JavaScript-ის შესრულება WebView-ში
             javaScriptEnabled={true}
             // Disable DOM storage (localStorage/sessionStorage)
             domStorageEnabled={false} 
             // გამოძახება „ჩატვირთვის“ მდგომარეობის დასაყენებლად ჭეშმარიტად, როდესაც WebView ჩატვირთვას დაიწყებს
             onLoadStart={() => setLoading(true)}
             // გამოძახება „ჩატვირთვის“ მდგომარეობის დასაყენებლად false-ზე, როდესაც WebView დაასრულებს ჩატვირთვას
             onLoadEnd={() => setLoading(false)}
             // გამოძახება „ჩატვირთვის“ მდგომარეობის დასაყენებლად false-ზე, როდესაც WebView დაასრულებს ჩატვირთვას
             onLoad={() => {
              setLoading(false); // Hide loading indicator
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
               document.getElementsByTagName('head')[0].appendChild(meta);
             `}

             onNavigationStateChange={handleWebViewNavigation}
             onShouldStartLoadWithRequest={(event) => {
              const { url, navigationType } = event;
              console.log(`URL: ${url}, გადმოწერის ლინკი გამომიჩნდდა: ${navigationType}`);
            
              // Allow other requests to load
              console.log('Allowed request');
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
  splashContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  webView: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  headerTextSt: {
    marginLeft: 100,
    marginRight: 50,
  },

   closeButtonContainer: {
     position: 'absolute',
     left: 10,
   },
   
   closeButtonImage: {
     width: 20,
     height: 20,
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

  header: {
    height: 40,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// დაარეგისტრირეთ კომპონენტი AppRegistry-ით
AppRegistry.registerComponent('BsuPortal', () => BsuPortal);

// კომპონენტის ექსპორტი, როგორც ნაგულისხმევი ექსპორტი
export default BsuPortal;
