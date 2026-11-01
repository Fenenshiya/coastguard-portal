import React, { useEffect, useState } from 'react';
import { 
  Star, 
  Users, 
  Sparkles, 
  AlertCircle, 
  MessageSquare, 
  ThumbsUp, 
  Send, 
  ShieldCheck,
  Flag
} from 'lucide-react';
import { useBeachStore } from '../../store/useBeachStore';
import { beachDataService } from '../../services/beachDataService';
import { Review, CrowdReport } from '../../types';

export const ReviewsAndCrowdView: React.FC = () => {
  const { selectedBeachId, getSelectedBeach } = useBeachStore();
  const currentBeach = getSelectedBeach();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [crowdReports, setCrowdReports] = useState<CrowdReport[]>([]);
  
  // Review submission state
  const [userName, setUserName] = useState('');
  const [rating, setRating] = useState(5);
  const [cleanliness, setCleanliness] = useState(4);
  const [crowdDensity, setCrowdDensity] = useState<'empty' | 'moderate' | 'packed'>('moderate');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Quick hazard tip state
  const [hazardTip, setHazardTip] = useState('');
  const [isSubmittingTip, setIsSubmittingTip] = useState(false);

  useEffect(() => {
    const unsubR = beachDataService.subscribeToReviews(selectedBeachId, setReviews);
    const unsubC = beachDataService.subscribeToCrowdReports(selectedBeachId, setCrowdReports);
    return () => {
      unsubR();
      unsubC();
    };
  }, [selectedBeachId]);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setIsSubmitting(true);

    beachDataService.submitReview({
      beachId: selectedBeachId,
      userId: `user-${Date.now()}`,
      userName: userName.trim() || 'Beach Visitor',
      rating,
      cleanlinessRating: cleanliness,
      crowdDensity,
      comment: comment.trim()
    });

    setIsSubmitting(false);
    setShowReviewForm(false);
    setComment('');
    setUserName('');
  };

  const handleTipSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hazardTip.trim()) return;
    setIsSubmittingTip(true);

    beachDataService.submitCrowdReport({
      beachId: selectedBeachId,
      reportType: 'hazard_spotted',
      details: hazardTip.trim()
    });

    setIsSubmittingTip(false);
    setHazardTip('');
  };

  return (
    <div className="space-y-6">
      
      {/* Crowd Observations & Community Radar */}
      <div className="bg-gradient-to-r from-ocean-600 to-ocean-800 text-white p-6 rounded-2xl shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-5 h-5 text-ocean-200" />
              <h3 className="font-black text-lg">Community Beach Observations</h3>
            </div>
            <p className="text-xs text-ocean-100 max-w-xl">
              Crowd-sourced safety observations reported by beachgoers in the last 24 hours. Help keep your fellow swimmers informed!
            </p>
          </div>

          <form onSubmit={handleTipSubmit} className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Report jellyfish, water clarity, or parking..."
              value={hazardTip}
              onChange={(e) => setHazardTip(e.target.value)}
              className="px-3.5 py-2 rounded-xl text-xs text-slate-800 bg-white placeholder-slate-400 outline-none w-64 md:w-80 shadow"
            />
            <button
              type="submit"
              disabled={isSubmittingTip || !hazardTip.trim()}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-xs rounded-xl shadow transition"
            >
              Post Tip
            </button>
          </form>
        </div>

        {/* Recent Crowd Tips */}
        {crowdReports.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 pt-4 border-t border-ocean-500/50">
            {crowdReports.map((tip) => (
              <div key={tip.id} className="bg-white/10 backdrop-blur rounded-xl p-3 text-xs flex items-start justify-between">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-amber-300 flex-shrink-0 mt-0.5" />
                  <p className="text-white/95 leading-relaxed">{tip.details}</p>
                </div>
                {tip.verifiedByLifeguard && (
                  <span className="text-[10px] bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Verified</span>
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reviews & Ratings Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Visitor Reviews & Experiences</h3>
            <p className="text-xs text-slate-500">Authentic visitor feedback on beach safety and atmosphere</p>
          </div>

          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="px-4 py-2 bg-ocean-600 hover:bg-ocean-700 text-white text-xs font-bold rounded-xl shadow transition"
          >
            {showReviewForm ? 'Cancel' : 'Write a Review'}
          </button>
        </div>

        {/* Review Submission Form Modal / Box */}
        {showReviewForm && (
          <form onSubmit={handleReviewSubmit} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4 animate-scaleIn">
            <h4 className="font-bold text-xs uppercase text-slate-700 tracking-wider">Submit Beach Review</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Your Name</label>
                <input
                  type="text"
                  placeholder="e.g. Alex M."
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Overall Rating</label>
                <select
                  aria-label="Overall Rating"
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (5 - Outstanding)</option>
                  <option value={4}>⭐⭐⭐⭐ (4 - Great)</option>
                  <option value={3}>⭐⭐⭐ (3 - Average)</option>
                  <option value={2}>⭐⭐ (2 - Poor)</option>
                  <option value={1}>⭐ (1 - Dangerous)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Current Crowd Level</label>
                <select
                  aria-label="Current Crowd Level"
                  value={crowdDensity}
                  onChange={(e) => setCrowdDensity(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none"
                >
                  <option value="empty">Quiet / Empty</option>
                  <option value="moderate">Moderate / Plenty of Space</option>
                  <option value="packed">Packed / High Density</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Review & Safety Notes *</label>
              <textarea
                rows={3}
                required
                placeholder="Share your experience: wave conditions, lifeguard presence, beach cleanliness..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow transition"
            >
              {isSubmitting ? 'Posting...' : 'Publish Review'}
            </button>
          </form>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.map((rev) => (
            <div key={rev.id} className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-ocean-100 text-ocean-700 font-bold text-xs flex items-center justify-center">
                    {rev.userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900">{rev.userName}</div>
                    <div className="text-[10px] text-slate-400">{new Date(rev.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${s <= rev.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
                    />
                  ))}
                </div>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed">{rev.comment}</p>

              <div className="pt-2 border-t border-slate-200/60 flex items-center gap-4 text-[11px] text-slate-500">
                <span>Crowd: <strong className="capitalize text-slate-700">{rev.crowdDensity}</strong></span>
                <span>•</span>
                <span>Cleanliness: <strong className="text-slate-700">{rev.cleanlinessRating}/5</strong></span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
