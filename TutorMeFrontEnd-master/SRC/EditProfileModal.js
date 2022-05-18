import { Modal} from "react-native-paper";
import { TouchableOpacity, TextInput, View, StyleSheet, Text, Alert, Keyboard } from "react-native";
import React, { useContext, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import UpdateProfile from "./APICalls/UpdateProfile";
import { Picker } from "@react-native-picker/picker";
import { useFocusEffect } from "@react-navigation/native";
import MainPage from "./Screens/MainPage";
import * as SecureStore from 'expo-secure-store';

import AppContext from "./GlobalData";
import { ScrollView } from "react-native-gesture-handler";


export default function EditProfileModal({first_name, last_name,email, year, about, visible, changeVisible, reloadAbout}){


    const {ChangeUserProfile} = useContext(AppContext);
    const [newfirst_name, setFirst_name] = useState(first_name);
    const [newlast_name, setLast_name] = useState(last_name);
    const [newemail, setEmail] = useState(email);
    const [newyear, setYear] = useState(year);
    const yearOptions = [{yearName : "Freshman", yearValue : "FR"}, {yearName : "Sophmore", yearValue : 'SO'}, {yearName : 'Junior', yearValue : "JR"}, {yearName : "Senior", yearValue : 'SR'}];
    const [selectedYear, setSelectedYear] = useState("");
    const [rendered, setRendered] = useState(visible);
    const [newAbout, setNewAbout] = useState(about);

    async function submitChanges(){
        if(newfirst_name == undefined && newfirst_name == null && newAbout == null && newAbout == undefined){
            await setFirst_name(first_name);
            Alert.alert("Something went wrong. Please try again")
        }
        else{
            let update =  await UpdateProfile({first_name : newfirst_name, last_name : newlast_name, email : newemail, year : selectedYear, about : newAbout});
            if(!update){
                Alert.alert("Something went wrong. Please try again");
            }
            reloadAbout();
        }
        ChangeUserProfile();
        changeVisible();
    }

    async function cancelChanges(first_name,last_name,email,year, about){
        setFirst_name(first_name);
        setLast_name(last_name);
        setEmail(email);
        setYear(year);
        setNewAbout(about);
        setRendered(false); 
        changeVisible();
    }

    async function changeYear(year){
        await setSelectedYear(year);
    }

    
    return(
        <Modal visible={visible}>
            <View style={styles.outerView}>
            <LinearGradient colors = {[ 'teal', "brown" ]}style={{flex: 1, alignItems : 'center', width : '100%',  borderRadius: 20, borderWidth : 4 }} >
                <ScrollView style={{flex : 1}} contentContainerStyle={{alignItems : 'center'}}>
                    <View style={styles.innerView}>
                        <Text style={styles.HeaderText}>Enter Changes</Text>
                        <View style={{alignItems : 'center', height : '70%'}}>
                            <Text style={styles.contentText}>First Name</Text>
                            <TextInput autoCorrect={false} style={styles.EditTextInput} placeholder={first_name} placeholderTextColor='black' onChangeText={(text)=>setFirst_name(text) }></TextInput>
                            <Text style={styles.contentText}>Last Name</Text>
                            <TextInput autoCorrect={false} style={styles.EditTextInput} placeholder={last_name} placeholderTextColor='black' onChangeText={(text)=>setLast_name(text) }></TextInput>
                            <Text style={styles.contentText}>Email</Text>
                            <TextInput autoCorrect={false} style={styles.EditTextInput} placeholder={email} placeholderTextColor='black' onChangeText={(text) => setEmail(text) }></TextInput>
                            <Text style={styles.contentText}>About</Text>
                            <TextInput style={styles.EditTextInputAbout} multiline={true} onSubmitEditing={()=> Keyboard.dismiss()} placeholder={about} placeholderTextColor='black' onChangeText={(text)=> setNewAbout(text)}/>
                            <Text style={styles.contentText}>Year</Text>
                            <Picker
                                selectedValue={selectedYear}
                                onValueChange={(itemValue, itemIndex) => changeYear(itemValue) }
                                style = {{ width : 300}}>
                                    <Picker.Item label="Freshman" value={"FR"} color="gold" />
                                    <Picker.Item label="Sophmore" value={"SO"} color="gold" />
                                    <Picker.Item label="Junior" value={"JR"} color="gold" />
                                    <Picker.Item label="Senior" value={"SR"} color="gold" /> 
                            </Picker>
                        </View>
                        <View style={styles.buttonView}>
                            <TouchableOpacity onPress={()=>{submitChanges()}}>
                                <View style={styles.SubmitButton}>
                                    <Text style={styles.SubmitText}>Submit Changes</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={()=>cancelChanges(first_name,last_name,email,year)}>
                                <View style={styles.SubmitButton}>
                                    <Text style={styles.SubmitText}>Cancel</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </LinearGradient>
            </View>
        </Modal>
    )
}

const styles = new StyleSheet.create({
    EditTextInput : {height : 40, width : 300, maxWidth : '100%', textAlign : 'center',  backgroundColor : 'white', borderRadius : 1, borderWidth : 1, marginVertical : 5},
    SubmitButton : {height : '30%', paddingHorizontal : 10, backgroundColor : 'maroon', borderRadius : 5, borderWidth : 3, 
        elevation : 4, shadowOffset : {height : 4, width : 5}, shadowRadius : 4, shadowOpacity : 0.5, marginVertical : '5%', justifyContent : 'center', alignItems : 'center'},
    SubmitText : {fontSize : 18, color : 'gold'},
    outerView : {height : '100%', width : '90%', alignItems : 'center', justifyContent : 'center', marginLeft : '5%',},
    innerView : {height : '100%', width : '90%', alignItems : 'center' , paddingVertical : '10%'},
    HeaderText : {color : 'gold', fontSize : 28, textDecorationLine : 'underline' , textDecorationColor : 'black'},
    contentText : {color : 'gold', fontSize : 18},
    buttonView : {alignItems : 'center', justifyContent : 'center', height : '30%'},
    EditTextInputAbout : {height : 150, width : 300, maxWidth : '100%', textAlign : 'center',  backgroundColor : 'white', borderRadius : 1, borderWidth : 1, marginVertical : 5,},

});