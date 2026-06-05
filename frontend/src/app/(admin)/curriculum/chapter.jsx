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
  Linking,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import * as WebBrowser from "expo-web-browser";
import { WebView } from "react-native-webview";
import api from "../../../services/api";
import { Spacing } from "../../../constants/theme";
import { useAppTheme } from "../../../context/ThemeContext";

const VIDEO_PROTECTION_JS = `
  (function() {
    // 1. Disable text selection and touch callouts
    const style = document.createElement('style');
    style.innerHTML = ' \\
      * { \\
        -webkit-touch-callout: none !important; \\
        -webkit-user-select: none !important; \\
        user-select: none !important; \\
      } \\
      iframe { \\
        -webkit-touch-callout: none !important; \\
        -webkit-user-select: none !important; \\
        user-select: none !important; \\
      } \\
    ';
    document.head.appendChild(style);

    // 2. Disable context menu & copy/cut
    window.addEventListener('contextmenu', function(e) { e.preventDefault(); }, true);
    document.addEventListener('contextmenu', function(e) { e.preventDefault(); }, true);
    window.addEventListener('copy', function(e) { e.preventDefault(); }, true);
    window.addEventListener('cut', function(e) { e.preventDefault(); }, true);

    // 3. Hide Google Drive sharing/downloading tools
    function hideElements() {
      const selectors = [
        '[role="toolbar"]',
        '[class*="chrome-top"]',
        '[class*="viewer-chrome-top"]',
        '[class*="ndfHFb-c43Zrf-V173Ib"]',
        '[class*="ndfHFb-c43Zrf-RZn5ee"]',
        '[aria-label*="Download"]',
        '[aria-label*="download"]',
        '[aria-label*="Print"]',
        '[aria-label*="print"]',
        '[aria-label*="Pop-out"]',
        '[aria-label*="pop-out"]',
        '[aria-label*="Open in new"]',
        '[aria-label*="Share"]',
        '[aria-label*="share"]',
        '[data-tooltip*="Download"]',
        '[data-tooltip*="Print"]',
        '[data-tooltip*="Pop-out"]',
        '[data-tooltip*="Open in new"]'
      ];
      selectors.forEach(function(selector) {
        try {
          const elements = document.querySelectorAll(selector);
          elements.forEach(function(el) {
            if (el && el.style.display !== 'none') {
              el.style.setProperty('display', 'none', 'important');
            }
          });
        } catch (e) {}
      });
    }

    hideElements();
    const interval = setInterval(hideElements, 150);
    setTimeout(function() { clearInterval(interval); }, 10000);
  })();
  true;
`;

export default function ChapterDetail() {
  const { colors } = useAppTheme();
  const styles = getStyles(colors);
  
  const { chapterId, chapterTitle, courseTitle } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState("lectures");
  const [loading, setLoading] = useState(true);

  // Data states
  const [lectures, setLectures] = useState([]);
  const [notes, setNotes] = useState([]);

  // Lecture modal states
  const [lectureModalVisible, setLectureModalVisible] = useState(false);
  const [editingLecture, setEditingLecture] = useState(null);
  const [lectureTitle, setLectureTitle] = useState("");
  const [lectureDesc, setLectureDesc] = useState("");
  const [lectureVideoUrl, setLectureVideoUrl] = useState("");
  const [lectureSubmitLoading, setLectureSubmitLoading] = useState(false);

  // Note modal states
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteDesc, setNoteDesc] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [noteSubmitLoading, setNoteSubmitLoading] = useState(false);

  // Video player modal states
  const [videoPlayerVisible, setVideoPlayerVisible] = useState(false);
  const [activeVideoUrl, setActiveVideoUrl] = useState(null);

  const router = useRouter();

  const fetchData = async () => {
    try {
      const [lecturesRes, notesRes] = await Promise.all([
        api.get(`/lectures/${chapterId}`),
        api.get(`/notes/${chapterId}`),
      ]);
      setLectures(lecturesRes.data || []);
      setNotes(notesRes.data || []);
    } catch (e) {
      console.error("Error fetching chapter elements:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (chapterId) {
      fetchData();
    }
  }, [chapterId]);

  // -- Lecture operations --
  const handleOpenCreateLecture = () => {
    setEditingLecture(null);
    setLectureTitle("");
    setLectureDesc("");
    setLectureVideoUrl("");
    setLectureModalVisible(true);
  };

  const handleOpenEditLecture = (lecture) => {
    setEditingLecture(lecture);
    setLectureTitle(lecture.title);
    setLectureDesc(lecture.description || "");
    setLectureVideoUrl(lecture.videoUrl);
    setLectureModalVisible(true);
  };

  const handleLectureSubmit = async () => {
    if (!lectureTitle.trim() || !lectureVideoUrl.trim()) {
      Alert.alert("Validation Error", "Title and Video URL are required");
      return;
    }

    setLectureSubmitLoading(true);
    try {
      if (editingLecture) {
        // Update Lecture
        const response = await api.patch(`/lectures/${editingLecture._id}`, {
          title: lectureTitle.trim(),
          description: lectureDesc.trim(),
          videoUrl: lectureVideoUrl.trim(),
        });
        setLectures((prev) =>
          prev.map((l) => (l._id === editingLecture._id ? response.data : l)),
        );
        Alert.alert("Success", "Lecture updated successfully");
      } else {
        // Create Lecture
        const response = await api.post("/lectures", {
          title: lectureTitle.trim(),
          description: lectureDesc.trim(),
          videoUrl: lectureVideoUrl.trim(),
          chapterId,
        });
        setLectures((prev) => [...prev, response.data]);
        Alert.alert("Success", "Lecture created successfully");
      }
      setLectureModalVisible(false);
    } catch (e) {
      Alert.alert(
        "Error",
        e.response?.data?.message || "Failed to save lecture",
      );
    } finally {
      setLectureSubmitLoading(false);
    }
  };

  const handleDeleteLecture = (lectureId) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this lecture?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/lectures/${lectureId}`);
              setLectures((prev) => prev.filter((l) => l._id !== lectureId));
              Alert.alert("Success", "Lecture deleted successfully");
            } catch (e) {
              Alert.alert(
                "Error",
                e.response?.data?.message || "Failed to delete lecture",
              );
            }
          },
        },
      ],
    );
  };

  const getEmbeddableUrl = (url) => {
    if (!url) return "";
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      let videoId = "";
      if (url.includes("youtu.be/")) {
        videoId = url.split("youtu.be/")[1].split("?")[0];
      } else if (url.includes("v=")) {
        videoId = url.split("v=")[1].split("&")[0];
      } else if (url.includes("embed/")) {
        videoId = url.split("embed/")[1].split("?")[0];
      }
      return `https://www.youtube-nocookie.com/embed/${videoId}?controls=1&modestbranding=1&rel=0&origin=https://youtube.com`;
    }
    if (url.includes("drive.google.com")) {
      return url.replace("/view", "/preview").replace("/edit", "/preview");
    }
    return url;
  };

  const handleWatchVideo = (url) => {
    const embedUrl = getEmbeddableUrl(url);
    setActiveVideoUrl(embedUrl);
    setVideoPlayerVisible(true);
  };

  // -- Note / Document picker operations --
  const handleSelectFiles = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
        multiple: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedFiles(result.assets);
      }
    } catch (err) {
      console.error("Error selecting documents:", err);
    }
  };

  const handleNoteSubmit = async () => {
    if (!noteTitle.trim()) {
      Alert.alert("Validation Error", "Note Title is required");
      return;
    }
    if (selectedFiles.length === 0) {
      Alert.alert(
        "Validation Error",
        "Please select at least one document file",
      );
      return;
    }

    setNoteSubmitLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", noteTitle.trim());
      formData.append("description", noteDesc.trim());
      formData.append("chapterId", chapterId);

      selectedFiles.forEach((file) => {
        formData.append("files", {
          uri: file.uri,
          name: file.name,
          type: file.mimeType || "application/pdf",
        });
      });

      const response = await api.post("/notes", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setNotes((prev) => [...(response.data || []), ...prev]);

      setNoteTitle("");
      setNoteDesc("");
      setSelectedFiles([]);
      setNoteModalVisible(false);
      Alert.alert(
        "Success",
        "Notes uploaded and sync'd with Google Drive successfully!",
      );
    } catch (e) {
      Alert.alert(
        "Upload Error",
        e.response?.data?.message || "Failed to upload notes",
      );
    } finally {
      setNoteSubmitLoading(false);
    }
  };

  const handleDeleteNote = (noteId) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this note? It will be deleted from the database and your Google Drive course folder.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/notes/${noteId}`);
              setNotes((prev) => prev.filter((n) => n._id !== noteId));
              Alert.alert("Success", "Note removed successfully");
            } catch (e) {
              Alert.alert(
                "Error",
                e.response?.data?.message || "Failed to delete note",
              );
            }
          },
        },
      ],
    );
  };

  const handleOpenNote = async (url) => {
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch (e) {
      Linking.openURL(url).catch(() =>
        Alert.alert("Error", "Unable to view note URL"),
      );
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
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>⬅️ Back to Chapters</Text>
        </TouchableOpacity>
        <Text style={styles.courseHeaderTitle}>{courseTitle}</Text>
        <Text style={styles.chapterHeaderTitle}>📂 {chapterTitle}</Text>
      </View>

      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "lectures" ? styles.tabButtonActive : null,
          ]}
          onPress={() => setActiveTab("lectures")}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === "lectures" ? styles.tabButtonTextActive : null,
            ]}
          >
            Lectures ({lectures.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "notes" ? styles.tabButtonActive : null,
          ]}
          onPress={() => setActiveTab("notes")}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === "notes" ? styles.tabButtonTextActive : null,
            ]}
          >
            Notes / PDFs ({notes.length})
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actionRow}>
        <Text style={styles.countIndicatorText}>
          {activeTab === "lectures"
            ? `📹 ${lectures.length} Lectures`
            : `📄 ${notes.length} Notes`}
        </Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={
            activeTab === "lectures"
              ? handleOpenCreateLecture
              : () => setNoteModalVisible(true)
          }
        >
          <Text style={styles.addBtnText}>
            {activeTab === "lectures" ? "+ New Lecture" : "+ Upload Notes"}
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === "lectures" ? (
        /* Lectures List */
        <FlatList
          data={lectures}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <View style={styles.itemCard}>
              <View style={styles.itemDetails}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemDesc} numberOfLines={2}>
                  {item.description || "No description."}
                </Text>
                <TouchableOpacity
                  style={styles.actionLinkBtn}
                  onPress={() => handleWatchVideo(item.videoUrl)}
                >
                  <Text style={styles.actionLinkText}>▶️ Watch Video</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.actionIconBtn}
                  onPress={() => handleOpenEditLecture(item)}
                >
                  <Text style={styles.actionEmoji}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionIconBtn}
                  onPress={() => handleDeleteLecture(item._id)}
                >
                  <Text style={styles.actionEmoji}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No lectures added to this chapter yet.
              </Text>
            </View>
          }
        />
      ) : (
        /* Notes List */
        <FlatList
          data={notes}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <View style={styles.itemCard}>
              <View style={styles.itemDetails}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemDesc} numberOfLines={2}>
                  {item.description || "No description."}
                </Text>
                <View style={styles.linksRow}>
                  <TouchableOpacity
                    style={[
                      styles.actionLinkBtn,
                      { marginRight: Spacing.three },
                    ]}
                    onPress={() => handleOpenNote(item.fileUrl)}
                  >
                    <Text style={styles.actionLinkText}>👁️ View in Drive</Text>
                  </TouchableOpacity>
                  {item.downloadUrl && (
                    <TouchableOpacity
                      style={styles.actionLinkBtn}
                      onPress={() => handleOpenNote(item.downloadUrl)}
                    >
                      <Text style={styles.actionLinkText}>⬇️ Download</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.actionIconBtn}
                  onPress={() => handleDeleteNote(item._id)}
                >
                  <Text style={styles.actionEmoji}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No handouts or PDF notes uploaded yet.
              </Text>
            </View>
          }
        />
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={lectureModalVisible}
        onRequestClose={() => setLectureModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingLecture ? "Edit Lecture details" : "Add New Lecture"}
              </Text>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setLectureModalVisible(false)}
              >
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalBody}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Lecture Title *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Lecture 1: Rational Numbers"
                  placeholderTextColor={colors.textSecondary}
                  value={lectureTitle}
                  onChangeText={setLectureTitle}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Video URL *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. https://drive.google.com/..."
                  placeholderTextColor={colors.textSecondary}
                  value={lectureVideoUrl}
                  onChangeText={setLectureVideoUrl}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Brief summary of lecture content..."
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  numberOfLines={4}
                  value={lectureDesc}
                  onChangeText={setLectureDesc}
                />
              </View>

              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleLectureSubmit}
                disabled={lectureSubmitLoading}
                activeOpacity={0.8}
              >
                {lectureSubmitLoading ? (
                  <ActivityIndicator color={colors.textLight} />
                ) : (
                  <Text style={styles.submitBtnText}>
                    {editingLecture ? "Save Lecture" : "Create Lecture"}
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={noteModalVisible}
        onRequestClose={() => setNoteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Upload PDF Notes</Text>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setNoteModalVisible(false)}
              >
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalBody}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Note Title *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Chapter 1 Biology Handout"
                  placeholderTextColor={colors.textSecondary}
                  value={noteTitle}
                  onChangeText={setNoteTitle}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="e.g. Core concepts and definitions for Chapter 1"
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  numberOfLines={4}
                  value={noteDesc}
                  onChangeText={setNoteDesc}
                />
              </View>

              <View style={styles.fileSelectContainer}>
                <TouchableOpacity
                  style={styles.fileSelectBtn}
                  onPress={handleSelectFiles}
                >
                  <Text style={styles.fileSelectBtnText}>
                    📎 Select PDF or Word Files
                  </Text>
                </TouchableOpacity>

                {selectedFiles.length > 0 ? (
                  <View style={styles.selectedFilesList}>
                    <Text style={styles.selectedHeading}>
                      Selected Files ({selectedFiles.length}):
                    </Text>
                    {selectedFiles.map((file, idx) => (
                      <Text
                        key={idx}
                        style={styles.fileNameText}
                        numberOfLines={1}
                      >
                        📄 {file.name} (
                        {Math.round(file.size ? file.size / 1024 : 0)} KB)
                      </Text>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.noFilesSelectedText}>
                    No documents selected.
                  </Text>
                )}
              </View>

              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleNoteSubmit}
                disabled={noteSubmitLoading}
                activeOpacity={0.8}
              >
                {noteSubmitLoading ? (
                  <ActivityIndicator color={colors.textLight} />
                ) : (
                  <Text style={styles.submitBtnText}>
                    Upload & Sync to Drive
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={videoPlayerVisible}
        onRequestClose={() => setVideoPlayerVisible(false)}
      >
        <View style={styles.videoPlayerOverlay}>
          <View style={styles.videoPlayerContent}>
            <View style={styles.videoPlayerHeader}>
              <Text style={styles.videoPlayerTitle}>Lecture Video Player</Text>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setVideoPlayerVisible(false)}
              >
                <Text style={[styles.closeBtnText, { color: colors.textLight }]}>✕ Close</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.videoFrame}>
              {activeVideoUrl ? (
                activeVideoUrl.includes("youtube") ? (
                  <WebView
                    source={{
                      html: `
                        <!DOCTYPE html>
                        <html>
                          <head>
                            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
                            <style>
                              body, html {
                                margin: 0;
                                padding: 0;
                                width: 100%;
                                height: 100%;
                                background-color: #000;
                                overflow: hidden;
                                -webkit-user-select: none !important;
                                -webkit-touch-callout: none !important;
                                user-select: none !important;
                              }
                              .player-container {
                                position: relative;
                                width: 100%;
                                height: 100%;
                              }
                              iframe {
                                width: 100%;
                                height: 100%;
                                border: none;
                                position: absolute;
                                top: 0;
                                left: 0;
                                z-index: 1;
                                -webkit-touch-callout: none !important;
                                -webkit-user-select: none !important;
                                user-select: none !important;
                              }
                              /* Block touches on top bar (Title & Share button) */
                              .blocker-top {
                                position: absolute;
                                top: 0;
                                left: 0;
                                width: 100%;
                                height: 60px;
                                z-index: 10;
                                background: rgba(0,0,0,0.01); /* Invisible but intercepts clicks */
                              }
                              /* Block touches on bottom right (YouTube logo / Watch on YouTube) */
                              .blocker-bottom-right {
                                position: absolute;
                                bottom: 0;
                                right: 0;
                                width: 90px;
                                height: 60px;
                                z-index: 10;
                                background: rgba(0,0,0,0.01);
                              }
                            </style>
                          </head>
                          <body oncontextmenu="return false;">
                            <div class="player-container">
                              <iframe
                                src="${activeVideoUrl}"
                                referrerpolicy="strict-origin-when-cross-origin"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowfullscreen
                                oncontextmenu="return false;"
                              ></iframe>
                              <div class="blocker-top"></div>
                              <div class="blocker-bottom-right"></div>
                            </div>
                            <script>
                              window.addEventListener('contextmenu', function(e) { e.preventDefault(); }, true);
                              document.addEventListener('contextmenu', function(e) { e.preventDefault(); }, true);
                              window.addEventListener('copy', function(e) { e.preventDefault(); }, true);
                              window.addEventListener('cut', function(e) { e.preventDefault(); }, true);
                            </script>
                          </body>
                        </html>
                      `,
                      baseUrl: "https://youtube.com",
                    }}
                    style={{ flex: 1 }}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    allowsFullscreenVideo={true}
                    originWhitelist={["*"]}
                    userAgent="Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36"
                    textInteractionEnabled={false}
                    allowsLinkPreview={false}
                    onShouldStartLoadWithRequest={(request) => {
                      if (
                        request.url.includes("youtube.com/watch") ||
                        request.url.includes("youtu.be/") ||
                        request.url.includes("youtube.com/redirect")
                      ) {
                        return false;
                      }
                      return true;
                    }}
                  />
                ) : (
                  <WebView
                    source={{ uri: activeVideoUrl }}
                    style={{ flex: 1 }}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    allowsFullscreenVideo={true}
                    originWhitelist={["*"]}
                    textInteractionEnabled={false}
                    allowsLinkPreview={false}
                    injectedJavaScript={VIDEO_PROTECTION_JS}
                  />
                )
              ) : null}
            </View>
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
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.6)",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  chapterHeaderTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.textLight,
    marginTop: Spacing.half,
  },
  tabsRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  tabButton: {
    flex: 1,
    paddingVertical: Spacing.three,
    alignItems: "center",
  },
  tabButtonActive: {
    borderBottomWidth: 3,
    borderBottomColor: colors.navyPrimary,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  tabButtonTextActive: {
    color: colors.navyPrimary,
    fontWeight: "bold",
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
  countIndicatorText: {
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
  itemCard: {
    flexDirection: "row",
    backgroundColor: colors.background,
    borderRadius: Spacing.two,
    padding: Spacing.four,
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.border,
    ...colors.cardShadow,
  },
  itemDetails: {
    flex: 1,
    paddingRight: Spacing.two,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: Spacing.one,
  },
  itemDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: Spacing.two,
  },
  actionLinkBtn: {
    alignSelf: "flex-start",
    paddingVertical: Spacing.half,
  },
  actionLinkText: {
    fontSize: 13,
    color: colors.accentBlue,
    fontWeight: "700",
  },
  linksRow: {
    flexDirection: "row",
    marginTop: Spacing.one,
  },
  cardActions: {
    justifyContent: "center",
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
    fontSize: 14,
    textAlign: "center",
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
    maxHeight: "90%",
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
  fileSelectContainer: {
    backgroundColor: colors.offWhite,
    borderRadius: Spacing.two,
    padding: Spacing.three,
    marginBottom: Spacing.four,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: "dashed",
    alignItems: "center",
  },
  fileSelectBtn: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.navyPrimary,
    borderRadius: Spacing.one,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    marginBottom: Spacing.two,
  },
  fileSelectBtnText: {
    color: colors.navyPrimary,
    fontSize: 13,
    fontWeight: "bold",
  },
  selectedFilesList: {
    alignSelf: "stretch",
    marginTop: Spacing.one,
  },
  selectedHeading: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: Spacing.one,
  },
  fileNameText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: Spacing.half,
  },
  noFilesSelectedText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: "italic",
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
  videoPlayerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.three,
  },
  videoPlayerContent: {
    backgroundColor: colors.navyPrimary,
    borderRadius: Spacing.two,
    width: "100%",
    maxWidth: 800,
    height: "70%",
    overflow: "hidden",
  },
  videoPlayerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: colors.navySecondary,
  },
  videoPlayerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.textLight,
  },
  videoFrame: {
    flex: 1,
    backgroundColor: "#000000",
  },
});
