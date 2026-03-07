export const PROOF_BASE_ADDRESS = '0x08758DDAbA20d43C1Ead2c9753939755177D25B0' as const;

export const PROOF_BASE_ABI = [
    {
      "type": "function",
      "name": "courseCounter",
      "inputs": [],
      "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "courseEnrollments",
      "inputs": [
        { "name": "", "type": "uint256", "internalType": "uint256" },
        { "name": "", "type": "address", "internalType": "address" }
      ],
      "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "courseExams",
      "inputs": [
        { "name": "", "type": "uint256", "internalType": "uint256" },
        { "name": "", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "courses",
      "inputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "outputs": [
        { "name": "courseId", "type": "uint256", "internalType": "uint256" },
        { "name": "title", "type": "string", "internalType": "string" },
        { "name": "tutor", "type": "address", "internalType": "address" },
        { "name": "tutorName", "type": "string", "internalType": "string" },
        { "name": "isActive", "type": "bool", "internalType": "bool" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "createCourse",
      "inputs": [
        { "name": "title", "type": "string", "internalType": "string" }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "createExam",
      "inputs": [
        { "name": "courseId", "type": "uint256", "internalType": "uint256" },
        { "name": "title", "type": "string", "internalType": "string" },
        {
          "name": "questionTexts",
          "type": "string[]",
          "internalType": "string[]"
        },
        {
          "name": "questionOptions",
          "type": "string[4][]",
          "internalType": "string[4][]"
        },
        {
          "name": "correctAnswers_",
          "type": "uint256[]",
          "internalType": "uint256[]"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "enrollInCourse",
      "inputs": [
        { "name": "courseId", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "examCorrectAnswers",
      "inputs": [
        { "name": "", "type": "uint256", "internalType": "uint256" },
        { "name": "", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "examCounter",
      "inputs": [],
      "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "examOptions",
      "inputs": [
        { "name": "", "type": "uint256", "internalType": "uint256" },
        { "name": "", "type": "uint256", "internalType": "uint256" },
        { "name": "", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [{ "name": "", "type": "string", "internalType": "string" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "examQuestions",
      "inputs": [
        { "name": "", "type": "uint256", "internalType": "uint256" },
        { "name": "", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [{ "name": "", "type": "string", "internalType": "string" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "examSessions",
      "inputs": [
        { "name": "", "type": "uint256", "internalType": "uint256" },
        { "name": "", "type": "address", "internalType": "address" }
      ],
      "outputs": [
        { "name": "examId", "type": "uint256", "internalType": "uint256" },
        { "name": "student", "type": "address", "internalType": "address" },
        { "name": "score", "type": "uint256", "internalType": "uint256" },
        { "name": "isCompleted", "type": "bool", "internalType": "bool" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "exams",
      "inputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "outputs": [
        { "name": "examId", "type": "uint256", "internalType": "uint256" },
        { "name": "courseId", "type": "uint256", "internalType": "uint256" },
        { "name": "title", "type": "string", "internalType": "string" },
        {
          "name": "questionCount",
          "type": "uint256",
          "internalType": "uint256"
        },
        { "name": "isActive", "type": "bool", "internalType": "bool" },
        { "name": "creator", "type": "address", "internalType": "address" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getAllCourses",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "tuple[]",
          "internalType": "struct ProofBase.Course[]",
          "components": [
            {
              "name": "courseId",
              "type": "uint256",
              "internalType": "uint256"
            },
            { "name": "title", "type": "string", "internalType": "string" },
            { "name": "tutor", "type": "address", "internalType": "address" },
            { "name": "tutorName", "type": "string", "internalType": "string" },
            { "name": "isActive", "type": "bool", "internalType": "bool" }
          ]
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getAllExams",
      "inputs": [],
      "outputs": [
        {
          "name": "",
          "type": "tuple[]",
          "internalType": "struct ProofBase.Exam[]",
          "components": [
            { "name": "examId", "type": "uint256", "internalType": "uint256" },
            {
              "name": "courseId",
              "type": "uint256",
              "internalType": "uint256"
            },
            { "name": "title", "type": "string", "internalType": "string" },
            {
              "name": "questionCount",
              "type": "uint256",
              "internalType": "uint256"
            },
            { "name": "isActive", "type": "bool", "internalType": "bool" },
            { "name": "creator", "type": "address", "internalType": "address" }
          ]
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getAvailableExamsForStudent",
      "inputs": [
        { "name": "student", "type": "address", "internalType": "address" }
      ],
      "outputs": [
        {
          "name": "",
          "type": "tuple[]",
          "internalType": "struct ProofBase.Exam[]",
          "components": [
            { "name": "examId", "type": "uint256", "internalType": "uint256" },
            {
              "name": "courseId",
              "type": "uint256",
              "internalType": "uint256"
            },
            { "name": "title", "type": "string", "internalType": "string" },
            {
              "name": "questionCount",
              "type": "uint256",
              "internalType": "uint256"
            },
            { "name": "isActive", "type": "bool", "internalType": "bool" },
            { "name": "creator", "type": "address", "internalType": "address" }
          ]
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getCorrectAnswersForStudent",
      "inputs": [
        { "name": "examId", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [
        { "name": "", "type": "uint256[]", "internalType": "uint256[]" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getCourse",
      "inputs": [
        { "name": "courseId", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [
        {
          "name": "",
          "type": "tuple",
          "internalType": "struct ProofBase.Course",
          "components": [
            {
              "name": "courseId",
              "type": "uint256",
              "internalType": "uint256"
            },
            { "name": "title", "type": "string", "internalType": "string" },
            { "name": "tutor", "type": "address", "internalType": "address" },
            { "name": "tutorName", "type": "string", "internalType": "string" },
            { "name": "isActive", "type": "bool", "internalType": "bool" }
          ]
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getCourseWithLecturer",
      "inputs": [
        { "name": "courseId", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [
        { "name": "id", "type": "uint256", "internalType": "uint256" },
        { "name": "title", "type": "string", "internalType": "string" },
        { "name": "tutor", "type": "address", "internalType": "address" },
        { "name": "tutorName", "type": "string", "internalType": "string" },
        { "name": "isActive", "type": "bool", "internalType": "bool" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getExam",
      "inputs": [
        { "name": "examId", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [
        {
          "name": "",
          "type": "tuple",
          "internalType": "struct ProofBase.Exam",
          "components": [
            { "name": "examId", "type": "uint256", "internalType": "uint256" },
            {
              "name": "courseId",
              "type": "uint256",
              "internalType": "uint256"
            },
            { "name": "title", "type": "string", "internalType": "string" },
            {
              "name": "questionCount",
              "type": "uint256",
              "internalType": "uint256"
            },
            { "name": "isActive", "type": "bool", "internalType": "bool" },
            { "name": "creator", "type": "address", "internalType": "address" }
          ]
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getExamAnswersComparison",
      "inputs": [
        { "name": "examId", "type": "uint256", "internalType": "uint256" },
        { "name": "student", "type": "address", "internalType": "address" }
      ],
      "outputs": [
        {
          "name": "correctAnswers_",
          "type": "uint256[]",
          "internalType": "uint256[]"
        },
        {
          "name": "studentAnswers",
          "type": "uint256[]",
          "internalType": "uint256[]"
        },
        { "name": "isCorrect", "type": "bool[]", "internalType": "bool[]" },
        { "name": "isCompleted", "type": "bool", "internalType": "bool" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getExamCorrectAnswers",
      "inputs": [
        { "name": "examId", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [
        { "name": "", "type": "uint256[]", "internalType": "uint256[]" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getExamQuestions",
      "inputs": [
        { "name": "examId", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [
        {
          "name": "questionTexts",
          "type": "string[]",
          "internalType": "string[]"
        },
        {
          "name": "questionOptions",
          "type": "string[4][]",
          "internalType": "string[4][]"
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getExamResults",
      "inputs": [
        { "name": "examId", "type": "uint256", "internalType": "uint256" },
        { "name": "student", "type": "address", "internalType": "address" }
      ],
      "outputs": [
        { "name": "rawScore", "type": "uint256", "internalType": "uint256" },
        { "name": "answers", "type": "uint256[]", "internalType": "uint256[]" },
        { "name": "isCompleted", "type": "bool", "internalType": "bool" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getExamReviewForStudent",
      "inputs": [
        { "name": "examId", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [
        {
          "name": "questionTexts",
          "type": "string[]",
          "internalType": "string[]"
        },
        {
          "name": "questionOptions",
          "type": "string[4][]",
          "internalType": "string[4][]"
        },
        {
          "name": "correctAnswers_",
          "type": "uint256[]",
          "internalType": "uint256[]"
        },
        {
          "name": "studentAnswers",
          "type": "uint256[]",
          "internalType": "uint256[]"
        },
        { "name": "isCorrect", "type": "bool[]", "internalType": "bool[]" },
        { "name": "totalScore", "type": "uint256", "internalType": "uint256" },
        { "name": "maxScore", "type": "uint256", "internalType": "uint256" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getExamsForCourse",
      "inputs": [
        { "name": "courseId", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [
        { "name": "", "type": "uint256[]", "internalType": "uint256[]" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getExamsWithStatusForStudent",
      "inputs": [
        { "name": "student", "type": "address", "internalType": "address" }
      ],
      "outputs": [
        {
          "name": "availableExams",
          "type": "tuple[]",
          "internalType": "struct ProofBase.Exam[]",
          "components": [
            { "name": "examId", "type": "uint256", "internalType": "uint256" },
            {
              "name": "courseId",
              "type": "uint256",
              "internalType": "uint256"
            },
            { "name": "title", "type": "string", "internalType": "string" },
            {
              "name": "questionCount",
              "type": "uint256",
              "internalType": "uint256"
            },
            { "name": "isActive", "type": "bool", "internalType": "bool" },
            { "name": "creator", "type": "address", "internalType": "address" }
          ]
        },
        {
          "name": "completionStatus",
          "type": "bool[]",
          "internalType": "bool[]"
        },
        { "name": "scores", "type": "uint256[]", "internalType": "uint256[]" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getStudentExamScore",
      "inputs": [
        { "name": "examId", "type": "uint256", "internalType": "uint256" },
        { "name": "student", "type": "address", "internalType": "address" }
      ],
      "outputs": [
        { "name": "rawScore", "type": "uint256", "internalType": "uint256" },
        { "name": "isCompleted", "type": "bool", "internalType": "bool" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getUser",
      "inputs": [
        { "name": "userAddress", "type": "address", "internalType": "address" }
      ],
      "outputs": [
        {
          "name": "",
          "type": "tuple",
          "internalType": "struct ProofBase.User",
          "components": [
            { "name": "name", "type": "string", "internalType": "string" },
            {
              "name": "role",
              "type": "uint8",
              "internalType": "enum ProofBase.Role"
            },
            { "name": "isRegistered", "type": "bool", "internalType": "bool" }
          ]
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "hasCompletedExam",
      "inputs": [
        { "name": "examId", "type": "uint256", "internalType": "uint256" },
        { "name": "student", "type": "address", "internalType": "address" }
      ],
      "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "isEnrolledInCourse",
      "inputs": [
        { "name": "courseId", "type": "uint256", "internalType": "uint256" },
        { "name": "student", "type": "address", "internalType": "address" }
      ],
      "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "isUserRegistered",
      "inputs": [
        { "name": "userAddress", "type": "address", "internalType": "address" }
      ],
      "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "registerUser",
      "inputs": [
        { "name": "name", "type": "string", "internalType": "string" },
        {
          "name": "role",
          "type": "uint8",
          "internalType": "enum ProofBase.Role"
        }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "registeredUsers",
      "inputs": [{ "name": "", "type": "address", "internalType": "address" }],
      "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "takeExam",
      "inputs": [
        { "name": "examId", "type": "uint256", "internalType": "uint256" },
        { "name": "answers", "type": "uint256[]", "internalType": "uint256[]" }
      ],
      "outputs": [
        { "name": "rawScore", "type": "uint256", "internalType": "uint256" }
      ],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "users",
      "inputs": [{ "name": "", "type": "address", "internalType": "address" }],
      "outputs": [
        { "name": "name", "type": "string", "internalType": "string" },
        {
          "name": "role",
          "type": "uint8",
          "internalType": "enum ProofBase.Role"
        },
        { "name": "isRegistered", "type": "bool", "internalType": "bool" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "event",
      "name": "CourseCreated",
      "inputs": [
        {
          "name": "courseId",
          "type": "uint256",
          "indexed": true,
          "internalType": "uint256"
        },
        {
          "name": "title",
          "type": "string",
          "indexed": false,
          "internalType": "string"
        },
        {
          "name": "tutor",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "EnrollmentCreated",
      "inputs": [
        {
          "name": "student",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "courseId",
          "type": "uint256",
          "indexed": true,
          "internalType": "uint256"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "ExamCompleted",
      "inputs": [
        {
          "name": "examId",
          "type": "uint256",
          "indexed": true,
          "internalType": "uint256"
        },
        {
          "name": "student",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "score",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "ExamCreated",
      "inputs": [
        {
          "name": "examId",
          "type": "uint256",
          "indexed": true,
          "internalType": "uint256"
        },
        {
          "name": "courseId",
          "type": "uint256",
          "indexed": true,
          "internalType": "uint256"
        },
        {
          "name": "title",
          "type": "string",
          "indexed": false,
          "internalType": "string"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "UserRegistered",
      "inputs": [
        {
          "name": "user",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "name",
          "type": "string",
          "indexed": false,
          "internalType": "string"
        },
        {
          "name": "role",
          "type": "uint8",
          "indexed": false,
          "internalType": "enum ProofBase.Role"
        }
      ],
      "anonymous": false
    }
  ] as const;