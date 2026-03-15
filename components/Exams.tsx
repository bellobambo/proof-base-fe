"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Drawer } from "antd";
import { useAccount } from "wagmi";
import {
  useGetAllExams,
  useGetUser,
  useGetExamQuestions,
  useTakeExam,
  useGetExamsWithStatusForStudent,
  useGetExamReviewForStudent,
  UserRole,
} from "@/utils/useContractHooks";

type DrawerMode = "answer" | "review" | "score";

const Exams = () => {
  const { address } = useAccount();
  const { data: user } = useGetUser(address);
  const isStudent = user?.role === UserRole.STUDENT;

  const {
    data: allExams,
    isLoading: isAllExamsLoading,
    error: allExamsError,
  } = useGetAllExams();

  const {
    data: studentExamStatuses,
    isLoading: isStudentExamsLoading,
    error: studentExamsError,
  } = useGetExamsWithStatusForStudent(address, {
    query: { enabled: !!address && isStudent },
  });

  const [openDrawer, setOpenDrawer] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>("answer");
  const [selectedExamId, setSelectedExamId] = useState<bigint | null>(null);
  const [selectedExamTitle, setSelectedExamTitle] = useState("");
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [submitError, setSubmitError] = useState("");

  const {
    data: examQuestionsData,
    isLoading: isQuestionsLoading,
    error: questionsError,
  } = useGetExamQuestions(
    drawerMode === "answer" ? selectedExamId ?? undefined : undefined
  );

  const {
    data: examReviewData,
    isLoading: isReviewLoading,
    error: reviewError,
  } = useGetExamReviewForStudent(
    drawerMode === "review" || drawerMode === "score"
      ? selectedExamId ?? undefined
      : undefined
  );

  const {
    takeExam,
    isPending: isTakeExamPending,
    isConfirming: isTakeExamConfirming,
    error: takeExamError,
  } = useTakeExam();

  const isLoading = isStudent ? isStudentExamsLoading : isAllExamsLoading;
  const error = isStudent ? studentExamsError : allExamsError;

  const displayedExams = useMemo(() => {
    if (isStudent) {
      return (studentExamStatuses ?? []).map((item) => item.exam);
    }
    return allExams ?? [];
  }, [isStudent, studentExamStatuses, allExams]);

  const selectedExam = useMemo(() => {
    if (selectedExamId === null) return null;
    return displayedExams.find((exam) => exam.examId === selectedExamId) ?? null;
  }, [displayedExams, selectedExamId]);

  const selectedStudentExamStatus = useMemo(() => {
    if (!isStudent || selectedExamId === null) return null;
    return (
      studentExamStatuses.find((item) => item.exam.examId === selectedExamId) ??
      null
    );
  }, [isStudent, studentExamStatuses, selectedExamId]);

  const questionTexts =
    drawerMode === "answer"
      ? examQuestionsData?.questionTexts ?? []
      : examReviewData?.questionTexts ?? [];

  const questionOptions =
    drawerMode === "answer"
      ? examQuestionsData?.questionOptions ?? []
      : examReviewData?.questionOptions ?? [];

  const isSubmitting = isTakeExamPending || isTakeExamConfirming;

  useEffect(() => {
    if (openDrawer && drawerMode === "answer" && questionTexts.length) {
      setSelectedAnswers(new Array(questionTexts.length).fill(-1));
    }
  }, [openDrawer, drawerMode, questionTexts.length]);

  const openExamDrawer = (
    examId: bigint,
    examTitle: string,
    mode: DrawerMode
  ) => {
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
    if (!isStudent || drawerMode !== "answer") return;

    setSelectedAnswers((prev) => {
      const next = [...prev];
      next[questionIndex] = optionIndex;
      return next;
    });
  };

  const handleSubmitExam = () => {
    if (!isStudent || selectedExamId === null || drawerMode !== "answer") return;

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
      selectedAnswers.map((answer) => BigInt(answer))
    );
  };

  const drawerHeading = useMemo(() => {
    if (!isStudent) return "Exam Questions";
    if (drawerMode === "score") return "Exam Score";
    if (drawerMode === "review") return "Past Questions";
    return "Answer Exam";
  }, [isStudent, drawerMode]);

  const scorePercentage =
    examReviewData && Number(examReviewData.maxScore) > 0
      ? Math.round(
          (Number(examReviewData.totalScore) / Number(examReviewData.maxScore)) *
            100
        )
      : 0;

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
              Exams ({displayedExams?.length ?? 0})
            </h2>
          </div>
        </div>

        {!displayedExams?.length ? (
          <div className="rounded-2xl border border-gray-200 bg-[#FFFBF1] p-8 text-center shadow-sm">
            <p className="text-sm text-gray-500">No exams available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {displayedExams.map((exam) => {
              const studentStatus = isStudent
                ? studentExamStatuses.find(
                    (item) => item.exam.examId === exam.examId
                  )
                : null;

              const hasCompleted = !!studentStatus?.completionStatus;

              return (
                <div
                  key={exam.examId.toString()}
                  className="rounded-2xl border border-[#E36A6A] bg-[#FFFBF1] p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex min-h-[220px] flex-col justify-between">
                    <div className="space-y-3">
                      <h3 className="line-clamp-2 text-lg font-semibold text-[#E36A6A]">
                        {exam.title}
                      </h3>

                      <div className="space-y-1 text-sm text-gray-700">
                        <p>Exam ID: {exam.examId.toString()}</p>
                        <p>Course ID: {exam.courseId.toString()}</p>
                        <p>Questions: {exam.questionCount.toString()}</p>

                        {isStudent && hasCompleted && (
                          <p className="font-medium text-green-700">
                            Score: {studentStatus?.score.toString()}/
                            {exam.questionCount.toString()}
                          </p>
                        )}
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

                      {isStudent ? (
                        hasCompleted ? (
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              type="button"
                              onClick={() =>
                                openExamDrawer(exam.examId, exam.title, "review")
                              }
                              className="w-full cursor-pointer rounded-xl border border-[#E36A6A] bg-white px-4 py-2.5 text-sm font-semibold text-[#E36A6A] transition hover:bg-[#FFF1F1]"
                            >
                              Past Questions
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                openExamDrawer(exam.examId, exam.title, "score")
                              }
                              className="w-full cursor-pointer rounded-xl bg-[#E36A6A] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                            >
                              View Score
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              openExamDrawer(exam.examId, exam.title, "answer")
                            }
                            className="block w-full cursor-pointer rounded-xl bg-[#E36A6A] px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:opacity-90"
                          >
                            Answer Questions
                          </button>
                        )
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            openExamDrawer(exam.examId, exam.title, "review")
                          }
                          className="block w-full cursor-pointer rounded-xl bg-[#E36A6A] px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:opacity-90"
                        >
                          View Questions
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Drawer
        title={
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {drawerHeading}
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
              </div>
            </div>
          )}

          {drawerMode === "score" ? (
            isReviewLoading ? (
              <p className="text-sm text-gray-500">Loading score...</p>
            ) : reviewError ? (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 ring-1 ring-red-200">
                Failed to load score.
              </div>
            ) : !examReviewData ? (
              <div className="rounded-xl border border-gray-200 bg-white px-4 py-6 text-sm text-gray-500">
                No score found for this exam yet.
              </div>
            ) : (
              <div className="rounded-2xl border border-gray-200 bg-white p-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#E36A6A]">
                    Score Summary
                  </h3>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-xl bg-[#FFFBF1] p-4 ring-1 ring-black/5">
                      <p className="text-xs uppercase tracking-wide text-gray-500">
                        Score
                      </p>
                      <p className="mt-2 text-2xl font-bold text-[#E36A6A]">
                        {examReviewData.totalScore.toString()}
                      </p>
                    </div>

                    <div className="rounded-xl bg-[#FFFBF1] p-4 ring-1 ring-black/5">
                      <p className="text-xs uppercase tracking-wide text-gray-500">
                        Total Questions
                      </p>
                      <p className="mt-2 text-2xl font-bold text-[#E36A6A]">
                        {examReviewData.maxScore.toString()}
                      </p>
                    </div>

                    <div className="rounded-xl bg-[#FFFBF1] p-4 ring-1 ring-black/5">
                      <p className="text-xs uppercase tracking-wide text-gray-500">
                        Percentage
                      </p>
                      <p className="mt-2 text-2xl font-bold text-[#E36A6A]">
                        {scorePercentage}%
                      </p>
                    </div>
                  </div>

                  {isStudent && selectedStudentExamStatus?.completionStatus && (
                    <button
                      type="button"
                      onClick={() =>
                        openExamDrawer(
                          selectedStudentExamStatus.exam.examId,
                          selectedStudentExamStatus.exam.title,
                          "review"
                        )
                      }
                      className="rounded-xl border border-[#E36A6A] bg-white px-4 py-2.5 text-sm font-semibold text-[#E36A6A] transition hover:bg-[#FFF1F1]"
                    >
                      View Past Questions
                    </button>
                  )}
                </div>
              </div>
            )
          ) : drawerMode === "answer" ? (
            isQuestionsLoading ? (
              <p className="text-sm text-gray-500">Loading questions...</p>
            ) : questionsError ? (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 ring-1 ring-red-200">
                Failed to load exam questions.
              </div>
            ) : !questionTexts.length ? (
              <div className="rounded-xl border border-gray-200 bg-white px-4 py-6 text-sm text-gray-500">
                No questions found for this exam.
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
                            const isSelected =
                              selectedAnswers[questionIndex] === optionIndex;

                            return (
                              <button
                                key={optionIndex}
                                type="button"
                                onClick={() =>
                                  handleSelectAnswer(questionIndex, optionIndex)
                                }
                                disabled={!isStudent || isSubmitting}
                                className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition ${
                                  isSelected
                                    ? "border-[#E36A6A] bg-[#FFF1F1] text-[#E36A6A]"
                                    : "border-gray-200 bg-[#FFFBF1] text-gray-800 hover:border-[#E36A6A]"
                                } ${(!isStudent || isSubmitting) ? "opacity-90" : ""}`}
                              >
                                <span className="font-medium">
                                  Option {optionIndex + 1}:
                                </span>{" "}
                                {option}
                              </button>
                            );
                          }
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : isReviewLoading ? (
            <p className="text-sm text-gray-500">Loading past questions...</p>
          ) : reviewError ? (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 ring-1 ring-red-200">
              Failed to load exam review.
            </div>
          ) : !examReviewData?.questionTexts?.length ? (
            <div className="rounded-xl border border-gray-200 bg-white px-4 py-6 text-sm text-gray-500">
              No past questions found for this exam.
            </div>
          ) : (
            <div className="space-y-4">
              {examReviewData.questionTexts.map((question, questionIndex) => (
                <div
                  key={questionIndex}
                  className="rounded-2xl border border-gray-200 bg-white p-4"
                >
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-base font-semibold text-[#E36A6A]">
                        Question {questionIndex + 1}
                      </h3>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          examReviewData.isCorrect[questionIndex]
                            ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                            : "bg-red-50 text-red-700 ring-1 ring-red-200"
                        }`}
                      >
                        {examReviewData.isCorrect[questionIndex]
                          ? "Correct"
                          : "Wrong"}
                      </span>
                    </div>

                    <p className="text-sm text-gray-800">{question}</p>

                    <div className="space-y-2">
                      {examReviewData.questionOptions[questionIndex]?.map(
                        (option, optionIndex) => {
                          const correctIndex = Number(
                            examReviewData.correctAnswers[questionIndex]
                          );
                          const studentIndex = Number(
                            examReviewData.studentAnswers[questionIndex]
                          );

                          const isCorrectOption = optionIndex === correctIndex;
                          const isStudentOption = optionIndex === studentIndex;

                          let optionClass =
                            "border-gray-200 bg-[#FFFBF1] text-gray-800";

                          if (isCorrectOption) {
                            optionClass =
                              "border-green-300 bg-green-50 text-green-700";
                          } else if (isStudentOption && !isCorrectOption) {
                            optionClass = "border-red-300 bg-red-50 text-red-700";
                          }

                          return (
                            <div
                              key={optionIndex}
                              className={`w-full rounded-xl border px-4 py-3 text-left text-sm ${optionClass}`}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <span>
                                  <span className="font-medium">
                                    Option {optionIndex + 1}:
                                  </span>{" "}
                                  {option}
                                </span>

                                <div className="flex shrink-0 gap-2">
                                  {isStudentOption && (
                                    <span className="rounded-full bg-black/5 px-2 py-1 text-[11px] font-medium text-gray-700">
                                      Your Answer
                                    </span>
                                  )}
                                  {isCorrectOption && (
                                    <span className="rounded-full bg-green-100 px-2 py-1 text-[11px] font-medium text-green-700">
                                      Correct Answer
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {(submitError || takeExamError) && drawerMode === "answer" && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 ring-1 ring-red-200">
              {submitError || takeExamError?.message}
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-black/10 pt-4">
            <button
              onClick={closeExamDrawer}
              disabled={isSubmitting}
              className="cursor-pointer rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-gray-700 ring-1 ring-black/10 disabled:opacity-50"
            >
              Close
            </button>

            {isStudent && drawerMode === "answer" && questionTexts.length > 0 && (
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