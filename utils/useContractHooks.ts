"use client";

import { useEffect } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { PROOF_BASE_ABI, PROOF_BASE_ADDRESS } from "./contract";

// =========================
// Types
// =========================

export enum UserRole {
  TUTOR = 0,
  STUDENT = 1,
}

export interface Course {
  courseId: bigint;
  title: string;
  tutor: `0x${string}`;
  tutorName: string;
  isActive: boolean;
}

export interface Exam {
  examId: bigint;
  courseId: bigint;
  title: string;
  questionCount: bigint;
  isActive: boolean;
  creator: `0x${string}`;
}

export interface User {
  name: string;
  role: UserRole;
  isRegistered: boolean;
}

export interface ExamSession {
  examId: bigint;
  student: `0x${string}`;
  score: bigint;
  isCompleted: boolean;
}

export interface ExamResults {
  rawScore: bigint;
  answers: readonly bigint[];
  isCompleted: boolean;
}

export interface ExamScore {
  rawScore: bigint;
  isCompleted: boolean;
}

export interface ExamAnswersComparison {
  correctAnswers: readonly bigint[];
  studentAnswers: readonly bigint[];
  isCorrect: readonly boolean[];
  isCompleted: boolean;
}

export interface ExamReview {
  questionTexts: readonly string[];
  questionOptions: readonly [string, string, string, string][];
  correctAnswers: readonly bigint[];
  studentAnswers: readonly bigint[];
  isCorrect: readonly boolean[];
  totalScore: bigint;
  maxScore: bigint;
}

export type QuestionOptions = [string, string, string, string];

function useAutoRefreshOnConfirm(hash?: `0x${string}`) {
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  useEffect(() => {
    if (isConfirmed) {
      window.location.reload();
    }
  }, [isConfirmed]);

  return { isConfirming, isConfirmed };
}

// =========================
// Basic read hooks
// =========================

export function useCourseCounter() {
  return useReadContract({
    address: PROOF_BASE_ADDRESS,
    abi: PROOF_BASE_ABI,
    functionName: "courseCounter",
  });
}

export function useExamCounter() {
  return useReadContract({
    address: PROOF_BASE_ADDRESS,
    abi: PROOF_BASE_ABI,
    functionName: "examCounter",
  });
}

export function useCourses(courseId: bigint | undefined) {
  return useReadContract({
    address: PROOF_BASE_ADDRESS,
    abi: PROOF_BASE_ABI,
    functionName: "courses",
    args: courseId !== undefined ? [courseId] : undefined,
    query: {
      enabled: courseId !== undefined,
    },
  });
}

export function useExams(examId: bigint | undefined) {
  return useReadContract({
    address: PROOF_BASE_ADDRESS,
    abi: PROOF_BASE_ABI,
    functionName: "exams",
    args: examId !== undefined ? [examId] : undefined,
    query: {
      enabled: examId !== undefined,
    },
  });
}

export function useUsers(userAddress: `0x${string}` | undefined) {
  const result = useReadContract({
    address: PROOF_BASE_ADDRESS,
    abi: PROOF_BASE_ABI,
    functionName: "users",
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
    },
  });

  type UserResponse = readonly [string, number, boolean] | undefined;
  const userResponse = result.data as UserResponse;

  const transformedData: User | undefined = userResponse
    ? {
        name: userResponse[0],
        role: userResponse[1] as UserRole,
        isRegistered: userResponse[2],
      }
    : undefined;

  return {
    ...result,
    data: transformedData,
  };
}

export function useRegisteredUsers(userAddress: `0x${string}` | undefined) {
  return useReadContract({
    address: PROOF_BASE_ADDRESS,
    abi: PROOF_BASE_ABI,
    functionName: "registeredUsers",
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
    },
  });
}

export function useCourseEnrollments(
  courseId: bigint | undefined,
  studentAddress: `0x${string}` | undefined
) {
  return useReadContract({
    address: PROOF_BASE_ADDRESS,
    abi: PROOF_BASE_ABI,
    functionName: "courseEnrollments",
    args:
      courseId !== undefined && studentAddress
        ? [courseId, studentAddress]
        : undefined,
    query: {
      enabled: courseId !== undefined && !!studentAddress,
    },
  });
}

export function useCourseExams(
  courseId: bigint | undefined,
  index: bigint | undefined
) {
  return useReadContract({
    address: PROOF_BASE_ADDRESS,
    abi: PROOF_BASE_ABI,
    functionName: "courseExams",
    args:
      courseId !== undefined && index !== undefined
        ? [courseId, index]
        : undefined,
    query: {
      enabled: courseId !== undefined && index !== undefined,
    },
  });
}

export function useExamCorrectAnswers(
  examId: bigint | undefined,
  questionIndex: bigint | undefined
) {
  return useReadContract({
    address: PROOF_BASE_ADDRESS,
    abi: PROOF_BASE_ABI,
    functionName: "examCorrectAnswers",
    args:
      examId !== undefined && questionIndex !== undefined
        ? [examId, questionIndex]
        : undefined,
    query: {
      enabled: examId !== undefined && questionIndex !== undefined,
    },
  });
}

export function useExamOptions(
  examId: bigint | undefined,
  questionIndex: bigint | undefined,
  optionIndex: bigint | undefined
) {
  return useReadContract({
    address: PROOF_BASE_ADDRESS,
    abi: PROOF_BASE_ABI,
    functionName: "examOptions",
    args:
      examId !== undefined &&
      questionIndex !== undefined &&
      optionIndex !== undefined
        ? [examId, questionIndex, optionIndex]
        : undefined,
    query: {
      enabled:
        examId !== undefined &&
        questionIndex !== undefined &&
        optionIndex !== undefined,
    },
  });
}

export function useExamQuestions(
  examId: bigint | undefined,
  questionIndex: bigint | undefined
) {
  return useReadContract({
    address: PROOF_BASE_ADDRESS,
    abi: PROOF_BASE_ABI,
    functionName: "examQuestions",
    args:
      examId !== undefined && questionIndex !== undefined
        ? [examId, questionIndex]
        : undefined,
    query: {
      enabled: examId !== undefined && questionIndex !== undefined,
    },
  });
}

export function useExamSessions(
  examId: bigint | undefined,
  studentAddress: `0x${string}` | undefined
) {
  const result = useReadContract({
    address: PROOF_BASE_ADDRESS,
    abi: PROOF_BASE_ABI,
    functionName: "examSessions",
    args:
      examId !== undefined && studentAddress
        ? [examId, studentAddress]
        : undefined,
    query: {
      enabled: examId !== undefined && !!studentAddress,
    },
  });

  type SessionResponse =
    | readonly [bigint, `0x${string}`, bigint, boolean]
    | undefined;

  const data = result.data as SessionResponse;

  const transformedData: ExamSession | undefined = data
    ? {
        examId: data[0],
        student: data[1],
        score: data[2],
        isCompleted: data[3],
      }
    : undefined;

  return {
    ...result,
    data: transformedData,
  };
}

// =========================
// High-level read hooks
// =========================

export function useGetAllCourses() {
  const result = useReadContract({
    address: PROOF_BASE_ADDRESS,
    abi: PROOF_BASE_ABI,
    functionName: "getAllCourses",
  });

  return {
    ...result,
    data: (result.data as readonly Course[] | undefined) ?? [],
  };
}

export function useGetAllExams() {
  const result = useReadContract({
    address: PROOF_BASE_ADDRESS,
    abi: PROOF_BASE_ABI,
    functionName: "getAllExams",
  });

  return {
    ...result,
    data: (result.data as readonly Exam[] | undefined) ?? [],
  };
}

export function useGetAvailableExamsForStudent(
  studentAddress: `0x${string}` | undefined,
  options?: { query?: { enabled?: boolean } }
) {
  const enabled = options?.query?.enabled ?? !!studentAddress;

  const result = useReadContract({
    address: PROOF_BASE_ADDRESS,
    abi: PROOF_BASE_ABI,
    functionName: "getAvailableExamsForStudent",
    args: studentAddress ? [studentAddress] : undefined,
    query: {
      enabled,
    },
  });

  return {
    ...result,
    data: (result.data as readonly Exam[] | undefined) ?? [],
  };
}

export function useGetCorrectAnswersForStudent(examId: bigint | undefined) {
  return useReadContract({
    address: PROOF_BASE_ADDRESS,
    abi: PROOF_BASE_ABI,
    functionName: "getCorrectAnswersForStudent",
    args: examId !== undefined ? [examId] : undefined,
    query: {
      enabled: examId !== undefined,
    },
  });
}

export function useGetCourse(courseId: bigint | undefined) {
  const result = useReadContract({
    address: PROOF_BASE_ADDRESS,
    abi: PROOF_BASE_ABI,
    functionName: "getCourse",
    args: courseId !== undefined ? [courseId] : undefined,
    query: {
      enabled: courseId !== undefined,
    },
  });

  return {
    ...result,
    data: result.data as Course | undefined,
  };
}

export function useGetCourseWithLecturer(courseId: bigint | undefined) {
  return useReadContract({
    address: PROOF_BASE_ADDRESS,
    abi: PROOF_BASE_ABI,
    functionName: "getCourseWithLecturer",
    args: courseId !== undefined ? [courseId] : undefined,
    query: {
      enabled: courseId !== undefined,
    },
  });
}

export function useGetExam(examId: bigint | undefined) {
  const result = useReadContract({
    address: PROOF_BASE_ADDRESS,
    abi: PROOF_BASE_ABI,
    functionName: "getExam",
    args: examId !== undefined ? [examId] : undefined,
    query: {
      enabled: examId !== undefined,
    },
  });

  return {
    ...result,
    data: result.data as Exam | undefined,
  };
}

export function useGetExamQuestions(examId: bigint | undefined) {
  const result = useReadContract({
    address: PROOF_BASE_ADDRESS,
    abi: PROOF_BASE_ABI,
    functionName: "getExamQuestions",
    args: examId !== undefined ? [examId] : undefined,
    query: {
      enabled: examId !== undefined,
    },
  });

  type Response =
    | readonly [readonly string[], readonly [string, string, string, string][]]
    | undefined;

  const data = result.data as Response;

  return {
    ...result,
    data: data
      ? {
          questionTexts: data[0],
          questionOptions: data[1],
        }
      : undefined,
  };
}

export function useGetExamAnswersComparison(
  examId: bigint | undefined,
  studentAddress: `0x${string}` | undefined
) {
  const result = useReadContract({
    address: PROOF_BASE_ADDRESS,
    abi: PROOF_BASE_ABI,
    functionName: "getExamAnswersComparison",
    args:
      examId !== undefined && studentAddress
        ? [examId, studentAddress]
        : undefined,
    query: {
      enabled: examId !== undefined && !!studentAddress,
    },
  });

  type Response =
    | readonly [readonly bigint[], readonly bigint[], readonly boolean[], boolean]
    | undefined;

  const data = result.data as Response;

  const transformedData: ExamAnswersComparison | undefined = data
    ? {
        correctAnswers: data[0],
        studentAnswers: data[1],
        isCorrect: data[2],
        isCompleted: data[3],
      }
    : undefined;

  return {
    ...result,
    data: transformedData,
  };
}

export function useGetExamCorrectAnswers(examId: bigint | undefined) {
  return useReadContract({
    address: PROOF_BASE_ADDRESS,
    abi: PROOF_BASE_ABI,
    functionName: "getExamCorrectAnswers",
    args: examId !== undefined ? [examId] : undefined,
    query: {
      enabled: examId !== undefined,
    },
  });
}

export function useGetExamResults(
  examId: bigint | undefined,
  studentAddress: `0x${string}` | undefined
) {
  const result = useReadContract({
    address: PROOF_BASE_ADDRESS,
    abi: PROOF_BASE_ABI,
    functionName: "getExamResults",
    args:
      examId !== undefined && studentAddress
        ? [examId, studentAddress]
        : undefined,
    query: {
      enabled: examId !== undefined && !!studentAddress,
    },
  });

  type Response = readonly [bigint, readonly bigint[], boolean] | undefined;
  const data = result.data as Response;

  const transformedData: ExamResults | undefined = data
    ? {
        rawScore: data[0],
        answers: data[1],
        isCompleted: data[2],
      }
    : undefined;

  return {
    ...result,
    data: transformedData,
  };
}

export function useGetExamReviewForStudent(examId: bigint | undefined) {
  const { address } = useAccount();

  const result = useReadContract({
    address: PROOF_BASE_ADDRESS,
    abi: PROOF_BASE_ABI,
    functionName: "getExamReviewForStudent",
    args: examId !== undefined ? [examId] : undefined,
    query: {
      enabled: examId !== undefined && !!address,
    },
  });

  type Response =
    | readonly [
        readonly string[],
        readonly [string, string, string, string][],
        readonly bigint[],
        readonly bigint[],
        readonly boolean[],
        bigint,
        bigint
      ]
    | undefined;

  const data = result.data as Response;

  const transformedData: ExamReview | undefined = data
    ? {
        questionTexts: data[0],
        questionOptions: data[1],
        correctAnswers: data[2],
        studentAnswers: data[3],
        isCorrect: data[4],
        totalScore: data[5],
        maxScore: data[6],
      }
    : undefined;

  return {
    ...result,
    data: transformedData,
  };
}

export function useGetExamsForCourse(courseId: bigint | undefined) {
  return useReadContract({
    address: PROOF_BASE_ADDRESS,
    abi: PROOF_BASE_ABI,
    functionName: "getExamsForCourse",
    args: courseId !== undefined ? [courseId] : undefined,
    query: {
      enabled: courseId !== undefined,
    },
  });
}

export interface ExamWithStatus {
  exam: Exam;
  completionStatus: boolean;
  score: bigint;
}

export function useGetExamsWithStatusForStudent(
  studentAddress: `0x${string}` | undefined,
  options?: { query?: { enabled?: boolean } }
) {
  const enabled = options?.query?.enabled ?? !!studentAddress;

  const result = useReadContract({
    address: PROOF_BASE_ADDRESS,
    abi: PROOF_BASE_ABI,
    functionName: "getExamsWithStatusForStudent",
    args: studentAddress ? [studentAddress] : undefined,
    query: {
      enabled,
    },
  });

  type Response =
    | readonly [readonly Exam[], readonly boolean[], readonly bigint[]]
    | undefined;

  const data = result.data as Response;

  const transformedData: ExamWithStatus[] = data
    ? data[0].map((exam, index) => ({
        exam,
        completionStatus: data[1][index],
        score: data[2][index],
      }))
    : [];

  return {
    ...result,
    data: transformedData,
  };
}

export function useGetStudentExamScore(
  examId: bigint | undefined,
  studentAddress: `0x${string}` | undefined
) {
  const result = useReadContract({
    address: PROOF_BASE_ADDRESS,
    abi: PROOF_BASE_ABI,
    functionName: "getStudentExamScore",
    args:
      examId !== undefined && studentAddress
        ? [examId, studentAddress]
        : undefined,
    query: {
      enabled: examId !== undefined && !!studentAddress,
    },
  });

  type Response = readonly [bigint, boolean] | undefined;
  const data = result.data as Response;

  const transformedData: ExamScore | undefined = data
    ? {
        rawScore: data[0],
        isCompleted: data[1],
      }
    : undefined;

  return {
    ...result,
    data: transformedData,
  };
}


export function useGetUser(userAddress: `0x${string}` | undefined) {
  const result = useReadContract({
    address: PROOF_BASE_ADDRESS,
    abi: PROOF_BASE_ABI,
    functionName: "getUser",
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
    },
  });

  const raw = result.data as
    | readonly [string, bigint, boolean]
    | {
        0?: string;
        1?: bigint;
        2?: boolean;
        name?: string;
        role?: bigint;
        isRegistered?: boolean;
      }
    | undefined;

  let transformedData: User | undefined;

  if (raw) {
    const name =
      Array.isArray(raw) ? raw[0] : (raw as any).name ?? (raw as any)[0];

    const role =
      Array.isArray(raw) ? raw[1] : (raw as any).role ?? (raw as any)[1];

    const isRegistered =
      Array.isArray(raw) ? raw[2] : (raw as any).isRegistered ?? (raw as any)[2];

    if (
      typeof name === "string" &&
      typeof isRegistered === "boolean" &&
      role !== undefined
    ) {
      transformedData = {
        name,
        role: Number(role) as UserRole,
        isRegistered,
      };
    }
  }

  return {
    ...result,
    data: transformedData,
  };
}


export function useHasCompletedExam(
  examId: bigint | undefined,
  studentAddress: `0x${string}` | undefined
) {
  return useReadContract({
    address: PROOF_BASE_ADDRESS,
    abi: PROOF_BASE_ABI,
    functionName: "hasCompletedExam",
    args:
      examId !== undefined && studentAddress
        ? [examId, studentAddress]
        : undefined,
    query: {
      enabled: examId !== undefined && !!studentAddress,
    },
  });
}

export function useIsEnrolledInCourse(
  courseId: bigint | undefined,
  studentAddress: `0x${string}` | undefined
) {
  return useReadContract({
    address: PROOF_BASE_ADDRESS,
    abi: PROOF_BASE_ABI,
    functionName: "isEnrolledInCourse",
    args:
      courseId !== undefined && studentAddress
        ? [courseId, studentAddress]
        : undefined,
    query: {
      enabled: courseId !== undefined && !!studentAddress,
    },
  });
}

export function useIsUserRegistered(userAddress: `0x${string}` | undefined) {
  return useReadContract({
    address: PROOF_BASE_ADDRESS,
    abi: PROOF_BASE_ABI,
    functionName: "isUserRegistered",
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
    },
  });
}

// =========================
// Write hooks
// =========================

export function useRegisterUser() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isConfirming, isConfirmed } = useAutoRefreshOnConfirm(hash);

  const registerUser = (name: string, role: UserRole) => {
    writeContract({
      address: PROOF_BASE_ADDRESS,
      abi: PROOF_BASE_ABI,
      functionName: "registerUser",
      args: [name, role],
    });
  };

  return {
    registerUser,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}

export function useCreateCourse() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isConfirming, isConfirmed } = useAutoRefreshOnConfirm(hash);

  const createCourse = (title: string) => {
    writeContract({
      address: PROOF_BASE_ADDRESS,
      abi: PROOF_BASE_ABI,
      functionName: "createCourse",
      args: [title],
    });
  };

  return {
    createCourse,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}

export function useCreateExam() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isConfirming, isConfirmed } = useAutoRefreshOnConfirm(hash);

  const createExam = (
    courseId: bigint,
    title: string,
    questionTexts: string[],
    questionOptions: [string, string, string, string][],
    correctAnswers: bigint[]
  ) => {
    writeContract({
      address: PROOF_BASE_ADDRESS,
      abi: PROOF_BASE_ABI,
      functionName: "createExam",
      args: [courseId, title, questionTexts, questionOptions, correctAnswers],
    });
  };

  return {
    createExam,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}

export function useEnrollInCourse() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isConfirming, isConfirmed } = useAutoRefreshOnConfirm(hash);

  const enrollInCourse = (courseId: bigint) => {
    writeContract({
      address: PROOF_BASE_ADDRESS,
      abi: PROOF_BASE_ABI,
      functionName: "enrollInCourse",
      args: [courseId],
    });
  };

  return {
    enrollInCourse,
    hash,
    isLoading: isPending || isConfirming,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}

export function useTakeExam() {
  const { data: hash, writeContract, isPending, error } = useWriteContract();
  const { isConfirming, isConfirmed } = useAutoRefreshOnConfirm(hash);

  const takeExam = (examId: bigint, answers: bigint[]) => {
    writeContract({
      address: PROOF_BASE_ADDRESS,
      abi: PROOF_BASE_ABI,
      functionName: "takeExam",
      args: [examId, answers],
    });
  };

  return {
    takeExam,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error,
  };
}