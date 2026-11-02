export type UserRole = 'student' | 'teacher' | 'owner' | 'guest';
export type AccountStatus = 'active' | 'pending' | 'suspended';
export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  status: AccountStatus;
  avatarUrl?: string;
  phone?: string;
  age?: number | string;
  password?: string;
  createdAt: string;
}

export interface StudentProfile {
  id: string;
  userId: string;
  estimatedLevel: CefrLevel;
  goals: string[];
  preferredFormat: 'one-on-one' | 'group' | 'hybrid' | 'speaking-club';
  enrolledCourseIds: string[];
  confirmedClubSessionIds?: string[];
  assignedTeacherId?: string;
  totalSessions?: number;
  attendedSessions?: number;
  grammarScore: number; // 0 - 100
  vocabularyScore: number; // 0 - 100
  fluencyScore: number; // 0 - 100
  pronunciationScore: number; // 0 - 100
  confidenceScore: number; // 0 - 100
  learningNotes?: string;
}

export interface AcademyStats {
  activeStudents: number;
  approvedFaculty: number;
  courseEnrollments: number;
  studentTestimonials: number;
  totalTuitionEgp: number;
  totalTuitionUsd?: number;
  isCustomOverride?: boolean;
}

export interface TeacherProfile {
  id: string;
  userId: string;
  name: string;
  title: string;
  avatarUrl: string;
  bio: string;
  qualifications: string[];
  experienceYears: number;
  specializations: string[];
  languages: string[];
  proficiency: string;
  preferredLevels: CefrLevel[];
  lessonFormats: string[];
  hourlyRateEgp: number;
  hourlyRateUsd: number;
  rating: number;
  reviewsCount: number;
  isApproved: boolean;
  introVideoUrl?: string;
  availabilitySummary: string;
}

export interface Course {
  id: string;
  title: string;
  code: string;
  level: CefrLevel | 'All Levels';
  audience: string;
  description: string;
  outcomes: string[];
  format: 'Group Class' | '1-on-1 Intensive' | 'Speaking Club' | 'Self-Paced Hybrid';
  durationWeeks: number;
  hoursPerWeek: number;
  priceEgp: number;
  priceUsd: number;
  status: 'published' | 'draft' | 'archived';
  enrolledCount: number;
  coverImage?: string;
}

export interface CourseSession {
  id: string;
  courseId: string;
  sessionNumber: number;
  title: string;
  topic: string;
  durationMinutes: number;
  scheduledTime?: string;
  recordedVideoUrl?: string;
  recordedAudioUrl?: string;
  slidesUrl?: string;
  summaryNotes?: string;
  teacherId?: string;
  teacherName?: string;
  assignedTask?: string;
  isCompleted?: boolean;
}

export interface SpeakingClubSession {
  id: string;
  title: string;
  topic: string;
  description: string;
  levelRange: string;
  format: 'Virtual Round Table' | 'Debate & Fluency' | 'Roleplay Simulation';
  date: string;
  time: string;
  durationMinutes: number;
  maxParticipants: number;
  registeredStudentIds: string[];
  confirmedStudentIds?: string[];
  hostTeacherName: string;
  status: 'scheduled' | 'live' | 'completed';
  meetingUrl?: string;
}

export interface SpeakingPracticeSubmission {
  id: string;
  studentId: string;
  studentName: string;
  promptTitle: string;
  promptDescription: string;
  level: CefrLevel;
  audioUrl?: string;
  audioDurationSeconds?: number;
  writtenResponse?: string;
  status: 'pending_review' | 'reviewed';
  submittedAt: string;
  feedback?: {
    teacherName: string;
    teacherId: string;
    reviewedAt: string;
    writtenComments: string;
    audioFeedbackUrl?: string;
    grammarScore: number;
    pronunciationScore: number;
    fluencyScore: number;
    confidenceScore: number;
  };
}

export interface Assignment {
  id: string;
  title: string;
  instructions: string;
  courseId: string;
  courseName: string;
  teacherId: string;
  studentId: string;
  dueDate: string;
  status: 'assigned' | 'submitted' | 'reviewed';
  attachments?: { name: string; url: string; size: string }[];
  submission?: {
    submittedAt: string;
    textResponse?: string;
    fileUrl?: string;
    fileName?: string;
  };
  feedback?: {
    reviewedAt: string;
    grade: string;
    comment: string;
    audioFeedbackUrl?: string;
  };
}

export interface VocabularyItem {
  id: string;
  studentId: string;
  term: string;
  phonetic?: string;
  partOfSpeech: 'noun' | 'verb' | 'adjective' | 'idiom' | 'phrasal verb';
  definition: string;
  exampleSentence: string;
  personalNotes?: string;
  category: 'Business' | 'Everyday Fluency' | 'Academic' | 'Phrasal Verbs' | 'Idioms';
  mastered: boolean;
  addedAt: string;
}

export interface LessonBooking {
  id: string;
  studentId: string;
  studentName: string;
  teacherId: string;
  teacherName: string;
  courseName?: string;
  date: string;
  time: string;
  durationMinutes: number;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  meetingUrl?: string;
  notes?: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  content: string;
  timestamp: string;
  read: boolean;
  attachments?: {
    name: string;
    type: 'audio' | 'image' | 'doc';
    url: string;
    size: string;
    duration?: number;
  }[];
}

export interface Conversation {
  id: string;
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  teacherId: string;
  teacherName: string;
  teacherAvatar?: string;
  lastMessageSnippet: string;
  lastMessageAt: string;
  unreadCountStudent: number;
  unreadCountTeacher: number;
}

export interface UserFile {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerRole: UserRole;
  name: string;
  fileType: 'audio' | 'video' | 'pdf' | 'doc' | 'image';
  size: string;
  url: string;
  category: 'Worksheet' | 'Audio Recording' | 'Feedback' | 'Certificate' | 'Document';
  uploadedAt: string;
  isPrivate: boolean;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  performedBy: string;
  userRole: string;
  targetEntity: string;
  details: string;
  timestamp: string;
  reason?: string;
}

export interface TeacherApplication {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  bio: string;
  qualifications: string;
  experienceYears: number;
  specializations: string[];
  languages: string;
  proficiency: string;
  preferredLevels: CefrLevel[];
  lessonFormats: string[];
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewNotes?: string;
}

export interface PlacementQuestion {
  id: number;
  section: 'grammar' | 'vocabulary' | 'reading' | 'situational';
  level: CefrLevel;
  question: string;
  context?: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface AcademyVoice {
  id: string;
  studentName: string;
  roleOrField: string;
  location: string;
  quote: string;
  rating: number; // e.g. 5
  avatarUrl?: string;
  audioClipUrl?: string;
  featured: boolean;
  dateAdded?: string;
}
