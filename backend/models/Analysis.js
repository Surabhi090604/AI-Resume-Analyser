import mongoose from 'mongoose';

const ExperienceSchema = new mongoose.Schema(
  {
    role: String,
    company: String,
    duration: String,
    summary: String
  },
  { _id: false }
);

const EducationSchema = new mongoose.Schema(
  {
    institution: String,
    degree: String,
    year: String
  },
  { _id: false }
);

const ProjectSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    impact: String
  },
  { _id: false }
);

const ResultSchema = new mongoose.Schema(
  {
    ats_score: Number,
    readability_score: Number,
    section_completeness: Number,
    skills_match_score: Number,
    wordCount: Number,
    keyword_summary: {
      matched: [String],
      missing: [String]
    },
    extracted: {
      skills: [String],
      experience: [ExperienceSchema],
      education: [EducationSchema],
      projects: [ProjectSchema]
    },
    strengths: [String],
    weaknesses: [String],
    recommendations: [String],
    summary: String,
    mock: { type: Boolean, default: false }
  },
  { _id: false }
);

const AnalysisSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    filename: String,
    mimetype: String,
    extractedText: String,
    jobDescription: String,
    result: ResultSchema,
    meta: {
      wordCount: Number,
      charCount: Number,
      uploadedAt: { type: Date, default: Date.now },
      lastAnalyzedAt: Date
    },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

AnalysisSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.Analysis || mongoose.model('Analysis', AnalysisSchema);
