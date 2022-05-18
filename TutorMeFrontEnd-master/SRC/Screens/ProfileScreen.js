import { StyleSheet, Text, View, 
     ScrollView, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useFocusEffect } from '@react-navigation/native';
import React, { useContext, useState } from 'react';
import MyCard from '../MyCard';

import ProfileRequest from '../APICalls/ProfileRequest';
import UsersCourses from '../APICalls/UsersCourses';

import { LinearGradient } from 'expo-linear-gradient';
import BecomeTutor from '../APICalls/BecomeTutor';
import AddCourseModal from '../AddCourseModal';
import EditProfileModal from '../EditProfileModal';

import AppContext from '../GlobalData';
import GetTutorList from '../APICalls/GetTutorList';


export default function ProfileScreen(props){

    const {userProfile, ChangeUserProfile} = useContext(AppContext);

   // const [profileData , setProfileData] = useState({});
    const [courseData, setCourseData] = useState([]);
    const [rendered, setRendered] = useState(false);
    const [about, setAbout] = useState("Loading");
    const [goodAbout, setGoodAbout] = useState(false);

    const [addCourseModal, setAddCourseModal] = useState(false);
    const [editProfileData, setEditProfileData] = useState(false);

    const [scrollMargin , setScrollMargin] = useState(0);

    async function GetProfile(){
        var userId = await SecureStore.getItemAsync("user-id");
        var token = await SecureStore.getItemAsync("token");
        var profileInfo = await ProfileRequest({userId : userId, token : token});
        /*await parseProfileInfo(profileInfo);
        console.log(profileInfo);*/
        //ChangeUserProfile;
    }

    async function GetTutorAbout(numOfCourses){
        if(numOfCourses > 0){
            var yourId= await SecureStore.getItemAsync("user-id");
            var TutorList = await GetTutorList({courseId : numOfCourses});
            for(let k in TutorList){
                if(TutorList[k].id == yourId){
                    setAbout(TutorList[k].about);
                    setGoodAbout(true);
                    break;
                }
            }
        }
        else{
            setAbout("Add a course so you can Tutor");
        }

    }
    async function GetCourse(){
        setCourseData([]);
        var courses = await UsersCourses();
        let numOfCourses = 0;
        let FindId = 0;
        for(let k in courses){
            numOfCourses ++;
            let id = courses[k].id;
            FindId = id;
            let courseNum = courses[k].course_code;
            let courseName = courses[k].name;
            let newCourse = {courseName : courseName, courseNum : courseNum, id : id};
            if(numOfCourses >= 5){
                numOfCourses = 0;
                setScrollMargin((scrollMargin + 0));
            }
            await setCourseData(courseData => [...courseData, newCourse]);
        }
        await GetTutorAbout(FindId);  
    }

    async function AddCourseModalChange(){
        await setRendered(false);
        setAddCourseModal(false);
    }

    /*async function parseProfileInfo(profile){
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
        await setProfileData({email : userEmail, first_name : userFirst, last_name : userLast, school : school, username :userName, year : year, canTutor : canTutor});
    }*/

    async function registerAsTutor(){
        const id = await SecureStore.getItemAsync("user-id");
        const response = await BecomeTutor({id:id});
        setRendered(false);
        ChangeUserProfile();
    }

    async function CheckCourses(){
        setAddCourseModal(true);
    }

    async function closeEditProfile(){
        await GetProfile();
        await setEditProfileData(false);
    }
    useFocusEffect(
        React.useCallback( ()=> {
            if(!rendered){
                setRendered(true);
                GetCourse();
            }
        })
    );
    return(
        <SafeAreaView style={{flex: 1, backgroundColor : 'rgb(165,42,42)',}}>
            <LinearGradient colors = {['brown' , 'teal' ]}style={{flex: 1, alignItems : 'center'}} >
                
                    <Text style={styles.NameText}>{userProfile.first_name} {userProfile.last_name}</Text>
                    <TouchableOpacity style = {styles.EditButton} onPress={()=> {setEditProfileData(true)}}>
                        <Text style = {styles.EditText}>EDIT PROFILE</Text>
                    </TouchableOpacity>
                    <ScrollView >
                        <View style = {{flex : 1 , alignItems : 'center', marginBottom : `${scrollMargin}%`}}>
                            <MyCard>
                                <View style={styles.ProfileDataViews}>
                                    <Text style ={styles.ProfileText}>UserName: </Text>
                                    <Text style={styles.ProfileText}>{userProfile.username}</Text>
                                </View>
                            </MyCard>
                            <MyCard>
                                <View style={styles.ProfileDataViews}>
                                    <View style={{flex : 1}}>
                                        <Text style ={styles.ProfileText}>Email: </Text>
                                    </View>
                                    <View style={{flex : 1}}>
                                        <Text style={styles.ProfileText}>{userProfile.email}</Text>
                                    </View>
                                </View>
                            </MyCard>
                            <MyCard>
                                <View style={styles.ProfileDataViews}>
                                    <View style={{flex : 1}}>
                                        <Text style ={styles.ProfileText}>School: </Text>
                                    </View>
                                    <View style={{flex : 1}}>
                                        <Text style={styles.ProfileText}>{userProfile.school}</Text>
                                    </View>
                                </View>
                            </MyCard>
                            <MyCard>
                                <View style={styles.ProfileDataViews}>
                                    <View style={{flex : 1}}>
                                        <Text style ={styles.ProfileText}>Year: </Text>
                                    </View>
                                    <View style={{flex : 1}}>
                                        <Text style={styles.ProfileText}>{userProfile.year}</Text>
                                    </View>
                                </View>
                            </MyCard>
                            {userProfile.canTutor ?
                            <MyCard>
                                <TouchableOpacity onPress={()=>{Alert.alert(about)}}>
                                    <View style={styles.ProfileDataViews}>
                                        <View style={{flex : 1}}>
                                            <Text style ={styles.ProfileText}>About:</Text>
                                        </View>
                                        <View style={{flex : 1}}>
                                            <Text style={styles.ProfileText}>{about}</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            </MyCard>
                            :
                            <TouchableOpacity style = {styles.EditButton} onPress={() => registerAsTutor()}>
                                <Text style = {styles.EditText}>Become A Tutor</Text>
                            </TouchableOpacity> }
                            <Text style={styles.EditText}>Courses</Text>
                            {courseData.map((course)=> 
                            <MyCard key = {course.id}>
                                <View style={styles.ProfileDataViews}>
                                    <View style={{flex : 1}}>
                                        <Text style ={styles.ProfileText}>{course.courseNum}</Text>
                                    </View>
                                    <View style={{flex : 1}}>
                                        <Text style={styles.ProfileText}>{course.courseName}</Text>
                                    </View>
                                </View>
                            </MyCard>)}
                            <TouchableOpacity style={styles.EditButton} onPress = {()=> CheckCourses()}>
                                <Text style={styles.EditText}>Add Course</Text>
                            </TouchableOpacity>
                            </View>
                    </ScrollView>
                        <EditProfileModal first_name={userProfile.first_name} last_name={userProfile.last_name} 
                            email={userProfile.email} year={userProfile.year} about={about} visible={editProfileData} changeVisible={closeEditProfile} reloadAbout={GetCourse} />
                        <AddCourseModal props={addCourseModal} changeVisible={AddCourseModalChange} usersCourses={courseData} />    
            </LinearGradient>
        </SafeAreaView>
    )
}

    const styles = new StyleSheet.create({
        SafeArea : {flex : 1, alignItems : 'center'},
        NameView : { alignItems : 'center',},
        NameText : {fontSize : 30, color : 'gold',},
        EditButton : {backgroundColor : 'teal', borderRadius : 6, borderWidth : 3, 
                        height : 75, justifyContent : 'center', marginTop : 12, width : '50%', alignItems : 'center'},
        EditText : {color : 'gold', fontSize : 20, alignItems : 'center'},
        ProfileDataViews : {flexDirection : 'row', backgroundColor : 'rgba(0,0,0,0.3)',
                         alignItems : 'center', height : 100, width : '120%', marginBottom : 0},
        ProfileText : {color : 'gold', paddingHorizontal : '5%', fontSize : 18 ,},
        ScrollView : {},
        tutorButton : { height : '7%' , backgroundColor : 'teal',borderRadius : 6, borderWidth : 3, 
         justifyContent : 'center', marginTop : 12,  alignItems : 'center', paddingHorizontal : '5%'},
    })