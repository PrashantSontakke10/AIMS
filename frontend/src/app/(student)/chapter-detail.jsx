import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StatusBar } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronDown, ChevronUp, PlayCircle, BookOpen, ArrowLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getChapters, getLectures } from '../../services/studentApi';
import { Colors, Spacing } from '../../constants/theme';

export default function ChapterDetailScreen() {
  const { courseId, courseTitle } = useLocalSearchParams();
  const [chapters, setChapters] = useState([]);
  const [lecturesByChapter, setLecturesByChapter] = useState({});
  const [expandedChapterId, setExpandedChapterId] = useState(null);
  const [chaptersLoading, setChaptersLoading] = useState(true);
  const [lecturesLoading, setLecturesLoading] = useState({});
  const router = useRouter();

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const data = await getChapters(courseId);
        // Sort chapters by sortOrder
        const sorted = data.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
        setChapters(sorted);
      } catch (error) {
        console.error('Error fetching chapters:', error);
      } finally {
        setChaptersLoading(false);
      }
    };

    if (courseId) {
      fetchChapters();
    }
  }, [courseId]);

  const handleToggleChapter = async (chapterId) => {
    if (expandedChapterId === chapterId) {
      setExpandedChapterId(null);
      return;
    }

    setExpandedChapterId(chapterId);

    // Fetch lectures if they are not already cached/loaded
    if (!lecturesByChapter[chapterId]) {
      setLecturesLoading(prev => ({ ...prev, [chapterId]: true }));
      try {
        const data = await getLectures(chapterId);
        setLecturesByChapter(prev => ({ ...prev, [chapterId]: data }));
      } catch (error) {
        console.error(`Error fetching lectures for chapter ${chapterId}:`, error);
      } finally {
        setLecturesLoading(prev => ({ ...prev, [chapterId]: false }));
      }
    }
  };

  const handleLecturePress = (lecture) => {
    router.push({
      pathname: '/(student)/lecture-player',
      params: { 
        lectureId: lecture._id, 
        lectureTitle: lecture.title,
        lectureDesc: lecture.description || '',
        videoUrl: lecture.videoUrl,
        chapterId: lecture.chapter
      }
    });
  };

  if (chaptersLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.navyPrimary} />
        <Text style={styles.loadingText}>Loading Syllabus...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.navyPrimary} />
      
      {/* Top Header Navigation */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backBtn}
        >
          <ArrowLeft color={Colors.textLight} size={20} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerSubtitle} numberOfLines={1}>{courseTitle}</Text>
          <Text style={styles.headerTitle}>Course Syllabus</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {chapters.length === 0 ? (
          <View style={styles.emptyContainer}>
            <BookOpen color={Colors.textSecondary} size={48} />
            <Text style={styles.emptyText}>Syllabus is empty</Text>
            <Text style={styles.emptySubtext}>No chapters added to this course yet.</Text>
          </View>
        ) : (
          chapters.map((chapter, index) => {
            const isExpanded = expandedChapterId === chapter._id;
            const lectures = lecturesByChapter[chapter._id] || [];
            const isLectLoading = lecturesLoading[chapter._id];

            return (
              <View 
                key={chapter._id} 
                style={styles.chapterCard}
              >
                {/* Accordion Header */}
                <TouchableOpacity
                  onPress={() => handleToggleChapter(chapter._id)}
                  activeOpacity={0.7}
                  style={styles.chapterHeader}
                >
                  <View style={styles.chapterHeaderLeft}>
                    <Text style={styles.chapterNumber}>
                      Chapter {index + 1}
                    </Text>
                    <Text style={styles.chapterTitle}>
                      {chapter.title}
                    </Text>
                    <Text style={styles.chapterSubtext}>
                      {isExpanded 
                        ? (isLectLoading ? 'Loading lectures...' : `${lectures.length} lessons available`) 
                        : (lecturesByChapter[chapter._id] ? `${lecturesByChapter[chapter._id].length} lessons` : 'Tap to view lessons')}
                    </Text>
                  </View>
                  {isExpanded ? (
                    <ChevronUp color={Colors.navyPrimary} size={20} />
                  ) : (
                    <ChevronDown color={Colors.navyPrimary} size={20} />
                  )}
                </TouchableOpacity>

                {/* Accordion Body */}
                {isExpanded && (
                  <View style={styles.lecturesContainer}>
                    {isLectLoading ? (
                      <View style={styles.lecturesLoading}>
                        <ActivityIndicator size="small" color={Colors.navyPrimary} />
                        <Text style={styles.lecturesLoadingText}>Loading lectures...</Text>
                      </View>
                    ) : lectures.length === 0 ? (
                      <View style={styles.emptyLectures}>
                        <Text style={styles.emptyLecturesText}>No lectures in this chapter.</Text>
                      </View>
                    ) : (
                      lectures.map((lecture) => (
                        <TouchableOpacity
                          key={lecture._id}
                          onPress={() => handleLecturePress(lecture)}
                          style={styles.lectureRow}
                        >
                          <PlayCircle color={Colors.navyPrimary} size={22} style={styles.playIcon} />
                          <View style={styles.lectureInfo}>
                            <Text style={styles.lectureTitle}>
                              {lecture.title}
                            </Text>
                            {lecture.description ? (
                              <Text style={styles.lectureDesc} numberOfLines={1}>
                                {lecture.description}
                              </Text>
                            ) : null}
                          </View>
                          <Text style={styles.watchText}>Watch →</Text>
                        </TouchableOpacity>
                      ))
                    )}
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.offWhite,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.offWhite,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.navyPrimary,
    marginTop: Spacing.three,
    fontWeight: '600',
    fontSize: 16,
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
  scrollContainer: {
    padding: Spacing.four,
    paddingBottom: Spacing.five,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 64,
  },
  emptyText: {
    color: Colors.textSecondary,
    marginTop: Spacing.three,
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptySubtext: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: Spacing.half,
  },
  chapterCard: {
    backgroundColor: Colors.background,
    borderRadius: Spacing.three,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.three,
    overflow: 'hidden',
    ...Colors.cardShadow,
  },
  chapterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.four,
  },
  chapterHeaderLeft: {
    flex: 1,
    marginRight: Spacing.three,
  },
  chapterNumber: {
    color: Colors.accentBlue,
    fontWeight: 'bold',
    fontSize: 12,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  chapterTitle: {
    color: Colors.navyPrimary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  chapterSubtext: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  lecturesContainer: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.offWhite,
    padding: Spacing.two,
  },
  lecturesLoading: {
    paddingVertical: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lecturesLoadingText: {
    color: Colors.textSecondary,
    marginTop: Spacing.two,
    fontSize: 12,
  },
  emptyLectures: {
    paddingVertical: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyLecturesText: {
    color: Colors.textSecondary,
    fontStyle: 'italic',
    fontSize: 14,
  },
  lectureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: Spacing.two,
    backgroundColor: Colors.background,
    marginBottom: Spacing.two,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  playIcon: {
    marginRight: Spacing.three,
  },
  lectureInfo: {
    flex: 1,
    marginRight: Spacing.two,
  },
  lectureTitle: {
    color: Colors.text,
    fontWeight: '600',
    fontSize: 14,
  },
  lectureDesc: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  watchText: {
    color: Colors.accentBlue,
    fontSize: 13,
    fontWeight: 'bold',
  },
});
