"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Drawer } from "antd";
import { useAccount } from "wagmi";
import {
  useGetAllExams,
  useGetUser,
  useGetExamQuestions,
  useGetExamReviewForStudent,
  useTakeExam,
  useIsEnrolledInCourse,
  useHasCompletedExam,
  UserRole,
} from "@/utils/useContractHooks";

type ExamCardProps = {
  exam: {
    examId: bigint;
    courseId: bigint;
    title: string;
    questionCount: bigint;
    isActive: boolean;
    creator: `0x${string}`;
  };
  address?: `0x${string}`;
  isStudent: boolean;
  openExamDrawer: (
    examId: bigint,
    examTitle: string,
    mode?: "answer" | "review",
  ) => void;
};

function ExamCard({ exam, address, isStudent, openExamDrawer }: ExamCardProps) {
  const { data: isEnrolled } = useIsEnrolledInCourse(
    exam.courseId,
    isStudent ? address : undefined,
  );

  const { data: hasCompleted } = useHasCompletedExam(
    exam.examId,
    isStudent ? address : undefined,
  );

  const enrolled = Boolean(isEnrolled);
  const completed = Boolean(hasCompleted);
  const canTakeExam = !isStudent || enrolled;

  return (
    <div className="rounded-2xl border border-[#E36A6A] bg-[#FFFBF1] p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="flex min-h-[180px] flex-col justify-between">
        <div className="space-y-3">
          <h3 className="line-clamp-2 text-lg font-semibold text-[#E36A6A]">
            {exam.title}
          </h3>

          <div className="space-y-1 text-sm text-gray-700">
            <p>Exam ID: {exam.examId.toString()}</p>
            <p>Course ID: {exam.courseId.toString()}</p>
            <p>Questions: {exam.questionCount.toString()}</p>
          </div>
        </div>

        <div className="mt-5 space-y-3 border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between">
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                exam.isActive
                  ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                  : "bg-gray-100 text-gray-600 ring-1 ring-gray-200"
              }`}
            >
              {exam.isActive ? "Active" : "Inactive"}
            </span>

            <span className="text-xs text-gray-500">
              Creator:{" "}
              {`${exam.creator.slice(0, 6)}...${exam.creator.slice(-4)}`}
            </span>
          </div>

          {isStudent && completed ? (
            <div className="space-y-2">
              <div className="rounded-xl bg-green-50 px-4 py-2.5 text-center text-sm font-medium text-green-700 ring-1 ring-green-200">
                Exam completed
              </div>

              <button
                type="button"
                onClick={() =>
                  openExamDrawer(exam.examId, exam.title, "review")
                }
                className="block w-full cursor-pointer rounded-xl bg-[#E36A6A] px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:opacity-90"
              >
                View Past Questions
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (!canTakeExam) return;
                openExamDrawer(exam.examId, exam.title, "answer");
              }}
              disabled={!canTakeExam}
              className={`block w-full rounded-xl px-4 py-2.5 text-center text-sm font-semibold transition ${
                canTakeExam
                  ? "cursor-pointer bg-[#E36A6A] text-white hover:opacity-90"
                  : "cursor-not-allowed bg-gray-200 text-gray-500"
              }`}
            >
              {isStudent
                ? enrolled
                  ? "Answer Questions"
                  : "Enroll to Take Exam"
                : "View Questions"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const Exams = () => {
  const { address } = useAccount();
  const { data: user } = useGetUser(address);
  const isStudent = user?.role === UserRole.STUDENT;

  const { data: exams, isLoading, error } = useGetAllExams();

  const [openDrawer, setOpenDrawer] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState<bigint | null>(null);
  const [selectedExamTitle, setSelectedExamTitle] = useState("");
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [submitError, setSubmitError] = useState("");

  const [drawerMode, setDrawerMode] = useState<"answer" | "review">("answer");

  const {
    data: examQuestionsData,
    isLoading: isQuestionsLoading,
    error: questionsError,
  } = useGetExamQuestions(selectedExamId ?? undefined);

  const {
    data: examReviewData,
    isLoading: isReviewLoading,
    error: reviewError,
  } = useGetExamReviewForStudent(
    drawerMode === "review" ? (selectedExamId ?? undefined) : undefined,
  );

  const {
    takeExam,
    isPending: isTakeExamPending,
    isConfirming: isTakeExamConfirming,
    isConfirmed: isTakeExamConfirmed,
    error: takeExamError,
  } = useTakeExam();

  useEffect(() => {
    if (isTakeExamConfirmed) {
      setSubmitError("");
      setOpenDrawer(false);
      setSelectedExamId(null);
      setSelectedExamTitle("");
      setDrawerMode("review");
      setSelectedAnswers([]);
      window.location.reload();
    }
  }, [isTakeExamConfirmed]);

  const questionTexts =
    drawerMode === "review"
      ? (examReviewData?.questionTexts ?? [])
      : (examQuestionsData?.questionTexts ?? []);

  const questionOptions =
    drawerMode === "review"
      ? (examReviewData?.questionOptions ?? [])
      : (examQuestionsData?.questionOptions ?? []);

  const reviewCorrectAnswers = examReviewData?.correctAnswers ?? [];
  const reviewStudentAnswers = examReviewData?.studentAnswers ?? [];
  const reviewIsCorrect = examReviewData?.isCorrect ?? [];
  const isSubmitting = isTakeExamPending || isTakeExamConfirming;

  const selectedExam = useMemo(() => {
    if (selectedExamId === null) return null;
    return exams.find((exam) => exam.examId === selectedExamId) ?? null;
  }, [exams, selectedExamId]);

  const { data: isEnrolledForSelectedExam, isLoading: isEnrollmentLoading } =
    useIsEnrolledInCourse(
      selectedExam?.courseId,
      isStudent ? address : undefined,
    );

  const canTakeSelectedExam = !isStudent || Boolean(isEnrolledForSelectedExam);

  useEffect(() => {
    if (openDrawer && questionTexts.length) {
      setSelectedAnswers(new Array(questionTexts.length).fill(-1));
    }
  }, [openDrawer, questionTexts.length]);

  const openExamDrawer = (
    examId: bigint,
    examTitle: string,
    mode: "answer" | "review" = "answer",
  ) => {
    const exam = exams.find((item) => item.examId === examId);

    if (!exam) return;

    setSelectedExamId(examId);
    setSelectedExamTitle(examTitle);
    setDrawerMode(mode);
    setSelectedAnswers([]);
    setSubmitError("");
    setOpenDrawer(true);
  };

  const closeExamDrawer = () => {
    if (isSubmitting) return;
    setOpenDrawer(false);
    setSelectedExamId(null);
    setSelectedExamTitle("");
    setDrawerMode("answer");
    setSelectedAnswers([]);
    setSubmitError("");
  };

  const handleSelectAnswer = (questionIndex: number, optionIndex: number) => {
    if (
      drawerMode !== "answer" ||
      !isStudent ||
      !canTakeSelectedExam ||
      isSubmitting
    )
      return;

    setSelectedAnswers((prev) => {
      const next = [...prev];
      next[questionIndex] = optionIndex;
      return next;
    });
  };

  const handleSubmitExam = () => {
    if (!isStudent || selectedExamId === null) return;

    if (!canTakeSelectedExam) {
      setSubmitError("You must enroll in this course before taking the exam.");
      return;
    }

    if (selectedAnswers.length !== questionTexts.length) {
      setSubmitError("Questions are not fully loaded yet.");
      return;
    }

    const hasUnanswered = selectedAnswers.some((answer) => answer < 0);
    if (hasUnanswered) {
      setSubmitError("Answer all questions before submitting.");
      return;
    }

    setSubmitError("");
    takeExam(
      selectedExamId,
      selectedAnswers.map((answer) => BigInt(answer)),
    );
  };

  if (isLoading) {
    return (
      <div className="mx-auto mt-10 max-w-6xl p-6">
        <p className="text-sm text-gray-500">Loading exams...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto mt-10 max-w-6xl p-6">
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 ring-1 ring-red-200">
          Failed to load exams.
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto mt-10 max-w-6xl space-y-6 p-6">
        <div className="space-y-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-lg font-semibold text-gray-500 transition-transform hover:scale-110 hover:opacity-90"
          >
            <span className="text-2xl">&lsaquo;</span>
            Back
          </Link>

          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[#E36A6A]">
              Exams ({exams?.length ?? 0})
            </h2>
          </div>
        </div>

        {!exams?.length ? (
          <div className="rounded-2xl border border-gray-200 bg-[#FFFBF1] p-8 text-center shadow-sm">
            <p className="text-sm text-gray-500">No exams available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {exams.map((exam) => (
              <ExamCard
                key={exam.examId.toString()}
                exam={exam}
                address={address}
                isStudent={!!isStudent}
                openExamDrawer={openExamDrawer}
              />
            ))}
          </div>
        )}
      </div>

      <Drawer
        title={
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {isStudent
                ? drawerMode === "review"
                  ? "Exam Review"
                  : "Answer Exam"
                : "Exam Questions"}
            </h2>
            <p className="mt-1 text-sm font-normal text-gray-500">
              {selectedExamTitle || "Selected Exam"}
            </p>
          </div>
        }
        placement="right"
        open={openDrawer}
        onClose={closeExamDrawer}
        width={1000}
        destroyOnClose
        maskClosable={!isSubmitting}
        closable={!isSubmitting}
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
          {selectedExam && (
            <div className="rounded-2xl border border-gray-200 bg-white p-4">
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-700">
                <span>Exam ID: {selectedExam.examId.toString()}</span>
                <span>Course ID: {selectedExam.courseId.toString()}</span>
                <span>Questions: {selectedExam.questionCount.toString()}</span>

                {drawerMode === "review" && examReviewData && (
                  <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 ring-1 ring-green-200">
                    Score: {examReviewData.totalScore.toString()}/
                    {examReviewData.maxScore.toString()}
                  </span>
                )}
              </div>
            </div>
          )}

          {(drawerMode === "review" ? isReviewLoading : isQuestionsLoading) ? (
            <p className="text-sm text-gray-500">
              {drawerMode === "review"
                ? "Loading exam review..."
                : "Loading questions..."}
            </p>
          ) : (drawerMode === "review" ? reviewError : questionsError) ? (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 ring-1 ring-red-200">
              {drawerMode === "review"
                ? "Failed to load exam review."
                : "Failed to load exam questions."}
            </div>
          ) : !questionTexts.length ? (
            <div className="rounded-xl border border-gray-200 bg-white px-4 py-6 text-sm text-gray-500">
              {drawerMode === "review"
                ? "No review data found for this exam."
                : "No questions found for this exam."}
            </div>
          ) : (
            <div className="space-y-4">
              {questionTexts.map((question, questionIndex) => (
                <div
                  key={questionIndex}
                  className="rounded-2xl border border-gray-200 bg-white p-4"
                >
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-[#E36A6A]">
                      Question {questionIndex + 1}
                    </h3>

                    <p className="text-sm text-gray-800">{question}</p>

                    <div className="space-y-2">
                      {questionOptions[questionIndex]?.map(
                        (option, optionIndex) => {
                          const isAnswerMode = drawerMode === "answer";
                          const isSelected =
                            selectedAnswers[questionIndex] === optionIndex;

                          const correctAnswerIndex = Number(
                            reviewCorrectAnswers[questionIndex] ?? -1,
                          );
                          const studentAnswerIndex = Number(
                            reviewStudentAnswers[questionIndex] ?? -1,
                          );

                          const isCorrectOption =
                            drawerMode === "review" &&
                            optionIndex === correctAnswerIndex;

                          const isStudentOption =
                            drawerMode === "review" &&
                            optionIndex === studentAnswerIndex;

                          const studentGotThisQuestionCorrect = Boolean(
                            reviewIsCorrect[questionIndex],
                          );

                          return (
                            <button
                              key={optionIndex}
                              type="button"
                              onClick={() =>
                                handleSelectAnswer(questionIndex, optionIndex)
                              }
                              disabled={
                                drawerMode === "review" ||
                                !isStudent ||
                                !canTakeSelectedExam ||
                                isSubmitting
                              }
                              className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition ${
                                isAnswerMode
                                  ? isStudent && canTakeSelectedExam
                                    ? isSelected
                                      ? "border-[#E36A6A] bg-[#FFF1F1] text-[#E36A6A]"
                                      : "border-gray-200 bg-[#FFFBF1] text-gray-800 hover:border-[#E36A6A]"
                                    : "cursor-not-allowed border-gray-200 bg-[#F5F5F5] text-gray-500 opacity-90"
                                  : isCorrectOption && isStudentOption
                                    ? "border-green-500 bg-green-50 text-green-800"
                                    : isCorrectOption
                                      ? "border-green-500 bg-green-50 text-green-800"
                                      : isStudentOption &&
                                          !studentGotThisQuestionCorrect
                                        ? "border-red-400 bg-red-50 text-red-700"
                                        : "border-gray-200 bg-[#FFFBF1] text-gray-800"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <span className="font-medium">
                                    Option {optionIndex + 1}:
                                  </span>{" "}
                                  {option}
                                </div>

                                {drawerMode === "review" && (
                                  <div className="flex shrink-0 flex-wrap gap-2">
                                    {isCorrectOption && (
                                      <span className="rounded-full bg-green-100 px-2.5 py-1 text-[11px] font-semibold text-green-700">
                                        Correct Answer
                                      </span>
                                    )}

                                    {isStudentOption && (
                                      <span
                                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                          studentGotThisQuestionCorrect
                                            ? "bg-[#FDEAEA] text-[#E36A6A]"
                                            : "bg-red-100 text-red-700"
                                        }`}
                                      >
                                        Student Selected
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </button>
                          );
                        },
                      )}
                    </div>
                    {drawerMode === "review" && (
                      <div className="rounded-xl bg-[#FFFBF1] px-4 py-3 text-sm ring-1 ring-black/5">
                        <div className="flex flex-wrap gap-3 text-xs font-medium">
                          <span className="rounded-full bg-green-100 px-2.5 py-1 text-green-700">
                            Correct Answer: Option{" "}
                            {Number(reviewCorrectAnswers[questionIndex] ?? -1) +
                              1}
                          </span>

                          <span
                            className={`rounded-full px-2.5 py-1 ${
                              reviewIsCorrect[questionIndex]
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            Student Picked: Option{" "}
                            {Number(reviewStudentAnswers[questionIndex] ?? -1) +
                              1}
                          </span>

                          <span
                            className={`rounded-full px-2.5 py-1 ${
                              reviewIsCorrect[questionIndex]
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {reviewIsCorrect[questionIndex]
                              ? "Correct"
                              : "Wrong"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {(submitError || takeExamError) && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 ring-1 ring-red-200">
              {submitError || takeExamError?.message}
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-black/10 pt-4">
            <button
              onClick={closeExamDrawer}
              disabled={isSubmitting}
              className="rounded-xl cursor-pointer bg-white px-4 py-2.5 text-sm font-medium text-gray-700 ring-1 ring-black/10 disabled:opacity-50"
            >
              Close
            </button>

            {isStudent &&
              questionTexts.length > 0 &&
              drawerMode === "answer" && (
                <button
                  onClick={handleSubmitExam}
                  disabled={isSubmitting}
                  className="rounded-xl bg-[#E36A6A] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 disabled:opacity-50"
                >
                  {isTakeExamPending
                    ? "Confirm in Wallet..."
                    : isTakeExamConfirming
                      ? "Submitting..."
                      : "Submit Answers"}
                </button>
              )}
          </div>
        </div>
      </Drawer>
    </>
  );
};

export default Exams;
