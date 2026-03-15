"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAccount } from "wagmi";
import { Drawer } from "antd";
import { AnimatePresence, motion } from "framer-motion";
import {
  useCreateCourse,
  useCreateExam,
  useEnrollInCourse,
  useGetAllCourses,
  useGetUser,
  useIsEnrolledInCourse,
  UserRole,
  type Course,
  type QuestionOptions,
} from "@/utils/useContractHooks";
import Link from "next/link";

type ExamQuestionForm = {
  text: string;
  options: [string, string, string, string];
  correctAnswer: number;
};

type ExamInputMode = "manual" | "document" | "ai";

const emptyQuestion = (): ExamQuestionForm => ({
  text: "",
  options: ["", "", "", ""],
  correctAnswer: 0,
});

type CourseCardProps = {
  course: Course;
  address?: `0x${string}`;
  isTutor: boolean;
  isStudent: boolean;
  canManageExam: boolean;
  openExamDrawer: (courseId: bigint, courseTitle: string) => void;
};

const EXAM_UPLOAD_TEMPLATE = {
  title: "Sample Exam Title",
  questions: [
    {
      text: "What is the capital of France?",
      options: ["Berlin", "Madrid", "Paris", "Rome"],
      correctAnswer: 2,
    },
    {
      text: "Which data type is used to store true or false values?",
      options: ["string", "boolean", "number", "array"],
      correctAnswer: 1,
    },
  ],
};

function downloadExamTemplate() {
  const blob = new Blob([JSON.stringify(EXAM_UPLOAD_TEMPLATE, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "exam-upload-template.json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function CourseCard({
  course,
  address,
  isTutor,
  isStudent,
  canManageExam,
  openExamDrawer,
}: CourseCardProps) {
  const { enrollInCourse, isLoading: isEnrolling } = useEnrollInCourse();

  const { data: isEnrolled } = useIsEnrolledInCourse(
    course.courseId,
    isStudent ? address : undefined,
  );

  const enrolled = Boolean(isEnrolled);

  const handleEnroll = () => {
    if (!isStudent || enrolled || !course.isActive || isEnrolling) return;
    enrollInCourse(course.courseId);
  };

  return (
    <div className="w-full max-w-md rounded-2xl bg-[#E36A6A] p-5 shadow-md transition hover:-translate-y-1 hover:shadow-xl">
      <div className="flex min-h-[210px] flex-col justify-between">
        <div>
          <h3 className="line-clamp-2 text-lg font-semibold text-[#FFFBF1]">
            {course.title}
          </h3>

          <p className="mt-3 text-sm text-[#FFFBF1]/85">
            Lecturer: {course.tutorName}
          </p>
        </div>

        <div className="mt-6 space-y-3 border-t border-white/15 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#FFFBF1]/75">
              ID: {course.courseId.toString()}
            </span>

            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                course.isActive
                  ? "bg-white/15 text-[#FFFBF1]"
                  : "bg-black/10 text-[#FFFBF1]/80"
              }`}
            >
              {course.isActive ? "Active" : "Inactive"}
            </span>
          </div>

          {canManageExam && (
            <button
              onClick={() => openExamDrawer(course.courseId, course.title)}
              className="w-full cursor-pointer rounded-xl bg-[#FFFBF1] px-4 py-2.5 text-sm font-semibold text-[#E36A6A] transition hover:opacity-90"
            >
              + Add Exam
            </button>
          )}

          {isStudent && (
            <button
              onClick={handleEnroll}
              disabled={!course.isActive || enrolled || isEnrolling}
              className={`w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                enrolled
                  ? "cursor-not-allowed bg-white/20 text-[#FFFBF1]"
                  : !course.isActive || isEnrolling
                    ? "cursor-not-allowed bg-white/10 text-[#FFFBF1]/70"
                    : "cursor-pointer bg-[#FFFBF1] text-[#E36A6A] hover:opacity-90"
              }`}
            >
              {enrolled
                ? "Enrolled"
                : isEnrolling
                  ? "Enrolling..."
                  : !course.isActive
                    ? "Course Inactive"
                    : "Enroll"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Courses() {
  const { address } = useAccount();
  const { data: user } = useGetUser(address);
  console.log("User data:", user);

  const {
    createCourse,
    isPending: isCoursePending,
    isConfirming: isCourseConfirming,
    isConfirmed: isCourseConfirmed,
  } = useCreateCourse();

  const {
    createExam,
    isPending: isExamPending,
    isConfirming: isExamConfirming,
    isConfirmed: isExamConfirmed,
    error: createExamError,
  } = useCreateExam();

  const { data: courses } = useGetAllCourses();

  console.log("Fetched courses:", courses);

  const [title, setTitle] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [showExamDrawer, setShowExamDrawer] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<bigint | null>(null);
  const [selectedCourseTitle, setSelectedCourseTitle] = useState("");
  const [examTitle, setExamTitle] = useState("");
  const [questions, setQuestions] = useState<ExamQuestionForm[]>([
    emptyQuestion(),
  ]);
  const [uploadError, setUploadError] = useState("");
  const [inputMode, setInputMode] = useState<ExamInputMode>("manual");
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  const importFileInputRef = useRef<HTMLInputElement | null>(null);
  const aiFileInputRef = useRef<HTMLInputElement | null>(null);

  const isTutor = user?.role === UserRole.TUTOR;
  const isStudent = user?.role === UserRole.STUDENT;
  const isCreatingCourse = isCoursePending || isCourseConfirming;
  const isCreatingExam = isExamPending || isExamConfirming || isProcessingFile;

  useEffect(() => {
    if (isCourseConfirmed) {
      setShowModal(false);
      setTitle("");
    }
  }, [isCourseConfirmed]);

  useEffect(() => {
    if (isExamConfirmed) {
      setShowExamDrawer(false);
      resetExamForm();
      setSelectedCourseId(null);
      setSelectedCourseTitle("");
    }
  }, [isExamConfirmed]);

  const ownCourseIds = useMemo(() => {
    if (!address || !courses?.length) return new Set<string>();

    return new Set(
      courses
        .filter(
          (course) => course.tutor.toLowerCase() === address.toLowerCase(),
        )
        .map((course) => course.courseId.toString()),
    );
  }, [address, courses]);

  const handleCreateCourse = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    createCourse(trimmed);
  };

  const openExamDrawer = (courseId: bigint, courseTitle: string) => {
    setSelectedCourseId(courseId);
    setSelectedCourseTitle(courseTitle);
    setShowExamDrawer(true);
  };

  const resetExamForm = () => {
    setExamTitle("");
    setQuestions([emptyQuestion()]);
    setUploadError("");
    setInputMode("manual");
    setIsProcessingFile(false);

    if (importFileInputRef.current) {
      importFileInputRef.current.value = "";
    }

    if (aiFileInputRef.current) {
      aiFileInputRef.current.value = "";
    }
  };

  const closeExamDrawer = () => {
    if (isCreatingExam) return;

    setShowExamDrawer(false);
    resetExamForm();
    setSelectedCourseId(null);
    setSelectedCourseTitle("");
  };

  const addQuestion = () => {
    setQuestions((prev) => [...prev, emptyQuestion()]);
  };

  const removeQuestion = (index: number) => {
    setQuestions((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const updateQuestionText = (index: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, text: value } : q)),
    );
  };

  const updateQuestionOption = (
    questionIndex: number,
    optionIndex: number,
    value: string,
  ) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== questionIndex) return q;

        const nextOptions = [...q.options] as [string, string, string, string];
        nextOptions[optionIndex] = value;

        return {
          ...q,
          options: nextOptions,
        };
      }),
    );
  };

  const updateCorrectAnswer = (index: number, value: number) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, correctAnswer: value } : q)),
    );
  };

  const processExamDocument = async (
    file: File,
    mode: "normalize" | "generate",
  ) => {
    setUploadError("");
    setIsProcessingFile(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("mode", mode);
      formData.append("examTitle", examTitle.trim());

      const res = await fetch("/api/generate-questions", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to process file.");
      }

      if (!data?.title || !Array.isArray(data?.questions)) {
        throw new Error("Invalid response returned from the server.");
      }

      const normalizedQuestions: ExamQuestionForm[] = data.questions.map(
        (q: any, idx: number) => {
          if (
            !q?.text ||
            !Array.isArray(q?.options) ||
            q.options.length !== 4 ||
            typeof q.correctAnswer !== "number"
          ) {
            throw new Error(`Invalid question at index ${idx + 1}.`);
          }

          return {
            text: q.text,
            options: [
              q.options[0] ?? "",
              q.options[1] ?? "",
              q.options[2] ?? "",
              q.options[3] ?? "",
            ],
            correctAnswer: q.correctAnswer,
          };
        },
      );

      setExamTitle((prev) => prev.trim() || data.title || "");
      setQuestions(normalizedQuestions);
    } catch (error) {
      setUploadError(
        error instanceof Error
          ? error.message
          : "Failed to process uploaded file.",
      );
    } finally {
      setIsProcessingFile(false);
    }
  };

  const handleExistingExamUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processExamDocument(file, "normalize");
  };

  const handleAiLectureNoteUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processExamDocument(file, "generate");
  };

  const validateExam = () => {
    if (selectedCourseId === null) return "No course selected.";
    if (!examTitle.trim()) return "Exam title is required.";
    if (!questions.length) return "Add at least one question.";

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];

      if (!q.text.trim()) {
        return `Question ${i + 1} needs text.`;
      }

      const hasEmptyOption = q.options.some((opt) => !opt.trim());
      if (hasEmptyOption) {
        return `Question ${i + 1} must have all 4 options filled.`;
      }

      if (q.correctAnswer < 0 || q.correctAnswer > 3) {
        return `Question ${i + 1} must have a valid correct answer.`;
      }
    }

    return null;
  };

  const handleCreateExam = () => {
    const validationError = validateExam();
    if (validationError) {
      setUploadError(validationError);
      return;
    }

    if (selectedCourseId === null) return;

    const questionTexts = questions.map((q) => q.text.trim());
    const questionOptions = questions.map(
      (q) =>
        [
          q.options[0].trim(),
          q.options[1].trim(),
          q.options[2].trim(),
          q.options[3].trim(),
        ] as QuestionOptions,
    );
    const correctAnswers = questions.map((q) => BigInt(q.correctAnswer));

    createExam(
      selectedCourseId,
      examTitle.trim(),
      questionTexts,
      questionOptions,
      correctAnswers,
    );
  };

  return (
    <div className="mx-auto mt-10 w-full max-w-6xl px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Courses</h2>

        <div className="flex items-center gap-3">
          <Link
            href="/exams"
            className="rounded bg-white px-4 py-2 text-sm font-semibold text-[#E36A6A] shadow ring-1 ring-[#E36A6A]/30 hover:bg-[#FFF4F4]"
          >
            View Exams
          </Link>

          {isTutor && (
            <button
              onClick={() => setShowModal(true)}
              className="cursor-pointer rounded bg-[#E36A6A] px-4 py-2 text-white shadow hover:opacity-90"
            >
              + Create Course
            </button>
          )}
        </div>
      </div>

      <div>
        {courses?.length === 0 ? (
          <p className="py-10 text-center text-gray-500">No courses yet</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {courses?.map((course) => {
              const canManageExam =
                isTutor && ownCourseIds.has(course.courseId.toString());

              return (
                <CourseCard
                  key={course.courseId.toString()}
                  course={course}
                  address={address}
                  isTutor={!!isTutor}
                  isStudent={!!isStudent}
                  canManageExam={canManageExam}
                  openExamDrawer={openExamDrawer}
                />
              );
            })}
          </div>
        )}
      </div>
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 py-6 sm:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              if (!isCreatingCourse) setShowModal(false);
            }}
          >
            <motion.div
              initial={{ y: 80, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 80, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg min-h-[40vh] overflow-y-auto rounded-[10px] bg-[#FFFBF1] p-7 shadow-2xl"
            >
              <div className="mx-auto mb-6 h-1.5 w-14 rounded-full bg-black/10" />

              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Create Course
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Add a new course for your students.
                </p>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Course Title
                </label>

                <input
                  type="text"
                  placeholder="e.g. Introduction to Blockchain"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isCreatingCourse}
                  className="w-full rounded-xl bg-white px-4 py-3 text-sm text-gray-800 outline-none ring-1 ring-black/10 transition focus:ring-2 focus:ring-black/20 disabled:opacity-60"
                />
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  disabled={isCreatingCourse}
                  className="cursor-pointer rounded-[10px] bg-white px-4 py-2.5 text-sm font-medium text-gray-700 ring-1 ring-black/10 transition hover:bg-black/[0.03] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  onClick={handleCreateCourse}
                  disabled={isCreatingCourse || !title.trim()}
                  className="cursor-pointer rounded-[10px] bg-[#E36A6A] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isCoursePending
                    ? "Confirm in Wallet..."
                    : isCourseConfirming
                      ? "Creating..."
                      : "Create"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Drawer
        title={
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Add Exam</h2>
            <p className="mt-1 text-sm font-normal text-gray-500">
              Course: {selectedCourseTitle}
            </p>
          </div>
        }
        placement="right"
        open={showExamDrawer}
        onClose={closeExamDrawer}
        width={1000}
        destroyOnClose
        maskClosable={!isCreatingExam}
        closable={!isCreatingExam}
        styles={{
          header: {
            background: "#FFFBF1",
            borderBottom: "1px solid rgba(0,0,0,0.08)",
            padding: "20px 24px",
          },
          body: {
            background: "#FFFBF1",
            padding: "24px",
          },
        }}
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Exam Title
            </label>
            <input
              type="text"
              value={examTitle}
              onChange={(e) => setExamTitle(e.target.value)}
              disabled={isCreatingExam}
              placeholder="e.g. Quiz 1"
              className="w-full rounded-xl bg-white px-4 py-3 text-sm text-gray-800 outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-black/20 disabled:opacity-60"
            />
          </div>

          <div className="rounded-2xl bg-white p-4 ring-1 ring-black/10">
            <h3 className="text-sm font-semibold text-gray-900">
              Exam Input Method
            </h3>

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <button
                type="button"
                disabled={isCreatingExam}
                onClick={() => setInputMode("manual")}
                className={`rounded-xl px-4 py-3 text-sm font-medium ring-1 transition ${
                  inputMode === "manual"
                    ? "bg-[#E36A6A] text-white ring-[#E36A6A]"
                    : "bg-[#FFFBF1] text-gray-700 ring-black/10"
                }`}
              >
                Manual Entry
              </button>

              <button
                type="button"
                disabled={isCreatingExam}
                onClick={() => setInputMode("document")}
                className={`rounded-xl px-4 py-3 text-sm font-medium ring-1 transition ${
                  inputMode === "document"
                    ? "bg-[#E36A6A] text-white ring-[#E36A6A]"
                    : "bg-[#FFFBF1] text-gray-700 ring-black/10"
                }`}
              >
                Upload Q&A Doc
              </button>

              <button
                type="button"
                disabled={isCreatingExam}
                onClick={() => setInputMode("ai")}
                className={`rounded-xl px-4 py-3 text-sm font-medium ring-1 transition ${
                  inputMode === "ai"
                    ? "bg-[#E36A6A] text-white ring-[#E36A6A]"
                    : "bg-[#FFFBF1] text-gray-700 ring-black/10"
                }`}
              >
                AI from Notes
              </button>
            </div>

            {inputMode === "document" && (
              <div className="mt-4 rounded-xl bg-[#FFFBF1] p-4 ring-1 ring-black/10">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">
                      Upload Already-Prepared Questions & Answers
                    </h4>
                    <p className="mt-1 text-xs text-gray-500">
                      Supports .json, .txt, .md, .docx. The server will
                      normalize the document into your exam structure.
                    </p>
                    <p className="mt-2 text-xs text-gray-500">
                      For JSON uploads, use{" "}
                      <code className="rounded bg-white px-1 py-0.5">
                        correctAnswer
                      </code>{" "}
                      as a zero-based index: 0 = Option 1, 1 = Option 2, 2 =
                      Option 3, 3 = Option 4.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={downloadExamTemplate}
                    disabled={isCreatingExam}
                    className="rounded-xl bg-white px-4 py-2 text-xs font-semibold text-[#E36A6A] ring-1 ring-[#E36A6A]/20 transition hover:bg-[#FFF4F4] disabled:opacity-50"
                  >
                    Download Template
                  </button>
                </div>

                <input
                  ref={importFileInputRef}
                  type="file"
                  accept=".json,.txt,.md,.docx,application/json,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleExistingExamUpload}
                  disabled={isCreatingExam}
                  className="mt-4 block cursor-pointer text-xs text-gray-600"
                />
              </div>
            )}

            {inputMode === "ai" && (
              <div className="mt-4 rounded-xl bg-[#FFFBF1] p-4 ring-1 ring-black/10">
                <h4 className="text-sm font-semibold text-gray-900">
                  Upload Lecture Note / Slide for AI Generation
                </h4>
                <p className="mt-1 text-xs text-gray-500">
                  Best with .docx, but .txt and .md also work. AI will generate
                  MCQs with 4 options and the correct answer index.
                </p>

                <input
                  ref={aiFileInputRef}
                  type="file"
                  accept=".docx,.txt,.md,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                  onChange={handleAiLectureNoteUpload}
                  disabled={isCreatingExam}
                  className="mt-3 block text-xs text-gray-600"
                />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                Questions
              </h3>
            </div>

            {questions.map((question, questionIndex) => (
              <div
                key={questionIndex}
                className="space-y-4 rounded-2xl bg-white p-4 ring-1 ring-black/10"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-900">
                    Question {questionIndex + 1}
                  </h4>

                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(questionIndex)}
                      disabled={isCreatingExam}
                      className="text-sm cursor-pointer font-medium text-red-500 disabled:opacity-50"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Question Text
                  </label>
                  <textarea
                    value={question.text}
                    onChange={(e) =>
                      updateQuestionText(questionIndex, e.target.value)
                    }
                    disabled={isCreatingExam}
                    rows={3}
                    className="w-full rounded-xl bg-[#FFFBF1] px-4 py-3 text-sm text-gray-800 outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-black/20 disabled:opacity-60"
                    placeholder="Enter the question"
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Option {optionIndex + 1}
                      </label>
                      <input
                        type="text"
                        value={option}
                        onChange={(e) =>
                          updateQuestionOption(
                            questionIndex,
                            optionIndex,
                            e.target.value,
                          )
                        }
                        disabled={isCreatingExam}
                        className="w-full rounded-xl bg-[#FFFBF1] px-4 py-3 text-sm text-gray-800 outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-black/20 disabled:opacity-60"
                        placeholder={`Option ${optionIndex + 1}`}
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Correct Answer
                  </label>

                  <select
                    value={question.correctAnswer}
                    onChange={(e) =>
                      updateCorrectAnswer(questionIndex, Number(e.target.value))
                    }
                    disabled={isCreatingExam}
                    className="w-full rounded-xl bg-[#FFFBF1] px-4 py-3 text-sm text-gray-800 outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-black/20 disabled:opacity-60"
                  >
                    <option value={0}>Option 1</option>
                    <option value={1}>Option 2</option>
                    <option value={2}>Option 3</option>
                    <option value={3}>Option 4</option>
                  </select>
                </div>
              </div>
            ))}
            <div className="flex justify-start pt-2">
              <button
                onClick={addQuestion}
                type="button"
                disabled={isCreatingExam}
                className="rounded-xl cursor-pointer bg-[#E36A6A] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 disabled:opacity-50"
              >
                + Add Question
              </button>
            </div>
          </div>

          {(uploadError || createExamError) && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 ring-1 ring-red-200">
              {uploadError || createExamError?.message}
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-black/10 pt-4">
            <button
              onClick={closeExamDrawer}
              disabled={isCreatingExam}
              className="rounded-xl cursor-pointer bg-white px-4 py-2.5 text-sm font-medium text-gray-700 ring-1 ring-black/10 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              onClick={handleCreateExam}
              disabled={isCreatingExam || !examTitle.trim()}
              className="rounded-xl cursor-pointer bg-[#E36A6A] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 disabled:opacity-50"
            >
              {isProcessingFile
                ? "Processing File..."
                : isExamPending
                  ? "Confirm in Wallet..."
                  : isExamConfirming
                    ? "Creating Exam..."
                    : "Create Exam"}
            </button>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
