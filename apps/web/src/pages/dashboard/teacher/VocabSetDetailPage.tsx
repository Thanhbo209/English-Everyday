import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  PencilSimple,
  Trash,
  SpeakerHigh,
  Microphone,
  Image as ImageIcon,
  UploadSimple,
  DotsSixVertical,
  ArrowUp,
  ArrowDown,
  FileCsv,
  Slideshow,
  Books,
  Stop,
  X,
  Sparkle,
  CheckCircle,
  WarningCircle,
} from "@phosphor-icons/react";
import {
  Button,
  Badge,
  Input,
  Modal,
  EmptyState,
  PageSpinner,
  useToast,
} from "../../../components/ui";
import {
  useVocabSet,
  useVocabItems,
  useCreateVocabItem,
  useUpdateVocabItem,
  useDeleteVocabItem,
  useReorderVocabItems,
  useCsvImportPreview,
  useConfirmCsvImport,
  useUploadImage,
  useUploadAudio,
} from "../../../features/vocab/hooks/useVocabs";
import type { VocabItem } from "../../../api/vocab.api";

const PARTS_OF_SPEECH = [
  "NOUN",
  "VERB",
  "ADJECTIVE",
  "ADVERB",
  "PRONOUN",
  "PREPOSITION",
  "CONJUNCTION",
  "INTERJECTION",
  "DETERMINER",
];

export default function VocabSetDetailPage() {
  const { id: setId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const currentSetId = setId ?? "";

  const { data: vocabSet, isLoading: loadingSet } = useVocabSet(currentSetId);
  const { data: vocabItems, isLoading: loadingItems } = useVocabItems(currentSetId);

  // Mutations
  const createMutation = useCreateVocabItem(currentSetId);
  const updateMutation = useUpdateVocabItem(currentSetId);
  const deleteMutation = useDeleteVocabItem(currentSetId);
  const reorderMutation = useReorderVocabItems(currentSetId);
  const csvPreviewMutation = useCsvImportPreview(currentSetId);
  const csvConfirmMutation = useConfirmCsvImport(currentSetId);
  const uploadImageMutation = useUploadImage(currentSetId);
  const uploadAudioMutation = useUploadAudio(currentSetId);

  // Modals state
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<VocabItem | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<VocabItem | null>(null);

  const [csvOpen, setCsvOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<any | null>(null);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [currentPreviewIdx, setCurrentPreviewIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Voice recording state
  const [recordingItemId, setRecordingItemId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);

  // Form states
  const [term, setTerm] = useState("");
  const [definition, setDefinition] = useState("");
  const [phonetic, setPhonetic] = useState("");
  const [partOfSpeech, setPartOfSpeech] = useState("NOUN");
  const [exampleSentence, setExampleSentence] = useState("");
  const [formError, setFormError] = useState("");

  // Drag and drop states
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // References for file uploads
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const [mediaTargetItemId, setMediaTargetItemId] = useState<string | null>(null);

  // Timer for recording
  useEffect(() => {
    if (isRecording) {
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      setRecordingSeconds(0);
    }
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, [isRecording]);

  // Keyboard controls for flashcard preview
  useEffect(() => {
    if (!previewOpen || !vocabItems || vocabItems.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        handleNextCard();
      } else if (e.key === "ArrowLeft") {
        handlePrevCard();
      } else if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.key === "Escape") {
        setPreviewOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previewOpen, currentPreviewIdx, vocabItems]);

  const isLoading = loadingSet || loadingItems;

  if (isLoading) {
    return <PageSpinner />;
  }

  if (!vocabSet) {
    return (
      <EmptyState
        icon={<WarningCircle size={32} className="text-destructive" />}
        title="Set Not Found"
        description="The vocabulary set you are looking for does not exist or you do not have permission to view it."
        action={<Button onClick={() => navigate("/dashboard/vocab-sets")}>Back to Sets</Button>}
      />
    );
  }

  // --- Reordering Logic ---
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDrop = (index: number) => {
    if (draggedIndex === null || draggedIndex === index || !vocabItems) return;

    const items = [...vocabItems];
    const [draggedItem] = items.splice(draggedIndex, 1);
    items.splice(index, 0, draggedItem);

    // Save order
    const payload = items.map((item, idx) => ({
      id: item.id,
      orderIndex: idx,
    }));

    reorderMutation.mutate(payload, {
      onError: () => {
        toast.error("Failed to save reorder. Restoring list.");
      },
    });

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    if (!vocabItems) return;
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= vocabItems.length) return;

    const items = [...vocabItems];
    const temp = items[index];
    items[index] = items[targetIdx];
    items[targetIdx] = temp;

    const payload = items.map((item, idx) => ({
      id: item.id,
      orderIndex: idx,
    }));

    reorderMutation.mutate(payload);
  };

  // --- CRUD item handlers ---
  function handleAddItemClick() {
    setEditingItem(null);
    setTerm("");
    setDefinition("");
    setPhonetic("");
    setPartOfSpeech("NOUN");
    setExampleSentence("");
    setFormError("");
    setItemModalOpen(true);
  }

  function handleEditItemClick(item: VocabItem) {
    setEditingItem(item);
    setTerm(item.term);
    setDefinition(item.definition);
    setPhonetic(item.phonetic ?? "");
    setPartOfSpeech(item.partOfSpeech);
    setExampleSentence(item.exampleSentence ?? "");
    setFormError("");
    setItemModalOpen(true);
  }

  function handleDeleteItemClick(item: VocabItem) {
    setItemToDelete(item);
    setDeleteOpen(true);
  }

  async function handleItemFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    if (!term.trim()) return setFormError("Word/Term is required");
    if (!definition.trim()) return setFormError("Definition is required");

    try {
      if (editingItem) {
        await updateMutation.mutateAsync({
          itemId: editingItem.id,
          payload: {
            term,
            definition,
            phonetic: phonetic || undefined,
            partOfSpeech,
            exampleSentence: exampleSentence || undefined,
          },
        });
        toast.success("Vocabulary item updated");
      } else {
        await createMutation.mutateAsync({
          term,
          definition,
          phonetic: phonetic || undefined,
          partOfSpeech,
          exampleSentence: exampleSentence || undefined,
        });
        toast.success("Vocabulary item added");
      }
      setItemModalOpen(false);
    } catch (err: any) {
      setFormError(err.response?.data?.message ?? "An error occurred");
    }
  }

  async function handleConfirmDeleteItem() {
    if (!itemToDelete) return;
    try {
      await deleteMutation.mutateAsync(itemToDelete.id);
      toast.success("Vocabulary item deleted");
      setDeleteOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Failed to delete item");
    }
  }

  // --- CSV Handlers ---
  function handleCsvFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCsvFile(file);
      setCsvPreview(null);

      // Trigger preview
      csvPreviewMutation.mutate(file, {
        onSuccess: (data) => {
          setCsvPreview(data);
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message ?? "Failed to parse CSV file");
        },
      });
    }
  }

  async function handleConfirmCsvImport() {
    if (!csvFile) return;
    try {
      await csvConfirmMutation.mutateAsync(csvFile);
      toast.success("Vocabulary items imported successfully from CSV");
      setCsvOpen(false);
      setCsvFile(null);
      setCsvPreview(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Failed to import CSV");
    }
  }

  // --- Media Uploader & Recorder ---
  function triggerImageUpload(itemId: string) {
    setMediaTargetItemId(itemId);
    setTimeout(() => imageInputRef.current?.click(), 50);
  }

  function triggerAudioUpload(itemId: string) {
    setMediaTargetItemId(itemId);
    setTimeout(() => audioInputRef.current?.click(), 50);
  }

  async function handleImageFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0] && mediaTargetItemId) {
      const file = e.target.files[0];
      try {
        await uploadImageMutation.mutateAsync({
          itemId: mediaTargetItemId,
          file,
        });
        toast.success("Image uploaded successfully");
      } catch (err: any) {
        toast.error(err.response?.data?.message ?? "Failed to upload image");
      }
    }
  }

  async function handleAudioFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0] && mediaTargetItemId) {
      const file = e.target.files[0];
      try {
        await uploadAudioMutation.mutateAsync({
          itemId: mediaTargetItemId,
          file,
        });
        toast.success("Audio uploaded successfully");
      } catch (err: any) {
        toast.error(err.response?.data?.message ?? "Failed to upload audio");
      }
    }
  }

  async function startRecording(itemId: string) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Create audio blob
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/mpeg" });
        const audioFile = new File([audioBlob], `recorded-pronunciation-${itemId}.mp3`, {
          type: "audio/mpeg",
        });

        try {
          await uploadAudioMutation.mutateAsync({
            itemId,
            file: audioFile,
          });
          toast.success("Voice recording uploaded successfully");
        } catch (err: any) {
          toast.error(err.response?.data?.message ?? "Failed to save recording");
        }

        // Close stream tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      setRecordingItemId(itemId);
      setIsRecording(true);
      mediaRecorder.start();
    } catch (err) {
      toast.error("Could not access microphone. Please check permissions.");
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingItemId(null);
    }
  }

  function playAudio(url: string) {
    const audio = new Audio(url);
    audio.play().catch(() => {
      toast.error("Failed to play audio file");
    });
  }

  // --- Flashcard Deck Previewer ---
  function openCardPreview() {
    if (!vocabItems || vocabItems.length === 0) {
      toast.error("Add some vocabulary words to this set before previewing");
      return;
    }
    setCurrentPreviewIdx(0);
    setIsFlipped(false);
    setPreviewOpen(true);
  }

  function handleNextCard() {
    if (!vocabItems) return;
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentPreviewIdx((prev) => (prev + 1) % vocabItems.length);
    }, 150);
  }

  function handlePrevCard() {
    if (!vocabItems) return;
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentPreviewIdx((prev) => (prev - 1 + vocabItems.length) % vocabItems.length);
    }, 150);
  }

  const activePreviewItem = vocabItems ? vocabItems[currentPreviewIdx] : null;

  return (
    <div className="space-y-6">
      {/* 3D Flip Flashcard styles */}
      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>

      {/* Hidden inputs for uploads */}
      <input
        type="file"
        ref={imageInputRef}
        onChange={handleImageFileSelected}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
      />
      <input
        type="file"
        ref={audioInputRef}
        onChange={handleAudioFileSelected}
        accept="audio/mpeg,audio/wav,audio/webm"
        className="hidden"
      />

      {/* Breadcrumbs & Actions */}
      <div className="flex flex-col gap-4">
        <Link
          to="/dashboard/vocab-sets"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ArrowLeft size={14} />
          Back to Vocabulary Sets
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-foreground">{vocabSet.title}</h2>
              <Badge variant="default">{vocabSet.language}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1 max-w-xl">
              {vocabSet.description || "No description provided."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              leftIcon={<Slideshow size={16} />}
              onClick={openCardPreview}
              variant="outline"
              size="sm"
              disabled={!vocabItems || vocabItems.length === 0}
            >
              Preview Cards
            </Button>

            <Button
              leftIcon={<FileCsv size={16} />}
              onClick={() => {
                setCsvFile(null);
                setCsvPreview(null);
                setCsvOpen(true);
              }}
              variant="outline"
              size="sm"
            >
              Import CSV
            </Button>

            <Button
              leftIcon={<Plus size={16} />}
              onClick={handleAddItemClick}
              variant="primary"
              size="sm"
            >
              Add Word
            </Button>
          </div>
        </div>
      </div>

      {/* Items Section */}
      {!vocabItems || vocabItems.length === 0 ? (
        <EmptyState
          icon={<Books size={32} />}
          title="No Vocabulary Items Yet"
          description="Build this set by adding terms, definitions, examples, audio pronunciation, and illustrations."
          action={
            <Button leftIcon={<Plus size={16} />} onClick={handleAddItemClick} variant="primary">
              Add First Word
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span>Drag the handle on the left to reorder items.</span>
            <span>Total: {vocabItems.length} items</span>
          </div>

          <div className="space-y-3">
            {vocabItems.map((item, index) => {
              const isDragSource = index === draggedIndex;
              const isDragTarget = index === dragOverIndex;

              return (
                <div
                  key={item.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={() => handleDrop(index)}
                  onDragEnd={() => {
                    setDraggedIndex(null);
                    setDragOverIndex(null);
                  }}
                  className={`flex items-stretch border rounded-xl bg-card shadow-sm transition-all duration-200 ${
                    isDragSource ? "opacity-40 border-primary" : "border-border"
                  } ${isDragTarget ? "border-primary border-t-4" : ""}`}
                >
                  {/* Drag Handle */}
                  <div className="flex items-center justify-center px-2 cursor-grab text-muted-foreground/60 hover:text-foreground shrink-0 border-r border-border/40">
                    <DotsSixVertical size={18} weight="bold" />
                  </div>

                  {/* Word Content */}
                  <div className="flex-1 p-4 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                    <div className="space-y-1.5 max-w-lg">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-bold text-base text-foreground">
                          {item.term}
                        </span>
                        {item.phonetic && (
                          <span className="text-xs text-muted-foreground font-mono">
                            /{item.phonetic}/
                          </span>
                        )}
                        <Badge variant="info" className="text-[10px] py-0.5 px-2 font-semibold">
                          {item.partOfSpeech}
                        </Badge>
                      </div>

                      <p className="text-sm text-foreground/80">{item.definition}</p>

                      {item.exampleSentence && (
                        <p className="text-xs text-muted-foreground italic font-serif">
                          "{item.exampleSentence}"
                        </p>
                      )}
                    </div>

                    {/* Media Previews & Uploads */}
                    <div className="flex items-center gap-4 w-full md:w-auto shrink-0 md:justify-end border-t md:border-t-0 border-border/40 pt-3 md:pt-0">
                      {/* Image Block */}
                      <div className="relative group shrink-0">
                        {item.imageUrl ? (
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-border bg-muted">
                            <img
                              src={item.imageUrl}
                              alt={item.term}
                              className="w-full h-full object-cover"
                            />
                            <button
                              onClick={() => triggerImageUpload(item.id)}
                              className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-primary-foreground font-semibold transition-opacity duration-150"
                            >
                              Change
                            </button>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-10 w-10 p-0 flex flex-col justify-center rounded-lg border-dashed border-muted-foreground/30 text-muted-foreground hover:text-foreground"
                            onClick={() => triggerImageUpload(item.id)}
                            title="Add Image"
                          >
                            <ImageIcon size={16} />
                            <span className="text-[8px] font-semibold mt-0.5 leading-none">
                              Image
                            </span>
                          </Button>
                        )}
                      </div>

                      {/* Audio Pronunciation Block */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {item.audioUrl ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-10 w-10 p-0 rounded-lg"
                            onClick={() => playAudio(item.audioUrl!)}
                            title="Listen Pronunciation"
                          >
                            <SpeakerHigh size={18} className="text-primary animate-pulse-slow" />
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-10 w-10 p-0 flex flex-col justify-center rounded-lg border-dashed border-muted-foreground/30 text-muted-foreground hover:text-foreground"
                            onClick={() => triggerAudioUpload(item.id)}
                            title="Upload Pronunciation File"
                          >
                            <UploadSimple size={15} />
                            <span className="text-[8px] font-semibold mt-0.5 leading-none">
                              Upload
                            </span>
                          </Button>
                        )}

                        {/* Microphone Recorder button */}
                        {recordingItemId === item.id && isRecording ? (
                          <Button
                            variant="primary"
                            size="sm"
                            className="h-10 px-2 rounded-lg bg-destructive hover:bg-destructive/90 text-destructive-foreground flex items-center gap-1 border-0"
                            onClick={stopRecording}
                            title="Stop Recording"
                          >
                            <Stop size={16} weight="fill" className="animate-pulse" />
                            <span className="text-[10px] font-semibold font-mono">
                              0:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}
                            </span>
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className={`h-10 w-10 p-0 flex flex-col justify-center rounded-lg border-dashed border-muted-foreground/30 text-muted-foreground hover:text-foreground ${
                              item.audioUrl ? "border-0 bg-transparent hover:bg-secondary" : ""
                            }`}
                            onClick={() => startRecording(item.id)}
                            title="Record Pronunciation"
                          >
                            <Microphone size={16} />
                            <span className="text-[8px] font-semibold mt-0.5 leading-none">
                              {item.audioUrl ? "Record" : "Record"}
                            </span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Up/Down Ordering */}
                  <div className="flex flex-col justify-between p-3 border-l border-border/40 shrink-0 gap-2">
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="p-1.5 h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => handleEditItemClick(item)}
                        aria-label="Edit word"
                      >
                        <PencilSimple size={15} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="p-1.5 h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteItemClick(item)}
                        aria-label="Delete word"
                      >
                        <Trash size={15} />
                      </Button>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="p-1 h-6 w-6 text-muted-foreground hover:text-foreground disabled:opacity-30"
                        disabled={index === 0}
                        onClick={() => moveItem(index, "up")}
                        aria-label="Move item up"
                      >
                        <ArrowUp size={12} weight="bold" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="p-1 h-6 w-6 text-muted-foreground hover:text-foreground disabled:opacity-30"
                        disabled={index === vocabItems.length - 1}
                        onClick={() => moveItem(index, "down")}
                        aria-label="Move item down"
                      >
                        <ArrowDown size={12} weight="bold" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add / Edit Word Modal */}
      <Modal
        open={itemModalOpen}
        onClose={() => setItemModalOpen(false)}
        title={editingItem ? "Edit Vocabulary Item" : "Add Vocabulary Item"}
        size="md"
      >
        <form onSubmit={handleItemFormSubmit} className="space-y-4">
          <Input
            label="Word / Term"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="e.g. Ephemeral"
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Phonetic Guide"
              value={phonetic}
              onChange={(e) => setPhonetic(e.target.value)}
              placeholder="e.g. i-ˈfe-m(ə-)rəl"
            />

            <div className="flex flex-col gap-1.5">
              <label htmlFor="pos-select" className="text-sm font-medium text-foreground">
                Part of Speech
              </label>
              <select
                id="pos-select"
                value={partOfSpeech}
                onChange={(e) => setPartOfSpeech(e.target.value)}
                className="w-full h-9 rounded-lg border border-border text-sm bg-input text-foreground px-3 focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20 transition-colors"
                required
              >
                {PARTS_OF_SPEECH.map((pos) => (
                  <option key={pos} value={pos}>
                    {pos}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="def-textarea" className="text-sm font-medium text-foreground">
              Definition
            </label>
            <textarea
              id="def-textarea"
              value={definition}
              onChange={(e) => setDefinition(e.target.value)}
              placeholder="Provide a clear, simple translation or definition..."
              rows={3}
              className="w-full p-3 rounded-lg border border-border text-sm bg-input text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20 transition-colors resize-none"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="sentence-textarea" className="text-sm font-medium text-foreground">
              Example Sentence
            </label>
            <textarea
              id="sentence-textarea"
              value={exampleSentence}
              onChange={(e) => setExampleSentence(e.target.value)}
              placeholder="Create a sentence illustrating usage..."
              rows={2}
              className="w-full p-3 rounded-lg border border-border text-sm bg-input text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20 transition-colors resize-none"
            />
          </div>

          {formError && <p className="text-xs text-destructive">{formError}</p>}

          <div className="flex justify-end gap-3 pt-3 border-t border-border mt-5">
            <Button type="button" variant="ghost" onClick={() => setItemModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={createMutation.isPending || updateMutation.isPending}
            >
              {editingItem ? "Save Changes" : "Add Word"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Item Confirmation Modal */}
      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete Vocabulary Word" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to remove <span className="font-semibold text-foreground">"{itemToDelete?.term}"</span> from this vocabulary set?
          </p>
          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <Button variant="ghost" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              onClick={handleConfirmDeleteItem}
              loading={deleteMutation.isPending}
            >
              Remove Word
            </Button>
          </div>
        </div>
      </Modal>

      {/* CSV Import Modal */}
      <Modal open={csvOpen} onClose={() => setCsvOpen(false)} title="Import Vocabulary via CSV" size="lg">
        <div className="space-y-5">
          <div className="text-sm text-muted-foreground bg-secondary/35 p-4 rounded-xl space-y-2 border border-border/50">
            <p className="font-semibold text-foreground flex items-center gap-1.5">
              <Sparkle size={16} className="text-primary" />
              CSV Format Guidelines:
            </p>
            <p className="text-xs">
              Your CSV file must contain a header row with at least <code className="bg-muted px-1.5 py-0.5 rounded font-mono font-bold text-foreground">term</code> and <code className="bg-muted px-1.5 py-0.5 rounded font-mono font-bold text-foreground">definition</code> columns. An optional <code className="bg-muted px-1.5 py-0.5 rounded font-mono font-bold text-foreground">phonetic</code> column is also supported.
            </p>
            <pre className="bg-card text-foreground text-[10px] p-2.5 rounded-lg border border-border/60 overflow-x-auto font-mono mt-2">
{`term,definition,phonetic
dog,a domesticated carnivorous mammal,dôg
cat,a small domesticated carnivorous mammal,kat`}
            </pre>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="csv-file-picker" className="text-sm font-semibold text-foreground">
              Select CSV File
            </label>
            <input
              id="csv-file-picker"
              type="file"
              onChange={handleCsvFileChange}
              accept=".csv"
              className="w-full text-sm border border-border rounded-lg bg-input p-2.5 cursor-pointer file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/95"
            />
          </div>

          {/* Loader for parsing */}
          {csvPreviewMutation.isPending && (
            <div className="flex flex-col items-center justify-center p-8 gap-3">
              <PageSpinner />
              <p className="text-xs text-muted-foreground animate-pulse">Parsing CSV structure...</p>
            </div>
          )}

          {/* Preview Results */}
          {csvPreview && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-4 items-center justify-between bg-card border border-border/60 p-3.5 rounded-xl">
                <div className="flex gap-4 text-xs font-semibold">
                  <div>
                    Total Rows: <span className="text-foreground">{csvPreview.totalRows}</span>
                  </div>
                  <div className="text-emerald-600">
                    Valid: <span>{csvPreview.validCount}</span>
                  </div>
                  <div className="text-destructive">
                    Invalid: <span>{csvPreview.invalidCount}</span>
                  </div>
                </div>
                <Badge
                  variant="default"
                  className={
                    csvPreview.invalidCount === 0
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-destructive/5 text-destructive border-destructive/10"
                  }
                >
                  {csvPreview.invalidCount === 0 ? "All Rows Valid" : "Issues Found"}
                </Badge>
              </div>

              <div className="max-h-60 overflow-y-auto border border-border/60 rounded-xl bg-card">
                <table className="w-full border-collapse text-xs text-left">
                  <thead>
                    <tr className="bg-secondary/40 border-b border-border text-muted-foreground sticky top-0 font-medium">
                      <th className="p-3">Row</th>
                      <th className="p-3">Term</th>
                      <th className="p-3">Definition</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {csvPreview.preview.map((row: any, i: number) => (
                      <tr
                        key={i}
                        className={`border-b border-border/40 ${
                          row.valid ? "hover:bg-emerald-50/10" : "bg-destructive/5 hover:bg-destructive/10"
                        }`}
                      >
                        <td className="p-3 font-semibold text-muted-foreground">{row.row}</td>
                        <td className="p-3 font-medium text-foreground">{row.term || <span className="text-destructive font-semibold">Missing</span>}</td>
                        <td className="p-3 max-w-xs truncate">{row.definition || <span className="text-destructive font-semibold">Missing</span>}</td>
                        <td className="p-3 font-semibold">
                          {row.valid ? (
                            <span className="text-emerald-600 flex items-center gap-1">
                              <CheckCircle size={14} />
                              Ready
                            </span>
                          ) : (
                            <span className="text-destructive flex items-center gap-1" title={row.error}>
                              <WarningCircle size={14} />
                              {row.error}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-border mt-5">
            <Button type="button" variant="ghost" onClick={() => setCsvOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleConfirmCsvImport}
              disabled={!csvPreview || csvPreview.validCount === 0}
              loading={csvConfirmMutation.isPending}
            >
              Confirm Import
            </Button>
          </div>
        </div>
      </Modal>

      {/* Fullscreen Card Deck Preview Modal */}
      {previewOpen && activePreviewItem && vocabItems && (
        <div
          className="fixed inset-0 z-[300] bg-foreground/35 backdrop-blur-md flex flex-col justify-center items-center p-4 select-none"
          role="dialog"
          aria-modal="true"
        >
          {/* Close button top right */}
          <button
            onClick={() => setPreviewOpen(false)}
            className="absolute top-4 right-4 text-primary-foreground bg-foreground/60 hover:bg-foreground hover:scale-105 p-2.5 rounded-full transition-all duration-150 cursor-pointer shadow-lg z-[310]"
            aria-label="Close preview"
          >
            <X size={20} weight="bold" />
          </button>

          <div className="w-full max-w-xl flex flex-col items-center gap-6">
            {/* Card Deck Wrapper */}
            <div
              className="w-full aspect-[1.6/1] cursor-pointer perspective-1000"
              onClick={() => setIsFlipped((prev) => !prev)}
            >
              <div
                className={`relative w-full h-full duration-300 transform-style-3d ${
                  isFlipped ? "rotate-y-180" : ""
                }`}
              >
                {/* CARD FRONT FACE */}
                <div className="absolute inset-0 w-full h-full bg-card rounded-2xl border border-border shadow-2xl p-8 flex flex-col justify-between backface-hidden">
                  <div className="flex justify-between items-start">
                    <Badge variant="info" className="text-[10px] uppercase font-bold tracking-wider py-0.5 px-2 bg-secondary/40 text-muted-foreground border-border/40">
                      Card Front (Term)
                    </Badge>
                    {activePreviewItem.audioUrl && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playAudio(activePreviewItem.audioUrl!);
                        }}
                        className="p-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors cursor-pointer"
                        title="Listen Pronunciation"
                      >
                        <SpeakerHigh size={18} weight="fill" />
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col items-center text-center space-y-3 my-auto">
                    <h3 className="text-3xl font-extrabold text-foreground tracking-tight select-text">
                      {activePreviewItem.term}
                    </h3>
                    {activePreviewItem.phonetic && (
                      <p className="text-sm font-mono text-muted-foreground bg-secondary/30 px-3 py-1 rounded-md">
                        /{activePreviewItem.phonetic}/
                      </p>
                    )}
                  </div>

                  {activePreviewItem.imageUrl && (
                    <div className="h-14 w-14 rounded-lg overflow-hidden border border-border mx-auto shrink-0 bg-muted mb-1.5 shadow-sm">
                      <img
                        src={activePreviewItem.imageUrl}
                        alt="vocab illustration"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="text-center text-xs text-muted-foreground/60 italic leading-none">
                    Click anywhere on card to flip
                  </div>
                </div>

                {/* CARD BACK FACE */}
                <div className="absolute inset-0 w-full h-full bg-card rounded-2xl border border-border shadow-2xl p-8 flex flex-col justify-between backface-hidden rotate-y-180">
                  <div className="flex justify-between items-start">
                    <Badge variant="info" className="text-[10px] uppercase font-bold tracking-wider py-0.5 px-2 bg-secondary/40 text-muted-foreground border-border/40">
                      Card Back (Definition)
                    </Badge>
                    <Badge variant="default" className="text-[10px] font-semibold">
                      {activePreviewItem.partOfSpeech}
                    </Badge>
                  </div>

                  <div className="flex flex-col items-center text-center space-y-4 my-auto max-w-sm mx-auto">
                    <p className="text-lg text-foreground font-semibold leading-snug select-text">
                      {activePreviewItem.definition}
                    </p>
                    {activePreviewItem.exampleSentence && (
                      <p className="text-xs text-muted-foreground italic font-serif leading-relaxed select-text">
                        "{activePreviewItem.exampleSentence}"
                      </p>
                    )}
                  </div>

                  <div className="text-center text-xs text-muted-foreground/60 italic leading-none">
                    Click anywhere on card to flip
                  </div>
                </div>
              </div>
            </div>

            {/* Deck Navigation Controls */}
            <div className="flex items-center justify-between w-full text-primary-foreground px-2">
              <Button
                variant="outline"
                className="bg-foreground/50 border-0 hover:bg-foreground/75 text-primary-foreground hover:text-primary-foreground rounded-lg h-9"
                onClick={handlePrevCard}
              >
                Previous
              </Button>

              <div className="text-sm font-semibold tracking-wide bg-foreground/60 px-3.5 py-1.5 rounded-lg shadow-sm">
                Card {currentPreviewIdx + 1} of {vocabItems.length}
              </div>

              <Button
                variant="outline"
                className="bg-foreground/50 border-0 hover:bg-foreground/75 text-primary-foreground hover:text-primary-foreground rounded-lg h-9"
                onClick={handleNextCard}
              >
                Next
              </Button>
            </div>

            {/* Tip overlay */}
            <div className="text-[10px] text-primary-foreground/65 bg-foreground/35 px-4 py-2 rounded-lg text-center backdrop-blur-sm shadow-sm select-none max-w-sm">
              Keyboard Shortcuts: <kbd className="bg-foreground/20 px-1 py-0.5 rounded">Space</kbd> or <kbd className="bg-foreground/20 px-1 py-0.5 rounded">Enter</kbd> to flip, <kbd className="bg-foreground/20 px-1 py-0.5 rounded">←</kbd> / <kbd className="bg-foreground/20 px-1 py-0.5 rounded">→</kbd> to browse, <kbd className="bg-foreground/20 px-1 py-0.5 rounded">Esc</kbd> to exit.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
