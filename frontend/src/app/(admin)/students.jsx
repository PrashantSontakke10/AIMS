import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  FlatList,
  Alert,
} from "react-native";
import api from "../../services/api";
import { Colors, Spacing } from "../../constants/theme";

export default function StudentsManagement() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedStudent, setSelectedStudent] = useState(null);
  // Assign course modal states
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [bulkAssignMode, setBulkAssignMode] = useState(false);
  const [selectedCoursesForBulk, setSelectedCoursesForBulk] = useState([]);

  const fetchData = async () => {
    try {
      const [studentsRes, coursesRes] = await Promise.all([
        api.get("/api/admin/students"),
        api.get("/courses"),
      ]);
      setStudents(studentsRes.data);
      setCourses(coursesRes.data);
    } catch (e) {
      console.error("Error fetching students management data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (userId) => {
    try {
      await api.patch("/api/admin/approve", { userId });
      setStudents((prev) =>
        prev.map((s) => (s._id === userId ? { ...s, status: "active" } : s)),
      );
      if (selectedStudent?._id === userId) {
        setSelectedStudent((prev) =>
          prev ? { ...prev, status: "active" } : null,
        );
      }
      Alert.alert("Success", "Student approved successfully");
    } catch (e) {
      Alert.alert(
        "Error",
        e.response?.data?.message || "Failed to approve student",
      );
    }
  };

  const handleBlock = async (userId) => {
    try {
      await api.patch("/api/admin/block", { userId });
      setStudents((prev) =>
        prev.map((s) => (s._id === userId ? { ...s, status: "blocked" } : s)),
      );
      if (selectedStudent?._id === userId) {
        setSelectedStudent((prev) =>
          prev ? { ...prev, status: "blocked" } : null,
        );
      }
      Alert.alert("Success", "Student blocked successfully");
    } catch (e) {
      Alert.alert(
        "Error",
        e.response?.data?.message || "Failed to block student",
      );
    }
  };

  const handleAssignSingleCourse = async (courseId) => {
    if (!selectedStudent) return;
    try {
      const response = await api.patch("/api/admin/assign-course", {
        userId: selectedStudent._id,
        courseId,
      });
      const updatedUser = response.data.user;
      // Update local state lists
      const fullAssignedCourses = courses.filter((c) =>
        updatedUser.assignedCourses.includes(c._id),
      );
      setStudents((prev) =>
        prev.map((s) =>
          s._id === selectedStudent._id
            ? {
                ...s,
                status: updatedUser.status,
                assignedCourses: fullAssignedCourses,
              }
            : s,
        ),
      );
      setSelectedStudent((prev) =>
        prev
          ? {
              ...prev,
              status: updatedUser.status,
              assignedCourses: fullAssignedCourses,
            }
          : null,
      );
      setAssignModalVisible(false);
      Alert.alert("Success", "Course assigned successfully");
    } catch (e) {
      Alert.alert(
        "Error",
        e.response?.data?.message || "Failed to assign course",
      );
    }
  };

  const handleRemoveCourse = async (courseId) => {
    if (!selectedStudent) return;
    try {
      const response = await api.patch("/api/admin/remove-course", {
        userId: selectedStudent._id,
        courseId,
      });
      const updatedUser = response.data.user;
      const fullAssignedCourses = courses.filter((c) =>
        updatedUser.assignedCourses.includes(c._id),
      );
      setStudents((prev) =>
        prev.map((s) =>
          s._id === selectedStudent._id
            ? { ...s, assignedCourses: fullAssignedCourses }
            : s,
        ),
      );
      setSelectedStudent((prev) =>
        prev ? { ...prev, assignedCourses: fullAssignedCourses } : null,
      );
      Alert.alert("Success", "Course removed successfully");
    } catch (e) {
      Alert.alert(
        "Error",
        e.response?.data?.message || "Failed to remove course",
      );
    }
  };

  const handleBulkAssign = async () => {
    if (!selectedStudent) return;
    if (selectedCoursesForBulk.length === 0) {
      Alert.alert("Selection Empty", "Please select at least one course.");
      return;
    }
    try {
      const response = await api.post("/api/admin/assign-courses", {
        userId: selectedStudent._id,
        courseIds: selectedCoursesForBulk,
      });

      const updatedUser = response.data.user;
      const fullAssignedCourses = courses.filter((c) =>
        updatedUser.assignedCourses.includes(c._id),
      );

      setStudents((prev) =>
        prev.map((s) =>
          s._id === selectedStudent._id
            ? {
                ...s,
                status: updatedUser.status,
                assignedCourses: fullAssignedCourses,
              }
            : s,
        ),
      );
      setSelectedStudent((prev) =>
        prev
          ? {
              ...prev,
              status: updatedUser.status,
              assignedCourses: fullAssignedCourses,
            }
          : null,
      );
      setAssignModalVisible(false);
      setSelectedCoursesForBulk([]);
      setBulkAssignMode(false);
      Alert.alert("Success", "Bulk courses assigned and student approved");
    } catch (e) {
      Alert.alert(
        "Error",
        e.response?.data?.message || "Failed to assign bulk courses",
      );
    }
  };

  const toggleBulkCourseSelection = (courseId) => {
    setSelectedCoursesForBulk((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId],
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.navyPrimary} />
      </View>
    );
  }

  const filteredStudents = students.filter(
    (s) =>
      s.status === activeTab &&
      s.mobile.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Students Management</Text>
        <TextInput
          style={styles.searchBar}
          placeholder="🔎 Search by mobile number..."
          placeholderTextColor="#A0AEC0"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.tabsRow}>
        {["pending", "active", "blocked"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tabButton,
              activeTab === tab ? styles.tabButtonActive : null,
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === tab ? styles.tabButtonTextActive : null,
              ]}
            >
              {tab.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredStudents}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.studentCard}
            onPress={() => setSelectedStudent(item)}
            activeOpacity={0.8}
          >
            <View>
              <Text style={styles.studentMobile}>{item.mobile}</Text>
              <Text style={styles.coursesCount}>
                📚 Courses: {item.assignedCourses?.length || 0}
              </Text>
            </View>
            <Text style={styles.detailArrow}>➡️</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No students found in this section.
            </Text>
          </View>
        }
      />

      {selectedStudent && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={!!selectedStudent}
          onRequestClose={() => setSelectedStudent(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Student Profile</Text>
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={() => setSelectedStudent(null)}
                >
                  <Text style={styles.closeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={styles.modalBody}>
                <Text style={styles.profileMobile}>
                  {selectedStudent.mobile}
                </Text>

                <View style={styles.profileStatusRow}>
                  <Text style={styles.boldLabel}>Status:</Text>
                  <View
                    style={[
                      styles.badge,
                      {
                        backgroundColor: `${Colors[selectedStudent.status]}15`,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        { color: Colors[selectedStudent.status] },
                      ]}
                    >
                      {selectedStudent.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={styles.actionButtonsRow}>
                  {selectedStudent.status === "pending" && (
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.approveBtn]}
                      onPress={() => handleApprove(selectedStudent._id)}
                    >
                      <Text style={styles.btnTextLight}>Approve Student</Text>
                    </TouchableOpacity>
                  )}

                  {selectedStudent.status === "active" && (
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.blockBtn]}
                      onPress={() => handleBlock(selectedStudent._id)}
                    >
                      <Text style={styles.btnTextLight}>Block Student</Text>
                    </TouchableOpacity>
                  )}

                  {selectedStudent.status === "blocked" && (
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.approveBtn]}
                      onPress={() => handleApprove(selectedStudent._id)}
                    >
                      <Text style={styles.btnTextLight}>Unblock / Approve</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.coursesSection}>
                  <View style={styles.coursesHeader}>
                    <Text style={styles.sectionHeaderTitle}>
                      Assigned Courses
                    </Text>
                    <TouchableOpacity
                      style={styles.addCourseBtn}
                      onPress={() => {
                        setBulkAssignMode(false);
                        setAssignModalVisible(true);
                      }}
                    >
                      <Text style={styles.addCourseBtnText}>
                        + Assign Single
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {selectedStudent.assignedCourses?.length === 0 ? (
                    <Text style={styles.noCoursesText}>
                      No courses assigned yet.
                    </Text>
                  ) : (
                    selectedStudent.assignedCourses.map((c) => (
                      <View key={c._id} style={styles.courseRow}>
                        <View style={styles.courseDetails}>
                          <Text style={styles.courseRowTitle}>{c.title}</Text>
                          {c.code ? (
                            <Text style={styles.courseRowCode}>{c.code}</Text>
                          ) : null}
                        </View>
                        <TouchableOpacity
                          style={styles.removeCourseBtn}
                          onPress={() => handleRemoveCourse(c._id)}
                        >
                          <Text style={styles.removeCourseText}>Remove</Text>
                        </TouchableOpacity>
                      </View>
                    ))
                  )}

                  <TouchableOpacity
                    style={styles.bulkAssignTriggerBtn}
                    onPress={() => {
                      setBulkAssignMode(true);
                      // Pre-fill selected state with already assigned courses
                      setSelectedCoursesForBulk(
                        selectedStudent.assignedCourses.map((c) => c._id),
                      );
                      setAssignModalVisible(true);
                    }}
                  >
                    <Text style={styles.bulkAssignTriggerBtnText}>
                      📦 Bulk Assign & Auto-Approve
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      <Modal
        animationType="fade"
        transparent={true}
        visible={assignModalVisible}
        onRequestClose={() => setAssignModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: "80%" }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {bulkAssignMode
                  ? "Bulk Assign Courses"
                  : "Select Course to Assign"}
              </Text>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setAssignModalVisible(false)}
              >
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalBody}>
              {courses.map((course) => {
                const isAssigned = selectedStudent?.assignedCourses.some(
                  (c) => c._id === course._id,
                );
                const isSelectedInBulk = selectedCoursesForBulk.includes(
                  course._id,
                );

                return (
                  <TouchableOpacity
                    key={course._id}
                    style={[
                      styles.courseOptionCard,
                      bulkAssignMode
                        ? isSelectedInBulk
                          ? styles.courseOptionCardSelected
                          : null
                        : isAssigned
                          ? styles.courseOptionCardDisabled
                          : null,
                    ]}
                    disabled={!bulkAssignMode && isAssigned}
                    onPress={() => {
                      if (bulkAssignMode) {
                        toggleBulkCourseSelection(course._id);
                      } else {
                        handleAssignSingleCourse(course._id);
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.courseOptionDetails}>
                      <Text style={styles.courseOptionTitle}>
                        {course.title}
                      </Text>
                      {course.code ? (
                        <Text style={styles.courseOptionCode}>
                          {course.code}
                        </Text>
                      ) : null}
                    </View>
                    {bulkAssignMode ? (
                      <View
                        style={[
                          styles.checkbox,
                          isSelectedInBulk ? styles.checkboxChecked : null,
                        ]}
                      >
                        {isSelectedInBulk && (
                          <Text style={styles.checkboxCheckmark}>✓</Text>
                        )}
                      </View>
                    ) : (
                      isAssigned && (
                        <Text style={styles.assignedBadgeText}>Assigned</Text>
                      )
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {bulkAssignMode && (
              <View style={styles.bulkSubmitContainer}>
                <TouchableOpacity
                  style={styles.bulkSubmitBtn}
                  onPress={handleBulkAssign}
                >
                  <Text style={styles.btnTextLight}>
                    Save & Approve Student
                  </Text>
                </TouchableOpacity>
              </View>
            )}
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
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.offWhite,
  },
  header: {
    padding: Spacing.four,
    backgroundColor: Colors.navyPrimary,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.textLight,
    marginBottom: Spacing.three,
  },
  searchBar: {
    backgroundColor: Colors.background,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    height: 44,
    color: Colors.text,
    fontSize: 15,
  },
  tabsRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.background,
  },
  tabButton: {
    flex: 1,
    paddingVertical: Spacing.three,
    alignItems: "center",
  },
  tabButtonActive: {
    borderBottomWidth: 3,
    borderBottomColor: Colors.navyPrimary,
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  tabButtonTextActive: {
    color: Colors.navyPrimary,
    fontWeight: "bold",
  },
  studentCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.background,
    padding: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  studentMobile: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  coursesCount: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: Spacing.half,
  },
  detailArrow: {
    fontSize: 16,
  },
  emptyContainer: {
    padding: Spacing.six,
    alignItems: "center",
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: Spacing.four,
    borderTopRightRadius: Spacing.four,
    padding: Spacing.four,
    width: "100%",
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: Spacing.two,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
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
    paddingTop: Spacing.three,
    paddingBottom: Spacing.five,
  },
  profileMobile: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.text,
  },
  profileStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.two,
    marginBottom: Spacing.four,
  },
  boldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    marginRight: Spacing.two,
  },
  badge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Spacing.one,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "bold",
  },
  actionButtonsRow: {
    flexDirection: "row",
    marginBottom: Spacing.five,
  },
  actionBtn: {
    flex: 1,
    height: 44,
    borderRadius: Spacing.two,
    alignItems: "center",
    justifyContent: "center",
  },
  approveBtn: {
    backgroundColor: Colors.active,
  },
  blockBtn: {
    backgroundColor: Colors.blocked,
  },
  btnTextLight: {
    color: Colors.textLight,
    fontWeight: "bold",
    fontSize: 15,
  },
  coursesSection: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.four,
  },
  coursesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.three,
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
  },
  addCourseBtn: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
    borderRadius: Spacing.one,
    backgroundColor: Colors.accentLight,
  },
  addCourseBtnText: {
    color: Colors.accentBlue,
    fontSize: 13,
    fontWeight: "bold",
  },
  noCoursesText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontStyle: "italic",
    marginBottom: Spacing.three,
  },
  courseRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.offWhite,
    padding: Spacing.two,
    borderRadius: Spacing.one,
    marginBottom: Spacing.two,
  },
  courseDetails: {
    flex: 1,
  },
  courseRowTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
  },
  courseRowCode: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: Spacing.half,
  },
  removeCourseBtn: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  removeCourseText: {
    color: Colors.blocked,
    fontWeight: "600",
    fontSize: 12,
  },
  bulkAssignTriggerBtn: {
    marginTop: Spacing.four,
    borderWidth: 1,
    borderColor: Colors.accentBlue,
    borderRadius: Spacing.two,
    padding: Spacing.three,
    alignItems: "center",
    backgroundColor: Colors.accentLight,
  },
  bulkAssignTriggerBtnText: {
    color: Colors.accentBlue,
    fontWeight: "bold",
    fontSize: 14,
  },
  courseOptionCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  courseOptionCardSelected: {
    backgroundColor: Colors.accentLight,
  },
  courseOptionCardDisabled: {
    backgroundColor: "#EDF2F7",
    opacity: 0.6,
  },
  courseOptionDetails: {
    flex: 1,
  },
  courseOptionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
  },
  courseOptionCode: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: Spacing.half,
  },
  assignedBadgeText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: Colors.accentBlue,
    borderColor: Colors.accentBlue,
  },
  checkboxCheckmark: {
    color: Colors.textLight,
    fontWeight: "bold",
    fontSize: 12,
  },
  bulkSubmitContainer: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.three,
  },
  bulkSubmitBtn: {
    backgroundColor: Colors.navyPrimary,
    borderRadius: Spacing.two,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
});
