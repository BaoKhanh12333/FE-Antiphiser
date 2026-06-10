import { useState, useEffect, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Highlight from "@tiptap/extension-highlight";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import Placeholder from "@tiptap/extension-placeholder";
import { phaseService } from "../../services/phaseService";
import { lessonService } from "../../services/lessonService";
import {
  Shield, Lock, Mail, AlertTriangle, Eye, Search, Globe, Smartphone,
  Database, Zap, Star, BookOpen, Target, Award, Brain, Layers,
  ChevronDown, ChevronRight, Plus, ArrowLeft, Save, Loader2,
  CheckCircle, AlertCircle, Image as ImageIcon, Link as LinkIcon,
  Bold, Italic, UnderlineIcon, Strikethrough, List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Heading1, Heading2, Heading3, Minus, Undo, Redo,
  Edit3, FolderPlus, FilePlus, Palette,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface LessonSummary  { lessonId: number; title: string; orderIndex: number; isActive: boolean }
interface ModuleSummary  { moduleId: number; moduleName: string; orderIndex: number; isActive: boolean; lessonCount: number; lessons: LessonSummary[] }
interface PhaseDetail    { phaseId: number; phaseName: string; description?: string; orderIndex: number; isActive: boolean; color?: string; icon?: string; moduleCount: number; lessonCount: number; modules: ModuleSummary[] }

// ─── Preset palettes ──────────────────────────────────────────────────────────
const COLORS = [
  "#6366F1","#8B5CF6","#EC4899","#EF4444","#F97316",
  "#F59E0B","#10B981","#14B8A6","#3B82F6","#06B6D4",
];
const ICONS: { name: string; Icon: React.ElementType }[] = [
  { name: "Shield",        Icon: Shield },
  { name: "Lock",          Icon: Lock },
  { name: "Mail",          Icon: Mail },
  { name: "AlertTriangle", Icon: AlertTriangle },
  { name: "Eye",           Icon: Eye },
  { name: "Search",        Icon: Search },
  { name: "Globe",         Icon: Globe },
  { name: "Smartphone",    Icon: Smartphone },
  { name: "Database",      Icon: Database },
  { name: "Zap",           Icon: Zap },
  { name: "Star",          Icon: Star },
  { name: "BookOpen",      Icon: BookOpen },
  { name: "Target",        Icon: Target },
  { name: "Award",         Icon: Award },
  { name: "Brain",         Icon: Brain },
  { name: "Layers",        Icon: Layers },
];
function getIconComponent(name?: string): React.ElementType {
  return ICONS.find(i => i.name === name)?.Icon ?? Shield;
}

// ─── Toolbar button ────────────────────────────────────────────────────────────
function TB({ onClick, active, disabled, title, children }: {
  onClick: () => void; active?: boolean; disabled?: boolean; title?: string; children: React.ReactNode
}) {
  return (
    <button
      onMouseDown={e => { e.preventDefault(); onClick(); }}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded transition-all ${
        active
          ? "bg-indigo-100 text-indigo-700"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
      } disabled:opacity-30`}
    >
      {children}
    </button>
  );
}

// ─── TipTap Toolbar ───────────────────────────────────────────────────────────
function Toolbar({ editor }: { editor: ReturnType<typeof useEditor> }) {
  const [imgUrl, setImgUrl] = useState("");
  const [showImgInput, setShowImgInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);

  if (!editor) return null;

  const insertImage = () => {
    if (imgUrl.trim()) {
      editor.chain().focus().setImage({ src: imgUrl.trim() }).run();
      setImgUrl(""); setShowImgInput(false);
    }
  };
  const setLink = () => {
    if (linkUrl.trim()) {
      editor.chain().focus().setLink({ href: linkUrl.trim() }).run();
      setLinkUrl(""); setShowLinkInput(false);
    }
  };

  return (
    <div className="border border-slate-200 rounded-t-xl bg-white px-2 py-1.5 flex flex-wrap items-center gap-0.5">
      {/* Undo/Redo */}
      <TB onClick={() => editor.chain().focus().undo().run()} title="Hoàn tác"><Undo size={15}/></TB>
      <TB onClick={() => editor.chain().focus().redo().run()} title="Làm lại"><Redo size={15}/></TB>
      <div className="w-px h-5 bg-slate-200 mx-1" />

      {/* Headings */}
      <TB onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} title="Heading 1"><Heading1 size={15}/></TB>
      <TB onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Heading 2"><Heading2 size={15}/></TB>
      <TB onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="Heading 3"><Heading3 size={15}/></TB>
      <div className="w-px h-5 bg-slate-200 mx-1" />

      {/* Inline format */}
      <TB onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Đậm"><Bold size={15}/></TB>
      <TB onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Nghiêng"><Italic size={15}/></TB>
      <TB onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Gạch chân"><UnderlineIcon size={15}/></TB>
      <TB onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Gạch ngang"><Strikethrough size={15}/></TB>
      <TB onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive("highlight")} title="Đánh dấu">
        <span className="text-xs font-bold px-0.5" style={{ background: "#fef08a", borderRadius: 2 }}>H</span>
      </TB>
      <div className="w-px h-5 bg-slate-200 mx-1" />

      {/* Color */}
      <label title="Màu chữ" className="cursor-pointer p-1.5 rounded hover:bg-slate-100">
        <Palette size={15} className="text-slate-600" />
        <input
          type="color"
          className="sr-only"
          onChange={e => editor.chain().focus().setColor(e.target.value).run()}
        />
      </label>
      <div className="w-px h-5 bg-slate-200 mx-1" />

      {/* Lists */}
      <TB onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Danh sách chấm"><List size={15}/></TB>
      <TB onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Danh sách số"><ListOrdered size={15}/></TB>
      <TB onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Trích dẫn">
        <span className="text-xs font-bold">"</span>
      </TB>
      <TB onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Đường kẻ"><Minus size={15}/></TB>
      <div className="w-px h-5 bg-slate-200 mx-1" />

      {/* Align */}
      <TB onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Căn trái"><AlignLeft size={15}/></TB>
      <TB onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Căn giữa"><AlignCenter size={15}/></TB>
      <TB onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Căn phải"><AlignRight size={15}/></TB>
      <TB onClick={() => editor.chain().focus().setTextAlign("justify").run()} active={editor.isActive({ textAlign: "justify" })} title="Căn đều"><AlignJustify size={15}/></TB>
      <div className="w-px h-5 bg-slate-200 mx-1" />

      {/* Image */}
      <div className="relative">
        <TB onClick={() => { setShowImgInput(v => !v); setShowLinkInput(false); }} active={showImgInput} title="Chèn ảnh"><ImageIcon size={15}/></TB>
        {showImgInput && (
          <div className="absolute top-8 left-0 z-20 bg-white border border-slate-200 rounded-xl shadow-lg p-3 flex gap-2 w-72">
            <input
              autoFocus
              value={imgUrl}
              onChange={e => setImgUrl(e.target.value)}
              onKeyDown={e => e.key === "Enter" && insertImage()}
              placeholder="https://... (Cloudinary / S3)"
              className="flex-1 text-sm border border-slate-200 rounded-lg px-2 py-1 outline-none focus:border-indigo-400"
            />
            <button onClick={insertImage} className="px-3 py-1 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Chèn</button>
          </div>
        )}
      </div>

      {/* Link */}
      <div className="relative">
        <TB onClick={() => { setShowLinkInput(v => !v); setShowImgInput(false); }} active={editor.isActive("link")} title="Chèn liên kết"><LinkIcon size={15}/></TB>
        {showLinkInput && (
          <div className="absolute top-8 left-0 z-20 bg-white border border-slate-200 rounded-xl shadow-lg p-3 flex gap-2 w-64">
            <input
              autoFocus
              value={linkUrl}
              onChange={e => setLinkUrl(e.target.value)}
              onKeyDown={e => e.key === "Enter" && setLink()}
              placeholder="https://..."
              className="flex-1 text-sm border border-slate-200 rounded-lg px-2 py-1 outline-none focus:border-indigo-400"
            />
            <button onClick={setLink} className="px-3 py-1 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">OK</button>
          </div>
        )}
      </div>

      {/* Code */}
      <TB onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")} title="Code nội tuyến">
        <span className="font-mono text-xs">{`</>`}</span>
      </TB>
      <TB onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} title="Khối code">
        <span className="font-mono text-xs">{ `{}`}</span>
      </TB>
    </div>
  );
}

// ─── Quiz types ───────────────────────────────────────────────────────────────
interface QuizOptionData    { optionId?: number; optionText: string; isCorrect: boolean; orderIndex: number }
interface QuizQuestionData  { questionId?: number; questionText: string; questionType: number; orderIndex: number; options: QuizOptionData[] }
interface QuizData          { quizId?: number; title: string; passScore: number; isActive: boolean; questions: QuizQuestionData[] }

function emptyQuestion(order: number): QuizQuestionData {
  return { questionText: "", questionType: 0, orderIndex: order, options: [
    { optionText: "", isCorrect: true,  orderIndex: 1 },
    { optionText: "", isCorrect: false, orderIndex: 2 },
    { optionText: "", isCorrect: false, orderIndex: 3 },
    { optionText: "", isCorrect: false, orderIndex: 4 },
  ]};
}

// ─── Quiz Editor ──────────────────────────────────────────────────────────────
function mapQuizData(data: any): QuizData {
  return {
    quizId:    data.quizId,
    title:     data.title     ?? "Kiểm tra nhanh",
    passScore: data.passScore ?? 70,
    isActive:  data.isActive  ?? true,
    questions: (data.questions ?? []).map((q: any) => ({
      questionId:   q.questionId,
      questionText: q.questionText,
      questionType: q.questionType,
      orderIndex:   q.orderIndex,
      options:      (q.options ?? []).map((o: any) => ({
        optionId:   o.optionId,
        optionText: o.optionText,
        isCorrect:  o.isCorrect,
        orderIndex: o.orderIndex,
      }))
    }))
  };
}

function QuizEditor({ lessonId, onSaveToast }: { lessonId: number; onSaveToast: (ok: boolean, msg: string) => void }) {
  const [quiz, setQuiz]         = useState<QuizData>({ title: "Kiểm tra nhanh", passScore: 70, isActive: true, questions: [] });
  const [loading, setLoading]   = useState(true);
  const [saving,  setSaving]    = useState(false);
  const [loadErr, setLoadErr]   = useState<string | null>(null);

  useEffect(() => {
    setLoadErr(null);
    lessonService.getQuiz(lessonId).then((data: any) => {
      if (data) setQuiz(mapQuizData(data));
    }).catch((e: any) => {
      setLoadErr(e?.message ?? "Không thể tải quiz");
    }).finally(() => setLoading(false));
  }, [lessonId]);

  const addQuestion = () =>
    setQuiz(q => ({ ...q, questions: [...q.questions, emptyQuestion(q.questions.length + 1)] }));

  const removeQuestion = (qi: number) =>
    setQuiz(q => ({ ...q, questions: q.questions.filter((_, i) => i !== qi) }));

  const updateQuestion = (qi: number, patch: Partial<QuizQuestionData>) =>
    setQuiz(q => ({ ...q, questions: q.questions.map((qq, i) => i === qi ? { ...qq, ...patch } : qq) }));

  const updateOption = (qi: number, oi: number, patch: Partial<QuizOptionData>) =>
    setQuiz(q => ({
      ...q,
      questions: q.questions.map((qq, i) => i !== qi ? qq : {
        ...qq,
        options: qq.options.map((o, j) => j !== oi ? o : { ...o, ...patch })
      })
    }));

  const addOption = (qi: number) =>
    setQuiz(q => ({
      ...q,
      questions: q.questions.map((qq, i) => i !== qi ? qq : {
        ...qq,
        options: [...qq.options, { optionText: "", isCorrect: false, orderIndex: qq.options.length + 1 }]
      })
    }));

  const removeOption = (qi: number, oi: number) =>
    setQuiz(q => ({
      ...q,
      questions: q.questions.map((qq, i) => i !== qi ? qq : {
        ...qq,
        options: qq.options.filter((_, j) => j !== oi)
      })
    }));

  const handleMarkCorrect = (qi: number, oi: number) => {
    const q = quiz.questions[qi];
    if (q.questionType === 0) {
      // Single choice — chỉ 1 đáp án đúng
      updateQuestion(qi, {
        options: q.options.map((o, j) => ({ ...o, isCorrect: j === oi }))
      });
    } else {
      // Multiple choice — toggle
      updateOption(qi, oi, { isCorrect: !q.options[oi].isCorrect });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const saved = await lessonService.saveQuiz(lessonId, quiz) as any;
      if (saved) setQuiz(mapQuizData(saved)); // update IDs from server
      onSaveToast(true, "Đã lưu quiz!");
    } catch (e: any) {
      onSaveToast(false, e?.message ?? "Lỗi khi lưu quiz");
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-16 text-indigo-300">
      <Loader2 size={20} className="animate-spin mr-2"/> Đang tải quiz…
    </div>
  );

  if (loadErr) return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-red-400">
      <AlertCircle size={24}/>
      <p className="text-sm font-medium">{loadErr}</p>
      <button onClick={() => { setLoading(true); setLoadErr(null);
        lessonService.getQuiz(lessonId).then((data: any) => { if (data) setQuiz(mapQuizData(data)); })
          .catch((e: any) => setLoadErr(e?.message ?? "Lỗi")).finally(() => setLoading(false)); }}
        className="text-xs text-indigo-500 hover:text-indigo-700 underline">
        Thử lại
      </button>
    </div>
  );

  return (
    <div className="space-y-5 pb-6">
      {/* Quiz meta */}
      <div className="flex flex-wrap gap-4 items-end p-4 bg-indigo-50 rounded-xl border border-indigo-100">
        <div className="flex-1 min-w-40">
          <label className="text-xs font-semibold text-slate-500 block mb-1">Tên quiz</label>
          <input value={quiz.title} onChange={e => setQuiz(q => ({ ...q, title: e.target.value }))}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400 bg-white" />
        </div>
        <div className="w-32">
          <label className="text-xs font-semibold text-slate-500 block mb-1">Điểm đạt (%)</label>
          <input type="number" min={0} max={100} value={quiz.passScore}
            onChange={e => setQuiz(q => ({ ...q, passScore: Number(e.target.value) }))}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400 bg-white" />
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
          <input type="checkbox" checked={quiz.isActive}
            onChange={e => setQuiz(q => ({ ...q, isActive: e.target.checked }))}
            className="w-4 h-4 accent-indigo-600" />
          Kích hoạt
        </label>
        <div className="ml-auto">
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-4 py-2 text-sm rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60 transition">
            {saving ? <Loader2 size={14} className="animate-spin"/> : <Save size={14}/>}
            Lưu quiz
          </button>
        </div>
      </div>

      {/* Questions */}
      {quiz.questions.map((q, qi) => (
        <div key={qi} className="border border-slate-200 rounded-2xl bg-white overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border-b border-slate-100">
            <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ background: "#6366F1" }}>{qi + 1}</span>
            <input value={q.questionText} onChange={e => updateQuestion(qi, { questionText: e.target.value })}
              placeholder="Nội dung câu hỏi..."
              className="flex-1 text-sm font-medium bg-transparent border-0 outline-none text-slate-700 placeholder:text-slate-400" />
            {/* Type toggle */}
            <div className="flex rounded-lg overflow-hidden border border-slate-200 text-xs">
              <button onClick={() => updateQuestion(qi, { questionType: 0 })}
                className={`px-2 py-1 transition ${q.questionType === 0 ? "bg-indigo-600 text-white" : "bg-white text-slate-500 hover:bg-slate-50"}`}>
                1 đáp án
              </button>
              <button onClick={() => updateQuestion(qi, { questionType: 1 })}
                className={`px-2 py-1 transition ${q.questionType === 1 ? "bg-indigo-600 text-white" : "bg-white text-slate-500 hover:bg-slate-50"}`}>
                Nhiều đáp án
              </button>
            </div>
            <button onClick={() => removeQuestion(qi)} className="text-slate-300 hover:text-red-400 transition">
              <AlertCircle size={16}/>
            </button>
          </div>

          <div className="px-4 py-3 space-y-2">
            {q.options.map((opt, oi) => (
              <div key={oi} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition ${
                opt.isCorrect ? "border-emerald-300 bg-emerald-50" : "border-slate-100 bg-slate-50"
              }`}>
                {/* correct marker */}
                <button onClick={() => handleMarkCorrect(qi, oi)}
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border-2 transition ${
                    opt.isCorrect ? "border-emerald-500 bg-emerald-500" : "border-slate-300 hover:border-indigo-400"
                  }`}>
                  {opt.isCorrect && <CheckCircle size={12} className="text-white"/>}
                </button>
                <span className="text-xs text-slate-400 font-bold w-4">{String.fromCharCode(65 + oi)}</span>
                <input value={opt.optionText} onChange={e => updateOption(qi, oi, { optionText: e.target.value })}
                  placeholder={`Đáp án ${String.fromCharCode(65 + oi)}...`}
                  className="flex-1 text-sm bg-transparent border-0 outline-none text-slate-700 placeholder:text-slate-400" />
                {q.options.length > 2 && (
                  <button onClick={() => removeOption(qi, oi)} className="text-slate-300 hover:text-red-400 shrink-0">
                    <AlertCircle size={13}/>
                  </button>
                )}
              </div>
            ))}
            <button onClick={() => addOption(qi)}
              className="flex items-center gap-1.5 text-xs text-indigo-500 hover:text-indigo-700 px-3 py-1 rounded-lg hover:bg-indigo-50 transition">
              <Plus size={12}/> Thêm đáp án
            </button>
          </div>
        </div>
      ))}

      <button onClick={addQuestion}
        className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-indigo-200 rounded-2xl text-sm text-indigo-500 hover:border-indigo-400 hover:bg-indigo-50 transition">
        <Plus size={15}/> Thêm câu hỏi
      </button>

      {quiz.questions.length === 0 && (
        <p className="text-center text-slate-400 text-sm -mt-2">Bấm "Thêm câu hỏi" để bắt đầu tạo quiz</p>
      )}
    </div>
  );
}

// ─── Lesson Editor (TipTap) ───────────────────────────────────────────────────
function LessonEditor({
  lesson, phaseName, moduleName, onBack, onSaved
}: {
  lesson: LessonSummary & { content?: string; simulationGuide?: string };
  phaseName: string; moduleName: string;
  onBack: () => void;
  onSaved: (updated: LessonSummary) => void;
}) {
  const [title, setTitle]           = useState(lesson.title);
  const [guide, setGuide]           = useState("");
  const [activeTab, setActiveTab]   = useState<"content" | "quiz">("content");
  const [saving, setSaving]         = useState(false);
  const [toast, setToast]           = useState<{ ok: boolean; msg: string } | null>(null);
  const [loadingContent, setLoadingContent] = useState(true);
  // Store fetched content separately so we can set it once editor is ready
  const [fetchedContent, setFetchedContent] = useState<string | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Image.configure({ inline: false, allowBase64: false, HTMLAttributes: { style: "max-width:100%;border-radius:8px;margin:12px 0;" } }),
      Link.configure({ openOnClick: false }),
      Highlight,
      TextStyle,
      Color,
      Placeholder.configure({ placeholder: "Bắt đầu soạn nội dung bài học…" }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none min-h-[320px] outline-none p-4 text-slate-700",
      },
    },
  });

  // Fetch lesson content from API
  useEffect(() => {
    setLoadingContent(true);
    setFetchedContent(null);
    lessonService.getLessonById(lesson.lessonId).then((data: any) => {
      setFetchedContent(data?.content ?? "");
      if (data?.simulationGuide) setGuide(data.simulationGuide);
    }).catch(() => setFetchedContent(""))
      .finally(() => setLoadingContent(false));
  }, [lesson.lessonId]);

  // Set content into editor once BOTH editor and content are ready
  useEffect(() => {
    if (editor && fetchedContent !== null) {
      editor.commands.setContent(fetchedContent);
    }
  }, [editor, fetchedContent]);

  const showToast = (ok: boolean, msg: string) => {
    setToast({ ok, msg });
    setTimeout(() => setToast(null), 2500);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await lessonService.updateLesson(lesson.lessonId, {
        title:           title.trim() || undefined,
        content:         editor?.getHTML(),
        simulationGuide: guide || undefined,
      }) as any;
      showToast(true, "Đã lưu!");
      onSaved({ ...lesson, title: updated?.title ?? title });
    } catch (e: any) {
      showToast(false, e.message);
    } finally { setSaving(false); }
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* breadcrumb + actions */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-100 shrink-0">
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600 transition">
          <ArrowLeft size={15}/> Quay lại
        </button>
        <span className="text-slate-300">/</span>
        <span className="text-xs text-slate-400">{phaseName}</span>
        <span className="text-slate-300">/</span>
        <span className="text-xs text-slate-400">{moduleName}</span>
        <span className="text-slate-300">/</span>
        <span className="text-sm font-semibold text-slate-700 truncate">{title}</span>
        <div className="ml-auto flex items-center gap-3">
          {toast && (
            <span className={`flex items-center gap-1 text-sm ${toast.ok ? "text-emerald-600" : "text-red-500"}`}>
              {toast.ok ? <CheckCircle size={14}/> : <AlertCircle size={14}/>}
              {toast.msg}
            </span>
          )}
          {activeTab === "content" && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-1.5 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60 transition"
            >
              {saving ? <Loader2 size={14} className="animate-spin"/> : <Save size={14}/>}
              Lưu
            </button>
          )}
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 px-5 pt-3 border-b border-slate-100 shrink-0">
        {(["content", "quiz"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm rounded-t-lg font-medium transition border-b-2 -mb-px ${
              activeTab === tab
                ? "text-indigo-600 border-indigo-500 bg-indigo-50/60"
                : "text-slate-500 border-transparent hover:text-slate-700"
            }`}
          >
            {tab === "content" ? "Nội dung" : "Quiz"}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {activeTab === "content" ? (
          <div className="space-y-4">
            {/* Title */}
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Tiêu đề bài học"
              className="w-full text-xl font-bold text-slate-800 border-0 border-b border-slate-200 pb-2 outline-none bg-transparent placeholder:text-slate-300 focus:border-indigo-400"
            />

            {/* Rich text editor */}
            <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
              <Toolbar editor={editor} />
              {loadingContent ? (
                <div className="flex items-center justify-center h-40 text-indigo-300">
                  <Loader2 size={20} className="animate-spin mr-2"/> Đang tải nội dung…
                </div>
              ) : (
                <EditorContent editor={editor} />
              )}
            </div>

            {/* Simulation guide */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                Hướng dẫn thực hành (hiển thị khi làm bài)
              </label>
              <textarea
                value={guide}
                onChange={e => setGuide(e.target.value)}
                rows={4}
                placeholder="Mô tả ngắn cho phần thực hành..."
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-indigo-400 resize-y"
              />
            </div>
          </div>
        ) : (
          <QuizEditor lessonId={lesson.lessonId} onSaveToast={showToast} />
        )}
      </div>
    </div>
  );
}

// ─── Phase View ───────────────────────────────────────────────────────────────
function PhaseCard({ phase, onClick }: { phase: PhaseDetail; onClick: () => void }) {
  const PhaseIcon = getIconComponent(phase.icon);
  const color = phase.color ?? "#6366F1";
  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(0,0,0,0.1)" }}
      onClick={onClick}
      className="rounded-2xl overflow-hidden cursor-pointer border border-slate-100 bg-white"
    >
      <div className="h-24 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${color}22, ${color}44)` }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}>
          <PhaseIcon size={28} className="text-white" />
        </div>
      </div>
      <div className="px-4 py-3">
        <h3 className="font-bold text-slate-800 text-sm leading-tight">{phase.phaseName}</h3>
        {phase.description && <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{phase.description}</p>}
        <div className="flex gap-3 mt-2">
          <span className="text-xs text-slate-500"><span className="font-semibold text-slate-700">{phase.moduleCount}</span> module</span>
          <span className="text-xs text-slate-500"><span className="font-semibold text-slate-700">{phase.lessonCount}</span> bài học</span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Create Phase Modal ───────────────────────────────────────────────────────
function CreatePhaseModal({ onClose, onCreated }: {
  onClose: () => void;
  onCreated: (phase: PhaseDetail) => void;
}) {
  const [name, setName]   = useState("");
  const [desc, setDesc]   = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [icon, setIcon]   = useState(ICONS[0].name);
  const [saving, setSaving] = useState(false);
  const [err, setErr]     = useState("");

  const handleCreate = async () => {
    if (!name.trim()) { setErr("Tên phase không được để trống"); return; }
    setSaving(true); setErr("");
    try {
      const phase = await phaseService.create({ phaseName: name.trim(), description: desc.trim(), color, icon }) as PhaseDetail;
      onCreated(phase);
    } catch (e: any) { setErr(e.message); setSaving(false); }
  };

  const SelectedIcon = getIconComponent(icon);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* preview header */}
        <div className="h-28 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${color}22, ${color}44)` }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}>
            <SelectedIcon size={32} className="text-white" />
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <h3 className="font-bold text-slate-800 text-lg">Tạo Phase mới</h3>

          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">Tên Phase *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="VD: Nền tảng bảo mật" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400" />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">Mô tả</label>
            <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Ngắn gọn" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400" />
          </div>

          {/* Color */}
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-2">Màu sắc</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map(c => (
                <button key={c} onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-all ${color === c ? "ring-2 ring-offset-2 ring-slate-400 scale-110" : "hover:scale-105"}`}
                  style={{ background: c }} />
              ))}
            </div>
          </div>

          {/* Icon */}
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-2">Biểu tượng</label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map(({ name: n, Icon }) => (
                <button key={n} onClick={() => setIcon(n)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                    icon === n ? "text-white shadow" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                  style={icon === n ? { background: `linear-gradient(135deg, ${color}, ${color}cc)` } : {}}>
                  <Icon size={18} />
                </button>
              ))}
            </div>
          </div>

          {err && <p className="text-sm text-red-500 flex items-center gap-1"><AlertCircle size={13}/>{err}</p>}

          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 py-2 text-sm rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition">Hủy</button>
            <button onClick={handleCreate} disabled={saving} className="flex-1 py-2 text-sm rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60 flex items-center justify-center gap-2 transition">
              {saving ? <Loader2 size={14} className="animate-spin"/> : <Plus size={14}/>}
              Tạo Phase
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Phase Detail (modules + lessons) ─────────────────────────────────────────
function PhaseDetailView({
  phase, onBack, onEditLesson,
  onPhaseUpdated,
}: {
  phase: PhaseDetail;
  onBack: () => void;
  onEditLesson: (lesson: LessonSummary, module: ModuleSummary) => void;
  onPhaseUpdated: (p: PhaseDetail) => void;
}) {
  const [phaseData, setPhaseData] = useState(phase);
  const [openMods, setOpenMods]   = useState<Set<number>>(new Set(phase.modules.map(m => m.moduleId)));
  const [creatingModule, setCreatingModule] = useState(false);
  const [newModName, setNewModName] = useState("");
  const [creatingLesson, setCreatingLesson] = useState<number | null>(null); // moduleId
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ ok: boolean; msg: string } | null>(null);

  const PhaseIcon = getIconComponent(phaseData.icon);
  const color = phaseData.color ?? "#6366F1";

  const toggleMod = (id: number) =>
    setOpenMods(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const handleAddModule = async () => {
    if (!newModName.trim()) return;
    setSaving(true);
    try {
      const mod = await phaseService.createModule(phaseData.phaseId, { moduleName: newModName.trim(), orderIndex: 0 }) as ModuleSummary;
      const updated = { ...phaseData, modules: [...phaseData.modules, { ...mod, lessons: [] }], moduleCount: phaseData.moduleCount + 1 };
      setPhaseData(updated); onPhaseUpdated(updated);
      setNewModName(""); setCreatingModule(false);
      setOpenMods(s => new Set([...s, mod.moduleId]));
      showToast(true, "Đã tạo module");
    } catch (e: any) { showToast(false, e.message); }
    setSaving(false);
  };

  const handleAddLesson = async (moduleId: number) => {
    if (!newLessonTitle.trim()) return;
    setSaving(true);
    try {
      const lesson = await lessonService.createLesson({ moduleId, title: newLessonTitle.trim(), orderIndex: 0, content: "" }) as any;
      const updated = {
        ...phaseData,
        modules: phaseData.modules.map(m =>
          m.moduleId === moduleId
            ? { ...m, lessons: [...m.lessons, { lessonId: lesson.lessonId, title: lesson.title, orderIndex: lesson.lessonOrder ?? 0, isActive: true }], lessonCount: m.lessonCount + 1 }
            : m
        ),
        lessonCount: phaseData.lessonCount + 1,
      };
      setPhaseData(updated); onPhaseUpdated(updated);
      setNewLessonTitle(""); setCreatingLesson(null);
      showToast(true, "Đã tạo bài học");
    } catch (e: any) { showToast(false, e.message); }
    setSaving(false);
  };

  const showToast = (ok: boolean, msg: string) => {
    setToast({ ok, msg });
    setTimeout(() => setToast(null), 2500);
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 shrink-0">
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600 transition">
          <ArrowLeft size={15}/> Phases
        </button>
        <span className="text-slate-300">/</span>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}>
          <PhaseIcon size={16} className="text-white" />
        </div>
        <span className="font-bold text-slate-800">{phaseData.phaseName}</span>
        <div className="ml-auto flex items-center gap-2">
          {toast && (
            <span className={`flex items-center gap-1 text-sm ${toast.ok ? "text-emerald-600" : "text-red-500"}`}>
              {toast.ok ? <CheckCircle size={13}/> : <AlertCircle size={13}/>} {toast.msg}
            </span>
          )}
          <button
            onClick={() => setCreatingModule(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition"
          >
            <FolderPlus size={14}/> Thêm Module
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {/* Create module inline */}
        <AnimatePresence>
          {creatingModule && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="flex gap-2 items-center bg-indigo-50 rounded-xl px-4 py-3 border border-indigo-100">
              <input autoFocus value={newModName} onChange={e => setNewModName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleAddModule()}
                placeholder="Tên module mới..."
                className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:border-indigo-400 bg-white" />
              <button onClick={handleAddModule} disabled={saving} className="px-3 py-1.5 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60">
                {saving ? <Loader2 size={13} className="animate-spin"/> : "Tạo"}
              </button>
              <button onClick={() => setCreatingModule(false)} className="text-slate-400 hover:text-slate-600"><AlertCircle size={16}/></button>
            </motion.div>
          )}
        </AnimatePresence>

        {phaseData.modules.length === 0 && !creatingModule && (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Layers size={36} className="mb-3 opacity-30"/>
            <p className="text-sm">Phase này chưa có module. Bấm "Thêm Module" để bắt đầu.</p>
          </div>
        )}

        {phaseData.modules.map(mod => (
          <div key={mod.moduleId} className="border border-slate-100 rounded-2xl bg-white overflow-hidden">
            {/* module header */}
            <button
              onClick={() => toggleMod(mod.moduleId)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition text-left"
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}22` }}>
                <BookOpen size={14} style={{ color }} />
              </div>
              <span className="font-semibold text-slate-700 flex-1 text-sm">{mod.moduleName}</span>
              <span className="text-xs text-slate-400 mr-2">{mod.lessonCount} bài</span>
              {openMods.has(mod.moduleId) ? <ChevronDown size={14} className="text-slate-400"/> : <ChevronRight size={14} className="text-slate-400"/>}
            </button>

            <AnimatePresence initial={false}>
              {openMods.has(mod.moduleId) && (
                <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} style={{ overflow: "hidden" }}>
                  <div className="px-4 pb-3 space-y-1 border-t border-slate-50">
                    {mod.lessons.map(l => (
                      <button
                        key={l.lessonId}
                        onClick={() => onEditLesson(l, mod)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-indigo-50 text-left group transition"
                      >
                        <Edit3 size={13} className="text-slate-300 group-hover:text-indigo-400 shrink-0"/>
                        <span className="text-sm text-slate-600 flex-1 group-hover:text-indigo-700">{l.title}</span>
                      </button>
                    ))}

                    {/* Add lesson */}
                    {creatingLesson === mod.moduleId ? (
                      <div className="flex gap-2 items-center mt-1">
                        <input autoFocus value={newLessonTitle} onChange={e => setNewLessonTitle(e.target.value)}
                          onKeyDown={e => e.key === "Enter" && handleAddLesson(mod.moduleId)}
                          placeholder="Tiêu đề bài học..."
                          className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:border-indigo-400" />
                        <button onClick={() => handleAddLesson(mod.moduleId)} disabled={saving}
                          className="px-3 py-1.5 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60">
                          {saving ? <Loader2 size={13} className="animate-spin"/> : "Tạo"}
                        </button>
                        <button onClick={() => { setCreatingLesson(null); setNewLessonTitle(""); }} className="text-slate-400 hover:text-slate-600"><AlertCircle size={15}/></button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setCreatingLesson(mod.moduleId); setNewLessonTitle(""); }}
                        className="flex items-center gap-1.5 text-xs text-indigo-500 hover:text-indigo-700 mt-1 px-3 py-1 rounded-lg hover:bg-indigo-50 transition"
                      >
                        <FilePlus size={13}/> Thêm bài học
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
type View =
  | { kind: "phases" }
  | { kind: "phase"; phase: PhaseDetail }
  | { kind: "lesson"; lesson: LessonSummary; module: ModuleSummary; phase: PhaseDetail };

export function AdminQuanLyLesson() {
  const [phases, setPhases]   = useState<PhaseDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [view, setView]       = useState<View>({ kind: "phases" });
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    phaseService.getAll()
      .then((data: any) => setPhases(data as PhaseDetail[]))
      .catch((e: any) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handlePhaseCreated = (phase: PhaseDetail) => {
    setPhases(ps => [...ps, { ...phase, modules: [], moduleCount: 0, lessonCount: 0 }]);
    setShowCreate(false);
  };

  const handlePhaseUpdated = useCallback((updated: PhaseDetail) => {
    setPhases(ps => ps.map(p => p.phaseId === updated.phaseId ? updated : p));
    if (view.kind === "phase" && view.phase.phaseId === updated.phaseId)
      setView({ kind: "phase", phase: updated });
  }, [view]);

  const handleLessonSaved = (updated: LessonSummary) => {
    if (view.kind !== "lesson") return;
    setPhases(ps => ps.map(p =>
      p.phaseId === view.phase.phaseId
        ? {
            ...p, modules: p.modules.map(m =>
              m.moduleId === view.module.moduleId
                ? { ...m, lessons: m.lessons.map(l => l.lessonId === updated.lessonId ? updated : l) }
                : m
            )
          }
        : p
    ));
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-indigo-400">
      <Loader2 size={28} className="animate-spin mr-2"/> Đang tải…
    </div>
  );
  if (error) return (
    <div className="flex items-center justify-center h-64 text-red-400">
      <AlertCircle size={20} className="mr-2"/> {error}
    </div>
  );

  return (
    <div className="h-full flex flex-col min-h-0" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
      {/* ── Phase grid ── */}
      <AnimatePresence mode="wait">
        {view.kind === "phases" && (
          <motion.div key="phases" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="flex flex-col flex-1 min-h-0">
            <div className="flex items-center gap-3 mb-5 shrink-0">
              <BookOpen size={20} className="text-indigo-500"/>
              <h2 className="font-bold text-slate-800 text-lg">Quản lý bài học</h2>
              <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{phases.length} phases</span>
              <button
                onClick={() => setShowCreate(true)}
                className="ml-auto flex items-center gap-2 px-4 py-2 text-sm rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition"
              >
                <Plus size={15}/> Tạo Phase
              </button>
            </div>

            {phases.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 text-slate-400">
                <Layers size={48} className="mb-4 opacity-20"/>
                <p>Chưa có phase nào. Bấm "Tạo Phase" để bắt đầu.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 overflow-y-auto pb-2">
                {phases.map(p => (
                  <PhaseCard key={p.phaseId} phase={p} onClick={() => setView({ kind: "phase", phase: p })} />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ── Phase detail ── */}
        {view.kind === "phase" && (
          <motion.div key={`phase-${view.phase.phaseId}`} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
            className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-0">
            <PhaseDetailView
              phase={phases.find(p => p.phaseId === view.phase.phaseId) ?? view.phase}
              onBack={() => setView({ kind: "phases" })}
              onEditLesson={(lesson, module) => setView({ kind: "lesson", lesson, module, phase: view.phase })}
              onPhaseUpdated={handlePhaseUpdated}
            />
          </motion.div>
        )}

        {/* ── Lesson editor ── */}
        {view.kind === "lesson" && (
          <motion.div key={`lesson-${view.lesson.lessonId}`} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
            className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-0">
            <LessonEditor
              lesson={view.lesson as any}
              phaseName={view.phase.phaseName}
              moduleName={view.module.moduleName}
              onBack={() => setView({ kind: "phase", phase: view.phase })}
              onSaved={handleLessonSaved}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Phase Modal */}
      <AnimatePresence>
        {showCreate && (
          <CreatePhaseModal onClose={() => setShowCreate(false)} onCreated={handlePhaseCreated} />
        )}
      </AnimatePresence>
    </div>
  );
}
