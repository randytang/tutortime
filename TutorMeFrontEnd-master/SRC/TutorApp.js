import { NavigationContainer } from '@react-navigation/native';
import { StyleSheet} from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import * as SecureStore from 'expo-secure-store';

import MainPage from './Screens/MainPage';
import NotificationScreen from './Screens/NotificationScreen';
import ProfileScreen from './Screens/ProfileScreen';
import LoginScreenV2 from './Screens/LoginScreenV2';

//import GlobalData from './GlobalData.js';

import ProfileRequest from './APICalls/ProfileRequest';

import { navigationRef } from './NavigationRef';
import { useState } from 'react';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import AppContext from './GlobalData.js';

const Stack = createNativeStackNavigator();

export default function App() {
  const [userProfile, setUserProfile] = useState({email : "Loading", first_name : "Loading", last_name : "Loading", school : "Loading", username :"Loading", year : "Loading", canTutor : "Loading"});
  const [notifications, setNotifications] = useState([]);
  const GlobalData = {userProfile : userProfile, ChangeUserProfile : ChangeUserProfile, notifications : notifications, setNotifications : setNotifications}

    async function ChangeUserProfile(){
        GetProfile();
        console.log("Changing Profile");
    }

    async function GetProfile(){
        var userId = await SecureStore.getItemAsync("user-id");
        var token = await SecureStore.getItemAsync("token");
        var profileInfo = await ProfileRequest({userId : userId, token : token});
        await parseProfileInfo(profileInfo);
        console.log(profileInfo);
    }

    async function parseProfileInfo(profile){
      var userEmail = profile.email;
      var userFirst = profile.first_name;
      var userLast = profile.last_name;
      var school = profile.school[1];
      var userName = profile.username;
      let year = profile.year;
      console.log(year);
      let canTutor = profile.groups;
      if(canTutor == "tutors"){
          canTutor = true;
          //add a way to grab info about you as a tutor here
      }
      else{
          canTutor = false;
      }
      userName = userName.toUpperCase();
      await setUserProfile({email : userEmail, first_name : userFirst, last_name : userLast, school : school, username :userName, year : year, canTutor : canTutor});
      console.log("Got here");
    }

    async function AddNotification(notification){
      console.log(notification.tutor + " here now");
      if(notification.tutor != null){
        setNotifications(notifications => [...notifications, {tutor : notification.tutor, time : notification.time, notes: notification.notes}]);
      }
    }

    async function ResetNotifications(){
      setNotifications([]);
    }

  return (
    <AppContext.Provider value={{userProfile:userProfile, ChangeUserProfile:ChangeUserProfile, notifications : notifications, AddNotification : AddNotification, ResetNotifications : ResetNotifications}}>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator screenOptions={{headerShown : false}}>
          <Stack.Screen name = "Login" component={LoginScreenV2}/>
          <Stack.Screen name = "Home" component={Home}/>
        </Stack.Navigator>
      </NavigationContainer>
    </AppContext.Provider>
  );
}


const Tab = createMaterialBottomTabNavigator();

function Home(){
  return(
    <Tab.Navigator tabBarPosition = 'bottom' screenOptions={{headerShown : false,}} 
    barStyle ={{backgroundColor : 'rgb(1,77,78)'}} >
      <Tab.Screen name='Main' component={MainPage}/>
      <Tab.Screen name='Notifications' component={NotificationScreen}/>
      <Tab.Screen name='Profile' component={ProfileScreen} />
    </Tab.Navigator>
  )

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
