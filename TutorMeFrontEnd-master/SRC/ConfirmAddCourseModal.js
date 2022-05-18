import React, { useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View, Text, Alert} from "react-native";
import { Modal, TextInput } from "react-native-paper";
import AddCourse from "./APICalls/AddCourse";

import { LinearGradient } from "expo-linear-gradient";
import MyCard from "./MyCard";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default function ConfirmAddCourseModal({course, visible, changeVisible}){

    async function addCourseRequest(course){
         const addingCourse = await AddCourse({course: course, year : 0, semester : 0})
         if(addingCourse){
             Alert.alert("Course was added succesfully");
             changeVisible(false);
         }
         else{
             Alert.alert("There was an issue adding this course, please try again");
             changeVisible(false);
         }
    }
    return(
        <Modal visible={visible}>
            <View style={styles.outerView}>
                <View style={styles.headerTextView}>
                    <Text style={styles.headerText}>Are you sure you want to add {course.course_code} : {course.name} to your courses?</Text>
                </View>
                <View style={styles.ButtonView}>
                <TouchableOpacity onPress={() => addCourseRequest(course.id)} style={styles.ClickButtonViewYes}>
                        <View>
                            <Text>Yes</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => changeVisible(false)} style = {styles.ClickButtonViewNo}>
                        <View>
                            <Text>No</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    outerView : {height : "75%", width : '80%', marginHorizontal : '10%', backgroundColor : 'lightgrey', borderRadius : 12, borderWidth : 5, alignItems : 'center'},
    headerTextView : {height : '25%', width : '100%', justifyContent : 'center', alignItems : 'center', paddingHorizontal : '5%'},
    headerText : {fontSize : 18},
    ButtonView : {height : "30%", justifyContent :'space-between', marginTop : '10%'},
    ClickButtonViewYes : {backgroundColor : 'gold', paddingHorizontal : '20%', paddingVertical : '5%', borderRadius : 5, shadowColor : 'black' , elevation : 4, shadowOffset : {height : 3, width : 4}, shadowRadius : 3, shadowOpacity : 0.5, marginVertical : '3%'}, 
    ClickButtonViewNo : {backgroundColor : 'maroon', paddingHorizontal : '20%', paddingVertical : '5%', borderRadius : 5, shadowColor : 'black' , elevation : 4, shadowOffset : {height : 3, width : 4}, shadowRadius : 3, shadowOpacity : 0.5}, 
})