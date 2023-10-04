import React, { useState, useEffect, useRef } from 'react';
import { AppRegistry,StyleSheet,View,StatusBar,BackHandler,Text,Alert,Linking,SafeAreaView} from 'react-native';
import { WebView} from 'react-native-webview';
import SplashScreen from './SplashScreen';
import NetInfo from '@react-native-community/netinfo';
import RNFetchBlob from 'rn-fetch-blob';
import PushNotification from 'react-native-push-notification'; // for Android and iOS
import { ToastAndroid } from 'react-native';
import { useNavigation,useRoute, } from '@react-navigation/native';
import { PermissionsAndroid, Platform } from 'react-native';
import RNFS from 'react-native-fs';
import axios from 'axios';
import blobToBase64 from 'blob-to-base64';




const BsuPortal = () => {
  const [showSplashScreen, setShowSplashScreen] = useState(true); 
  const webViewRef = useRef(null);
  const [newUrl, setNewUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(true);
  const [originalUrl, setOriginalUrl] = useState('https://portal.bsu.edu.ge/'); // Track the original URL
  const navigation = useNavigation(); // Use useNavigation inside the functional component
  const route = useRoute(); // Use useRoute to access route params
  

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

        // --- handleWebViewNavigation ფუნქცია WebView ნავიგაციისთვის --
        const handleWebViewNavigation = (event) => {
             const { url, navigationType } = event;
             console.log(`URL: ${url}, Navigation Type: ${navigationType}`);
             

        }
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
              // Get the content type from response headers
              const contentType = res.respInfo.headers['Content-Type'];
        
              // Get the content-disposition header if available, or use a timestamp-based name
              let fileName = Date.now(); // Default to timestamp
              const contentDisposition = res.respInfo.headers['Content-Disposition'];
              if (contentDisposition) {
                const match = /filename="(.+)"/.exec(contentDisposition);
                if (match) {
                  fileName = match[1];
                }
              }
        
              // Check if contentType is defined and not null before accessing 'includes'
              if (contentType && contentType.includes) {
                // Append an appropriate file extension based on content type
                if (contentType.includes('pdf')) {
                  fileName += '.pdf';
                } else if (contentType.includes('xlsx')) {
                  fileName += '.xlsx';
                } else if (contentType.includes('xls')) {
                  fileName += '.xls';
                } else if (contentType.includes('docx')) {
                  fileName += '.docx';
                } else if (contentType.includes('doc')) {
                  fileName += '.doc';
                }
              } else {
                console.error('Content-Type is undefined or null:', contentType);
                return; // Exit the function if contentType is undefined or null
              }
        
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

                }}
                
                
              onShouldStartLoadWithRequest={(event) => {
                const { url } = event;
            
                 // Check if the URL starts with 'https://portal.bsu'
                 if (!url.startsWith('https://portal.bsu')) {
                   console.log('Blocked navigation to URL:', url);
                  // Check if the URL starts with 'https://portal.bsu'
                   navigation.navigate('იტვირთება...', { redirectedUrl: url });
                   console.log('open NewTab');
                   return false; // Block navigation for URLs that do not start with 'https://portal.bsu'
                 }

                // Check if the URL contains the download.php key
                if (url.includes('Download.php?Key=')) {
                  downloadFile(url);
                  return false; // Return false to cancel the WebView navigation
                }
                 // Check if the URL ends with a common file extension (e.g., PDF, Excel, Word)
                 const fileExtensions = ['.pdf', 'pdf', '.xlsx', 'xlsx', '.xls', 'xls', '.doc', 'doc', '.docx', 'docx','zip','rar','RAR'];
                 const lowercaseUrl = url.toLowerCase();
                 const hasValidExtension = fileExtensions.some(extension => lowercaseUrl.endsWith(extension));
                  
                  if (hasValidExtension) {
                    // Handle the file download
                    downloadFile(url);
                    return false; // Return false to cancel the WebView navigation
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