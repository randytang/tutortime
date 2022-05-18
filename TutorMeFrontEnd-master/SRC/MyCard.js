import React, { useState } from "react";
import { StyleSheet, View} from "react-native";

export default function MyCard(props){

    const cardColor = props.backgroundColor;
    return (
        <View style={[styles.card, {backgroundColor : cardColor} ]}>
            <View  style={styles.cardContent}>
                { props.children }
            </View>
        </View>
    )
}

var cardColor = 'maroon';
function setCardColor(color){
    cardColor = color;
}

const styles = StyleSheet.create({
    card :{
        borderRadius : 6,
        elevation : 4,
        shadowOffset : {width : 3, height: 4},
        shadowColor: 'black',
        shadowOpacity : 0.3,
        shadowRadius : 2,
        marginHorizontal : 4,
        marginVertical : 6,
        width: '75%',
        height: '30%',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: "row",
        flex : 1
    },

    cardContent : {
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    }
})