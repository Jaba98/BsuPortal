import RNFetchBlob from 'rn-fetch-blob';
import { Platform, ToastAndroid, Alert, PermissionsAndroid } from 'react-native';
const requestStoragePermission = async () => {
  if (Platform.OS === 'android') {
    try {
      if (Platform.Version < 30) {
        
        // For Android versions below 11, request legacy storage permissions
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
        ]);

        if (
          granted['android.permission.WRITE_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.READ_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED
        ) {
          return true;
        }
      } else {
        // For Android 11 and above, you don't need to request MANAGE_EXTERNAL_STORAGE
        return true;
      }
      return false;
    } catch (err) {
      console.warn(err);
      return false;
    }
  }
  return true;
};
export const downloadFile = async (url) => {
  try {
    const hasStoragePermission = await requestStoragePermission();

    if (!hasStoragePermission) {
      ToastAndroid.show('Storage permission not granted. File download canceled.', ToastAndroid.LONG);
      return;
    }

    // Ask the user for confirmation
    Alert.alert(
      'ჩამოტვირთვის დადასტურება',
      'გსურთ ფაილის გადმოწერა?',
      [
        {
          text: 'გაუქმება',
          style: 'გაუქმება',
        },
        {
          text: 'ჩამოტვირთვა',
          onPress: async () => {
            // The user has confirmed the download
            const { dirs } = RNFetchBlob.fs;
            const downloadDir = Platform.OS === 'ios' ? dirs.DocumentDir : dirs.DownloadDir;
            // Start the download
            ToastAndroid.show('ფაილის ჩამოტვირთვა მიმდინარეობს...', ToastAndroid.LONG);
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
        let fileName = Date.now() + '.pdf'; // Default to timestamp
        let contentType = res.respInfo.headers['Content-Type'];
        
        if (contentDisposition) {
          const match = /filename="(.+)"/.exec(contentDisposition);
          if (match) {
            fileName = match[1];
          }
        }
    
        if (contentType) {
          // Extract the file extension from the content type
          const extensions = {
            'application/pdf': 'pdf',
            'image/jpeg': 'jpg',
            'application/msword': 'doc',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
            'application/vnd.ms-excel': 'xls',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
            'application/vnd.ms-powerpoint': 'ppt', // PowerPoint file extension
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx', // PowerPoint file extension for newer versions
            'application/zip': 'zip',
            // Add more mappings as needed
          };
          const extension = extensions[contentType];
          if (extension) {
            fileName = fileName.replace(/\.[^.]+$/, `.${extension}`);
          }
        }
        // Ensure the target directory exists
        const sanitizedFileName = fileName.replace(/[/\\?%*:|"<>]/g, ''); // Remove invalid characters
        const targetDir = downloadDir;
        const targetPath = `${targetDir}/${sanitizedFileName}`;
        
        // Attempt to move the file to the target directory
        try {
          await RNFetchBlob.fs.mv(sourcePath, targetPath);
          console.log('File downloaded to:', targetPath);
          ToastAndroid.show('ფაილსი გადმოწერა დასრულდა!', ToastAndroid.LONG);
    
          // Use 'fileName' in the addCompleteDownload function
          RNFetchBlob.android.addCompleteDownload({
            title: fileName,
            description: 'Download complete',
            mime: 'application/*',
            path: targetPath,
            showNotification: true,
          });
        } catch (error) {
          console.error('Error moving the file:', error);
          ToastAndroid.show('მოხდა შეცდომა ფაილის გადმოწერის დროს', ToastAndroid.LONG);
        }
      } else {
        console.error('Source file not found.');
        ToastAndroid.show('Source file not found. Download failed.', ToastAndroid.LONG);
      }

    } else {
      console.error('Error downloading file. Status code:', res.respInfo.status);
      ToastAndroid.show('Error downloading the file. Please try again.', ToastAndroid.LONG);
    }
  }
}
  ],
  { cancelable: false }
);
} catch (error) {
console.error('Error in downloadFile:', error);
ToastAndroid.show('An error occurred while downloading the file.', ToastAndroid.LONG);
}
};
