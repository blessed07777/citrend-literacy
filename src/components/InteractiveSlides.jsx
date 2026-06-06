import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const BASE = import.meta.env.BASE_URL

/* ─── Slide data — exact content from the uploaded PPTX ─── */
const SLIDES = [
  {
    id: 1,
    bg: 'from-[#1a0a3c] to-[#2d1260]',
    accent: '#A3E635',
    content: () => (
      <div className="flex flex-col items-center justify-center h-full text-center gap-6">
        <img src={`${BASE}assets/computer3d.png`} alt="" className="h-28 object-contain float"/>
        <div>
          <h1 className="text-5xl font-black text-white leading-tight">
            Компьютер<span className="text-[#A3E635]">нАя</span>
          </h1>
          <h1 className="text-5xl font-black text-white leading-tight mb-3">грамотность</h1>
          <p className="text-purple-300 text-xl font-bold">Урок первый</p>
          <p className="text-white/70 text-base mt-1">Рабочий стол, файлы, папки и горячие клавиши</p>
        </div>
        <img src={`${BASE}assets/logo.png`} alt="citrend" className="h-8 opacity-60"/>
      </div>
    )
  },
  {
    id: 2,
    bg: 'from-[#0f1a35] to-[#1a2d5a]',
    accent: '#60a5fa',
    content: () => (
      <div className="flex items-center h-full gap-8">
        <img src={`${BASE}assets/char-front.png`} alt="" className="h-56 object-contain flex-shrink-0"/>
        <div>
          <div className="text-blue-400 text-xs font-black uppercase tracking-widest mb-2">Сегодня на уроке</div>
          <h2 className="text-3xl font-black text-white mb-4">Что мы узнаем?</h2>
          <p className="text-white/80 text-base mb-6 leading-relaxed">
            Мы узнаем, как устроен компьютерный рабочий стол и как быстро работать с файлами.
          </p>
          <div className="grid gap-3">
            {[['🖥️','Рабочий стол','Главный экран компьютера'],
              ['📁','Файлы и папки','Как хранить информацию'],
              ['⌨️','Горячие клавиши','Быстрые команды']].map(([ic,t,d])=>(
              <div key={t} className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-2.5">
                <span className="text-2xl">{ic}</span>
                <div>
                  <div className="font-black text-white text-sm">{t}</div>
                  <div className="text-white/50 text-xs">{d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  },
  {
    id: 3,
    bg: 'from-[#0d1f3c] to-[#162b50]',
    accent: '#38bdf8',
    content: () => (
      <div className="flex flex-col h-full gap-4">
        <h2 className="text-2xl font-black text-white">Рабочий стол</h2>
        <div className="flex gap-4 flex-1">
          <div className="flex-1 overflow-hidden rounded-xl border border-white/10">
            <img src={`${BASE}assets/win-desktop.png`} alt="Рабочий стол Windows"
              className="w-full h-full object-cover"/>
          </div>
          <div className="w-52 flex flex-col gap-3">
            <img src={`${BASE}assets/info-desktop.png`} alt="" className="rounded-xl w-full"/>
            <div className="bg-white/10 rounded-xl p-3 flex-1">
              <p className="text-white/80 text-sm leading-relaxed">
                На рабочем столе находятся <span className="text-[#38bdf8] font-bold">значки</span>,{' '}
                <span className="text-[#38bdf8] font-bold">папки</span>,{' '}
                <span className="text-[#38bdf8] font-bold">файлы</span> и{' '}
                <span className="text-[#38bdf8] font-bold">корзина</span>.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 4,
    bg: 'from-[#1a1a35] to-[#2a2060]',
    accent: '#f472b6',
    content: () => (
      <div className="flex flex-col h-full gap-4">
        <h2 className="text-2xl font-black text-white">Файлы</h2>
        <p className="text-white/70 text-sm">Файлом может быть текст, картинка, музыка, видео, презентация</p>
        <div className="grid grid-cols-5 gap-3 flex-1">
          {[
            { icon: `${BASE}assets/icon-word.png`,   name:'Текст',       ext:'.docx', color:'#2B579A' },
            { icon: `${BASE}assets/icon-photos.png`, name:'Картинка',    ext:'.png',  color:'#0078D4' },
            { icon: `${BASE}assets/icon-music.png`,  name:'Музыка',      ext:'.mp3',  color:'#E37519' },
            { icon: null, emoji:'🎬',                name:'Видео',       ext:'.mp4',  color:'#C50F1F' },
            { icon: null, emoji:'📊',                name:'Презентация', ext:'.pptx', color:'#B7472A' },
          ].map(f => (
            <div key={f.name} className="flex flex-col items-center justify-center gap-2 rounded-xl p-3"
              style={{ background: `${f.color}22`, border: `1.5px solid ${f.color}55` }}>
              {f.icon
                ? <img src={f.icon} alt={f.name} className="w-14 h-14 object-contain"/>
                : <span className="text-5xl">{f.emoji}</span>}
              <div className="text-center">
                <div className="font-black text-white text-sm">{f.name}</div>
                <div className="font-mono text-xs text-white/50">{f.ext}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  },
  {
    id: 5,
    bg: 'from-[#0f2818] to-[#1a3d25]',
    accent: '#4ade80',
    content: () => (
      <div className="flex items-center h-full gap-8">
        <img src={`${BASE}assets/folder3d.png`} alt="" className="h-44 object-contain flex-shrink-0 float"/>
        <div className="flex-1">
          <h2 className="text-2xl font-black text-white mb-4">Папки <span className="text-[#4ade80]">помогают:</span></h2>
          <div className="grid gap-3">
            {[
              ['📦','Хранить файлы в одном месте'],
              ['🔍','Быстро находить нужные документы'],
              ['🗂️','Разделять картинки, видео, музыку и задания'],
              ['✨','Поддерживать порядок на рабочем столе'],
            ].map(([ic, text]) => (
              <div key={text} className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3">
                <span className="text-2xl">{ic}</span>
                <span className="text-white font-semibold text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  },
  {
    id: 6,
    bg: 'from-[#1f1000] to-[#3d2000]',
    accent: '#fbbf24',
    content: () => (
      <div className="flex flex-col h-full gap-4">
        <h2 className="text-2xl font-black text-white">Создание папки</h2>
        <div className="flex gap-4 flex-1">
          <div className="flex-1 overflow-hidden rounded-xl border border-white/10">
            <img src={`${BASE}assets/win-ctx-menu.jpeg`} alt="Контекстное меню Windows"
              className="w-full h-full object-cover object-center"/>
          </div>
          <div className="w-56 flex flex-col gap-3">
            {[
              ['1','Кликнуть правой кнопкой мыши по рабочему столу'],
              ['2','Навести курсором на «Создать»'],
              ['3','Выбрать «Папку»'],
              ['4','Назвать её и нажать Enter'],
            ].map(([n, t]) => (
              <div key={n} className="flex items-start gap-3 bg-white/10 rounded-xl px-3 py-2.5">
                <div className="w-6 h-6 rounded-full bg-[#fbbf24] text-black font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5">{n}</div>
                <span className="text-white/90 text-sm leading-snug">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  },
  {
    id: 7,
    bg: 'from-[#1a0a3c] to-[#2d1260]',
    accent: '#A3E635',
    content: () => (
      <div className="flex flex-col items-center justify-center h-full text-center gap-6">
        <div className="text-6xl float">💪</div>
        <h2 className="text-4xl font-black text-white">Теперь попробуй сам!</h2>
        <div className="bg-purple-500/20 border border-purple-500/40 rounded-2xl p-6 max-w-md">
          <div className="text-purple-400 text-xs font-black uppercase tracking-widest mb-3">Задание</div>
          <p className="text-white font-bold text-lg leading-relaxed">
            Создай папку на рабочем столе самостоятельно и{' '}
            <span className="text-[#A3E635]">внутри неё создай документ со своим именем</span>.
          </p>
        </div>
      </div>
    )
  },
  {
    id: 8,
    bg: 'from-[#0a2818] to-[#0f3d20]',
    accent: '#4ade80',
    content: () => (
      <div className="flex flex-col items-center justify-center h-full text-center gap-5">
        <motion.div initial={{scale:0}} animate={{scale:1}} transition={{type:'spring',bounce:0.5}}
          className="text-8xl">🏆</motion.div>
        <h2 className="text-4xl font-black text-[#4ade80]">Отлично!</h2>
        <p className="text-2xl font-bold text-white">У тебя получилось! Ты молодец.</p>
        <div className="flex gap-2">
          {[...Array(5)].map((_,i)=>(
            <motion.span key={i} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}
              transition={{delay:i*0.1}} className="text-3xl">⭐</motion.span>
          ))}
        </div>
      </div>
    )
  },
  {
    id: 9,
    bg: 'from-[#0f0f2e] to-[#1a1a4a]',
    accent: '#818cf8',
    content: () => (
      <div className="flex flex-col h-full gap-4">
        <div>
          <h2 className="text-2xl font-black text-white">Горячие клавиши</h2>
          <p className="text-white/60 text-sm mt-1">Быстрые команды на клавиатуре — помогают работать без лишних движений мышкой</p>
        </div>
        <div className="grid gap-3 flex-1">
          {[
            ['Ctrl + C','Копировать','#3b82f6','📋'],
            ['Ctrl + V','Вставить','#22c55e','📌'],
            ['Ctrl + S','Сохранить','#eab308','💾'],
            ['Ctrl + Z','Отменить последнее действие','#ef4444','↩️'],
            ['Ctrl + A','Выделить весь текст','#a855f7','✳️'],
          ].map(([k,d,c,ic])=>(
            <div key={k} className="flex items-center gap-4 rounded-xl px-4 py-3"
              style={{background:`${c}22`, border:`1.5px solid ${c}55`}}>
              <span className="text-xl">{ic}</span>
              <div className="font-black text-lg text-white font-mono flex-1">{k}</div>
              <div className="text-sm font-semibold" style={{color:c}}>{d}</div>
            </div>
          ))}
        </div>
      </div>
    )
  },
  {
    id: 10,
    bg: 'from-[#0d1f3c] to-[#162b50]',
    accent: '#60a5fa',
    content: () => (
      <div className="flex flex-col h-full gap-4">
        <h2 className="text-2xl font-black text-white">Ctrl+C и Ctrl+V</h2>
        <div className="grid grid-cols-2 gap-4 flex-1">
          <div className="bg-blue-500/15 border border-blue-500/30 rounded-2xl p-5 flex flex-col gap-3">
            <div className="text-4xl">📋</div>
            <div className="font-black text-2xl text-white font-mono">Ctrl + C</div>
            <div className="font-black text-blue-300 text-lg">Скопировать</div>
            <p className="text-white/70 text-sm">Сделать копию текста, картинки или файла</p>
          </div>
          <div className="bg-green-500/15 border border-green-500/30 rounded-2xl p-5 flex flex-col gap-3">
            <div className="text-4xl">📌</div>
            <div className="font-black text-2xl text-white font-mono">Ctrl + V</div>
            <div className="font-black text-green-300 text-lg">Вставить</div>
            <p className="text-white/70 text-sm">Поставить копию в нужное место</p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 11,
    bg: 'from-[#1a0f3c] to-[#2a1860]',
    accent: '#c084fc',
    content: () => (
      <div className="flex flex-col h-full gap-4">
        <h2 className="text-2xl font-black text-white">Буфер обмена</h2>
        <div className="bg-purple-500/15 border border-purple-500/30 rounded-2xl p-5 mb-2">
          <p className="text-white font-bold text-lg leading-relaxed">
            Это <span className="text-[#c084fc]">временное место</span>, где компьютер хранит то, что мы скопировали.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 flex-1">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4 flex flex-col gap-2">
            <div className="text-3xl">📋</div>
            <div className="font-black text-blue-300 font-mono">Ctrl + C</div>
            <div className="text-white/70 text-sm">Положить в буфер обмена</div>
          </div>
          <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 flex flex-col gap-2">
            <div className="text-3xl">📌</div>
            <div className="font-black text-green-300 font-mono">Ctrl + V</div>
            <div className="text-white/70 text-sm">Достать из буфера и вставить</div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 12,
    bg: 'from-[#1f1000] to-[#3d2000]',
    accent: '#fb923c',
    content: () => (
      <div className="flex flex-col h-full gap-4">
        <h2 className="text-2xl font-black text-white">Ctrl+S, Z, A</h2>
        <div className="grid gap-4 flex-1">
          {[
            ['Ctrl + S','СОХРАНЯЕТ','💾','#eab308','bg-yellow-500/15 border-yellow-500/30'],
            ['Ctrl + Z','ОТМЕНЯЕТ ПОСЛЕДНЕЕ ДЕЙСТВИЕ','↩️','#ef4444','bg-red-500/15 border-red-500/30'],
            ['Ctrl + A','ВЫДЕЛЯЕТ ВЕСЬ ТЕКСТ','✳️','#a855f7','bg-purple-500/15 border-purple-500/30'],
          ].map(([k,d,ic,c,cls])=>(
            <div key={k} className={`flex items-center gap-5 rounded-2xl px-6 py-4 border ${cls}`}>
              <span className="text-4xl">{ic}</span>
              <div className="flex-1">
                <div className="font-black text-2xl text-white font-mono">{k}</div>
                <div className="font-black text-sm uppercase tracking-wide mt-0.5" style={{color:c}}>{d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  },
  {
    id: 13,
    bg: 'from-[#0a1f1a] to-[#0f2d25]',
    accent: '#34d399',
    content: () => (
      <div className="flex flex-col h-full gap-4">
        <h2 className="text-3xl font-black text-[#34d399]">ПРАКТИКА</h2>
        <p className="text-white/60 text-sm">Выполни эти задания в симуляторе на следующем экране:</p>
        <div className="grid gap-2 flex-1">
          {[
            'Создай папку «Мой урок»',
            'В ней создай текстовый документ',
            'Напиши своё имя',
            'Скопируй имя через Ctrl + C',
            'Вставь его через Ctrl + V',
            'Сохрани файл через Ctrl + S',
          ].map((t,i)=>(
            <div key={i} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
              <div className="w-7 h-7 rounded-full bg-[#34d399]/20 border border-[#34d399]/50 text-[#34d399] font-black text-xs flex items-center justify-center flex-shrink-0">{i+1}</div>
              <span className="text-sm font-semibold text-white/90">{t}</span>
            </div>
          ))}
        </div>
        <div className="text-xs text-[#34d399] font-bold">🚀 Нажми «К практике» — там всё это интерактивно!</div>
      </div>
    )
  },
  {
    id: 14,
    bg: 'from-[#0a2818] to-[#0f3d20]',
    accent: '#4ade80',
    content: () => (
      <div className="flex flex-col items-center justify-center h-full text-center gap-5">
        <motion.div initial={{scale:0}} animate={{scale:1}} transition={{type:'spring',bounce:0.5}}
          className="text-8xl">🎉</motion.div>
        <h2 className="text-4xl font-black text-[#4ade80]">Отлично!</h2>
        <p className="text-xl font-bold text-white">У тебя получилось!</p>
        <img src={`${BASE}assets/char-front.png`} alt="" className="h-32 object-contain opacity-90"/>
      </div>
    )
  },
  {
    id: 15,
    bg: 'from-[#1a0a3c] to-[#2d1260]',
    accent: '#A3E635',
    content: () => (
      <div className="flex flex-col h-full gap-4">
        <h2 className="text-2xl font-black text-white">Что мы сегодня выучили?</h2>
        <div className="grid gap-2 flex-1">
          {[
            ['🖥️','Рабочий стол','Главный экран компьютера с иконками, папками и корзиной'],
            ['📁','Папка','Место для хранения файлов в порядке'],
            ['📄','Файлы','Текст, картинки, музыка, видео — у каждого своё расширение'],
            ['🗑️','Корзина','Хранит удалённые файлы — их можно восстановить'],
            ['⌨️','Сочетание клавиш','Ctrl+C копировать, Ctrl+V вставить, Ctrl+S сохранить'],
          ].map(([ic,t,d])=>(
            <div key={t} className="flex items-start gap-3 bg-white/8 rounded-xl px-4 py-3">
              <span className="text-2xl flex-shrink-0">{ic}</span>
              <div>
                <div className="font-black text-white text-sm">{t}</div>
                <div className="text-white/50 text-xs">{d}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center text-sm font-black text-[#A3E635]">🚀 Теперь — практика! Покажем что умеем.</div>
      </div>
    )
  },
]

/* ── slide transition ── */
const variants = {
  enter: (dir) => ({ opacity: 0, x: dir > 0 ? 60 : -60 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: (dir) => ({ opacity: 0, x: dir > 0 ? -60 : 60, transition: { duration: 0.2 } }),
}

export default function InteractiveSlides({ name, onFinish }) {
  const [[idx, dir], setPage] = useState([0, 0])
  const slide = SLIDES[idx]
  const isLast = idx === SLIDES.length - 1

  const go = (newDir) => {
    const next = idx + newDir
    if (next < 0 || next >= SLIDES.length) return
    setPage([next, newDir])
  }

  // Keyboard navigation
  useEffect(() => {
    const h = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') go(1)
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   go(-1)
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [idx])

  return (
    <div className="min-h-screen pt-14 flex flex-col items-center bg-[#0D0D1A]">
      {/* Progress dots */}
      <div className="w-full max-w-3xl px-4 mt-4 mb-2 flex items-center justify-between">
        <div className="flex gap-1">
          {SLIDES.map((s, i) => (
            <button key={s.id} onClick={() => setPage([i, i > idx ? 1 : -1])}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                i === idx ? 'w-6 bg-[#A3E635]' : i < idx ? 'w-2 bg-[#A3E635]/40' : 'w-2 bg-white/20'
              }`}/>
          ))}
        </div>
        <span className="text-xs text-white/40 font-bold">{idx + 1} / {SLIDES.length}</span>
      </div>

      {/* Slide */}
      <div className="w-full max-w-3xl px-4 flex-1 flex flex-col" style={{ minHeight: 0 }}>
        <div className={`flex-1 rounded-2xl bg-gradient-to-br ${slide.bg} overflow-hidden relative`}
          style={{ border: `1.5px solid ${slide.accent}22`, minHeight: 340 }}>
          {/* Decorative blob */}
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 blur-3xl"
            style={{ background: slide.accent }}/>

          <AnimatePresence mode="wait" custom={dir}>
            <motion.div key={idx} custom={dir} variants={variants}
              initial="enter" animate="center" exit="exit"
              className="absolute inset-0 p-7">
              <slide.content />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <div className="w-full max-w-3xl px-4 py-4 flex items-center justify-between gap-3">
        <button className="btn-outline w-32" onClick={() => go(-1)} disabled={idx === 0}>
          ← Назад
        </button>

        {/* Dot navigation */}
        <div className="flex gap-1.5 items-center">
          {SLIDES.map((s, i) => (
            <button key={s.id} onClick={() => setPage([i, i > idx ? 1 : -1])}
              className={`rounded-full transition-all ${
                i === idx ? 'w-3 h-3 bg-[#A3E635]' : 'w-2 h-2 bg-white/20 hover:bg-white/40'
              }`}/>
          ))}
        </div>

        <button className="btn-green w-32" onClick={() => isLast ? onFinish() : go(1)}>
          {isLast ? 'К практике →' : 'Дальше →'}
        </button>
      </div>
    </div>
  )
}
