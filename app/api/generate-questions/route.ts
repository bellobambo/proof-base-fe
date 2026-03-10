import { NextResponse } from "next/server";
import OpenAI from "openai";
import mammoth from "mammoth";

export const runtime = "nodejs";

type ParsedQuestion = {
  text: string;
  options: [string, string, string, string];
  correctAnswer: number;
};

type ParsedExam = {
  title: string;
  questions: ParsedQuestion[];
};

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const EXAM_SCHEMA = {
  name: "exam_payload",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      title: { type: "string" },
      questions: {
        type: "array",
        minItems: 1,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            text: { type: "string" },
            options: {
              type: "array",
              minItems: 4,
              maxItems: 4,
              items: { type: "string" },
            },
            correctAnswer: {
              type: "integer",
              minimum: 0,
              maximum: 3,
            },
          },
          required: ["text", "options", "correctAnswer"],
        },
      },
    },
    required: ["title", "questions"],
  },
};

async function extractTextFromFile(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const lowerName = file.name.toLowerCase();

  console.log("[exam-doc] extracting text", {
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
  });

  if (lowerName.endsWith(".docx")) {
    const result = await mammoth.extractRawText({ buffer });
    console.log("[exam-doc] extracted docx text", {
      characters: result.value.trim().length,
    });
    return result.value.trim();
  }

  const text = buffer.toString("utf-8").trim();
  console.log("[exam-doc] extracted plain text", {
    characters: text.length,
  });
  return text;
}

function normalizeExamShape(payload: any): ParsedExam {
  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid AI response.");
  }

  if (!payload.title || !Array.isArray(payload.questions)) {
    throw new Error("Missing exam title or questions.");
  }

  const questions: ParsedQuestion[] = payload.questions.map(
    (q: any, index: number) => {
      if (
        !q ||
        typeof q.text !== "string" ||
        !Array.isArray(q.options) ||
        q.options.length !== 4 ||
        typeof q.correctAnswer !== "number"
      ) {
        throw new Error(`Invalid question at index ${index + 1}.`);
      }

      return {
        text: q.text.trim(),
        options: [
          String(q.options[0] ?? "").trim(),
          String(q.options[1] ?? "").trim(),
          String(q.options[2] ?? "").trim(),
          String(q.options[3] ?? "").trim(),
        ],
        correctAnswer: q.correctAnswer,
      };
    }
  );

  console.log("[exam-doc] normalized exam payload", {
    title: String(payload.title).trim(),
    questionCount: questions.length,
  });

  return {
    title: String(payload.title).trim(),
    questions,
  };
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const file = formData.get("file");
    const mode = formData.get("mode");
    const examTitle = String(formData.get("examTitle") ?? "").trim();

    if (!(file instanceof File)) {
      console.warn("[exam-doc] request rejected: no file uploaded");
      return NextResponse.json(
        { error: "No file uploaded." },
        { status: 400 }
      );
    }

    if (mode !== "normalize" && mode !== "generate") {
      console.warn("[exam-doc] request rejected: invalid mode", { mode });
      return NextResponse.json(
        { error: "Invalid mode." },
        { status: 400 }
      );
    }

    console.log("[exam-doc] request received", {
      mode,
      examTitle: examTitle || null,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    });

    const extractedText = await extractTextFromFile(file);

    if (!extractedText) {
      console.warn("[exam-doc] text extraction failed: empty content", {
        fileName: file.name,
      });
      return NextResponse.json(
        { error: "Could not extract any text from the uploaded file." },
        { status: 400 }
      );
    }

    const truncatedText = extractedText.slice(0, 120000);

    console.log("[exam-doc] preparing OpenAI request", {
      mode,
      extractedCharacters: extractedText.length,
      sentCharacters: truncatedText.length,
      wasTruncated: extractedText.length > truncatedText.length,
    });

    const prompt =
      mode === "normalize"
        ? `
You will convert an uploaded exam/question document into strict JSON.

Rules:
- Return ONLY valid JSON matching the schema.
- Convert the document into multiple-choice questions.
- Every question must have exactly 4 options.
- correctAnswer must be the zero-based index of the correct option.
- If the file already contains answers, map them correctly.
- If the file contains questions and answers but not exactly 4 options, rewrite into 4-option MCQ form while preserving meaning.
- Use this title if provided: "${examTitle || "Uploaded Exam"}"
- If the document includes a better exam title, you may use it.
`
        : `
You will create a multiple-choice exam from lecture notes/slides.

Rules:
- Return ONLY valid JSON matching the schema.
- Generate clear, academically reasonable MCQs from the material.
- Every question must have exactly 4 plausible options.
- correctAnswer must be the zero-based index of the correct option.
- Avoid duplicate questions.
- Prefer direct knowledge checks, definitions, concepts, and applied understanding.
- Use this title if provided: "${examTitle || "AI Generated Exam"}"
- Generate between 5 and 15 questions depending on the material depth.
`;

    const response = await client.responses.create({
      model: "gpt-5-mini",
      temperature: 0.2,
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: "You are a strict exam parser and exam generator.",
            },
          ],
        },
        {
          role: "user",
          content: [
            { type: "input_text", text: prompt },
            {
              type: "input_text",
              text: `DOCUMENT CONTENT:\n\n${truncatedText}`,
            },
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          ...EXAM_SCHEMA,
        },
      },
    });

    const raw = response.output_text;

    console.log("[exam-doc] OpenAI response received", {
      outputLength: raw.length,
    });

    const parsed = JSON.parse(raw);
    const normalized = normalizeExamShape(parsed);

    console.log("[exam-doc] request completed successfully", {
      title: normalized.title,
      questionCount: normalized.questions.length,
      mode,
    });

    return NextResponse.json(normalized);
  } catch (error) {
    console.error("[exam-doc] route error", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to process uploaded document.",
      },
      { status: 500 }
    );
  }
}