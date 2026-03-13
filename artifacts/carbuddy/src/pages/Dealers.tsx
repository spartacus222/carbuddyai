import React, { useState } from "react";

import {
  Search,
  MapPin,
  Phone,
  Globe,
  Star,
  Clock,
  ChevronRight,
  Plus,
  Building2,
  RefreshCw,
  Car,
  X,
  ExternalLink,
  MessageSquare,
} from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { DealerAgentPanel } from "@/components/DealerAgentPanel";
import { useUserLocation } from "@/hooks/use-user-location";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQueryClient } from "@tanstack/react-query";

interface Dealer {
  id: number;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
  website?: string;
  rating?: number;
  reviewCount?: number;
  brands?: string[];
  lastScannedAt?: string;
  createdAt: string;
  source?: string;
}

interface DealerWithReviews extends Dealer {
  reviews: Array<{
    id: number;
    reviewerName?: string;
    rating: number;
    comment?: string;
    reviewDate?: string;
  }>;
}

function StarRating({ rating, size = "sm" }: { rating?: number; size?: "sm" | "lg" }) {
  if (!rating) return null;
  const stars = Math.round(rating);
  const cls = size === "lg" ? "w-4 h-4" : "w-3 h-3";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`${cls} transition-colors ${s <= stars ? "fill-yellow-400 text-yellow-400" : "text-white/20"}`}
        />
      ))}
      <span className={`ml-1 ${size === "lg" ? "text-sm" : "text-[10px]"} text-white/60`}>
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

function ReviewForm({ dealerId, onSaved }: { dealerId: number; onSaved: () => void }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!comment.trim()) return;
    setSaving(true);
    try {
      await fetch(`/api/dealers/${dealerId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment, reviewerName: name || undefined }),
      });
      setComment("");
      setName("");
      setRating(5);
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3 pt-4 border-t border-white/[0.06]">
      <p className="text-[11px] font-semibold text-white/60 uppercase tracking-wider">Leave a Review</p>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            onMouseEnter={() => setHoverRating(s)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => setRating(s)}
            className="p-0.5"
          >
            <Star
              className={`w-5 h-5 transition-colors ${
                s <= (hoverRating || rating) ? "fill-yellow-400 text-yellow-400" : "text-white/20"
              }`}
            />
          </button>
        ))}
      </div>
      <input
        placeholder="Your name (optional)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full bg-white/[0.03] border border-white/[0.07] rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/25 outline-none focus:border-primary/40 transition-all"
      />
      <textarea
        placeholder="Share your experience with this dealer..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        className="w-full bg-white/[0.03] border border-white/[0.07] rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/25 outline-none focus:border-primary/40 transition-all resize-none"
      />
      <Button
        onClick={submit}
        disabled={saving || !comment.trim()}
        className="w-full h-9 text-sm"
      >
        {saving ? "Saving..." : "Submit Review"}
      </Button>
    </div>
  );
}

function DealerCard({
  dealer,
  onSelect,
}: {
  dealer: Dealer;
  onSelect: (d: Dealer) => void;
}) {
  const timeAgo = dealer.lastScannedAt
    ? new Date(dealer.lastScannedAt).toLocaleDateString()
    : null;

  return (
    <div
      className="rounded-xl overflow-hidden cursor-pointer group transition-all"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
      onClick={() => onSelect(dealer)}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-[15px] text-white/90 group-hover:text-white transition-colors truncate">
              {dealer.name}
            </h3>
            {dealer.address && (
              <div className="flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3 text-white/30 shrink-0" />
                <span className="text-[12px] text-white/40 truncate">
                  {dealer.address}
                  {dealer.city ? `, ${dealer.city}` : ""}
                  {dealer.state ? `, ${dealer.state}` : ""}
                </span>
              </div>
            )}
          </div>
          <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors shrink-0 mt-1" />
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {dealer.brands?.slice(0, 4).map((b) => (
            <Badge
              key={b}
              variant="outline"
              className="text-[10px] py-0 px-2 border-white/[0.08] text-white/50 bg-white/[0.02]"
            >
              {b}
            </Badge>
          ))}
          {(dealer.brands?.length ?? 0) > 4 && (
            <Badge variant="outline" className="text-[10px] py-0 px-2 border-white/[0.08] text-white/40">
              +{(dealer.brands?.length ?? 0) - 4} more
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {dealer.rating ? (
              <StarRating rating={dealer.rating} />
            ) : (
              <span className="text-[10px] text-white/25">No reviews yet</span>
            )}
            {dealer.reviewCount ? (
              <span className="text-[10px] text-white/30">({dealer.reviewCount})</span>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            {timeAgo && (
              <span className="flex items-center gap-1 text-[10px] text-white/25">
                <Clock className="w-3 h-3" />
                Scanned {timeAgo}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DealerDetailPanel({
  dealer,
  onClose,
}: {
  dealer: DealerWithReviews;
  onClose: () => void;
}) {
  const [reviews, setReviews] = useState(dealer.reviews);

  const reloadReviews = async () => {
    const res = await fetch(`/api/dealers/${dealer.id}/reviews`);
    if (res.ok) setReviews(await res.json());
  };

  return (
    <div
      className="h-full flex flex-col overflow-hidden"
      style={{
        background: "rgba(8,11,20,0.98)",
        borderLeft: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div
        className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]"
        style={{ background: "rgba(255,255,255,0.02)" }}
      >
        <h2 className="text-sm font-semibold text-white/90 truncate pr-4">{dealer.name}</h2>
        <button onClick={onClose} className="text-white/30 hover:text-white/60 transition-colors shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Info */}
        <div className="space-y-2">
          {dealer.address && (
            <div className="flex items-start gap-2 text-sm text-white/60">
              <MapPin className="w-4 h-4 mt-0.5 text-white/30 shrink-0" />
              <span>
                {dealer.address}
                {dealer.city ? `, ${dealer.city}` : ""}
                {dealer.state ? `, ${dealer.state}` : ""}
                {dealer.zip ? ` ${dealer.zip}` : ""}
              </span>
            </div>
          )}
          {dealer.phone && (
            <a
              href={`tel:${dealer.phone}`}
              className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
            >
              <Phone className="w-4 h-4 text-white/30" />
              {dealer.phone}
            </a>
          )}
          {dealer.website && (
            <a
              href={dealer.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              <Globe className="w-4 h-4" />
              <span className="truncate">{dealer.website.replace(/^https?:\/\//, "")}</span>
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
          )}
        </div>

        {/* Brands */}
        {(dealer.brands?.length ?? 0) > 0 && (
          <div>
            <p className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-2">
              Brands
            </p>
            <div className="flex flex-wrap gap-1.5">
              {dealer.brands!.map((b) => (
                <Badge key={b} variant="glass" className="text-[11px]">
                  {b}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Overall rating */}
        {dealer.rating && (
          <div>
            <p className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-2">
              Rating
            </p>
            <div className="flex items-center gap-3">
              <div
                className="text-3xl font-bold text-white"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {dealer.rating.toFixed(1)}
              </div>
              <div>
                <StarRating rating={dealer.rating} size="lg" />
                <p className="text-[11px] text-white/30 mt-1">
                  {dealer.reviewCount} review{dealer.reviewCount !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Reviews */}
        <div>
          <p className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-3">
            Reviews ({reviews.length})
          </p>
          {reviews.length === 0 ? (
            <p className="text-[12px] text-white/25">No reviews yet — be the first!</p>
          ) : (
            <div className="space-y-3">
              {reviews.map((r) => (
                <div
                  key={r.id}
                  className="p-3 rounded-xl"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[12px] font-medium text-white/70">
                      {r.reviewerName || "Anonymous"}
                    </span>
                    <StarRating rating={r.rating} />
                  </div>
                  {r.comment && (
                    <p className="text-[12px] text-white/50 leading-relaxed">{r.comment}</p>
                  )}
                  {r.reviewDate && (
                    <p className="text-[10px] text-white/25 mt-1.5">
                      {new Date(r.reviewDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          <ReviewForm dealerId={dealer.id} onSaved={reloadReviews} />
        </div>
      </div>
    </div>
  );
}

export default function Dealers() {
  const { location: userLocation } = useUserLocation();
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedDealer, setSelectedDealer] = useState<DealerWithReviews | null>(null);
  const [agentOpen, setAgentOpen] = useState(false);
  const queryClient = useQueryClient();

  const fetchDealers = async (q?: string) => {
    setLoading(true);
    try {
      const url = q && q.trim() ? `/api/dealers?q=${encodeURIComponent(q.trim())}` : "/api/dealers";
      const res = await fetch(url);
      if (res.ok) setDealers(await res.json());
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  React.useEffect(() => {
    fetchDealers();
  }, []);

  // Debounced live search as user types
  React.useEffect(() => {
    const timer = setTimeout(() => {
      fetchDealers(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDealers(search);
  };

  const openDealer = async (d: Dealer) => {
    const res = await fetch(`/api/dealers/${d.id}`);
    if (res.ok) setSelectedDealer(await res.json());
  };

  return (
    <div className="h-screen w-full flex overflow-hidden bg-[#080b14]">
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute rounded-full opacity-[0.04] blur-[120px] w-[600px] h-[600px] -top-[100px] right-[200px] bg-violet-500" />
        <div className="absolute rounded-full opacity-[0.03] blur-[120px] w-[400px] h-[400px] bottom-0 left-[100px] bg-blue-500" />
      </div>

      <Sidebar />

      <main className="flex-1 flex flex-col relative z-10 min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-[60px] flex-shrink-0 flex items-center justify-between px-6 border-b border-white/[0.06] bg-white/[0.01] backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 text-violet-400" />
            <span className="font-semibold text-[15px] text-white/90">Dealer Database</span>
            {dealers.length > 0 && (
              <Badge variant="glass" className="text-[10px]">
                {dealers.length} dealers
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fetchDealers(search)}
              className="text-white/40 hover:text-white rounded-xl"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <Button
              onClick={() => setAgentOpen(true)}
              className="h-9 text-sm font-medium gap-2"
              style={{ background: "linear-gradient(135deg, #7c3aed, #2563eb)" }}
            >
              <Plus className="w-4 h-4" />
              Scan for Dealers
            </Button>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Dealer list */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Search bar */}
            <div className="px-6 py-4 border-b border-white/[0.05]">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="text"
                  placeholder="Search by name, city, or address..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-primary/50 focus:bg-white/[0.06] transition-all"
                />
              </form>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {loading && dealers.length === 0 && (
                <div className="flex items-center justify-center py-16">
                  <RefreshCw className="w-5 h-5 animate-spin text-white/30" />
                </div>
              )}

              {!loading && dealers.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 opacity-50"
                    style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.2)" }}
                  >
                    <Building2 className="w-7 h-7 text-violet-400" />
                  </div>
                  <p className="text-white/50 text-sm font-medium mb-1">No dealers in database yet</p>
                  <p className="text-white/25 text-xs mb-6">
                    Use the Dealer Scout Agent to search and add nearby dealerships
                  </p>
                  <Button
                    onClick={() => setAgentOpen(true)}
                    style={{ background: "linear-gradient(135deg, #7c3aed, #2563eb)" }}
                    className="gap-2"
                  >
                    <Car className="w-4 h-4" />
                    Scan for Nearby Dealers
                  </Button>
                </div>
              )}

              {dealers.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {dealers.map((d) => (
                    <DealerCard key={d.id} dealer={d} onSelect={openDealer} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Detail panel */}
          {selectedDealer && (
            <div className="w-[380px] flex-shrink-0 overflow-hidden">
              <DealerDetailPanel
                dealer={selectedDealer}
                onClose={() => setSelectedDealer(null)}
              />
            </div>
          )}
        </div>
      </main>

      {/* Dealer Scout Agent modal */}
      {agentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="w-full max-w-md h-[600px] rounded-2xl overflow-hidden shadow-2xl">
            <DealerAgentPanel
              onClose={() => {
                setAgentOpen(false);
                fetchDealers(search);
              }}
              defaultLocation={userLocation.label}
            />
          </div>
        </div>
      )}
    </div>
  );
}
