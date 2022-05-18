import { Alert, StyleSheet, Text, View, TextInput, 
    ScrollView, SafeAreaView, TouchableOpacity, } from 'react-native';
import * as RootNavigation from '../NavigationRef';
import * as SecureStore from 'expo-secure-store';
import { useFocusEffect} from '@react-navigation/native';
import React, { useContext, useState } from 'react';
import MyCard from '../MyCard';
import AppContext from '../GlobalData';

import UsersCourses from '../APICalls/UsersCourses';

import { Modal } from 'react-native-paper';
import {Picker} from '@react-native-picker/picker';


import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import GetTutorList from '../APICalls/GetTutorList';

import RequestApp from '../APICalls/RequestApp';
import DenyAppointment from '../APICalls/DenyAppointment';
import ApproveAppointment from '../APICalls/ApproveAppointment';
import ApptsRequest from '../APICalls/ApptsRequest'


export default function MainPage({navigation}){

    const [monthArray, setMonthArray] = useState(["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"]);

    const {userProfile, ChangeUserProfile, notifications, AddNotification, ResetNotifications} = useContext(AppContext);

    const [rendered, setRendered] = useState(false);
    const [tutorInfo2DArray, setTutorInfo2DArray] = useState([]);
    const [userEmail, setuserEmail] = useState("Loading");

    const [appModal, setAppModal] = useState(false);

    const [scrollMargin, setScrollMargin] = useState(0);

    const [tutorModal, setTutorModal] = useState(false);
    const [tutorInfoModal, setTutorInfoModal] = useState(false);
    const [tutorForModal, setTutorForModal] = useState({});

    const today =  new Date();
    const [requestDate, setRequestDate] = useState(today);
    const [courseData, setCourseData] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState("");
    const [apptRequestSubject, setApptRequestSubject] = useState("");
    const [apptRequestLocation, setApptRequestLocation] = useState("");

    const [selectedTutor, setSelectedTutor] = useState({name:"Select Your Tutor"});
    const [tutorList, setTutorList] = useState([]);

    const [apptType, setApptType] = useState("Tutor");
    const [apptName, setAppName] = useState("john doe");
    const [apptLocation, setApptLocation] = useState("nowhere");
    const [apptNotes, setApptNotes] = useState("No Notes");
    const [apptSubject, setApptSubject] = useState("");
    const [apptTime, setApptTime] = useState("");
    const [apptPending, setApptPending] = useState(false);
    const [approveOrDenyNotes, setApproveOrDenyNotes] = useState("");
    const [apptId, setApptId] = useState("");

    function LogUserOut(){
        setRendered(false);
        RootNavigation.navigate("Login")
    }

    //returns a list of objects for Courses the user is in
    async function GetCourse(){
        await setCourseData([]);
            var courses = await UsersCourses();
            for(let k in courses){
                let id =courses[k].id;
                let courseNum = courses[k].course_code;
                let courseName =courses[k].name;
               /* for(let k2 in courses[k]){
                    courseNum=courses[k].course_code;
                    console.log(courseNum + " coursenum");
                    courseNum = course[k];
                    courseName = courses[k][k2];
                }*/
                let newCourse = {courseName : courseName, courseNum : courseNum, id : id};
            await setCourseData(courseData => [...courseData, newCourse]);
        } 
    }

    //returns a json of all Users appts, sends data to mapApptsParsing()
    async function GetAppts(){
            try {
                const ApptsTable = await ApptsRequest({token : await SecureStore.getItemAsync("token")});
                await mapApptsParsing(ApptsTable);
            } 
            catch (error) {
                console.log(error);
            }
    }

    //returns users email from SecureStore
    async function GetEmail(){
            var usersEmail = await SecureStore.getItemAsync("email");
            await setuserEmail(usersEmail);
    }

    //maps through the objects returned by GetAppts()
    async function mapApptsParsing(obj){
        let numOfAppts = 0;
        const yourId = await SecureStore.getItemAsync("user-id");
        let checkDate = new Date();
        checkDate.setHours(0,0,0,0,);
        //checkDate = checkDate.getTime();
        for (let k in obj){
            //const newObj = new Object(apptTemplate);
            var approved = obj[k].approval;
            var pending = obj[k].pending;
            var newName;
            var newColor;
            var newTime;
            var newLocation;
            var newNotes;
            let id = obj[k].id;
            let newSubject;
            let afterNow = false;
            let ApptDate = new Date(obj[k].appt_details.date_and_time);
            if(ApptDate.getFullYear() >= checkDate.getFullYear()){
                if(ApptDate.getUTCMonth() >= checkDate.getUTCMonth() ){
                    if(ApptDate.getUTCDate() >= checkDate.getUTCDate() || ApptDate.getUTCMonth() > checkDate.getUTCMonth()){
                        afterNow = true;
                    }
                }
            }else if(ApptDate.getFullYear > checkDate.getFullYear){
                afterNow=true;
            }
            if(afterNow){
                if(approved){
                    if(obj[k].tutor_requested.id == yourId){
                        newName = obj[k].student.first_name + " " + obj[k].student.last_name ;
                        newColor = "teal";
                    }
                    else{
                        newName = obj[k].tutor_requested.first_name + " " + obj[k].tutor_requested.last_name;
                        newColor = "maroon";
                    }
                    newLocation = obj[k].appt_details.location;
                    newTime =  new Date(obj[k].appt_details.date_and_time);
                    let newYear = (newTime.getFullYear());
                    let newMonth = (newTime.getMonth());
                    newMonth = monthArray[newMonth];
                    let newDay = (newTime.getUTCDate());
                    let newHour = (newTime.getHours());
                    let amPm = "AM";
                    if(newHour == 12){
                        amPm = "PM";
                    }
                    if(newHour > 12){
                        newHour = newHour - 12;
                        amPm = "PM"
                    }
                    let newMinutes = (newTime.getMinutes());
                    if(newMinutes < 10){
                        newMinutes =("0" + newMinutes);
                    }
                    newTime = (newMonth + " " + newDay + ", " + newYear +'\n' + newHour + ":" + newMinutes  + " " + amPm);
                    newSubject = obj[k].appt_details.subject;
                    newNotes = obj[k].notes;
                    await setTutorInfo2DArray(tutorInfo2DArray => [...tutorInfo2DArray, 
                        {tutor: newName, time : newTime, location : newLocation, color : newColor, 
                            notes : newNotes, id : id, subject : newSubject, pending : pending}]);
                }
                if(pending){
                    if(obj[k].tutor_requested.id == yourId){
                        newName = obj[k].student.first_name + " " + obj[k].student.last_name
                        newColor = "grey";
                    }
                    else{
                        newName = obj[k].tutor_requested.first_name + " " + obj[k].tutor_requested.last_name;
                        newColor = "black";
                        pending = false;
                    }
                    newLocation = obj[k].appt_details.location;
                    newSubject = obj[k].appt_details.subject;
                    newTime = new Date(obj[k].appt_details.date_and_time);
                    let newYear = (newTime.getFullYear());
                    let newMonth = (newTime.getMonth());
                    newMonth = monthArray[newMonth];
                    let newDay = (newTime.getUTCDate());
                    let newHour = (newTime.getHours());
                    let amPm = "AM";
                    if(newHour == 12){
                        amPm = "PM";
                    }
                    if(newHour > 12){
                        newHour = newHour - 12;
                        amPm = "PM"
                    }
                    
                    let newMinutes = (newTime.getMinutes());
                    if(newMinutes < 10){
                        newMinutes =("0" + newMinutes);
                    }
                    newTime = (newMonth + " " + newDay + ", " + newYear +'\n' + newHour + ":" + newMinutes  + " " + amPm);
                    newTime = newTime.toLocaleString();
                    newNotes = obj[k].notes;
                    await setTutorInfo2DArray(tutorInfo2DArray => [...tutorInfo2DArray, 
                        {tutor: newName, time : newTime, location : newLocation, color : newColor, 
                            notes : newNotes, id : id, subject : newSubject, pending : pending}]);
                }
                if(!approved){
                    console.log("not approved");
                    if(obj[k].tutor_requested.id != yourId){
                       // break;
                        /*newName = obj[k].student.first_name + " " + obj[k].student.last_name
                        newColor = "grey";*/
                        newName = obj[k].tutor_requested.first_name + " " + obj[k].tutor_requested.last_name;
                        newColor = "black";
                        pending = false;
                    }
                    newLocation = obj[k].appt_details.location;
                    newSubject = obj[k].appt_details.subject;
                    newTime = new Date(obj[k].appt_details.date_and_time);
                    let newYear = (newTime.getFullYear());
                    let newMonth = (newTime.getMonth());
                    newMonth = monthArray[newMonth];
                    let newDay = (newTime.getUTCDate());
                    let newHour = (newTime.getHours());
                    let amPm = "AM";
                    if(newHour == 12){
                        amPm = "PM";
                    }
                    if(newHour > 12){
                        newHour = newHour - 12;
                        amPm = "PM"
                    }
                    
                    let newMinutes = (newTime.getMinutes());
                    if(newMinutes < 10){
                        newMinutes =("0" + newMinutes);
                    }
                    newTime = (newMonth + " " + newDay + ", " + newYear +'\n' + newHour + ":" + newMinutes  + " " + amPm);
                    newTime = newTime.toLocaleString();
                    newNotes = obj[k].notes;
                    /*await setTutorInfo2DArray(tutorInfo2DArray => [...tutorInfo2DArray, 
                        {tutor: newName, time : newTime, location : newLocation, color : newColor, 
                            notes : newNotes, id : id, subject : newSubject, pending : pending}]);*/
                    //Use global state here
                    console.log("Notification for " + newName);
                    AddNotification({tutor: newName, time : newTime, location : newLocation, color : newColor, 
                        notes : newNotes, id : id, subject : newSubject, pending : pending});
                }
            }
            numOfAppts ++;
            if(numOfAppts >= 6){
                numOfAppts = 0;
                setScrollMargin((scrollMargin + 50));
            }
        }
    }

    async function DenyRequest(id, notes){
        const res = await DenyAppointment({id:id, notes : notes});
        setTutorInfo2DArray([]);
        setRendered(false);
    }

    async function ApproveRequest(id, notes){
        const res = await ApproveAppointment({id : id, notes : notes});
        setTutorInfo2DArray([]);
        setRendered(false);
    }

    //sends an ApptRequest to api
    async function SendApptRequest(requestDate){
        console.log(requestDate + "sending request");
        let newYear = (requestDate.getFullYear());
        let newMonth = (requestDate.getMonth());
        newMonth++;
        let newDay = ( requestDate.getDate());
        if(newMonth < 10){
            newMonth = ("0"+newMonth);
        }
        if(newDay < 10){
            newDay = ("0"+newDay);
        }
        let newDate = (newYear + "-" + newMonth + "-" + newDay) ;
        let newHours = (requestDate.getUTCHours());
        let newMinutes = (requestDate.getUTCMinutes());
        if(newHours < 10){
            newHours = ("0"+newHours);
        }
        if(newMinutes < 10){
            newMinutes = ("0"+newMinutes);
        }
        let newTime = (newHours + ":" + newMinutes);
        const makeApptRequest = await RequestApp({subject : apptRequestSubject, location : apptRequestLocation, date : newDate,
                time : newTime, tutor_id : selectedTutor.id});
        //checks for request was made, if so reloads page to show new request
        if(makeApptRequest){
            setTutorInfo2DArray([]);
            await setRendered(false);
            setSelectedTutor("");
            setTutorInfoModal(false);
            setTutorModal(false);
        }
        else{
            Alert.alert("Something was wrong with the request, please make sure the full form is filled out");
            setSelectedTutor("");
            setTutorInfoModal(false);
            setTutorModal(false);
        }
    }

    //gets list of tutors available for selected course in makeApptRequest modal
    async function getTutorList(itemValue){
       await setSelectedCourse(itemValue);
       console.log(itemValue);
       const listOfTutors = await GetTutorList({courseId : itemValue});
       await setTutorList(listOfTutors);
    }

    //opens appt modal and checks how many tutors are available
    async function openApptModal(){
        try {
            GetCourse();
            const id = courseData[0].id;
            const tutor = await getTutorList(id);
        } catch (error) {
                
        }
        setTutorModal(true); 
    }

    //changes selected date
    async function dateChange(event, date){
        const selectedDate = date;
        selectedDate.toLocaleString();
        console.log(selectedDate + "selected date");
        await setRequestDate(selectedDate);
        console.log(requestDate);
    }

    //prepares data to be displayed in apptData Modal, could likely be replaced by a functional component later
    function ModalApptData(props){
        if(props.color == 'maroon'){
            setApptType("Tutor");
        }
        else if(props.color == 'teal'){
            setApptType("Teaching");
        }
        else if(props.color == "grey"){
            setApptType("Teaching");
        }
        else if(props.color == "black"){
            setApptType("Tutor Requested");
        }
        setAppName(props.tutor);
        setApptLocation(props.location);
        setApptNotes(props.notes);
        setApptSubject(props.subject);
        setApptTime((props.time).toLocaleString());
        setAppModal(true);
        setApptPending(props.pending);
        setApptId(props.id);
    }

    //prepares info for tutor modal
    async function setTutorInfoModalOpen(tutor){
        let name = tutor.first_name + " " + tutor.last_name;
          await setTutorForModal({id : tutor.id, name : name, about : tutor.about,});
          await setTutorInfoModal(true);
    }
    
    useFocusEffect(
        React.useCallback( ()=> {
            if(!rendered){
            setRendered(true);
            ResetNotifications();
            GetAppts();
            GetEmail();
            GetCourse();
            ChangeUserProfile();
            }
        })
    );
        return(
            <View style={{flex :1,  color : 'rgb(165,42,42)', bottom : 0,}}>
                <SafeAreaView style={{flex: 1, backgroundColor : 'rgb(165,42,42)', bottom : 0,}}>
                <LinearGradient colors = {['brown' , 'teal' ]} start={{x: 0, y : 0}} end={{x: 1, y : 1}} style={{flex : 1}}>
                    <View style={{flex : 1, paddingBottom : 50, alignItems : 'center',paddingTop : 50}}>
                        <View style={{flex : 1.8, justifyContent : 'center', alignItems: 'center'}}>
                            <TouchableOpacity style = {{height : '100%', width : '100%'}} onPress={()=> navigation.navigate('Profile')}>
                                <Text style ={{fontSize : 20, color : 'gold', fontWeight : 'bold'}}>Welcome {userProfile.first_name} {userProfile.last_name}</Text>   
                            </TouchableOpacity> 
                        </View>
                        <Text style={{color: 'gold', fontSize : 20, paddingBottom : 15}}>Appointments</Text>

                        <ScrollView style ={Style.Appointments}>
                            <View style={{marginBottom : `${scrollMargin}%`,alignItems : 'center', flex : 1}}>
                            {tutorInfo2DArray.map((TutorAppt) =>
                                    <MyCard backgroundColor = {TutorAppt.color} key = {TutorAppt.id}>
                                        <TouchableOpacity style={{height : '100%', width : '100%', justifyContent : 'center'}} onPress={()=> ModalApptData(TutorAppt)}>
                                            <View style ={{flexDirection : 'row', flex : 1}}>
                                                <View style={{ flex:1, marginLeft : '5%'}}>
                                                    <Text style={Style.ApptText}>{(TutorAppt.time)}</Text>
                                                </View>
                                                <View style={{ flex:1, marginLeft: '5%'}}>
                                                    <Text style={Style.ApptText}>{TutorAppt.tutor}</Text>
                                                    <Text style={Style.ApptText}>{TutorAppt.location}</Text>
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                    </MyCard>)}
                            </View>
                        </ScrollView>

                        <View style={{flex : 3, justifyContent : 'center'}}>
                            <View style={Style.RequestButton}>
                                <TouchableOpacity style={{paddingHorizontal : 10, paddingVertical: 5}} onPress={() => {openApptModal()}}>
                                    <Text style ={{color:'gold', fontSize : 25}}>Make An Appointment</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={Style.RequestButton}>
                            <TouchableOpacity onPress ={()=> LogUserOut()} style={{paddingHorizontal : 10, paddingVertical : 10}}>
                                <Text style={{color : 'gold', fontSize : 18}}>LogOut</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </LinearGradient>

                <Modal visible={appModal} animationType = 'fade'>
                <LinearGradient colors = {['teal' , 'brown']}style={{alignItems : 'center', width:'90%',height : '90%', 
                        marginLeft : '5%', borderRadius : 8, borderWidth : 4}} >
                        <Text style={{fontSize : 20}}>Appointment Info</Text>
                        <View style={{flex : 0.8}}>
                                <MyCard>
                                    <Text style={Style.ApptInfoText}>{apptType} : {apptName}</Text>
                                </MyCard>
                                <MyCard>
                                    <Text style={Style.ApptInfoText}>Location : {apptLocation}</Text>
                                </MyCard>
                                <MyCard>
                                    <Text style={Style.ApptInfoText}> Notes : {apptNotes} </Text>
                                </MyCard>
                                <MyCard>
                                    <Text style={Style.ApptInfoText}> Subject : {apptSubject}</Text>
                                </MyCard>
                                <MyCard>
                                    <Text style={Style.ApptInfoText}> Time : {apptTime}</Text>
                                </MyCard>
                                {apptPending ? 
                                <View style={{height : '50;%' , width : '100%'}}>
                                    <TextInput style = {Style.userInput} placeholder={"Notes"} placeholderTextColor={"black"} onChangeText={(text)=>setApproveOrDenyNotes(text)} />
                                    <View style={{flexDirection : 'row' , alignItems : 'center', justifyContent : 'center', flex : 1}}>
                                        <View style={Style.RequestButton}>
                                            <TouchableOpacity onPress ={()=> {DenyRequest(apptId, approveOrDenyNotes), setAppModal(false)}} style={{paddingHorizontal : 10, paddingVertical : 10}}>
                                                <Text style={{color : 'gold', fontSize : 18}}>Deny Request</Text>
                                            </TouchableOpacity>
                                        </View>
                                        <View style={Style.RequestButton}>
                                            <TouchableOpacity onPress ={()=>{ ApproveRequest(apptId, approveOrDenyNotes), setAppModal(false)}} style={{paddingHorizontal : 10, paddingVertical : 10}}>
                                                <Text style={{color : 'gold', fontSize : 18}}>Approve Request</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View> 
                                </View>: null}
                        </View>
                        <View style={Style.RequestButton}>
                            <TouchableOpacity onPress ={()=> setAppModal(false)} style={{paddingHorizontal : 10, paddingVertical : 10}}>
                                <Text style={{color : 'gold', fontSize : 18}}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>
                </Modal>

                <Modal visible={tutorModal} animationType ="fade">
                        <View style={Style.outsideView}>
                            <ScrollView style={{flex:1}}showsVerticalScrollIndicator={true} >
                                <View style={Style.insideScroll}>
                                    <View>
                                        <Text style={Style.DateText}>What Course Do You Need Help With</Text>
                                        <Picker
                                            selectedValue={selectedCourse}
                                            onValueChange={(itemValue, itemIndex) =>{
                                                getTutorList(itemValue)}
                                            }>
                                        {courseData.map((course) =>
                                        <Picker.Item color='gold' label={course.courseName} value={course.id} key={course.id}/>
                                        )}
                                        </Picker>
                                    </View>
                                    <Text style={Style.DateText}>When would you like the appointment?</Text>
                                    <View style={{alignItems : 'center'}}>
                                        <DateTimePicker 
                                        value={requestDate}
                                        mode ={'datetime'}
                                        testID ={"Pick a Date"}
                                        style ={{width : '100%', alignItems : 'center'}}
                                        display={"spinner"}
                                        textColor={"gold"}
                                        onChange={dateChange}/>
                                    </View>
                                    <View style={{alignItems:'center'}}>
                                        <TextInput placeholder='What subject do you need help with' placeholderTextColor={"black"} style={Style.userInput} onChangeText={(text)=> setApptRequestSubject(text)}/>
                                        <TextInput placeholder='Where would you like the appointment' placeholderTextColor={"black"} style={Style.userInput} onChangeText={(text)=> setApptRequestLocation(text)}/>
                                    </View>
                                    <View style={{alignItems : 'center'}}>
                                        <Text style={Style.DateText}>{selectedTutor.name}</Text>
                                    </View>
                                    <ScrollView nestedScrollEnabled={true} style={{ height : 200, backgroundColor : 'rgb1(211,211,211,0.2)',}}>
                                        <View style={{alignItems : 'center', width : '100%', paddingBottom : '100%', backgroundColor : 'rgba(211,211,211,0.2)',}}>
                                            {(tutorList.length > 0) ? tutorList.map((tutor)=> 
                                            <TouchableOpacity key={tutor.id} style={Style.ProfileDataViews} onPress={()=> setTutorInfoModalOpen(tutor)}>
                                                <View >  
                                                     <Text style ={Style.ProfileText}>{tutor.first_name + " " + tutor.last_name} </Text>
                                                </View>
                                            </TouchableOpacity>) : <Text> No Tutors Available </Text>}
                                        </View>
                                    </ScrollView>
                                </View>
                            </ScrollView>
                            <View style={{ justifyContent : 'center', alignItems : 'center',backgroundColor : 'rgba(211,211,211,0.3)', width : '100%', height : '10%', flexDirection : 'row'}}>
                                <TouchableOpacity onPress={() => SendApptRequest(requestDate)}>
                                    <View style={Style.SubmitRequest}>
                                        <Text style={Style.DateText}>Send Request</Text>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={()=> {setTutorModal(false), setSelectedTutor({name:"Select Your Tutor"})}}>
                                    <View style={Style.SubmitRequest}>
                                        <Text style={Style.DateText}>   Cancel   </Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <Modal visible={tutorInfoModal}>
                            <View>
                                <LinearGradient colors = {['teal' , 'brown']}style={{alignItems : 'center', width:'90%',height : '90%', marginLeft : '5%',  borderRadius : 8, borderWidth : 4}} >
                                    <Text style={Style.DateText}>{tutorForModal.name}</Text>
                                    <Text style={Style.DateText}> About </Text>
                                    <View style={{backgroundColor : 'lightgrey', height : '40%', width : '90%', borderRadius : 6, justifyContent : 'center', paddingHorizontal : 5}}>
                                        <Text>{tutorForModal.about}</Text>
                                    </View>
                                    <TouchableOpacity onPress={()=>{ setSelectedTutor(tutorForModal),setTutorInfoModal(false)}}>
                                        <View style={Style.TutorSelectButton}>
                                            <Text style={Style.DateText}>    Select    </Text>
                                        </View>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={()=> {setTutorInfoModal(false), setSelectedTutor({name:"Select Your Tutor"})}}>
                                        <View style={Style.TutorSelectButton}>
                                            <Text style={Style.DateText}>    Close    </Text>
                                        </View>
                                    </TouchableOpacity>
                                </LinearGradient>
                            </View>
                        </Modal>
                    </Modal>
                </SafeAreaView>
            </View>
        )
    }

const Style = new StyleSheet.create({
    Appointments : {
        backgroundColor : 'rgba(211,211,211,0.2)',
        height : '50%',
        width : '100%',
        borderRadius : 25,
        borderWidth : 5,
        borderColor : 'maroon',
        paddingVertical : 20,
    },
    ApptText : {
        color: 'gold',
        fontSize: 18
    },
    ModalStyle : {height : '80%', width : '80%', backgroundColor: 'grey', marginLeft : '10%', 
    borderRadius : 20, borderColor : 'black', borderWidth: 4, alignItems : 'center'},
    TutorSelectButton : {backgroundColor : 'teal', marginVertical : '5%', width : '50%', justifyContent : 'center', alignItems : 'center',
                elevation : 5, shadowColor : 'black', shadowOffset : {width:3,height:3}, shadowRadius : 4, shadowOpacity : 0.5},
    RequestButton : {backgroundColor : 'maroon', borderColor : 'black', borderWidth : 3, borderRadius : 3, elevation : 4, 
    shadowColor : 'black', shadowOpacity : 0.4, shadowOffset : {width : 3, height: 4}, },
    outsideView : {height : '90%', width: '90%', backgroundColor : 'teal', paddingVertical : '5%',
         alignItems : 'center', marginLeft : '5%', borderRadius : 30, borderWidth : 4, borderColor : 'black'},
    scrollView : {},
    insideScroll : { flex : 1 , paddingBottom : '200%',},
    userInput : {height : 40, width : 300, maxWidth : '100%', textAlign : 'center',  backgroundColor : 'white', borderRadius : 10, borderWidth : 1, marginBottom : 5},
    DateText: {fontSize : 20, color : 'gold', paddingVertical : '4%'},
    ProfileDataViews : {backgroundColor : 'rgba(0,0,0,0.3)', justifyContent : 'center',
                         alignItems : 'center', width : '85%', marginVertical : '2%'},
    ProfileText : {color : 'gold', paddingHorizontal : '5%', fontSize : 24 ,},
    tutorInfoModal : {height : '100%', width : '90%', backgroundColor : 'brown', alignItems : 'center',
            borderRadius : 10, borderWidth : 4 , marginLeft : '5%'},
    SubmitRequest : {backgroundColor : 'rgba(0,0,0,0.3)', justifyContent : 'center',
    alignItems : 'center', width : '85%', marginVertical : '2%', marginLeft : '7%',},
    ApptInfoText : {fontSize : 18, color : 'gold'},
    NotesInput : { height : 300 , width : 100, marginVertical : '5%', backgroundColor : 'white', borderRadius : 10, borderWidth : 1, marginBottom : 5 },
})