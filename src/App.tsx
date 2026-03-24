import React, { useState } from "react";
import { cn } from "@/utils/cn";

type ItemType = "found" | "lost";
type ItemStatus = "open" | "returned";

interface FormData {
  type: ItemType;
  itemName: string;
  category: string;
  description: string;
  location: string;
  date: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  images: string[];
}

interface FormErrors {
  itemName?: string;
  category?: string;
  description?: string;
  location?: string;
  date?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  images?: string;
}

interface Item extends FormData {
  id: string;
  postedAt: string;
  status: ItemStatus;
}

interface Claim {
  id: string;
  itemId: string;
  description: string;
  uniqueDetails: string;
  proofImage: string;
  score: number;
  status: "pending" | "approved" | "rejected";
}

const CATEGORIES = [
  "Electronics",
  "Wallet / Purse",
  "Keys",
  "Bag / Backpack",
  "Clothing",
  "Jewelry / Accessories",
  "ID / Documents",
  "Pet",
  "Vehicle",
  "Other",
];

const initialForm: FormData = {
  type: "lost",
  itemName: "",
  category: "",
  description: "",
  location: "",
  date: "",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  images: [],
};

function validateForm(data: FormData): FormErrors {
  const errors: FormErrors = {};

  if (!data.itemName.trim()) {
    errors.itemName = "Item name is required.";
  } else if (data.itemName.trim().length < 2) {
    errors.itemName = "Item name must be at least 2 characters.";
  }

  if (!data.category) {
    errors.category = "Please select a category.";
  }

  if (!data.description.trim()) {
    errors.description = "Description is required.";
  } else if (data.description.trim().length < 10) {
    errors.description = "Description must be at least 10 characters.";
  }

  if (!data.location.trim()) {
    errors.location = "Location is required.";
  }

  if (!data.date) {
    errors.date = "Date is required.";
  } else {
    const selected = new Date(data.date);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (selected > today) {
      errors.date = "Date cannot be in the future.";
    }
  }

  if (!data.contactName.trim()) {
    errors.contactName = "Your name is required.";
  }

  if (!data.contactEmail.trim()) {
    errors.contactEmail = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contactEmail.trim())) {
    errors.contactEmail = "Please enter a valid email address.";
  }

  if (data.contactPhone.trim() && !/^\+?[\d\s\-().]{7,15}$/.test(data.contactPhone.trim())) {
    errors.contactPhone = "Please enter a valid phone number.";
  }

  return errors;
}

function Badge({ type, status }: { type: ItemType; status?: ItemStatus }) {
  if (status === "returned") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700">
        🎉 Returned
      </span>
    );
  }
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        type === "lost"
          ? "bg-red-100 text-red-700"
          : "bg-green-100 text-green-700"
      )}
    >
      {type === "lost" ? "🔍 Lost" : "✅ Found"}
    </span>
  );
}

const ItemCard: React.FC<{ 
  item: Item; 
  onContact: (item: Item) => void;
  onClaim: (item: Item) => void;
  onReview: (item: Item) => void;
  claimsCount?: number;
}> = ({ 
  item, 
  onContact, 
  onClaim, 
  onReview, 
  claimsCount = 0 
}) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-gray-900 text-lg leading-tight">{item.itemName}</h3>
        <Badge type={item.type} status={item.status} />
      </div>

      {item.images && item.images.length > 0 && (
        <div className="flex gap-2 overflow-x-auto py-2">
          {item.images.map((url: string, i: number) => (
            <img key={i} src={url} alt="Item" className="h-24 w-24 object-cover rounded-lg border border-gray-100" />
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2 text-sm text-gray-500">
        <span className="flex items-center gap-1">
          <span>🏷️</span> {item.category}
        </span>
        <span className="flex items-center gap-1">
          <span>📍</span> {item.location}
        </span>
        <span className="flex items-center gap-1">
          <span>📅</span> {item.date}
        </span>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{item.description}</p>
      
      <div className="mt-auto pt-3 flex flex-wrap gap-2">
        <button
          onClick={() => onContact(item)}
          className="rounded-lg bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100 active:scale-95 transition-all flex-1"
        >
          Contact Summary
        </button>
        {item.type === "found" && item.status === "open" && (
          <button
            onClick={() => onClaim(item)}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 active:scale-95 transition-all flex-1"
          >
            Claim Item
          </button>
        )}
        {claimsCount > 0 && (
          <button
            onClick={() => onReview(item)}
            className="rounded-lg bg-orange-100 px-4 py-2 text-sm font-medium text-orange-800 hover:bg-orange-200 active:scale-95 transition-all w-full mt-1"
          >
            Review Claims ({claimsCount})
          </button>
        )}
      </div>
    </div>
  );
}

function ContactModal({ item, onClose }: { item: Item; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Contact Information</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>
        <div className="bg-indigo-50 rounded-xl p-4 flex flex-col gap-2">
          <p className="text-sm text-indigo-700 font-semibold">
            {item.type === "lost" ? "🔍 Lost Item" : "✅ Found Item"}: {item.itemName}
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">👤</span>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Name</p>
              <p className="text-gray-900 font-medium">{item.contactName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">✉️</span>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Email</p>
              <a href={`mailto:${item.contactEmail}`} className="text-indigo-600 hover:underline font-medium">
                {item.contactEmail}
              </a>
            </div>
          </div>
          {item.contactPhone && (
            <div className="flex items-center gap-3">
              <span className="text-2xl">📞</span>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Phone</p>
                <a href={`tel:${item.contactPhone}`} className="text-indigo-600 hover:underline font-medium">
                  {item.contactPhone}
                </a>
              </div>
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          className="mt-2 w-full rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
}

function InputField({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-600 mt-0.5">{error}</p>}
    </div>
  );
}

const fieldClass = (error?: string) =>
  cn(
    "w-full rounded-lg border px-3 py-2 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:ring-2",
    error
      ? "border-red-400 bg-red-50 focus:ring-red-300"
      : "border-gray-300 bg-white focus:border-indigo-400 focus:ring-indigo-200"
  );

function ClaimModal({ item, onClose, onSubmit }: { item: Item; onClose: () => void; onSubmit: (claim: Omit<Claim, "id" | "score" | "status" | "itemId">) => void }) {
  const [desc, setDesc] = useState("");
  const [details, setDetails] = useState("");
  const [proof, setProof] = useState("");

  const handleProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProof(URL.createObjectURL(e.target.files[0]));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 flex flex-col gap-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Claim Item</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>
        <p className="text-sm text-gray-600">Provide details to prove this item belongs to you.</p>
        
        <InputField label="Description of Item" required>
          <textarea className={fieldClass()} rows={2} value={desc} onChange={e => setDesc(e.target.value)} placeholder="Color, brand, contents..." />
        </InputField>

        <InputField label="Unique Details" required>
          <textarea className={fieldClass()} rows={2} value={details} onChange={e => setDetails(e.target.value)} placeholder="Scratches, serial number, wallpaper..." />
        </InputField>

        <InputField label="Proof Image (Optional)">
          <input type="file" accept="image/*" onChange={handleProofUpload} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
          {proof && <img src={proof} alt="Proof preview" className="mt-2 h-20 w-20 object-cover rounded shadow-sm" />}
        </InputField>

        <button
          onClick={() => {
            if (!desc.trim() || !details.trim()) return alert("Description and unique details are required.");
            onSubmit({ description: desc, uniqueDetails: details, proofImage: proof });
          }}
          className="mt-2 w-full rounded-xl bg-green-600 py-3 text-sm font-semibold text-white hover:bg-green-700 transition"
        >
          Submit Claim
        </button>
      </div>
    </div>
  );
}

function ReviewClaimsModal({ item, claims, onClose, onApprove }: { item: Item; claims: Claim[]; onClose: () => void; onApprove: (claimId: string) => void }) {
  const sorted = [...claims].sort((a, b) => b.score - a.score);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 flex flex-col gap-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Review Claims</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>
        <p className="text-sm text-gray-600 font-medium">{item.itemName}</p>
        
        <div className="flex flex-col gap-4 mt-2">
          {sorted.length === 0 && <p className="text-sm text-gray-500 italic">No claims left to review.</p>}
          {sorted.map((claim: Claim) => (
            <div key={claim.id} className="border border-gray-200 rounded-xl p-4 flex flex-col gap-3 relative overflow-hidden">
              {claim.status === "approved" && (
                <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">APPROVED</div>
              )}
              {claim.status === "rejected" && (
                <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">REJECTED</div>
              )}
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Verification Score: <span className="text-indigo-600">{claim.score} pts</span></p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Description provided:</p>
                <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded mt-1">{claim.description}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Unique details:</p>
                <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded mt-1">{claim.uniqueDetails}</p>
              </div>
              {claim.proofImage && (
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">Proof Image:</p>
                  <img src={claim.proofImage} alt="Proof" className="h-24 w-24 object-cover rounded border" />
                </div>
              )}
              
              {claim.status === "pending" && item.status !== "returned" && (
                <div className="flex gap-2 mt-2">
                  <button onClick={() => onApprove(claim.id)} className="flex-1 bg-green-100 text-green-700 py-1.5 rounded-lg text-sm font-medium hover:bg-green-200 transition">
                    Approve & Mark Returned
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
        <button onClick={onClose} className="mt-4 w-full rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">Close</button>
      </div>
    </div>
  );
}

export function App() {
  const [activeTab, setActiveTab] = useState<"browse" | "report">("browse");
  const [filterType, setFilterType] = useState<"all" | ItemType>("all");
  const [filterCategory, setFilterCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormData, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [items, setItems] = useState<Item[]>([
    {
      id: "1",
      type: "lost",
      itemName: "Black Leather Wallet",
      category: "Wallet / Purse",
      description: "Lost my black leather wallet near the central park food court. Contains ID cards and some cash.",
      location: "Central Park, Food Court",
      date: "2025-07-10",
      contactName: "Rahul Sharma",
      contactEmail: "rahul@example.com",
      contactPhone: "+91 98765 43210",
      postedAt: "2025-07-10",
      images: [],
      status: "open",
    },
    {
      id: "2",
      type: "found",
      itemName: "iPhone 14 Pro",
      category: "Electronics",
      description: "Found an iPhone 14 Pro (space black) at the bus stop near MG Road. Screen has a small crack.",
      location: "MG Road Bus Stop",
      date: "2025-07-12",
      contactName: "Priya Patel",
      contactEmail: "priya@example.com",
      contactPhone: "",
      postedAt: "2025-07-12",
      images: [],
      status: "open",
    },
    {
      id: "3",
      type: "lost",
      itemName: "Golden Labrador Puppy",
      category: "Pet",
      description: "Our 6-month old golden labrador puppy named 'Bruno' went missing from our garden. Wearing a red collar.",
      location: "Koramangala, 5th Block",
      date: "2025-07-13",
      contactName: "Amit Verma",
      contactEmail: "amit@example.com",
      contactPhone: "+91 99887 76655",
      postedAt: "2025-07-13",
      images: [],
      status: "open",
    },
    {
      id: "4",
      type: "found",
      itemName: "Blue Backpack",
      category: "Bag / Backpack",
      description: "Found a blue Nike backpack on bench at Cubbon Park. Contains books and a water bottle.",
      location: "Cubbon Park, Main Entrance",
      date: "2025-07-11",
      contactName: "Sneha Rao",
      contactEmail: "sneha@example.com",
      contactPhone: "",
      postedAt: "2025-07-11",
      images: [],
      status: "open",
    },
  ]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [contactItem, setContactItem] = useState<Item | null>(null);
  const [claimItem, setClaimItem] = useState<Item | null>(null);
  const [reviewItem, setReviewItem] = useState<Item | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const updated = { ...form, [name]: value };
    setForm(updated);
    if (touched[name as keyof FormData]) {
      const newErrors = validateForm(updated);
      setErrors((prev: FormErrors) => ({ ...prev, [name]: newErrors[name as keyof FormErrors] }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name } = e.target;
    setTouched((prev: Partial<Record<keyof FormData, boolean>>) => ({ ...prev, [name]: true }));
    const newErrors = validateForm(form);
    setErrors((prev: FormErrors) => ({ ...prev, [name]: newErrors[name as keyof FormErrors] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const allTouched: Partial<Record<keyof FormData, boolean>> = {
      itemName: true,
      category: true,
      description: true,
      location: true,
      date: true,
      contactName: true,
      contactEmail: true,
      contactPhone: true,
    };
    setTouched(allTouched);
    const newErrors = validateForm(form);
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const newItem: Item = {
      ...form,
      id: Date.now().toString(),
      postedAt: new Date().toISOString().split("T")[0],
      status: "open",
    };
    setItems((prev: Item[]) => [newItem, ...prev]);
    setForm(initialForm);
    setErrors({});
    setTouched({});
    setSubmitted(true);
    setSuccessMsg(
      `Your ${form.type} item report has been submitted successfully!`
    );
    setTimeout(() => {
      setSubmitted(false);
      setSuccessMsg("");
      setActiveTab("browse");
    }, 2500);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files).map((file: File) => URL.createObjectURL(file));
      setForm((prev: FormData) => ({ ...prev, images: [...prev.images, ...newImages] }));
    }
  };

  const submitClaim = (claimData: Omit<Claim, "id" | "score" | "status" | "itemId">) => {
    if (!claimItem) return;
    
    let score = 0;
    if (claimData.description.length > 10) score += 10;
    if (claimData.uniqueDetails.length > 5) score += 20;
    if (claimData.proofImage) score += 30;

    const newClaim: Claim = {
      ...claimData,
      id: Date.now().toString(),
      itemId: claimItem.id,
      score,
      status: "pending"
    };

    setClaims((prev: Claim[]) => [...prev, newClaim]);
    setClaimItem(null);
    setSuccessMsg("Your claim has been submitted for review.");
    setTimeout(() => { setSuccessMsg(""); setActiveTab("browse"); }, 3000);
  };

  const approveClaim = (claimId: string) => {
    if (!reviewItem) return;

    setClaims((prev: Claim[]) => prev.map((c: Claim) => {
      if (c.itemId !== reviewItem.id) return c;
      if (c.id === claimId) return { ...c, status: "approved" };
      return { ...c, status: "rejected" };
    }));

    setItems((prev: Item[]) => prev.map((i: Item) => i.id === reviewItem.id ? { ...i, status: "returned" } : i));
  };

  const filteredItems = items.filter((item) => {
    const matchType = filterType === "all" || item.type === filterType;
    const matchCategory = !filterCategory || item.category === filterCategory;
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      item.itemName.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.location.toLowerCase().includes(q);
    return matchType && matchCategory && matchSearch;
  });

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl shadow">
              🔎
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">Found & Lost Portal</h1>
              <p className="text-xs text-gray-500 hidden sm:block">Helping reunite people with their belongings</p>
            </div>
          </div>
          <nav className="flex gap-2">
            <button
              onClick={() => setActiveTab("browse")}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                activeTab === "browse"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              Browse
            </button>
            <button
              onClick={() => setActiveTab("report")}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                activeTab === "report"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              + Report Item
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Browse Tab */}
        {activeTab === "browse" && (
          <div className="flex flex-col gap-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900">Browse Reports</h2>
              <p className="text-gray-500 mt-1">Search for lost or found items in your area</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex flex-wrap gap-3">
              <input
                type="text"
                placeholder="🔍 Search items, locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 min-w-[180px] rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 transition"
              />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as "all" | ItemType)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 transition bg-white"
              >
                <option value="all">All Types</option>
                <option value="lost">Lost</option>
                <option value="found">Found</option>
              </select>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 transition bg-white"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Stats */}
            <div className="flex gap-3 flex-wrap">
              {(["all", "lost", "found"] as const).map((t) => (
                <div key={t} className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center gap-2 shadow-sm">
                  <span className="text-lg">{t === "all" ? "📋" : t === "lost" ? "🔍" : "✅"}</span>
                  <div>
                    <p className="text-xs text-gray-500 capitalize">{t === "all" ? "Total" : t}</p>
                    <p className="text-lg font-bold text-gray-900">
                      {t === "all" ? items.length : items.filter((i) => i.type === t).length}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Items Grid */}
            {filteredItems.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <p className="text-5xl mb-3">📭</p>
                <p className="font-medium text-lg">No items found</p>
                <p className="text-sm">Try adjusting your filters or report a new item.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                {filteredItems.map((item: Item) => (
                  <ItemCard 
                    key={item.id} 
                    item={item} 
                    onContact={setContactItem} 
                    onClaim={setClaimItem}
                    onReview={setReviewItem}
                    claimsCount={claims.filter((c: Claim) => c.itemId === item.id).length}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Report Tab */}
        {activeTab === "report" && (
          <div className="max-w-2xl mx-auto flex flex-col gap-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900">Report an Item</h2>
              <p className="text-gray-500 mt-1">Fill in the details below to post a lost or found report</p>
            </div>

            {successMsg && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                <span className="text-2xl">🎉</span>
                <p className="text-green-700 font-medium">{successMsg}</p>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              noValidate
              className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col gap-5"
            >
              {/* Type Toggle */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Report Type <span className="text-red-500">*</span></label>
                <div className="flex gap-3">
                  {(["lost", "found"] as ItemType[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, type: t }))}
                      className={cn(
                        "flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all capitalize",
                        form.type === t
                          ? t === "lost"
                            ? "border-red-500 bg-red-50 text-red-700"
                            : "border-green-500 bg-green-50 text-green-700"
                          : "border-gray-200 text-gray-500 hover:border-gray-300"
                      )}
                    >
                      {t === "lost" ? "🔍 Lost Item" : "✅ Found Item"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Item Name */}
              <InputField label="Item Name" required error={errors.itemName}>
                <input
                  type="text"
                  name="itemName"
                  value={form.itemName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g. Black Leather Wallet"
                  className={fieldClass(errors.itemName)}
                />
              </InputField>

              {/* Category */}
              <InputField label="Category" required error={errors.category}>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={fieldClass(errors.category)}
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </InputField>

              {/* Description */}
              <InputField label="Description" required error={errors.description}>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  rows={3}
                  placeholder="Describe the item in detail – color, brand, unique features..."
                  className={cn(fieldClass(errors.description), "resize-none")}
                />
              </InputField>

              {/* Location & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="Location" required error={errors.location}>
                  <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Where was it lost/found?"
                    className={fieldClass(errors.location)}
                  />
                </InputField>
                <InputField label="Date" required error={errors.date}>
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    max={today}
                    className={fieldClass(errors.date)}
                  />
                </InputField>
              </div>

              <hr className="border-gray-100" />
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Your Contact Details</p>

              {/* Contact Name */}
              <InputField label="Your Name" required error={errors.contactName}>
                <input
                  type="text"
                  name="contactName"
                  value={form.contactName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Full name"
                  className={fieldClass(errors.contactName)}
                />
              </InputField>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="Email Address" required error={errors.contactEmail}>
                  <input
                    type="email"
                    name="contactEmail"
                    value={form.contactEmail}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="you@example.com"
                    className={fieldClass(errors.contactEmail)}
                  />
                </InputField>
                <InputField label="Phone (optional)" error={errors.contactPhone}>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={form.contactPhone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="+91 98765 43210"
                    className={fieldClass(errors.contactPhone)}
                  />
                </InputField>
              </div>

              {/* Images Upload */}
              <InputField label="Photos (optional)">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                {form.images && form.images.length > 0 && (
                  <div className="flex gap-2 mt-3 overflow-x-auto py-1">
                    {form.images.map((url: string, i: number) => (
                      <div key={i} className="relative group flex-shrink-0">
                        <img src={url} alt={`Preview ${i}`} className="h-20 w-20 object-cover rounded-lg shadow-sm border border-gray-100" />
                        <button type="button" onClick={() => setForm((f: FormData) => ({ ...f, images: f.images.filter((_: string, idx: number) => idx !== i) }))} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-sm hover:scale-110 transition">×</button>
                      </div>
                    ))}
                  </div>
                )}
              </InputField>

              {/* Error Summary */}
              {submitted && Object.keys(errors).length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                  <p className="text-red-700 text-sm font-medium">
                    ⚠️ Please fix the errors above before submitting.
                  </p>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-semibold text-sm transition-all shadow-md shadow-indigo-200"
              >
                Submit Report
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Modals */}
      {contactItem && (
        <ContactModal item={contactItem} onClose={() => setContactItem(null)} />
      )}
      {claimItem && (
        <ClaimModal item={claimItem} onClose={() => setClaimItem(null)} onSubmit={submitClaim} />
      )}
      {reviewItem && (
        <ReviewClaimsModal 
          item={reviewItem} 
          claims={claims.filter((c: Claim) => c.itemId === reviewItem.id)} 
          onClose={() => setReviewItem(null)} 
          onApprove={approveClaim} 
        />
      )}

      {/* Footer */}
      <footer className="mt-12 border-t border-gray-200 bg-white py-6 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} Found &amp; Lost Portal — Helping reunite people with their belongings.
      </footer>
    </div>
  );
}
