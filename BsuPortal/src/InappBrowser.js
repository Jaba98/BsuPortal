import InAppBrowser from 'react-native-inappbrowser-reborn';

export const openInAppBrowser = async (url) => {
  try {
    // Check if the in-app browser is available
    if (await InAppBrowser.isAvailable()) {
      // Open the in-app browser with the specified URL and options
      const result = await InAppBrowser.open(url, {
        // iOS Properties
        dismissButtonStyle: 'cancel',
        preferredBarTintColor: 'blue',
        preferredControlTintColor: 'white',
        readerMode: false,
        animated: true,
        modalPresentationStyle: 'fullScreen',
        modalTransitionStyle: 'coverVertical',
        modalEnabled: true,
        enableBarCollapsing: false,
        // Android Properties
        showTitle: true,
        toolbarColor: 'blue',
        secondaryToolbarColor: 'black',
        navigationBarColor: 'black',
        navigationBarDividerColor: 'white',
        enableUrlBarHiding: true,
        enableDefaultShare: false,
        forceCloseOnRedirection: false,
        animated: true,
        // Specify animation resources
        animations: {
          startEnter: 'slide_in_right',
          startExit: 'slide_out_left',
          endEnter: 'slide_in_left',
          endExit: 'slide_out_right'
        },
      });

      console.log('InAppBrowser opened successfully:', result);
    } else {
      console.error('InAppBrowser is not available. Please make sure the library is correctly installed and linked.');
    }
  } catch (error) {
    console.error('Error opening InAppBrowser:', error.message);
  }
};

export default openInAppBrowser;
