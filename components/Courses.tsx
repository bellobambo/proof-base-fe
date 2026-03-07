"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import {
  useCreateCourse,
  useGetAllCourses,
  useGetUser,
  UserRole,
} from "@/utils/useContractHooks";

export default function Courses() {
  const { address } = useAccount();
  const { data: user } = useGetUser(address);

  const { createCourse, isPending } = useCreateCourse();
  const { data: courses } = useGetAllCourses();

  const [title, setTitle] = useState("");
  const [showModal, setShowModal] = useState(false);

  const isTutor = user?.role === UserRole.TUTOR;

  const handleCreate = () => {
    const trimmed = title.trim();
    if (!trimmed) return;

    createCourse(trimmed);
    setTitle("");
    setShowModal(false);
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Courses</h2>

        {isTutor && (
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-[#E36A6A] text-white rounded shadow hover:opacity-90"
          >
            + Create Course
          </button>
        )}
      </div>

      {/* COURSE LIST */}
      <div className="p-6   rounded-lg">
        <div className="space-y-3 text-center">
          {courses?.length === 0 && (
            <p className="text-gray-500">No courses yet</p>
          )}

          {courses?.map((course) => (
            <div
              key={course.courseId.toString()}
              className="p-4 border rounded flex justify-between"
            >
              <div>
                <p className="font-medium">{course.title}</p>
                <p className="text-sm text-gray-500">
                  Lecturer: {course.tutorName}
                </p>
              </div>

              <span className="text-sm text-gray-400">
                ID: {course.courseId.toString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          
          <div className="bg-white rounded-lg shadow-lg w-[400px] p-6 space-y-4">
            
            <h2 className="text-lg font-semibold">Create Course</h2>

            <input
              type="text"
              placeholder="Course title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />

            <div className="flex justify-end gap-3">
              
              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-2 border rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleCreate}
                disabled={isPending}
                className="px-4 py-2 bg-[#E36A6A] text-white rounded"
              >
                {isPending ? "Creating..." : "Create"}
              </button>

            </div>
          </div>

        </div>
      )}
    </div>
  );
}