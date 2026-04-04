import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Slot } from 'expo-router';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '../src/redux/store';
import { Colors } from '../src/constants/theme';

function Splash() {
  return (
    <View style={styles.splash}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <PersistGate loading={<Splash />} persistor={persistor}>
        <Slot />
      </PersistGate>
    </Provider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
