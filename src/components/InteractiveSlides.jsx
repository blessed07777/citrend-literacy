import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/* ─── Slides — maps 1:1 to the 16 slides in the PPTX ─── */
const SLIDES = [
  { id: 'intro',          title: 'КомпьютернАя грамотность',  type: 'title'         },
  { id: 'today',          title: 'Сегодня на уроке',          type: 'today'         },
  { id: 'desktop',        title: 'Рабочий стол',              type: 'desktop-explore'},
  { id: 'files',          title: 'Файлы',                     type: 'file-types'    },
  { id: 'folders',        title: 'Папки помогают',            type: 'folder-chaos'  },
  { id: 'create-folder',  title: 'Создание папки',            type: 'context-sim'   },
  { id: 'try-self',       title: 'Попробуй сам!',             type: 'try-self'      },
  { id: 'success1',       title: 'Отлично!',                  type: 'success'       },
  { id: 'hotkeys',        title: 'Горячие клавиши',           type: 'hotkeys-info'  },
  { id: 'ctrl-cv',        title: 'Ctrl+C и Ctrl+V',           type: 'clipboard-demo'},
  { id: 'buffer',         title: 'Буфер обмена',              type: 'buffer-info'   },
  { id: 'more-keys',      title: 'Ctrl+S, Z, A',              type: 'more-hotkeys'  },
  { id: 'practice',       title: 'Практика',                  type: 'practice-list' },
  { id: 'success2',       title: 'Отлично!',                  type: 'success'       },
  { id: 'recap',          title: 'Что мы выучили?',           type: 'recap'         },
]

/* Free-pass types — no task needed to advance */
const FREE = new Set(['title','today','success','hotkeys-info','buffer-info','practice-list','try-self','recap'])

const anim = {
  initial: { opacity: 0, x: 60 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.35 } },
  exit:    { opacity: 0, x: -60, transition: { duration: 0.2  } },
}

export default function InteractiveSlides({ name, onFinish }) {
  const [idx,    setIdx]    = useState(0)
  const [done,   setDone]   = useState(new Set())
  const [points, setPoints] = useState(0)

  const current = SLIDES[idx]
  const isLast  = idx === SLIDES.length - 1
  const canNext = done.has(current.id) || FREE.has(current.type)

  const markDone = (id, pts = 10) => {
    if (!done.has(id)) { setDone(p => new Set(p).add(id)); setPoints(p => p + pts) }
  }
  const next = () => isLast ? onFinish() : setIdx(i => i + 1)
  const prev = () => setIdx(i => Math.max(0, i - 1))
  const skip = () => markDone(current.id, 0)

  return (
    <div className="min-h-screen pt-16 pb-8 px-4 flex flex-col items-center">
      {/* Progress bar */}
      <div className="w-full max-w-2xl mt-6 mb-4">
        <div className="flex justify-between text-xs text-gray-500 font-bold mb-1.5">
          <span>Слайд {idx + 1} / {SLIDES.length}</span>
          <span className="text-[#A3E635] font-black">+{points} очков</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div className="h-full bg-gradient-to-r from-purple-500 to-[#A3E635] rounded-full"
            animate={{ width: `${((idx + 1) / SLIDES.length) * 100}%` }} />
        </div>
      </div>

      {/* Slide */}
      <div className="w-full max-w-2xl">
        <AnimatePresence mode="wait">
          <motion.div key={current.id} variants={anim} initial="initial" animate="animate" exit="exit">
            <SlideCard
              slide={current}
              name={name}
              onDone={(pts) => markDone(current.id, pts)}
              isDone={done.has(current.id)}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="w-full max-w-2xl flex justify-between items-center mt-6 gap-3">
        <button className="btn-outline" onClick={prev} disabled={idx === 0}>← Назад</button>
        {!canNext && (
          <button
            className="text-sm text-gray-500 font-semibold underline underline-offset-2 hover:text-gray-300 transition-colors bg-transparent border-none cursor-pointer"
            onClick={skip}
          >
            Пропустить
          </button>
        )}
        <button className="btn-green" onClick={next} disabled={!canNext}>
          {isLast ? 'К практике →' : 'Дальше →'}
        </button>
      </div>
    </div>
  )
}

/* ─── Slide router ─── */
function SlideCard({ slide, name, onDone, isDone }) {
  const p = { name, onDone, isDone }
  const map = {
    title:           <SlideTitle />,
    today:           <SlideToday />,
    'desktop-explore': <SlideDesktop {...p} />,
    'file-types':    <SlideFiles {...p} />,
    'folder-chaos':  <SlideFolders {...p} />,
    'context-sim':   <SlideCreateFolder {...p} />,
    'try-self':      <SlideTrySelf name={name} />,
    success:         <SlideSuccess />,
    'hotkeys-info':  <SlideHotkeys />,
    'clipboard-demo':<SlideClipboard {...p} />,
    'buffer-info':   <SlideBuffer />,
    'more-hotkeys':  <SlideMoreKeys {...p} />,
    'practice-list': <SlidePractice name={name} />,
    recap:           <SlideRecap name={name} />,
  }
  return (
    <div className="card p-6 md:p-8">
      <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3">
        Слайд — {slide.title}
      </div>
      {map[slide.type] || null}
      {isDone && !FREE.has(slide.type) && (
        <div className="mt-4 text-[#A3E635] font-black text-sm pop">✅ Задание выполнено!</div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════
   SLIDE 1 — Тема урока
══════════════════════════════════════════ */
function SlideTitle() {
  return (
    <div className="text-center py-4">
      <div className="float text-7xl mb-5">🖥️</div>
      <h2 className="text-4xl font-black text-white mb-1">
        Компьютер<span className="text-purple-400">нАя</span>
      </h2>
      <h2 className="text-4xl font-black text-white mb-4">грамотность</h2>
      <p className="text-purple-300 font-bold text-lg mb-6">
        Урок первый:<br />
        Рабочий стол, файлы, папки и горячие клавиши
      </p>
      <div className="grid grid-cols-3 gap-3 mt-2">
        {[['🗂️','Файлы и папки'],['⌨️','Горячие клавиши'],['🗑️','Корзина']].map(([ic,lb]) => (
          <div key={lb} className="bg-white/5 rounded-xl p-3 text-center border border-white/10">
            <div className="text-3xl mb-1">{ic}</div>
            <div className="text-xs font-bold text-gray-300">{lb}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════
   SLIDE 2 — Сегодня на уроке
══════════════════════════════════════════ */
function SlideToday() {
  return (
    <div>
      <h2 className="text-2xl font-black text-white mb-4">Сегодня на уроке:</h2>
      <div className="bg-purple-500/15 border border-purple-500/30 rounded-2xl p-5 mb-5">
        <p className="text-white font-bold text-lg leading-relaxed">
          Мы узнаем, как устроен компьютерный рабочий стол и как быстро работать с файлами.
        </p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[
          { ic:'🖥️', title:'Рабочий стол', text:'Главный экран твоего компьютера' },
          { ic:'📁', title:'Файлы и папки', text:'Как хранить информацию в порядке' },
          { ic:'⌨️', title:'Горячие клавиши', text:'Быстрые команды без мышки' },
        ].map(({ ic, title, text }) => (
          <div key={title} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <div className="text-3xl mb-2">{ic}</div>
            <div className="font-black text-white text-sm mb-1">{title}</div>
            <div className="text-xs text-gray-400">{text}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════
   SLIDE 3 — Рабочий стол (интерактив)
══════════════════════════════════════════ */
const DESK_ITEMS = [
  { id:'folder',  icon:'📁', label:'Папка',         info:'Папки помогают хранить файлы в порядке.' },
  { id:'file',    icon:'📝', label:'Файл',           info:'Файл — это документ, картинка, музыка или видео.' },
  { id:'trash',   icon:'🗑️', label:'Корзина',       info:'Корзина хранит удалённые файлы. Их можно восстановить!' },
  { id:'taskbar', icon:'▬',  label:'Панель задач',   info:'Панель задач внизу. Отсюда можно открыть любую программу.' },
  { id:'pc',      icon:'💻', label:'Мой компьютер',  info:'Здесь хранятся все файлы, папки и диски компьютера.' },
]
function SlideDesktop({ onDone, isDone }) {
  const [clicked, setClicked] = useState(new Set())
  const [info,    setInfo]    = useState(null)

  const click = (item) => {
    setInfo(item)
    setClicked(prev => {
      const next = new Set(prev).add(item.id)
      if (next.size >= 4 && !isDone) onDone(15)
      return next
    })
  }

  return (
    <div>
      <h2 className="text-2xl font-black text-white mb-1">Рабочий стол</h2>
      <p className="text-gray-400 mb-4 text-sm">
        Рабочий стол — это главный экран компьютера.{' '}
        <strong className="text-white">Нажми на каждый элемент</strong>, чтобы узнать о нём!
      </p>
      <div className="grid grid-cols-5 gap-2 mb-4">
        {DESK_ITEMS.map(item => (
          <button key={item.id} onClick={() => click(item)}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-xs font-bold transition-all
              ${clicked.has(item.id)
                ? 'border-[#A3E635] bg-[#A3E635]/10 text-[#A3E635]'
                : 'border-white/10 bg-white/5 text-gray-300 hover:border-purple-400'}`}>
            <span className="text-3xl">{item.icon}</span>
            <span className="text-center leading-tight">{item.label}</span>
          </button>
        ))}
      </div>
      {info && (
        <div className="pop bg-purple-500/15 border border-purple-500/30 rounded-xl p-3 text-sm font-semibold text-purple-200">
          💡 <strong className="text-white">{info.label}</strong> — {info.info}
        </div>
      )}
      <div className="mt-3 text-xs text-gray-500 font-semibold">
        Нажато: {clicked.size} / {DESK_ITEMS.length} (нужно хотя бы 4)
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════
   SLIDE 4 — Файлы
══════════════════════════════════════════ */
const FILE_TYPES = [
  { name:'Текст',       ext:'.docx', icon:'📝', color:'text-blue-400',   ex:'homework.docx' },
  { name:'Картинка',    ext:'.png',  icon:'🖼️', color:'text-pink-400',   ex:'photo.png'     },
  { name:'Музыка',      ext:'.mp3',  icon:'🎵', color:'text-green-400',  ex:'song.mp3'      },
  { name:'Видео',       ext:'.mp4',  icon:'🎬', color:'text-red-400',    ex:'video.mp4'     },
  { name:'Презентация', ext:'.pptx', icon:'📊', color:'text-orange-400', ex:'урок.pptx'     },
]
function SlideFiles({ onDone, isDone }) {
  const [clicked, setClicked] = useState(new Set())
  const [tip,     setTip]     = useState(null)

  const click = (f) => {
    setTip(f)
    setClicked(prev => {
      const next = new Set(prev).add(f.name)
      if (next.size >= 4 && !isDone) onDone(15)
      return next
    })
  }

  return (
    <div>
      <h2 className="text-2xl font-black text-white mb-1">Файлы</h2>
      <p className="text-gray-400 mb-4 text-sm">
        Файлом может быть <strong className="text-white">текст, картинка, музыка, видео, презентация</strong>.
        Нажми на каждый тип!
      </p>
      <div className="grid grid-cols-5 gap-2 mb-4">
        {FILE_TYPES.map(f => (
          <button key={f.name} onClick={() => click(f)}
            className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 text-xs font-bold transition-all
              ${clicked.has(f.name)
                ? 'border-[#A3E635] bg-[#A3E635]/10'
                : 'border-white/10 bg-white/5 hover:border-purple-400'}`}>
            <span className="text-3xl">{f.icon}</span>
            <span className="text-gray-300">{f.name}</span>
            <span className="font-mono text-gray-500">{f.ext}</span>
          </button>
        ))}
      </div>
      {tip && (
        <div className="pop bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3">
          <span className="text-3xl">{tip.icon}</span>
          <div>
            <div className={`font-black text-base ${tip.color}`}>{tip.name}</div>
            <div className="text-gray-400 text-sm">Расширение: <span className="font-mono text-white">{tip.ext}</span></div>
            <div className="text-gray-500 text-xs">Пример: {tip.ex}</div>
          </div>
        </div>
      )}
      <div className="mt-3 text-xs text-gray-500 font-semibold">Нажато: {clicked.size} / 5</div>
    </div>
  )
}

/* ══════════════════════════════════════════
   SLIDE 5 — Папки помогают
══════════════════════════════════════════ */
const MESSY_FILES = ['photo.png','music.mp3','homework.docx','video.mp4','notes.txt','урок.pptx']
function SlideFolders({ onDone, isDone }) {
  const [sorted, setSorted] = useState(false)

  const sort = () => { setSorted(true); if (!isDone) onDone(15) }

  return (
    <div>
      <h2 className="text-2xl font-black text-white mb-1">Папки помогают:</h2>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {[
          ['📦','Хранить файлы в одном месте'],
          ['🔍','Быстро находить нужные документы'],
          ['🗂️','Разделять картинки, видео, музыку и задания'],
          ['✨','Поддерживать порядок на рабочем столе'],
        ].map(([ic, text]) => (
          <div key={text} className="flex items-start gap-2 bg-white/5 rounded-xl px-3 py-2.5">
            <span className="text-xl mt-0.5">{ic}</span>
            <span className="text-sm font-semibold text-gray-200 leading-snug">{text}</span>
          </div>
        ))}
      </div>

      <div className={`rounded-xl border-2 p-3 mb-4 transition-all duration-700 min-h-[90px]
        ${sorted ? 'border-[#A3E635]/40 bg-[#A3E635]/5' : 'border-red-400/30 bg-red-400/5'}`}>
        {sorted ? (
          <div className="grid grid-cols-3 gap-2 slide-in">
            {[['📁 Фото',['photo.png']],['📁 Музыка',['music.mp3']],['📁 Документы',['homework.docx','notes.txt']],['📁 Видео',['video.mp4']],['📁 Уроки',['урок.pptx']]].map(([f, files]) => (
              <div key={f} className="bg-white/5 rounded-lg p-1.5">
                <div className="font-bold text-[10px] text-[#A3E635] mb-1">{f}</div>
                {files.map(n => <div key={n} className="text-[10px] text-gray-400">📄 {n}</div>)}
              </div>
            ))}
          </div>
        ) : (
          <div>
            <div className="text-xs text-red-400 font-bold mb-2">😱 Беспорядок на рабочем столе!</div>
            <div className="flex flex-wrap gap-1">
              {MESSY_FILES.map(f => (
                <span key={f} className="text-xs bg-white/5 rounded px-2 py-1 text-gray-400 font-mono border border-white/10">📄 {f}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {!sorted && (
        <button className="btn-green" onClick={sort}>🗂️ Навести порядок!</button>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════
   SLIDE 6 — Создание папки
══════════════════════════════════════════ */
function SlideCreateFolder({ onDone, isDone }) {
  const [step, setStep] = useState(0)
  const [menu, setMenu] = useState(false)
  const [nameVal, setNameVal] = useState('')
  const [created, setCreated] = useState(false)

  const steps = [
    'Кликни правой кнопкой мыши по рабочему столу',
    'Навести курсором на «Создать папку»',
    'Назвать её и сохранить',
  ]

  const rightClick = (e) => {
    e.preventDefault()
    if (step === 0) { setMenu(true); setStep(1) }
  }

  const createFolder = () => {
    if (step === 1) { setMenu(false); setStep(2) }
  }

  const save = () => {
    if (nameVal.trim()) { setCreated(true); setStep(3); if (!isDone) onDone(20) }
  }

  return (
    <div>
      <h2 className="text-2xl font-black text-white mb-3">Создание папки</h2>
      {/* Step indicators */}
      <div className="flex gap-1.5 mb-4">
        {steps.map((s, i) => (
          <div key={i} className={`flex-1 text-[10px] font-bold rounded-lg px-2 py-1.5 text-center transition-all leading-tight
            ${i < step ? 'bg-[#A3E635]/20 text-[#A3E635]' : i === step ? 'bg-purple-500/20 text-purple-300' : 'bg-white/5 text-gray-600'}`}>
            {i + 1}. {s}
          </div>
        ))}
      </div>

      {/* Simulated desktop */}
      <div className="relative bg-[#1e3a5f] rounded-xl overflow-hidden min-h-[160px] border border-white/10 cursor-context-menu select-none"
        onContextMenu={rightClick} onClick={() => setMenu(false)}>
        <div className="p-3 text-xs text-white/20 font-bold">Рабочий стол</div>
        {created && (
          <div className="absolute top-8 left-6 flex flex-col items-center gap-1 pop">
            <span className="text-4xl">📁</span>
            <span className="text-xs font-bold text-white bg-black/50 rounded px-1.5 py-0.5">
              {nameVal || 'Новая папка'}
            </span>
          </div>
        )}
        {!created && step === 0 && (
          <p className="text-gray-500 text-sm text-center mt-8 select-none">
            👆 Нажми правой кнопкой мыши здесь
          </p>
        )}

        {/* Context menu */}
        {menu && (
          <div className="absolute top-6 left-6 bg-gray-900 border border-gray-600 rounded-xl shadow-2xl py-1 z-20 min-w-[190px] pop"
            onClick={e => e.stopPropagation()}>
            <button onClick={createFolder}
              className="w-full text-left px-4 py-2.5 text-sm font-bold text-white hover:bg-purple-500/30 transition-colors flex items-center gap-2">
              📁 Создать папку
            </button>
            <div className="px-4 py-2 text-sm text-gray-500 flex items-center gap-2">📋 Вставить</div>
            <div className="px-4 py-2 text-sm text-gray-500 flex items-center gap-2">🔄 Обновить</div>
            <div className="px-4 py-2 text-sm text-gray-500 flex items-center gap-2">🔧 Свойства</div>
          </div>
        )}

        {/* Name input overlay */}
        {step === 2 && !created && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-4"
            onClick={e => e.stopPropagation()}>
            <div className="bg-gray-900 border border-white/20 rounded-xl p-4 w-full max-w-xs pop">
              <p className="text-sm font-bold text-gray-300 mb-2">Введи имя папки:</p>
              <input value={nameVal} onChange={e => setNameVal(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && save()}
                placeholder="Мой урок"
                autoFocus
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white font-bold outline-none focus:border-purple-400 mb-3" />
              <button className="btn-green w-full" onClick={save}>✓ Сохранить</button>
            </div>
          </div>
        )}
      </div>

      {created && (
        <div className="mt-3 text-[#A3E635] font-black text-sm pop">
          🎉 Папка «{nameVal}» создана!
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════
   SLIDE 7 — Попробуй сам
══════════════════════════════════════════ */
function SlideTrySelf({ name }) {
  return (
    <div className="text-center py-4">
      <div className="text-5xl mb-4">💪</div>
      <h2 className="text-3xl font-black text-white mb-4">Теперь попробуй сам!</h2>
      <div className="bg-purple-500/15 border border-purple-500/30 rounded-2xl p-5 text-left mb-5">
        <div className="text-xs font-black text-purple-400 uppercase tracking-widest mb-2">Задание:</div>
        <p className="text-white font-bold text-base leading-relaxed">
          Создай папку на рабочем столе самостоятельно и <span className="text-[#A3E635]">внутри неё создай документ со своим именем</span>.
        </p>
      </div>
      <p className="text-gray-400 text-sm">
        Ты уже умеешь это делать, <span className="text-purple-300 font-black">{name}</span>! Попробуй в настоящей практике.
      </p>
    </div>
  )
}

/* ══════════════════════════════════════════
   SLIDE 8 / 14 — Отлично!
══════════════════════════════════════════ */
function SlideSuccess() {
  return (
    <div className="text-center py-8">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }}
        className="text-7xl mb-4">🏆</motion.div>
      <h2 className="text-3xl font-black text-[#A3E635] mb-2">Отлично!</h2>
      <p className="text-white font-bold text-xl">У тебя получилось! Ты молодец.</p>
      <div className="mt-4 flex justify-center gap-2">
        {['⭐','⭐','⭐'].map((s, i) => (
          <motion.span key={i} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}
            transition={{delay: i * 0.15}} className="text-3xl">{s}</motion.span>
        ))}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════
   SLIDE 9 — Горячие клавиши (инфо)
══════════════════════════════════════════ */
function SlideHotkeys() {
  return (
    <div>
      <h2 className="text-2xl font-black text-white mb-1">Горячие клавиши</h2>
      <p className="text-gray-400 mb-4">
        Это <strong className="text-white">быстрые команды на клавиатуре</strong>.
        Они помогают работать быстрее без лишних движений мышкой.
      </p>
      <p className="text-sm font-bold text-purple-300 mb-4">Примеры:</p>
      <div className="grid gap-3">
        {[
          { k:'Ctrl + C', d:'Копировать',               ic:'📋', color:'bg-blue-500/15   border-blue-500/30   text-blue-300'   },
          { k:'Ctrl + V', d:'Вставить',                  ic:'📌', color:'bg-green-500/15  border-green-500/30  text-green-300'  },
          { k:'Ctrl + S', d:'Сохранить',                 ic:'💾', color:'bg-yellow-500/15 border-yellow-500/30 text-yellow-300' },
          { k:'Ctrl + Z', d:'Отменить последнее действие',ic:'↩️', color:'bg-red-500/15   border-red-500/30   text-red-300'    },
          { k:'Ctrl + A', d:'Выделить весь текст',       ic:'✳️', color:'bg-purple-500/15 border-purple-500/30 text-purple-300' },
        ].map(({ k, d, ic, color }) => (
          <div key={k} className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 ${color}`}>
            <span className="text-xl">{ic}</span>
            <span className="font-black text-lg font-mono flex-1">{k}</span>
            <span className="text-sm font-semibold opacity-80">{d}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════
   SLIDE 10 — Ctrl+C и Ctrl+V (интерактив)
══════════════════════════════════════════ */
function SlideClipboard({ onDone, isDone }) {
  const [step, setStep] = useState(0)
  const [text] = useState('Привет!')

  const select = () => step < 1 && setStep(1)
  const copy   = () => step === 1 && setStep(2)
  const paste  = () => { if (step === 2) { setStep(3); if (!isDone) onDone(20) } }

  return (
    <div>
      <h2 className="text-2xl font-black text-white mb-1">Ctrl+C и Ctrl+V</h2>
      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3">
          <div className="font-black text-blue-300 font-mono mb-1">Ctrl + C</div>
          <div className="text-gray-300">Скопировать — сделать копию текста, картинки или файла.</div>
        </div>
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3">
          <div className="font-black text-green-300 font-mono mb-1">Ctrl + V</div>
          <div className="text-gray-300">Вставить — поставить копию в нужное место.</div>
        </div>
      </div>

      {/* Steps pipeline */}
      <div className="flex items-center gap-2 mb-4 text-xs font-bold">
        {[
          { l:'1. Выдели', done: step >= 1 },
          { l:'→ Ctrl+C',  done: step >= 2 },
          { l:'→ Ctrl+V',  done: step >= 3 },
        ].map((s, i) => (
          <div key={i} className={`px-3 py-1.5 rounded-full border transition-all
            ${s.done ? 'border-[#A3E635]/50 bg-[#A3E635]/10 text-[#A3E635]' : 'border-white/10 text-gray-600'}`}>
            {s.l}
          </div>
        ))}
      </div>

      {/* Document */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4">
        <div className="text-xs text-gray-500 font-bold mb-2">📝 document.txt</div>
        <div onClick={select}
          className={`text-lg font-bold rounded-lg px-3 py-2 cursor-pointer select-none transition-all inline-block
            ${step >= 1 ? 'bg-purple-500/30 text-white outline outline-2 outline-purple-400' : 'text-gray-300 hover:bg-white/5'}`}>
          {text}
        </div>
        {step >= 3 && (
          <div className="text-lg font-bold text-gray-300 px-3 py-2 mt-1 pop">{text}</div>
        )}
      </div>

      <div className="flex gap-3 flex-wrap">
        {step < 1  && <button className="btn-outline" onClick={select}>1. Выдели текст</button>}
        {step === 1 && <button className="btn-purple" onClick={copy}>2. Ctrl+C — Копировать</button>}
        {step === 2 && <button className="btn-green"  onClick={paste}>3. Ctrl+V — Вставить</button>}
        {step >= 3  && <div className="text-[#A3E635] font-black">🎉 Текст скопирован и вставлен!</div>}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════
   SLIDE 11 — Буфер обмена (инфо)
══════════════════════════════════════════ */
function SlideBuffer() {
  const [play, setPlay] = useState(false)
  return (
    <div>
      <h2 className="text-2xl font-black text-white mb-3">Буфер обмена</h2>
      <div className="bg-purple-500/15 border border-purple-500/30 rounded-2xl p-5 mb-5">
        <p className="text-white font-bold text-base leading-relaxed">
          Это <span className="text-[#A3E635]">временное место</span>, где компьютер хранит то, что мы скопировали.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-5 text-sm">
        <div className="flex items-start gap-2 bg-blue-500/10 border border-blue-500/30 rounded-xl p-3">
          <span className="text-xl">📋</span>
          <div><span className="font-black text-blue-300 font-mono">Ctrl + C</span><br/><span className="text-gray-300">Положить в буфер обмена</span></div>
        </div>
        <div className="flex items-start gap-2 bg-green-500/10 border border-green-500/30 rounded-xl p-3">
          <span className="text-xl">📌</span>
          <div><span className="font-black text-green-300 font-mono">Ctrl + V</span><br/><span className="text-gray-300">Достать из буфера и вставить</span></div>
        </div>
      </div>
      {/* Mini animation */}
      <button className="btn-outline mb-3 text-sm" onClick={() => setPlay(true)}>
        ▶ Посмотреть анимацию
      </button>
      {play && (
        <div className="flex items-center gap-2 pop text-sm font-bold">
          <div className="bg-white/10 rounded-lg px-3 py-2 text-white">📝 Текст</div>
          <motion.div animate={{ x: [0, 20, 0] }} transition={{ duration: 1, repeat: 2 }}
            className="text-[#A3E635]">→</motion.div>
          <div className="bg-purple-500/20 border border-purple-500/40 rounded-lg px-3 py-2 text-purple-300">📋 Буфер</div>
          <motion.div animate={{ x: [0, 20, 0] }} transition={{ duration: 1, repeat: 2, delay: 0.5 }}
            className="text-[#A3E635]">→</motion.div>
          <div className="bg-white/10 rounded-lg px-3 py-2 text-white">📌 Вставка</div>
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════
   SLIDE 12 — Ctrl+S, Z, A
══════════════════════════════════════════ */
const MORE_KEYS = [
  { k:'Ctrl + S', action:'СОХРАНЯЕТ',                  ic:'💾', color:'bg-yellow-500/15 border-yellow-500/30 text-yellow-300' },
  { k:'Ctrl + Z', action:'ОТМЕНЯЕТ ПОСЛЕДНЕЕ ДЕЙСТВИЕ', ic:'↩️', color:'bg-red-500/15   border-red-500/30   text-red-300'    },
  { k:'Ctrl + A', action:'ВЫДЕЛЯЕТ ВЕСЬ ТЕКСТ',         ic:'✳️', color:'bg-purple-500/15 border-purple-500/30 text-purple-300' },
]
function SlideMoreKeys({ onDone, isDone }) {
  const [pressed, setPressed] = useState(new Set())

  const press = (k) => {
    setPressed(prev => {
      const next = new Set(prev).add(k)
      if (next.size >= 3 && !isDone) onDone(15)
      return next
    })
  }

  return (
    <div>
      <h2 className="text-2xl font-black text-white mb-4">Ctrl+S, Z, A</h2>
      <div className="grid gap-3">
        {MORE_KEYS.map(({ k, action, ic, color }) => (
          <button key={k} onClick={() => press(k)}
            className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all
              ${pressed.has(k) ? 'border-[#A3E635] bg-[#A3E635]/10' : `${color} hover:scale-[1.01]`}`}>
            <span className="text-3xl">{ic}</span>
            <div className="flex-1">
              <div className="font-black text-xl text-white font-mono">{k}</div>
              <div className="font-black text-sm text-gray-300 uppercase tracking-wide">{action}</div>
            </div>
            {pressed.has(k) && <span className="text-[#A3E635] text-2xl">✓</span>}
          </button>
        ))}
      </div>
      <div className="mt-3 text-xs text-gray-500 font-semibold">Нажато: {pressed.size} / 3</div>
    </div>
  )
}

/* ══════════════════════════════════════════
   SLIDE 13 — Практика
══════════════════════════════════════════ */
function SlidePractice({ name }) {
  const tasks = [
    'Создай папку «Мой урок»',
    'В ней создай текстовый документ',
    'Напиши своё имя',
    'Скопируй имя через Ctrl + C',
    'Вставь его через Ctrl + V',
    'Сохрани файл через Ctrl + S',
  ]
  return (
    <div>
      <h2 className="text-3xl font-black text-[#A3E635] mb-1">ПРАКТИКА</h2>
      <p className="text-gray-400 mb-4 text-sm">
        <span className="text-purple-300 font-black">{name}</span>, выполни эти задания в симуляторе на следующем экране:
      </p>
      <div className="grid gap-2">
        {tasks.map((t, i) => (
          <div key={i} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
            <div className="w-6 h-6 rounded-full bg-purple-500/30 text-purple-300 font-black text-xs flex items-center justify-center flex-shrink-0">
              {i + 1}
            </div>
            <span className="text-sm font-semibold text-gray-200">{t}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 text-xs text-[#A3E635] font-bold">
        🚀 Нажми «Дальше» — там всё это будет интерактивно!
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════
   SLIDE 15/16 — Что мы выучили?
══════════════════════════════════════════ */
function SlideRecap({ name }) {
  const items = [
    { ic:'🖥️', title:'Рабочий стол',    text:'Главный экран компьютера с иконками, папками и корзиной' },
    { ic:'📁', title:'Папка',           text:'Место для хранения файлов в порядке' },
    { ic:'📄', title:'Файлы',           text:'Текст, картинки, музыка, видео — у каждого своё расширение' },
    { ic:'🗑️', title:'Корзина',        text:'Хранит удалённые файлы — их можно восстановить' },
    { ic:'⌨️', title:'Сочетание клавиш', text:'Ctrl+C копировать, Ctrl+V вставить, Ctrl+S сохранить' },
  ]
  return (
    <div>
      <h2 className="text-2xl font-black text-white mb-1">Что мы сегодня выучили?</h2>
      <p className="text-gray-400 mb-4 text-sm">
        Отличная работа, <span className="text-purple-300 font-black">{name}</span>! 🎉
      </p>
      <div className="grid gap-2">
        {items.map(({ ic, title, text }) => (
          <div key={title} className="flex items-start gap-3 bg-white/5 rounded-xl px-4 py-3">
            <span className="text-2xl flex-shrink-0">{ic}</span>
            <div>
              <div className="font-black text-white text-sm">{title}</div>
              <div className="text-xs text-gray-400">{text}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 text-center text-sm font-black text-[#A3E635]">
        🚀 Теперь — практика! Покажем что умеем.
      </div>
    </div>
  )
}
