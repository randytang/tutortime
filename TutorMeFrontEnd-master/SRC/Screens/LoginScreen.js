import { TabRouter, useNavigation } from '@react-navigation/native';
import { Alert, StyleSheet, Text, View, Button, TextInput, Modal, SafeAreaView, 
    ScrollView, FlatList, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Image } from 'react-native';
import { Component, Fragment } from 'react/cjs/react.production.min';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

import * as SecureStore from 'expo-secure-store';
import * as RootNavigation from '../NavigationRef';

import UserLogin from '../APICalls/UserLogin'
import SearchForSchool from '../APICalls/SearchForSchool';
import CreateNewUser from '../APICalls/CreateNewUser';

//import TutorTimeLogo from '../Images/TutorTimeLogo'

export default class LoginScreen extends Component{

    constructor(props){
        super(props);
        
        this.state = {
            username : '',
            password : '',
            newUser : '',
            newPass : '',
            confirmPass : '',
            firstName : '',
            lastName : '',
            email : '',
            alertBadEmail : 100,
            alertBadConfirm : 0,
            modalVisible : false,
            schoolQuery: '',
            schoolList: [],
            selectedSchool : "Search",
            schoolId : null
        }
    }

//changes modal visability for user signups
    async setModalVisible(showModal){
         await this.setState({
            modalVisible : showModal
        })
    }

    //attempt to log the user in
    //creates a new instance of the UserLogin.js script to make api call
    async LoginAttempt (){
        var username = this.state.username;
        username = username.toLowerCase();
        var password = this.state.password;

        const canLogin = await UserLogin({username : username, password : password});
        
        //console.log(canLogin);

        if(canLogin){
            await this.setState({
                password : "",
                modalVisible : false
            })
            //will need to store the log in token in a secure way
            //likely with expo-secure-store
            //alternatively ios keychain or either Andriod variaint can 
            //be used
            //does not work for web based authentication
            //await SecureStore.setItemAsync("loginToken", canLogin.token);
            //
            RootNavigation.navigate('Home', {token : canLogin.token, user_id : canLogin.user_id});
        }
        else{
            Alert.alert("Username or Password was incorrect");
        }
    }

    async createNewUser(){
        var canSignUp = this.checkSignUpStatus();
        var signingUp = false;
        //console.log(canSignUp);
        if(canSignUp){
            var userPassed = this.state.newUser;
            userPassed = userPassed.toLowerCase();
            var passPassed = this.state.newPass;
            var pass2Passed = this.state.confirmPass;
            var firstPassed = this.state.firstName;
            var lastPassed = this.state.lastName;
            var emailPassed = this.state.email;
            var schoolPassed = this.state.schoolId;
            signingUp = await CreateNewUser({firstName : firstPassed, lastName : lastPassed, userName : userPassed, 
                            email : emailPassed, password : passPassed, school : schoolPassed, password2 : pass2Passed});
        }

        if(signingUp){
            await this.setState({username : this.state.newUser});
            await this.setState({password : this.state.newPass});
            this.LoginAttempt();
        }
        else{
            Alert.alert(signingUp);
        }
    }
    

    checkSignUpStatus(){
        if(this.state.newPass != ""  && this.state.newUser != "" && this.state.firstName != "" && this.state.lastName != ""
                && this.state.email != "" && this.state.selectedSchool != "Search"){
                    if(this.state.newPass == this.state.confirmPass){
                        if(!this.state.email.includes(" ")){
                            return true;
                        }
                    }
            }
        else{
            Alert.alert("Please fill out the entire form");
            return false;
        }
    }



    async SchoolSearch(text){

        Keyboard.dismiss();
        try{
            if(text != ""){
                await this.setState({
                    schoolList : []
                })
                const schoolListReturn = await SearchForSchool({query : text}); 

                for(let k in schoolListReturn){
                    if(schoolListReturn[k].hasOwnProperty('name')){
                        await this.setState({
                            schoolList : [...this.state.schoolList, {name: schoolListReturn[k].name, id: schoolListReturn[k].id}]
                        })
                    }
                }
            }
        }
        catch(exception){

        }
    }

    async updateUsername(text){
        await this.setState({
            username : text
        })
    }
    
    async updatePassword(text){
        await this.setState({
            password : text
        })
    }
    async updateNewUsername (text){
       
        await this.setState({
            newUser : text
        })
    }

    async updateNewPassword(text){
        await this.setState({
            newPass : text
        })
    }

    async updateConfirmPassword(text){
        await this.setState({
            confirmPass : text
        })
        let confirm = this.state.confirmPass;
        let originalpass = this.state.newPass;

        if(confirm != originalpass){
            await this.setState({
                alertBadConfirm : 100
            })
        }
        else{
            await this.setState({
                alertBadConfirm : 0
            })
        }
    }

    async updateFirstname(text){
        await this.setState({
            firstName : text
        })
    }

    async updateLastname(text){
        await this.setState({
            lastName : text
        })
    }

    async  updateEmail(text){
        await this.setState({
            email : text
        })
        let check = text;

        if(!check.includes("@") | (check.includes(" "))){
            await this.setState({
                alertBadEmail : 100
            })
        }
        else{
            await this.setState({
                alertBadEmail :0
            })
        }
    }

    render(){
        return(
            <Fragment>
            <SafeAreaView style={{flex:0, backgroundColor : 'rgb(165,42,42)'}}></SafeAreaView>
            <SafeAreaView style={{flex : 1, backgroundColor : 'rgb(1,77,78)'}}>
                <LinearGradient colors = {['brown' , 'teal' ]} start={{x: 0, y : 0}} end={{x: 1, y : 1}} style={{flex : 1}}>
                <View style = {Style.Background}>
                    <View>
                        <Text style={{fontSize : 30}}>Welcome to </Text>
                    </View>
                    <View style={{flex: 1, justifyContent : 'center', alignItems : 'center', marginTop : 100}}>
                        <Image source = {require('../Images/TutorTimeLogo.png')} style={{width : 400, height : 400}}/>
                    </View>
                    <View style = {Style.MainButton}>
                        
                        <Modal visible={this.state.modalVisible}
                            style={Style.ModalStyle} 
                            transparent={true}
                            animationType= 'slide'
                            onRequestClose={() => {
                                this.setModalVisible(!this.state.modalVisible);
                            }}
                        >
                            <View style ={Style.ModalStyle}>
                            <KeyboardAwareScrollView contentContainerStyle={{flex : 1, alignItems : 'center'}} enableOnAndroid={true} >
                                <ScrollView style={{flex : 1,width : '90%', paddingTop : 50,}} contentContainerStyle={{alignItems : 'center', flex : 1, justifyContent : 'center'}}>
                                
                                    <View style={{flex : 2, alignItems : 'center'}}>
                                    <Text style={{color : 'black' , fontSize : 25, fontWeight : 'bold', paddingBottom : 10}}> Sign Up!</Text>
                                    
                                        <TextInput style={Style.UsernameAndPassword} placeholder ="Enter your first Name" placeholderTextColor="black" onChangeText={text => this.updateFirstname(text)}></TextInput>
                                        <TextInput style={Style.UsernameAndPassword} placeholder ="Enter your last Name" placeholderTextColor="black" onChangeText={text => this.updateLastname(text)}></TextInput>  
                                        <TextInput style ={Style.UsernameAndPassword} allowFontScaling = {true} placeholderTextColor = "black" placeholder='Enter Username' onChangeText={text => this.updateNewUsername(text)}/>
                                        <TextInput style = {Style.UsernameAndPassword} allowFontScaling ={true} placeholderTextColor = "black" placeholder = "Enter Email" onChangeText={text => this.updateEmail(text)}></TextInput>
                                        <Text style={{opacity : this.state.alertBadEmail, color : 'teal'}}>Please enter a valid email address</Text>
                                        <TextInput secureTextEntry={true} style = {Style.UsernameAndPassword} placeholderTextColor = 'black' placeholder = "Enter Password" onChangeText={text => this.updateNewPassword(text)} />
                                        <TextInput secureTextEntry={true} style={Style.UsernameAndPassword} placeholderTextColor='black' placeholder='Confirm Password' onChangeText={text => this.updateConfirmPassword(text)} />
                                        <Text style = {{opacity : this.state.alertBadConfirm, color : 'teal'}}>Confirm Password Must Match Password</Text>
                                        <TextInput style={Style.UsernameAndPassword} allowFontScaling ={true} placeholderTextColor = "black" placeholder='Search for your School' 
                                        onChangeText={text => this.setState({schoolQuery : text})} onSubmitEditing={() => this.SchoolSearch(this.state.schoolQuery)}></TextInput>
                                        <TouchableOpacity style={{paddingBottom : 10, width : '80%',}} onPress={()=>this.SchoolSearch(this.state.schoolQuery)}>
                                            <View style={Style.SubmitButton}>
                                                <Text style={{fontSize : 25, color : 'gold'}}>{this.state.selectedSchool}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                    <View style = {{flex: 1,width : '100%', }}>
                                        <ScrollView style={Style.SchoolScrollView} >
                                            <View style = {{width : '90%', justifyContent : 'space-between', alignItems : 'center', 
                                            paddingTop : 8, paddingLeft : '10%'}}>
                                            {this.state.schoolList.map((Schools) => 
                                                <View key={Schools.id} style ={{flex: 1, width : '100%', borderRadius : 20, paddingBottom : 10, backgroundColor : 'grey', 
                                                borderColor : 'maroon', borderWidth : 3, paddingTop : 15, paddingBottom : 15, borderColor : 'black', borderWidth : 1,}}>
                                                <TouchableOpacity key = {Schools.name} onPress ={()=> this.setState({selectedSchool : Schools.name, schoolId : Schools.id})}>
                                                    <Text style={{color : 'gold', }} >{Schools.name}</Text>
                                                </TouchableOpacity>
                                                </View>
                                           
                                            )}
                                            </View>
                                        </ScrollView>
                                    </View>
                                    
                                </ScrollView>
                                <TouchableOpacity style = {{height : '10%', paddingTop : '5%'}} onPress={()=>this.createNewUser()}>
                                    <View style = {Style.SubmitButton}>
                                        <Text style={{fontSize : 25, color : 'gold'}}>CREATE YOUR ACCOUNT!</Text>
                                    </View>
                                </TouchableOpacity>
                                <Button title='Close' color={'black'} onPress ={()=> {this.setModalVisible(!this.state.modalVisible), this.setState({schoolList: []}, this.setState({selectedSchool : "Search"}))}}></Button> 
                                </KeyboardAwareScrollView >  
                            </View> 
                        </Modal>

                        <View style={Style.LoginBox}>
                            <TextInput style = {Style.UsernameAndPassword} placeholder = "Enter Username" onChangeText={text => this.updateUsername(text)} autoCorrect={false}></TextInput>
                            <TextInput ref={(ref) => this.UserPassAttempt = ref} secureTextEntry ={true} style = {Style.UsernameAndPassword} placeholder = "Password" onChangeText={text => this.updatePassword(text)}></TextInput>
                        </View>

                    </View>
                    <View style = {{flex : 2, justifyContent : 'space-evenly'}}>
                        <Button style = {{flex : 2}}title = "Login" color = "gold" onPress = {()=> {this.UserPassAttempt.clear(),this.LoginAttempt()}}/>
                        <Button title = "Sign Up" color = "gold" onPress={()=> this.setModalVisible(!this.state.modalVisible)}/>
                    </View>                
                </View>
                </LinearGradient>
            </SafeAreaView>
            </Fragment>
        )
    }
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
                    shadowColor : 'black', shadowOpacity : 0.4, shadowOffset : {width : 3, height: 4}, }
        
    })
