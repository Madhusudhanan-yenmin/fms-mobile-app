import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store } from './src/store';
import { ThemeProvider } from './src/context';
import { AppContainer } from './src/AppContainer';

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AppContainer />
        </ThemeProvider>
      </SafeAreaProvider>
    </Provider>
  );
}
