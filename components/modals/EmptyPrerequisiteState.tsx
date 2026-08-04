'use client';

import React from 'react';
import { LucideIcon, AlertCircle } from 'lucide-react';

interface EmptyPrerequisiteStateProps {
  title: string;
  description: string;
  buttonText?: string;
  onButtonClick?: () => void;
  icon?: LucideIcon;
  colorScheme?: 'amber' | 'purple' | 'emerald' | 'rose';
}

export default function EmptyPrerequisiteState({
  title,
  description,
  buttonText,
  onButtonClick,
  icon: IconComponent = AlertCircle,
  colorScheme = 'amber',
}: EmptyPrerequisiteStateProps) {
  // Palette styling preset mapping
  const styles = {
    amber: {
      container: 'from-amber-500/10 via-amber-400/5 to-amber-500/20 border-amber-400/60',
      iconBox: 'bg-gradient-to-tr from-amber-500 to-amber-400 text-amber-950 shadow-amber-500/30',
      title: 'text-amber-950',
      description: 'text-amber-900/80',
      button: 'from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-amber-500/30',
    },
    purple: {
      container: 'from-purple-500/10 via-purple-400/5 to-purple-500/20 border-purple-400/60',
      iconBox: 'bg-gradient-to-tr from-purple-600 to-purple-500 text-white shadow-purple-500/30',
      title: 'text-purple-950',
      description: 'text-purple-900/80',
      button: 'from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-purple-500/30',
    },
    emerald: {
      container: 'from-emerald-500/10 via-emerald-400/5 to-emerald-500/20 border-emerald-400/60',
      iconBox: 'bg-gradient-to-tr from-emerald-600 to-emerald-500 text-white shadow-emerald-500/30',
      title: 'text-emerald-950',
      description: 'text-emerald-900/80',
      button: 'from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-emerald-600/30',
    },
    rose: {
      container: 'from-rose-500/10 via-rose-400/5 to-rose-500/20 border-rose-400/60',
      iconBox: 'bg-gradient-to-tr from-rose-600 to-rose-500 text-white shadow-rose-500/30',
      title: 'text-rose-950',
      description: 'text-rose-900/80',
      button: 'from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 shadow-rose-600/30',
    },
  }[colorScheme];

  return (
    <div
      className={`bg-gradient-to-br ${styles.container} border-2 p-6 rounded-3xl text-center space-y-3.5 my-3 shadow-xl animate-in zoom-in-95 duration-300 relative overflow-hidden backdrop-blur-xs`}
    >
      {/* BOUNCY ANIMATED ICON BOX */}
      <div
        className={`w-14 h-14 ${styles.iconBox} rounded-2xl flex items-center justify-center mx-auto shadow-lg animate-bounce`}
      >
        <IconComponent className="w-8 h-8 stroke-[2.5]" />
      </div>

      {/* TEXT CONTENT */}
      <div>
        <h4 className={`font-black ${styles.title} text-base sm:text-lg tracking-tight`}>{title}</h4>
        <p className={`text-xs font-semibold ${styles.description} mt-1 max-w-xs mx-auto leading-relaxed`}>
          {description}
        </p>
      </div>

      {/* ACTION BUTTON */}
      {buttonText && onButtonClick && (
        <button
          type="button"
          onClick={onButtonClick}
          className={`w-full sm:w-auto bg-gradient-to-r ${styles.button} text-white font-black text-xs sm:text-sm px-6 py-3.5 rounded-2xl shadow-lg active:scale-95 transition transform cursor-pointer flex items-center justify-center gap-2 mx-auto mt-2`}
        >
          <span>{buttonText}</span>
        </button>
      )}
    </div>
  );
}
