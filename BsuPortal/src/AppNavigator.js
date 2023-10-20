import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import NewTab from './NewTab'; // Import your screens
import BsuPortalScreen from './BsuPortal';
import { Image, TouchableOpacity } from 'react-native'; // Import Image and TouchableOpacity

const Stack = createStackNavigator();
// Custom header component for the "NewTab" screen
const NewTabHeader = ({ navigation }) => ({
  cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS, // Slide-in animation
  headerTitleAlign: 'center', // Center the header title horizontally
  headerTitleStyle: {
    color: '#03a9f3', // Text color
    fontSize: 18, // Font size
  },
  headerStyle: {
    height: 50, // Adjust the header thickness (e.g., set to 80)
  },
  headerTitle: '', 
  headerLeft: () => (
    <TouchableOpacity
      onPress={() => {
        // Navigate back to the "Home" screen when the close button is pressed
        navigation.navigate('Home');
      }}
      style={{ marginLeft: 15 }}
    >
      <Image source={require('../image/Close_ic.png')} style={{ width: 18, height: 18 }} />
    </TouchableOpacity>
  ),
});

function AppNavigator() {
  return (
    
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={BsuPortalScreen}
          options={{ headerShown: false }} // Hide the header for the Home screen
        />
         <Stack.Screen
          name="NewTab"
          component={NewTab}
          options={NewTabHeader} // Use NewTabHeader as options for the "NewTab" screen
         />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
export default AppNavigator;