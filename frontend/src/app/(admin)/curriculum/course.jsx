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
import { useRouter, useLocalSearchParams } from "expo-router";
import api from "../../../services/api";
import { Spacing } from "../../../constants/theme";
import { useAppTheme } from "../../../context/ThemeContext";

export default function CourseDetail() {
  const { colors } = useAppTheme();
  const styles = getStyles(colors);
  
  const { courseId, courseTitle } = useLocalSearchParams();
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Chapter modals states
  const [modalVisible, setModalVisible] = useState(false);
  const [editingChapter, setEditingChapter] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  const router = useRouter();

  const fetchChapters = async () => {
    try {
      const response = await api.get(`/chapters/${courseId}`);
      setChapters(response.data || []);
    } catch (e) {
      console.error("Error fetching chapters:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchChapters();
    }
  }, [courseId]);

  const handleOpenCreate = () => {
    setEditingChapter(null);
    setTitle("");
    setDescription("");
    setModalVisible(true);
  };

  const handleOpenEdit = (chapter) => {
    setEditingChapter(chapter);
    setTitle(chapter.title);
    setDescription(chapter.description || "");
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert("Validation Error", "Chapter title is required");
      return;
    }

    setSubmitLoading(true);
    try {
      if (editingChapter) {
        // Update Chapter
        const response = await api.patch(`/chapters/${editingChapter._id}`, {
          title: title.trim(),
          description: description.trim(),
        });
        setChapters((prev) =>
          prev.map((c) => (c._id === editingChapter._id ? response.data : c)),
        );
        Alert.alert("Success", "Chapter updated successfully");
      } else {
        // Create Chapter
        const response = await api.post("/chapters", {
          title: title.trim(),
          description: description.trim(),
          courseId,
        });
        setChapters((prev) => [...prev, response.data]);
        Alert.alert("Success", "Chapter created successfully");
      }
      setModalVisible(false);
    } catch (e) {
      Alert.alert(
        "Error",
        e.response?.data?.message || "Failed to save chapter",
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteChapter = (chapterId) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this chapter? This will remove all associated lectures and notes.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/chapters/${chapterId}`);
              setChapters((prev) => prev.filter((c) => c._id !== chapterId));
              Alert.alert("Success", "Chapter deleted successfully");
            } catch (e) {
              Alert.alert(
                "Error",
                e.response?.data?.message || "Failed to delete chapter",
              );
            }
          },
        },
      ],
    );
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
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>⬅️ Back</Text>
        </TouchableOpacity>
        <Text style={styles.courseHeaderTitle}>{courseTitle}</Text>
        <Text style={styles.sectionHeading}>Curriculum Chapters</Text>
      </View>

      <View style={styles.actionRow}>
        <Text style={styles.chaptersCountText}>
          📂 {chapters.length} Chapters
        </Text>
        <TouchableOpacity style={styles.addBtn} onPress={handleOpenCreate}>
          <Text style={styles.addBtnText}>+ Add Chapter</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={chapters}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <View style={styles.chapterCard}>
            <TouchableOpacity
              style={styles.chapterDetails}
              onPress={() =>
                router.push({
                  pathname: "/(admin)/curriculum/chapter",
                  params: {
                    chapterId: item._id,
                    chapterTitle: item.title,
                    courseTitle: courseTitle,
                  },
                })
              }
              activeOpacity={0.7}
            >
              <Text style={styles.chapterTitle}>{item.title}</Text>
              <Text style={styles.chapterDesc} numberOfLines={2}>
                {item.description || "No description provided."}
              </Text>
              <Text style={styles.viewLecturesLink}>
                Manage lectures & notes ➡️
              </Text>
            </TouchableOpacity>

            <View style={styles.cardActions}>
              <TouchableOpacity
                style={styles.actionIconBtn}
                onPress={() => handleOpenEdit(item)}
              >
                <Text style={styles.actionEmoji}>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionIconBtn}
                onPress={() => handleDeleteChapter(item._id)}
              >
                <Text style={styles.actionEmoji}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No chapters built in this course yet.
            </Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={handleOpenCreate}
            >
              <Text style={styles.emptyBtnText}>Create Chapter</Text>
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
              <Text style={styles.modalTitle}>
                {editingChapter ? "Edit Chapter Details" : "Create New Chapter"}
              </Text>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalBody}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Chapter Title *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Chapter 1: Real Numbers"
                  placeholderTextColor={colors.textSecondary}
                  value={title}
                  onChangeText={setTitle}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Describe Euclid's division algorithm etc..."
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  numberOfLines={4}
                  value={description}
                  onChangeText={setDescription}
                />
              </View>

              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleSubmit}
                disabled={submitLoading}
                activeOpacity={0.8}
              >
                {submitLoading ? (
                  <ActivityIndicator color={colors.textLight} />
                ) : (
                  <Text style={styles.submitBtnText}>
                    {editingChapter ? "Save Changes" : "Add Chapter"}
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const getStyles = (colors) => StyleSheet.create({
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
    padding: Spacing.four,
    backgroundColor: colors.navyPrimary,
  },
  backBtn: {
    alignSelf: "flex-start",
    marginBottom: Spacing.one,
  },
  backBtnText: {
    color: colors.textLight,
    fontWeight: "bold",
    fontSize: 14,
  },
  courseHeaderTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.textLight,
    marginBottom: Spacing.half,
  },
  sectionHeading: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    textTransform: "uppercase",
    fontWeight: "700",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  chaptersCountText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  addBtn: {
    backgroundColor: colors.accentBlue,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.one,
  },
  addBtnText: {
    color: colors.textLight,
    fontWeight: "bold",
    fontSize: 13,
  },
  listContainer: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
  chapterCard: {
    flexDirection: "row",
    backgroundColor: colors.background,
    borderRadius: Spacing.two,
    padding: Spacing.four,
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.border,
    ...colors.cardShadow,
  },
  chapterDetails: {
    flex: 1,
    paddingRight: Spacing.two,
  },
  chapterTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: Spacing.one,
  },
  chapterDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: Spacing.two,
  },
  viewLecturesLink: {
    fontSize: 12,
    color: colors.accentBlue,
    fontWeight: "700",
  },
  cardActions: {
    justifyContent: "flex-start",
    gap: Spacing.two,
  },
  actionIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.offWhite,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionEmoji: {
    fontSize: 14,
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
});
