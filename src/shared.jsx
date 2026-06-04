/* Shared components and utilities used across multiple files */

export function Logo({ small }) {
  return (
    <div className="flex items-center gap-2">
      <svg width={small ? 32 : 44} height={small ? 32 : 44} viewBox="0 0 120 120" fill="none">
        <path d="M22 60C22 37.9 39.9 20 62 20C74.1 20 85 25.6 92.5 34.4L79.2 44.3C74.4 38.1 67.6 34 62 34C47.6 34 36 46.3 36 60C36 73.7 47.6 86 62 86C67.6 86 74.4 81.9 79.2 75.7L92.5 85.6C85 94.4 74.1 100 62 100C39.9 100 22 82.1 22 60Z" fill="#8B5CF6"/>
        <rect x="72" y="38" width="24" height="52" rx="2" fill="#A3E635"/>
        <rect x="72" y="74" width="14" height="16" rx="1" fill="#8B5CF6"/>
        <circle cx="84" cy="21" r="12" fill="#A3E635"/>
      </svg>
      {!small && (
        <div>
          <div className="text-white font-black text-xl leading-none">
            ci<span className="text-purple-400">trend</span>
          </div>
          <div className="text-gray-500 text-[9px] font-bold uppercase tracking-widest">AI Education</div>
        </div>
      )}
    </div>
  )
}

export function getBadge(score) {
  if (score >= 90) return { label: 'Супер айтишник',       icon: '🚀', color: 'from-yellow-400 to-orange-400' }
  if (score >= 75) return { label: 'Мастер рабочего стола', icon: '🖥️', color: 'from-purple-400 to-blue-400'  }
  if (score >= 60) return { label: 'Юный пользователь',    icon: '🌟', color: 'from-green-400 to-teal-400'   }
  return               { label: 'Повтори миссию',          icon: '💪', color: 'from-gray-400 to-gray-500'    }
}
