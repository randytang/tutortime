import { Button, Modal,} from "react-native-paper";
import { TouchableOpacity, View, StyleSheet, Text, Alert, TextInput } from "react-native";
import React, { useState } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import SearchForSchool from "./APICalls/SearchForSchool";
import SelectSchoolModal from "./SelectSchoolModal";

export default function SignUpModal({visible, changeVisible, SignUp}){

    const [newUser, setNewUser] = useState("");
    const [newPass, setNewPass] = useState("");
    const [confirmPass, setConfirmPass] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [alertBadEmail , setAlertBadEmail] = useState (false);
    const [badConfirm, setBadConfirm] = useState(false);
    const [schoolQuery, setSchoolQuery] = useState("");
    const [schoolList, setSchoolList] = useState([]);
    const [selectedSchool, setSelectedSchool] = useState ("");
    const [schoolHasBeenChosen, setSchoolHasBeenChosen] = useState(false);

    const [selectModal, setSelectModal] = useState(false);
    const [addingSchool, setAddingSchool] = useState(false);

    const [canSubmit, setCanSubmit] = useState(false);

    async function CheckSignUp(){
        if(newUser != "" && newPass != "" && !badConfirm && firstName != "" && lastName!="" && !alertBadEmail){
            console.log("here");
            setCanSubmit(true);
        }
    }

    async function creatUser(){
        SignUp( firstName, lastName, newUser, email, newPass, confirmPass , selectedSchool);
        setSchoolHasBeenChosen(false);
        changeVisible(false);
    }

    async function CheckEmail(){
        if(email.includes(" ") || !email.includes("@")){
            await setAlertBadEmail(true);
        }
        else{
            await setAlertBadEmail(false);
        }
    }

    function ChooseSchool(school){
        setSelectedSchool(school);
        setSchoolHasBeenChosen(true);
    }

    async function CheckConfirmPass(text){
        await setConfirmPass(text);
        let checkPass = text;
        console.log(checkPass);
        let firstPass = newPass;
        console.log(firstPass);
        if(checkPass != firstPass){
            setBadConfirm(true);
        }
        else{
            setBadConfirm(false);
        }
    }

    async function BundleSchoolSearch(text){
        await SchoolSearch(text);
        await SetModalTrue();
    }

    async function SchoolSearch(text){
        try{
            if(text != ""){
                await setSchoolList([]);

                const schoolListReturn = await SearchForSchool({query : text}); 
                setSchoolList(schoolListReturn);
            }
        }
        catch(exception){

        }
    }

    async function SetModalTrue(){

        if(schoolQuery == ""){
            setSchoolList([]);
        }
        else if(schoolList[0] != null){
            setSelectModal(true);
            setAddingSchool(true);
        }
    }

    return(
        <Modal visible={visible} animationType="slide">
            <KeyboardAwareScrollView enableOnAndroid={true}>
            <View style={styles.OuterView}>
                <Text style={styles.HeaderText}>Sign Up!</Text>
                <View style={styles.InnerView}>
                <Text style={styles.InputText}>Please Enter Your First Name</Text>
                <TextInput style={styles.InputField} placeholder="Firstname" onChangeText={(text) => {setFirstName(text), CheckSignUp()}}/>
                <Text style={styles.InputText}>Please Enter Your Last Name</Text>
                <TextInput style={styles.InputField} placeholder="Lastname" onChangeText={(text) => {setLastName(text), CheckSignUp()}}/>
                <Text style={styles.InputText}>Enter New Username</Text>
                <TextInput style={styles.InputField} autoCorrect={false} placeholder="Username" onChangeText={(text)=>{setNewUser(text), CheckSignUp()}}/>
                <Text style={styles.InputText}>Enter Your Password</Text>
                <TextInput style={styles.InputField} secureTextEntry={true} placeholder="Password" onChangeText={(text)=>setNewPass(text)}/>
                <Text style={styles.InputText}>Please Confirm New Password</Text>
                {badConfirm ? 
                <Text >Confirm Password Must Match New Password</Text> : null}
                <TextInput secureTextEntry={true} style={styles.InputField} placeholder="Confirm Password" onChangeText={(text)=>{CheckConfirmPass(text), CheckSignUp()}} />
                <Text style={styles.InputText}>Enter Your Email</Text>
                {alertBadEmail ? <Text>Please Enter A Valid Emal</Text> : null}
                <TextInput style={styles.InputField} placeholder="Email" onChangeText={(text)=>{ setEmail(text), CheckEmail(), CheckSignUp()}}/>
                <Text style={styles.InputText}>Search For Your School</Text>
                <TextInput style={styles.InputField} placeholder="Your School" onChangeText={(text) => setSchoolQuery(text)} onSubmitEditing={()=>{BundleSchoolSearch(schoolQuery)}}/>
                {schoolHasBeenChosen  && canSubmit ?
                    <TouchableOpacity onPress={()=>creatUser()}>
                        <View style = {styles.SearchSubmitButton}>
                            <Text style={styles.SearchSubmitText}>Sign Up</Text>
                        </View>
                    </TouchableOpacity> :
                    <TouchableOpacity onPress={()=> {BundleSchoolSearch(schoolQuery)}}>
                        <View style={styles.SearchSubmitButton}>
                            <Text style={styles.SearchSubmitText}>Search</Text>
                        </View>
                    </TouchableOpacity>}
                <Button onPress={()=>{setSchoolHasBeenChosen(false) ,changeVisible(false)}} style={{paddingVertical : '5%'}}>Cancel</Button>
                </View>
            </View>
            </KeyboardAwareScrollView>
            {addingSchool ? 
            <SelectSchoolModal visible={selectModal} changeVisible={setSelectModal} schoolQuery={schoolQuery} schoolList={schoolList} setSchoolChoice={ChooseSchool} />
               :null }
        </Modal>
    )
}

const styles = new StyleSheet.create({
    OuterView : {alignItems : 'center', backgroundColor : 'teal', width : '90%', marginLeft : '5%', borderRadius : 6, borderWidth : 3},
    InputField : {height : 40, width : 300, maxWidth : '100%', textAlign : 'center',  backgroundColor : 'white', borderRadius : 10, borderWidth : 1, marginBottom : 5},
    InputText : {color : 'gold', fontSize : 18},
    InnerView : {alignItems : 'center'},
    HeaderText : {color : 'gold', fontSize : 25, textDecorationLine : 'underline', paddingTop : '5%', paddingBottom : '3%'},
    SearchSubmitButton : {borderRadius : 6,borderWidth : 2,paddingVertical : '3%', paddingHorizontal : '7%',backgroundColor : 'maroon', shadowColor : 'black', shadowOpacity : 0.5, shadowRadius : 7, shadowOffset : {height : 3, width : 4}},
    SearchSubmitText : {color : 'gold', fontSize : 25},
})