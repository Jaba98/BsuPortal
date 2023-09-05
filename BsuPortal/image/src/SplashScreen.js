import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <Image source={require('../image/splash_image.png')} style={styles.logo} />
      <Text style={styles.text}>მოგესალმებით</Text>
      <Text style={styles.text}>სტუდენტურ პორტალზე</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#03a9f3', // Set the text color to white
  },
});

export default SplashScreen;