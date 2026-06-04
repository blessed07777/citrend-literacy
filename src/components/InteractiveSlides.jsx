import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const SLIDES = [
  { id: 'intro', title: 'Тема урока', type: 'title' },
  { id: 'desktop', title: 'Рабочий стол', type: 'desktop-explore' },
  { id: 'files', title: 'Файлы и расширения', type: 'file-types' },
  { id: 'folders', title: 'Зачем нужны папки?', type: 'folder-chaos' },
  { id: 'create-folder', title: 'Создание папки', type: 'context-sim' },
  { id: 'hotkeys', title: 'Горячие клавиши', type: 'hotkeys-info' },
  { id: 'clipboard', title: 'Ctrl+C и Ctrl+V', type: 'clipboard-demo' },
  { id: 'more-keys', title: 'Ctrl+S, Z, A', type: 'more-hotkeys' },
  { id: 'recap', title: 'Что мы узнали?', type: 'recap' },
]

const slide = {
  initial: { opacity: 0, x: 60 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.35 } },
  exit:    { opacity: 0, x: -60, transition: { duration: 0.2 } },
}

export default function InteractiveSlides({ name, onFinish }) {
  const [idx, setIdx]       = useState(0)
  const [done, setDone]     = useState(new Set())
  const [points, setPoints] = useState(0)

  const current = SLIDES[idx]
  const isLast  = idx === SLIDES.length - 1

  const markDone = (id, pts = 10) => {
    if (!done.has(id)) { setDone(p => new Set(p).add(id)); setPoints(p => p + pts) }
  }
  const canNext = done.has(current.id) || ['intro', 'hotkeys-info', 'recap'].includes(current.type)

  const next = () => isLast ? onFinish() : setIdx(i => i + 1)
  const prev = () => setIdx(i => Math.max(0, i - 1))

  return (
    <div className="min-h-screen pt-16 pb-8 px-4 flex flex-col items-center">
      {/* Progress */}
      <div className="w-full max-w-2xl mt-6 mb-4">
        <div className="flex justify-between text-xs text-gray-500 font-bold mb-1.5">
          <span>Слайд {idx + 1} / {SLIDES.length}</span>
          <span className="text-[#A3E635] font-black">+{points} очков</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div className="h-full bg-gradient-to-r from-purple-500 to-[#A3E635] rounded-full"
            animate={{ width: `${((idx+1)/SLIDES.length)*100}%` }} />
        </div>
      </div>

      {/* Slide */}
      <div className="w-full max-w-2xl">
        <AnimatePresence mode="wait">
          <motion.div key={current.id} variants={slide} initial="initial" animate="animate" exit="exit">
            <SlideCard slide={current} name={name} onDone={(pts) => markDone(current.id, pts)} isDone={done.has(current.id)} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Nav */}
      <div className="w-full max-w-2xl flex justify-between items-center mt-6">
        <button className="btn-outline" onClick={prev} disabled={idx === 0}>← Назад</button>
        {!canNext && (
          <span className="text-sm text-gray-500 font-semibold italic">
            Выполни задание, чтобы продолжить
          </span>
        )}
        <button className="btn-green" onClick={next} disabled={!canNext}>
          {isLast ? 'К практике →' : 'Дальше →'}
        </button>
      </div>
    </div>
  )
}

/* ─── Individual slide renderers ─── */
function SlideCard({ slide, name, onDone, isDone }) {
  const props = { name, onDone, isDone }
  const map = {
    title:          <SlideTitle {...props} />,
    'desktop-explore': <SlideDesktopExplore {...props} />,
    'file-types':   <SlideFileTypes {...props} />,
    'folder-chaos': <SlideFolderChaos {...props} />,
    'context-sim':  <SlideContextSim {...props} />,
    'hotkeys-info': <SlideHotkeysInfo {...props} />,
    'clipboard-demo':<SlideClipboard {...props} />,
    'more-hotkeys': <SlideMoreHotkeys {...props} />,
    recap:          <SlideRecap name={name} />,
  }
  return (
    <div className="card p-6 md:p-8">
      <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
        Слайд — {slide.title}
      </div>
      {map[slide.type]}
      {isDone && (
        <div className="mt-4 flex items-center gap-2 text-[#A3E635] font-black text-sm pop">
          ✅ Задание выполнено!
        </div>
      )}
    </div>
  )
}

/* Title slide */
function SlideTitle() {
  return (
    <div className="text-center py-6">
      <div className="text-6xl mb-4 float">🖥️</div>
      <h2 className="text-3xl font-black text-white mb-2">Компьютерная грамотность</h2>
      <p className="text-purple-300 font-bold text-lg">Урок 1: Рабочий стол, файлы, папки<br/>и горячие клавиши</p>
      <div className="mt-6 grid grid-cols-3 gap-3">
        {[['📁','Файлы и папки'],['⌨️','Горячие клавиши'],['🗑️','Корзина']].map(([ic,lb]) => (
          <div key={lb} className="bg-white/5 rounded-xl p-3 text-center">
            <div className="text-3xl mb-1">{ic}</div>
            <div className="text-xs font-bold text-gray-300">{lb}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* Desktop explore */
const DESK_ITEMS = [
  { id:'folder', icon:'📁', label:'Папка', info:'Папки помогают хранить файлы в порядке' },
  { id:'file',   icon:'📝', label:'Файл',  info:'Файл — это документ, картинка, видео или музыка' },
  { id:'trash',  icon:'🗑️', label:'Корзина', info:'Корзина хранит удалённые файлы. Их можно восстановить!' },
  { id:'taskbar',icon:'▬',  label:'Панель задач', info:'Панель задач — внизу. Отсюда можно открыть любую программу' },
  { id:'pc',     icon:'💻', label:'Мой компьютер', info:'Мой компьютер — здесь хранятся все файлы и диски' },
]
function SlideDesktopExplore({ onDone, isDone }) {
  const [clicked, setClicked] = useState(new Set())
  const [info, setInfo] = useState(null)

  const click = (item) => {
    setInfo(item.info)
    setClicked(prev => {
      const next = new Set(prev).add(item.id)
      if (next.size >= 4 && !isDone) onDone(15)
      return next
    })
  }

  return (
    <div>
      <h2 className="text-2xl font-black text-white mb-2">Что такое рабочий стол?</h2>
      <p className="text-gray-400 mb-4">
        Рабочий стол — главный экран компьютера. <strong className="text-white">Нажми на каждый элемент</strong>, чтобы узнать о нём!
      </p>
      <div className="grid grid-cols-5 gap-3 mb-4">
        {DESK_ITEMS.map(item => (
          <button key={item.id} onClick={() => click(item)}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all
              ${clicked.has(item.id)
                ? 'border-[#A3E635] bg-[#A3E635]/10 text-[#A3E635]'
                : 'border-white/10 bg-white/5 text-gray-300 hover:border-purple-400 hover:bg-purple-500/10'}`}>
            <span className="text-3xl">{item.icon}</span>
            <span className="text-xs font-bold leading-tight text-center">{item.label}</span>
          </button>
        ))}
      </div>
      {info && (
        <div className="pop bg-purple-500/15 border border-purple-500/30 rounded-xl p-3 text-sm font-semibold text-purple-200">
          💡 {info}
        </div>
      )}
      <div className="mt-3 text-xs text-gray-500 font-semibold">
        Нажато: {clicked.size} / {DESK_ITEMS.length} (нужно хотя бы 4)
      </div>
    </div>
  )
}

/* File types */
const FILES = [
  { name:'photo.png',           icon:'🖼️', type:'Картинка',    color:'text-blue-400' },
  { name:'music.mp3',           icon:'🎵', type:'Музыка',      color:'text-pink-400' },
  { name:'homework.docx',       icon:'📝', type:'Документ',    color:'text-green-400' },
  { name:'presentation.pptx',   icon:'📊', type:'Презентация', color:'text-orange-400' },
  { name:'video.mp4',           icon:'🎬', type:'Видео',       color:'text-red-400' },
]
function SlideFileTypes({ onDone, isDone }) {
  const [clicked, setClicked] = useState(new Set())
  const [tip, setTip] = useState(null)

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
      <h2 className="text-2xl font-black text-white mb-2">Файлы и расширения</h2>
      <p className="text-gray-400 mb-4">
        У каждого файла есть <strong className="text-white">расширение</strong> — буквы после точки в имени.
        <strong className="text-white"> Нажимай</strong> на файлы, чтобы узнать что они означают!
      </p>
      <div className="grid grid-cols-5 gap-2 mb-4">
        {FILES.map(f => (
          <button key={f.name} onClick={() => click(f)}
            className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 text-xs font-bold transition-all
              ${clicked.has(f.name)
                ? 'border-[#A3E635] bg-[#A3E635]/10'
                : 'border-white/10 bg-white/5 hover:border-purple-400'}`}>
            <span className="text-2xl">{f.icon}</span>
            <span className="text-gray-300 text-center leading-tight">{f.name}</span>
          </button>
        ))}
      </div>
      {tip && (
        <div className="pop bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3">
          <span className="text-3xl">{tip.icon}</span>
          <div>
            <div className="font-black text-white">{tip.name}</div>
            <div className={`text-sm font-bold ${tip.color}`}>{tip.type} — расширение .{tip.name.split('.').pop()}</div>
          </div>
        </div>
      )}
    </div>
  )
}

/* Folder chaos */
const MESSY = ['photo.png','music.mp3','homework.docx','video.mp4','notes.txt','game.exe','report.pdf']
function SlideFolderChaos({ onDone, isDone }) {
  const [sorted, setSorted] = useState(false)

  const sort = () => {
    setSorted(true)
    if (!isDone) onDone(15)
  }

  return (
    <div>
      <h2 className="text-2xl font-black text-white mb-2">Зачем нужны папки?</h2>
      <p className="text-gray-400 mb-4">Без папок все файлы в куче. Нажми <strong className="text-white">«Навести порядок»</strong>!</p>

      <div className={`relative min-h-[120px] rounded-xl border-2 p-3 mb-4 overflow-hidden transition-all duration-700
        ${sorted ? 'border-[#A3E635]/40 bg-[#A3E635]/5' : 'border-red-400/30 bg-red-400/5'}`}>
        {sorted ? (
          <div className="grid grid-cols-3 gap-2 slide-in">
            {[['📁 Фото',['photo.png']],['📁 Музыка',['music.mp3']],['📁 Документы',['homework.docx','notes.txt','report.pdf']],['📁 Видео',['video.mp4']],['📁 Игры',['game.exe']]].map(([folder, files]) => (
              <div key={folder} className="bg-white/5 rounded-lg p-2">
                <div className="font-bold text-xs text-[#A3E635] mb-1">{folder}</div>
                {files.map(f => <div key={f} className="text-xs text-gray-400">📄 {f}</div>)}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {MESSY.map(f => (
              <div key={f} className="text-xs bg-white/5 rounded px-2 py-1 text-gray-300 font-mono border border-white/10">📄 {f}</div>
            ))}
          </div>
        )}
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2">
        {['Хранить файлы в одном месте','Быстро находить нужное','Разделять фото, видео, музыку','Порядок на рабочем столе'].map(t => (
          <div key={t} className="flex items-center gap-2 text-sm text-gray-300 font-semibold">
            <span className="text-[#A3E635]">✓</span> {t}
          </div>
        ))}
      </div>

      {!sorted && (
        <button className="btn-green" onClick={sort}>🗂️ Навести порядок!</button>
      )}
    </div>
  )
}

/* Context menu sim */
function SlideContextSim({ onDone, isDone }) {
  const [step, setStep] = useState(0)
  const [menu, setMenu] = useState(false)
  const [folderName, setFolderName] = useState('')
  const [created, setCreated] = useState(false)

  const steps = ['Нажми правой кнопкой по рабочему столу', 'Выбери «Создать папку»', 'Назови папку «Мой урок»']

  const rightClick = (e) => {
    e.preventDefault()
    if (step === 0) { setMenu(true); setStep(1) }
  }

  const createFolder = () => {
    if (step === 1) { setMenu(false); setStep(2) }
  }

  const saveName = () => {
    if (folderName.trim()) {
      setCreated(true); setStep(3)
      if (!isDone) onDone(20)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-black text-white mb-2">Создание папки</h2>
      <p className="text-gray-400 mb-4">Научимся создавать папку через правую кнопку мыши.</p>

      {/* Steps indicator */}
      <div className="flex gap-2 mb-4">
        {steps.map((s, i) => (
          <div key={i} className={`flex-1 text-xs font-bold rounded-lg px-2 py-1.5 text-center transition-all
            ${i < step ? 'bg-[#A3E635]/20 text-[#A3E635]' : i === step ? 'bg-purple-500/20 text-purple-300' : 'bg-white/5 text-gray-600'}`}>
            {i+1}. {s}
          </div>
        ))}
      </div>

      {/* Simulated desktop */}
      <div className="relative bg-[#1e3a5f] rounded-xl overflow-hidden min-h-[180px] border border-white/10 cursor-context-menu select-none"
        onContextMenu={rightClick}>
        <div className="p-3">
          {created && (
            <div className="inline-flex flex-col items-center gap-1 pop">
              <span className="text-3xl">📁</span>
              <span className="text-xs font-bold text-white bg-black/40 rounded px-1">{folderName || 'Мой урок'}</span>
            </div>
          )}
          {!created && step === 0 && (
            <p className="text-gray-400 text-sm mt-8 text-center">👆 Нажми правой кнопкой мыши здесь</p>
          )}
        </div>

        {/* Context menu */}
        {menu && (
          <div className="absolute top-8 left-8 bg-gray-800 border border-gray-600 rounded-lg shadow-2xl py-1 z-20 min-w-[180px] pop">
            <button onClick={createFolder}
              className="w-full text-left px-3 py-2 text-sm font-bold text-white hover:bg-purple-500/30 transition-colors">
              📁 Создать папку
            </button>
            <div className="px-3 py-2 text-sm text-gray-500">📋 Вставить</div>
            <div className="px-3 py-2 text-sm text-gray-500">🔄 Обновить</div>
          </div>
        )}

        {/* Rename input */}
        {step === 2 && !created && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-xl p-4 w-full max-w-xs pop">
              <p className="text-sm font-bold text-gray-300 mb-2">Введи имя папки:</p>
              <input value={folderName} onChange={e => setFolderName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && saveName()}
                placeholder="Мой урок"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white font-bold outline-none focus:border-purple-400 mb-3" />
              <button className="btn-green w-full" onClick={saveName}>✓ Создать</button>
            </div>
          </div>
        )}
      </div>

      {created && (
        <div className="mt-3 text-[#A3E635] font-black text-sm">
          🎉 Папка «{folderName || 'Мой урок'}» создана!
        </div>
      )}
    </div>
  )
}

/* Hotkeys info */
const KEYS = [
  { combo:'Ctrl + C', desc:'Копировать', icon:'📋', color:'bg-blue-500/20 border-blue-500/40 text-blue-300' },
  { combo:'Ctrl + V', desc:'Вставить',   icon:'📌', color:'bg-green-500/20 border-green-500/40 text-green-300' },
  { combo:'Ctrl + S', desc:'Сохранить',  icon:'💾', color:'bg-yellow-500/20 border-yellow-500/40 text-yellow-300' },
  { combo:'Ctrl + Z', desc:'Отменить',   icon:'↩️', color:'bg-red-500/20 border-red-500/40 text-red-300' },
  { combo:'Ctrl + A', desc:'Выделить всё', icon:'✳️', color:'bg-purple-500/20 border-purple-500/40 text-purple-300' },
]
function SlideHotkeysInfo() {
  return (
    <div>
      <h2 className="text-2xl font-black text-white mb-2">Горячие клавиши</h2>
      <p className="text-gray-400 mb-4">
        Горячие клавиши — быстрые команды клавиатуры. Они помогают работать <strong className="text-white">без мышки</strong>!
      </p>
      <div className="grid gap-3">
        {KEYS.map(k => (
          <div key={k.combo} className={`flex items-center gap-4 rounded-xl border-2 p-3 ${k.color}`}>
            <span className="text-2xl">{k.icon}</span>
            <div>
              <div className="font-black text-lg font-mono">{k.combo}</div>
              <div className="text-sm opacity-80 font-semibold">{k.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* Clipboard demo */
function SlideClipboard({ onDone, isDone }) {
  const [step, setStep] = useState(0) // 0 initial, 1 selected, 2 copied, 3 pasted
  const [text, setText] = useState('Привет!')

  const select = () => step < 1 && setStep(1)
  const copy   = () => { if (step === 1) { setStep(2); } }
  const paste  = () => { if (step === 2) { setStep(3); if (!isDone) onDone(20) } }

  return (
    <div>
      <h2 className="text-2xl font-black text-white mb-2">Ctrl+C и Ctrl+V</h2>
      <p className="text-gray-400 mb-4">
        <strong className="text-white">Ctrl+C</strong> — копировать, <strong className="text-white">Ctrl+V</strong> — вставить.
        Пройди все шаги!
      </p>

      {/* Animation pipeline */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        {[
          { label:'Текст', icon:'📄', active: true },
          { label:'→ Буфер обмена', icon:'📋', active: step >= 2 },
          { label:'→ Вставить', icon:'📌', active: step >= 3 },
        ].map((s, i) => (
          <div key={i} className={`flex items-center gap-1.5 rounded-xl px-3 py-2 border text-sm font-bold transition-all
            ${s.active ? 'border-[#A3E635]/50 bg-[#A3E635]/10 text-[#A3E635]' : 'border-white/10 text-gray-600'}`}>
            {s.icon} {s.label}
          </div>
        ))}
      </div>

      {/* Document */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4">
        <div className="flex items-center gap-2 mb-2 text-xs text-gray-500 font-bold">
          <span>📝</span> document.txt
        </div>
        <div
          onClick={select}
          className={`text-lg font-bold rounded-lg px-3 py-2 cursor-pointer select-none transition-all
            ${step >= 1 ? 'bg-purple-500/30 text-white outline outline-2 outline-purple-400' : 'text-gray-300 hover:bg-white/5'}`}>
          {text}
        </div>
        {step >= 3 && (
          <div className="text-lg font-bold text-gray-300 px-3 py-2 mt-1 pop">{text}</div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex gap-3 flex-wrap">
        {step < 1 && (
          <button className="btn-outline" onClick={select}>1. Выдели текст</button>
        )}
        {step === 1 && (
          <button className="btn-purple" onClick={copy}>2. Нажми Ctrl+C (Скопировать)</button>
        )}
        {step === 2 && (
          <button className="btn-green" onClick={paste}>3. Нажми Ctrl+V (Вставить)</button>
        )}
        {step === 3 && (
          <div className="text-[#A3E635] font-black">🎉 Текст скопирован и вставлен!</div>
        )}
      </div>
    </div>
  )
}

/* More hotkeys */
function SlideMoreHotkeys({ onDone, isDone }) {
  const [pressed, setPressed] = useState(new Set())

  const press = (k) => {
    setPressed(prev => {
      const next = new Set(prev).add(k)
      if (next.size >= 3 && !isDone) onDone(15)
      return next
    })
  }

  const keys = [
    { k:'Ctrl+S', label:'Сохранить файл', hint:'Нажми, чтобы сохранить работу', icon:'💾' },
    { k:'Ctrl+Z', label:'Отменить действие', hint:'Если сделал ошибку — Ctrl+Z отменит её', icon:'↩️' },
    { k:'Ctrl+A', label:'Выделить всё', hint:'Выделяет весь текст в документе', icon:'✳️' },
  ]

  return (
    <div>
      <h2 className="text-2xl font-black text-white mb-2">Ctrl+S, Z, A</h2>
      <p className="text-gray-400 mb-4">Нажми на каждую кнопку, чтобы попрактиковаться!</p>
      <div className="grid gap-3">
        {keys.map(({ k, label, hint, icon }) => (
          <button key={k} onClick={() => press(k)}
            className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all
              ${pressed.has(k)
                ? 'border-[#A3E635] bg-[#A3E635]/10'
                : 'border-white/10 bg-white/5 hover:border-purple-400'}`}>
            <span className="text-3xl">{icon}</span>
            <div className="flex-1">
              <div className="font-black text-lg text-white font-mono">{k}</div>
              <div className="font-bold text-gray-400">{label}</div>
              {pressed.has(k) && <div className="text-xs text-[#A3E635] font-semibold mt-1">✓ {hint}</div>}
            </div>
            {pressed.has(k) && <span className="text-[#A3E635] text-xl">✓</span>}
          </button>
        ))}
      </div>
    </div>
  )
}

/* Recap */
function SlideRecap({ name }) {
  const items = [
    ['🖥️','Рабочий стол — главный экран компьютера'],
    ['📁','Папки помогают организовать файлы'],
    ['📄','Файлы имеют расширения: .png, .mp3, .docx...'],
    ['🗑️','Корзина хранит удалённые файлы'],
    ['📋','Ctrl+C — копировать, Ctrl+V — вставить'],
    ['💾','Ctrl+S — сохранить, Ctrl+Z — отменить'],
  ]
  return (
    <div>
      <h2 className="text-2xl font-black text-white mb-1">Что мы узнали?</h2>
      <p className="text-gray-400 mb-4">Отличная работа, <span className="text-purple-300 font-black">{name}</span>! 🎉</p>
      <div className="grid gap-2">
        {items.map(([ic, text]) => (
          <div key={text} className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
            <span className="text-xl">{ic}</span>
            <span className="font-semibold text-gray-200 text-sm">{text}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 text-center text-sm font-bold text-[#A3E635]">
        🚀 Теперь — практика! Проверим, как ты работаешь с компьютером.
      </div>
    </div>
  )
}
