import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
//import LoginScreen from './SRC/Screens/LoginScreen';
//import MainPage from './SRC/Screens/MainPage';
//import { navigationRef } from './SRC/NavigationRef';*/
import TutorApp from './SRC/TutorApp';


const Stack = createNativeStackNavigator();
export default function App() {
  return (
      <TutorApp/>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
