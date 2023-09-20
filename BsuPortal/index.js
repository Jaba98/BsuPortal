import React, { useState, useEffect, useRef } from 'react';
import {
  AppRegistry,StyleSheet,View,StatusBar,BackHandler,Text,Alert,Linking,SafeAreaView,TouchableOpacity} from 'react-native';
import { WebView} from 'react-native-webview';
import SplashScreen from './src/SplashScreen';
import NetInfo from '@react-native-community/netinfo';
import { Image } from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';
import RNFS from 'react-native-fs';

const BsuPortal = () => {
  const [showSplashScreen, setShowSplashScreen] = useState(true); 
  const webViewRef = useRef(null);
  const [newUrl, setNewUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(true);
  const [showHeader, setShowHeader] = useState(false);
  const [redirectedUrl, setRedirectedUrl] = useState('');
  const [originalUrl, setOriginalUrl] = useState('https://portal.bsu.edu.ge/'); // Track the original URL
  const [showPdfView, setShowPdfView] = useState(false);


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
  
    // Remove "https://" prefix from the URL
    const urlWithoutHttps = url.replace(/^https:\/\/(www\.)?/, '');
    // Set the redirected URL
    setRedirectedUrl(urlWithoutHttps);

    // Check if the URL starts with 'https://portal' to hide/show the header
    if (url.startsWith('https://portal')) {
      setShowHeader(false);
    } else {
      setShowHeader(true);
    }
  
    if (!isConnected) {
      console.log('No Internet. Preventing WebView navigation.');
      return false;
    }
  
    // Ensure that the URL starts with 'https://'
    if (!url.startsWith('https://')) {
      console.log('Insecure connection detected. Redirecting to HTTPS.');
      const secureUrl = 'https://' + url.replace(/^https?:\/\//i, '');
      webViewRef.current.injectJavaScript(`
        window.location.href = "${secureUrl}";
      `);
      return false;
    }


    // Allow other requests to load
    return true;
  };

        // Updated handleFileDownload function to handle file downloads
      const handleFileDownload = async (url) => {
        try {
          const downloadDir = RNFS.DownloadDirectoryPath;
          const response = await RNFetchBlob.config({
            path: `${downloadDir}/filename.extension`, // Default name, will be updated based on headers
            overwrite: true,
          }).fetch('GET', url);
      
          const status = response.info().status;
          console.log('Response Status:', status);
      
          if (status === 200) {
            // Get the content disposition header
            const contentDisposition = response.info().headers['Content-Disposition'];
            
            if (contentDisposition) {
              // Extract the filename from the content disposition header
              const filename = contentDisposition.split(';')[1].trim().split('=')[1].replace(/"/g, '');
              
              // Update the path with the extracted filename
              const filePath = `${downloadDir}/${filename}`;
              
              // Move the downloaded file to the correct path
              await RNFS.moveFile(response.path(), filePath);
      
              console.log('File Downloaded. Path:', filePath);
              
              // Check if the file exists at the specified path
              const exists = await RNFS.exists(filePath);
              if (exists) {
                console.log('File exists at the specified path.');
              } else {
                console.error('File does not exist at the specified path.');
              }
            } else {
              console.error('Content-Disposition header not found.');
            }
          } else {
            console.error('HTTP Error:', status);
            
            // Handle other HTTP status codes here
            if (status === 404) {
              console.error('File not found.');
            } else if (status === 403) {
              console.error('Access denied.');
            } else {
              console.error('Unhandled HTTP status code.');
            }
          }
        } catch (error) {
          console.error('File download error:', error);
          // Handle the error and log it
        }
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
                if (webViewRef.current) {
                  // Navigate back to the original URL when the button is pressed
                  webViewRef.current.injectJavaScript(`
                    window.location.href = "${originalUrl}";
                  `);
               }}
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
                  // Disable clicking on links leading to the specific URL
                  document.querySelectorAll('a[href="URL_TO_STOP_DOWNLOADING"]').forEach(link => {
                    link.addEventListener('click', (event) => {
                      event.preventDefault();
                      event.stopPropagation();
                    });
                  });
                `}

              onNavigationStateChange={handleWebViewNavigation}
              onShouldStartLoadWithRequest={(event) => {
                const { url } = event;
            
                // Check if the URL contains the download.php key
                if (url.includes('Download.php?Key=')) {
                  // Handle the file download
                  handleFileDownload(url);
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
