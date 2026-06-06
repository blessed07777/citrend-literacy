import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const BASE = import.meta.env.BASE_URL

/* ─── Initial data ─── */
const INIT_FILES = [
  { id:'photo',    name:'photo.png',     icon:'img',   loc:'desktop', ext:'png'  },
  { id:'music',    name:'music.mp3',     icon:'audio', loc:'desktop', ext:'mp3'  },
  { id:'homework', name:'homework.docx', icon:'word',  loc:'desktop', ext:'docx' },
  { id:'old',      name:'old.txt',       icon:'txt',   loc:'desktop', ext:'txt'  },
]
const INIT_FOLDERS = [
  { id:'docs',    name:'Документы' },
  { id:'photos',  name:'Фото'      },
  { id:'music-f', name:'Музыка'    },
]

const TASKS = [
  { id:'click-docs',   text:'Нажми на папку «Документы»',
    hints:['Папки — жёлтые иконки','Найди «Документы» на рабочем столе','Кликни на 📁 Документы'], points:10,
    check:(a) => a.type==='click-folder' && a.id==='docs' },
  { id:'open-photos',  text:'Открой папку «Фото» двойным кликом',
    hints:['Двойной клик = два быстрых нажатия','Найди папку «Фото»','Дважды кликни на 📁 Фото'], points:10,
    check:(a) => a.type==='open-folder' && a.id==='photos' },
  { id:'drag-photo',   text:'Перетащи «photo.png» в папку «Фото»',
    hints:['Удержи кнопку мыши и потяни файл к папке','photo.png — иконка с горой 🏔️','Потяни photo.png на папку Фото'], points:15,
    check:(a) => a.type==='drop-folder' && a.fileId==='photo' && a.folderId==='photos' },
  { id:'drag-music',   text:'Перетащи «music.mp3» в папку «Музыка»',
    hints:['Нажми, удержи, потяни, отпусти','music.mp3 — иконка с нотой 🎵','Потяни music.mp3 на папку Музыка'], points:15,
    check:(a) => a.type==='drop-folder' && a.fileId==='music' && a.folderId==='music-f' },
  { id:'drag-homework', text:'Перетащи «homework.docx» в «Документы»',
    hints:['.docx — это документ Word','homework.docx — синяя иконка W','Потяни homework.docx на Документы'], points:15,
    check:(a) => a.type==='drop-folder' && a.fileId==='homework' && a.folderId==='docs' },
  { id:'drag-trash',   text:'Перетащи «old.txt» в Корзину',
    hints:['Корзина — на рабочем столе, иконка 🗑️','Найди old.txt','Потяни old.txt на Корзину'], points:15,
    check:(a) => a.type==='drop-trash' && a.fileId==='old' },
  { id:'restore',      text:'Открой Корзину и восстанови «old.txt»',
    hints:['Двойной клик по Корзине','Найди old.txt внутри','Нажми «Восстановить»'], points:15,
    check:(a) => a.type==='restore' && a.fileId==='old' },
  { id:'create-folder',text:'Правый клик по рабочему столу → Создать папку',
    hints:['Нажми ПРАВУЮ кнопку мыши по пустому месту стола','В меню выбери «Создать» → «Папку»','Правый клик → Создать → Папку'], points:15,
    check:(a) => a.type==='create-folder' },
  { id:'ctrl-c',       text:'Выдели «homework.docx» и нажми Ctrl+C',
    hints:['Сначала кликни на homework.docx','Потом удержи Ctrl и нажми C','Клик на файл → Ctrl+C'], points:10,
    check:(a) => a.type==='copy' && a.fileId==='homework' },
  { id:'ctrl-s',       text:'Нажми Ctrl+S чтобы сохранить',
    hints:['Ctrl+S = сохранить','Удержи Ctrl, нажми S','Используй клавиши Ctrl+S'], points:10,
    check:(a) => a.type==='save' },
]

/* ──────────────────────────────────────────
   Windows 10 OFFICIAL icons — pixel-perfect SVG replicas
────────────────────────────────────────── */
function FileIcon({ type, size = 40 }) {
  const s = size

  /* ── ПАПКА — точная копия Windows 10 Explorer folder ── */
  if (type === 'folder') return (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      {/* Задняя стенка папки */}
      <path d="M4 38 V16 C4 14.9 4.9 14 6 14 H20.5 L24 18 H42 C43.1 18 44 18.9 44 20 V38 C44 39.1 43.1 40 42 40 H6 C4.9 40 4 39.1 4 38Z"
        fill="#D4870E"/>
      {/* Таб (язычок) папки */}
      <path d="M4 14 H20.5 L24 18 H4 Z" fill="#C67C0D"/>
      {/* Передняя грань — основная */}
      <rect x="4" y="20" width="40" height="20" rx="1.5" fill="#FFB900"/>
      {/* Блик сверху */}
      <rect x="4" y="20" width="40" height="5" rx="1.5" fill="#FFC83D"/>
      {/* Тень снизу */}
      <path d="M4 36 H44 V38.5 C44 39.3 43.3 40 42.5 40 H5.5 C4.7 40 4 39.3 4 38.5 Z"
        fill="#E0A000"/>
    </svg>
  )

  /* ── ЭТОТ КОМПЬЮТЕР — Windows 10 This PC icon ── */
  if (type === 'pc') return (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      {/* Монитор корпус */}
      <rect x="4" y="6" width="40" height="28" rx="2.5" fill="#1B6BBF"/>
      {/* Монитор экран */}
      <rect x="7" y="9" width="34" height="21" rx="1" fill="#50B4D8"/>
      {/* Блик экрана */}
      <rect x="7" y="9" width="34" height="5" rx="1" fill="white" opacity="0.2"/>
      {/* Ножка */}
      <rect x="20" y="34" width="8" height="5" fill="#1B6BBF"/>
      {/* Подставка */}
      <rect x="14" y="39" width="20" height="3" rx="1.5" fill="#1254A0"/>
      {/* Windows лого на экране */}
      <g transform="translate(17,14) scale(0.6)">
        <rect x="0" y="0" width="6" height="6" rx="0.5" fill="white"/>
        <rect x="8" y="0" width="6" height="6" rx="0.5" fill="white"/>
        <rect x="0" y="8" width="6" height="6" rx="0.5" fill="white"/>
        <rect x="8" y="8" width="6" height="6" rx="0.5" fill="white"/>
      </g>
    </svg>
  )

  /* ── КОРЗИНА ПУСТАЯ — Windows 10 Recycle Bin (empty) ── */
  if (type === 'trash-empty') return (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      {/* Крышка */}
      <path d="M10 14 H38 V17 H10 Z" rx="1" fill="#7EB8E8"/>
      <rect x="10" y="14" width="28" height="3" rx="1" fill="#9ECEF0"/>
      {/* Ручка крышки */}
      <path d="M18 14 V11 C18 10.4 18.4 10 19 10 H29 C29.6 10 30 10.4 30 11 V14"
        fill="none" stroke="#7EB8E8" strokeWidth="2.5"/>
      {/* Тело корзины */}
      <path d="M12 17 L13.5 40 C13.5 41.1 14.4 42 15.5 42 H32.5 C33.6 42 34.5 41.1 34.5 40 L36 17 Z"
        fill="#BDD9F0"/>
      {/* Боковые грани (3D-эффект) */}
      <path d="M12 17 L13.5 40 C13.5 41.1 14.4 42 15.5 42 H17 L15.5 17 Z" fill="#7EB8E8"/>
      <path d="M36 17 L34.5 40 C34.5 41.1 33.6 42 32.5 42 H31 L32.5 17 Z" fill="#7EB8E8"/>
      {/* Рёбра (линии) */}
      <line x1="20" y1="20" x2="19.2" y2="39" stroke="#7EB8E8" strokeWidth="1.2"/>
      <line x1="24" y1="20" x2="24"   y2="39" stroke="#7EB8E8" strokeWidth="1.2"/>
      <line x1="28" y1="20" x2="28.8" y2="39" stroke="#7EB8E8" strokeWidth="1.2"/>
      {/* Стрелки переработки */}
      <path d="M19 28 C19 24 25 21 28 24" fill="none" stroke="#4A90D9" strokeWidth="1.5" strokeLinecap="round"/>
      <polygon points="29,21 32,25 26,25" fill="#4A90D9"/>
      <path d="M29 29 C29 33 23 36 20 33" fill="none" stroke="#4A90D9" strokeWidth="1.5" strokeLinecap="round"/>
      <polygon points="19,36 16,32 22,32" fill="#4A90D9"/>
    </svg>
  )

  /* ── КОРЗИНА ПОЛНАЯ — Windows 10 Recycle Bin (full) ── */
  if (type === 'trash-full') return (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      {/* Тело корзины */}
      <path d="M12 17 L13.5 40 C13.5 41.1 14.4 42 15.5 42 H32.5 C33.6 42 34.5 41.1 34.5 40 L36 17 Z"
        fill="#9ECEF0"/>
      <path d="M12 17 L13.5 40 C13.5 41.1 14.4 42 15.5 42 H17 L15.5 17 Z" fill="#7EB8E8"/>
      <path d="M36 17 L34.5 40 C34.5 41.1 33.6 42 32.5 42 H31 L32.5 17 Z" fill="#7EB8E8"/>
      {/* Бумаги торчат из корзины */}
      <rect x="16" y="11" width="7" height="14" rx="1" fill="white" stroke="#C8C8C8" strokeWidth="0.7" transform="rotate(-10 19 17)"/>
      <rect x="22" y="10" width="7" height="14" rx="1" fill="white" stroke="#C8C8C8" strokeWidth="0.7"/>
      <rect x="26" y="12" width="7" height="13" rx="1" fill="white" stroke="#C8C8C8" strokeWidth="0.7" transform="rotate(8 30 18)"/>
      {/* Крышка открыта (наклонена) */}
      <path d="M9 16 L24 12 L39 16 L38 19 L24 15 L10 19 Z" fill="#9ECEF0"/>
      <rect x="9" y="16" width="30" height="3" rx="1" fill="#BDD9F0"/>
      {/* Ручка */}
      <path d="M18 12 V9 C18 8.4 18.4 8 19 8 H29 C29.6 8 30 8.4 30 9 V12"
        fill="none" stroke="#7EB8E8" strokeWidth="2.2"/>
      {/* Линии на корзине */}
      <line x1="20" y1="21" x2="19.2" y2="39" stroke="#7EB8E8" strokeWidth="1.2"/>
      <line x1="24" y1="21" x2="24"   y2="39" stroke="#7EB8E8" strokeWidth="1.2"/>
      <line x1="28" y1="21" x2="28.8" y2="39" stroke="#7EB8E8" strokeWidth="1.2"/>
    </svg>
  )

  /* ── PNG / IMAGE — Windows 10 Photos app icon style ── */
  if (type === 'img') return (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      {/* Фон страницы */}
      <rect x="4" y="4" width="40" height="40" rx="2" fill="white" stroke="#D4D4D4" strokeWidth="0.8"/>
      {/* Загнутый угол */}
      <path d="M30 4 L44 18 L30 18 Z" fill="#E8E8E8"/>
      <path d="M30 4 H44 V18" fill="none" stroke="#D4D4D4" strokeWidth="0.8"/>
      {/* Цветная картинка внутри — Windows Photos стиль */}
      <rect x="7" y="20" width="34" height="22" rx="1.5" fill="#E8F4FC"/>
      {/* Небо */}
      <rect x="7" y="20" width="34" height="10" rx="1.5" fill="#87CEEB"/>
      {/* Горы */}
      <path d="M7 36 L17 24 L24 30 L30 22 L41 36 Z" fill="#5D9B4A"/>
      <path d="M7 36 L17 24 L21 28 Z" fill="#78B85F"/>
      {/* Солнце */}
      <circle cx="37" cy="24" r="4" fill="#FFD700"/>
      {/* Надпись .PNG */}
      <rect x="7" y="7" width="18" height="8" rx="1" fill="#0078D4"/>
      <text x="10" y="14" fontSize="6.5" fontWeight="bold" fill="white" fontFamily="Segoe UI,Arial">.PNG</text>
    </svg>
  )

  /* ── MP3 / AUDIO — Windows 10 Groove Music icon style ── */
  if (type === 'audio') return (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      {/* Фон страницы */}
      <rect x="4" y="4" width="40" height="40" rx="2" fill="white" stroke="#D4D4D4" strokeWidth="0.8"/>
      {/* Загнутый угол */}
      <path d="M30 4 L44 18 L30 18 Z" fill="#E8E8E8"/>
      <path d="M30 4 H44 V18" fill="none" stroke="#D4D4D4" strokeWidth="0.8"/>
      {/* Оранжевый блок с нотой */}
      <rect x="7" y="20" width="34" height="22" rx="1.5" fill="#FF8C00"/>
      {/* Нота */}
      <path d="M20 36 L20 26 L32 23 L32 33" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <circle cx="18" cy="37" r="3.5" fill="white"/>
      <circle cx="30" cy="34" r="3.5" fill="white"/>
      {/* Надпись .MP3 */}
      <rect x="7" y="7" width="18" height="8" rx="1" fill="#FF8C00"/>
      <text x="9" y="14" fontSize="6.5" fontWeight="bold" fill="white" fontFamily="Segoe UI,Arial">.MP3</text>
    </svg>
  )

  /* ── DOCX — точная копия иконки Microsoft Word 2019/365 ── */
  if (type === 'word') return (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      {/* Страница */}
      <rect x="6" y="2" width="30" height="38" rx="2" fill="white" stroke="#D4D4D4" strokeWidth="0.8"/>
      {/* Загнутый угол */}
      <path d="M28 2 L36 10 L28 10 Z" fill="#E0E0E0"/>
      <path d="M28 2 H36 V10" fill="none" stroke="#D4D4D4" strokeWidth="0.8"/>
      {/* Строки текста */}
      <line x1="10" y1="18" x2="32" y2="18" stroke="#E0E0E0" strokeWidth="1.5"/>
      <line x1="10" y1="22" x2="32" y2="22" stroke="#E0E0E0" strokeWidth="1.5"/>
      <line x1="10" y1="26" x2="32" y2="26" stroke="#E0E0E0" strokeWidth="1.5"/>
      <line x1="10" y1="30" x2="24" y2="30" stroke="#E0E0E0" strokeWidth="1.5"/>
      {/* Word значок-плашка поверх */}
      <rect x="2" y="28" width="32" height="20" rx="3" fill="#2B579A"/>
      {/* Буква W — официальный стиль Microsoft */}
      <text x="6" y="44" fontSize="17" fontWeight="bold" fill="white"
        fontFamily="Segoe UI,Arial,sans-serif">W</text>
      {/* Синяя полоса сверху */}
      <rect x="2" y="28" width="32" height="5" rx="3" fill="#1E4078"/>
      <text x="6" y="44" fontSize="17" fontWeight="bold" fill="white"
        fontFamily="Segoe UI,Arial,sans-serif">W</text>
    </svg>
  )

  /* ── TXT — Windows 10 Notepad icon ── */
  if (type === 'txt') return (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      {/* Страница */}
      <rect x="6" y="4" width="30" height="40" rx="2" fill="white" stroke="#C8C8C8" strokeWidth="1"/>
      {/* Загнутый уголок */}
      <path d="M28 4 L36 12" stroke="#C0C0C0" strokeWidth="1"/>
      <path d="M28 4 L28 12 L36 12" fill="#E8E8E8" stroke="#C8C8C8" strokeWidth="1"/>
      {/* Синяя линейка Блокнота */}
      <rect x="6" y="4" width="22" height="6" rx="2" fill="#0078D4"/>
      <rect x="6" y="7" width="22" height="3" fill="#005A9E"/>
      {/* Текстовые строки */}
      <line x1="10" y1="18" x2="32" y2="18" stroke="#A0A0A0" strokeWidth="1.4"/>
      <line x1="10" y1="23" x2="32" y2="23" stroke="#A0A0A0" strokeWidth="1.4"/>
      <line x1="10" y1="28" x2="32" y2="28" stroke="#A0A0A0" strokeWidth="1.4"/>
      <line x1="10" y1="33" x2="26" y2="33" stroke="#A0A0A0" strokeWidth="1.4"/>
      {/* Курсор (мигающий) */}
      <rect x="26" y="30" width="2" height="5" rx="1" fill="#0078D4"/>
      {/* Надпись .TXT */}
      <rect x="26" y="37" width="16" height="8" rx="1.5" fill="#0078D4"/>
      <text x="28.5" y="43.5" fontSize="5.5" fontWeight="bold" fill="white" fontFamily="Segoe UI,Arial">.TXT</text>
    </svg>
  )

  return <span style={{ fontSize: s * 0.7 }}>📄</span>
}

/* ──────────────────────────────────────────
   Windows 10 wallpaper — white + purple wave
────────────────────────────────────────── */
function Win10Wallpaper() {
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: '#e8e4f3' }}>
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="wg1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c7b8ea" stopOpacity="0.6"/>
            <stop offset="100%" stopColor="#7b6be4" stopOpacity="0.95"/>
          </linearGradient>
          <linearGradient id="wg2" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#9b8fd4" stopOpacity="0.5"/>
            <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.4"/>
          </linearGradient>
        </defs>
        {/* Main large wave ribbon */}
        <path d="M 1440 0 C 1100 0, 820 180, 920 420 C 1020 660, 740 780, 980 900 L 1440 900 Z"
          fill="url(#wg1)"/>
        {/* Secondary wave */}
        <path d="M 1440 120 C 1160 80, 900 280, 1000 500 C 1100 720, 860 840, 1100 900 L 1440 900 Z"
          fill="url(#wg2)"/>
        {/* Highlight ribbon */}
        <path d="M 1440 250 C 1200 220, 1050 380, 1120 580 C 1190 780, 1000 880, 1200 900 L 1440 900 Z"
          fill="white" opacity="0.12"/>
      </svg>
      {/* Subtle grid dots like Win10 */}
      <div className="absolute inset-0" style={{
        backgroundImage: 'radial-gradient(circle, rgba(123,107,228,0.07) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
      }}/>
    </div>
  )
}

/* ──────────────────────────────────────────
   WIN10 CONTEXT MENU
────────────────────────────────────────── */
function Win10CtxMenu({ menu, onCreateFolder, onPaste, onRefresh, onClose }) {
  if (!menu) return null
  const Item = ({ icon, label, shortcut, onClick, divider, sub }) => divider
    ? <div style={{ height:1, background:'#e5e5e5', margin:'4px 0' }}/>
    : (
      <button onClick={() => { onClick?.(); onClose() }}
        className="w-full text-left flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-[#0078d4] hover:text-white transition-colors rounded-sm"
        style={{ fontFamily:'Segoe UI,system-ui,sans-serif', fontSize:13, color:'#1a1a1a' }}>
        <span className="w-5 text-base">{icon}</span>
        <span className="flex-1">{label}</span>
        {shortcut && <span className="opacity-50 text-xs">{shortcut}</span>}
        {sub && <span className="opacity-50">›</span>}
      </button>
    )

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose}/>
      <div style={{
        position:'fixed', left: menu.x, top: menu.y, zIndex:50,
        background:'#f9f9f9', border:'1px solid #e0e0e0',
        borderRadius:4, padding:'4px 0', minWidth:200,
        boxShadow:'0 8px 32px rgba(0,0,0,0.22)',
        fontFamily:'Segoe UI,system-ui,sans-serif',
      }}>
        {menu.target === 'desktop' ? <>
          <Item icon="👁️" label="Вид" sub />
          <Item icon="↕️" label="Сортировать" sub />
          <Item icon="🔄" label="Обновить" onClick={onRefresh}/>
          <Item divider />
          <Item icon="📋" label="Вставить" onClick={onPaste}/>
          <Item icon="✂️" label="Вставить ярлык"/>
          <Item icon="↩️" label="Отменить удаление" shortcut="Ctrl+Z"/>
          <Item divider />
          <Item icon="➕" label="Создать" sub onClick={onCreateFolder}/>
          <Item divider />
          <Item icon="🖥️" label="Параметры экрана"/>
          <Item icon="🎨" label="Персонализация"/>
        </> : <>
          <Item icon="📂" label="Открыть"/>
          <Item icon="📋" label="Копировать" shortcut="Ctrl+C"/>
          <Item icon="✂️" label="Вырезать" shortcut="Ctrl+X"/>
          <Item divider />
          <Item icon="🗑️" label="Удалить" shortcut="Del"/>
          <Item icon="✏️" label="Переименовать"/>
          <Item divider />
          <Item icon="🔧" label="Свойства"/>
        </>}
      </div>
    </>
  )
}

/* ──────────────────────────────────────────
   DRAGGABLE WINDOW
────────────────────────────────────────── */
function Win10Window({ title, icon, onClose, onMinimize, children, defaultX = 120, defaultY = 60, width = 560, height = 380 }) {
  const [pos, setPos]       = useState({ x: defaultX, y: defaultY })
  const [drag, setDrag]     = useState(false)
  const [offset, setOffset] = useState({ x:0, y:0 })

  const onMouseDown = (e) => {
    if (e.target.closest('button')) return
    setDrag(true)
    setOffset({ x: e.clientX - pos.x, y: e.clientY - pos.y })
  }

  useEffect(() => {
    if (!drag) return
    const move = (e) => setPos({ x: e.clientX - offset.x, y: e.clientY - offset.y })
    const up   = () => setDrag(false)
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up) }
  }, [drag, offset])

  return (
    <motion.div initial={{ scale:0.95, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0.95, opacity:0 }}
      style={{ position:'fixed', left:pos.x, top:pos.y, width, zIndex:30,
        boxShadow:'0 8px 40px rgba(0,0,0,0.35)', borderRadius:2, overflow:'hidden', border:'1px solid #c0c0c0' }}>
      {/* Accent line */}
      <div style={{ height:3, background:'linear-gradient(90deg,#7b6be4,#a78bfa)' }}/>
      {/* Title bar */}
      <div onMouseDown={onMouseDown}
        style={{ background:'#f3f3f3', height:32, display:'flex', alignItems:'center',
          padding:'0 8px', cursor:drag?'grabbing':'grab', userSelect:'none',
          borderBottom:'1px solid #e0e0e0', fontFamily:'Segoe UI,sans-serif', fontSize:13 }}>
        <span style={{ marginRight:6, fontSize:16 }}>{icon}</span>
        <span style={{ flex:1, color:'#1a1a1a', fontWeight:400 }}>{title}</span>
        <button onClick={onMinimize}
          style={{ width:46, height:32, border:'none', background:'transparent', cursor:'pointer', fontSize:16, color:'#666' }}
          onMouseOver={e=>e.target.style.background='#e5e5e5'} onMouseOut={e=>e.target.style.background='transparent'}>—</button>
        <button onClick={onMinimize}
          style={{ width:46, height:32, border:'none', background:'transparent', cursor:'pointer', fontSize:13, color:'#666' }}
          onMouseOver={e=>e.target.style.background='#e5e5e5'} onMouseOut={e=>e.target.style.background='transparent'}>□</button>
        <button onClick={onClose}
          style={{ width:46, height:32, border:'none', background:'transparent', cursor:'pointer', fontSize:16, color:'#666' }}
          onMouseOver={e=>{e.target.style.background='#c42b1c';e.target.style.color='white'}}
          onMouseOut={e=>{e.target.style.background='transparent';e.target.style.color='#666'}}>✕</button>
      </div>
      {/* Content */}
      <div style={{ height: height - 35, background:'white', overflow:'auto', fontFamily:'Segoe UI,sans-serif' }}>
        {children}
      </div>
    </motion.div>
  )
}

/* ──────────────────────────────────────────
   FILE EXPLORER WINDOW
────────────────────────────────────────── */
function FileExplorer({ folder, files, allFolders, onClose, onRestore, isTrash }) {
  const name  = isTrash ? 'Корзина' : folder?.name
  const items = isTrash ? files : files.filter(f => f.loc === folder?.id)

  return (
    <Win10Window title={name} icon={isTrash ? '🗑️' : '📁'} onClose={onClose} onMinimize={onClose}
      defaultX={180} defaultY={80} width={580} height={420}>
      {/* Toolbar */}
      <div style={{ background:'#f9f9f9', borderBottom:'1px solid #e5e5e5', padding:'6px 12px', display:'flex', alignItems:'center', gap:8 }}>
        {['←','→','↑'].map(a => (
          <button key={a} style={{ width:28, height:26, border:'1px solid #e0e0e0', borderRadius:3, background:'white', cursor:'pointer', fontSize:12 }}>{a}</button>
        ))}
        <div style={{ flex:1, background:'white', border:'1px solid #c0c0c0', borderRadius:2, padding:'3px 8px', fontSize:12, color:'#666' }}>
          › Этот компьютер › {name}
        </div>
        <div style={{ background:'white', border:'1px solid #c0c0c0', borderRadius:2, padding:'3px 8px', fontSize:12, color:'#888', minWidth:120 }}>
          🔍 Поиск в {name}
        </div>
      </div>
      {/* Body */}
      <div style={{ display:'flex', height:'100%' }}>
        {/* Left nav */}
        <div style={{ width:160, background:'#f9f9f9', borderRight:'1px solid #e5e5e5', padding:'8px 0', flexShrink:0 }}>
          {['🚀 Быстрый доступ','📌 Рабочий стол','⬇️ Загрузки','📁 Документы','🖼️ Изображения','🎵 Музыка','📹 Видео','💻 Этот компьютер'].map(item => (
            <div key={item} style={{ padding:'5px 12px', fontSize:12, color:'#333', cursor:'pointer' }}
              onMouseOver={e=>e.target.style.background='#e8e8e8'} onMouseOut={e=>e.target.style.background='transparent'}>
              {item}
            </div>
          ))}
        </div>
        {/* Files area */}
        <div style={{ flex:1, padding:16 }}>
          {items.length === 0 ? (
            <div style={{ color:'#999', fontSize:13, textAlign:'center', marginTop:40 }}>Папка пуста</div>
          ) : (
            <div style={{ display:'flex', flexWrap:'wrap', gap:16 }}>
              {items.map(f => (
                <div key={f.id} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, width:72, cursor:'pointer', padding:6, borderRadius:4 }}
                  onMouseOver={e=>e.currentTarget.style.background='#e8f0fe'} onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                  <FileIcon type={f.icon} size={40}/>
                  <span style={{ fontSize:11, textAlign:'center', wordBreak:'break-all', color:'#1a1a1a' }}>{f.name}</span>
                  {isTrash && (
                    <button onClick={() => onRestore(f.id)}
                      style={{ fontSize:10, background:'#0078d4', color:'white', border:'none', borderRadius:3, padding:'2px 6px', cursor:'pointer', marginTop:2 }}>
                      Восстановить
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Win10Window>
  )
}

/* ──────────────────────────────────────────
   TOAST NOTIFICATION
────────────────────────────────────────── */
function Toast({ msg, type }) {
  return (
    <motion.div initial={{ x: 60, opacity:0 }} animate={{ x:0, opacity:1 }} exit={{ x:60, opacity:0 }}
      style={{
        position:'fixed', bottom:64, right:16, zIndex:60,
        background: type==='success' ? '#107c10' : '#1a1a1a',
        color:'white', borderRadius:4, padding:'12px 16px',
        maxWidth:300, boxShadow:'0 4px 20px rgba(0,0,0,0.4)',
        fontFamily:'Segoe UI,sans-serif', fontSize:13, display:'flex', gap:8,
      }}>
      <span>{type==='success' ? '✅' : 'ℹ️'}</span>
      <span>{msg}</span>
    </motion.div>
  )
}

/* ══════════════════════════════════════════
   MAIN SIMULATOR COMPONENT
══════════════════════════════════════════ */
export default function PracticeSimulator({ name, onFinish }) {
  const [files,         setFiles]         = useState(INIT_FILES)
  const [folders]                          = useState(INIT_FOLDERS)
  const [customFolders, setCustomFolders] = useState([])
  const [trash,         setTrash]         = useState([])
  const [selected,      setSelected]      = useState(null)
  const [clipboard,     setClipboard]     = useState(null)
  const [dragItem,      setDragItem]      = useState(null)
  const [dropTarget,    setDropTarget]    = useState(null)
  const [ctxMenu,       setCtxMenu]       = useState(null)
  const [openWindow,    setOpenWindow]    = useState(null)
  const [startMenu,     setStartMenu]     = useState(false)
  const [toast,         setToast]         = useState(null)
  const [taskIdx,       setTaskIdx]       = useState(0)
  const [completedTasks,setCompletedTasks]= useState([])
  const [hintIdx,       setHintIdx]       = useState(0)
  const [totalHints,    setTotalHints]    = useState(0)
  const [score,         setScore]         = useState(0)
  const [newFolderModal,setNewFolderModal]= useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [clock,         setClock]         = useState('')

  // Clock
  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString('ru', { hour:'2-digit', minute:'2-digit' }))
    tick(); const t = setInterval(tick, 10000); return () => clearInterval(t)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const h = (e) => {
      if (!(e.ctrlKey || e.metaKey)) return
      if (e.key === 's') { e.preventDefault(); dispatch({ type:'save' }) }
      if (e.key === 'c' && selected) { e.preventDefault(); setClipboard({ fileId: selected }); dispatch({ type:'copy', fileId: selected }); showToast('Скопировано в буфер обмена') }
      if (e.key === 'v' && clipboard) { e.preventDefault(); showToast('Вставлено из буфера') }
      if (e.key === 'z') { e.preventDefault(); showToast('Действие отменено') }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [selected, clipboard])

  // Close menus on click outside
  useEffect(() => {
    const h = () => { setCtxMenu(null); setStartMenu(false) }
    window.addEventListener('click', h)
    return () => window.removeEventListener('click', h)
  }, [])

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 2500)
  }

  const dispatch = useCallback((action) => {
    const task = TASKS[taskIdx]
    if (!task || completedTasks.includes(task.id)) return
    if (task.check(action)) {
      setCompletedTasks(p => [...p, task.id])
      setScore(p => p + task.points)
      showToast(`✅ Задание выполнено! +${task.points} очков`, 'success')
      setTaskIdx(p => p + 1)
      setHintIdx(0)
    }
  }, [taskIdx, completedTasks])

  // DnD
  const onDragStart = (e, fileId) => { e.dataTransfer.setData('text', fileId); setDragItem(fileId) }
  const onDragEnd   = () => { setDragItem(null); setDropTarget(null) }

  const dropToFolder = (e, folderId) => {
    e.preventDefault(); setDropTarget(null)
    const fileId = e.dataTransfer.getData('text'); if (!fileId) return
    setFiles(p => p.map(f => f.id === fileId ? { ...f, loc: folderId } : f))
    dispatch({ type:'drop-folder', fileId, folderId })
    showToast('Файл перемещён в папку')
  }

  const dropToTrash = (e) => {
    e.preventDefault(); setDropTarget(null)
    const fileId = e.dataTransfer.getData('text'); if (!fileId) return
    const file = files.find(f => f.id === fileId); if (!file) return
    setFiles(p => p.filter(f => f.id !== fileId))
    setTrash(p => [...p, file])
    dispatch({ type:'drop-trash', fileId })
    showToast('Файл перемещён в Корзину')
  }

  const restoreFile = (fileId) => {
    const file = trash.find(f => f.id === fileId); if (!file) return
    setTrash(p => p.filter(f => f.id !== fileId))
    setFiles(p => [...p, { ...file, loc:'desktop' }])
    dispatch({ type:'restore', fileId })
  }

  const allFolders  = [...folders, ...customFolders]
  const desktopFiles = files.filter(f => f.loc === 'desktop')
  const currentTask  = TASKS[taskIdx]
  const done         = taskIdx >= TASKS.length

  return (
    <div className="fixed inset-0 pt-14" style={{ fontFamily:'Segoe UI,system-ui,sans-serif' }}>
      {/* ── Desktop area ── */}
      <div className="absolute inset-0 top-14 bottom-12 overflow-hidden"
        onContextMenu={e => { e.preventDefault(); setCtxMenu({ x:e.clientX, y:e.clientY, target:'desktop' }) }}
        onClick={() => { setSelected(null); setCtxMenu(null); setStartMenu(false) }}>

        {/* Wallpaper */}
        <Win10Wallpaper />

        {/* ── Desktop icons: folders (top-left column) ── */}
        <div className="absolute left-4 top-4 flex flex-col gap-1 z-10">
          {/* This PC */}
          <DesktopIcon label="Этот компьютер" type="pc"
            onClick={e => { e.stopPropagation(); dispatch({ type:'click-folder', id:'pc' }) }}
            onDblClick={() => showToast('Этот компьютер — здесь все диски')} />
          {/* Recycle Bin */}
          <DesktopIcon
            label="Корзина"
            type={trash.length ? 'trash-full' : 'trash-empty'}
            dropHighlight={dropTarget === 'trash'}
            onDblClick={() => setOpenWindow({ type:'trash' })}
            onClick={e => e.stopPropagation()}
            onDragOver={e => { e.preventDefault(); setDropTarget('trash') }}
            onDragLeave={() => setDropTarget(null)}
            onDrop={dropToTrash}
          />
          {/* System folders */}
          {allFolders.map(f => (
            <DesktopIcon key={f.id} label={f.name} type="folder"
              badgeCount={files.filter(x => x.loc === f.id).length}
              dropHighlight={dropTarget === f.id}
              selected={selected === f.id}
              onClick={e => { e.stopPropagation(); setSelected(f.id); dispatch({ type:'click-folder', id:f.id }) }}
              onDblClick={() => { setOpenWindow({ type:'folder', id:f.id }); dispatch({ type:'open-folder', id:f.id }) }}
              onDragOver={e => { e.preventDefault(); setDropTarget(f.id) }}
              onDragLeave={() => setDropTarget(null)}
              onDrop={e => dropToFolder(e, f.id)}
            />
          ))}
        </div>

        {/* ── Desktop files (second column) ── */}
        <div className="absolute left-24 top-4 flex flex-col gap-1 z-10">
          {desktopFiles.map(file => (
            <DesktopIcon key={file.id} label={file.name} type={file.icon}
              draggable selected={selected === file.id}
              isDragging={dragItem === file.id}
              onClick={e => { e.stopPropagation(); setSelected(file.id) }}
              onDblClick={() => {
                if (file.ext === 'txt' || file.ext === 'docx') setOpenWindow({ type:'text', file })
                else showToast(`Открываю ${file.name}...`)
              }}
              onDragStart={e => onDragStart(e, file.id)}
              onDragEnd={onDragEnd}
              onContextMenu={e => { e.preventDefault(); e.stopPropagation(); setCtxMenu({ x:e.clientX, y:e.clientY, target:file.id }) }}
            />
          ))}
        </div>

        {/* ── Character mascot (bottom-right) ── */}
        <img src={`${BASE}assets/character.png`} alt="helper"
          className="absolute bottom-2 right-4 z-10 pointer-events-none select-none"
          style={{ height:160, objectFit:'contain', filter:'drop-shadow(0 4px 12px rgba(0,0,0,0.2))' }} />

        {/* ── Open windows ── */}
        <AnimatePresence>
          {openWindow?.type === 'folder' && (
            <FileExplorer key="folder-win"
              folder={allFolders.find(f => f.id === openWindow.id)}
              files={files} allFolders={allFolders}
              onClose={() => setOpenWindow(null)} />
          )}
          {openWindow?.type === 'trash' && (
            <FileExplorer key="trash-win" isTrash files={trash}
              onClose={() => setOpenWindow(null)} onRestore={restoreFile} />
          )}
          {openWindow?.type === 'text' && (
            <TextEditorWindow key="text-win" file={openWindow.file}
              name={name} onClose={() => setOpenWindow(null)} />
          )}
        </AnimatePresence>

        {/* ── Context menu ── */}
        <Win10CtxMenu menu={ctxMenu}
          onCreateFolder={() => { setNewFolderModal(true); setNewFolderName('') }}
          onPaste={() => clipboard && showToast('Вставлено')}
          onRefresh={() => showToast('Обновлено')}
          onClose={() => setCtxMenu(null)}/>

        {/* ── Start menu ── */}
        <AnimatePresence>
          {startMenu && <Win10StartMenu key="start" onClose={() => setStartMenu(false)} />}
        </AnimatePresence>
      </div>

      {/* ── Task panel ── */}
      <div className="absolute right-3 top-16 z-20 w-60">
        <div className="rounded-xl overflow-hidden shadow-2xl"
          style={{ background:'rgba(15,10,30,0.82)', backdropFilter:'blur(12px)', border:'1px solid rgba(255,255,255,0.12)' }}>
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2"
            style={{ borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
            <span className="text-xs font-black text-white/50 uppercase tracking-widest">Задания</span>
            <span className="text-xs font-black text-[#A3E635]">{taskIdx}/{TASKS.length}</span>
          </div>

          {/* Current task */}
          <div className="px-3 py-3">
            {done ? (
              <div className="text-center py-2">
                <div className="text-3xl mb-1">🏆</div>
                <div className="font-black text-[#A3E635] text-sm">Все выполнены!</div>
                <div className="text-xs text-white/50 mt-0.5">Очки: {score}/130</div>
              </div>
            ) : (
              <>
                <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-2.5 mb-2">
                  <p className="text-xs font-bold text-white leading-snug">{currentTask?.text}</p>
                  <div className="text-[10px] text-purple-300 mt-1">+{currentTask?.points} очков</div>
                </div>
                {hintIdx > 0 && currentTask?.hints.slice(0, hintIdx).map((h, i) => (
                  <div key={i} className="text-[10px] text-yellow-300 bg-yellow-500/10 rounded-lg px-2 py-1.5 mb-1 leading-snug">
                    💡 {h}
                  </div>
                ))}
                {hintIdx < (currentTask?.hints.length || 0) && (
                  <button className="w-full text-[11px] border border-white/20 rounded-lg py-1.5 text-white/60 hover:text-white hover:border-white/40 transition-colors"
                    onClick={() => { setHintIdx(p => p+1); setTotalHints(p => p+1) }}>
                    💡 Подсказка ({hintIdx}/{currentTask?.hints.length})
                  </button>
                )}
              </>
            )}
          </div>

          {/* Progress dots */}
          <div className="flex gap-1 px-3 pb-2 flex-wrap">
            {TASKS.map((t, i) => (
              <div key={t.id} className={`h-1.5 rounded-full transition-all ${
                completedTasks.includes(t.id) ? 'bg-[#A3E635] w-4' :
                i === taskIdx ? 'bg-purple-400 w-4' : 'bg-white/20 w-2'}`}/>
            ))}
          </div>

          {/* Score */}
          <div className="px-3 pb-3 flex items-center justify-between">
            <span className="text-[11px] text-white/40 font-semibold">Очков:</span>
            <span className="text-base font-black text-[#A3E635]">{score}</span>
          </div>
        </div>

        {/* Finish button */}
        {(done || taskIdx >= 5) && (
          <button className="btn-green w-full mt-2 text-sm py-2"
            onClick={() => onFinish({ score, hints: totalHints })}>
            К тесту →
          </button>
        )}
      </div>

      {/* ── Taskbar ── */}
      <div className="absolute bottom-0 left-0 right-0 h-12 z-20 flex items-center"
        style={{ background:'rgba(0,0,0,0.88)', backdropFilter:'blur(20px)', borderTop:'1px solid rgba(255,255,255,0.08)' }}>
        {/* Start button */}
        <button className="w-12 h-12 flex items-center justify-center hover:bg-white/10 transition-colors"
          onClick={e => { e.stopPropagation(); setStartMenu(s => !s) }}>
          <WinLogo size={20}/>
        </button>
        {/* Search */}
        <div className="flex items-center gap-1.5 bg-white/10 rounded-sm h-8 px-3 mr-1 cursor-text"
          style={{ minWidth:200, border:'1px solid rgba(255,255,255,0.1)' }}>
          <span className="text-white/50 text-sm">🔍</span>
          <span className="text-white/50 text-xs">Поиск</span>
        </div>
        {/* Task view */}
        <button className="w-10 h-12 flex items-center justify-center hover:bg-white/10 transition-colors text-white/70 text-sm">
          ⊡
        </button>
        {/* Pinned apps */}
        <div className="flex items-center gap-0.5 ml-1">
          {[['📁','Проводник'],['🌐','Edge'],['🛒','Магазин'],['⚙️','Параметры']].map(([ic, label]) => (
            <button key={label} title={label}
              className="w-10 h-12 flex items-center justify-center hover:bg-white/10 transition-colors text-xl"
              onClick={e => { e.stopPropagation(); showToast(`Открываю ${label}...`) }}>
              {ic}
            </button>
          ))}
        </div>
        {/* citrend logo in taskbar */}
        <div className="ml-1 flex items-center gap-1.5 border-l border-white/10 pl-2">
          <img src={`${BASE}assets/logo.png`} alt="citrend" style={{ height:22, objectFit:'contain', opacity:0.7 }}/>
        </div>
        {/* Running app indicator */}
        {openWindow && (
          <button className="flex items-center gap-1.5 h-12 px-3 hover:bg-white/10 transition-colors border-b-2 border-[#8b5cf6]"
            onClick={e => { e.stopPropagation() }}>
            <span className="text-sm">{openWindow.type === 'trash' ? '🗑️' : '📁'}</span>
            <span className="text-xs text-white/80 font-semibold">
              {openWindow.type === 'trash' ? 'Корзина' : openWindow.type === 'text' ? openWindow.file?.name : allFolders.find(f=>f.id===openWindow.id)?.name}
            </span>
          </button>
        )}

        {/* System tray */}
        <div className="ml-auto flex items-center gap-1 pr-1">
          <div className="flex items-center gap-1 px-2 h-10 hover:bg-white/10 rounded cursor-pointer">
            <span className="text-white/70 text-sm">📶</span>
            <span className="text-white/70 text-sm">🔊</span>
          </div>
          <div className="flex flex-col items-end justify-center px-3 h-12 hover:bg-white/10 cursor-pointer min-w-[72px]">
            <span className="text-white text-xs font-semibold leading-none">{clock}</span>
            <span className="text-white/50 text-[10px] leading-none mt-0.5">
              {new Date().toLocaleDateString('ru', { day:'2-digit', month:'2-digit', year:'numeric' })}
            </span>
          </div>
          <button className="w-2 h-10 hover:bg-white/10 rounded"/>
        </div>
      </div>

      {/* ── New folder modal ── */}
      <AnimatePresence>
        {newFolderModal && (
          <motion.div key="modal" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background:'rgba(0,0,0,0.5)' }}>
            <motion.div initial={{scale:.9,opacity:0}} animate={{scale:1,opacity:1}}
              style={{ background:'white', borderRadius:4, padding:24, width:320,
                boxShadow:'0 16px 60px rgba(0,0,0,0.5)', fontFamily:'Segoe UI,sans-serif' }}
              onClick={e => e.stopPropagation()}>
              <h3 style={{ fontSize:15, fontWeight:600, marginBottom:12, color:'#1a1a1a' }}>Создать новую папку</h3>
              <input autoFocus value={newFolderName} onChange={e => setNewFolderName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && confirmFolder()}
                placeholder="Новая папка"
                style={{ width:'100%', border:'1px solid #c0c0c0', borderRadius:3, padding:'6px 10px',
                  fontSize:13, outline:'none', marginBottom:16 }}/>
              <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
                <button onClick={() => setNewFolderModal(false)}
                  style={{ padding:'6px 16px', border:'1px solid #c0c0c0', borderRadius:3, cursor:'pointer', background:'white', fontSize:13 }}>
                  Отмена
                </button>
                <button onClick={confirmFolder}
                  style={{ padding:'6px 16px', background:'#0078d4', color:'white', border:'none', borderRadius:3, cursor:'pointer', fontSize:13 }}>
                  Создать
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && <Toast key="toast" msg={toast.msg} type={toast.type}/>}
      </AnimatePresence>
    </div>
  )

  function confirmFolder() {
    const n = newFolderName.trim() || 'Новая папка'
    setCustomFolders(p => [...p, { id:`cf-${Date.now()}`, name:n }])
    setNewFolderModal(false)
    dispatch({ type:'create-folder', name: n })
    showToast(`Папка «${n}» создана`, 'success')
  }
}

/* ──────────────────────────────────────────
   Desktop icon component
────────────────────────────────────────── */
function DesktopIcon({ label, type, selected, draggable, isDragging, dropHighlight, badgeCount,
  onClick, onDblClick, onDragStart, onDragEnd, onDragOver, onDragLeave, onDrop, onContextMenu }) {
  return (
    <div draggable={!!draggable}
      onClick={onClick} onDoubleClick={onDblClick}
      onDragStart={onDragStart} onDragEnd={onDragEnd}
      onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
      onContextMenu={onContextMenu}
      className={`flex flex-col items-center gap-0.5 p-1.5 rounded cursor-pointer select-none
        transition-all w-20 ${isDragging ? 'opacity-40' : ''}`}
      style={{
        background: dropHighlight ? 'rgba(0,120,212,0.15)' : selected ? 'rgba(0,120,212,0.2)' : 'transparent',
        outline: dropHighlight ? '2px dashed #0078d4' : selected ? '2px solid rgba(0,120,212,0.5)' : 'none',
        borderRadius: 4,
      }}>
      <div className="relative">
        <FileIcon type={type} size={44}/>
        {badgeCount > 0 && (
          <div className="absolute -top-1 -right-1 bg-[#8b5cf6] text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center">
            {badgeCount}
          </div>
        )}
      </div>
      <span className="text-center leading-tight text-white font-semibold w-full"
        style={{ fontSize:11, textShadow:'0 1px 3px rgba(0,0,0,0.7)', wordBreak:'break-word' }}>
        {label}
      </span>
    </div>
  )
}

/* ──────────────────────────────────────────
   Text editor window
────────────────────────────────────────── */
function TextEditorWindow({ file, name, onClose }) {
  const [content, setContent] = useState(`${name}\n`)
  const [saved, setSaved]     = useState(false)

  useEffect(() => {
    const h = (e) => {
      if ((e.ctrlKey||e.metaKey) && e.key === 's') { e.preventDefault(); setSaved(true); setTimeout(()=>setSaved(false),2000) }
      if ((e.ctrlKey||e.metaKey) && e.key === 'a') { e.preventDefault(); e.target.select?.() }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])

  return (
    <Win10Window title={file.name} icon="📝" onClose={onClose} onMinimize={onClose} defaultX={200} defaultY={100} width={520} height={380}>
      <div style={{ height:'100%', display:'flex', flexDirection:'column' }}>
        {/* Notepad menu bar */}
        <div style={{ background:'#f9f9f9', borderBottom:'1px solid #e5e5e5', padding:'3px 8px', display:'flex', gap:12, fontSize:12 }}>
          {['Файл','Правка','Формат','Вид','Справка'].map(m => (
            <button key={m} style={{ background:'none', border:'none', cursor:'pointer', padding:'2px 4px', fontSize:12, color:'#1a1a1a' }}
              onMouseOver={e=>e.target.style.background='#e5e5e5'} onMouseOut={e=>e.target.style.background='none'}>
              {m}
            </button>
          ))}
        </div>
        <textarea value={content} onChange={e => setContent(e.target.value)}
          style={{ flex:1, padding:12, fontSize:14, lineHeight:'1.6', border:'none', outline:'none',
            fontFamily:'Consolas,monospace', resize:'none', background:'white', color:'#1a1a1a' }}
        />
        {saved && (
          <div style={{ background:'#107c10', color:'white', padding:'4px 12px', fontSize:12, textAlign:'center' }}>
            ✅ Файл сохранён (Ctrl+S)
          </div>
        )}
      </div>
    </Win10Window>
  )
}

/* ──────────────────────────────────────────
   Windows Start menu
────────────────────────────────────────── */
function Win10StartMenu({ onClose }) {
  const apps = [
    ['📁','Проводник'],['🌐','Edge'],['⚙️','Параметры'],['🎮','Игры'],
    ['📊','Excel'],['📝','Word'],['🎵','Медиаплеер'],['🔒','Безопасность'],
  ]
  return (
    <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:20}}
      onClick={e => e.stopPropagation()}
      style={{
        position:'fixed', bottom:50, left:0, width:380, zIndex:40,
        background:'rgba(32,32,32,0.96)', backdropFilter:'blur(20px)',
        boxShadow:'0 -4px 40px rgba(0,0,0,0.6)', borderRadius:'0 8px 0 0',
        fontFamily:'Segoe UI,sans-serif', overflow:'hidden',
      }}>
      {/* Search in start */}
      <div style={{ padding:'16px 16px 8px' }}>
        <div style={{ background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)',
          borderRadius:4, padding:'8px 12px', display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:16 }}>🔍</span>
          <span style={{ color:'rgba(255,255,255,0.5)', fontSize:13 }}>Поиск приложений, настроек и файлов</span>
        </div>
      </div>
      {/* Pinned apps */}
      <div style={{ padding:'8px 16px' }}>
        <div style={{ color:'rgba(255,255,255,0.5)', fontSize:12, marginBottom:8 }}>Закреплённые</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:4 }}>
          {apps.map(([ic, label]) => (
            <button key={label} onClick={() => { onClose() }}
              style={{ background:'none', border:'none', cursor:'pointer', padding:'10px 4px',
                display:'flex', flexDirection:'column', alignItems:'center', gap:4, borderRadius:4,
                color:'white' }}
              onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,0.1)'}
              onMouseOut={e=>e.currentTarget.style.background='none'}>
              <span style={{ fontSize:24 }}>{ic}</span>
              <span style={{ fontSize:11, textAlign:'center', lineHeight:1.2 }}>{label}</span>
            </button>
          ))}
        </div>
      </div>
      {/* User row */}
      <div style={{ borderTop:'1px solid rgba(255,255,255,0.1)', padding:'12px 16px',
        display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,#8b5cf6,#a78bfa)',
          display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>👤</div>
        <div>
          <div style={{ color:'white', fontSize:13, fontWeight:600 }}>Ученик</div>
          <div style={{ color:'rgba(255,255,255,0.4)', fontSize:11 }}>Локальная учётная запись</div>
        </div>
        <button onClick={onClose} style={{ marginLeft:'auto', background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.5)', fontSize:18 }}>⏻</button>
      </div>
    </motion.div>
  )
}

/* Windows logo SVG */
function WinLogo({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" fill="#ffffff"/>
    </svg>
  )
}
