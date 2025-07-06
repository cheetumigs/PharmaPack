"use client";

import { useState, useRef, useEffect } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  Switch,
  Modal,
  TextInput,
  Animated,
} from "react-native";
import * as Speech from "expo-speech";
import type { NativeSyntheticEvent, NativeScrollEvent } from "react-native";

export default function AlarmScreen({ onBack }: { onBack: () => void }) {
  const [alarms, setAlarms] = useState([
    {
      id: 1,
      time: "07:00",
      period: "AM",
      label: "Wake up",
      speechText: "Good morning! Time to wake up and start your day!",
      isActive: true,
      days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    },
    {
      id: 2,
      time: "12:30",
      period: "PM",
      label: "Lunch break",
      speechText:
        "It's lunch time! Don't forget to take a break and eat something healthy.",
      isActive: false,
      days: ["Daily"],
    },
  ]);
  const [showAddAlarm, setShowAddAlarm] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [newAlarmLabel, setNewAlarmLabel] = useState("New Alarm");
  const [newAlarmSpeech, setNewAlarmSpeech] = useState(
    "This is your reminder!"
  );
  const [selectedHour, setSelectedHour] = useState(9);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState("AM");
  const [selectedDays, setSelectedDays] = useState(["Daily"]);
  const [headerTitle, setHeaderTitle] = useState("Set Reminder");

  // Track current scroll positions for visual feedback
  const [currentHourIndex, setCurrentHourIndex] = useState(8); // Default to 9 (index 8)
  const [currentMinuteIndex, setCurrentMinuteIndex] = useState(0);
  const [currentPeriodIndex, setCurrentPeriodIndex] = useState(0);

  // Create base arrays
  const hours = Array.from({ length: 12 }, (_, i) => i + 1); // 1-12
  const minutes = Array.from({ length: 60 }, (_, i) => i); // 0-59
  const periods = ["AM", "PM"];

  const scrollY = useRef(new Animated.Value(0)).current;
  const hourScrollRef = useRef<ScrollView>(null);
  const minuteScrollRef = useRef<ScrollView>(null);
  const periodScrollRef = useRef<ScrollView>(null);

  // Scroll timers for momentum handling
  const hourScrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const minuteScrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const periodScrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Days with both full names and single letters
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayLetters = ["S", "M", "T", "W", "T", "F", "S"];

  const ITEM_HEIGHT = 50;

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        if (offsetY > 200) {
          setHeaderTitle("Your Reminders");
        } else {
          setHeaderTitle("Set Reminder");
        }
      },
    }
  );

  // Improved scroll handlers with momentum detection
  const handleHourScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, hours.length - 1));

    setCurrentHourIndex(clampedIndex);

    // Clear existing timer
    if (hourScrollTimer.current) {
      clearTimeout(hourScrollTimer.current);
    }

    // Set timer to handle momentum scroll end
    hourScrollTimer.current = setTimeout(() => {
      const finalIndex = Math.round(offsetY / ITEM_HEIGHT);
      const finalClampedIndex = Math.max(
        0,
        Math.min(finalIndex, hours.length - 1)
      );
      const hour = hours[finalClampedIndex];

      if (hour && hour !== selectedHour) {
        setSelectedHour(hour);
        setCurrentHourIndex(finalClampedIndex);
      }

      // Snap to position
      hourScrollRef.current?.scrollTo({
        y: finalClampedIndex * ITEM_HEIGHT,
        animated: true,
      });
    }, 150);
  };

  const handleMinuteScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, minutes.length - 1));

    setCurrentMinuteIndex(clampedIndex);

    // Clear existing timer
    if (minuteScrollTimer.current) {
      clearTimeout(minuteScrollTimer.current);
    }

    // Set timer to handle momentum scroll end
    minuteScrollTimer.current = setTimeout(() => {
      const finalIndex = Math.round(offsetY / ITEM_HEIGHT);
      const finalClampedIndex = Math.max(
        0,
        Math.min(finalIndex, minutes.length - 1)
      );
      const minute = minutes[finalClampedIndex];

      if (minute !== undefined && minute !== selectedMinute) {
        setSelectedMinute(minute);
        setCurrentMinuteIndex(finalClampedIndex);
      }

      // Snap to position
      minuteScrollRef.current?.scrollTo({
        y: finalClampedIndex * ITEM_HEIGHT,
        animated: true,
      });
    }, 150);
  };

  const handlePeriodScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, periods.length - 1));

    setCurrentPeriodIndex(clampedIndex);

    // Clear existing timer
    if (periodScrollTimer.current) {
      clearTimeout(periodScrollTimer.current);
    }

    // Set timer to handle momentum scroll end
    periodScrollTimer.current = setTimeout(() => {
      const finalIndex = Math.round(offsetY / ITEM_HEIGHT);
      const finalClampedIndex = Math.max(
        0,
        Math.min(finalIndex, periods.length - 1)
      );
      const period = periods[finalClampedIndex];

      if (period && period !== selectedPeriod) {
        setSelectedPeriod(period);
        setCurrentPeriodIndex(finalClampedIndex);
      }

      // Snap to position
      periodScrollRef.current?.scrollTo({
        y: finalClampedIndex * ITEM_HEIGHT,
        animated: true,
      });
    }, 150);
  };

  // Initialize scroll positions when modal opens
  const initializeScrollPositions = () => {
    setTimeout(() => {
      const selectedHourIndex = hours.findIndex((h) => h === selectedHour);
      const selectedMinuteIndex = minutes.findIndex(
        (m) => m === selectedMinute
      );
      const selectedPeriodIndex = periods.findIndex(
        (p) => p === selectedPeriod
      );

      // Set current indices
      setCurrentHourIndex(selectedHourIndex >= 0 ? selectedHourIndex : 8);
      setCurrentMinuteIndex(selectedMinuteIndex >= 0 ? selectedMinuteIndex : 0);
      setCurrentPeriodIndex(selectedPeriodIndex >= 0 ? selectedPeriodIndex : 0);

      // Scroll to positions
      hourScrollRef.current?.scrollTo({
        y: (selectedHourIndex >= 0 ? selectedHourIndex : 8) * ITEM_HEIGHT,
        animated: false,
      });
      minuteScrollRef.current?.scrollTo({
        y: (selectedMinuteIndex >= 0 ? selectedMinuteIndex : 0) * ITEM_HEIGHT,
        animated: false,
      });
      periodScrollRef.current?.scrollTo({
        y: (selectedPeriodIndex >= 0 ? selectedPeriodIndex : 0) * ITEM_HEIGHT,
        animated: false,
      });
    }, 200);
  };

  // Clean up timers
  useEffect(() => {
    return () => {
      if (hourScrollTimer.current) clearTimeout(hourScrollTimer.current);
      if (minuteScrollTimer.current) clearTimeout(minuteScrollTimer.current);
      if (periodScrollTimer.current) clearTimeout(periodScrollTimer.current);
    };
  }, []);

  const toggleDay = (day: string) => {
    if (day === "Daily") {
      setSelectedDays(["Daily"]);
    } else {
      let newDays = selectedDays.filter((d) => d !== "Daily");
      if (newDays.includes(day)) {
        newDays = newDays.filter((d) => d !== day);
      } else {
        newDays = [...newDays, day];
      }

      if (newDays.length === 0) {
        setSelectedDays(["Daily"]);
      } else if (newDays.length === 7) {
        setSelectedDays(["Daily"]);
      } else {
        setSelectedDays(newDays);
      }
    }
  };

  const toggleAlarm = (id: number) => {
    setAlarms(
      alarms.map((alarm) =>
        alarm.id === id ? { ...alarm, isActive: !alarm.isActive } : alarm
      )
    );
  };

  const deleteAlarm = (id: number) => {
    Alert.alert("Delete Alarm", "Are you sure you want to delete this alarm?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        onPress: () => setAlarms(alarms.filter((alarm) => alarm.id !== id)),
      },
    ]);
  };

  const testSpeech = (speechText: string) => {
    Speech.speak(speechText, {
      language: "en-US",
      pitch: 1.0,
      rate: 0.8,
    });
  };

  const handleNFCScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      Alert.alert("NFC Tag Detected", "Creating alarm from NFC data...", [
        {
          text: "OK",
          onPress: () => {
            const newAlarm = {
              id: Date.now(),
              time: "08:30",
              period: "AM",
              label: "NFC Reminder",
              speechText:
                "Your NFC reminder is now active! Don't forget your scheduled task.",
              isActive: true,
              days: ["Daily"],
            };
            setAlarms([...alarms, newAlarm]);
            testSpeech(newAlarm.speechText);
          },
        },
      ]);
    }, 2000);
  };

  const addManualAlarm = () => {
    const formattedTime = `${selectedHour
      .toString()
      .padStart(2, "0")}:${selectedMinute.toString().padStart(2, "0")}`;
    const newAlarm = {
      id: Date.now(),
      time: formattedTime,
      period: selectedPeriod,
      label: newAlarmLabel,
      speechText: newAlarmSpeech,
      isActive: true,
      days: selectedDays,
    };
    setAlarms([...alarms, newAlarm]);
    setShowAddAlarm(false);
    setNewAlarmLabel("New Alarm");
    setNewAlarmSpeech("This is your reminder!");
    setSelectedHour(9);
    setSelectedMinute(0);
    setSelectedPeriod("AM");
    setSelectedDays(["Daily"]);

    testSpeech(newAlarm.speechText);
  };

  const getRepeatText = (days: string[]) => {
    if (days.includes("Daily") || days.length === 7) {
      return "Daily";
    } else if (
      days.length === 5 &&
      !days.includes("Sat") &&
      !days.includes("Sun")
    ) {
      return "Weekdays";
    } else if (
      days.length === 2 &&
      days.includes("Sat") &&
      days.includes("Sun")
    ) {
      return "Weekends";
    } else {
      return days.join(", ");
    }
  };

  return (
    <View style={styles.container}>
      {/* Dynamic Header */}
      <Animated.View style={styles.headerContainer}>
        <Text style={styles.pageTitle}>{headerTitle}</Text>
      </Animated.View>

      {/* Scrollable Content */}
      <Animated.ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Action Buttons Row */}
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.scanButton,
              isScanning && styles.scanningButton,
            ]}
            onPress={handleNFCScan}
            disabled={isScanning}
          >
            <Text style={styles.actionButtonIcon}>📱</Text>
            <Text style={styles.actionButtonText}>
              {isScanning ? "Scanning..." : "NFC Scan"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.manualButton]}
            onPress={() => {
              setShowAddAlarm(true);
              initializeScrollPositions();
            }}
          >
            <Text style={styles.actionButtonIcon}>⏰</Text>
            <Text style={styles.actionButtonText}>Manual</Text>
          </TouchableOpacity>
        </View>

        {/* Spacer to trigger header change */}
        <View style={styles.spacer} />

        {/* Alarms Section */}
        <Text style={styles.sectionTitle}>Your Reminders</Text>

        {alarms.map((alarm) => (
          <View key={alarm.id} style={styles.alarmCard}>
            <View style={styles.alarmLeft}>
              <View style={styles.timeContainer}>
                <Text
                  style={[
                    styles.alarmTime,
                    !alarm.isActive && styles.inactiveTime,
                  ]}
                >
                  {alarm.time}
                </Text>
                <Text
                  style={[
                    styles.alarmPeriod,
                    !alarm.isActive && styles.inactiveTime,
                  ]}
                >
                  {alarm.period}
                </Text>
              </View>
              <Text
                style={[
                  styles.alarmLabel,
                  !alarm.isActive && styles.inactiveLabel,
                ]}
              >
                {alarm.label}
              </Text>
              <Text
                style={[
                  styles.speechPreview,
                  !alarm.isActive && styles.inactiveLabel,
                ]}
              >
                🔊 "{alarm.speechText.substring(0, 50)}..."
              </Text>
              <View style={styles.daysContainer}>
                <Text
                  style={[
                    styles.dayText,
                    !alarm.isActive && styles.inactiveDay,
                  ]}
                >
                  {getRepeatText(alarm.days)}
                </Text>
              </View>
            </View>
            <View style={styles.alarmRight}>
              <Switch
                value={alarm.isActive}
                onValueChange={() => toggleAlarm(alarm.id)}
                trackColor={{ false: "#E0E0E0", true: "#A4D65E" }}
                thumbColor={alarm.isActive ? "#ffffff" : "#f4f3f4"}
                ios_backgroundColor="#E0E0E0"
              />
              <TouchableOpacity
                style={styles.testSpeechButton}
                onPress={() => testSpeech(alarm.speechText)}
              >
                <Text style={styles.testSpeechText}>🔊</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteIconButton}
                onPress={() => deleteAlarm(alarm.id)}
              >
                <Text style={styles.deleteIcon}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </Animated.ScrollView>

      {/* Add Alarm Modal */}
      <Modal
        visible={showAddAlarm}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddAlarm(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Reminder</Text>
            <TouchableOpacity onPress={addManualAlarm}>
              <Text style={styles.modalSave}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Scrollable Time Picker */}
            <View style={styles.timePickerContainer}>
              <Text style={styles.timePickerTitle}>Select Time</Text>

              {/* Scrollable Time Display */}
              <View style={styles.scrollableTimePicker}>
                <View style={styles.timeScrollContainer}>
                  {/* Hour Scroll */}
                  <View style={styles.timeScrollSection}>
                    <ScrollView
                      ref={hourScrollRef}
                      style={styles.timeScrollView}
                      showsVerticalScrollIndicator={false}
                      snapToInterval={ITEM_HEIGHT}
                      decelerationRate={
                        Platform.OS === "android" ? 0.98 : "fast"
                      }
                      contentContainerStyle={styles.scrollContent}
                      onScroll={handleHourScroll}
                      scrollEventThrottle={16}
                      nestedScrollEnabled={true}
                    >
                      {hours.map((hour, index) => (
                        <TouchableOpacity
                          key={`hour-${index}`}
                          style={styles.timeScrollItem}
                          onPress={() => {
                            setSelectedHour(hour);
                            setCurrentHourIndex(index);
                            hourScrollRef.current?.scrollTo({
                              y: index * ITEM_HEIGHT,
                              animated: true,
                            });
                          }}
                        >
                          <Text
                            style={[
                              styles.timeScrollText,
                              index === currentHourIndex &&
                                styles.selectedTimeScrollText,
                            ]}
                          >
                            {hour.toString().padStart(2, "0")}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>

                  {/* Colon */}
                  <Text style={styles.colonText}>:</Text>

                  {/* Minute Scroll */}
                  <View style={styles.timeScrollSection}>
                    <ScrollView
                      ref={minuteScrollRef}
                      style={styles.timeScrollView}
                      showsVerticalScrollIndicator={false}
                      snapToInterval={ITEM_HEIGHT}
                      decelerationRate={
                        Platform.OS === "android" ? 0.98 : "fast"
                      }
                      contentContainerStyle={styles.scrollContent}
                      onScroll={handleMinuteScroll}
                      scrollEventThrottle={16}
                      nestedScrollEnabled={true}
                    >
                      {minutes.map((minute, index) => (
                        <TouchableOpacity
                          key={`minute-${index}`}
                          style={styles.timeScrollItem}
                          onPress={() => {
                            setSelectedMinute(minute);
                            setCurrentMinuteIndex(index);
                            minuteScrollRef.current?.scrollTo({
                              y: index * ITEM_HEIGHT,
                              animated: true,
                            });
                          }}
                        >
                          <Text
                            style={[
                              styles.timeScrollText,
                              index === currentMinuteIndex &&
                                styles.selectedTimeScrollText,
                            ]}
                          >
                            {minute.toString().padStart(2, "0")}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>

                  {/* Colon */}
                  <Text style={styles.colonText}>:</Text>

                  {/* Period Scroll */}
                  <View style={styles.timeScrollSection}>
                    <ScrollView
                      ref={periodScrollRef}
                      style={styles.timeScrollView}
                      showsVerticalScrollIndicator={false}
                      snapToInterval={ITEM_HEIGHT}
                      decelerationRate={
                        Platform.OS === "android" ? 0.98 : "fast"
                      }
                      contentContainerStyle={styles.scrollContent}
                      onScroll={handlePeriodScroll}
                      scrollEventThrottle={16}
                      nestedScrollEnabled={true}
                    >
                      {periods.map((period, index) => (
                        <TouchableOpacity
                          key={`period-${index}`}
                          style={styles.timeScrollItem}
                          onPress={() => {
                            setSelectedPeriod(period);
                            setCurrentPeriodIndex(index);
                            periodScrollRef.current?.scrollTo({
                              y: index * ITEM_HEIGHT,
                              animated: true,
                            });
                          }}
                        >
                          <Text
                            style={[
                              styles.timeScrollText,
                              index === currentPeriodIndex &&
                                styles.selectedTimeScrollText,
                            ]}
                          >
                            {period}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </View>

                {/* Blue Underline */}
                <View style={styles.timeUnderline} />
              </View>
            </View>

            <View style={styles.modalOptions}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Reminder Label</Text>
                <TextInput
                  style={styles.textInput}
                  value={newAlarmLabel}
                  onChangeText={setNewAlarmLabel}
                  placeholder="Enter reminder name"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Speech Text</Text>
                <TextInput
                  style={[styles.textInput, styles.multilineInput]}
                  value={newAlarmSpeech}
                  onChangeText={setNewAlarmSpeech}
                  placeholder="Enter what you want the alarm to say"
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={3}
                />
                <TouchableOpacity
                  style={styles.testButton}
                  onPress={() => testSpeech(newAlarmSpeech)}
                >
                  <Text style={styles.testButtonText}>🔊 Test Speech</Text>
                </TouchableOpacity>
              </View>

              {/* Repeat Days Selection */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Repeat</Text>

                {/* Daily Option */}
                <TouchableOpacity
                  style={[
                    styles.dayOption,
                    selectedDays.includes("Daily") && styles.selectedDayOption,
                  ]}
                  onPress={() => toggleDay("Daily")}
                >
                  <Text
                    style={[
                      styles.dayOptionText,
                      selectedDays.includes("Daily") &&
                        styles.selectedDayOptionText,
                    ]}
                  >
                    Daily
                  </Text>
                </TouchableOpacity>

                {/* Individual Days - Horizontal Layout with Single Letters */}
                <View style={styles.daysRow}>
                  {daysOfWeek.map((day, index) => (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.dayButton,
                        selectedDays.includes(day) &&
                          !selectedDays.includes("Daily") &&
                          styles.selectedDayButton,
                      ]}
                      onPress={() => toggleDay(day)}
                    >
                      <Text
                        style={[
                          styles.dayButtonText,
                          selectedDays.includes(day) &&
                            !selectedDays.includes("Daily") &&
                            styles.selectedDayButtonText,
                        ]}
                      >
                        {dayLetters[index]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.repeatSummary}>
                  Selected: {getRepeatText(selectedDays)}
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Scanning Overlay */}
      {isScanning && (
        <View style={styles.scanningOverlay}>
          <View style={styles.scanningModal}>
            <View style={styles.scanningAnimation}>
              <Text style={styles.scanningIcon}>📡</Text>
            </View>
            <Text style={styles.scanningText}>Scanning for NFC/RFID...</Text>
            <Text style={styles.scanningSubtext}>
              Hold your device near the tag
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5DC",
  },
  headerContainer: {
    paddingTop: Platform.OS === "ios" ? 35 : 20,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: "#F5F5DC",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#5B9BD5",
    textAlign: "center",
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  actionButtonsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 15,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  scanButton: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#5B9BD5",
  },
  scanningButton: {
    backgroundColor: "#E8F4FD",
    borderColor: "#5B9BD5",
    borderWidth: 2,
  },
  manualButton: {
    backgroundColor: "#A4D65E",
  },
  actionButtonIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#5B9BD5",
  },
  spacer: {
    height: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#5B9BD5",
    marginBottom: 15,
    textAlign: "center",
  },
  alarmCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  alarmLeft: {
    flex: 1,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 4,
  },
  alarmTime: {
    color: "#333",
    fontSize: 32,
    fontWeight: "300",
  },
  alarmPeriod: {
    color: "#333",
    fontSize: 16,
    marginLeft: 8,
    fontWeight: "400",
  },
  inactiveTime: {
    color: "#999",
  },
  alarmLabel: {
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  speechPreview: {
    color: "#666",
    fontSize: 12,
    fontStyle: "italic",
    marginBottom: 8,
  },
  inactiveLabel: {
    color: "#999",
  },
  daysContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayText: {
    color: "#5B9BD5",
    fontSize: 12,
    marginRight: 8,
    fontWeight: "500",
  },
  inactiveDay: {
    color: "#ccc",
  },
  alarmRight: {
    alignItems: "center",
    gap: 10,
  },
  testSpeechButton: {
    backgroundColor: "#A4D65E",
    borderRadius: 20,
    padding: 8,
    minWidth: 36,
    alignItems: "center",
  },
  testSpeechText: {
    fontSize: 16,
  },
  deleteIconButton: {
    backgroundColor: "#ff4444",
    borderRadius: 20,
    padding: 8,
    minWidth: 36,
    alignItems: "center",
  },
  deleteIcon: {
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#F5F5DC",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 50 : 30,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  modalCancel: {
    color: "#5B9BD5",
    fontSize: 16,
  },
  modalTitle: {
    color: "#5B9BD5",
    fontSize: 18,
    fontWeight: "600",
  },
  modalSave: {
    color: "#5B9BD5",
    fontSize: 16,
    fontWeight: "600",
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  timePickerContainer: {
    backgroundColor: "#F0F0F0",
    borderRadius: 15,
    padding: 30,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  timePickerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#5B9BD5",
    textAlign: "center",
    marginBottom: 30,
  },
  scrollableTimePicker: {
    alignItems: "center",
  },
  timeScrollContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 150,
    marginBottom: 20,
  },
  timeScrollSection: {
    width: 80,
    height: 150,
  },
  timeScrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 50,
  },
  timeScrollItem: {
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  timeScrollText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#D0D0D0",
    letterSpacing: -1,
  },
  selectedTimeScrollText: {
    color: "#2C2C2C",
    fontSize: 42,
    fontWeight: "900",
  },
  colonText: {
    fontSize: 42,
    fontWeight: "900",
    color: "#2C2C2C",
    marginHorizontal: 8,
    letterSpacing: -1,
  },
  timeUnderline: {
    width: "90%",
    height: 4,
    backgroundColor: "#5B9BD5",
    borderRadius: 2,
  },
  modalOptions: {
    gap: 20,
  },
  inputContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  inputLabel: {
    color: "#5B9BD5",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#333",
    backgroundColor: "#f9f9f9",
  },
  multilineInput: {
    height: 80,
    textAlignVertical: "top",
  },
  testButton: {
    backgroundColor: "#A4D65E",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginTop: 10,
  },
  testButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  dayOption: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    minHeight: 48,
  },
  selectedDayOption: {
    backgroundColor: "#5B9BD5",
    borderColor: "#5B9BD5",
  },
  dayOptionText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  selectedDayOptionText: {
    color: "white",
  },
  daysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    gap: 6, // Reduced gap for single letters
  },
  dayButton: {
    backgroundColor: "#f9f9f9",
    borderRadius: 50, // Made circular for single letters
    padding: 16,
    flex: 1,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    minHeight: 48,
    minWidth: 48, // Ensure square/circular shape
    justifyContent: "center",
  },
  selectedDayButton: {
    backgroundColor: "#A4D65E",
    borderColor: "#A4D65E",
  },
  dayButtonText: {
    fontSize: 18, // Increased for better visibility of single letters
    fontWeight: "700", // Made bolder
    color: "#333",
  },
  selectedDayButtonText: {
    color: "white",
  },
  repeatSummary: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
    textAlign: "center",
  },
  scanningOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  scanningModal: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 40,
    alignItems: "center",
    margin: 40,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  scanningAnimation: {
    marginBottom: 20,
  },
  scanningIcon: {
    fontSize: 48,
  },
  scanningText: {
    color: "#333",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    textAlign: "center",
  },
  scanningSubtext: {
    color: "#666",
    fontSize: 14,
    textAlign: "center",
  },
});
