import { AppRegistry } from 'react-native';
import MainApp from './App'; // Rename the imported component to MainApp
import { name as appName } from './app.json';
import AppNavigator from './src/AppNavigator';

function BsuPortal() {
  return <AppNavigator />;
}

AppRegistry.registerComponent(appName, () => BsuPortal);