import React, { useState } from "react";
import { Text, View, TouchableOpacity, Image, StyleSheet } from "react-native";
import AlarmScreen from "./AlarmScreen";

export default function Index() {
  const [currentScreen, setCurrentScreen] = useState("home");

  const handleCheckDetails = () => {
    console.log("Check Details pressed");
    // Add your navigation or action logic here
  };

  const handleSetReminder = () => {
    console.log("Set Reminder pressed");
    setCurrentScreen("alarm");
  };

  const handleBackToHome = () => {
    setCurrentScreen("home");
  };

  if (currentScreen === "alarm") {
    return <AlarmScreen onBack={handleBackToHome} />;
  }

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image 
        source={{ uri: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-ypPGjimmPdg19KeZvhs7f3UNCGCXYl.png' }}
        style={styles.logo}
        resizeMode="contain"
      />
      
      {/* App Title */}
      <Text style={styles.title}>Welcome</Text>
      <Text style={styles.subtitle}>Manage your tasks efficiently</Text>
      
      {/* Buttons Container */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.primaryButton]} 
          onPress={handleCheckDetails}
        >
          <Text style={styles.primaryButtonText}>Check Details</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]} 
          onPress={handleSetReminder}
        >
          <Text style={styles.secondaryButtonText}>Set Reminder</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5DC",
    padding: 20,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#5B9BD5",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 40,
    textAlign: "center",
  },
  buttonContainer: {
    width: "100%",
    maxWidth: 300,
    gap: 16,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  primaryButton: {
    backgroundColor: "#5B9BD5",
  },
  secondaryButton: {
    backgroundColor: "#A4D65E",
  },
  primaryButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  secondaryButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});