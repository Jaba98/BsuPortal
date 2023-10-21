import { AppRegistry } from 'react-native';
import BsuPortal from './src/BsuPortal'; // Import the BsuPortal component
import { name as appName } from './app.json';

// Register the BsuPortal component as the root component
AppRegistry.registerComponent(appName, () => BsuPortal);