import RNFetchBlob from 'rn-fetch-blob';
import { Platform, PermissionsAndroid, ToastAndroid } from 'react-native';

export const getDownloadPermissionAndroid = async () => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      {
        title: 'File Download Permission',
        message: 'Your permission is required to save files to your device',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      }
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) return true;
  } catch (err) {
    console.error('Error while requesting permission:', err);
  }
  return false; // Return false if permission is not granted
};

export const downloadFile = async (url) => {
  try {
    const { dirs } = RNFetchBlob.fs;
    const downloadDir = Platform.OS === 'ios' ? dirs.DocumentDir : dirs.DownloadDir;

    // Check for permission to write to external storage
    const permissionStatus = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
    if (permissionStatus !== PermissionsAndroid.RESULTS.GRANTED) {
      const requestResult = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
      if (requestResult !== PermissionsAndroid.RESULTS.GRANTED) {
        ToastAndroid.show('Permission denied. Cannot download the file.', ToastAndroid.LONG);
        return;
      }
    }

    // Start the download
    ToastAndroid.show('Downloading file...', ToastAndroid.LONG);
    const res = await RNFetchBlob.config({ fileCache: true }).fetch('GET', url);

    // Check if the download was successful
    if (res.respInfo.status === 200) {
      const sourcePath = res.path();
      console.log('Source path:', sourcePath);

      // Verify file existence before moving
      const fileExists = await RNFetchBlob.fs.exists(sourcePath);
      console.log('File downloaded:', fileExists);

      if (fileExists) {
        const contentDisposition = res.respInfo.headers['Content-Disposition'];
        let fileName = Date.now() + '.unknown'; // Default to timestamp

        if (contentDisposition) {
          const match = /filename="(.+)"/.exec(contentDisposition);
          if (match) {
            fileName = match[1];
          }
        }

        // Ensure the target directory exists
        const targetDir = downloadDir; // Define your target directory
        const targetPath = `${targetDir}/${fileName}`;

        try {
          await RNFetchBlob.fs.mkdir(targetDir); // Ensure the directory exists
          await RNFetchBlob.fs.mv(sourcePath, targetPath);
          console.log('File downloaded to:', targetPath);
          ToastAndroid.show('File downloaded successfully!', ToastAndroid.LONG);

          // Use 'fileName' in the addCompleteDownload function
          RNFetchBlob.android.addCompleteDownload({
            title: `${fileName}`,
            description: 'Download complete',
            mime: 'application/*',
            path: targetPath,
            showNotification: true,
          });
        } catch (error) {
          console.error('Error moving the file:', error);
          ToastAndroid.show('An error occurred while moving the file.', ToastAndroid.LONG);
        }
      } else {
        console.error('Source file not found.');
        ToastAndroid.show('Source file not found. Download failed.', ToastAndroid.LONG);
      }
    } else {
      console.error('Error downloading file. Status code:', res.respInfo.status);
      ToastAndroid.show('Error downloading the file. Please try again.', ToastAndroid.LONG);
    }
  } catch (error) {
    console.error('Error in downloadFile:', error);
    ToastAndroid.show('An error occurred while downloading the file.', ToastAndroid.LONG);
  }
};
