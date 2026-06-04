import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const QUESTIONS = [
  {
    id:'q1', type:'icon-pick',
    text:'Где находится корзина?',
    options:['📁','📝','🗑️','🌐'],
    labels:['Папка','Документ','Корзина','Браузер'],
    correct:2, points:15,
  },
  {
    id:'q2', type:'choice',
    text:'Что такое папка?',
    options:['Место для хранения файлов','Кнопка выключения','Музыкальный файл','Ошибка компьютера'],
    correct:0, points:15,
  },
  {
    id:'q3', type:'choice',
    text:'Какой файл является картинкой?',
    options:['photo.png','music.mp3','text.docx','game.exe'],
    correct:0, points:15,
  },
  {
    id:'q4', type:'choice',
    text:'Что делает Ctrl + C?',
    options:['Копировать','Вставить','Удалить','Закрыть'],
    correct:0, points:15,
  },
  {
    id:'q5', type:'choice',
    text:'Что делает Ctrl + V?',
    options:['Вставить','Копировать','Сохранить','Отменить'],
    correct:0, points:15,
  },
  {
    id:'q6', type:'choice',
    text:'Что такое буфер обмена?',
    options:['Временное место для скопированного','Корзина для мусора','Панель задач','Жёсткий диск'],
    correct:0, points:15,
  },
  {
    id:'q7', type:'drag-drop',
    text:'Разложи файлы по папкам',
    files:[
      { id:'f-photo', name:'photo.png',     icon:'🖼️', folder:'Фото'      },
      { id:'f-music', name:'music.mp3',     icon:'🎵', folder:'Музыка'    },
      { id:'f-doc',   name:'homework.docx', icon:'📝', folder:'Документы' },
    ],
    folders:['Фото','Музыка','Документы'],
    points:10,
  },
]

const slide = {
  initial:{ opacity:0, x:50 },
  animate:{ opacity:1, x:0, transition:{ duration:.3 } },
  exit:   { opacity:0, x:-50, transition:{ duration:.2 } },
}

export default function MiniGameQuiz({ name, onFinish }) {
  const [qi,      setQi]      = useState(0)
  const [answers, setAnswers] = useState({})
  const [feedback,setFeedback]= useState(null) // 'correct'|'wrong'
  const [errors,  setErrors]  = useState(0)
  const [hints,   setHints]   = useState(0)
  const q = QUESTIONS[qi]

  const submit = (answerIdx) => {
    if (feedback) return
    const correct = q.type === 'drag-drop'
      ? answerIdx
      : answerIdx === q.correct
    setAnswers(prev => ({ ...prev, [q.id]: answerIdx }))
    setFeedback(correct ? 'correct' : 'wrong')
    if (!correct) setErrors(e => e + 1)
  }

  const next = () => {
    setFeedback(null)
    if (qi === QUESTIONS.length - 1) {
      // Calculate score
      let score = 0
      QUESTIONS.forEach((q, i) => {
        if (i < QUESTIONS.length - 1) {
          if (answers[q.id] === q.correct) score += q.points
        } else {
          // drag-drop scored separately in its component
          if (answers['q7-done']) score += 10
        }
      })
      onFinish({ score, total: QUESTIONS.length, errors, hints })
    } else {
      setQi(i => i + 1)
    }
  }

  const progress = ((qi + (feedback ? 1 : 0)) / QUESTIONS.length) * 100

  return (
    <div className="min-h-screen pt-16 pb-8 px-4 flex flex-col items-center">
      {/* Header */}
      <div className="w-full max-w-xl mt-6 mb-5">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-black text-white">
            🧠 Проверка юного айтишника
          </span>
          <span className="text-sm font-black text-[#A3E635]">
            {qi + 1} / {QUESTIONS.length}
          </span>
        </div>
        {/* Progress bar */}
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div className="h-full bg-gradient-to-r from-purple-500 to-[#A3E635] rounded-full"
            animate={{ width: `${progress}%` }} />
        </div>
        {/* Q dots */}
        <div className="flex gap-1.5 mt-2 justify-center">
          {QUESTIONS.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all
              ${i < qi ? 'w-6 bg-[#A3E635]' : i === qi ? 'w-6 bg-purple-400' : 'w-3 bg-white/20'}`} />
          ))}
        </div>
      </div>

      {/* Question card */}
      <div className="w-full max-w-xl">
        <AnimatePresence mode="wait">
          <motion.div key={qi} variants={slide} initial="initial" animate="animate" exit="exit">
            <div className="card p-6">
              <h2 className="text-xl md:text-2xl font-black text-white mb-5">{q.text}</h2>

              {q.type === 'icon-pick' && (
                <IconPick q={q} feedback={feedback} onAnswer={submit} />
              )}
              {q.type === 'choice' && (
                <MultipleChoice q={q} feedback={feedback} onAnswer={submit} />
              )}
              {q.type === 'drag-drop' && (
                <DragDropSort q={q} onDone={(ok) => {
                  setAnswers(prev => ({ ...prev, 'q7-done': ok }))
                  setFeedback(ok ? 'correct' : 'wrong')
                  if (!ok) setErrors(e => e + 1)
                }} />
              )}

              {/* Feedback */}
              {feedback && (
                <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}
                  className={`mt-4 rounded-xl p-3 font-bold text-sm
                    ${feedback === 'correct'
                      ? 'bg-[#A3E635]/15 border border-[#A3E635]/40 text-[#A3E635]'
                      : 'bg-red-500/15 border border-red-500/40 text-red-300'}`}>
                  {feedback === 'correct' ? '✅ Правильно! Молодец!' : '❌ Не совсем. Попробуй запомнить правильный ответ.'}
                </motion.div>
              )}

              {feedback && (
                <button className="btn-green w-full mt-4" onClick={next}>
                  {qi === QUESTIONS.length - 1 ? '🏆 Смотреть результаты' : 'Следующий вопрос →'}
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ── Icon pick ── */
function IconPick({ q, feedback, onAnswer }) {
  const [chosen, setChosen] = useState(null)

  const pick = (i) => {
    if (feedback) return
    setChosen(i); onAnswer(i)
  }

  return (
    <div className="grid grid-cols-4 gap-3">
      {q.options.map((icon, i) => {
        let cls = 'border-white/15 bg-white/5 hover:border-purple-400 hover:bg-purple-500/10'
        if (chosen !== null) {
          if (i === q.correct) cls = 'border-[#A3E635] bg-[#A3E635]/15'
          else if (i === chosen && i !== q.correct) cls = 'border-red-400 bg-red-500/15'
          else cls = 'border-white/10 opacity-50'
        }
        return (
          <button key={i} onClick={() => pick(i)}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${cls}`}
            disabled={!!feedback}>
            <span className="text-4xl">{icon}</span>
            <span className="text-xs font-bold text-gray-300">{q.labels[i]}</span>
          </button>
        )
      })}
    </div>
  )
}

/* ── Multiple choice ── */
const LETTERS = ['А','Б','В','Г']
function MultipleChoice({ q, feedback, onAnswer }) {
  const [chosen, setChosen] = useState(null)

  const pick = (i) => {
    if (feedback) return
    setChosen(i); onAnswer(i)
  }

  return (
    <div className="grid gap-3">
      {q.options.map((opt, i) => {
        let cls = 'border-white/15 bg-white/5 hover:border-purple-400 hover:translate-x-1'
        if (chosen !== null) {
          if (i === q.correct) cls = 'border-[#A3E635] bg-[#A3E635]/15 text-[#A3E635]'
          else if (i === chosen) cls = 'border-red-400 bg-red-500/15'
          else cls = 'border-white/10 opacity-40'
        }
        return (
          <button key={i} onClick={() => pick(i)}
            className={`flex items-center gap-3 p-3.5 rounded-xl border-2 text-left text-sm font-bold
              text-white transition-all ${cls}`}
            disabled={!!feedback}>
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0
              ${i === q.correct && chosen !== null ? 'bg-[#A3E635] text-black'
                : i === chosen && chosen !== q.correct ? 'bg-red-500 text-white'
                : 'bg-white/15'}`}>
              {LETTERS[i]}
            </span>
            {opt}
          </button>
        )
      })}
    </div>
  )
}

/* ── Drag-drop sort ── */
function DragDropSort({ q, onDone }) {
  const [placements, setPlacements] = useState({}) // fileId → folderName
  const [dragId, setDragId]         = useState(null)
  const [dropTarget, setDropTarget] = useState(null)
  const [submitted, setSubmitted]   = useState(false)

  const allPlaced = q.files.every(f => placements[f.id])

  const drop = (e, folder) => {
    e.preventDefault()
    const id = e.dataTransfer.getData('text/plain')
    setPlacements(prev => ({ ...prev, [id]: folder }))
    setDropTarget(null)
  }

  const check = () => {
    const ok = q.files.every(f => placements[f.id] === f.folder)
    setSubmitted(true)
    onDone(ok)
  }

  return (
    <div>
      {/* Files to sort */}
      <div className="flex gap-2 flex-wrap mb-4">
        {q.files.map(f => {
          const placed = !!placements[f.id]
          return (
            <div key={f.id}
              draggable={!placed}
              onDragStart={(e) => { e.dataTransfer.setData('text/plain', f.id); setDragId(f.id) }}
              onDragEnd={() => setDragId(null)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-sm font-bold
                transition-all cursor-grab select-none
                ${placed ? 'border-[#A3E635]/30 bg-[#A3E635]/10 opacity-50 cursor-default' :
                  dragId === f.id ? 'opacity-50' :
                  'border-white/20 bg-white/5 hover:border-purple-400'}`}>
              <span>{f.icon}</span> {f.name}
            </div>
          )
        })}
      </div>

      {/* Folder drop zones */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {q.folders.map(folder => {
          const filesHere = q.files.filter(f => placements[f.id] === folder)
          const isOver = dropTarget === folder
          return (
            <div key={folder}
              onDragOver={(e) => { e.preventDefault(); setDropTarget(folder) }}
              onDragLeave={() => setDropTarget(null)}
              onDrop={(e) => drop(e, folder)}
              className={`rounded-xl border-2 p-3 min-h-[80px] transition-all
                ${isOver ? 'border-[#A3E635] bg-[#A3E635]/10 scale-105' : 'border-white/15 bg-white/5'}`}>
              <div className="text-xs font-black text-gray-400 mb-2">📁 {folder}</div>
              <div className="flex flex-wrap gap-1">
                {filesHere.map(f => (
                  <div key={f.id} className="flex items-center gap-1 text-xs font-bold bg-white/10 rounded-lg px-1.5 py-1">
                    {f.icon} <span className="text-[10px]">{f.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {allPlaced && !submitted && (
        <button className="btn-green" onClick={check}>✓ Проверить</button>
      )}

      {submitted && (
        <div>
          {q.files.map(f => {
            const correct = placements[f.id] === f.folder
            return (
              <div key={f.id} className={`text-xs font-bold mb-1 ${correct ? 'text-[#A3E635]' : 'text-red-400'}`}>
                {correct ? '✓' : '✗'} {f.name} → {placements[f.id]}
                {!correct && <span className="text-gray-400"> (правильно: {f.folder})</span>}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
