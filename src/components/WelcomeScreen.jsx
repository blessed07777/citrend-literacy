import { useState } from 'react'
import { motion } from 'framer-motion'
import { Logo } from '../App'

export default function WelcomeScreen({ onStart }) {
  const [name, setName] = useState('')
  const valid = name.trim().length >= 2

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4 py-8">
      {/* Background glows */}
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-400/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Logo top-left */}
      <div className="absolute top-6 left-6"><Logo /></div>

      {/* Badge */}
      <motion.div initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}} transition={{delay:.1}}
        className="mb-6 px-4 py-1.5 rounded-full border border-purple-500/40 bg-purple-500/15 text-purple-300 text-sm font-bold">
        🤖 AI Trend School · Для детей 7–10 лет
      </motion.div>

      {/* Main hero */}
      <motion.div initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{delay:.2}}
        className="text-center max-w-lg mb-8">

        <div className="float text-7xl mb-5">🖥️</div>

        <h1 className="text-4xl md:text-5xl font-black text-white mb-2 leading-tight">
          Компьютерная<br/>
          <span className="text-purple-400 text-glow">грамотность</span>
        </h1>
        <p className="text-gray-400 text-base md:text-lg mt-3">
          Урок 1: рабочий стол, файлы, папки<br/>и горячие клавиши
        </p>
      </motion.div>

      {/* Steps preview */}
      <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.35}}
        className="flex gap-3 flex-wrap justify-center mb-8">
        {[
          ['📚','Теория'],['🖥️','Практика'],['🧠','Тест'],['🏆','Результат']
        ].map(([ic, lb]) => (
          <div key={lb} className="card flex items-center gap-2 px-3 py-2 text-sm font-bold text-gray-300">
            {ic} {lb}
          </div>
        ))}
      </motion.div>

      {/* Name input card */}
      <motion.div initial={{opacity:0,scale:.95}} animate={{opacity:1,scale:1}} transition={{delay:.45}}
        className="card p-7 w-full max-w-sm">
        <label className="block text-sm font-bold text-gray-300 mb-2 text-center">
          👤 Как тебя зовут?
        </label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && valid && onStart(name.trim())}
          placeholder="Введи своё имя..."
          className="w-full bg-white/10 border border-white/15 rounded-xl px-4 py-3 text-white text-lg
                     font-bold text-center placeholder:text-gray-600 outline-none
                     focus:border-purple-400 focus:ring-2 focus:ring-purple-400/25 transition-all mb-4"
        />
        <button className="btn-green w-full text-lg" disabled={!valid}
          onClick={() => valid && onStart(name.trim())}>
          Начать урок →
        </button>
        {valid && (
          <p className="text-center text-gray-400 text-sm mt-3 font-semibold">
            Привет, <span className="text-purple-300 font-black">{name.trim()}</span>! Готов к уроку? 🚀
          </p>
        )}
      </motion.div>
    </div>
  )
}
