import React from 'react';
import { View, Text } from 'react-native';

const NewTab = ({ url }) => {
  // Customize the design and content for the different URL
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Custom Web Page</Text>
      <Text style={styles.url}>URL: {url}</Text>
      {/* Add your custom content here */}
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  url: {
    fontSize: 16,
    color: 'blue',
    marginBottom: 16,
  },
  // Add more styles for your custom content
};

export default NewTab;
