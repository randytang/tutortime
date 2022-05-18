import { StyleSheet, Text, View, 
    ScrollView, SafeAreaView } from 'react-native';
import React, { useContext} from 'react';
import MyCard from '../MyCard';
import { LinearGradient } from 'expo-linear-gradient';

import AppContext from '../GlobalData';

export default function NotificationScreen(props){

    const {notifications} = useContext(AppContext);

    return(
        <SafeAreaView style={{flex: 1, backgroundColor : 'rgb(165,42,42)', bottom : 0,}}>
            <LinearGradient colors = {['brown' , 'teal' ]} start={{x: 0, y : 0}} end={{x: 1, y : 1}} style={{flex : 1}}>
                <View style={{flex : 1, paddingBottom : 50, alignItems : 'center',paddingTop : 50}}>
                    <Text style={styles.notificationText}>Notifications</Text>
                    <ScrollView contentContainerStyle={{alignItems : 'center', marginVertical : '5%'}} style = {{marginBottom : '3%'}}>
                        {notifications.map((notification) =>
                        <MyCard>
                            <View style={styles.notificationCard}>
                                <Text> Your appointment with {notification.tutor} on {notification.time} has been cancelled</Text>
                                <Text>Notes : {notification.notes}</Text>
                            </View>
                        </MyCard>)}
                    </ScrollView>
                </View>
            </LinearGradient>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    notificationCard : {
        backgroundColor : 'white', opacity : 0.8,paddingVertical : '2%', width : '120%', 
        paddingHorizontal : '3%', marginVertical : '2%', borderRadius : 5, borderWidth : 2
    },
    notificationText : {color : 'gold', fontSize : 20},
})