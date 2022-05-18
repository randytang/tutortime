import { Alert, StyleSheet, Text, View, Button, TextInput, SafeAreaView, Image, Linking } from 'react-native';
import {Fragment } from 'react/cjs/react.production.min';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {useState} from 'react';

import * as RootNavigation from '../NavigationRef';

import UserLogin from '../APICalls/UserLogin'
import CreateNewUser from '../APICalls/CreateNewUser';
import SignUpModal from '../SignUpModal';
import { TouchableOpacity } from 'react-native-gesture-handler';

export default function LoginScreenV2 (){

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    

    let passwordRef = null;

    async function LoginAttempt (username, password){

        //change username to lowercase to fit api scheme
        username = username.toLowerCase();
        const canLogin = await UserLogin({username : username, password : password});

        if(canLogin){
            //change password to empty string so password is not stored to be stolen
            setPassword("");
            //make sure modal is invisible so it does not obscure next screen
            setModalVisible(false);
            RootNavigation.navigate('Home', {token : canLogin.token, user_id : canLogin.user_id});
        }
        else{
            Alert.alert("Username or Password was incorrect");
        }
    }

    async function createNewUser(firstName, lastName, newUser, email, newPass, confirmPass, schoolId){
        var canSignUp = checkSignUpStatus(newPass, newUser, firstName, lastName, email, schoolId, confirmPass);
        var signingUp = false;
        //console.log(canSignUp);
        if(canSignUp){
            var userPassed = newUser;
            userPassed = userPassed.toLowerCase();
            
            signingUp = await CreateNewUser({firstName : firstName, lastName : lastName, userName : userPassed, 
                            email : email, password : newPass, school : schoolId, password2 : confirmPass});
        }

        if(signingUp){
            await setUsername(newUser);
            await setPassword(newPass);
            LoginAttempt(newUser, newPass);
        }
        else{
            Alert.alert(signingUp);
        }
    }
    

    function checkSignUpStatus(newPass, newUser, firstName, lastName, email, selectedSchool, confirmPass){
        if(newPass != ""  && newUser != "" && firstName != "" && lastName != ""
                && email != "" && selectedSchool != "Search"){
                    if(newPass == confirmPass){
                        if(!email.includes(" ")){
                            return true;
                        }
                    }
            }
        else{
            Alert.alert("Please fill out the entire form");
            return false;
        }
    }

   /* async function SchoolSearch(text){

        Keyboard.dismiss();
        try{
            if(text != ""){
                await setSchoolList([]);

                const schoolListReturn = await SearchForSchool({query : text}); 

                for(let k in schoolListReturn){
                    if(schoolListReturn[k].hasOwnProperty('name')){
                        await setSetchoolList([...schoolList, {name: schoolListReturn[k].name, id: schoolListReturn[k].id}]);
                    }
                }
            }
        }
        catch(exception){

        }
    }*/

   /* async function updateConfirmPassword(text){
        await setConfirmPass(text);
        let confirm = confirmPass;
        let originalpass = newPass;

        if(confirm != originalpass){
            await setBadConfirm(100);
        }
        else{
            await setBadConfirm(0);
        }
    }*/

    return(
        <Fragment>
            <SafeAreaView style={{flex:0, backgroundColor : 'rgb(165,42,42)'}}></SafeAreaView>
            <SafeAreaView style={{flex : 1, backgroundColor : 'rgb(1,77,78)'}}>
                <LinearGradient colors = {['brown' , 'teal' ]} start={{x: 0, y : 0}} end={{x: 1, y : 1}} style={{flex : 1}}>
                    <View style = {Style.Background}>
                        <View>
                            <Text style={{fontSize : 30}}>Welcome to </Text>
                        </View>
                        <View style={{flex: 1, justifyContent : 'center', alignItems : 'center', marginTop : "15%"}}>
                            <Image source = {require('../Images/TutorTimeLogo.png')} style={{width : 400, height : 400, marginTop : 150}}/>
                        </View>
                        <View style={Style.LoginBox}>
                            <TextInput style = {Style.UsernameAndPassword} placeholder = "Enter Username" onChangeText={text => setUsername(text)} autoCorrect={false}></TextInput>
                            <TextInput ref={ref => {passwordRef = ref;}} secureTextEntry = {true} style = {Style.UsernameAndPassword} placeholder = "Enter Password" onChangeText={text => setPassword(text)}></TextInput>
                            <TouchableOpacity onPress={()=>{LoginAttempt(username, password), passwordRef.clear()}}>
                                <View style={Style.LoginButton}>
                                    <Text style={{color : 'gold', fontSize : 24}}>Login</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View>

                        </View>
                        <View style = {{flex : 4, justifyContent : 'space-evenly', marginBottom : '10%'}}>
                                <Button title = "Sign Up" color = "gold" onPress={()=> setModalVisible(true)}/>
                                <Button title = "Forgot Password" color = "gold" onPress = {()=> {Linking.openURL('http://www.fancybearstutoring.com/accounts/password_reset')}}/>
                        </View>
                    </View>
                    <SignUpModal visible={modalVisible} changeVisible={() => setModalVisible(false)} SignUp={createNewUser}/>                
                </LinearGradient>
            </SafeAreaView>
            </Fragment>
    )
}

const Style = new StyleSheet.create({
    Title : {fontSize : 25, flex : 1, color: 'gold', fontWeight : 'bold', },
    Background : { flex : 1 , alignItems : 'center', justifyContent:'center',},
    MainButton : {flex : 3, justifyContent : 'center', alignItems : 'center',},
    UsernameAndPassword : {height : 40, width : 300, maxWidth : '100%', textAlign : 'center',  backgroundColor : 'white', borderRadius : 10, borderWidth : 1, marginBottom : 5},
    ModalStyle : {flex: 1, backgroundColor :"rgb(211,211,211)", alignItems : 'center', justifyContent : 'center', height : '74%', 
                   marginTop : '10%', borderRadius : 30, opacity : 0.95, marginBottom : '10%', width : '90%', marginLeft : '5%', borderWidth : 2},
    LoginBox : {borderColor : "rgba(0,0,0,0.25)", justifyContent : 'center', alignItems : 'center', 
                borderRadius : 15,  height : '75%', width : '100%'},
    SchoolScrollView : { backgroundColor : 'teal', borderRadius : 5, borderWidth : 3, borderColor : 'maroon',flex : 1},
    SubmitButton : {backgroundColor : 'maroon', borderColor : 'black', borderWidth : 3, borderRadius : 3, elevation : 4, 
                shadowColor : 'black', shadowOpacity : 0.4, shadowOffset : {width : 3, height: 4}, },
    LoginButton : {backgroundColor : 'maroon', paddingHorizontal : '5%', paddingVertical : '5%', alignItems : 'center', justifyContent : 'center', borderRadius : 6, borderWidth : 2, shadowColor : 'black', shadowOpacity : 0.5, shadowRadius : 6, shadowOffset : {height : 3, width : 4}}
    
})