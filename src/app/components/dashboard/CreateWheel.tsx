import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  DollarSign,
  Calendar,
  Trophy,
  Type,
  FileUp,
  TextCursorInput,
  ListPlus,
  Shuffle,
  X,
  Upload,
  FileText,
  Sparkles,
  ChevronDown,
  CheckCircle2,
  Zap,
  Users,
  Hash,
  HelpCircle,
  Gift,
  Utensils,
  Palette,
} from "lucide-react";
import { toast } from "sonner";

type InputMode = "manual" | "bulk" | "file";
type WheelType = "names" | "numbers" | "decisions" | "prizes" | "food" | "custom";

interface WheelTypeConfig {
  id: WheelType;
  label: string;
  description: string;
  icon: typeof Users;
  colors: string[];
  bgGradient: string;
  placeholder: string;
  showValue: boolean;
}

interface WheelItem {
  id: number;
  label: string;
  value: string;
}

// Wheel type configurations with unique color schemes
const WHEEL_TYPES: WheelTypeConfig[] = [
  {
    id: "names",
    label: "Names",
    description: "Random name picker, team selection",
    icon: Users,
    colors: ["#3B82F6", "#60A5FA", "#2563EB", "#93C5FD", "#1D4ED8", "#BFDBFE"],
    bgGradient: "linear-gradient(135deg, #1e3a8a 0%, #3B82F6 30%, #60A5FA 70%, #93C5FD 100%)",
    placeholder: "Enter a name",
    showValue: false,
  },
  {
    id: "numbers",
    label: "Numbers",
    description: "Number picker, lottery, random selection",
    icon: Hash,
    colors: ["#8B5CF6", "#A78BFA", "#7C3AED", "#C4B5FD", "#6D28D9", "#DDD6FE"],
    bgGradient: "linear-gradient(135deg, #4c1d95 0%, #7C3AED 30%, #A78BFA 70%, #C4B5FD 100%)",
    placeholder: "Enter a number",
    showValue: false,
  },
  {
    id: "decisions",
    label: "Decisions",
    description: "Yes/No, choices, what to do",
    icon: HelpCircle,
    colors: ["#F59E0B", "#FBBF24", "#D97706", "#FCD34D", "#B45309", "#FDE68A"],
    bgGradient: "linear-gradient(135deg, #78350f 0%, #D97706 30%, #F59E0B 70%, #FCD34D 100%)",
    placeholder: "Enter an option",
    showValue: false,
  },
  {
    id: "prizes",
    label: "Prizes & Giveaways",
    description: "Raffles, rewards, gift wheels",
    icon: Gift,
    colors: ["#0F9D58", "#34d399", "#0a7a44", "#6EE7B7", "#047857", "#A7F3D0"],
    bgGradient: "linear-gradient(135deg, #064e3b 0%, #0F9D58 30%, #34d399 70%, #D4AF37 100%)",
    placeholder: "Enter prize name",
    showValue: true,
  },
  {
    id: "food",
    label: "Food & Dining",
    description: "What to eat, restaurants, recipes",
    icon: Utensils,
    colors: ["#EF4444", "#F87171", "#DC2626", "#FCA5A5", "#B91C1C", "#FECACA"],
    bgGradient: "linear-gradient(135deg, #7f1d1d 0%, #DC2626 30%, #F87171 70%, #FCA5A5 100%)",
    placeholder: "Enter food option",
    showValue: false,
  },
  {
    id: "custom",
    label: "Custom",
    description: "Create your own wheel type",
    icon: Palette,
    colors: ["#0F9D58", "#D4AF37", "#0a7a44", "#c9a430", "#34d399", "#f59e0b"],
    bgGradient: "linear-gradient(135deg, #0a7a44 0%, #0F9D58 30%, #34d399 70%, #D4AF37 100%)",
    placeholder: "Enter an item",
    showValue: true,
  },
];

interface Template {
  name: string;
  icon: string;
  items: string[];
  types: WheelType[];
}

const TEMPLATES: Template[] = [
  {
    name: "Team Names",
    icon: "👥",
    items: ["Alice", "Bob", "Charlie", "Diana", "Eve", "Frank", "Grace", "Hank"],
    types: ["names", "custom"],
  },
  {
    name: "Yes / No / Maybe",
    icon: "🤔",
    items: ["Yes", "No", "Maybe"],
    types: ["decisions", "custom"],
  },
  {
    name: "Days of the Week",
    icon: "📅",
    items: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    types: ["decisions", "custom"],
  },
  {
    name: "Numbers 1–10",
    icon: "🔢",
    items: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
    types: ["numbers", "custom"],
  },
  {
    name: "Numbers 1-100",
    icon: "💯",
    items: Array.from({ length: 100 }, (_, i) => String(i + 1)),
    types: ["numbers", "custom"],
  },
  {
    name: "Pizza Toppings",
    icon: "🍕",
    items: ["Pepperoni", "Mushrooms", "Onions", "Sausage", "Bacon", "Olives", "Peppers", "Pineapple"],
    types: ["food", "custom"],
  },
  {
    name: "Lunch Spots",
    icon: "🍱",
    items: ["Italian", "Mexican", "Chinese", "Thai", "Burger Joint", "Sushi", "Indian", "Mediterranean"],
    types: ["food", "custom"],
  },
  {
    name: "What's for Dinner?",
    icon: "🍽️",
    items: ["Pizza", "Tacos", "Pasta", "Stir Fry", "Salad", "Burgers", "Sushi", "Sandwiches"],
    types: ["food", "custom"],
  },
  {
    name: "Prize Tiers",
    icon: "🏆",
    items: ["Grand Prize", "2nd Place", "3rd Place", "Gift Card $50", "Gift Card $25", "Free T-Shirt", "Better Luck Next Time"],
    types: ["prizes", "custom"],
  },
  {
    name: "Giveaway Prizes",
    icon: "🎁",
    items: ["$100 Gift Card", "$50 Gift Card", "Free Product", "20% Discount", "Free Shipping", "Mystery Gift"],
    types: ["prizes", "custom"],
  },
  {
    name: "Who Pays?",
    icon: "💸",
    items: ["You Pay!", "Split 50/50", "Free Pass", "Next Time", "Rock Paper Scissors"],
    types: ["decisions", "prizes", "custom"],
  },
  {
    name: "Student Names",
    icon: "🎓",
    items: ["Student 1", "Student 2", "Student 3", "Student 4", "Student 5", "Student 6"],
    types: ["names", "custom"],
  },
  {
    name: "Colors",
    icon: "🎨",
    items: ["Red", "Blue", "Green", "Yellow", "Purple", "Orange", "Pink", "Teal"],
    types: ["custom"],
  },
];

export function CreateWheel() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [wheelType, setWheelType] = useState<WheelType>("names");
  const [maxWinners, setMaxWinners] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [allowBetterLuck, setAllowBetterLuck] = useState(true);
  const [items, setItems] = useState<WheelItem[]>([
    { id: 1, value: "", label: "" },
    { id: 2, value: "", label: "" },
  ]);

  const [inputMode, setInputMode] = useState<InputMode>("manual");
  const [bulkText, setBulkText] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);
  const [dragFileName, setDragFileName] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [parseStats, setParseStats] = useState<{ total: number; duplicates: number } | null>(null);

  // Get current wheel type config
  const currentTypeConfig = WHEEL_TYPES.find((t) => t.id === wheelType) || WHEEL_TYPES[0];
  
  // Get templates filtered by current wheel type
  const filteredTemplates = TEMPLATES.filter((t) => t.types.includes(wheelType));

  // ── Helpers ──

  const addItem = () => {
    setItems([...items, { id: Date.now(), value: "", label: "" }]);
  };

  const removeItem = (id: number) => {
    if (items.length > 2) {
      setItems(items.filter((p) => p.id !== id));
    }
  };

  const updateItem = (id: number, field: "value" | "label", newValue: string) => {
    setItems(items.map((p) => (p.id === id ? { ...p, [field]: newValue } : p)));
  };

  const clearAll = () => {
    setItems([
      { id: Date.now(), value: "", label: "" },
      { id: Date.now() + 1, value: "", label: "" },
    ]);
    setBulkText("");
    setDragFileName("");
    setParseStats(null);
    toast.success("All items cleared");
  };

  const shuffleItems = () => {
    const shuffled = [...items];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setItems(shuffled);
    toast.success("Items shuffled!");
  };

  const parseLinesIntoItems = useCallback((lines: string[]): WheelItem[] => {
    const parsed: WheelItem[] = [];
    const seen = new Set<string>();
    let dupes = 0;

    for (const raw of lines) {
      const trimmed = raw.trim();
      if (!trimmed) continue;

      // Support "label, value" CSV format or just "label"
      let label = trimmed;
      let value = "";

      // Check for CSV: if there's a comma, split label and value
      const commaIdx = trimmed.lastIndexOf(",");
      if (commaIdx > 0) {
        const potentialValue = trimmed.slice(commaIdx + 1).trim();
        const potentialLabel = trimmed.slice(0, commaIdx).trim();
        // If the part after comma looks like a number or short value, treat as value
        if (potentialValue && (potentialValue.match(/^\$?\d+(\.\d+)?$/) || potentialValue.length <= 20)) {
          label = potentialLabel;
          value = potentialValue.replace(/^\$/, "");
        }
      }

      // Also support tab-separated
      const tabIdx = trimmed.indexOf("\t");
      if (tabIdx > 0 && !value) {
        const potentialValue = trimmed.slice(tabIdx + 1).trim();
        label = trimmed.slice(0, tabIdx).trim();
        if (potentialValue) value = potentialValue.replace(/^\$/, "");
      }

      const key = label.toLowerCase();
      if (seen.has(key)) {
        dupes++;
        continue;
      }
      seen.add(key);
      parsed.push({ id: Date.now() + parsed.length + Math.random(), label, value });
    }

    setParseStats({ total: parsed.length, duplicates: dupes });
    return parsed;
  }, []);

  // ── Bulk Text ──

  const applyBulkText = () => {
    if (!bulkText.trim()) {
      toast.error("Please enter some items first");
      return;
    }
    const lines = bulkText.split("\n");
    const parsedItems = parseLinesIntoItems(lines);
    if (parsedItems.length === 0) {
      toast.error("No valid items found");
      return;
    }
    setItems(parsedItems);
    setInputMode("manual");
    toast.success(`${parsedItems.length} items added to your wheel!`);
  };

  // ── File Upload ──

  const processFile = (file: File) => {
    const validTypes = [
      "text/plain",
      "text/csv",
      "application/vnd.ms-excel",
      "text/tab-separated-values",
    ];
    const validExtensions = [".txt", ".csv", ".tsv"];
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();

    if (!validTypes.includes(file.type) && !validExtensions.includes(ext)) {
      toast.error("Please upload a .txt, .csv, or .tsv file");
      return;
    }

    if (file.size > 1024 * 1024) {
      toast.error("File is too large (max 1 MB)");
      return;
    }

    setDragFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) {
        toast.error("Could not read file");
        return;
      }
      const lines = text.split(/\r?\n/);
      const parsedItems = parseLinesIntoItems(lines);
      if (parsedItems.length === 0) {
        toast.error("No valid items found in file");
        return;
      }
      setItems(parsedItems);
      setInputMode("manual");
      toast.success(`${parsedItems.length} items imported from ${file.name}!`);
    };
    reader.onerror = () => toast.error("Failed to read file");
    reader.readAsText(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  // ── Templates ──

  const applyTemplate = (templateItems: string[]) => {
    const parsed = templateItems.map((label, i) => ({
      id: Date.now() + i,
      label,
      value: "",
    }));
    setItems(parsed);
    setShowTemplates(false);
    setParseStats({ total: parsed.length, duplicates: 0 });
    toast.success(`Template applied — ${parsed.length} items added!`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const filledItems = items.filter((p) => p.label.trim());
    if (filledItems.length < 2) {
      toast.error("Please add at least 2 items to the wheel");
      return;
    }
    toast.success("Wheel created successfully!");
    navigate("/dashboard/campaign/1");
  };

  const filledCount = items.filter((p) => p.label.trim()).length;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-xl border border-border flex items-center justify-center hover:bg-salami-green-light transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div>
          <h1 className="text-[1.5rem] text-foreground font-['Poppins',sans-serif]" style={{ fontWeight: 700 }}>
            Create New Wheel
          </h1>
          <p className="text-[0.875rem] text-muted-foreground">
            Set up your campaign details and items
          </p>
        </div>
      </div>

      <motion.form
        onSubmit={handleSubmit}
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Campaign Details Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-border p-6 space-y-5">
          <h2 className="text-foreground font-['Poppins',sans-serif] flex items-center gap-2" style={{ fontWeight: 600 }}>
            <Type className="w-5 h-5 text-salami-green" />
            Wheel Details
          </h2>

          <div>
            <label className="block text-[0.875rem] text-foreground mb-1.5">
              Wheel Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Who Pays for Lunch?, Raffle Giveaway"
              className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-salami-green/30 focus:border-salami-green transition-all"
            />
          </div>

          {/* Wheel Type Selector */}
          <div>
            <label className="block text-[0.875rem] text-foreground mb-2">
              Wheel Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {WHEEL_TYPES.map((type) => {
                const isSelected = wheelType === type.id;
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setWheelType(type.id)}
                    className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                      isSelected
                        ? "border-salami-green bg-salami-green-light"
                        : "border-border hover:border-salami-green/50 hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                        isSelected ? "bg-salami-green text-white" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span
                      className={`text-[0.8125rem] transition-colors ${
                        isSelected ? "text-salami-green" : "text-foreground"
                      }`}
                      style={{ fontWeight: isSelected ? 600 : 500 }}
                    >
                      {type.label}
                    </span>
                    <span className="text-[0.6875rem] text-muted-foreground text-center leading-tight">
                      {type.description}
                    </span>
                    {isSelected && (
                      <motion.div
                        layoutId="wheelTypeIndicator"
                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-salami-green flex items-center justify-center"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                      </motion.div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[0.875rem] text-foreground mb-1.5">
                <Trophy className="w-4 h-4 inline mr-1" />
                Max Spins
              </label>
              <input
                type="number"
                value={maxWinners}
                onChange={(e) => setMaxWinners(e.target.value)}
                placeholder="e.g. 20 (leave empty for unlimited)"
                className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-salami-green/30 focus:border-salami-green transition-all"
              />
            </div>
            <div>
              <label className="block text-[0.875rem] text-foreground mb-1.5">
                <Calendar className="w-4 h-4 inline mr-1" />
                Expiry Date
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-salami-green/30 focus:border-salami-green transition-all"
              />
            </div>
          </div>
        </div>

        {/* ════════════ WHEEL ITEMS CARD ════════════ */}
        <div className="bg-white rounded-2xl shadow-sm border border-border p-6 space-y-5">
          {/* Section Header */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-foreground font-['Poppins',sans-serif] flex items-center gap-2" style={{ fontWeight: 600 }}>
              <currentTypeConfig.icon className="w-5 h-5" style={{ color: currentTypeConfig.colors[0] }} />
              Wheel Items
              {filledCount > 0 && (
                <span 
                  className="ml-1 text-[0.75rem] px-2 py-0.5 rounded-full" 
                  style={{ fontWeight: 600, backgroundColor: `${currentTypeConfig.colors[0]}20`, color: currentTypeConfig.colors[0] }}
                >
                  {filledCount}
                </span>
              )}
            </h2>
            <div className="flex items-center gap-2">
              {/* Templates */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowTemplates(!showTemplates)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[0.8125rem] text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-all"
                  style={{ fontWeight: 500 }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Templates
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showTemplates ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {showTemplates && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowTemplates(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: -5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -5, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 z-20 w-64 bg-white rounded-xl shadow-xl border border-border py-1.5 max-h-72 overflow-y-auto"
                      >
                        {filteredTemplates.length > 0 ? (
                          filteredTemplates.map((t) => (
                            <button
                              key={t.name}
                              type="button"
                              onClick={() => applyTemplate(t.items)}
                              className="flex items-center gap-3 w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors"
                            >
                              <span className="text-[1.125rem]">{t.icon}</span>
                              <div>
                                <div className="text-[0.8125rem] text-foreground" style={{ fontWeight: 500 }}>
                                  {t.name}
                                </div>
                                <div className="text-[0.6875rem] text-muted-foreground">
                                  {t.items.length} items
                                </div>
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-center text-muted-foreground text-[0.8125rem]">
                            No templates for this wheel type
                          </div>
                        )}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Shuffle */}
              {items.filter((p) => p.label.trim()).length >= 2 && (
                <button
                  type="button"
                  onClick={shuffleItems}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[0.8125rem] text-amber-600 bg-amber-50 rounded-lg hover:bg-amber-100 transition-all"
                  style={{ fontWeight: 500 }}
                  title="Shuffle items"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Clear all */}
              {items.some((p) => p.label.trim()) && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[0.8125rem] text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-all"
                  style={{ fontWeight: 500 }}
                  title="Clear all items"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* ── Input Mode Tabs ── */}
          <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl">
            {[
              { mode: "manual" as InputMode, label: "Manual", icon: TextCursorInput },
              { mode: "bulk" as InputMode, label: "Bulk Paste", icon: ListPlus },
              { mode: "file" as InputMode, label: "File Upload", icon: FileUp },
            ].map((tab) => (
              <button
                key={tab.mode}
                type="button"
                onClick={() => setInputMode(tab.mode)}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[0.8125rem] transition-all ${
                  inputMode === tab.mode
                    ? "bg-white text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                style={{ fontWeight: inputMode === tab.mode ? 600 : 400 }}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* ── MANUAL MODE ── */}
          <AnimatePresence mode="wait">
            {inputMode === "manual" && (
              <motion.div
                key="manual"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-3"
              >
                {/* Parse stats banner */}
                {parseStats && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="flex items-center gap-2 p-3 rounded-xl bg-salami-green-light text-salami-green text-[0.8125rem]"
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span style={{ fontWeight: 500 }}>
                      {parseStats.total} items loaded
                      {parseStats.duplicates > 0 && ` (${parseStats.duplicates} duplicates removed)`}
                    </span>
                    <button
                      type="button"
                      onClick={() => setParseStats(null)}
                      className="ml-auto"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                )}

                {items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    className="flex items-center gap-2 sm:gap-3"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(index * 0.02, 0.5) }}
                  >
                    <div 
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-[0.6875rem] sm:text-[0.75rem] shrink-0" 
                      style={{ fontWeight: 600, backgroundColor: `${currentTypeConfig.colors[0]}15`, color: currentTypeConfig.colors[0] }}
                    >
                      {index + 1}
                    </div>
                    <input
                      type="text"
                      value={item.label}
                      onChange={(e) => updateItem(item.id, "label", e.target.value)}
                      placeholder={currentTypeConfig.placeholder}
                      className="flex-1 min-w-0 px-3 sm:px-4 py-2.5 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-salami-green/30 focus:border-salami-green transition-all text-[0.875rem]"
                    />
                    {currentTypeConfig.showValue && (
                      <div className="relative w-24 sm:w-36 shrink-0">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-[0.875rem]">
                          #
                        </span>
                        <input
                          type="text"
                          value={item.value}
                          onChange={(e) => updateItem(item.id, "value", e.target.value)}
                          placeholder="Value"
                          className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-salami-green/30 focus:border-salami-green transition-all text-[0.875rem]"
                        />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      disabled={items.length <= 2}
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}

                <button
                  type="button"
                  onClick={addItem}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-border text-muted-foreground hover:border-salami-green hover:text-salami-green hover:bg-salami-green-light/30 transition-all text-[0.875rem]"
                  style={{ fontWeight: 500 }}
                >
                  <Plus className="w-4 h-4" />
                  Add Item
                </button>
              </motion.div>
            )}

            {/* ── BULK PASTE MODE ── */}
            {inputMode === "bulk" && (
              <motion.div
                key="bulk"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="p-3 rounded-xl bg-blue-50 text-blue-700 text-[0.8125rem] flex items-start gap-2">
                  <Zap className="w-4 h-4 mt-0.5 shrink-0" />
                  <div>
                    <span style={{ fontWeight: 600 }}>Paste your list</span> — one item per line.
                    Optionally add a comma-separated value:
                    <code className="block mt-1 text-[0.75rem] bg-blue-100 px-2 py-1 rounded-lg">
                      Grand Prize, 100{"\n"}
                      Runner Up, 50{"\n"}
                      Consolation
                    </code>
                  </div>
                </div>

                <div className="relative">
                  <textarea
                    value={bulkText}
                    onChange={(e) => setBulkText(e.target.value)}
                    placeholder={`Alice\nBob\nCharlie\nDiana\nEve\n\nOr with values:\nGrand Prize, 100\nRunner Up, 50`}
                    rows={10}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-salami-green/30 focus:border-salami-green transition-all text-[0.875rem] font-mono resize-none"
                  />
                  {bulkText && (
                    <div className="absolute bottom-3 right-3 text-[0.6875rem] text-muted-foreground bg-white px-2 py-1 rounded-md border border-border">
                      {bulkText.split("\n").filter((l) => l.trim()).length} items detected
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={applyBulkText}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-salami-green text-white rounded-xl hover:bg-salami-green-dark transition-all shadow-sm text-[0.875rem]"
                    style={{ fontWeight: 600 }}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Apply Items
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBulkText("");
                      setInputMode("manual");
                    }}
                    className="px-4 py-2.5 text-[0.875rem] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── FILE UPLOAD MODE ── */}
            {inputMode === "file" && (
              <motion.div
                key="file"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="p-3 rounded-xl bg-blue-50 text-blue-700 text-[0.8125rem] flex items-start gap-2">
                  <FileText className="w-4 h-4 mt-0.5 shrink-0" />
                  <div>
                    <span style={{ fontWeight: 600 }}>Upload a file</span> — supported formats:
                    <span className="inline-flex gap-1.5 ml-1">
                      <code className="bg-blue-100 px-1.5 py-0.5 rounded text-[0.6875rem]">.txt</code>
                      <code className="bg-blue-100 px-1.5 py-0.5 rounded text-[0.6875rem]">.csv</code>
                      <code className="bg-blue-100 px-1.5 py-0.5 rounded text-[0.6875rem]">.tsv</code>
                    </span>
                    <span className="block mt-1 text-[0.75rem]">One item per line. CSV files can have label, value columns.</span>
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.csv,.tsv,text/plain,text/csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex flex-col items-center justify-center gap-3 p-10 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
                    isDragOver
                      ? "border-salami-green bg-salami-green-light/40 scale-[1.01]"
                      : "border-border hover:border-salami-green/50 hover:bg-salami-green-light/10"
                  }`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                    isDragOver ? "bg-salami-green/10" : "bg-gray-100"
                  }`}>
                    <Upload className={`w-7 h-7 ${isDragOver ? "text-salami-green" : "text-muted-foreground"}`} />
                  </div>
                  <div className="text-center">
                    <div className="text-[0.9375rem] text-foreground" style={{ fontWeight: 500 }}>
                      {isDragOver ? "Drop your file here" : "Drag & drop a file here"}
                    </div>
                    <div className="text-[0.8125rem] text-muted-foreground mt-1">
                      or <span className="text-salami-green underline">click to browse</span>
                    </div>
                  </div>

                  {dragFileName && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-border text-[0.8125rem]">
                      <FileText className="w-4 h-4 text-salami-green" />
                      <span className="text-foreground" style={{ fontWeight: 500 }}>{dragFileName}</span>
                      <CheckCircle2 className="w-4 h-4 text-salami-green" />
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setInputMode("manual")}
                  className="text-[0.875rem] text-muted-foreground hover:text-foreground transition-colors"
                >
                  Back to manual entry
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Settings Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-border p-6 space-y-5">
          <h2 className="text-foreground font-['Poppins',sans-serif]" style={{ fontWeight: 600 }}>
            Settings
          </h2>

          <div className="flex items-center justify-between p-4 rounded-xl bg-input-background">
            <div>
              <div className="text-foreground text-[0.875rem]" style={{ fontWeight: 500 }}>
                Allow "Better Luck Next Time"
              </div>
              <div className="text-[0.75rem] text-muted-foreground mt-0.5">
                Some spins will land on a "no win" result
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAllowBetterLuck(!allowBetterLuck)}
              className={`relative w-12 h-7 rounded-full transition-colors ${
                allowBetterLuck ? "bg-salami-green" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-transform ${
                  allowBetterLuck ? "left-[22px]" : "left-0.5"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 border border-border rounded-xl text-muted-foreground hover:bg-muted transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-8 py-3 bg-salami-green text-white rounded-xl hover:bg-salami-green-dark transition-all shadow-lg shadow-salami-green/25"
            style={{ fontWeight: 600 }}
          >
            <Save className="w-5 h-5" />
            Create Wheel
          </button>
        </div>
      </motion.form>
    </div>
  );
}
