import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StatusBar, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import { FileText, ArrowLeft, ShieldAlert } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getNotes } from '../../services/studentApi';
import { Colors, Spacing } from '../../constants/theme';

export default function LecturePlayerScreen() {
  const { lectureId, lectureTitle, videoUrl, chapterId, lectureDesc } = useLocalSearchParams();
  const [notes, setNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const data = await getNotes(chapterId);
        setNotes(data);
      } catch (error) {
        console.error('Error fetching notes:', error);
      } finally {
        setNotesLoading(false);
      }
    };

    if (chapterId) {
      fetchNotes();
    } else {
      setNotesLoading(false);
    }
  }, [chapterId]);

  const handleNotePress = (note) => {
    router.push({
      pathname: '/(student)/note-viewer',
      params: { 
        noteTitle: note.title, 
        googleDriveViewLink: note.fileUrl
      }
    });
  };

  const videoWidth = Dimensions.get('window').width;
  const videoHeight = (videoWidth * 9) / 16; // 16:9 Aspect Ratio

  const getEmbeddableUrl = (url) => {
    if (!url) return "";
    // YouTube link transformation (uses privacy-safe youtube-nocookie embed)
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
    // Google Drive link transformation
    if (url.includes("drive.google.com")) {
      return url.replace("/view", "/preview").replace("/edit", "/preview");
    }
    return url;
  };

  const embedUrl = getEmbeddableUrl(videoUrl);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.navyPrimary} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backBtn}
        >
          <ArrowLeft color={Colors.textLight} size={20} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerSubtitle}>Video Lecture</Text>
          <Text style={styles.headerTitle} numberOfLines={1}>{lectureTitle}</Text>
        </View>
      </View>

      {/* Video Embed Player Window */}
      <View style={[styles.videoContainer, { width: videoWidth, height: videoHeight }]}>
        {embedUrl ? (
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
                        height: 55px;
                        z-index: 10;
                        background: rgba(0,0,0,0.01);
                      }
                      /* Block touches on bottom right (YouTube logo) */
                      .blocker-bottom-right {
                        position: absolute;
                        bottom: 0;
                        right: 0;
                        width: 85px;
                        height: 50px;
                        z-index: 10;
                        background: rgba(0,0,0,0.01);
                      }
                    </style>
                  </head>
                  <body oncontextmenu="return false;">
                    <div class="player-container">
                      <iframe
                        src="${embedUrl}"
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
              baseUrl: 'https://youtube.com',
            }}
            style={{ flex: 1 }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            allowsFullscreenVideo={true}
            originWhitelist={['*']}
            userAgent="Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36"
            textInteractionEnabled={false}
            allowsLinkPreview={false}
            onShouldStartLoadWithRequest={(request) => {
              if (
                request.url.includes('youtube.com/watch') ||
                request.url.includes('youtu.be/') ||
                request.url.includes('youtube.com/redirect')
              ) {
                return false;
              }
              return true;
            }}
          />
        ) : (
          <View style={styles.noVideoContainer}>
            <ShieldAlert color={Colors.textSecondary} size={48} />
            <Text style={styles.noVideoText}>No video source provided</Text>
          </View>
        )}
      </View>

      {/* Lecture Description Box */}
      {lectureDesc ? (
        <View style={styles.descriptionBox}>
          <Text style={styles.descriptionTitle}>About this Lecture</Text>
          <Text style={styles.descriptionText}>{lectureDesc}</Text>
        </View>
      ) : null}

      {/* Study Materials & Notes Section */}
      <View style={styles.materialsSection}>
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionIconContainer}>
            <FileText color={Colors.textLight} size={18} />
          </View>
          <Text style={styles.sectionTitle}>Handouts & Study Notes ({notes.length})</Text>
        </View>

        {notesLoading ? (
          <View style={styles.notesLoadingContainer}>
            <ActivityIndicator size="small" color={Colors.navyPrimary} />
            <Text style={styles.notesLoadingText}>Fetching lecture materials...</Text>
          </View>
        ) : notes.length === 0 ? (
          <View style={styles.emptyNotesCard}>
            <FileText color={Colors.textSecondary} size={40} />
            <Text style={styles.emptyNotesText}>No resources uploaded yet</Text>
            <Text style={styles.emptyNotesSubtitle}>Study materials for this lecture will appear here.</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.notesList}>
            {notes.map((note) => (
              <TouchableOpacity
                key={note._id}
                onPress={() => handleNotePress(note)}
                style={styles.noteItem}
                activeOpacity={0.8}
              >
                <View style={styles.noteIconContainer}>
                  <FileText color={Colors.navyPrimary} size={22} />
                </View>
                <View style={styles.noteDetails}>
                  <Text style={styles.noteTitle} numberOfLines={1}>
                    {note.title}
                  </Text>
                  <Text style={styles.noteSubtitle}>
                    PDF DOCUMENT
                  </Text>
                </View>
                <Text style={styles.openText}>
                  Open →
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.offWhite,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: Colors.navySecondary,
    backgroundColor: Colors.navyPrimary,
  },
  backBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: Spacing.two,
    borderRadius: Spacing.two,
    marginRight: Spacing.three,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerTitle: {
    color: Colors.textLight,
    fontWeight: 'bold',
    fontSize: 18,
  },
  videoContainer: {
    backgroundColor: '#000000',
    position: 'relative',
  },
  noVideoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A202C',
  },
  noVideoText: {
    color: Colors.textSecondary,
    marginTop: Spacing.two,
    fontWeight: '500',
  },
  descriptionBox: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.two,
    padding: Spacing.three,
    marginHorizontal: Spacing.four,
    marginTop: Spacing.four,
    ...Colors.cardShadow,
  },
  descriptionTitle: {
    color: Colors.navyPrimary,
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
  },
  descriptionText: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  materialsSection: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  sectionIconContainer: {
    backgroundColor: Colors.navyPrimary,
    padding: 6,
    borderRadius: 8,
    marginRight: Spacing.two,
  },
  sectionTitle: {
    color: Colors.navyPrimary,
    fontWeight: 'bold',
    fontSize: 18,
  },
  notesLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.five,
  },
  notesLoadingText: {
    color: Colors.textSecondary,
    marginTop: Spacing.two,
    fontSize: 14,
  },
  emptyNotesCard: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.three,
    padding: Spacing.five,
    alignItems: 'center',
    marginTop: Spacing.two,
    ...Colors.cardShadow,
  },
  emptyNotesText: {
    color: Colors.navyPrimary,
    marginTop: Spacing.three,
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyNotesSubtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: Spacing.one,
  },
  notesList: {
    paddingBottom: Spacing.five,
  },
  noteItem: {
    backgroundColor: Colors.background,
    borderRadius: Spacing.two,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.two,
    ...Colors.cardShadow,
  },
  noteIconContainer: {
    backgroundColor: Colors.accentLight,
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.three,
  },
  noteDetails: {
    flex: 1,
    marginRight: Spacing.two,
  },
  noteTitle: {
    color: Colors.navyPrimary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  noteSubtitle: {
    color: Colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
    fontWeight: '600',
  },
  openText: {
    color: Colors.accentBlue,
    fontWeight: 'bold',
    fontSize: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.offWhite,
  },
});
