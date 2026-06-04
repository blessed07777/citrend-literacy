import { useState } from 'react'
import { motion } from 'framer-motion'
import { getBadge, Logo } from '../shared'

export default function ResultScreen({ name, stats, onRestart }) {
  const { totalScore = 0, quizScore = 0, quizTotal = 7, practiceScore = 0,
          errors = 0, hints = 0, timeSeconds = 0 } = stats

  const badge    = getBadge(totalScore)
  const mins     = Math.floor(timeSeconds / 60)
  const secs     = timeSeconds % 60
  const timeStr  = `${mins}:${String(secs).padStart(2,'0')}`
  const practiceP = Math.round((practiceScore / 130) * 100)
  const quizP     = Math.round((quizScore / quizTotal) * 100)

  const report = generateReport(name, totalScore, quizScore, quizTotal, errors, hints, timeStr, badge)
  const [copied, setCopied] = useState(false)

  const copyReport = async () => {
    try { await navigator.clipboard.writeText(report) } catch {}
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const history = JSON.parse(localStorage.getItem('citrend_history') || '[]')

  return (
    <div className="min-h-screen pt-20 pb-10 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Badge hero */}
        <motion.div initial={{opacity:0,scale:.8}} animate={{opacity:1,scale:1}} transition={{delay:.1}}
          className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full text-5xl
            bg-gradient-to-br ${badge.color} shadow-2xl mb-4 pulse-glow`}>
            {badge.icon}
          </div>
          <h2 className="text-3xl font-black text-white mb-1">
            {name}, <span className={`bg-gradient-to-r ${badge.color} bg-clip-text text-transparent`}>
              {totalScore}/100
            </span>
          </h2>
          <p className="text-lg font-bold text-gray-400 mb-3">
            🏆 Бейдж: <span className="text-white">{badge.label}</span>
          </p>
          <div className="flex justify-center gap-2 flex-wrap">
            {['🚀 Супер айтишник','🖥️ Мастер','🌟 Юный пользователь'].map((b, i) => (
              <span key={i} className={`text-xs font-bold px-3 py-1 rounded-full border
                ${totalScore >= [90,75,60][i]
                  ? 'border-[#A3E635] bg-[#A3E635]/15 text-[#A3E635]'
                  : 'border-white/10 text-gray-600'}`}>
                {b}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Stats grid */}
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:.25}}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label:'Практика', value:`${practiceP}%`, icon:'🖥️', color:'text-purple-400' },
            { label:'Тест',     value:`${quizP}%`,    icon:'🧠', color:'text-[#A3E635]' },
            { label:'Ошибки',   value:errors,          icon:'❌', color:'text-red-400' },
            { label:'Время',    value:timeStr,         icon:'⏱️', color:'text-blue-400' },
          ].map(s => (
            <div key={s.label} className="card p-4 text-center">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-500 font-bold">{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Feedback */}
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:.35}}
          className="card p-5 mb-5">
          <h3 className="font-black text-white mb-3">📊 Подробный разбор</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-black text-[#A3E635] uppercase tracking-widest mb-2">✅ Хорошо получилось</div>
              {getStrong(practiceScore, quizScore, quizTotal).map(t => (
                <div key={t} className="text-sm font-semibold text-gray-300 mb-1">— {t}</div>
              ))}
            </div>
            <div>
              <div className="text-xs font-black text-red-400 uppercase tracking-widest mb-2">📖 Нужно повторить</div>
              {getWeak(errors, hints, quizScore, quizTotal).map(t => (
                <div key={t} className="text-sm font-semibold text-gray-400 mb-1">— {t}</div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Certificate */}
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:.45}}
          className="relative border-2 border-purple-500/40 rounded-2xl p-6 mb-5 text-center overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 via-[#A3E635] to-purple-500" />
          <div className="flex justify-center mb-3"><Logo /></div>
          <div className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
            🏆 Сертификат об успешном прохождении
          </div>
          <div className="text-xs text-gray-500 mb-2">Урок 1 · Компьютерная грамотность</div>
          <div className="text-3xl font-black text-purple-300 mb-2">{name}</div>
          <div className="text-gray-400 text-sm mb-3">
            успешно прошёл(а) Урок 1 по компьютерной грамотности
          </div>
          <div className="text-2xl mb-2">{badge.icon}{badge.icon}{badge.icon}</div>
          <div className="inline-block bg-[#A3E635] text-black font-black text-xs px-4 py-1.5 rounded-full">
            citrend · Урок 1 ✓
          </div>
          <div className="text-gray-600 text-xs mt-3">{new Date().toLocaleDateString('ru-RU',{day:'numeric',month:'long',year:'numeric'})}</div>
        </motion.div>

        {/* Report */}
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:.55}}
          className="card p-5 mb-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-black text-white text-sm">📋 Отчёт для преподавателя / родителя</h3>
            <button onClick={copyReport}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all
                ${copied ? 'border-[#A3E635] bg-[#A3E635]/15 text-[#A3E635]' : 'border-white/20 text-gray-400 hover:border-purple-400 hover:text-white'}`}>
              {copied ? '✓ Скопировано!' : '📋 Скопировать'}
            </button>
          </div>
          <pre className="text-xs text-gray-400 font-mono whitespace-pre-wrap leading-relaxed bg-black/20 rounded-xl p-3 max-h-48 overflow-y-auto">
            {report}
          </pre>
        </motion.div>

        {/* History */}
        {history.length > 1 && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.65}}
            className="card p-5 mb-5">
            <h3 className="font-black text-white text-sm mb-3">📜 История прохождений</h3>
            <div className="space-y-2">
              {history.slice(0, 5).map((h, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-gray-400 font-semibold">{h.name}</span>
                  <span className="font-black text-purple-300">{h.score}/100</span>
                  <span className="text-gray-500">{h.date}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Action buttons */}
        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.7}}
          className="flex gap-3 flex-wrap justify-center">
          <button className="btn-green" onClick={() => window.print()}>🖨️ Распечатать сертификат</button>
          <button className="btn-outline" onClick={onRestart}>🔄 Пройти снова</button>
        </motion.div>
      </div>
    </div>
  )
}

function getStrong(practiceScore, quizScore, quizTotal) {
  const arr = []
  if (practiceScore >= 65) arr.push('Работа с файлами и папками')
  if (practiceScore >= 90) arr.push('Перетаскивание файлов')
  if (quizScore / quizTotal >= 0.7) arr.push('Знание горячих клавиш')
  if (quizScore >= 4) arr.push('Распознавание типов файлов')
  if (arr.length === 0) arr.push('Ты прошёл урок до конца — это уже победа!')
  return arr
}

function getWeak(errors, hints, quizScore, quizTotal) {
  const arr = []
  if (errors > 2) arr.push('Внимательность при выборе ответов')
  if (hints > 2) arr.push('Самостоятельное выполнение заданий')
  if (quizScore / quizTotal < 0.6) arr.push('Горячие клавиши Ctrl+C, V, S')
  if (quizScore / quizTotal < 0.5) arr.push('Понятие буфера обмена')
  if (arr.length === 0) arr.push('Всё прошло хорошо! Продолжай практиковаться.')
  return arr
}

function generateReport(name, score, quizScore, quizTotal, errors, hints, time, badge) {
  return `ОТЧЁТ ОБ УРОКЕ
Ученик: ${name}
Дата: ${new Date().toLocaleDateString('ru-RU', { day:'numeric', month:'long', year:'numeric' })}

РЕЗУЛЬТАТ
─────────────────────────────
Итоговый балл: ${score}/100
Бейдж: ${badge.icon} ${badge.label}
Тест: ${quizScore}/${quizTotal} правильных
Ошибок: ${errors}
Подсказок использовано: ${hints}
Время прохождения: ${time}

ТЕМА: Компьютерная грамотность
Урок 1: Рабочий стол, файлы, папки и горячие клавиши

ХОРОШО ПОЛУЧИЛОСЬ
─────────────────────────────
${getStrong(score * 1.3, quizScore, quizTotal).map(s => `• ${s}`).join('\n')}

НУЖНО ПОВТОРИТЬ
─────────────────────────────
${getWeak(errors, hints, quizScore, quizTotal).map(w => `• ${w}`).join('\n')}

РЕКОМЕНДАЦИЯ
─────────────────────────────
На следующем уроке можно закрепить горячие клавиши
и перейти к теме: браузер и поиск информации.

─────────────────────────────
Powered by citrend AI Education
"Готовим к новому будущему"`
}
