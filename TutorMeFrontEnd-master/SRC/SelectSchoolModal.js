import { Button, Modal,} from "react-native-paper";
import { TouchableOpacity, View, StyleSheet, Text, Alert, ScrollView } from "react-native";
import React, {useState } from "react";
import { useFocusEffect } from "@react-navigation/native";



export default function SelectSchoolModal({visible, changeVisible,schoolQuery,schoolList, setSchoolChoice}){

    //const [schoolList, setSchoolList] = useState([]);
    const [rendered, setRendered] = useState(false);
    const [search, setSearch] = useState(false);

    function SelectCourse(school){
        setSchoolChoice(school.id);
        Alert.alert(school.name + " has been selected");
        changeVisible(false);
    }
    useFocusEffect(
        React.useCallback( ()=>{
            if(!rendered){
                //SchoolSearch(schoolQuery);
                if(schoolList[0]==undefined){
                    setSearch(false);
                }
                else{setSearch(true)}
                setRendered(true);

            }
        })
    )

    return(
    <Modal visible={visible}>
        <View style={styles.OuterView}>
            <Text style={styles.HeaderText}>Schools</Text>
            {search ?
                <ScrollView style={{paddingVertical : '5%', height : '80%'}}>
                {schoolList.map((school)=>
                    <TouchableOpacity onPress={()=>SelectCourse(school)} key={school.id}>
                        <View style={styles.CardView}>
                            <Text style={{color : 'gold'}}>{school.name}</Text>
                        </View>
                    </TouchableOpacity>
                )}
                </ScrollView>
                : <Text>Nothing Matched Your Search</Text>
                }
            <Button onPress={()=>{changeVisible(false)}}>Cancel</Button>
        </View>
    </Modal>
    )
}

const styles = new StyleSheet.create({
    OuterView : {alignItems : 'center', backgroundColor : 'brown',height : '100%', width : '85%', marginLeft : '7.5%', borderRadius : 6, borderWidth : 3},
    HeaderText : {color : 'gold', fontSize : 25, textDecorationLine : 'underline', marginTop : '5%'},
    CardView : {borderRadius : 5, borderWidth : 2, shadowColor : 'black', shadowOpacity : 0.5, shadowRadius : 5, shadowOffset : {height : 3, width : 4}, paddingVertical : '3%', marginVertical : '3%', alignItems : 'center', backgroundColor : 'teal'}
})