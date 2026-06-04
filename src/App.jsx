import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import WelcomeScreen from './components/WelcomeScreen'
import InteractiveSlides from './components/InteractiveSlides'
import PracticeSimulator from './components/PracticeSimulator'
import MiniGameQuiz from './components/MiniGameQuiz'
import ResultScreen from './components/ResultScreen'

const PHASES = ['welcome', 'slides', 'practice', 'quiz', 'results']

const page = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.4 } },
  exit:    { opacity: 0, x: -40, transition: { duration: 0.25 } },
}

export default function App() {
  const [phase, setPhase] = useState('welcome')
  const [childName, setChildName] = useState('')
  const [stats, setStats] = useState({ practiceScore: 0, quizScore: 0, quizTotal: 7,
    errors: 0, hints: 0, startTime: null, timeSeconds: 0 })

  const go = (next) => setPhase(next)

  const startLesson = (name) => {
    setChildName(name)
    setStats(s => ({ ...s, startTime: Date.now() }))
    go('slides')
  }

  const finishSlides = () => go('practice')

  const finishPractice = ({ score, hints }) => {
    setStats(s => ({ ...s, practiceScore: score, hints: s.hints + hints }))
    go('quiz')
  }

  const finishQuiz = ({ score, total, errors, hints }) => {
    const elapsed = Math.round((Date.now() - stats.startTime) / 1000)
    const practiceContrib = Math.round((stats.practiceScore / 130) * 40)
    const quizContrib    = Math.round((score / total) * 60)
    const totalScore     = Math.min(100, practiceContrib + quizContrib)
    const finalStats = {
      ...stats,
      quizScore: score, quizTotal: total,
      errors: stats.errors + errors,
      hints:  stats.hints + hints,
      timeSeconds: elapsed,
      totalScore,
    }
    setStats(finalStats)

    const entry = { name: childName, score: totalScore, date: new Date().toLocaleDateString('ru-RU'),
      quizScore: score, quizTotal: total, errors: finalStats.errors, hints: finalStats.hints,
      time: elapsed, badge: getBadge(totalScore) }
    const history = JSON.parse(localStorage.getItem('citrend_history') || '[]')
    history.unshift(entry)
    localStorage.setItem('citrend_history', JSON.stringify(history.slice(0, 10)))
    go('results')
  }

  const restart = () => {
    setStats({ practiceScore: 0, quizScore: 0, quizTotal: 7,
      errors: 0, hints: 0, startTime: null, timeSeconds: 0 })
    setChildName('')
    go('welcome')
  }

  const phaseIndex = PHASES.indexOf(phase)

  return (
    <div className="min-h-screen bg-[#0D0D1A] font-sans">
      {phase !== 'welcome' && (
        <TopBar name={childName} phaseIndex={phaseIndex} />
      )}
      <AnimatePresence mode="wait">
        <motion.div key={phase} variants={page} initial="initial" animate="animate" exit="exit">
          {phase === 'welcome'   && <WelcomeScreen onStart={startLesson} />}
          {phase === 'slides'    && <InteractiveSlides name={childName} onFinish={finishSlides} />}
          {phase === 'practice'  && <PracticeSimulator name={childName} onFinish={finishPractice} />}
          {phase === 'quiz'      && <MiniGameQuiz name={childName} onFinish={finishQuiz} />}
          {phase === 'results'   && <ResultScreen name={childName} stats={stats} onRestart={restart} />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function TopBar({ name, phaseIndex }) {
  const labels = ['', 'Теория', 'Практика', 'Тест', 'Результат']
  const icons  = ['', '📚', '🖥️', '🧠', '🏆']
  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center gap-3 px-6 py-3
                    bg-[#0D0D1A]/90 border-b border-white/10 backdrop-blur-sm">
      <Logo small />
      <div className="flex-1 flex items-center justify-center gap-2">
        {[1,2,3,4].map(i => (
          <div key={i} className="flex items-center gap-1">
            <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-all
              ${i < phaseIndex ? 'bg-green-500/20 text-green-400' :
                i === phaseIndex ? 'bg-purple-500/30 text-purple-300 ring-1 ring-purple-500' :
                'text-gray-600'}`}>
              <span>{icons[i]}</span> {labels[i]}
            </div>
            {i < 4 && <div className={`w-6 h-0.5 ${i < phaseIndex ? 'bg-green-500' : 'bg-white/10'}`} />}
          </div>
        ))}
      </div>
      <div className="text-xs font-bold text-gray-400">👤 {name}</div>
    </div>
  )
}

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
          <div className="text-white font-black text-xl leading-none">ci<span className="text-purple-400">trend</span></div>
          <div className="text-gray-500 text-[9px] font-bold uppercase tracking-widest">AI Education</div>
        </div>
      )}
    </div>
  )
}

export function getBadge(score) {
  if (score >= 90) return { label: 'Супер айтишник',      icon: '🚀', color: 'from-yellow-400 to-orange-400' }
  if (score >= 75) return { label: 'Мастер рабочего стола', icon: '🖥️', color: 'from-purple-400 to-blue-400' }
  if (score >= 60) return { label: 'Юный пользователь',  icon: '🌟', color: 'from-green-400 to-teal-400' }
  return               { label: 'Повтори миссию',         icon: '💪', color: 'from-gray-400 to-gray-500' }
}
