import React, { useState, useEffect, useRef } from 'react';
import {
  AppRegistry,
  StyleSheet,
  View,
  StatusBar,
  BackHandler,
  Text,
  Alert,
  Linking, // Import Linking
  SafeAreaView,
} from 'react-native';
import { WebView } from 'react-native-webview';
import SplashScreen from './src/SplashScreen';
import NetInfo from '@react-native-community/netinfo';

// განსაზღვრეთ BsuPortal-ის მთავარი ფუნქციური კომპონენტი.
const BsuPortal = () => {
  // განსაზღვრეთ მდგომარეობის ცვლადები useState hook-ის გამოყენებით.
  const [showSplashScreen, setShowSplashScreen] = useState(true); // აკონტროლებს დახრილი ეკრანის ხილვადობას.
  const webViewRef = useRef(null); // მითითება WebView კომპონენტზე.
  const [newUrl, setNewUrl] = useState(''); // ინახავს URL-ს WebView-ში ჩასატვირთად.
  const [loading, setLoading] = useState(true); // მიუთითებს არის თუ არა WebView ჩატვირთვის მდგომარეობაში.
  const [isConnected, setIsConnected] = useState(true); // მიუთითებს, არის თუ არა მოწყობილობა დაკავშირებული ინტერნეტთან.
  

  // useEffect hook ტექნიკის უკანა ღილაკის დაჭერისა და დახრილი ეკრანის დასამალად.
  useEffect(() => {
    // განსაზღვრეთ ფუნქცია ტექნიკის უკანა ღილაკის დაჭერით.
    const backAction = () => {
      if (webViewRef.current) {
        webViewRef.current.goBack(); // დაუბრუნდით WebView ნავიგაციის ისტორიას.
        console.log('Hardware back button pressed. Navigating back in WebView.');
        return true; // თავიდან აიცილეთ ნაგულისხმევი უკან მოქმედება.
      }
      return false; // დაუშვით ნაგულისხმევი უკან მოქმედება.
    };

    BackHandler.addEventListener('hardwareBackPress', backAction); // დაარეგისტრირეთ ტექნიკის უკანა ღილაკის მსმენელი.

    // დაყოვნებული ეკრანის დამალვა (3 წამი).
    setTimeout(() => {
      console.log('Splash screen hidden after 3 seconds.');
      setShowSplashScreen(false);
    }, 3000);

    // გააუქმეთ ტექნიკის უკან დაბრუნების ღილაკის მსმენელი, როდესაც კომპონენტი დამონტაჟდება.
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', backAction);
    };
  }, []);

  // useEffect hook ინტერნეტ კავშირის მონიტორინგისთვის.
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      console.log('Internet connectivity status changed:', state.isConnected);
      setIsConnected(state.isConnected);

      if (!state.isConnected) {
        console.log('No Internet. Showing error message.');
        // თქვენ შეგიძლიათ შეცვალოთ ეს შეცდომის შეტყობინება, როგორც საჭიროა.
        Alert.alert(
          'Არ არის ინტერნეტ კავშირი',
          'გთხოვთ, შეამოწმოთ თქვენი ინტერნეტ კავშირი და სცადოთ ხელახლა.',
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

    return () => {
      unsubscribe();
    };
  }, []);

  // ფუნქცია WebView ნავიგაციის მოვლენების დასამუშავებლად.
  const handleWebViewNavigation = (newNavState) => {
    const { url, navigationType } = newNavState;

    if (!isConnected) {
      console.log('No Internet. Preventing WebView navigation.');
      return false; // WebView-ის ნავიგაციის თავიდან აცილება.
    }

    if (navigationType === 'click') {
      if (url.endsWith('.pdf')) {
        // PDF ჩამოტვირთვის მართვა...
        if (url.endsWith('.pdf')) {
          // PDF ჩამოტვირთვის მართვა...
      
          return false;
        }

        Linking.openURL(fileUrl)
          .then((supported) => {
            if (!supported) {
              console.error(`File type not supported: ${fileExtension}`);
              return false; // ნავიგაციის თავიდან აცილება, თუ ფაილის ტიპი არ არის მხარდაჭერილი
            }
          })
          .catch((err) => {
            console.error('An error occurred while opening the URL:', err);
            return false; // ნავიგაციის თავიდან აცილება შეცდომებზე
          });
      } else if (url.startsWith('mailto:')) {
        // ელ.ფოსტის ბმულების მართვა...
        Linking.openURL(url);
        return false;
      } else if (url.includes('facebook.com')) {
        // გახსენით Facebook ნაგულისხმევ ბრაუზერში ან Facebook აპში.
        Linking.openURL(url);
        return false;
      } else if (url.includes('instagram.com')) {
        // გახსენით Instagram ნაგულისხმევ ბრაუზერში ან Instagram აპში.
        Linking.openURL(url);
        return false;
      } else if (url.includes('youtube.com')) {
        // გახსენით YouTube ნაგულისხმევ ბრაუზერში ან YouTube აპში.
        Linking.openURL(url);
        return false;
      } else if (url.includes('zoom.us')) {
        // გახსენით Zoom ნაგულისხმევ ბრაუზერში ან Zoom აპში.
        Linking.openURL(url);
        return false;
      } else if (url.includes('teams.microsoft.com')) {
        // გახსენით Microsoft Teams ნაგულისხმევ ბრაუზერში ან Microsoft Teams აპში.
        Linking.openURL(url);
        return false;
      } else if (url.includes('drive.google.com')) {
        // გახსენით Google Drive ნაგულისხმევ ბრაუზერში ან Google Drive აპში.
        Linking.openURL(url);
        return false;
      }
    }

    return true; // ჩვეულებრივი WebView ნავიგაციის დაშვება ბმულების სხვა ტიპებისთვის.
  };
  

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
            source={{ uri: newUrl || 'https://portal.bsu.edu.ge/' }}
            style={styles.webView}
            
            javaScriptEnabled={true}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            onLoad={() => setLoading(false)}
            scrollEnabled={false}
            useWebKit={true}
            scalesPageToFit={false}
            setSupportMultipleWindows={false}

            userAgent={'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.190 Safari/537.36'}
           
    
            onShouldStartLoadWithRequest={handleWebViewNavigation}

            injectedJavaScript={`
              const meta = document.createElement('meta');
              meta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0');
              meta.setAttribute('name', 'viewport');
              document.getElementsByTagName('head')[0].appendChild(meta);
            `}
          />
        </>
      )}
    </SafeAreaView>
  );
};

// განსაზღვრეთ სტილები კომპონენტისთვის.
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

// დაარეგისტრირეთ BsuPortal კომპონენტი AppRegistry-ში.
AppRegistry.registerComponent('BsuPortal', () => BsuPortal);

// BsuPortal კომპონენტის ექსპორტი, როგორც ნაგულისხმევი ექსპორტი.
export default BsuPortal;
