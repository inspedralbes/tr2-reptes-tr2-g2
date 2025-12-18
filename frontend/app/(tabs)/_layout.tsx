import React from "react";
import { Tabs } from "expo-router";

export default function TabLayout() {
    return (
        <Tabs 
            screenOptions={{
                tabBarActiveTintColor: "#2f95dc",
                tabBarInactiveTintColor: "gray",
            }}
        />
    )
}