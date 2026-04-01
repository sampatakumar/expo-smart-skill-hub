import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert, Modal, Switch } from 'react-native';
import { useState, useEffect, useMemo } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp, FadeOutDown, Layout } from 'react-native-reanimated';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as NotificationService from '../../src/services/notificationService';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { id: 'study', label: 'Study', icon: 'book', color: '#a855f7' },
  { id: 'assignment', label: 'Assignment', icon: 'tasks', color: '#f472b6' },
  { id: 'exam', label: 'Exam', icon: 'university', color: '#ef4444' },
  { id: 'project', label: 'Project', icon: 'code', color: '#61dafb' },
  { id: 'other', label: 'Other', icon: 'ellipsis-h', color: '#34d399' },
];

const TABS = [
  { id: 'today', label: 'Today', icon: 'calendar-day' },
  { id: 'weekly', label: 'Weekly', icon: 'calendar-week' },
  { id: 'exams', label: 'Exams', icon: 'university' },
];

export default function AdvancedStudyPlanner() {
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState('today');
  const [modalVisible, setModalVisible] = useState(false);
  
  const todayStr = new Date().toISOString().split('T')[0];
  const [newTask, setNewTask] = useState({ 
    title: '', 
    time: '12:00 PM', 
    category: 'study', 
    date: todayStr, 
    reminderEnabled: false 
  });

  useEffect(() => {
    loadTasks();
    NotificationService.requestNotificationPermissions();
  }, []);

  const loadTasks = async () => {
    try {
      const savedTasks = await AsyncStorage.getItem('@smart_planner_v2');
      if (savedTasks !== null) {
        setTasks(JSON.parse(savedTasks));
      } else {
        // Migration from v1
        const v1Tasks = await AsyncStorage.getItem('@smart_planner');
        if (v1Tasks) {
           const migrated = JSON.parse(v1Tasks).map(t => ({ ...t, date: todayStr, reminderEnabled: false }));
           setTasks(migrated);
           saveTasks(migrated);
        }
      }
    } catch (e) {
      console.error('Failed to load tasks', e);
    }
  };

  const saveTasks = async (updatedTasks) => {
    try {
      await AsyncStorage.setItem('@smart_planner_v2', JSON.stringify(updatedTasks));
      setTasks(updatedTasks);
    } catch (e) {
      console.error('Failed to save tasks', e);
    }
  };

  const addTask = async () => {
    if (newTask.title.trim() === '') return;
    
    const id = Date.now().toString();
    const taskToAdd = {
      id,
      ...newTask,
      completed: false,
      notificationId: null,
    };

    if (newTask.reminderEnabled) {
      const nid = await NotificationService.scheduleTaskNotification(taskToAdd);
      taskToAdd.notificationId = nid;
    }
    
    const updatedTasks = [taskToAdd, ...tasks];
    saveTasks(updatedTasks);
    resetNewTask();
    setModalVisible(false);
  };

  const resetNewTask = () => {
    setNewTask({ 
      title: '', 
      time: '12:00 PM', 
      category: 'study', 
      date: todayStr, 
      reminderEnabled: false 
    });
  };

  const toggleTask = (id) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === id) {
        const nextCompleted = !task.completed;
        if (nextCompleted && task.notificationId) {
          NotificationService.cancelNotification(task.notificationId);
        }
        return { ...task, completed: nextCompleted };
      }
      return task;
    });
    saveTasks(updatedTasks);
  };

  const deleteTask = (id) => {
    const taskToDelete = tasks.find(t => t.id === id);
    if (taskToDelete?.notificationId) {
       NotificationService.cancelNotification(taskToDelete.notificationId);
    }
    const updatedTasks = tasks.filter(task => task.id !== id);
    saveTasks(updatedTasks);
  };

  // 📐 Computed Filter Logic
  const filteredTasks = useMemo(() => {
    if (activeTab === 'today') {
      return tasks.filter(t => t.date === todayStr);
    }
    if (activeTab === 'exams') {
      return tasks.filter(t => t.category === 'exam').sort((a, b) => new Date(a.date) - new Date(b.date));
    }
    // Weekly - group by date for the next 7 days
    const next7Days = Array.from({ length: 7 }, (_, i) => {
       const d = new Date();
       d.setDate(d.getDate() + i);
       return d.toISOString().split('T')[0];
    });
    return tasks.filter(t => next7Days.includes(t.date)).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [tasks, activeTab]);

  const getCountdown = (dateStr) => {
    const target = new Date(dateStr);
    const today = new Date(todayStr);
    const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
    if (diff < 0) return 'Passed';
    if (diff === 0) return 'Today!';
    return `${diff} Days Left`;
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0f172a', '#1e1b4b', '#171717']} style={StyleSheet.absoluteFillObject} />
      
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <BlurView intensity={30} tint="dark" style={styles.iconCircle}>
              <Ionicons name="chevron-back" size={24} color="#ffffff" />
            </BlurView>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Planner</Text>
          <View style={{ width: 44 }}>
             <Text style={styles.countText}>{filteredTasks.filter(t => !t.completed).length}</Text>
          </View>
        </View>

        {/* 🎡 Tab Toggle */}
        <View style={styles.tabContainer}>
           <BlurView intensity={20} tint="dark" style={styles.tabBlur}>
              {TABS.map(tab => (
                 <TouchableOpacity 
                    key={tab.id} 
                    onPress={() => setActiveTab(tab.id)}
                    style={[styles.tabItem, activeTab === tab.id && styles.tabActive]}
                 >
                    <FontAwesome5 name={tab.icon} size={14} color={activeTab === tab.id ? '#ffffff' : 'rgba(255,255,255,0.4)'} />
                    <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>{tab.label}</Text>
                 </TouchableOpacity>
              ))}
           </BlurView>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {filteredTasks.length === 0 ? (
            <View style={styles.emptyState}>
              <FontAwesome5 name="ghost" size={60} color="rgba(255,255,255,0.15)" />
              <Text style={styles.emptyTitle}>Nothing Scheduled</Text>
              <Text style={styles.emptyDesc}>Your {activeTab} view looks clear. Use the '+' button to add study goals.</Text>
            </View>
          ) : (
            <View>
              {filteredTasks.map((task, index) => (
                <Animated.View layout={Layout.springify()} entering={FadeInDown.delay(index * 50)} key={task.id} style={styles.taskCardContainer}>
                  <BlurView intensity={20} tint="dark" style={[styles.taskCard, task.completed && styles.taskCardCompleted]}>
                     <TouchableOpacity 
                        style={[styles.checkbox, { borderColor: CATEGORIES.find(c => c.id === task.category)?.color || '#a855f7' }, task.completed && styles.checkboxChecked]}
                        onPress={() => toggleTask(task.id)}
                     >
                        {task.completed && <Ionicons name="checkmark" size={16} color="#ffffff" />}
                     </TouchableOpacity>

                     <View style={styles.taskInfo}>
                        <Text style={[styles.taskTitle, task.completed && styles.taskTitleCompleted]}>{task.title}</Text>
                        <View style={styles.taskMeta}>
                           {activeTab === 'weekly' && (<Text style={styles.dateLabel}>{task.date.split('-').slice(1).join('/')} • </Text>)}
                           <FontAwesome5 name={CATEGORIES.find(c => c.id === task.category)?.icon} size={10} color={CATEGORIES.find(c => c.id === task.category)?.color} />
                           {task.reminderEnabled && <Ionicons name="notifications" size={12} color="#facc15" style={{ marginLeft: 8 }} />}
                           
                           {task.category === 'exam' && (
                             <View style={styles.countdownBadge}>
                                <Text style={styles.countdownText}>{getCountdown(task.date)}</Text>
                             </View>
                           )}
                        </View>
                     </View>

                     <TouchableOpacity onPress={() => deleteTask(task.id)} style={styles.deleteBtn}>
                        <Ionicons name="trash-outline" size={20} color="rgba(255,255,255,0.2)" />
                     </TouchableOpacity>
                  </BlurView>
                </Animated.View>
              ))}
            </View>
          )}
        </ScrollView>

        <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
          <LinearGradient colors={['#a855f7', '#6366f1']} style={styles.fabGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <FontAwesome5 name="plus" size={20} color="#ffffff" />
          </LinearGradient>
        </TouchableOpacity>
      </SafeAreaView>

      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <BlurView intensity={40} tint="dark" style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContent}>
               <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>New Objective</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}><Ionicons name="close-circle" size={32} color="rgba(255,255,255,0.3)" /></TouchableOpacity>
               </View>

               <TextInput
                  style={styles.modalInput}
                  placeholder="Task Name"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={newTask.title}
                  onChangeText={(text) => setNewTask({ ...newTask, title: text })}
                  autoFocus
               />

               <View style={styles.rowInputs}>
                  <TextInput
                    style={[styles.modalInput, { flex: 1, marginRight: 10 }]}
                    placeholder="HH:MM AM/PM"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    value={newTask.time}
                    onChangeText={(text) => setNewTask({ ...newTask, time: text })}
                  />
                  <View style={styles.reminderToggle}>
                     <Text style={styles.reminderLabel}>Remind Me</Text>
                     <Switch 
                        value={newTask.reminderEnabled} 
                        onValueChange={(val) => setNewTask({ ...newTask, reminderEnabled: val })}
                        trackColor={{ false: "#1f2937", true: "#a855f7" }}
                        thumbColor={newTask.reminderEnabled ? "#ffffff" : "#6b7280"}
                     />
                  </View>
               </View>

               <Text style={styles.modalSubtitle}>Target Date</Text>
               <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateSelector}>
                  {Array.from({ length: 14 }).map((_, i) => {
                     const d = new Date();
                     d.setDate(d.getDate() + i);
                     const dStr = d.toISOString().split('T')[0];
                     const isSelected = newTask.date === dStr;
                     return (
                        <TouchableOpacity key={dStr} onPress={() => setNewTask({ ...newTask, date: dStr })} style={[styles.dateChip, isSelected && styles.dateChipActive]}>
                           <Text style={[styles.dateChipDay, isSelected && styles.whiteText]}>{d.getDate()}</Text>
                           <Text style={[styles.dateChipMonth, isSelected && styles.whiteText]}>{d.toLocaleString('default', { month: 'short' })}</Text>
                        </TouchableOpacity>
                     );
                  })}
               </ScrollView>

               <Text style={styles.modalSubtitle}>Category</Text>
               <View style={styles.categoryRow}>
                  {CATEGORIES.map(cat => (
                    <TouchableOpacity key={cat.id} onPress={() => setNewTask({ ...newTask, category: cat.id })} style={[styles.catChip, newTask.category === cat.id && { backgroundColor: `${cat.color}30`, borderColor: cat.color }]}>
                      <FontAwesome5 name={cat.icon} size={14} color={newTask.category === cat.id ? cat.color : 'rgba(255,255,255,0.4)'} />
                      <Text style={[styles.catChipText, { color: newTask.category === cat.id ? '#ffffff' : 'rgba(255,255,255,0.4)' }]}>{cat.label}</Text>
                    </TouchableOpacity>
                  ))}
               </View>

               <TouchableOpacity style={styles.submitBtn} onPress={addTask}>
                  <LinearGradient colors={['#a855f7', '#6366f1']} style={styles.submitBtnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                    <Text style={styles.submitBtnText}>Commit to Schedule</Text>
                  </LinearGradient>
               </TouchableOpacity>
          </KeyboardAvoidingView>
        </BlurView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  whiteText: { color: '#ffffff' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 10, marginBottom: 10 },
  backButton: { width: 44, height: 44 },
  iconCircle: { flex: 1, borderRadius: 22, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', overflow: 'hidden' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#ffffff' },
  countText: { color: '#a855f7', fontSize: 16, fontWeight: 'bold', textAlign: 'right' },
  tabContainer: { paddingHorizontal: 20, marginBottom: 15 },
  tabBlur: { flexDirection: 'row', borderRadius: 20, padding: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' },
  tabItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 16, gap: 8 },
  tabActive: { backgroundColor: 'rgba(255,255,255,0.1)' },
  tabText: { color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: '#ffffff' },
  scrollContent: { padding: 20, paddingBottom: 120 },
  taskCardContainer: { marginBottom: 12 },
  taskCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', overflow: 'hidden' },
  taskCardCompleted: { opacity: 0.5, backgroundColor: 'rgba(255, 255, 255, 0.02)' },
  checkbox: { width: 28, height: 28, borderRadius: 10, borderWidth: 2, marginRight: 16, justifyContent: 'center', alignItems: 'center' },
  checkboxChecked: { backgroundColor: '#34d399', borderColor: '#34d399' },
  taskInfo: { flex: 1 },
  taskTitle: { color: '#ffffff', fontSize: 16, fontWeight: '600', marginBottom: 4 },
  taskTitleCompleted: { textDecorationLine: 'line-through', color: 'rgba(255, 255, 255, 0.4)' },
  taskMeta: { flexDirection: 'row', alignItems: 'center' },
  dateLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: '600' },
  countdownBadge: { marginLeft: 10, backgroundColor: 'rgba(239,68,68,0.1)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  countdownText: { color: '#ef4444', fontSize: 10, fontWeight: 'bold' },
  deleteBtn: { padding: 8 },
  fab: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 30, elevation: 8, shadowColor: '#a855f7', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10 },
  fabGradient: { flex: 1, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#111827', borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 30, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 24, fontWeight: 'bold', color: '#ffffff' },
  modalInput: { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 16, padding: 16, color: '#ffffff', fontSize: 16, marginBottom: 15, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
  rowInputs: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  reminderToggle: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', padding: 10, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  reminderLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginRight: 10, fontWeight: 'bold' },
  modalSubtitle: { color: 'rgba(255, 255, 255, 0.4)', fontSize: 12, fontWeight: 'bold', marginBottom: 10, textTransform: 'uppercase' },
  dateSelector: { marginBottom: 20, paddingBottom: 10 },
  dateChip: { width: 60, height: 75, justifyContent: 'center', alignItems: 'center', borderRadius: 16, borderOpacity: 0.1, backgroundColor: 'rgba(255,255,255,0.05)', marginRight: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  dateChipActive: { backgroundColor: '#a855f7', borderColor: '#a855f7' },
  dateChipDay: { fontSize: 18, fontWeight: 'bold', color: 'rgba(255,255,255,0.8)' },
  dateChipMonth: { fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 25 },
  catChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)' },
  catChipText: { fontSize: 11, fontWeight: '600', marginLeft: 6 },
  submitBtn: { height: 60, borderRadius: 20, overflow: 'hidden' },
  submitBtnGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  submitBtnText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 80 },
  emptyTitle: { color: '#ffffff', fontSize: 20, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
  emptyDesc: { color: 'rgba(255,255,255,0.5)', fontSize: 14, textAlign: 'center', paddingHorizontal: 40 },
});
