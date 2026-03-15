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

type DrawerMode = "answer" | "review";

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
    data: studentExamsWithStatus,
    isLoading: isStudentExamsLoading,
    error: studentExamsError,
  } = useGetExamsWithStatusForStudent(address, {
    query: { enabled: !!address && isStudent },
  });

  const examsToRender = useMemo(() => {
    if (isStudent) {
      return studentExamsWithStatus ?? [];
    }

    return (allExams ?? []).map((exam) => ({
      exam,
      completionStatus: false,
      score: BigInt(0),
    }));
  }, [isStudent, studentExamsWithStatus, allExams]);

  const isLoading = isStudent ? isStudentExamsLoading : isAllExamsLoading;
  const error = isStudent ? studentExamsError : allExamsError;

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
    data: reviewData,
    isLoading: isReviewLoading,
    error: reviewError,
  } = useGetExamReviewForStudent(
    drawerMode === "review" ? selectedExamId ?? undefined : undefined
  );

  const {
    takeExam,
    isPending: isTakeExamPending,
    isConfirming: isTakeExamConfirming,
    error: takeExamError,
  } = useTakeExam();

  const questionTexts = examQuestionsData?.questionTexts ?? [];
  const questionOptions = examQuestionsData?.questionOptions ?? [];

  const isSubmitting = isTakeExamPending || isTakeExamConfirming;

  const selectedExamStatus = useMemo(() => {
    if (selectedExamId === null) return null;

    return (
      examsToRender.find((item) => item.exam.examId === selectedExamId) ?? null
    );
  }, [examsToRender, selectedExamId]);

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

  if (isLoading) {
    return (
      <div className="mx-auto mt-10 max-w-6xl p-6">
        <p className="text-sm text-gray-500">Loading exams...</p>
      </div>
    );
  }

  if (error) {
    console.error("FAILED TO LOAD EXAMS:", error);

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
              Exams ({examsToRender.length})
            </h2>
          </div>
        </div>

        {!examsToRender.length ? (
          <div className="rounded-2xl border border-gray-200 bg-[#FFFBF1] p-8 text-center shadow-sm">
            <p className="text-sm text-gray-500">No exams available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {examsToRender.map(({ exam, completionStatus, score }) => {
              const hasTakenExam = isStudent && completionStatus;

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

                        {isStudent && hasTakenExam && (
                          <p className="font-semibold text-green-700">
                            Score: {score.toString()} / {exam.questionCount.toString()}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 space-y-3 border-t border-gray-200 pt-4">
                      <div className="flex items-center justify-between">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${exam.isActive
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

                      {!isStudent ? (
                        <button
                          type="button"
                          onClick={() =>
                            openExamDrawer(exam.examId, exam.title, "review")
                          }
                          className="block w-full cursor-pointer rounded-xl bg-[#E36A6A] px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:opacity-90"
                        >
                          View Questions
                        </button>
                      ) : hasTakenExam ? (
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 rounded-xl bg-green-50 px-4 py-2.5 text-center text-sm font-medium text-green-700 ring-1 ring-green-200">
                            Exam completed
                          </div>

                          <button
                            type="button"
                            onClick={() => openExamDrawer(exam.examId, exam.title, "review")}
                            className="shrink-0 cursor-pointer rounded-xl bg-[#E36A6A] px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:opacity-90"
                          >
                            View Past Questions
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
              {drawerMode === "review"
                ? isStudent
                  ? "Past Questions"
                  : "Exam Questions"
                : "Answer Exam"}
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
          {selectedExamStatus && (
            <div className="rounded-2xl border border-gray-200 bg-white p-4">
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-700">
                <span>Exam ID: {selectedExamStatus.exam.examId.toString()}</span>
                <span>Course ID: {selectedExamStatus.exam.courseId.toString()}</span>
                <span>
                  Questions: {selectedExamStatus.exam.questionCount.toString()}
                </span>

                {isStudent && selectedExamStatus.completionStatus && (
                  <span className="font-semibold text-green-700">
                    Score: {selectedExamStatus.score.toString()} /{" "}
                    {selectedExamStatus.exam.questionCount.toString()}
                  </span>
                )}
              </div>
            </div>
          )}

          {drawerMode === "answer" ? (
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
                        {questionOptions[questionIndex]?.map((option, optionIndex) => {
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
                              className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition ${isSelected
                                ? "border-[#E36A6A] bg-[#FFF1F1] text-[#E36A6A]"
                                : "border-gray-200 bg-[#FFFBF1] text-gray-800 hover:border-[#E36A6A]"
                                } ${isSubmitting ? "opacity-90" : ""}`}
                            >
                              <span className="font-medium">
                                Option {optionIndex + 1}:
                              </span>{" "}
                              {option}
                            </button>
                          );
                        })}
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
              Failed to load past questions.
            </div>
          ) : !reviewData?.questionTexts?.length ? (
            <div className="rounded-xl border border-gray-200 bg-white px-4 py-6 text-sm text-gray-500">
              No review data found for this exam.
            </div>
          ) : (
            <div className="space-y-4">
              {reviewData.questionTexts.map((question, questionIndex) => {
                const studentAnswerIndex = Number(
                  reviewData.studentAnswers[questionIndex] ?? BigInt(-1)
                );

                const correctAnswerIndex = Number(
                  reviewData.correctAnswers[questionIndex] ?? BigInt(-1)
                );
                const isCorrect = reviewData.isCorrect[questionIndex];

                return (
                  <div
                    key={questionIndex}
                    className="rounded-2xl border border-gray-200 bg-white p-4"
                  >
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-base font-semibold text-[#E36A6A]">
                          Question {questionIndex + 1}
                        </h3>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${isCorrect
                            ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                            : "bg-red-50 text-red-700 ring-1 ring-red-200"
                            }`}
                        >
                          {isCorrect ? "Correct" : "Wrong"}
                        </span>
                      </div>

                      <p className="text-sm text-gray-800">{question}</p>

                      <div className="space-y-2">
                        {reviewData.questionOptions[questionIndex]?.map(
                          (option, optionIndex) => {
                            const isStudentChoice =
                              studentAnswerIndex === optionIndex;
                            const isCorrectChoice =
                              correctAnswerIndex === optionIndex;

                            return (
                              <div
                                key={optionIndex}
                                className={`w-full rounded-xl border px-4 py-3 text-left text-sm ${isCorrectChoice
                                  ? "border-green-300 bg-green-50 text-green-800"
                                  : isStudentChoice && !isCorrectChoice
                                    ? "border-red-300 bg-red-50 text-red-800"
                                    : "border-gray-200 bg-[#FFFBF1] text-gray-800"
                                  }`}
                              >
                                <div>
                                  <span className="font-medium">
                                    Option {optionIndex + 1}:
                                  </span>{" "}
                                  {option}
                                </div>

                                <div className="mt-1 flex flex-wrap gap-2 text-xs font-medium">
                                  {isStudentChoice && (
                                    <span className="rounded-full bg-black/5 px-2 py-1 text-gray-700">
                                      Your answer
                                    </span>
                                  )}
                                  {isCorrectChoice && (
                                    <span className="rounded-full bg-green-100 px-2 py-1 text-green-700">
                                      Correct answer
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          }
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
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
              className="rounded-xl cursor-pointer bg-white px-4 py-2.5 text-sm font-medium text-gray-700 ring-1 ring-black/10 disabled:opacity-50"
            >
              Close
            </button>

            {isStudent &&
              drawerMode === "answer" &&
              questionTexts.length > 0 &&
              !selectedExamStatus?.completionStatus && (
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