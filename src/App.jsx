import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import WelcomeScreen from './components/WelcomeScreen'
import InteractiveSlides from './components/InteractiveSlides'
import PracticeSimulator from './components/PracticeSimulator'
import MiniGameQuiz from './components/MiniGameQuiz'
import ResultScreen from './components/ResultScreen'
import { Logo, getBadge } from './shared'

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

export { Logo, getBadge }
