import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Image, TextInput, ActivityIndicator, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Search, BookOpen } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCourses } from '../../services/studentApi';
import { Spacing } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useAppTheme } from '../../context/ThemeContext';

export default function CourseCatalogScreen() {
  const { user } = useAuth();
  const { colors } = useAppTheme();
  const styles = getStyles(colors);
  
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchCoursesData = async () => {
    try {
      const data = await getCourses();
      setCourses(data || []);
      setFilteredCourses(data || []);
      
      const uniqueSubjects = ['All', ...new Set((data || []).map(c => c.subject).filter(Boolean))];
      setSubjects(uniqueSubjects);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCoursesData();
  }, []);

  useEffect(() => {
    let result = courses;

    if (selectedSubject !== 'All') {
      result = result.filter(c => c.subject === selectedSubject);
    }

    if (searchQuery.trim()) {
      result = result.filter(c => 
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredCourses(result);
  }, [searchQuery, selectedSubject, courses]);

  const handleCoursePress = (course) => {
    router.push({
      pathname: '/(student)/chapter-detail',
      params: { courseId: course._id, courseTitle: course.title }
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.navyPrimary} />
        <Text style={styles.loadingText}>Loading Courses...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={colors.isDark ? "light-content" : "dark-content"} backgroundColor={colors.offWhite} />
      <View style={styles.headerContainer}>
        {/* Header Title */}
        <View style={styles.headerRow}>
          <Image
            source={require("../../../assets/images/logo.jpg")}
            style={styles.headerLogo}
            resizeMode="cover"
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Welcome Back!</Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {user?.name ? `${user.name} (${user.mobile})` : (user?.mobile ? `Logged in: ${user.mobile}` : "Select a course to start learning")}
            </Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Search color={colors.textSecondary} size={20} />
          <TextInput
            placeholder="Search courses..."
            placeholderTextColor={colors.textSecondary}
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.trim() ? (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchBtn}>
              <Text style={styles.clearSearchText}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Subject Filter Chips */}
        {subjects.length > 1 && (
          <FlatList
            data={subjects}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterChipsList}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => setSelectedSubject(item)}
                style={[
                  styles.filterChip,
                  selectedSubject === item ? styles.filterChipActive : null
                ]}
              >
                <Text 
                  style={[
                    styles.filterChipText,
                    selectedSubject === item ? styles.filterChipTextActive : null
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>

      {/* Courses List */}
      <FlatList
        data={filteredCourses}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.coursesList}
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true);
          fetchCoursesData();
        }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleCoursePress(item)}
            style={styles.courseCard}
            activeOpacity={0.8}
          >
            {/* Thumbnail */}
            <View style={styles.thumbnailContainer}>
              {item.thumbnailUrl ? (
                <Image 
                  source={{ uri: item.thumbnailUrl }} 
                  style={styles.thumbnail}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.thumbnailPlaceholder}>
                  <BookOpen color={colors.border} size={60} />
                </View>
              )}
              {/* Subject Badge */}
              {item.subject && (
                <View style={styles.badgeContainer}>
                  <Text style={styles.badgeText}>{item.subject.toUpperCase()}</Text>
                </View>
              )}
            </View>

            {/* Course Info */}
            <View style={styles.courseInfo}>
              <Text style={styles.courseTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.courseDescription} numberOfLines={2}>
                {item.description || 'No course description available.'}
              </Text>
              
              <View style={styles.courseFooter}>
                <Text style={styles.badgePremium}>AIM Institute</Text>
                <Text style={styles.startLearningText}>Start Learning →</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <BookOpen color={colors.textSecondary} size={48} />
            <Text style={styles.emptyTitle}>No courses found</Text>
            <Text style={styles.emptySubtitle}>Try resetting your subject filter or search query</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.offWhite,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.offWhite,
  },
  loadingText: {
    color: colors.navyPrimary,
    marginTop: Spacing.three,
    fontWeight: '600',
    fontSize: 16,
  },
  headerContainer: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.two,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
  headerLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: Spacing.three,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: Spacing.three,
    ...colors.cardShadow,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    marginLeft: Spacing.two,
    padding: 0,
  },
  clearSearchBtn: {
    padding: Spacing.one,
  },
  clearSearchText: {
    color: colors.textSecondary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  filterChipsList: {
    paddingBottom: Spacing.two,
  },
  filterChip: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.one,
    borderRadius: 20,
    marginRight: Spacing.two,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.navyPrimary,
    borderColor: colors.navyPrimary,
  },
  filterChipText: {
    fontWeight: '600',
    fontSize: 14,
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.textLight,
  },
  coursesList: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.four,
  },
  courseCard: {
    backgroundColor: colors.background,
    borderRadius: Spacing.three,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: Spacing.four,
    ...colors.cardShadow,
  },
  thumbnailContainer: {
    height: 176,
    width: '100%',
    backgroundColor: colors.offWhite,
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentLight,
  },
  badgeContainer: {
    position: 'absolute',
    top: Spacing.three,
    left: Spacing.three,
    backgroundColor: 'rgba(11, 25, 44, 0.85)',
    paddingHorizontal: Spacing.three,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.navySecondary,
  },
  badgeText: {
    color: colors.textLight,
    fontWeight: 'bold',
    fontSize: 10,
    letterSpacing: 1,
  },
  courseInfo: {
    padding: Spacing.four,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 6,
  },
  courseDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  courseFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.four,
    paddingTop: Spacing.three,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  badgePremium: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.accentBlue,
    letterSpacing: 0.5,
  },
  startLearningText: {
    color: colors.accentBlue,
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyContainer: {
    marginTop: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: Spacing.three,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: Spacing.one,
    textAlign: 'center',
  },
});
