import RNFetchBlob from 'rn-fetch-blob';
import { Platform, PermissionsAndroid, ToastAndroid } from 'react-native';

export const downloadFile = async (url) => {
  try {
    const { dirs } = RNFetchBlob.fs;
    const downloadDir = Platform.OS === 'ios' ? dirs.DocumentDir : dirs.DownloadDir;

    // Check for permission to write to external storage
    const permissionStatus = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
    );

    if (permissionStatus !== PermissionsAndroid.RESULTS.GRANTED) {
      const requestResult = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
      );

      if (requestResult !== PermissionsAndroid.RESULTS.GRANTED) {
        ToastAndroid.show('Permission denied. Cannot download the file.', ToastAndroid.LONG);
        return;
      }
    }

    // Start the download
    ToastAndroid.show('მიმდინარეობს ფაილის გადმოწერა...', ToastAndroid.LONG);
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
