import React, { useState, useEffect } from "react";
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
} from "react-native";
import { useRouter } from "expo-router";
import api from "../../../services/api";
import { Spacing } from "../../../constants/theme";
import { useAppTheme } from "../../../context/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CoursesList() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = getStyles(colors, insets);
  
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [code, setCode] = useState("");
  const [grade, setGrade] = useState("all");
  const [createLoading, setCreateLoading] = useState(false);
  const router = useRouter();

  const fetchCourses = async () => {
    try {
      const response = await api.get("/courses");
      setCourses(response.data || []);
    } catch (e) {
      console.error("Error fetching courses:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleCreateCourse = async () => {
    if (!title.trim()) {
      Alert.alert("Validation Error", "Course title is required");
      return;
    }

    setCreateLoading(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        grade: grade,
      };
      if (code.trim()) {
        payload.code = code.trim().toUpperCase();
      }

      const response = await api.post("/courses", payload);
      setCourses((prev) => [response.data, ...prev]);
      // Reset form
      setTitle("");
      setDescription("");
      setCode("");
      setGrade("all");
      setModalVisible(false);
      Alert.alert("Success", "Course created successfully");
    } catch (e) {
      Alert.alert(
        "Error",
        e.response?.data?.message || "Failed to create course",
      );
    } finally {
      setCreateLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.navyPrimary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flex: 1, marginRight: Spacing.two }}>
          <Text style={styles.headerTitle}>Course Workspace</Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            Select a course to build chapters and materials.
          </Text>
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
                pathname: "/(admin)/curriculum/course",
                params: { courseId: item._id, courseTitle: item.title },
              })
            }
            activeOpacity={0.8}
          >
            <View style={styles.courseHeader}>
              <Text style={styles.courseTitle} numberOfLines={1}>{item.title}</Text>
              <View style={{ flexDirection: "row", gap: Spacing.one }}>
                {item.grade ? (
                  <View style={[styles.codeBadge, { backgroundColor: colors.navyPrimary }]}>
                    <Text style={[styles.codeText, { color: colors.textLight }]}>{item.grade.toUpperCase()}</Text>
                  </View>
                ) : null}
                {item.code ? (
                  <View style={styles.codeBadge}>
                    <Text style={styles.codeText}>{item.code}</Text>
                  </View>
                ) : null}
              </View>
            </View>
            <Text style={styles.courseDesc} numberOfLines={2}>
              {item.description || "No description provided."}
            </Text>
            <View style={styles.cardFooter}>
              <Text style={styles.viewCourseText}>Manage Curriculum ➡️</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No courses have been created yet.
            </Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => setModalVisible(true)}
            >
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
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalBody}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Course Title *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Grade 10 Mathematics"
                  placeholderTextColor={colors.textSecondary}
                  value={title}
                  onChangeText={setTitle}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Course Code (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. MATH10"
                  placeholderTextColor={colors.textSecondary}
                  value={code}
                  onChangeText={setCode}
                  autoCapitalize="characters"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Target Class / Category *</Text>
                <View style={styles.gradeSelector}>
                  {["5th", "6th", "7th", "8th", "9th", "10th", "free", "all"].map((g) => (
                    <TouchableOpacity
                      key={g}
                      style={[
                        styles.gradeChip,
                        grade === g ? styles.gradeChipActive : null,
                      ]}
                      onPress={() => setGrade(g)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.gradeChipText,
                          grade === g ? styles.gradeChipTextActive : null,
                        ]}
                      >
                        {g.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Enter details about this course..."
                  placeholderTextColor={colors.textSecondary}
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
                  <ActivityIndicator color={colors.textLight} />
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

const getStyles = (colors, insets) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.offWhite,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.offWhite,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.navyPrimary,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingTop: insets.top + Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.four,
    ...colors.cardShadow,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.textLight,
  },
  headerSubtitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    marginTop: Spacing.half,
  },
  createBtn: {
    backgroundColor: colors.accentBlue,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.one,
  },
  createBtnText: {
    color: colors.textLight,
    fontWeight: "bold",
    fontSize: 13,
  },
  listContainer: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
  courseCard: {
    backgroundColor: colors.background,
    borderRadius: Spacing.two,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: colors.border,
    ...colors.cardShadow,
  },
  courseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.two,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    flex: 1,
  },
  codeBadge: {
    backgroundColor: colors.accentLight,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Spacing.one,
  },
  codeText: {
    fontSize: 11,
    fontWeight: "bold",
    color: colors.accentBlue,
  },
  courseDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: Spacing.three,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: Spacing.two,
    alignItems: "flex-end",
  },
  viewCourseText: {
    fontSize: 12,
    color: colors.accentBlue,
    fontWeight: "700",
  },
  emptyContainer: {
    padding: Spacing.six,
    alignItems: "center",
    marginTop: 40,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 15,
    marginBottom: Spacing.four,
  },
  emptyBtn: {
    borderWidth: 1,
    borderColor: colors.navyPrimary,
    borderRadius: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    backgroundColor: colors.background,
  },
  emptyBtnText: {
    color: colors.navyPrimary,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: Spacing.four,
    borderTopRightRadius: Spacing.four,
    padding: Spacing.four,
    width: "100%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: Spacing.two,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
  },
  closeBtn: {
    padding: Spacing.one,
  },
  closeBtnText: {
    fontSize: 20,
    color: colors.textSecondary,
  },
  modalBody: {
    paddingVertical: Spacing.three,
  },
  inputContainer: {
    marginBottom: Spacing.three,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text,
    marginBottom: Spacing.one,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: Spacing.one,
    padding: Spacing.two,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.offWhite,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  submitBtn: {
    backgroundColor: colors.navyPrimary,
    borderRadius: Spacing.two,
    padding: Spacing.three,
    alignItems: "center",
    marginTop: Spacing.two,
  },
  submitBtnText: {
    color: colors.textLight,
    fontWeight: "bold",
    fontSize: 16,
  },
  gradeSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  gradeChip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: 20,
    backgroundColor: colors.offWhite,
    borderWidth: 1,
    borderColor: colors.border,
  },
  gradeChipActive: {
    backgroundColor: colors.navyPrimary,
    borderColor: colors.navyPrimary,
  },
  gradeChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  gradeChipTextActive: {
    color: colors.textLight,
  },
});
