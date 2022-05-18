import React, { useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View, Text, Alert} from "react-native";
import { Modal, TextInput } from "react-native-paper";
import AddCourse from "./APICalls/AddCourse";
import SearchCourse from "./APICalls/SearchCourse";

import { LinearGradient } from "expo-linear-gradient";
import MyCard from "./MyCard";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import ConfirmAddCourseModal from "./ConfirmAddCourseModal";

export default function AddCourseModal({props, changeVisible, usersCourses}){

    const [confirmModal, setConfirmModal] = useState(false);
    const [courseToConfirm, setCourseToConfirm] = useState({});
    const [updating, setUpdating] = useState(false);
    const [courses, setCourses] = useState([]);

    async function UpdateCourses(text){
        const courseList = await SearchCourse({SearchParam :  text});
        await setCourses(courseList);
    }

    async function PrepareConfirmModal(course){
        let moveToConfirm = true;
        console.log(usersCourses);
        for(let k in usersCourses){
            if(usersCourses[k].courseName.includes(course.name)){
                moveToConfirm = false;
            }
        }
        console.log(moveToConfirm);
        if(moveToConfirm){
            await setCourseToConfirm(course);
            await setConfirmModal(true);
        }
        else{
            Alert.alert("That course is already in your profile")
        }
    }
    return(
        <Modal visible={props}>
            <View style={styles.outerView}>
                <LinearGradient colors = {[ 'teal', "brown" ]}style={{flex: 1, alignItems : 'center', width : '100%',  borderRadius: 20, borderWidth : 4 }} >
                    <View style={styles.SearchView}>
                        <Text style={styles.SearchText}>Search For The Class</Text>
                        <TextInput style={styles.userInput} placeholder="Ex. 'Discrete Math'" placeholderTextColor={"black"} onChangeText={ (text)=> UpdateCourses(text)}/>
                    </View>
                    <View style={styles.OuterScrollView}>
                        <KeyboardAwareScrollView>
                            <View style={styles.InnerScrollView}>
                                {courses.map((course)=>
                                <MyCard key={course.id}>
                                    <TouchableOpacity onPress={() => {PrepareConfirmModal(course)}}>
                                        <View style={styles.CourseCard}>
                                            <Text style={styles.CourseText}>{course.course_code}</Text>
                                            <Text allowFontScaling={true} style={styles.CourseText}>{course.name}</Text>
                                        </View>
                                    </TouchableOpacity>
                                </MyCard>)}
                            </View>
                        </KeyboardAwareScrollView>
                    </View>
                    <TouchableOpacity onPress={()=>{ changeVisible(), setCourses([])}}>
                        <View style={styles.CloseButton}>
                            <Text style={styles.CloseText}>Close</Text>
                        </View>
                    </TouchableOpacity>
                </LinearGradient>
            </View>
            {confirmModal ? 
            <ConfirmAddCourseModal visible={confirmModal} changeVisible={setConfirmModal} course={courseToConfirm} /> : null }
        </Modal>
    )
}

const styles = StyleSheet.create({
    outerView : {height : '100%', width : '90%', alignItems : 'center', justifyContent : 'center', marginLeft : '5%',},
    CourseCard : { flexDirection : 'row', alignItems : 'center', justifyContent : 'center', height : '100%', width : '120%', paddingVertical : '10%', paddingHorizontal : '20%', backgroundColor : 'rgba(211,211,211,0.2)'},
    OuterScrollView : {flex : 1},
    InnerScrollView : {alignItems : 'center'},
    CourseText: {color : 'gold', fontSize : 16, paddingHorizontal : 10},
    SearchView : { width : '100%', alignItems : 'center', height : '30%', justifyContent : 'center'},
    SearchText : {color : "gold", fontSize : 24},
    userInput : {height : 40, width : 300, maxWidth : '100%', textAlign : 'center',  backgroundColor : 'white', borderRadius : 10, borderWidth : 1, marginVertical : 5},
    CloseButton : {backgroundColor : 'teal', width : '100%', paddingHorizontal : "10%",paddingVertical : '4%', marginVertical : "5%"},
    CloseText : {color : 'gold', fontSize : 18},
})