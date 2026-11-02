import {
  User,
  StudentProfile,
  TeacherProfile,
  Course,
  SpeakingClubSession,
  SpeakingPracticeSubmission,
  Assignment,
  VocabularyItem,
  LessonBooking,
  Conversation,
  ChatMessage,
  UserFile,
  AuditLogEntry,
  TeacherApplication,
  UserRole,
  AcademyVoice,
  CourseSession,
  AcademyStats,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_STUDENT_PROFILE,
  INITIAL_TEACHERS,
  INITIAL_COURSES,
  INITIAL_COURSE_SESSIONS,
  INITIAL_SPEAKING_CLUBS,
  INITIAL_SPEAKING_SUBMISSIONS,
  INITIAL_ASSIGNMENTS,
  INITIAL_VOCABULARY,
  INITIAL_LESSON_BOOKINGS,
  INITIAL_CONVERSATIONS,
  INITIAL_MESSAGES,
  INITIAL_FILES,
  INITIAL_AUDIT_LOGS,
  INITIAL_TEACHER_APPLICATIONS,
  INITIAL_ACADEMY_VOICES,
  INITIAL_ACADEMY_STATS,
} from './mockData';

const STORAGE_KEYS = {
  USERS: 'fluentia_users',
  CURRENT_USER: 'fluentia_current_user',
  STUDENT_PROFILE: 'fluentia_student_profile',
  STUDENT_PROFILES_MAP: 'fluentia_student_profiles_map',
  COURSE_SESSIONS: 'fluentia_course_sessions',
  TEACHERS: 'fluentia_teachers',
  COURSES: 'fluentia_courses',
  CLUBS: 'fluentia_clubs',
  SPEAKING_SUBMISSIONS: 'fluentia_speaking_submissions',
  ASSIGNMENTS: 'fluentia_assignments',
  VOCABULARY: 'fluentia_vocabulary',
  LESSONS: 'fluentia_lessons',
  CONVERSATIONS: 'fluentia_conversations',
  MESSAGES: 'fluentia_messages',
  FILES: 'fluentia_files',
  AUDIT_LOGS: 'fluentia_audit_logs',
  TEACHER_APPLICATIONS: 'fluentia_teacher_applications',
  OWNER_RATE_LIMIT: 'fluentia_owner_rate_limit',
  ACADEMY_VOICES: 'fluentia_academy_voices',
  ACADEMY_SETTINGS: 'fluentia_academy_settings',
  ACADEMY_STATS: 'fluentia_academy_stats',
};

// Memory fallback if localStorage is blocked in sandboxed iframe
const memoryFallback = new Map<string, string>();

// Safe storage helper with memory fallback
function getStored<T>(key: string, defaultValue: T): T {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const item = localStorage.getItem(key);
      if (!item) {
        try {
          localStorage.setItem(key, JSON.stringify(defaultValue));
        } catch {
          memoryFallback.set(key, JSON.stringify(defaultValue));
        }
        return defaultValue;
      }
      return JSON.parse(item) as T;
    }
  } catch {
    // If localStorage access throws in restricted iframe
    const memItem = memoryFallback.get(key);
    if (memItem) {
      try {
        return JSON.parse(memItem) as T;
      } catch {
        return defaultValue;
      }
    }
    memoryFallback.set(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  return defaultValue;
}

function setStored<T>(key: string, value: T): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(key, JSON.stringify(value));
      return;
    }
  } catch {
    // Fall back to memory map
  }
  memoryFallback.set(key, JSON.stringify(value));
}

export class AcademyStore {
  // Current user / Session
  static getCurrentUser(): User | null {
    return getStored<User | null>(STORAGE_KEYS.CURRENT_USER, null);
  }

  static setCurrentUser(user: User | null): void {
    setStored(STORAGE_KEYS.CURRENT_USER, user);
  }

  static logout(): void {
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      this.addAuditLog({
        action: 'USER_LOGOUT',
        performedBy: `${currentUser.fullName} (${currentUser.role})`,
        userRole: currentUser.role,
        targetEntity: currentUser.email,
        details: 'User logged out of active session.',
      });
    }
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }

  // Users
  static getUsers(): User[] {
    return getStored<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  }

  static getUserById(id: string): User | undefined {
    return this.getUsers().find((u) => u.id === id);
  }

  // Teacher Profiles
  static getTeachers(): TeacherProfile[] {
    const list = getStored<TeacherProfile[]>(STORAGE_KEYS.TEACHERS, INITIAL_TEACHERS);
    return list.map((tea) => {
      let updated = false;
      const cleanQuals = (tea.qualifications || []).map((q) => {
        if (/celta|cambridge|delta/i.test(q)) {
          updated = true;
          return q
            .replace(/Cambridge CELTA Pass A/gi, '12+ Years English Mentorship Experience')
            .replace(/Delta Module 1 & 2/gi, 'Conversational Fluency Coaching')
            .replace(/Cambridge DELTA \(Full Award\)/gi, '9+ Years International Teaching Experience')
            .replace(/Cambridge CELTA/gi, '5+ Years Teaching Experience')
            .replace(/Cambridge DELTA/gi, 'Advanced Fluency Mentorship');
        }
        return q;
      });
      let title = tea.title;
      if (/celta|delta|oxford|cambridge/i.test(title)) {
        updated = true;
        title = title
          .replace(/Oxford DELTA Certified Master Trainer & British English Specialist/gi, 'English Speaking Mentor & Conversational Fluency Specialist')
          .replace(/Senior Academic Lead & Bilingual Phonology Specialist/gi, 'Senior English Speaking Mentor & Phonology Coach');
      }
      return updated ? { ...tea, title, qualifications: cleanQuals } : tea;
    });
  }

  static getTeacherByUserId(userId: string): TeacherProfile | undefined {
    return this.getTeachers().find((t) => t.userId === userId);
  }

  static saveTeacher(teacher: TeacherProfile): void {
    const teachers = this.getTeachers();
    const idx = teachers.findIndex((t) => t.id === teacher.id || t.userId === teacher.userId);
    if (idx >= 0) {
      teachers[idx] = teacher;
    } else {
      teachers.unshift(teacher);
    }
    setStored(STORAGE_KEYS.TEACHERS, teachers);

    this.addAuditLog({
      action: idx >= 0 ? 'TEACHER_UPDATED' : 'TEACHER_CREATED',
      performedBy: 'Basmala Ahmed (Owner)',
      userRole: 'owner',
      targetEntity: `Faculty Profile: ${teacher.name}`,
      details: `Rate: ${teacher.hourlyRateEgp} EGP, Approved: ${teacher.isApproved}, Rating: ${teacher.rating}`,
    });
  }

  static deleteTeacher(teacherId: string): void {
    const teachers = this.getTeachers();
    const toDelete = teachers.find((t) => t.id === teacherId);
    const updated = teachers.filter((t) => t.id !== teacherId);
    setStored(STORAGE_KEYS.TEACHERS, updated);

    if (toDelete) {
      this.addAuditLog({
        action: 'TEACHER_DELETED',
        performedBy: 'Basmala Ahmed (Owner)',
        userRole: 'owner',
        targetEntity: `Faculty: ${toDelete.name}`,
        details: `Deleted teacher profile ID: ${teacherId}`,
      });
    }
  }

  // Student Profiles Map (Indexed by User ID)
  static getStudentProfilesMap(): Record<string, StudentProfile> {
    return getStored<Record<string, StudentProfile>>(STORAGE_KEYS.STUDENT_PROFILES_MAP, {
      usr_stu_nour: INITIAL_STUDENT_PROFILE,
    });
  }

  static getStudentProfile(userId?: string): StudentProfile {
    const targetUserId =
      userId ||
      (this.getCurrentUser()?.role === 'student' ? this.getCurrentUser()?.id : 'usr_stu_nour') ||
      'usr_stu_nour';

    const map = this.getStudentProfilesMap();
    if (map[targetUserId]) {
      return map[targetUserId];
    }

    // If Nour, initialize with her demo curriculum
    if (targetUserId === 'usr_stu_nour') {
      map[targetUserId] = INITIAL_STUDENT_PROFILE;
      setStored(STORAGE_KEYS.STUDENT_PROFILES_MAP, map);
      return INITIAL_STUDENT_PROFILE;
    }

    // BRAND NEW STUDENT: Pristine zero statistics & zero enrolled courses
    const newStudentProfile: StudentProfile = {
      id: `prof_stu_${targetUserId}`,
      userId: targetUserId,
      estimatedLevel: 'A1',
      goals: [],
      preferredFormat: 'one-on-one',
      enrolledCourseIds: [], // Zero courses until Owner grants access
      assignedTeacherId: undefined,
      totalSessions: 0,
      attendedSessions: 0,
      grammarScore: 0,
      vocabularyScore: 0,
      fluencyScore: 0,
      pronunciationScore: 0,
      confidenceScore: 0,
      learningNotes: 'New student account. Awaiting course enrollment from Academy Director.',
    };

    map[targetUserId] = newStudentProfile;
    setStored(STORAGE_KEYS.STUDENT_PROFILES_MAP, map);
    return newStudentProfile;
  }

  static updateStudentProfile(profile: Partial<StudentProfile>, userId?: string): StudentProfile {
    const targetUserId =
      userId ||
      profile.userId ||
      (this.getCurrentUser()?.role === 'student' ? this.getCurrentUser()?.id : 'usr_stu_nour') ||
      'usr_stu_nour';

    const map = this.getStudentProfilesMap();
    const current = map[targetUserId] || this.getStudentProfile(targetUserId);
    const updated = { ...current, ...profile, userId: targetUserId };
    map[targetUserId] = updated;
    setStored(STORAGE_KEYS.STUDENT_PROFILES_MAP, map);

    // Also update legacy single profile key for backwards compatibility
    if (targetUserId === 'usr_stu_nour') {
      setStored(STORAGE_KEYS.STUDENT_PROFILE, updated);
    }

    return updated;
  }

  // Owner Mode: Grant Course Access (e.g. Paid via WhatsApp / Offline)
  static enrollStudentInCourse(
    studentUserId: string,
    courseId: string,
    assignedTeacherId: string = 'usr_tea_amina',
    paymentNote?: string
  ): StudentProfile {
    const studentUser = this.getUserById(studentUserId);
    const course = this.getCourseById(courseId);
    const teacherUser = this.getUserById(assignedTeacherId);
    const profile = this.getStudentProfile(studentUserId);

    const enrolledSet = new Set(profile.enrolledCourseIds);
    enrolledSet.add(courseId);

    // Each course cohort adds 8 sessions if previously 0
    const newTotalSessions = (profile.totalSessions && profile.totalSessions > 0)
      ? profile.totalSessions + 8
      : 8;

    const updatedProfile = this.updateStudentProfile(
      {
        enrolledCourseIds: Array.from(enrolledSet),
        assignedTeacherId,
        totalSessions: newTotalSessions,
        attendedSessions: profile.attendedSessions || 0,
        learningNotes: `Enrolled in ${course?.title || courseId}. ${
          paymentNote ? `Payment note: ${paymentNote}.` : ''
        }`,
      },
      studentUserId
    );

    // Ensure conversation exists between student and teacher for 1-on-1 direct chat
    if (studentUser && teacherUser) {
      const convs = this.getConversations();
      const existingConv = convs.find(
        (c) =>
          (c.studentId === studentUserId && c.teacherId === assignedTeacherId) ||
          (c.studentId === assignedTeacherId && c.teacherId === studentUserId)
      );

      if (!existingConv) {
        const newConv: Conversation = {
          id: `conv_${studentUserId}_${assignedTeacherId}`,
          studentId: studentUserId,
          studentName: studentUser.fullName,
          studentAvatar: studentUser.avatarUrl,
          teacherId: assignedTeacherId,
          teacherName: teacherUser.fullName,
          teacherAvatar: teacherUser.avatarUrl,
          lastMessageSnippet: `Welcome to ${course?.title || 'your course'}! I am your mentor.`,
          lastMessageAt: new Date().toISOString(),
          unreadCountStudent: 1,
          unreadCountTeacher: 0,
        };
        convs.unshift(newConv);
        setStored(STORAGE_KEYS.CONVERSATIONS, convs);

        // Add welcome message
        this.sendMessage({
          id: `msg_welcome_${Date.now()}`,
          conversationId: newConv.id,
          senderId: assignedTeacherId,
          senderName: teacherUser.fullName,
          senderRole: 'teacher',
          content: `Hello ${studentUser.fullName}! Welcome to ${course?.title || 'Fluentia Academy'}. I am your faculty mentor. Feel free to ask any questions about your 8 course sessions or assignments right here!`,
          timestamp: new Date().toISOString(),
          read: false,
        });
      }
    }

    // Create an initial starter assignment for this course if not already assigned
    const assignments = this.getAssignments();
    const existingAsg = assignments.find(
      (a) => a.studentId === studentUserId && a.courseId === courseId
    );
    if (!existingAsg && course) {
      assignments.unshift({
        id: `asg_${courseId}_${Date.now()}`,
        title: `${course.title} — Session 1 Introductory Task`,
        instructions: `Welcome to ${course.title}! Please watch Session 1 recorded lecture, review the slides, and record a 60-second audio introduction sharing your professional goals.`,
        courseId,
        courseName: course.title,
        teacherId: assignedTeacherId,
        studentId: studentUserId,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        status: 'assigned',
      });
      setStored(STORAGE_KEYS.ASSIGNMENTS, assignments);
    }

    this.addAuditLog({
      action: 'STUDENT_COURSE_ENROLLED_BY_OWNER',
      performedBy: 'Basmala Ahmed (Owner)',
      userRole: 'owner',
      targetEntity: `Student: ${studentUser?.fullName || studentUserId} -> Course: ${
        course?.title || courseId
      }`,
      details: `Granted full access to curriculum, recorded sessions, assignments, and faculty chat. Note: ${
        paymentNote || 'Verified offline/WhatsApp payment'
      }.`,
    });

    return updatedProfile;
  }

  // Owner Mode: Remove Course Access
  static unenrollStudentFromCourse(studentUserId: string, courseId: string): StudentProfile {
    const studentUser = this.getUserById(studentUserId);
    const course = this.getCourseById(courseId);
    const profile = this.getStudentProfile(studentUserId);

    const updatedCourses = profile.enrolledCourseIds.filter((id) => id !== courseId);
    const updatedProfile = this.updateStudentProfile(
      { enrolledCourseIds: updatedCourses },
      studentUserId
    );

    this.addAuditLog({
      action: 'STUDENT_COURSE_UNENROLLED_BY_OWNER',
      performedBy: 'Basmala Ahmed (Owner)',
      userRole: 'owner',
      targetEntity: `Student: ${studentUser?.fullName || studentUserId} -> Course: ${
        course?.title || courseId
      }`,
      details: `Revoked access to course ${courseId}.`,
    });

    return updatedProfile;
  }

  // Course Sessions & Recorded Lectures
  static getCourseSessions(courseId?: string): CourseSession[] {
    const sessions = getStored<CourseSession[]>(
      STORAGE_KEYS.COURSE_SESSIONS,
      INITIAL_COURSE_SESSIONS
    );
    if (courseId) {
      const filtered = sessions.filter((s) => s.courseId === courseId);
      // If course has no specific stored sessions, generate 8 default sessions dynamically
      if (filtered.length === 0) {
        const course = this.getCourseById(courseId);
        const generated: CourseSession[] = Array.from({ length: 8 }).map((_, i) => ({
          id: `sess_${courseId}_${i + 1}`,
          courseId,
          sessionNumber: i + 1,
          title: `Session ${i + 1}: ${course?.title || 'Core'} Interactive Module`,
          topic: `Focused communicative drills, pronunciation accuracy, and task-based scenario ${i + 1}.`,
          durationMinutes: 60,
          scheduledTime: `Week ${i + 1} · Live & Recorded`,
          recordedVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          slidesUrl: `/assets/docs/${courseId}-session-${i + 1}.pdf`,
          summaryNotes: `Key linguistic competencies and vocabulary for Module ${i + 1}.`,
          teacherId: 'usr_tea_amina',
          teacherName: 'Dr. Amina El-Sayed',
          assignedTask: `Complete the speaking task for Module ${i + 1} and submit audio recording.`,
          isCompleted: i === 0,
        }));
        return generated;
      }
      return filtered;
    }
    return sessions;
  }

  static saveCourseSession(session: CourseSession): void {
    const sessions = this.getCourseSessions();
    const idx = sessions.findIndex((s) => s.id === session.id);
    if (idx >= 0) {
      sessions[idx] = session;
    } else {
      sessions.push(session);
    }
    setStored(STORAGE_KEYS.COURSE_SESSIONS, sessions);

    this.addAuditLog({
      action: idx >= 0 ? 'COURSE_SESSION_UPDATED' : 'COURSE_SESSION_CREATED',
      performedBy: 'Faculty / Owner',
      userRole: 'teacher',
      targetEntity: `Session: ${session.title} (${session.courseId})`,
      details: `Recorded Video URL updated: ${session.recordedVideoUrl || 'N/A'}.`,
    });
  }

  // Courses
  static getCourses(): Course[] {
    return getStored<Course[]>(STORAGE_KEYS.COURSES, INITIAL_COURSES);
  }

  static getCourseById(id: string): Course | undefined {
    return this.getCourses().find((c) => c.id === id);
  }

  static saveCourse(course: Course): void {
    const courses = this.getCourses();
    const idx = courses.findIndex((c) => c.id === course.id);
    if (idx >= 0) {
      courses[idx] = course;
    } else {
      courses.unshift(course);
    }
    setStored(STORAGE_KEYS.COURSES, courses);

    this.addAuditLog({
      action: idx >= 0 ? 'COURSE_UPDATED' : 'COURSE_CREATED',
      performedBy: 'Academy Administration',
      userRole: 'owner',
      targetEntity: `Course: ${course.title} (${course.code})`,
      details: `Status: ${course.status}, Price: ${course.priceEgp} EGP / ${course.priceUsd} USD`,
    });
  }

  static deleteCourse(courseId: string): void {
    const courses = this.getCourses();
    const toDelete = courses.find((c) => c.id === courseId);
    const updated = courses.filter((c) => c.id !== courseId);
    setStored(STORAGE_KEYS.COURSES, updated);

    if (toDelete) {
      this.addAuditLog({
        action: 'COURSE_DELETED',
        performedBy: 'Basmala Ahmed (Owner)',
        userRole: 'owner',
        targetEntity: `Course: ${toDelete.title}`,
        details: `Deleted course ID: ${courseId}`,
      });
    }
  }

  // Enroll student into course
  static enrollInCourse(courseId: string, studentId: string): boolean {
    const courses = this.getCourses();
    const course = courses.find((c) => c.id === courseId);
    if (!course) return false;

    course.enrolledCount += 1;
    setStored(STORAGE_KEYS.COURSES, courses);

    const profile = this.getStudentProfile();
    if (!profile.enrolledCourseIds.includes(courseId)) {
      profile.enrolledCourseIds.push(courseId);
      setStored(STORAGE_KEYS.STUDENT_PROFILE, profile);
    }

    this.addAuditLog({
      action: 'COURSE_ENROLLMENT',
      performedBy: 'Student Portal',
      userRole: 'student',
      targetEntity: `Course: ${course.title}`,
      details: `Student ID: ${studentId} enrolled in ${course.title}`,
    });

    return true;
  }

  // Speaking Club
  static getSpeakingClubs(): SpeakingClubSession[] {
    return getStored<SpeakingClubSession[]>(STORAGE_KEYS.CLUBS, INITIAL_SPEAKING_CLUBS);
  }

  static saveSpeakingClub(club: SpeakingClubSession): void {
    const list = this.getSpeakingClubs();
    const idx = list.findIndex((c) => c.id === club.id);
    if (idx >= 0) {
      list[idx] = club;
    } else {
      list.unshift(club);
    }
    setStored(STORAGE_KEYS.CLUBS, list);

    this.addAuditLog({
      action: idx >= 0 ? 'SPEAKING_CLUB_UPDATED' : 'SPEAKING_CLUB_CREATED',
      performedBy: 'Basmala Ahmed (Owner)',
      userRole: 'owner',
      targetEntity: `Speaking Club: ${club.title}`,
      details: `Level: ${club.levelRange}, Date: ${club.date} ${club.time}, Host: ${club.hostTeacherName}`,
    });
  }

  static deleteSpeakingClub(clubId: string): void {
    const list = this.getSpeakingClubs();
    const target = list.find((c) => c.id === clubId);
    const updated = list.filter((c) => c.id !== clubId);
    setStored(STORAGE_KEYS.CLUBS, updated);

    this.addAuditLog({
      action: 'SPEAKING_CLUB_DELETED',
      performedBy: 'Basmala Ahmed (Owner)',
      userRole: 'owner',
      targetEntity: `Speaking Club ID: ${clubId} (${target?.title || 'Unknown'})`,
      details: 'Speaking club session removed from academy catalog.',
    });
  }

  static registerForSpeakingClub(clubId: string, studentId: string): { success: boolean; message: string } {
    const clubs = this.getSpeakingClubs();
    const club = clubs.find((c) => c.id === clubId);
    if (!club) return { success: false, message: 'Session not found.' };

    if (!club.registeredStudentIds) club.registeredStudentIds = [];
    if (!club.confirmedStudentIds) club.confirmedStudentIds = [];

    if (club.registeredStudentIds.includes(studentId)) {
      return { success: false, message: 'You have already requested a seat for this session.' };
    }

    if (club.registeredStudentIds.length >= club.maxParticipants) {
      return { success: false, message: 'This session has reached full capacity.' };
    }

    club.registeredStudentIds.push(studentId);
    setStored(STORAGE_KEYS.CLUBS, clubs);

    this.addAuditLog({
      action: 'SPEAKING_CLUB_REGISTRATION',
      performedBy: 'Student Portal',
      userRole: 'student',
      targetEntity: `Speaking Club: ${club.title}`,
      details: `Student registered. Total attendees now: ${club.registeredStudentIds.length}/${club.maxParticipants}`,
    });

    return { success: true, message: 'Seat request sent! Your confirmation is pending Academy Director verification.' };
  }

  static confirmSpeakingClubSeat(clubId: string, studentId: string): { success: boolean; message: string } {
    const clubs = this.getSpeakingClubs();
    const club = clubs.find((c) => c.id === clubId);
    if (!club) return { success: false, message: 'Session not found.' };

    if (!club.confirmedStudentIds) club.confirmedStudentIds = [];
    if (!club.registeredStudentIds) club.registeredStudentIds = [];

    if (!club.registeredStudentIds.includes(studentId)) {
      club.registeredStudentIds.push(studentId);
    }
    if (!club.confirmedStudentIds.includes(studentId)) {
      club.confirmedStudentIds.push(studentId);
    }
    setStored(STORAGE_KEYS.CLUBS, clubs);

    // Update student profile confirmed sessions
    const profile = this.getStudentProfile(studentId);
    const confirmedClubs = new Set(profile.confirmedClubSessionIds || []);
    confirmedClubs.add(clubId);
    this.updateStudentProfile({ confirmedClubSessionIds: Array.from(confirmedClubs) }, studentId);

    const studentUser = this.getUserById(studentId);
    this.addAuditLog({
      action: 'SPEAKING_CLUB_SEAT_CONFIRMED',
      performedBy: 'Basmala Ahmed (Owner)',
      userRole: 'owner',
      targetEntity: `Speaking Club: ${club.title} -> Student: ${studentUser?.fullName || studentId}`,
      details: `Owner confirmed seat for ${studentUser?.fullName || studentId}. Room access unlocked.`,
    });

    return { success: true, message: `Seat confirmed for ${studentUser?.fullName || 'student'}!` };
  }

  static revokeSpeakingClubSeat(clubId: string, studentId: string): { success: boolean; message: string } {
    const clubs = this.getSpeakingClubs();
    const club = clubs.find((c) => c.id === clubId);
    if (!club) return { success: false, message: 'Session not found.' };

    if (club.confirmedStudentIds) {
      club.confirmedStudentIds = club.confirmedStudentIds.filter((id) => id !== studentId);
    }
    setStored(STORAGE_KEYS.CLUBS, clubs);

    // Update student profile
    const profile = this.getStudentProfile(studentId);
    const confirmedClubs = (profile.confirmedClubSessionIds || []).filter((id) => id !== clubId);
    this.updateStudentProfile({ confirmedClubSessionIds: confirmedClubs }, studentId);

    const studentUser = this.getUserById(studentId);
    this.addAuditLog({
      action: 'SPEAKING_CLUB_SEAT_REVOKED',
      performedBy: 'Basmala Ahmed (Owner)',
      userRole: 'owner',
      targetEntity: `Speaking Club: ${club.title} -> Student: ${studentUser?.fullName || studentId}`,
      details: `Owner revoked speaking club seat for ${studentUser?.fullName || studentId}.`,
    });

    return { success: true, message: `Seat access revoked for ${studentUser?.fullName || 'student'}.` };
  }

  // Speaking Practice Submissions
  static getSpeakingSubmissions(): SpeakingPracticeSubmission[] {
    return getStored<SpeakingPracticeSubmission[]>(STORAGE_KEYS.SPEAKING_SUBMISSIONS, INITIAL_SPEAKING_SUBMISSIONS);
  }

  static addSpeakingSubmission(submission: SpeakingPracticeSubmission): void {
    const list = this.getSpeakingSubmissions();
    list.unshift(submission);
    setStored(STORAGE_KEYS.SPEAKING_SUBMISSIONS, list);

    this.addAuditLog({
      action: 'SPEAKING_SUBMISSION_UPLOADED',
      performedBy: submission.studentName,
      userRole: 'student',
      targetEntity: `Prompt: ${submission.promptTitle}`,
      details: `Audio response submitted (${submission.audioDurationSeconds || 0}s). Status: pending_review.`,
    });
  }

  static addSpeakingTeacherFeedback(
    submissionId: string,
    feedback: NonNullable<SpeakingPracticeSubmission['feedback']>
  ): void {
    const list = this.getSpeakingSubmissions();
    const item = list.find((s) => s.id === submissionId);
    if (!item) return;

    item.status = 'reviewed';
    item.feedback = feedback;
    setStored(STORAGE_KEYS.SPEAKING_SUBMISSIONS, list);

    // Update student progress indicators
    const profile = this.getStudentProfile();
    profile.grammarScore = Math.round((profile.grammarScore + feedback.grammarScore) / 2);
    profile.pronunciationScore = Math.round((profile.pronunciationScore + feedback.pronunciationScore) / 2);
    profile.fluencyScore = Math.round((profile.fluencyScore + feedback.fluencyScore) / 2);
    profile.confidenceScore = Math.round((profile.confidenceScore + feedback.confidenceScore) / 2);
    setStored(STORAGE_KEYS.STUDENT_PROFILE, profile);

    this.addAuditLog({
      action: 'SPEAKING_FEEDBACK_PUBLISHED',
      performedBy: feedback.teacherName,
      userRole: 'teacher',
      targetEntity: `Submission: ${item.promptTitle} for ${item.studentName}`,
      details: `Teacher evaluated grammar (${feedback.grammarScore}%), pronunciation (${feedback.pronunciationScore}%), fluency (${feedback.fluencyScore}%).`,
    });
  }

  // Assignments
  static getAssignments(): Assignment[] {
    return getStored<Assignment[]>(STORAGE_KEYS.ASSIGNMENTS, INITIAL_ASSIGNMENTS);
  }

  static saveAssignment(assignment: Assignment): void {
    const list = this.getAssignments();
    const idx = list.findIndex((a) => a.id === assignment.id);
    if (idx >= 0) {
      list[idx] = assignment;
    } else {
      list.unshift(assignment);
    }
    setStored(STORAGE_KEYS.ASSIGNMENTS, list);

    this.addAuditLog({
      action: idx >= 0 ? 'ASSIGNMENT_UPDATED' : 'ASSIGNMENT_CREATED',
      performedBy: 'Teacher Portal',
      userRole: 'teacher',
      targetEntity: `Assignment: ${assignment.title}`,
      details: `Course: ${assignment.courseName}, Due: ${assignment.dueDate}, Status: ${assignment.status}`,
    });
  }

  // Vocabulary
  static getVocabulary(): VocabularyItem[] {
    return getStored<VocabularyItem[]>(STORAGE_KEYS.VOCABULARY, INITIAL_VOCABULARY);
  }

  static addVocabularyItem(item: VocabularyItem): void {
    const list = this.getVocabulary();
    list.unshift(item);
    setStored(STORAGE_KEYS.VOCABULARY, list);
  }

  static toggleVocabularyMastered(id: string): void {
    const list = this.getVocabulary();
    const item = list.find((v) => v.id === id);
    if (item) {
      item.mastered = !item.mastered;
      setStored(STORAGE_KEYS.VOCABULARY, list);
    }
  }

  static deleteVocabularyItem(id: string): void {
    const list = this.getVocabulary().filter((v) => v.id !== id);
    setStored(STORAGE_KEYS.VOCABULARY, list);
  }

  // Lessons
  static getLessons(): LessonBooking[] {
    return getStored<LessonBooking[]>(STORAGE_KEYS.LESSONS, INITIAL_LESSON_BOOKINGS);
  }

  static bookLesson(booking: LessonBooking): void {
    const list = this.getLessons();
    list.unshift(booking);
    setStored(STORAGE_KEYS.LESSONS, list);

    this.addAuditLog({
      action: 'LESSON_BOOKED',
      performedBy: booking.studentName,
      userRole: 'student',
      targetEntity: `Teacher: ${booking.teacherName}`,
      details: `Scheduled for ${booking.date} at ${booking.time} (${booking.durationMinutes} min). Status: ${booking.status}`,
    });
  }

  // Conversations & Messages
  static getConversations(): Conversation[] {
    return getStored<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, INITIAL_CONVERSATIONS);
  }

  static getMessages(conversationId: string): ChatMessage[] {
    const all = getStored<ChatMessage[]>(STORAGE_KEYS.MESSAGES, INITIAL_MESSAGES);
    return all.filter((m) => m.conversationId === conversationId);
  }

  static sendMessage(message: ChatMessage): void {
    const all = getStored<ChatMessage[]>(STORAGE_KEYS.MESSAGES, INITIAL_MESSAGES);
    all.push(message);
    setStored(STORAGE_KEYS.MESSAGES, all);

    // Update conversation last message
    const convs = this.getConversations();
    const conv = convs.find((c) => c.id === message.conversationId);
    if (conv) {
      conv.lastMessageSnippet = message.attachments?.length
        ? `[Attachment: ${message.attachments[0].name}]`
        : message.content;
      conv.lastMessageAt = message.timestamp;
      setStored(STORAGE_KEYS.CONVERSATIONS, convs);
    }
  }

  // Files
  static getFiles(): UserFile[] {
    return getStored<UserFile[]>(STORAGE_KEYS.FILES, INITIAL_FILES);
  }

  static addFile(file: UserFile): void {
    const list = this.getFiles();
    list.unshift(file);
    setStored(STORAGE_KEYS.FILES, list);

    this.addAuditLog({
      action: 'FILE_UPLOADED',
      performedBy: file.ownerName,
      userRole: file.ownerRole,
      targetEntity: `File: ${file.name} (${file.size})`,
      details: `Type: ${file.fileType}, Private: ${file.isPrivate}`,
    });
  }

  static deleteFile(id: string, user: User): boolean {
    const list = this.getFiles();
    const file = list.find((f) => f.id === id);
    if (!file) return false;

    // Authorization: owner can delete any; users only their own
    if (user.role !== 'owner' && file.ownerId !== user.id) {
      return false;
    }

    const updated = list.filter((f) => f.id !== id);
    setStored(STORAGE_KEYS.FILES, updated);

    this.addAuditLog({
      action: 'FILE_DELETED',
      performedBy: `${user.fullName} (${user.role})`,
      userRole: user.role,
      targetEntity: `File: ${file.name}`,
      details: `Deleted file ID: ${id}`,
    });

    return true;
  }

  // Teacher Applications & Approvals
  static getTeacherApplications(): TeacherApplication[] {
    return getStored<TeacherApplication[]>(STORAGE_KEYS.TEACHER_APPLICATIONS, INITIAL_TEACHER_APPLICATIONS);
  }

  static submitTeacherApplication(app: TeacherApplication): void {
    const apps = this.getTeacherApplications();
    apps.unshift(app);
    setStored(STORAGE_KEYS.TEACHER_APPLICATIONS, apps);

    this.addAuditLog({
      action: 'TEACHER_APPLICATION_SUBMITTED',
      performedBy: app.fullName,
      userRole: 'teacher',
      targetEntity: `Teacher Applicant: ${app.fullName} (${app.email})`,
      details: `Specializations: ${app.specializations.join(', ')}. Status: Pending Owner Approval.`,
    });
  }

  static reviewTeacherApplication(appId: string, decision: 'approved' | 'rejected', notes?: string): void {
    const apps = this.getTeacherApplications();
    const app = apps.find((a) => a.id === appId);
    if (!app) return;

    app.status = decision;
    app.reviewNotes = notes;
    setStored(STORAGE_KEYS.TEACHER_APPLICATIONS, apps);

    // Update user status
    const users = this.getUsers();
    const user = users.find((u) => u.id === app.userId || u.email === app.email);
    if (user) {
      user.status = decision === 'approved' ? 'active' : 'suspended';
      setStored(STORAGE_KEYS.USERS, users);
    }

    // Update teacher profile
    const teachers = this.getTeachers();
    const teacher = teachers.find((t) => t.userId === app.userId || t.name === app.fullName);
    if (teacher) {
      teacher.isApproved = decision === 'approved';
      setStored(STORAGE_KEYS.TEACHERS, teachers);
    }

    this.addAuditLog({
      action: decision === 'approved' ? 'TEACHER_APPROVED' : 'TEACHER_REJECTED',
      performedBy: 'Basmala Ahmed (Academy Owner)',
      userRole: 'owner',
      targetEntity: `Teacher: ${app.fullName} (${app.email})`,
      details: `Application marked as ${decision}. ${notes ? `Notes: ${notes}` : ''}`,
    });
  }

  // Audit Logs
  static getAuditLogs(): AuditLogEntry[] {
    return getStored<AuditLogEntry[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  }

  static addAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): void {
    const logs = this.getAuditLogs();
    const newEntry: AuditLogEntry = {
      id: `aud_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      ...entry,
    };
    logs.unshift(newEntry);
    setStored(STORAGE_KEYS.AUDIT_LOGS, logs);
  }

  // Owner Login Rate Limiting & Neutral Error Verification
  static checkOwnerRateLimit(): { allowed: boolean; waitSeconds?: number } {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.OWNER_RATE_LIMIT) || '{}');
      const now = Date.now();
      if (data.lockedUntil && data.lockedUntil > now) {
        return {
          allowed: false,
          waitSeconds: Math.ceil((data.lockedUntil - now) / 1000),
        };
      }
      return { allowed: true };
    } catch {
      return { allowed: true };
    }
  }

  static recordOwnerLoginAttempt(success: boolean): void {
    const now = Date.now();
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.OWNER_RATE_LIMIT) || '{"attempts": 0}');
      if (success) {
        localStorage.removeItem(STORAGE_KEYS.OWNER_RATE_LIMIT);
        this.addAuditLog({
          action: 'OWNER_LOGIN_SUCCESS',
          performedBy: 'Basmala Ahmed (Owner)',
          userRole: 'owner',
          targetEntity: 'Admin Control Center',
          details: 'Owner authenticated successfully via protected key portal.',
        });
      } else {
        const attempts = (data.attempts || 0) + 1;
        let lockedUntil = undefined;
        if (attempts >= 4) {
          lockedUntil = now + 45 * 1000; // 45 seconds lockout
        }
        localStorage.setItem(
          STORAGE_KEYS.OWNER_RATE_LIMIT,
          JSON.stringify({ attempts, lockedUntil, lastAttemptAt: now })
        );

        this.addAuditLog({
          action: 'OWNER_LOGIN_FAILED',
          performedBy: 'Unauthenticated Request',
          userRole: 'guest',
          targetEntity: 'Owner Key Portal',
          details: `Failed credentials attempt (Count: ${attempts}). Rate limiter active.`,
        });
      }
    } catch {
      // ignore
    }
  }

  // Academy Voices / Student Testimonials & Feedback
  static getAcademyVoices(): AcademyVoice[] {
    return getStored<AcademyVoice[]>(STORAGE_KEYS.ACADEMY_VOICES, INITIAL_ACADEMY_VOICES);
  }

  static saveAcademyVoice(voice: AcademyVoice): void {
    const list = this.getAcademyVoices();
    const idx = list.findIndex((v) => v.id === voice.id);
    if (idx >= 0) {
      list[idx] = voice;
    } else {
      list.unshift(voice);
    }
    setStored(STORAGE_KEYS.ACADEMY_VOICES, list);

    this.addAuditLog({
      action: idx >= 0 ? 'ACADEMY_VOICE_UPDATED' : 'ACADEMY_VOICE_CREATED',
      performedBy: 'Basmala Ahmed (Owner)',
      userRole: 'owner',
      targetEntity: `Academy Voice: ${voice.studentName}`,
      details: `Rating: ${voice.rating}★, Role: ${voice.roleOrField}, Featured: ${voice.featured}`,
    });
  }

  static deleteAcademyVoice(voiceId: string): void {
    const list = this.getAcademyVoices();
    const toDelete = list.find((v) => v.id === voiceId);
    const updated = list.filter((v) => v.id !== voiceId);
    setStored(STORAGE_KEYS.ACADEMY_VOICES, updated);

    if (toDelete) {
      this.addAuditLog({
        action: 'ACADEMY_VOICE_DELETED',
        performedBy: 'Basmala Ahmed (Owner)',
        userRole: 'owner',
        targetEntity: `Academy Voice: ${toDelete.studentName}`,
        details: `Deleted testimonial ID: ${voiceId}`,
      });
    }
  }

  // Academy Settings & Contact Customization (Address, Phone, Email, Academic Programs)
  static getAcademySettings(): {
    academyName: string;
    address: string;
    email: string;
    phone: string;
    academicPrograms: string[];
  } {
    const defaultSettings = {
      academyName: 'Fluentia English Academy',
      address: 'Online · New Alamein, Egypt',
      email: 'fluentia.academy.edu@gmail.com',
      phone: '+20 1 20 57 9 3 4 20',
      academicPrograms: [
        'A1 Foundations & Survival English',
        'A2 Elementary Communicative Fluency',
        'B1 Intermediate Fluency & Grammar',
        'B2 Upper-Intermediate Professional English',
        'Executive Business & Interview Pitching',
        'Pronunciation & Egyptian Phonetic Neutralization',
        'Personalized 1-on-1 Mentorship',
        'Weekend Speaking Club Circle',
      ],
    };
    return getStored(STORAGE_KEYS.ACADEMY_SETTINGS, defaultSettings);
  }

  static saveAcademySettings(settings: {
    academyName: string;
    address: string;
    email: string;
    phone: string;
    academicPrograms: string[];
  }): void {
    setStored(STORAGE_KEYS.ACADEMY_SETTINGS, settings);
    this.addAuditLog({
      action: 'ACADEMY_SETTINGS_UPDATED',
      performedBy: 'Basmala Ahmed (Owner)',
      userRole: 'owner',
      targetEntity: 'Academy Settings & Contact Info',
      details: `Address: ${settings.address}, Phone: ${settings.phone}, Email: ${settings.email}`,
    });
  }

  // Academy Statistics (Zero baseline initially, editable & updatable by Owner)
  static getAcademyStats(): AcademyStats {
    return getStored<AcademyStats>(STORAGE_KEYS.ACADEMY_STATS, INITIAL_ACADEMY_STATS);
  }

  static saveAcademyStats(stats: Partial<AcademyStats>): AcademyStats {
    const current = this.getAcademyStats();
    const updated: AcademyStats = {
      ...current,
      ...stats,
      isCustomOverride: true,
    };
    setStored(STORAGE_KEYS.ACADEMY_STATS, updated);
    this.addAuditLog({
      action: 'ACADEMY_STATS_UPDATED',
      performedBy: 'Basmala Ahmed (Owner)',
      userRole: 'owner',
      targetEntity: 'Academy Overview Metrics',
      details: `Active Students: ${updated.activeStudents}, Faculty: ${updated.approvedFaculty}, Enrollments: ${updated.courseEnrollments}, Tuition: ${updated.totalTuitionEgp} EGP`,
    });
    return updated;
  }

  static resetAcademyStats(): AcademyStats {
    const reset: AcademyStats = {
      activeStudents: 0,
      approvedFaculty: 0,
      courseEnrollments: 0,
      studentTestimonials: 0,
      totalTuitionEgp: 0,
      totalTuitionUsd: 0,
      isCustomOverride: true,
    };
    setStored(STORAGE_KEYS.ACADEMY_STATS, reset);
    this.addAuditLog({
      action: 'ACADEMY_STATS_RESET',
      performedBy: 'Basmala Ahmed (Owner)',
      userRole: 'owner',
      targetEntity: 'Academy Overview Metrics',
      details: 'Reset all academy statistics back to zero baseline.',
    });
    return reset;
  }
}

