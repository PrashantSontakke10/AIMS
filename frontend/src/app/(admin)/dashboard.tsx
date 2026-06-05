import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import api from '../../services/api';
import { Colors, Spacing } from '../../constants/theme';

interface Student {
  _id: string;
  mobile: string;
  status: 'pending' | 'active' | 'blocked';
  role: string;
  assignedCourses: any[];
}

export default function AdminDashboard() {
  const [students, setStudents] = useState<Student[]>([]);
  const [coursesCount, setCoursesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchDashboardData = async () => {
    try {
      const [studentsRes, coursesRes] = await Promise.all([
        api.get('/api/admin/students'),
        api.get('/courses'),
      ]);
      setStudents(studentsRes.data);
      setCoursesCount(coursesRes.data.length);
    } catch (e) {
      console.error('Error fetching dashboard data:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const handleApprove = async (userId: string) => {
    try {
      await api.patch('/api/admin/approve', { userId });
      // Update local state
      setStudents(prev =>
        prev.map(s => (s._id === userId ? { ...s, status: 'active' as const } : s))
      );
    } catch (e) {
      console.error('Error approving student:', e);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.navyPrimary} />
      </View>
    );
  }

  const totalStudents = students.length;
  const pendingStudents = students.filter(s => s.status === 'pending');
  const activeStudents = students.filter(s => s.status === 'active').length;
  const blockedStudents = students.filter(s => s.status === 'blocked').length;

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.welcomeTitle}>Dashboard Overview</Text>
        <Text style={styles.welcomeSubtitle}>Real-time metrics and quick management controls.</Text>
      </View>

      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricEmoji}>📚</Text>
          <Text style={styles.metricLabel}>Total Courses</Text>
          <Text style={styles.metricValue}>{coursesCount}</Text>
        </View>

        <View style={[styles.metricCard, styles.metricCardActive]}>
          <Text style={styles.metricEmoji}>🟢</Text>
          <Text style={styles.metricLabel}>Active Students</Text>
          <Text style={[styles.metricValue, { color: Colors.active }]}>{activeStudents}</Text>
        </View>

        <View style={[styles.metricCard, styles.metricCardPending]}>
          <Text style={styles.metricEmoji}>🟡</Text>
          <Text style={styles.metricLabel}>Awaiting Approval</Text>
          <Text style={[styles.metricValue, { color: Colors.pending }]}>{pendingStudents.length}</Text>
        </View>

        <View style={[styles.metricCard, styles.metricCardBlocked]}>
          <Text style={styles.metricEmoji}>🔴</Text>
          <Text style={styles.metricLabel}>Blocked Students</Text>
          <Text style={[styles.metricValue, { color: Colors.blocked }]}>{blockedStudents}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        <TouchableOpacity
          style={styles.actionTile}
          onPress={() => router.push('/(admin)/students')}
          activeOpacity={0.8}
        >
          <Text style={styles.actionIcon}>👥</Text>
          <Text style={styles.actionLabel}>Manage Students</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionTile}
          onPress={() => router.push('/(admin)/curriculum')}
          activeOpacity={0.8}
        >
          <Text style={styles.actionIcon}>➕</Text>
          <Text style={styles.actionLabel}>Course Builder</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.pendingSection}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Pending Approvals ({pendingStudents.length})</Text>
          <TouchableOpacity onPress={() => router.push('/(admin)/students')}>
            <Text style={styles.viewAllBtnText}>View All</Text>
          </TouchableOpacity>
        </View>

        {pendingStudents.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyCardText}>No student accounts are currently awaiting approval.</Text>
          </View>
        ) : (
          pendingStudents.slice(0, 5).map((student) => (
            <View key={student._id} style={styles.studentRow}>
              <View>
                <Text style={styles.studentMobile}>{student.mobile}</Text>
                <Text style={styles.studentSubtext}>Role: {student.role}</Text>
              </View>
              <TouchableOpacity
                style={styles.approveBtn}
                onPress={() => handleApprove(student._id)}
                activeOpacity={0.7}
              >
                <Text style={styles.approveBtnText}>Approve</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.four,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.offWhite,
  },
  header: {
    marginBottom: Spacing.four,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: Spacing.half,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    marginBottom: Spacing.five,
  },
  metricCard: {
    flex: 1,
    minWidth: 140,
    backgroundColor: Colors.background,
    borderRadius: Spacing.two,
    padding: Spacing.three,
    ...Colors.cardShadow,
  },
  metricCardActive: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.active,
  },
  metricCardPending: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.pending,
  },
  metricCardBlocked: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.blocked,
  },
  metricEmoji: {
    fontSize: 24,
    marginBottom: Spacing.one,
  },
  metricLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: Spacing.half,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Spacing.three,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: Spacing.three,
    marginBottom: Spacing.five,
  },
  actionTile: {
    flex: 1,
    backgroundColor: Colors.navyPrimary,
    borderRadius: Spacing.two,
    padding: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
    ...Colors.cardShadow,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: Spacing.one,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.textLight,
  },
  pendingSection: {
    marginTop: Spacing.two,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  viewAllBtnText: {
    fontSize: 14,
    color: Colors.accentBlue,
    fontWeight: '600',
  },
  emptyCard: {
    backgroundColor: Colors.background,
    borderRadius: Spacing.two,
    padding: Spacing.four,
    alignItems: 'center',
    ...Colors.cardShadow,
  },
  emptyCardText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  studentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.three,
    borderRadius: Spacing.two,
    marginBottom: Spacing.two,
    ...Colors.cardShadow,
  },
  studentMobile: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  studentSubtext: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: Spacing.half,
  },
  approveBtn: {
    backgroundColor: Colors.active,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.one,
  },
  approveBtnText: {
    color: Colors.textLight,
    fontWeight: 'bold',
    fontSize: 13,
  },
});
