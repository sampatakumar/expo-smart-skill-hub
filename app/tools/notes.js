import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert, Animated as NativeAnimated } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp, FadeOutDown, Layout } from 'react-native-reanimated';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');
const COLORS = ['#facc15', '#34d399', '#61dafb', '#c084fc', '#f472b6'];

export default function NotesManagerScreen() {
  const [notes, setNotes] = useState([]);
  const [editorVisible, setEditorVisible] = useState(false);
  const [currentNote, setCurrentNote] = useState({ id: null, title: '', content: '', color: '' });

  // Load notes on mount
  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const savedNotes = await AsyncStorage.getItem('@smart_notes');
      if (savedNotes !== null) {
        setNotes(JSON.parse(savedNotes));
      }
    } catch (e) {
      console.error('Failed to load notes', e);
    }
  };

  const saveNotesToStorage = async (newNotes) => {
    try {
      await AsyncStorage.setItem('@smart_notes', JSON.stringify(newNotes));
      setNotes(newNotes);
    } catch (e) {
      console.error('Failed to save notes', e);
      Alert.alert('Error', 'Failed to save note.');
    }
  };

  const handleOpenEditor = (note = null) => {
    if (note) {
      setCurrentNote(note);
    } else {
      const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
      setCurrentNote({ id: Date.now().toString(), title: '', content: '', color: randomColor });
    }
    setEditorVisible(true);
  };

  const handleSaveNote = () => {
    if (!currentNote.title.trim() && !currentNote.content.trim()) {
      setEditorVisible(false);
      return;
    }

    let updatedNotes = [...notes];
    const existingIndex = updatedNotes.findIndex(n => n.id === currentNote.id);

    if (existingIndex >= 0) {
      updatedNotes[existingIndex] = { ...currentNote, updatedAt: Date.now() };
    } else {
      updatedNotes.unshift({ ...currentNote, createdAt: Date.now(), updatedAt: Date.now() });
    }

    saveNotesToStorage(updatedNotes);
    setEditorVisible(false);
  };

  const handleDeleteNote = () => {
    Alert.alert('Delete Note', 'Are you sure you want to delete this note?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive', 
        onPress: () => {
          const updatedNotes = notes.filter(n => n.id !== currentNote.id);
          saveNotesToStorage(updatedNotes);
          setEditorVisible(false);
        }
      }
    ]);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0f172a', '#1e1b4b', '#171717']} style={StyleSheet.absoluteFillObject} />

      {/* Main Notes List View */}
      {!editorVisible && (
        <Animated.View entering={FadeInDown.duration(400)} exiting={FadeOutDown.duration(200)} style={{ flex: 1 }}>
          <SafeAreaView edges={['top']} style={{ zIndex: 10 }}>
            <View style={styles.headerRow}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <BlurView intensity={30} tint="dark" style={styles.iconCircle}>
                  <Ionicons name="chevron-back" size={24} color="#ffffff" />
                </BlurView>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Notes</Text>
              <View style={{ width: 44 }}>
                 <Text style={styles.countText}>{notes.length}</Text>
              </View>
            </View>
          </SafeAreaView>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {notes.length === 0 ? (
              <View style={styles.emptyState}>
                <FontAwesome5 name="sticky-note" size={48} color="rgba(255,255,255,0.2)" />
                <Text style={styles.emptyTitle}>No Notes Yet</Text>
                <Text style={styles.emptyDesc}>Tap the button below to capture an idea.</Text>
              </View>
            ) : (
              <View style={styles.masonryGrid}>
                {/* Column 1 */}
                <View style={styles.column}>
                  {notes.filter((_, i) => i % 2 === 0).map((note) => (
                    <TouchableOpacity key={note.id} onPress={() => handleOpenEditor(note)} activeOpacity={0.8}>
                      <View style={[styles.noteCard, { borderColor: `${note.color}40`, backgroundColor: `${note.color}10` }]}>
                        <View style={[styles.noteIndicator, { backgroundColor: note.color }]} />
                        {note.title ? <Text style={styles.noteTitle} numberOfLines={2}>{note.title}</Text> : null}
                        <Text style={styles.noteSnippet} numberOfLines={6}>{note.content || 'Empty note...'}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
                {/* Column 2 */}
                <View style={styles.column}>
                  {notes.filter((_, i) => i % 2 !== 0).map((note) => (
                    <TouchableOpacity key={note.id} onPress={() => handleOpenEditor(note)} activeOpacity={0.8}>
                      <View style={[styles.noteCard, { borderColor: `${note.color}40`, backgroundColor: `${note.color}10` }]}>
                        <View style={[styles.noteIndicator, { backgroundColor: note.color }]} />
                        {note.title ? <Text style={styles.noteTitle} numberOfLines={2}>{note.title}</Text> : null}
                        <Text style={styles.noteSnippet} numberOfLines={6}>{note.content || 'Empty note...'}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>

          {/* Floating Action Button */}
          <SafeAreaView edges={['bottom']} style={styles.fabContainer}>
            <TouchableOpacity onPress={() => handleOpenEditor(null)} style={styles.fabWrapper}>
              <LinearGradient colors={['#f472b6', '#d946ef']} style={styles.fab} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
                <FontAwesome5 name="plus" size={20} color="#ffffff" />
                <Text style={styles.fabText}>New Note</Text>
              </LinearGradient>
            </TouchableOpacity>
          </SafeAreaView>
        </Animated.View>
      )}

      {/* Fullscreen Editor View */}
      {editorVisible && (
        <Animated.View entering={FadeInUp.duration(400)} exiting={FadeOutDown.duration(400)} style={styles.editorContainer}>
          <LinearGradient colors={['#0f172a', '#1e1b4b']} style={StyleSheet.absoluteFillObject} />
          
          <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
            <View style={styles.editorHeader}>
              <TouchableOpacity onPress={handleSaveNote} style={styles.editorIconBtn}>
                <Ionicons name="chevron-down" size={28} color="#ffffff" />
              </TouchableOpacity>
              
              <View style={styles.editorActions}>
                <TouchableOpacity onPress={handleDeleteNote} style={[styles.editorIconBtn, { backgroundColor: 'rgba(239,68,68,0.1)' }]}>
                  <Ionicons name="trash-outline" size={20} color="#ef4444" />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSaveNote} style={styles.saveBtn}>
                  <Text style={styles.saveBtnText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
              <ScrollView style={styles.editorBody} keyboardShouldPersistTaps="handled">
                <TextInput
                  style={[styles.editorTitleInput, { color: currentNote.color }]}
                  placeholder="Note Title"
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  value={currentNote.title}
                  onChangeText={(text) => setCurrentNote({ ...currentNote, title: text })}
                  multiline
                />
                
                <TextInput
                  style={styles.editorContentInput}
                  placeholder="Start typing..."
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={currentNote.content}
                  onChangeText={(text) => setCurrentNote({ ...currentNote, content: text })}
                  multiline
                  autoFocus={!currentNote.title && !currentNote.content}
                  textAlignVertical="top"
                />
              </ScrollView>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </Animated.View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
  },
  backButton: {
    width: 44,
    height: 44,
  },
  iconCircle: {
    flex: 1,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  countText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 140,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '50%',
  },
  emptyTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDesc: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
  },
  masonryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    width: '48%',
  },
  noteCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  noteIndicator: {
    width: 24,
    height: 4,
    borderRadius: 2,
    marginBottom: 12,
  },
  noteTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    lineHeight: 22,
  },
  noteSnippet: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    lineHeight: 20,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingBottom: 20,
  },
  fabWrapper: {
    shadowColor: '#f472b6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 30,
  },
  fabText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  
  // Editor Styles
  editorContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  editorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  editorIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editorActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  saveBtn: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  saveBtnText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 14,
  },
  editorBody: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  editorTitleInput: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  editorContentInput: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 18,
    lineHeight: 28,
    paddingBottom: 100, // Space for keyboard bounce
  },
});
