import React from 'react';
import { useTranslation } from '../i18n/I18nContext';
import { IconSparkles, IconCrown, IconUtensils, IconCheckCircle } from './Icons';

export const RecommendationWidget = ({ type = 'room', data, onAction }) => {
  const { t } = useTranslation();

  if (!data) return null;

  if (type === 'room') {
    const { title, description, targetRoom, priceDiff, perks, originalPrice } = data;

    return (
      <div className="bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/40 rounded-2xl p-5 shadow-xl space-y-3 relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-amber-600 text-slate-950 text-[10px] font-extrabold px-3 py-1 rounded-bl-xl uppercase tracking-wider flex items-center gap-1 shadow-md">
          <IconSparkles size={12} /> {t('aiRecommendation')}
        </div>

        <div className="flex items-center gap-2 text-amber-400">
          <IconCrown size={20} />
          <h4 className="text-sm font-extrabold tracking-wide text-slate-100">{title}</h4>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">{description}</p>

        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
            {t('upgradePerks')}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {perks && perks.map((perk, i) => (
              <span key={i} className="text-[11px] bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                <IconCheckCircle size={11} className="text-emerald-400" /> {perk}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
          <div>
            <span className="text-[10px] text-slate-400">Upgrade Cost</span>
            <div className="text-sm font-extrabold text-emerald-400">
              +${priceDiff} <span className="text-[10px] text-slate-500 font-normal">/ night</span>
            </div>
          </div>

          <button
            onClick={() => onAction && onAction(targetRoom)}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold px-4 py-2 rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <IconCrown size={14} />
            {t('upgradeNow')}
          </button>
        </div>
      </div>
    );
  }

  if (type === 'food') {
    const { title, suggestedItem, reason, discount } = data;
    if (!suggestedItem) return null;

    return (
      <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <img
            src={suggestedItem.image}
            alt={suggestedItem.name}
            className="w-16 h-16 rounded-xl object-cover border border-slate-800 shrink-0"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80';
            }}
          />
          <div>
            <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
              <IconSparkles size={11} /> {t('suggestedPairing')} • <span className="text-amber-400">{discount}</span>
            </div>
            <h4 className="text-xs font-bold text-slate-100 mt-0.5">{suggestedItem.name}</h4>
            <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{reason}</p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="text-xs font-extrabold text-emerald-400 mb-1.5">${suggestedItem.price}</div>
          <button
            onClick={() => onAction && onAction(suggestedItem)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all"
          >
            <IconUtensils size={13} /> {t('addToOrder')}
          </button>
        </div>
      </div>
    );
  }

  return null;
};
