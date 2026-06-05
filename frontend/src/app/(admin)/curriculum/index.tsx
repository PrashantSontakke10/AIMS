import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  Alert,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import api from '../../../services/api';
import { Colors, Spacing } from '../../../constants/theme';

interface Course {
  _id: string;
  title: string;
  description?: string;
  code?: string;
  createdAt: string;
}

export default function CoursesList() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [code, setCode] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const router = useRouter();

  const fetchCourses = async () => {
    try {
      const response = await api.get('/courses');
      setCourses(response.data);
    } catch (e) {
      console.error('Error fetching courses:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleCreateCourse = async () => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Course title is required');
      return;
    }

    setCreateLoading(true);
    try {
      const payload: any = {
        title: title.trim(),
        description: description.trim(),
      };
      if (code.trim()) {
        payload.code = code.trim().toUpperCase();
      }

      const response = await api.post('/courses', payload);
      setCourses((prev) => [response.data, ...prev]);
      
      // Reset form
      setTitle('');
      setDescription('');
      setCode('');
      setModalVisible(false);
      
      Alert.alert('Success', 'Course created successfully');
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to create course');
    } finally {
      setCreateLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.navyPrimary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Course Workspace</Text>
          <Text style={styles.headerSubtitle}>Select a course to build chapters and materials.</Text>
        </View>
        <TouchableOpacity
          style={styles.createBtn}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.createBtnText}>+ New Course</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={courses}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.courseCard}
            onPress={() =>
              router.push({
                pathname: '/(admin)/curriculum/course',
                params: { courseId: item._id, courseTitle: item.title },
              })
            }
            activeOpacity={0.8}
          >
            <View style={styles.courseHeader}>
              <Text style={styles.courseTitle}>{item.title}</Text>
              {item.code ? (
                <View style={styles.codeBadge}>
                  <Text style={styles.codeText}>{item.code}</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.courseDesc} numberOfLines={2}>
              {item.description || 'No description provided.'}
            </Text>
            <View style={styles.cardFooter}>
              <Text style={styles.viewCourseText}>Manage Curriculum ➡️</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No courses have been created yet.</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => setModalVisible(true)}>
              <Text style={styles.emptyBtnText}>Create Your First Course</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Course</Text>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalBody}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Course Title *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Grade 10 Mathematics"
                  placeholderTextColor="#A0AEC0"
                  value={title}
                  onChangeText={setTitle}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Course Code (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. MATH10"
                  placeholderTextColor="#A0AEC0"
                  value={code}
                  onChangeText={setCode}
                  autoCapitalize="characters"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Enter details about this course..."
                  placeholderTextColor="#A0AEC0"
                  multiline
                  numberOfLines={4}
                  value={description}
                  onChangeText={setDescription}
                />
              </View>

              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleCreateCourse}
                disabled={createLoading}
                activeOpacity={0.8}
              >
                {createLoading ? (
                  <ActivityIndicator color={Colors.textLight} />
                ) : (
                  <Text style={styles.submitBtnText}>Create Course</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.offWhite,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.four,
    backgroundColor: Colors.navyPrimary,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textLight,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: Spacing.half,
  },
  createBtn: {
    backgroundColor: Colors.accentBlue,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.one,
  },
  createBtnText: {
    color: Colors.textLight,
    fontWeight: 'bold',
    fontSize: 13,
  },
  listContainer: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
  courseCard: {
    backgroundColor: Colors.background,
    borderRadius: Spacing.two,
    padding: Spacing.four,
    ...Colors.cardShadow,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.two,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
  },
  codeBadge: {
    backgroundColor: Colors.accentLight,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Spacing.one,
  },
  codeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: Colors.accentBlue,
  },
  courseDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: Spacing.three,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.two,
    alignItems: 'flex-end',
  },
  viewCourseText: {
    fontSize: 12,
    color: Colors.navySecondary,
    fontWeight: '700',
  },
  emptyContainer: {
    padding: Spacing.six,
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 15,
    marginBottom: Spacing.four,
  },
  emptyBtn: {
    borderWidth: 1,
    borderColor: Colors.navyPrimary,
    borderRadius: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  emptyBtnText: {
    color: Colors.navyPrimary,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: Spacing.four,
    borderTopRightRadius: Spacing.four,
    padding: Spacing.four,
    width: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: Spacing.two,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  closeBtn: {
    padding: Spacing.one,
  },
  closeBtnText: {
    fontSize: 20,
    color: Colors.textSecondary,
  },
  modalBody: {
    paddingVertical: Spacing.three,
  },
  inputContainer: {
    marginBottom: Spacing.three,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.one,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.one,
    padding: Spacing.two,
    fontSize: 15,
    color: Colors.text,
    backgroundColor: Colors.offWhite,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: Colors.navyPrimary,
    borderRadius: Spacing.two,
    padding: Spacing.three,
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  submitBtnText: {
    color: Colors.textLight,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
