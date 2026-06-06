import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const BASE = import.meta.env.BASE_URL
const SEG = 'Segoe UI,system-ui,sans-serif'

/* ══════════════════════════════════════════
   FILE SYSTEM STATE
══════════════════════════════════════════ */
const INIT_FS = {
  desktop: {
    'photo.png':     { type:'file', icon:'img',   size:'1.2 МБ', modified:'06.06.2026' },
    'music.mp3':     { type:'file', icon:'audio', size:'4.8 МБ', modified:'06.06.2026' },
    'homework.docx': { type:'file', icon:'word',  size:'24 КБ',  modified:'06.06.2026' },
    'old.txt':       { type:'file', icon:'txt',   size:'1 КБ',   modified:'06.06.2026' },
    'Документы':     { type:'folder', items:{} },
    'Фото':          { type:'folder', items:{} },
    'Музыка':        { type:'folder', items:{} },
  },
  documents:{}, downloads:{}, pictures:{}, music:{}, videos:{},
}

/* ══════════════════════════════════════════
   TASKS
══════════════════════════════════════════ */
const TASKS = [
  { id:'click-docs',    text:'Нажми на папку «Документы»',
    hints:['Папки — жёлтые иконки','Найди «Документы» на рабочем столе','Кликни на 📁 Документы'], points:10,
    check:(a) => a.type==='click-folder' && a.id==='docs' },
  { id:'open-photos',   text:'Открой папку «Фото» двойным кликом',
    hints:['Двойной клик = два быстрых нажатия','Найди папку «Фото»','Дважды кликни на 📁 Фото'], points:10,
    check:(a) => a.type==='open-folder' && a.id==='photos' },
  { id:'drag-photo',    text:'Перетащи «photo.png» в папку «Фото»',
    hints:['Удержи кнопку мыши и потяни файл к папке','photo.png — иконка с горой','Потяни photo.png на папку Фото'], points:15,
    check:(a) => a.type==='drop-folder' && a.fileId==='photo' && a.folderId==='photos' },
  { id:'drag-music',    text:'Перетащи «music.mp3» в папку «Музыка»',
    hints:['Нажми, удержи, потяни, отпусти','music.mp3 — иконка с нотой','Потяни music.mp3 на папку Музыка'], points:15,
    check:(a) => a.type==='drop-folder' && a.fileId==='music' && a.folderId==='music-f' },
  { id:'drag-homework', text:'Перетащи «homework.docx» в «Документы»',
    hints:['.docx — это документ Word','homework.docx — синяя иконка W','Потяни homework.docx на Документы'], points:15,
    check:(a) => a.type==='drop-folder' && a.fileId==='homework' && a.folderId==='docs' },
  { id:'drag-trash',    text:'Перетащи «old.txt» в Корзину',
    hints:['Корзина — на рабочем столе','Найди old.txt','Потяни old.txt на Корзину'], points:15,
    check:(a) => a.type==='drop-trash' && a.fileId==='old' },
  { id:'restore',       text:'Открой Корзину и восстанови «old.txt»',
    hints:['Двойной клик по Корзине','Найди old.txt внутри','Нажми «Восстановить»'], points:15,
    check:(a) => a.type==='restore' && a.fileId==='old' },
  { id:'create-folder', text:'Правый клик по рабочему столу → Создать папку',
    hints:['Нажми ПРАВУЮ кнопку мыши по пустому месту стола','В меню выбери «Создать» → «Папку»','Правый клик → Создать → Папку'], points:15,
    check:(a) => a.type==='create-folder' },
  { id:'ctrl-c',        text:'Выдели «homework.docx» и нажми Ctrl+C',
    hints:['Сначала кликни на homework.docx','Потом удержи Ctrl и нажми C','Клик на файл → Ctrl+C'], points:10,
    check:(a) => a.type==='copy' && a.fileId==='homework' },
  { id:'ctrl-s',        text:'Нажми Ctrl+S чтобы сохранить',
    hints:['Ctrl+S = сохранить','Удержи Ctrl, нажми S','Используй клавиши Ctrl+S'], points:10,
    check:(a) => a.type==='save' },
]

/* ══════════════════════════════════════════
   FILE ICON
══════════════════════════════════════════ */
function FileIcon({ type, size = 40 }) {
  const s = size
  if (type === 'folder') return (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <path d="M4 38 V17 C4 15.9 4.9 15 6 15 H20 L24 19 H42 C43.1 19 44 19.9 44 21 V38 C44 39.1 43.1 40 42 40 H6 C4.9 40 4 39.1 4 38Z" fill="#C87D0E"/>
      <path d="M4 15 H20 L24 19 H4Z" fill="#BA720C"/>
      <rect x="4" y="21" width="40" height="19" rx="1.5" fill="#FFD166"/>
      <rect x="4" y="21" width="40" height="6" rx="1.5" fill="#FFE08A" opacity="0.7"/>
      <rect x="4" y="35" width="40" height="5" rx="1.5" fill="#E8B83A"/>
    </svg>
  )
  if (type === 'pc') return (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <rect x="3" y="5" width="42" height="30" rx="3" fill="#5D5D5D"/>
      <rect x="4" y="6" width="40" height="28" rx="2.5" fill="#747474"/>
      <rect x="7" y="8" width="34" height="22" rx="1.5" fill="#1B1B2E"/>
      <rect x="7" y="8" width="34" height="22" rx="1.5" fill="#3A7BD5" opacity="0.3"/>
      <g transform="translate(15.5, 13)">
        <rect x="0" y="0" width="7" height="7" rx="1" fill="#00A4EF"/>
        <rect x="9" y="0" width="7" height="7" rx="1" fill="#7FBA00"/>
        <rect x="0" y="9" width="7" height="7" rx="1" fill="#F25022"/>
        <rect x="9" y="9" width="7" height="7" rx="1" fill="#FFB900"/>
      </g>
      <rect x="20" y="35" width="8" height="5" fill="#5D5D5D"/>
      <rect x="13" y="40" width="22" height="3.5" rx="1.8" fill="#4A4A4A"/>
      <rect x="7" y="8" width="34" height="3" rx="1.5" fill="white" opacity="0.08"/>
    </svg>
  )
  if (type === 'trash-empty') return (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="binGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#A8D8F0"/><stop offset="100%" stopColor="#6BAED6"/>
        </linearGradient>
        <linearGradient id="binBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#C5E5F5"/><stop offset="100%" stopColor="#82BFE8"/>
        </linearGradient>
      </defs>
      <path d="M18 12 V9.5 C18 8.7 18.7 8 19.5 8 H28.5 C29.3 8 30 8.7 30 9.5 V12" fill="none" stroke="#6BAED6" strokeWidth="2.5" strokeLinecap="round"/>
      <rect x="9" y="12" width="30" height="4" rx="2" fill="url(#binGrad)"/>
      <path d="M11.5 16 L13.2 41 C13.2 41.6 13.7 42 14.3 42 H33.7 C34.3 42 34.8 41.6 34.8 41 L36.5 16 Z" fill="url(#binBodyGrad)"/>
      <path d="M11.5 16 L13.2 41 C13.2 41.6 13.7 42 14.3 42 H16 L14.3 16Z" fill="#6BAED6" opacity="0.5"/>
      <path d="M36.5 16 L34.8 41 C34.8 41.6 34.3 42 33.7 42 H32 L33.7 16Z" fill="#6BAED6" opacity="0.5"/>
      <line x1="20" y1="19" x2="19.3" y2="40" stroke="#5A9CC5" strokeWidth="1.2" opacity="0.7"/>
      <line x1="24" y1="19" x2="24"   y2="40" stroke="#5A9CC5" strokeWidth="1.2" opacity="0.7"/>
      <line x1="28" y1="19" x2="28.7" y2="40" stroke="#5A9CC5" strokeWidth="1.2" opacity="0.7"/>
      <path d="M19.5 30 C19.5 26.5 22 24 25 24.5 C27 24.8 28.5 26 29 28" fill="none" stroke="#2A7CB8" strokeWidth="1.8" strokeLinecap="round"/>
      <polygon points="30,25 33,29.5 27,29.5" fill="#2A7CB8"/>
      <path d="M28.5 32 C28.5 35 26 37.5 23 37 C21 36.7 19.5 35.5 19 33.5" fill="none" stroke="#2A7CB8" strokeWidth="1.8" strokeLinecap="round"/>
      <polygon points="18,36 15,31.5 21,31.5" fill="#2A7CB8"/>
    </svg>
  )
  if (type === 'trash-full') return (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id="binGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#A8D8F0"/><stop offset="100%" stopColor="#6BAED6"/>
        </linearGradient>
        <linearGradient id="binBodyGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#C5E5F5"/><stop offset="100%" stopColor="#82BFE8"/>
        </linearGradient>
      </defs>
      <rect x="15" y="9" width="7" height="13" rx="1.2" fill="white" stroke="#D0D0D0" strokeWidth="0.8" transform="rotate(-12 18.5 15)"/>
      <rect x="21" y="8" width="7" height="13" rx="1.2" fill="white" stroke="#D0D0D0" strokeWidth="0.8"/>
      <rect x="25" y="10" width="7" height="12" rx="1.2" fill="white" stroke="#D0D0D0" strokeWidth="0.8" transform="rotate(10 28.5 16)"/>
      <line x1="17" y1="12" x2="22" y2="11.5" stroke="#A0A0A0" strokeWidth="0.8" transform="rotate(-12 18.5 15)"/>
      <line x1="23" y1="12" x2="27" y2="12" stroke="#A0A0A0" strokeWidth="0.8"/>
      <g transform="rotate(-18 24 15)">
        <path d="M17 13 V10.5 C17 9.7 17.7 9 18.5 9 H29.5 C30.3 9 31 9.7 31 10.5 V13" fill="none" stroke="#6BAED6" strokeWidth="2.2" strokeLinecap="round"/>
        <rect x="9" y="13" width="30" height="4" rx="2" fill="url(#binGrad2)"/>
      </g>
      <path d="M11.5 18 L13.2 41 C13.2 41.6 13.7 42 14.3 42 H33.7 C34.3 42 34.8 41.6 34.8 41 L36.5 18 Z" fill="url(#binBodyGrad2)"/>
      <path d="M11.5 18 L13.2 41 C13.2 41.6 13.7 42 14.3 42 H16 L14.3 18Z" fill="#6BAED6" opacity="0.5"/>
      <path d="M36.5 18 L34.8 41 C34.8 41.6 34.3 42 33.7 42 H32 L33.7 18Z" fill="#6BAED6" opacity="0.5"/>
      <line x1="20" y1="21" x2="19.3" y2="40" stroke="#5A9CC5" strokeWidth="1.2" opacity="0.7"/>
      <line x1="24" y1="21" x2="24"   y2="40" stroke="#5A9CC5" strokeWidth="1.2" opacity="0.7"/>
      <line x1="28" y1="21" x2="28.7" y2="40" stroke="#5A9CC5" strokeWidth="1.2" opacity="0.7"/>
    </svg>
  )
  if (type === 'img')   return <img src={`${BASE}assets/icon-photos.png`}  width={s} height={s} style={{objectFit:'contain'}} alt="photo"/>
  if (type === 'audio') return <img src={`${BASE}assets/icon-music.png`}   width={s} height={s} style={{objectFit:'contain'}} alt="music"/>
  if (type === 'word')  return <img src={`${BASE}assets/icon-word.png`}    width={s} height={s} style={{objectFit:'contain'}} alt="word"/>
  if (type === 'txt')   return <img src={`${BASE}assets/icon-notepad.png`} width={s} height={s} style={{objectFit:'contain'}} alt="notepad"/>
  return <span style={{fontSize:s*0.7}}>📄</span>
}

/* ══════════════════════════════════════════
   WALLPAPER
══════════════════════════════════════════ */
const WALLPAPERS = {
  purple: null, // SVG below
  green:  'radial-gradient(ellipse at 50% 80%, #1a6b3c 0%, #0a3d1f 100%)',
  darkblue: 'linear-gradient(160deg, #0a0a2e 0%, #1a1a4a 100%)',
  solid: '#3a1060',
}

function Win10Wallpaper({ which }) {
  if (which && which !== 'purple') {
    return <div className="absolute inset-0" style={{background: WALLPAPERS[which]}}/>
  }
  return (
    <div className="absolute inset-0 overflow-hidden" style={{background:'#e8e4f3'}}>
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
        <path d="M 1440 0 C 1100 0, 820 180, 920 420 C 1020 660, 740 780, 980 900 L 1440 900 Z" fill="url(#wg1)"/>
        <path d="M 1440 120 C 1160 80, 900 280, 1000 500 C 1100 720, 860 840, 1100 900 L 1440 900 Z" fill="url(#wg2)"/>
        <path d="M 1440 250 C 1200 220, 1050 380, 1120 580 C 1190 780, 1000 880, 1200 900 L 1440 900 Z" fill="white" opacity="0.12"/>
      </svg>
      <div className="absolute inset-0" style={{backgroundImage:'radial-gradient(circle, rgba(123,107,228,0.07) 1px, transparent 1px)',backgroundSize:'32px 32px'}}/>
    </div>
  )
}

/* ══════════════════════════════════════════
   SHELL ICONS (SVG) for context menu
══════════════════════════════════════════ */
const ShellIcon = ({ name }) => {
  const icons = {
    view: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="0.5" fill="#555"/><rect x="9" y="1" width="6" height="6" rx="0.5" fill="#555"/><rect x="1" y="9" width="6" height="6" rx="0.5" fill="#555"/><rect x="9" y="9" width="6" height="6" rx="0.5" fill="#555"/></svg>,
    sort: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><line x1="1" y1="4" x2="11" y2="4" stroke="#555" strokeWidth="1.5"/><line x1="1" y1="8" x2="8" y2="8" stroke="#555" strokeWidth="1.5"/><line x1="1" y1="12" x2="5" y2="12" stroke="#555" strokeWidth="1.5"/><path d="M13 2 L13 13 M10.5 10.5 L13 13 L15.5 10.5" stroke="#555" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>,
    refresh: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2.5 8 A5.5 5.5 0 1 1 8 13.5" stroke="#555" strokeWidth="1.5" strokeLinecap="round" fill="none"/><path d="M2.5 5 L2.5 8 L5.5 8" stroke="#555" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>,
    paste: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="4" y="5" width="9" height="10" rx="1" stroke="#555" strokeWidth="1.2" fill="none"/><path d="M6 5 V4 Q6 2 8 2 Q10 2 10 4 V5" stroke="#555" strokeWidth="1.2" fill="none"/><line x1="6" y1="8" x2="11" y2="8" stroke="#555" strokeWidth="1"/><line x1="6" y1="10" x2="11" y2="10" stroke="#555" strokeWidth="1"/><line x1="6" y1="12" x2="9" y2="12" stroke="#555" strokeWidth="1"/></svg>,
    shortcut: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="4" width="10" height="10" rx="1" stroke="#555" strokeWidth="1.2" fill="none"/><path d="M7 1 L15 1 L15 9 M15 1 L9 7" stroke="#555" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>,
    undo: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1.5 6.5 A6 5.5 0 0 1 13.5 8.5" stroke="#555" strokeWidth="1.5" strokeLinecap="round" fill="none"/><path d="M1.5 3 L1.5 6.5 L5 6.5" stroke="#555" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>,
    newitem: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="5" width="13" height="10" rx="1" fill="#FFD166"/><path d="M1 5 H7 L9 7.5 H14 C14.6 7.5 15 7.9 15 8.5 V14.2 C15 14.7 14.6 15 14 15 H1" fill="#FFD166"/><rect x="1" y="7.5" width="14" height="7.5" rx="1" fill="#FFE08A"/><line x1="7" y1="11" x2="7" y2="15" stroke="#C87D0E" strokeWidth="1.2"/><line x1="5" y1="13" x2="9" y2="13" stroke="#C87D0E" strokeWidth="1.2"/></svg>,
    display: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="2" width="14" height="9" rx="1" stroke="#0078D4" strokeWidth="1.3" fill="none"/><rect x="2" y="3" width="12" height="7" rx="0.5" fill="#50B4D8" opacity="0.4"/><line x1="5.5" y1="11" x2="5.5" y2="13" stroke="#0078D4" strokeWidth="1.3"/><line x1="10.5" y1="11" x2="10.5" y2="13" stroke="#0078D4" strokeWidth="1.3"/><line x1="4" y1="13" x2="12" y2="13" stroke="#0078D4" strokeWidth="1.3"/></svg>,
    personalize: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M11 1 L15 5 L6 14 C4.5 14 2 12.5 2 11 Z" stroke="#0078D4" strokeWidth="1.2" fill="#D0E8FF"/><line x1="9" y1="3" x2="13" y2="7" stroke="#0078D4" strokeWidth="1"/><circle cx="3.5" cy="12.5" r="1.5" fill="#0078D4"/></svg>,
    open: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 4 H6 L8 6 H14 C14.6 6 15 6.4 15 7 V13 C15 13.6 14.6 14 14 14 H2 C1.4 14 1 13.6 1 13 V5 C1 4.4 1.4 4 2 4Z" fill="#FFD166" stroke="#C87D0E" strokeWidth="0.8"/></svg>,
    copy: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="4" y="4" width="10" height="10" rx="1" stroke="#555" strokeWidth="1.2" fill="white"/><rect x="2" y="2" width="10" height="10" rx="1" stroke="#555" strokeWidth="1.2" fill="white"/></svg>,
    cut: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="4" cy="12" r="2.5" stroke="#555" strokeWidth="1.2" fill="none"/><circle cx="12" cy="12" r="2.5" stroke="#555" strokeWidth="1.2" fill="none"/><line x1="8" y1="6" x2="4" y2="12" stroke="#555" strokeWidth="1.2"/><line x1="8" y1="6" x2="12" y2="12" stroke="#555" strokeWidth="1.2"/><line x1="6" y1="2" x2="10" y2="6" stroke="#555" strokeWidth="1.2"/></svg>,
    delete: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="4" y="5" width="8" height="10" rx="1" stroke="#555" strokeWidth="1.2" fill="none"/><line x1="2" y1="5" x2="14" y2="5" stroke="#555" strokeWidth="1.2"/><path d="M6 3 H10 C10 2.4 9.6 2 9 2 H7 C6.4 2 6 2.4 6 3Z" fill="#555"/><line x1="7" y1="8" x2="7" y2="12" stroke="#555" strokeWidth="1"/><line x1="9" y1="8" x2="9" y2="12" stroke="#555" strokeWidth="1"/></svg>,
    rename: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 12 L12 2 L14 4 L4 14Z" stroke="#555" strokeWidth="1.2" fill="none"/><line x1="1" y1="14" x2="5" y2="14" stroke="#555" strokeWidth="1.2"/></svg>,
    props: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="2" stroke="#555" strokeWidth="1.2" fill="none"/><line x1="5" y1="6" x2="11" y2="6" stroke="#555" strokeWidth="1.2"/><line x1="5" y1="9" x2="11" y2="9" stroke="#555" strokeWidth="1.2"/><circle cx="5" cy="6" r="0.8" fill="#555"/><circle cx="5" cy="9" r="0.8" fill="#555"/></svg>,
    folder_new: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1 4 H5.5 L7 6 H14 C14.6 6 15 6.4 15 7 V13 C15 13.6 14.6 14 14 14 H2 C1.4 14 1 13.6 1 13 V4Z" fill="#FFD166"/><rect x="1" y="6.5" width="14" height="7.5" rx="1" fill="#FFE08A"/></svg>,
    bitmap: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="2" width="14" height="12" rx="1" fill="#E8E8E8" stroke="#999" strokeWidth="1"/><path d="M1 9 L5 6 L9 9 L12 7 L15 9" stroke="#4A90D9" strokeWidth="1" fill="none"/><circle cx="12" cy="5" r="2" fill="#FFD700"/></svg>,
    word_s: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="14" height="14" rx="2" fill="#2B579A"/><text x="3" y="13" fontSize="11" fontWeight="bold" fill="white" fontFamily="Arial">W</text></svg>,
    txt_s: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="1" width="10" height="13" rx="1" fill="white" stroke="#999" strokeWidth="1"/><path d="M12 1 L12 5 L15 5" stroke="#999" strokeWidth="1" fill="none"/><path d="M12 1 L15 5 L15 14 H2" stroke="#999" strokeWidth="1" fill="none"/></svg>,
  }
  return icons[name] || null
}

/* ══════════════════════════════════════════
   CONTEXT MENU
══════════════════════════════════════════ */
function Win10CtxMenu({ menu, onCreateFolder, onPaste, onRefresh, onDeleteFile, onClose }) {
  const [showNewSub, setShowNewSub] = useState(false)
  if (!menu) return null

  const menuStyle = {
    background:'#f2f2f2', border:'1px solid #999',
    borderRadius:0, padding:'2px 0', minWidth:204,
    boxShadow:'4px 4px 8px rgba(0,0,0,0.28)',
    fontFamily:SEG, fontSize:12, color:'#000', userSelect:'none',
  }
  const Divider = () => <div style={{height:1,background:'#c8c8c8',margin:'2px 0'}}/>
  const Item = ({ iconName, label, shortcut, onClick, sub, onHover, onLeave, disabled }) => {
    const [hov, setHov] = useState(false)
    return (
      <button disabled={disabled}
        onMouseEnter={() => { setHov(true); onHover?.() }}
        onMouseLeave={() => { setHov(false); onLeave?.() }}
        onClick={() => { if (!disabled) { onClick?.(); if (!sub) onClose() } }}
        style={{
          display:'flex', alignItems:'center', width:'100%', padding:'3px 6px 3px 4px',
          background: hov && !disabled ? '#316AC5' : 'transparent',
          color: hov && !disabled ? 'white' : disabled ? '#888' : '#000',
          border:'none', cursor: disabled ? 'default' : 'pointer',
          fontFamily:SEG, fontSize:12, gap:0, textAlign:'left',
        }}>
        <span style={{width:20,height:20,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginRight:2}}>
          {iconName && <ShellIcon name={iconName}/>}
        </span>
        <span style={{flex:1,padding:'0 2px'}}>{label}</span>
        {shortcut && <span style={{color:hov?'rgba(255,255,255,0.75)':'#666',marginLeft:20,fontSize:12}}>{shortcut}</span>}
        {sub && <span style={{marginLeft:4,fontSize:12}}>►</span>}
      </button>
    )
  }

  const vw = window.innerWidth, vh = window.innerHeight
  const mx = Math.min(menu.x, vw - 220)
  const my = Math.min(menu.y, vh - 280)

  const isDesktop = menu.target === 'desktop'

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} onContextMenu={e=>{e.preventDefault();onClose()}}/>
      <div style={{position:'fixed',left:mx,top:my,zIndex:50,...menuStyle}}>
        {isDesktop ? (
          <>
            <Item iconName="view"        label="View"           sub />
            <Item iconName="sort"        label="Sort by"        sub />
            <Item iconName="refresh"     label="Refresh"        onClick={onRefresh}/>
            <Divider/>
            <Item iconName="paste"       label="Paste"          onClick={onPaste}/>
            <Item iconName="shortcut"    label="Paste shortcut"/>
            <Item iconName="undo"        label="Undo Delete"    shortcut="Ctrl+Z"/>
            <Divider/>
            <Item iconName="newitem"     label="New"            sub
              onHover={() => setShowNewSub(true)}
              onLeave={() => setTimeout(() => setShowNewSub(false), 300)}
              onClick={() => setShowNewSub(s => !s)}/>
            {showNewSub && (
              <div style={{position:'absolute',left:204,top:112,zIndex:51,...menuStyle}}
                onMouseEnter={() => setShowNewSub(true)}
                onMouseLeave={() => setTimeout(() => setShowNewSub(false), 200)}>
                <Item iconName="folder_new" label="Folder" onClick={() => { onCreateFolder(); setShowNewSub(false) }}/>
                <Item iconName="shortcut"   label="Shortcut"/>
                <Divider/>
                <Item iconName="bitmap"  label="Bitmap image"/>
                <Item iconName="word_s"  label="Microsoft Word Document"/>
                <Item iconName="txt_s"   label="Text Document"/>
              </div>
            )}
            <Divider/>
            <Item iconName="display"     label="Display settings"/>
            <Item iconName="personalize" label="Personalize"/>
          </>
        ) : (
          <>
            <Item iconName="open"   label="Открыть"/>
            <Divider/>
            <Item iconName="copy"   label="Копировать"   shortcut="Ctrl+C"/>
            <Item iconName="cut"    label="Вырезать"     shortcut="Ctrl+X"/>
            <Item iconName="paste"  label="Вставить"     shortcut="Ctrl+V" onClick={onPaste}/>
            <Divider/>
            <Item iconName="delete" label="Удалить"      shortcut="Del" onClick={onDeleteFile}/>
            <Item iconName="rename" label="Переименовать"/>
            <Divider/>
            <Item iconName="props"  label="Свойства"/>
          </>
        )}
      </div>
    </>
  )
}

/* ══════════════════════════════════════════
   WINDOW MANAGER — DraggableWindow
══════════════════════════════════════════ */
function DraggableWindow({ win, onClose, onMinimize, onMaximize, onFocus, onMove, children }) {
  const dragRef = useRef(null)

  const onMouseDown = (e) => {
    if (e.target.closest('button')) return
    onFocus(win.id)
    const startX = e.clientX - win.x
    const startY = e.clientY - win.y
    dragRef.current = { startX, startY }

    const move = (me) => {
      if (!dragRef.current) return
      const nx = me.clientX - dragRef.current.startX
      const ny = Math.max(0, me.clientY - dragRef.current.startY)
      onMove(win.id, nx, ny)
    }
    const up = () => { dragRef.current = null; window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up) }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
  }

  if (win.minimized) return null

  const vw = window.innerWidth
  const vh = window.innerHeight
  const style = win.maximized
    ? { position:'fixed', left:0, top:0, width:'100vw', height:'calc(100vh - 48px)', zIndex:win.z }
    : { position:'fixed', left:win.x, top:win.y, width:win.w, height:win.h, zIndex:win.z }

  return (
    <motion.div initial={{scale:0.95,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:0.95,opacity:0}}
      style={{...style, boxShadow:'0 8px 40px rgba(0,0,0,0.4)', borderRadius:2, overflow:'hidden', border:'1px solid #c0c0c0'}}
      onMouseDown={() => onFocus(win.id)}>
      {/* Accent line */}
      <div style={{height:3,background:'linear-gradient(90deg,#7b6be4,#a78bfa)'}}/>
      {/* Titlebar */}
      <div onMouseDown={onMouseDown} style={{
        background:'#f3f3f3', height:32, display:'flex', alignItems:'center',
        padding:'0 8px', cursor:'grab', userSelect:'none',
        borderBottom:'1px solid #e0e0e0', fontFamily:SEG, fontSize:13,
      }}>
        <span style={{marginRight:6,fontSize:15}}>{win.icon}</span>
        <span style={{flex:1,color:'#1a1a1a',fontWeight:400,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{win.title}</span>
        <WinTitleBtn label="—" onClick={() => onMinimize(win.id)} hoverBg="#e5e5e5"/>
        <WinTitleBtn label="□" onClick={() => onMaximize(win.id)} hoverBg="#e5e5e5"/>
        <WinTitleBtn label="✕" onClick={() => onClose(win.id)} hoverBg="#c42b1c" hoverColor="white"/>
      </div>
      {/* Content */}
      <div style={{height: win.maximized ? 'calc(100vh - 48px - 35px)' : win.h - 35, background:'white', overflow:'auto', fontFamily:SEG}}>
        {children}
      </div>
    </motion.div>
  )
}

function WinTitleBtn({ label, onClick, hoverBg, hoverColor }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{width:46,height:32,border:'none',cursor:'pointer',fontSize:label==='□'?13:16,color:hov&&hoverColor?hoverColor:'#555',background:hov?hoverBg:'transparent'}}>
      {label}
    </button>
  )
}

/* ══════════════════════════════════════════
   APP: NOTEPAD
══════════════════════════════════════════ */
function NotepadApp({ win, onSave }) {
  const [content, setContent] = useState(win.appState?.content || '')
  const [saved, setSaved] = useState(false)
  const [line, setLine] = useState(1)
  const [col, setCol] = useState(1)
  const taRef = useRef(null)

  useEffect(() => {
    const h = (e) => {
      if (!(e.ctrlKey||e.metaKey)) return
      if (e.key === 's') { e.preventDefault(); setSaved(true); onSave?.(); setTimeout(()=>setSaved(false),2000) }
      if (e.key === 'a') { e.preventDefault(); taRef.current?.select() }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])

  const onCursorMove = (e) => {
    const ta = e.target
    const txt = ta.value.substring(0, ta.selectionStart)
    const lines = txt.split('\n')
    setLine(lines.length)
    setCol(lines[lines.length-1].length + 1)
  }

  return (
    <div style={{height:'100%',display:'flex',flexDirection:'column'}}>
      <div style={{background:'#f9f9f9',borderBottom:'1px solid #e5e5e5',padding:'3px 8px',display:'flex',gap:4,fontSize:12}}>
        {['Файл','Правка','Формат','Вид'].map(m => (
          <button key={m} style={{background:'none',border:'none',cursor:'pointer',padding:'2px 6px',fontSize:12,color:'#1a1a1a',borderRadius:2}}
            onMouseOver={e=>e.target.style.background='#e0e0e0'} onMouseOut={e=>e.target.style.background='none'}>{m}</button>
        ))}
      </div>
      <textarea ref={taRef} value={content} onChange={e=>setContent(e.target.value)}
        onClick={onCursorMove} onKeyUp={onCursorMove}
        style={{flex:1,padding:10,fontSize:14,lineHeight:'1.6',border:'none',outline:'none',
          fontFamily:'Consolas,Courier New,monospace',resize:'none',background:'white',color:'#1a1a1a'}}/>
      {saved && (
        <div style={{background:'#107c10',color:'white',padding:'3px 12px',fontSize:12,textAlign:'center'}}>
          Файл сохранён (Ctrl+S)
        </div>
      )}
      <div style={{background:'#f0f0f0',borderTop:'1px solid #ddd',padding:'2px 12px',fontSize:11,color:'#555',display:'flex',gap:16}}>
        <span>Строка {line}, столбец {col}</span>
        <span>100%</span>
        <span>Windows (CRLF)</span>
        <span>UTF-8</span>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════
   APP: FILE EXPLORER
══════════════════════════════════════════ */
function ExplorerApp({ files, trash, allFolders, customFolders, onNavigate, startPath, onFileAction }) {
  const [path, setPath] = useState(startPath || 'desktop')
  const [history, setHistory] = useState([startPath || 'desktop'])
  const [histIdx, setHistIdx] = useState(0)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [ctxFile, setCtxFile] = useState(null)

  const navigate = (p) => {
    const newHistory = [...history.slice(0, histIdx+1), p]
    setHistory(newHistory)
    setHistIdx(newHistory.length - 1)
    setPath(p)
    setSelected(null)
  }
  const goBack    = () => { if (histIdx > 0) { setHistIdx(histIdx-1); setPath(history[histIdx-1]) } }
  const goForward = () => { if (histIdx < history.length-1) { setHistIdx(histIdx+1); setPath(history[histIdx+1]) } }

  const pathLabel = {
    desktop:'Рабочий стол', documents:'Документы', downloads:'Загрузки',
    pictures:'Изображения', music:'Музыка', videos:'Видео', thispc:'Этот компьютер',
    trash:'Корзина',
  }

  const LOCATIONS = [
    { id:'thispc',    label:'Этот компьютер',  icon:'💻' },
    { id:'desktop',   label:'Рабочий стол',    icon:'🖥️' },
    { id:'documents', label:'Документы',       icon:'📄' },
    { id:'downloads', label:'Загрузки',        icon:'⬇️' },
    { id:'pictures',  label:'Изображения',     icon:'🖼️' },
    { id:'music',     label:'Музыка',          icon:'🎵' },
    { id:'videos',    label:'Видео',           icon:'📹' },
    { id:'trash',     label:'Корзина',         icon:'🗑️' },
  ]

  const getItems = () => {
    if (path === 'thispc') return []
    if (path === 'trash')  return trash
    return files.filter(f => f.loc === path)
  }
  const items = getItems().filter(f => !search || f.name.toLowerCase().includes(search.toLowerCase()))

  const THISPC_FOLDERS = [
    { id:'desktop',   label:'Рабочий стол',  icon:'🖥️', size:'— КБ' },
    { id:'documents', label:'Документы',     icon:'📄', size:'— КБ' },
    { id:'downloads', label:'Загрузки',      icon:'⬇️', size:'— КБ' },
    { id:'pictures',  label:'Изображения',   icon:'🖼️', size:'— КБ' },
    { id:'music',     label:'Музыка',        icon:'🎵', size:'— КБ' },
    { id:'videos',    label:'Видео',         icon:'📹', size:'— КБ' },
  ]

  return (
    <div style={{height:'100%',display:'flex',flexDirection:'column'}}>
      {/* Toolbar */}
      <div style={{background:'#f9f9f9',borderBottom:'1px solid #e5e5e5',padding:'5px 8px',display:'flex',alignItems:'center',gap:6}}>
        {[['←',goBack,histIdx<=0],['→',goForward,histIdx>=history.length-1],['↑',()=>navigate('thispc'),false]].map(([lbl,fn,dis]) => (
          <button key={lbl} onClick={fn} disabled={dis}
            style={{width:28,height:26,border:'1px solid #ddd',borderRadius:3,background:'white',cursor:dis?'default':'pointer',fontSize:12,opacity:dis?0.4:1}}>
            {lbl}
          </button>
        ))}
        <div style={{flex:1,background:'white',border:'1px solid #c0c0c0',borderRadius:2,padding:'3px 8px',fontSize:12,color:'#444'}}>
          Этот компьютер {path !== 'thispc' ? '› ' + (pathLabel[path] || path) : ''}
        </div>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={`Поиск в ${pathLabel[path]||path}`}
          style={{background:'white',border:'1px solid #c0c0c0',borderRadius:2,padding:'3px 8px',fontSize:12,width:150,outline:'none'}}/>
      </div>
      <div style={{display:'flex',flex:1,overflow:'hidden'}}>
        {/* Sidebar */}
        <div style={{width:164,background:'#f5f5f5',borderRight:'1px solid #e0e0e0',padding:'8px 0',overflow:'auto',flexShrink:0}}>
          <div style={{padding:'4px 12px',fontSize:11,color:'#888',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:2}}>Быстрый доступ</div>
          {LOCATIONS.map(loc => (
            <button key={loc.id} onClick={()=>navigate(loc.id)}
              style={{display:'flex',alignItems:'center',gap:6,width:'100%',padding:'5px 12px',fontSize:12,color:'#222',
                border:'none',background:path===loc.id?'#d0e8ff':'transparent',cursor:'pointer',textAlign:'left',borderRadius:0}}
              onMouseOver={e=>e.currentTarget.style.background=path===loc.id?'#d0e8ff':'#e8e8e8'}
              onMouseOut={e=>e.currentTarget.style.background=path===loc.id?'#d0e8ff':'transparent'}>
              <span style={{fontSize:14}}>{loc.icon}</span>{loc.label}
            </button>
          ))}
        </div>
        {/* Content */}
        <div style={{flex:1,padding:12,overflow:'auto'}}>
          {path === 'thispc' ? (
            <div>
              <div style={{fontSize:12,color:'#888',marginBottom:8,fontWeight:600}}>Папки (6)</div>
              <div style={{display:'flex',flexWrap:'wrap',gap:12}}>
                {THISPC_FOLDERS.map(f => (
                  <div key={f.id} onDoubleClick={()=>navigate(f.id)}
                    style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4,width:80,cursor:'pointer',padding:8,borderRadius:4}}
                    onMouseOver={e=>e.currentTarget.style.background='#e8f0fe'}
                    onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                    <span style={{fontSize:36}}>{f.icon}</span>
                    <span style={{fontSize:11,textAlign:'center',color:'#1a1a1a'}}>{f.label}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : path === 'trash' ? (
            <div>
              {trash.length === 0
                ? <div style={{color:'#999',fontSize:13,textAlign:'center',marginTop:40}}>Корзина пуста</div>
                : <div style={{display:'flex',flexWrap:'wrap',gap:12}}>
                  {trash.map(f => (
                    <div key={f.id} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4,width:80,padding:8,borderRadius:4}}>
                      <FileIcon type={f.icon} size={40}/>
                      <span style={{fontSize:11,textAlign:'center',wordBreak:'break-all',color:'#1a1a1a'}}>{f.name}</span>
                      <button onClick={()=>onFileAction?.('restore',f.id)}
                        style={{fontSize:10,background:'#0078d4',color:'white',border:'none',borderRadius:3,padding:'2px 6px',cursor:'pointer'}}>
                        Восстановить
                      </button>
                    </div>
                  ))}
                </div>
              }
            </div>
          ) : items.length === 0 ? (
            <div style={{color:'#999',fontSize:13,textAlign:'center',marginTop:40}}>Папка пуста</div>
          ) : (
            <div style={{display:'flex',flexWrap:'wrap',gap:12}}>
              {items.map(f => (
                <div key={f.id}
                  onDoubleClick={() => { if (f.ext==='txt'||f.ext==='docx') onFileAction?.('open-notepad',f) }}
                  onClick={() => setSelected(f.id)}
                  style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4,width:80,cursor:'pointer',padding:8,borderRadius:4,
                    background:selected===f.id?'#cce4f7':'transparent',border:selected===f.id?'1px solid #7ab8f5':'1px solid transparent'}}
                  onMouseOver={e=>{ if(selected!==f.id) e.currentTarget.style.background='#eef4fd' }}
                  onMouseOut={e=>{ if(selected!==f.id) e.currentTarget.style.background='transparent' }}>
                  <FileIcon type={f.icon} size={40}/>
                  <span style={{fontSize:11,textAlign:'center',wordBreak:'break-all',color:'#1a1a1a'}}>{f.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Status bar */}
      <div style={{background:'#f0f0f0',borderTop:'1px solid #ddd',padding:'2px 12px',fontSize:11,color:'#555',display:'flex',gap:16}}>
        <span>{items.length} объект(ов)</span>
        {selected && <span>Выбран: {items.find(f=>f.id===selected)?.name}</span>}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════
   APP: CALCULATOR
══════════════════════════════════════════ */
function CalculatorApp() {
  const [display, setDisplay]   = useState('0')
  const [history, setHistory]   = useState('')
  const [op, setOp]             = useState(null)
  const [prev, setPrev]         = useState(null)
  const [fresh, setFresh]       = useState(true)

  const btn = (bg, fg, label, span) => ({ bg, fg, label, span: span||1 })
  const ROWS = [
    [btn('#3a3a3a','#fff','%'), btn('#3a3a3a','#fff','CE'), btn('#3a3a3a','#fff','C'), btn('#3a3a3a','#fff','⌫')],
    [btn('#3a3a3a','#fff','¹/x'), btn('#3a3a3a','#fff','x²'), btn('#3a3a3a','#fff','√'), btn('#0f7b6c','#fff','÷')],
    [btn('#404040','#fff','7'), btn('#404040','#fff','8'), btn('#404040','#fff','9'), btn('#0f7b6c','#fff','×')],
    [btn('#404040','#fff','4'), btn('#404040','#fff','5'), btn('#404040','#fff','6'), btn('#0f7b6c','#fff','−')],
    [btn('#404040','#fff','1'), btn('#404040','#fff','2'), btn('#404040','#fff','3'), btn('#0f7b6c','#fff','+')],
    [btn('#404040','#fff','±'), btn('#404040','#fff','0',2), btn('#404040','#fff','.'), btn('#0078d4','#fff','=')],
  ]

  const press = (lbl) => {
    if (lbl >= '0' && lbl <= '9' || lbl === '.') {
      if (display === '0' || fresh) { setDisplay(lbl === '.' ? '0.' : lbl); setFresh(false) }
      else if (!(lbl==='.' && display.includes('.'))) setDisplay(d => d + lbl)
      return
    }
    if (lbl === 'C')  { setDisplay('0'); setHistory(''); setOp(null); setPrev(null); setFresh(true); return }
    if (lbl === 'CE') { setDisplay('0'); setFresh(true); return }
    if (lbl === '⌫') { setDisplay(d => d.length > 1 ? d.slice(0,-1) : '0'); return }
    if (lbl === '±')  { setDisplay(d => d.startsWith('-') ? d.slice(1) : '-'+d); return }
    if (lbl === '%')  { setDisplay(d => String(parseFloat(d)/100)); return }
    if (lbl === '¹/x'){ setDisplay(d => String(1/parseFloat(d))); return }
    if (lbl === 'x²') { setDisplay(d => String(parseFloat(d)**2)); return }
    if (lbl === '√')  { setDisplay(d => String(Math.sqrt(parseFloat(d)))); return }
    if (['+','−','×','÷'].includes(lbl)) {
      setPrev(parseFloat(display)); setOp(lbl)
      setHistory(display + ' ' + lbl); setFresh(true); return
    }
    if (lbl === '=') {
      if (op && prev !== null) {
        const cur = parseFloat(display)
        let res = cur
        if (op==='+') res = prev + cur
        if (op==='−') res = prev - cur
        if (op==='×') res = prev * cur
        if (op==='÷') res = cur !== 0 ? prev / cur : 'Ошибка'
        setHistory(prev + ' ' + op + ' ' + cur + ' =')
        setDisplay(String(res))
        setPrev(null); setOp(null); setFresh(true)
      }
    }
  }

  return (
    <div style={{background:'#1f1f1f',height:'100%',display:'flex',flexDirection:'column',userSelect:'none'}}>
      {/* Mode selector */}
      <div style={{padding:'8px 16px',color:'#ccc',fontSize:13,fontWeight:600}}>Стандартный</div>
      {/* Display */}
      <div style={{padding:'0 16px 8px',textAlign:'right'}}>
        <div style={{color:'#888',fontSize:13,minHeight:20,marginBottom:4}}>{history}</div>
        <div style={{color:'white',fontSize:44,fontWeight:200,letterSpacing:'-1px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
          {display.length > 12 ? parseFloat(display).toPrecision(8) : display}
        </div>
      </div>
      {/* Buttons */}
      <div style={{flex:1,padding:'0 8px 8px',display:'grid',gridTemplateRows:'repeat(6,1fr)',gap:2}}>
        {ROWS.map((row, ri) => (
          <div key={ri} style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:2}}>
            {row.map((b,bi) => (
              <button key={bi} onClick={()=>press(b.label)}
                style={{
                  gridColumn: b.span > 1 ? `span ${b.span}` : 'span 1',
                  background:b.bg, color:b.fg,
                  border:'none', borderRadius:4, cursor:'pointer',
                  fontSize:b.label==='='||['+','−','×','÷'].includes(b.label)?22:16,
                  fontWeight:400, transition:'filter 0.1s',
                }}
                onMouseOver={e=>e.currentTarget.style.filter='brightness(1.3)'}
                onMouseOut={e=>e.currentTarget.style.filter='brightness(1)'}>
                {b.label}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════
   APP: SETTINGS
══════════════════════════════════════════ */
function SettingsApp({ wallpaper, onWallpaperChange }) {
  const [page, setPage] = useState('home')
  const PAGES = [
    { id:'system',     label:'Система',         icon:'🖥️' },
    { id:'personalize',label:'Персонализация',  icon:'🎨' },
    { id:'apps',       label:'Приложения',      icon:'📦' },
    { id:'accounts',   label:'Учётные записи',  icon:'👤' },
  ]
  const WALLPAPER_OPTIONS = [
    { id:'purple',   label:'Волна (по умолч.)', preview:'linear-gradient(135deg,#c7b8ea,#7b6be4)' },
    { id:'green',    label:'Зелёные холмы',     preview:'radial-gradient(ellipse at 50% 80%,#1a6b3c,#0a3d1f)' },
    { id:'darkblue', label:'Тёмно-синий',       preview:'linear-gradient(160deg,#0a0a2e,#1a1a4a)' },
    { id:'solid',    label:'Фиолетовый',        preview:'#3a1060' },
  ]

  return (
    <div style={{height:'100%',display:'flex',background:'#f3f3f3'}}>
      {/* Sidebar */}
      <div style={{width:220,background:'#f3f3f3',borderRight:'1px solid #e0e0e0',padding:'16px 0'}}>
        <div style={{padding:'0 16px 16px',display:'flex',alignItems:'center',gap:10}}>
          <span style={{fontSize:24}}>⚙️</span>
          <span style={{fontSize:16,fontWeight:600,color:'#1a1a1a'}}>Параметры</span>
        </div>
        {PAGES.map(p => (
          <button key={p.id} onClick={()=>setPage(p.id)}
            style={{display:'flex',alignItems:'center',gap:10,width:'100%',padding:'10px 20px',
              border:'none',background:page===p.id?'#e0e0e0':'transparent',cursor:'pointer',textAlign:'left',fontSize:13,color:'#1a1a1a'}}
            onMouseOver={e=>e.currentTarget.style.background=page===p.id?'#e0e0e0':'#e8e8e8'}
            onMouseOut={e=>e.currentTarget.style.background=page===p.id?'#e0e0e0':'transparent'}>
            <span style={{fontSize:20}}>{p.icon}</span>{p.label}
          </button>
        ))}
      </div>
      {/* Content */}
      <div style={{flex:1,padding:24,overflow:'auto'}}>
        {page === 'home' && (
          <div>
            <h2 style={{fontSize:20,fontWeight:300,marginBottom:16,color:'#1a1a1a'}}>Параметры Windows</h2>
            <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:12}}>
              {PAGES.map(p => (
                <button key={p.id} onClick={()=>setPage(p.id)}
                  style={{display:'flex',alignItems:'center',gap:12,padding:16,background:'white',border:'1px solid #e0e0e0',borderRadius:4,cursor:'pointer',textAlign:'left',fontSize:13,color:'#1a1a1a'}}
                  onMouseOver={e=>e.currentTarget.style.background='#f5f5f5'}
                  onMouseOut={e=>e.currentTarget.style.background='white'}>
                  <span style={{fontSize:28}}>{p.icon}</span>
                  <div>
                    <div style={{fontWeight:600}}>{p.label}</div>
                    <div style={{color:'#888',fontSize:11,marginTop:2}}>Нажмите чтобы открыть</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        {page === 'system' && (
          <div>
            <h2 style={{fontSize:20,fontWeight:300,marginBottom:16}}>Система</h2>
            <div style={{background:'white',border:'1px solid #e0e0e0',borderRadius:4,padding:16,marginBottom:12}}>
              <div style={{fontWeight:600,marginBottom:4}}>Экран</div>
              <div style={{color:'#555',fontSize:13}}>Яркость, разрешение, ориентация экрана</div>
            </div>
            <div style={{background:'white',border:'1px solid #e0e0e0',borderRadius:4,padding:16}}>
              <div style={{fontWeight:600,marginBottom:4}}>Звук</div>
              <div style={{color:'#555',fontSize:13}}>Устройства вывода и ввода, громкость</div>
              <input type="range" min="0" max="100" defaultValue="70" style={{marginTop:8,width:'100%'}}/>
            </div>
          </div>
        )}
        {page === 'personalize' && (
          <div>
            <h2 style={{fontSize:20,fontWeight:300,marginBottom:16}}>Персонализация</h2>
            <div style={{marginBottom:8,fontWeight:500,fontSize:14}}>Фоновое изображение</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:12}}>
              {WALLPAPER_OPTIONS.map(w => (
                <button key={w.id} onClick={()=>onWallpaperChange(w.id)}
                  style={{padding:0,border: wallpaper===w.id ? '3px solid #0078d4' : '3px solid transparent',borderRadius:6,cursor:'pointer',background:'none',overflow:'hidden'}}>
                  <div style={{height:80,background:w.preview,borderRadius:3}}/>
                  <div style={{padding:'6px 8px',background:'white',fontSize:12,textAlign:'left',color:'#1a1a1a',display:'flex',alignItems:'center',gap:4}}>
                    {wallpaper===w.id && <span style={{color:'#0078d4',fontWeight:700}}>✓</span>}
                    {w.label}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        {page === 'apps' && (
          <div>
            <h2 style={{fontSize:20,fontWeight:300,marginBottom:16}}>Приложения</h2>
            {['Блокнот','Калькулятор','Проводник','Microsoft Edge','Параметры','Microsoft Store'].map(app => (
              <div key={app} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 16px',background:'white',border:'1px solid #e0e0e0',borderRadius:4,marginBottom:8,fontSize:13}}>
                <span>{app}</span>
                <span style={{color:'#888',fontSize:12}}>Системное приложение</span>
              </div>
            ))}
          </div>
        )}
        {page === 'accounts' && (
          <div>
            <h2 style={{fontSize:20,fontWeight:300,marginBottom:16}}>Учётные записи</h2>
            <div style={{display:'flex',alignItems:'center',gap:16,background:'white',border:'1px solid #e0e0e0',borderRadius:4,padding:20,marginBottom:12}}>
              <div style={{width:64,height:64,borderRadius:'50%',background:'linear-gradient(135deg,#7b6be4,#a78bfa)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,color:'white'}}>👤</div>
              <div>
                <div style={{fontWeight:600,fontSize:16}}>Ученик</div>
                <div style={{color:'#888',fontSize:13,marginTop:2}}>Локальная учётная запись</div>
                <div style={{color:'#888',fontSize:12,marginTop:2}}>Администратор</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════
   APP: RECYCLE BIN
══════════════════════════════════════════ */
function TrashApp({ trash, onRestore, onDeletePermanent, onEmptyTrash }) {
  return (
    <div style={{height:'100%',display:'flex',flexDirection:'column'}}>
      <div style={{background:'#f9f9f9',borderBottom:'1px solid #e5e5e5',padding:'6px 12px',display:'flex',alignItems:'center',gap:8}}>
        <button onClick={onEmptyTrash}
          style={{padding:'4px 14px',background:'white',border:'1px solid #c0c0c0',borderRadius:3,cursor:'pointer',fontSize:12,color:'#1a1a1a'}}
          onMouseOver={e=>e.currentTarget.style.background='#f0f0f0'}
          onMouseOut={e=>e.currentTarget.style.background='white'}>
          Очистить корзину
        </button>
        <span style={{color:'#888',fontSize:12}}>{trash.length} объект(ов)</span>
      </div>
      <div style={{flex:1,padding:16,overflow:'auto'}}>
        {trash.length === 0 ? (
          <div style={{color:'#999',fontSize:13,textAlign:'center',marginTop:40}}>Корзина пуста</div>
        ) : (
          <div style={{display:'flex',flexWrap:'wrap',gap:16}}>
            {trash.map(f => (
              <div key={f.id} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4,width:88,padding:8,borderRadius:4,background:'#fafafa',border:'1px solid #e0e0e0'}}>
                <FileIcon type={f.icon} size={40}/>
                <span style={{fontSize:11,textAlign:'center',wordBreak:'break-all',color:'#1a1a1a'}}>{f.name}</span>
                <button onClick={()=>onRestore(f.id)}
                  style={{fontSize:10,background:'#0078d4',color:'white',border:'none',borderRadius:3,padding:'2px 8px',cursor:'pointer',width:'100%',marginTop:2}}>
                  Восстановить
                </button>
                <button onClick={()=>onDeletePermanent(f.id)}
                  style={{fontSize:10,background:'#c42b1c',color:'white',border:'none',borderRadius:3,padding:'2px 8px',cursor:'pointer',width:'100%'}}>
                  Удалить навсегда
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════
   TOAST
══════════════════════════════════════════ */
function Toast({ msg, type }) {
  return (
    <motion.div initial={{x:60,opacity:0}} animate={{x:0,opacity:1}} exit={{x:60,opacity:0}}
      style={{
        position:'fixed',bottom:64,right:16,zIndex:200,
        background:type==='success'?'#107c10':'#1a1a1a',
        color:'white',borderRadius:4,padding:'12px 16px',
        maxWidth:300,boxShadow:'0 4px 20px rgba(0,0,0,0.4)',
        fontFamily:SEG,fontSize:13,display:'flex',gap:8,
      }}>
      <span>{type==='success'?'✅':'ℹ️'}</span>
      <span>{msg}</span>
    </motion.div>
  )
}

/* ══════════════════════════════════════════
   WINDOWS LOGO SVG
══════════════════════════════════════════ */
function WinLogo({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" fill="#ffffff"/>
    </svg>
  )
}

/* ══════════════════════════════════════════
   START MENU
══════════════════════════════════════════ */
function StartMenu({ onClose, onOpenApp, recentFiles }) {
  const PINNED = [
    { id:'notepad',    icon:<img src={`${BASE}assets/icon-notepad.png`} width={32} height={32} style={{objectFit:'contain'}}/>,  label:'Блокнот' },
    { id:'calculator', icon:'🧮',                                                                                                 label:'Калькулятор' },
    { id:'edge',       icon:<img src={`${BASE}assets/icon-edge.png`} width={32} height={32} style={{objectFit:'contain'}}/>,     label:'Edge' },
    { id:'settings',   icon:<img src={`${BASE}assets/icon-settings.png`} width={32} height={32} style={{objectFit:'contain'}}/>, label:'Параметры' },
    { id:'explorer',   icon:<img src={`${BASE}assets/icon-explorer.png`} width={32} height={32} style={{objectFit:'contain'}}/>, label:'Проводник' },
    { id:'store',      icon:<img src={`${BASE}assets/icon-store.png`} width={32} height={32} style={{objectFit:'contain'}}/>,    label:'Магазин' },
    { id:'photos',     icon:'📷', label:'Камера' },
    { id:'music',      icon:'🎵', label:'Музыка' },
    { id:'maps',       icon:'🗺️', label:'Карты' },
    { id:'trash',      icon:'🗑️', label:'Корзина' },
  ]
  return (
    <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:12}}
      onClick={e=>e.stopPropagation()}
      style={{
        position:'fixed',bottom:50,left:0,width:600,zIndex:100,
        background:'rgba(32,32,32,0.97)',backdropFilter:'blur(20px)',
        boxShadow:'0 -4px 40px rgba(0,0,0,0.6)',borderRadius:'0 8px 0 0',
        fontFamily:SEG,overflow:'hidden',
      }}>
      {/* Search */}
      <div style={{padding:'16px 20px 8px'}}>
        <div style={{background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.15)',
          borderRadius:20,padding:'8px 16px',display:'flex',alignItems:'center',gap:8}}>
          <span>🔍</span>
          <span style={{color:'rgba(255,255,255,0.45)',fontSize:13}}>Поиск приложений, настроек и файлов</span>
        </div>
      </div>
      {/* Pinned */}
      <div style={{padding:'8px 20px'}}>
        <div style={{color:'rgba(255,255,255,0.5)',fontSize:12,fontWeight:600,marginBottom:10}}>Закреплённые</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:4}}>
          {PINNED.map(p => (
            <button key={p.id} onClick={()=>{ onOpenApp(p.id); onClose() }}
              style={{background:'none',border:'none',cursor:'pointer',padding:'10px 4px',
                display:'flex',flexDirection:'column',alignItems:'center',gap:6,borderRadius:6,color:'white'}}
              onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,0.1)'}
              onMouseOut={e=>e.currentTarget.style.background='none'}>
              <span style={{fontSize:typeof p.icon==='string'?28:undefined}}>{p.icon}</span>
              <span style={{fontSize:11,textAlign:'center',lineHeight:1.2}}>{p.label}</span>
            </button>
          ))}
        </div>
      </div>
      {/* Recommended */}
      <div style={{padding:'8px 20px 12px',borderTop:'1px solid rgba(255,255,255,0.08)'}}>
        <div style={{color:'rgba(255,255,255,0.5)',fontSize:12,fontWeight:600,marginBottom:8}}>Рекомендуемые</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:6}}>
          {recentFiles.slice(0,4).map(f => (
            <div key={f.id} style={{display:'flex',alignItems:'center',gap:8,padding:'6px 10px',borderRadius:4,cursor:'pointer',color:'rgba(255,255,255,0.8)',fontSize:12}}
              onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,0.08)'}
              onMouseOut={e=>e.currentTarget.style.background='transparent'}>
              <FileIcon type={f.icon} size={24}/>
              <span>{f.name}</span>
            </div>
          ))}
          {recentFiles.length === 0 && <span style={{color:'rgba(255,255,255,0.3)',fontSize:12,gridColumn:'span 2'}}>Недавно открытых файлов нет</span>}
        </div>
      </div>
      {/* User row */}
      <div style={{borderTop:'1px solid rgba(255,255,255,0.1)',padding:'12px 20px',display:'flex',alignItems:'center',gap:10}}>
        <div style={{width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,#7b6be4,#a78bfa)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>👤</div>
        <div>
          <div style={{color:'white',fontSize:13,fontWeight:600}}>Ученик</div>
          <div style={{color:'rgba(255,255,255,0.4)',fontSize:11}}>Локальная учётная запись</div>
        </div>
        <button onClick={onClose} style={{marginLeft:'auto',background:'none',border:'none',cursor:'pointer',color:'rgba(255,255,255,0.5)',fontSize:20}}>⏻</button>
      </div>
    </motion.div>
  )
}

/* ══════════════════════════════════════════
   DESKTOP ICON
══════════════════════════════════════════ */
function DesktopIcon({ label, type, selected, draggable, isDragging, dropHighlight, badgeCount,
  onClick, onDblClick, onDragStart, onDragEnd, onDragOver, onDragLeave, onDrop, onContextMenu }) {
  return (
    <div draggable={!!draggable}
      onClick={onClick} onDoubleClick={onDblClick}
      onDragStart={onDragStart} onDragEnd={onDragEnd}
      onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
      onContextMenu={onContextMenu}
      style={{
        display:'flex',flexDirection:'column',alignItems:'center',gap:3,padding:6,borderRadius:4,
        cursor:'pointer',userSelect:'none',width:80,
        background:dropHighlight?'rgba(0,120,212,0.15)':selected?'rgba(0,120,212,0.2)':'transparent',
        outline:dropHighlight?'2px dashed #0078d4':selected?'2px solid rgba(0,120,212,0.5)':'none',
        opacity:isDragging?0.4:1,
      }}>
      <div style={{position:'relative'}}>
        <FileIcon type={type} size={44}/>
        {badgeCount > 0 && (
          <div style={{position:'absolute',top:-4,right:-4,background:'#8b5cf6',color:'white',fontSize:9,fontWeight:900,borderRadius:'50%',width:16,height:16,display:'flex',alignItems:'center',justifyContent:'center'}}>
            {badgeCount}
          </div>
        )}
      </div>
      <span style={{textAlign:'center',lineHeight:1.2,color:'white',fontWeight:600,fontSize:11,wordBreak:'break-word',
        textShadow:'0 1px 3px rgba(0,0,0,0.8)',width:'100%'}}>
        {label}
      </span>
    </div>
  )
}

/* ══════════════════════════════════════════
   MAIN WIN10 SANDBOX
══════════════════════════════════════════ */
export default function Win10Sandbox({ name, onFinish }) {
  /* ── files / folders ── */
  const [files,          setFiles]          = useState([
    { id:'photo',    name:'photo.png',     icon:'img',   loc:'desktop', ext:'png'  },
    { id:'music',    name:'music.mp3',     icon:'audio', loc:'desktop', ext:'mp3'  },
    { id:'homework', name:'homework.docx', icon:'word',  loc:'desktop', ext:'docx' },
    { id:'old',      name:'old.txt',       icon:'txt',   loc:'desktop', ext:'txt'  },
  ])
  const [trash,          setTrash]          = useState([])
  const [customFolders,  setCustomFolders]  = useState([])

  /* ── window manager ── */
  const [windows,        setWindows]        = useState([])
  const [zCounter,       setZCounter]       = useState(10)

  /* ── UI state ── */
  const [selected,       setSelected]       = useState(null)
  const [clipboard,      setClipboard]      = useState(null)
  const [dragItem,       setDragItem]       = useState(null)
  const [dropTarget,     setDropTarget]     = useState(null)
  const [ctxMenu,        setCtxMenu]        = useState(null)
  const [startMenu,      setStartMenu]      = useState(false)
  const [toast,          setToast]          = useState(null)
  const [clock,          setClock]          = useState('')
  const [wallpaper,      setWallpaper]      = useState('purple')
  const [newFolderModal, setNewFolderModal] = useState(false)
  const [newFolderName,  setNewFolderName]  = useState('')

  /* ── tasks ── */
  const [taskIdx,         setTaskIdx]         = useState(0)
  const [completedTasks,  setCompletedTasks]  = useState([])
  const [hintIdx,         setHintIdx]         = useState(0)
  const [totalHints,      setTotalHints]      = useState(0)
  const [score,           setScore]           = useState(0)

  /* ── clock ── */
  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString('ru',{hour:'2-digit',minute:'2-digit'}))
    tick(); const t = setInterval(tick, 10000); return () => clearInterval(t)
  }, [])

  /* ── keyboard shortcuts ── */
  useEffect(() => {
    const h = (e) => {
      if (!(e.ctrlKey||e.metaKey)) return
      if (e.key === 's') { e.preventDefault(); dispatch({ type:'save' }); showToast('Файл сохранён (Ctrl+S)','success') }
      if (e.key === 'c' && selected) { e.preventDefault(); setClipboard({ fileId:selected }); dispatch({ type:'copy', fileId:selected }); showToast('Скопировано') }
      if (e.key === 'v' && clipboard) { e.preventDefault(); showToast('Вставлено из буфера') }
      if (e.key === 'z') { e.preventDefault(); showToast('Действие отменено') }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [selected, clipboard])

  /* ── close menus on click outside ── */
  useEffect(() => {
    const h = () => { setCtxMenu(null); setStartMenu(false) }
    window.addEventListener('click', h)
    return () => window.removeEventListener('click', h)
  }, [])

  /* ── helpers ── */
  const showToast = (msg, type='info') => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 2500)
  }

  const dispatch = useCallback((action) => {
    const task = TASKS[taskIdx]
    if (!task || completedTasks.includes(task.id)) return
    if (task.check(action)) {
      setCompletedTasks(p => [...p, task.id])
      setScore(p => p + task.points)
      showToast(`Задание выполнено! +${task.points} очков`, 'success')
      setTaskIdx(p => p + 1)
      setHintIdx(0)
    }
  }, [taskIdx, completedTasks])

  /* ── window manager ── */
  const FOLDER_IDS = ['docs','photos','music-f']
  const BASE_FOLDERS = [
    { id:'docs',    name:'Документы' },
    { id:'photos',  name:'Фото'      },
    { id:'music-f', name:'Музыка'    },
  ]
  const allFolders = [...BASE_FOLDERS, ...customFolders]

  const openApp = (appName, extraState = {}) => {
    const z = zCounter + 1; setZCounter(z)
    const configs = {
      notepad:    { title:'Блокнот',         icon:'📝', w:560, h:420, x:120+windows.length*20, y:60+windows.length*20 },
      explorer:   { title:'Проводник',       icon:<img src={`${BASE}assets/icon-explorer.png`} width={16} height={16} style={{objectFit:'contain'}}/>, w:720, h:500, x:100, y:50 },
      calculator: { title:'Калькулятор',     icon:'🧮', w:320, h:500, x:300, y:80 },
      settings:   { title:'Параметры',       icon:<img src={`${BASE}assets/icon-settings.png`} width={16} height={16} style={{objectFit:'contain'}}/>, w:680, h:520, x:120, y:60 },
      thispc:     { title:'Этот компьютер',  icon:'💻', w:720, h:500, x:100, y:50 },
      trash:      { title:'Корзина',         icon:'🗑️', w:600, h:460, x:140, y:70 },
    }
    const cfg = configs[appName] || { title:appName, icon:'📄', w:560, h:400, x:150, y:80 }
    const win = { id:`win-${Date.now()}`, app:appName, ...cfg, minimized:false, maximized:false, z, appState:extraState }
    setWindows(p => [...p, win])
    return win.id
  }

  const focusWin  = (id) => { const z = zCounter+1; setZCounter(z); setWindows(p => p.map(w => w.id===id ? {...w, z} : w)) }
  const closeWin  = (id) => setWindows(p => p.filter(w => w.id !== id))
  const minimizeWin = (id) => setWindows(p => p.map(w => w.id===id ? {...w, minimized:true} : w))
  const maximizeWin = (id) => setWindows(p => p.map(w => w.id===id ? {...w, maximized:!w.maximized} : w))
  const moveWin   = (id, x, y) => setWindows(p => p.map(w => w.id===id ? {...w, x, y} : w))
  const restoreWin = (id) => setWindows(p => p.map(w => w.id===id ? {...w, minimized:false} : w))

  /* ── DnD ── */
  const onDragStart = (e, fileId) => { e.dataTransfer.setData('text', fileId); setDragItem(fileId) }
  const onDragEnd   = () => { setDragItem(null); setDropTarget(null) }

  const dropToFolder = (e, folderId) => {
    e.preventDefault(); setDropTarget(null)
    const fileId = e.dataTransfer.getData('text'); if (!fileId) return
    setFiles(p => p.map(f => f.id===fileId ? {...f, loc:folderId} : f))
    dispatch({ type:'drop-folder', fileId, folderId })
    showToast('Файл перемещён в папку')
  }
  const dropToTrash = (e) => {
    e.preventDefault(); setDropTarget(null)
    const fileId = e.dataTransfer.getData('text'); if (!fileId) return
    const file = files.find(f => f.id===fileId); if (!file) return
    setFiles(p => p.filter(f => f.id!==fileId))
    setTrash(p => [...p, file])
    dispatch({ type:'drop-trash', fileId })
    showToast('Файл перемещён в Корзину')
  }

  const restoreFile = (fileId) => {
    const file = trash.find(f => f.id===fileId); if (!file) return
    setTrash(p => p.filter(f => f.id!==fileId))
    setFiles(p => [...p, {...file, loc:'desktop'}])
    dispatch({ type:'restore', fileId })
    showToast('Файл восстановлен','success')
  }
  const deleteForever = (fileId) => {
    setTrash(p => p.filter(f => f.id!==fileId))
    showToast('Файл удалён навсегда')
  }
  const emptyTrash = () => { setTrash([]); showToast('Корзина очищена') }

  const confirmFolder = () => {
    const n = newFolderName.trim() || 'Новая папка'
    setCustomFolders(p => [...p, { id:`cf-${Date.now()}`, name:n }])
    setNewFolderModal(false)
    dispatch({ type:'create-folder', name:n })
    showToast(`Папка «${n}» создана`, 'success')
  }

  const desktopFiles  = files.filter(f => f.loc === 'desktop')
  const currentTask   = TASKS[taskIdx]
  const done          = taskIdx >= TASKS.length

  /* ── app opener from Start Menu / taskbar ── */
  const handleOpenApp = (appId) => {
    const existingOpen = windows.find(w => w.app === appId && !w.minimized)
    if (existingOpen) { focusWin(existingOpen.id); return }
    const existingMin  = windows.find(w => w.app === appId && w.minimized)
    if (existingMin)   { restoreWin(existingMin.id); focusWin(existingMin.id); return }
    if (appId === 'explorer') openApp('explorer', { startPath:'desktop' })
    else if (appId === 'thispc') openApp('thispc')
    else if (['notepad','calculator','settings','trash'].includes(appId)) openApp(appId)
    else showToast(`Открываю ${appId}...`)
  }

  /* ── render app content inside window ── */
  const renderAppContent = (win) => {
    if (win.app === 'notepad') return (
      <NotepadApp win={win} onSave={() => dispatch({ type:'save' })}/>
    )
    if (win.app === 'explorer' || win.app === 'thispc') return (
      <ExplorerApp
        files={files} trash={trash} allFolders={allFolders} customFolders={customFolders}
        startPath={win.app === 'thispc' ? 'thispc' : (win.appState?.startPath || 'desktop')}
        onFileAction={(action, payload) => {
          if (action === 'restore') restoreFile(payload)
          if (action === 'open-notepad') openApp('notepad', { file: payload })
        }}
      />
    )
    if (win.app === 'calculator') return <CalculatorApp/>
    if (win.app === 'settings')   return <SettingsApp wallpaper={wallpaper} onWallpaperChange={setWallpaper}/>
    if (win.app === 'trash')      return (
      <TrashApp trash={trash} onRestore={restoreFile} onDeletePermanent={deleteForever} onEmptyTrash={emptyTrash}/>
    )
    return <div style={{padding:20,color:'#888',fontSize:13}}>Приложение запущено</div>
  }

  const activeWinId = windows.filter(w=>!w.minimized).sort((a,b)=>b.z-a.z)[0]?.id

  return (
    <div style={{position:'fixed',inset:0,fontFamily:SEG,overflow:'hidden'}}>
      {/* ══ DESKTOP ══ */}
      <div className="absolute inset-0" style={{bottom:48,overflow:'hidden'}}
        onContextMenu={e => { e.preventDefault(); e.stopPropagation(); setCtxMenu({ x:e.clientX, y:e.clientY, target:'desktop' }) }}
        onClick={() => { setSelected(null); setCtxMenu(null); setStartMenu(false) }}>

        <Win10Wallpaper which={wallpaper}/>

        {/* ── Left column: system icons ── */}
        <div style={{position:'absolute',left:8,top:8,display:'flex',flexDirection:'column',gap:2,zIndex:10}}>
          {/* This PC */}
          <DesktopIcon label="Этот компьютер" type="pc"
            selected={selected==='thispc'}
            onClick={e=>{e.stopPropagation();setSelected('thispc');dispatch({type:'click-folder',id:'pc'})}}
            onDblClick={()=>handleOpenApp('thispc')}/>
          {/* Recycle bin */}
          <DesktopIcon label="Корзина" type={trash.length?'trash-full':'trash-empty'}
            selected={selected==='trash'}
            dropHighlight={dropTarget==='trash'}
            onClick={e=>{e.stopPropagation();setSelected('trash')}}
            onDblClick={()=>openApp('trash')}
            onDragOver={e=>{e.preventDefault();setDropTarget('trash')}}
            onDragLeave={()=>setDropTarget(null)}
            onDrop={dropToTrash}/>
          {/* System folders */}
          {allFolders.map(f => (
            <DesktopIcon key={f.id} label={f.name} type="folder"
              selected={selected===f.id}
              badgeCount={files.filter(x=>x.loc===f.id).length}
              dropHighlight={dropTarget===f.id}
              onClick={e=>{e.stopPropagation();setSelected(f.id);dispatch({type:'click-folder',id:f.id})}}
              onDblClick={()=>{openApp('explorer',{startPath:f.id});dispatch({type:'open-folder',id:f.id})}}
              onDragOver={e=>{e.preventDefault();setDropTarget(f.id)}}
              onDragLeave={()=>setDropTarget(null)}
              onDrop={e=>dropToFolder(e,f.id)}/>
          ))}
        </div>

        {/* ── Right of left column: file icons ── */}
        <div style={{position:'absolute',left:96,top:8,display:'flex',flexDirection:'column',gap:2,zIndex:10}}>
          {desktopFiles.map(file => (
            <DesktopIcon key={file.id} label={file.name} type={file.icon}
              draggable selected={selected===file.id}
              isDragging={dragItem===file.id}
              onClick={e=>{e.stopPropagation();setSelected(file.id)}}
              onDblClick={()=>{
                if (file.ext==='txt'||file.ext==='docx') openApp('notepad',{file})
                else showToast(`Открываю ${file.name}...`)
              }}
              onDragStart={e=>onDragStart(e,file.id)}
              onDragEnd={onDragEnd}
              onContextMenu={e=>{e.preventDefault();e.stopPropagation();setCtxMenu({x:e.clientX,y:e.clientY,target:file.id,fileId:file.id})}}/>
          ))}
        </div>

        {/* Character */}
        <img src={`${BASE}assets/character.png`} alt="helper"
          style={{position:'absolute',bottom:4,right:8,height:150,objectFit:'contain',filter:'drop-shadow(0 4px 12px rgba(0,0,0,0.2))',pointerEvents:'none',userSelect:'none',zIndex:10}}/>

        {/* ── Windows ── */}
        <AnimatePresence>
          {windows.map(win => (
            <DraggableWindow key={win.id} win={win}
              onClose={closeWin} onMinimize={minimizeWin} onMaximize={maximizeWin}
              onFocus={focusWin} onMove={moveWin}>
              {renderAppContent(win)}
            </DraggableWindow>
          ))}
        </AnimatePresence>

        {/* ── Context menu ── */}
        <Win10CtxMenu menu={ctxMenu}
          onCreateFolder={()=>{setNewFolderModal(true);setNewFolderName('')}}
          onPaste={()=>clipboard&&showToast('Вставлено')}
          onRefresh={()=>showToast('Обновлено')}
          onDeleteFile={()=>{
            if (ctxMenu?.fileId) {
              const file = files.find(f=>f.id===ctxMenu.fileId)
              if (file) { setFiles(p=>p.filter(f=>f.id!==ctxMenu.fileId)); setTrash(p=>[...p,file]); dispatch({type:'drop-trash',fileId:ctxMenu.fileId}); showToast('Файл удалён') }
            }
          }}
          onClose={()=>setCtxMenu(null)}/>

        {/* ── Start menu ── */}
        <AnimatePresence>
          {startMenu && (
            <StartMenu key="start"
              onClose={()=>setStartMenu(false)}
              onOpenApp={handleOpenApp}
              recentFiles={files.slice(0,4)}/>
          )}
        </AnimatePresence>
      </div>

      {/* ══ TASKBAR ══ */}
      <div style={{
        position:'fixed',bottom:0,left:0,right:0,height:48,zIndex:150,
        display:'flex',alignItems:'center',
        background:'rgba(0,0,0,0.9)',backdropFilter:'blur(20px)',
        borderTop:'1px solid rgba(255,255,255,0.08)',
      }}>
        {/* Start button */}
        <button style={{width:48,height:48,display:'flex',alignItems:'center',justifyContent:'center',border:'none',background:'transparent',cursor:'pointer'}}
          onClick={e=>{e.stopPropagation();setStartMenu(s=>!s)}}
          onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,0.1)'}
          onMouseOut={e=>e.currentTarget.style.background='transparent'}>
          <WinLogo size={20}/>
        </button>
        {/* Search */}
        <div style={{display:'flex',alignItems:'center',gap:6,background:'rgba(255,255,255,0.1)',borderRadius:2,height:32,padding:'0 12px',marginRight:4,minWidth:200,border:'1px solid rgba(255,255,255,0.08)',cursor:'text'}}>
          <span style={{color:'rgba(255,255,255,0.45)',fontSize:14}}>🔍</span>
          <span style={{color:'rgba(255,255,255,0.45)',fontSize:12}}>Поиск в Windows</span>
        </div>
        {/* Task View */}
        <button style={{width:40,height:48,display:'flex',alignItems:'center',justifyContent:'center',border:'none',background:'transparent',cursor:'pointer',color:'rgba(255,255,255,0.7)',fontSize:16}}>⊡</button>
        {/* Pinned apps */}
        <div style={{display:'flex',alignItems:'center',gap:1,marginLeft:4}}>
          {[
            { id:'explorer', src:`${BASE}assets/icon-explorer.png`, label:'Проводник' },
            { id:'edge',     src:`${BASE}assets/icon-edge.png`,     label:'Edge' },
            { id:'store',    src:`${BASE}assets/icon-store.png`,    label:'Магазин' },
            { id:'settings', src:`${BASE}assets/icon-settings.png`, label:'Параметры' },
          ].map(app => (
            <button key={app.id} title={app.label}
              style={{width:40,height:48,display:'flex',alignItems:'center',justifyContent:'center',border:'none',background:'transparent',cursor:'pointer'}}
              onClick={e=>{e.stopPropagation();handleOpenApp(app.id)}}
              onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,0.1)'}
              onMouseOut={e=>e.currentTarget.style.background='transparent'}>
              <img src={app.src} alt={app.label} style={{width:26,height:26,objectFit:'contain'}}/>
            </button>
          ))}
        </div>
        {/* citrend logo */}
        <div style={{marginLeft:4,paddingLeft:8,borderLeft:'1px solid rgba(255,255,255,0.1)',display:'flex',alignItems:'center'}}>
          <img src={`${BASE}assets/logo.png`} alt="citrend" style={{height:22,objectFit:'contain',opacity:0.7}}/>
        </div>
        {/* Running windows */}
        <div style={{display:'flex',alignItems:'center',gap:2,marginLeft:8,flex:1,overflow:'hidden'}}>
          {windows.map(win => (
            <button key={win.id}
              onClick={e=>{e.stopPropagation(); win.minimized ? (restoreWin(win.id),focusWin(win.id)) : (win.id===activeWinId ? minimizeWin(win.id) : focusWin(win.id))}}
              style={{
                display:'flex',alignItems:'center',gap:6,height:48,padding:'0 10px',
                border:'none',background:'transparent',cursor:'pointer',
                borderBottom: win.id===activeWinId&&!win.minimized ? '2px solid #8b5cf6' : '2px solid transparent',
                color:'rgba(255,255,255,0.85)',fontSize:12,fontFamily:SEG,
                opacity:win.minimized?0.5:1,
              }}
              onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,0.1)'}
              onMouseOut={e=>e.currentTarget.style.background='transparent'}>
              <span style={{fontSize:14}}>{typeof win.icon==='string'?win.icon:'📄'}</span>
              <span style={{maxWidth:80,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{win.title}</span>
            </button>
          ))}
        </div>
        {/* System tray */}
        <div style={{display:'flex',alignItems:'center',gap:2,paddingRight:4,marginLeft:'auto'}}>
          <div style={{display:'flex',alignItems:'center',gap:4,padding:'0 8px',height:40,cursor:'pointer',borderRadius:4}}
            onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,0.1)'}
            onMouseOut={e=>e.currentTarget.style.background='transparent'}>
            <span style={{color:'rgba(255,255,255,0.7)',fontSize:14}}>🔊</span>
            <span style={{color:'rgba(255,255,255,0.7)',fontSize:14}}>📶</span>
          </div>
          <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',justifyContent:'center',padding:'0 12px',height:48,cursor:'pointer',minWidth:72,borderRadius:4}}
            onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,0.1)'}
            onMouseOut={e=>e.currentTarget.style.background='transparent'}>
            <span style={{color:'white',fontSize:12,fontWeight:600,lineHeight:1}}>{clock}</span>
            <span style={{color:'rgba(255,255,255,0.5)',fontSize:10,lineHeight:1,marginTop:3}}>
              {new Date().toLocaleDateString('ru',{day:'2-digit',month:'2-digit',year:'numeric'})}
            </span>
          </div>
          <button style={{width:8,height:40,border:'none',background:'transparent',cursor:'pointer'}}
            onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,0.1)'}
            onMouseOut={e=>e.currentTarget.style.background='transparent'}/>
        </div>
      </div>

      {/* ══ TASK PANEL ══ */}
      {onFinish && (
        <div style={{position:'fixed',right:12,top:12,zIndex:160,width:240}}>
          <div style={{borderRadius:12,overflow:'hidden',boxShadow:'0 8px 32px rgba(0,0,0,0.5)',
            background:'rgba(15,10,30,0.85)',backdropFilter:'blur(12px)',border:'1px solid rgba(255,255,255,0.12)'}}>
            {/* Header */}
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 12px',borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
              <span style={{fontSize:10,fontWeight:900,color:'rgba(255,255,255,0.5)',textTransform:'uppercase',letterSpacing:'0.1em'}}>Задания</span>
              <span style={{fontSize:11,fontWeight:900,color:'#A3E635'}}>{taskIdx}/{TASKS.length}</span>
            </div>
            {/* Task */}
            <div style={{padding:'12px'}}>
              {done ? (
                <div style={{textAlign:'center',padding:'8px 0'}}>
                  <div style={{fontSize:32,marginBottom:4}}>🏆</div>
                  <div style={{fontWeight:900,color:'#A3E635',fontSize:13}}>Все выполнены!</div>
                  <div style={{fontSize:11,color:'rgba(255,255,255,0.4)',marginTop:4}}>Очки: {score}/130</div>
                </div>
              ) : (
                <>
                  <div style={{background:'rgba(139,92,246,0.2)',border:'1px solid rgba(139,92,246,0.3)',borderRadius:8,padding:'10px',marginBottom:8}}>
                    <p style={{fontSize:12,fontWeight:700,color:'white',lineHeight:1.4,margin:0}}>{currentTask?.text}</p>
                    <div style={{fontSize:10,color:'#c4b5fd',marginTop:4}}>+{currentTask?.points} очков</div>
                  </div>
                  {Array.from({length:hintIdx}).map((_,i) => (
                    <div key={i} style={{fontSize:10,color:'#fde047',background:'rgba(234,179,8,0.1)',borderRadius:6,padding:'6px 8px',marginBottom:4,lineHeight:1.4}}>
                      💡 {currentTask?.hints[i]}
                    </div>
                  ))}
                  {hintIdx < (currentTask?.hints.length||0) && (
                    <button onClick={()=>{setHintIdx(p=>p+1);setTotalHints(p=>p+1)}}
                      style={{width:'100%',fontSize:11,border:'1px solid rgba(255,255,255,0.2)',borderRadius:8,padding:'6px',color:'rgba(255,255,255,0.6)',background:'transparent',cursor:'pointer',fontFamily:SEG}}
                      onMouseOver={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,0.4)';e.currentTarget.style.color='white'}}
                      onMouseOut={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,0.2)';e.currentTarget.style.color='rgba(255,255,255,0.6)'}}>
                      💡 Подсказка ({hintIdx}/{currentTask?.hints.length})
                    </button>
                  )}
                </>
              )}
            </div>
            {/* Progress dots */}
            <div style={{display:'flex',gap:4,padding:'0 12px 8px',flexWrap:'wrap'}}>
              {TASKS.map((t,i) => (
                <div key={t.id} style={{height:6,borderRadius:3,transition:'all 0.3s',
                  background:completedTasks.includes(t.id)?'#A3E635':i===taskIdx?'#a78bfa':'rgba(255,255,255,0.2)',
                  width:completedTasks.includes(t.id)||i===taskIdx?16:8}}/>
              ))}
            </div>
            {/* Score */}
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 12px 12px'}}>
              <span style={{fontSize:11,color:'rgba(255,255,255,0.4)',fontWeight:600}}>Очков:</span>
              <span style={{fontSize:16,fontWeight:900,color:'#A3E635'}}>{score}</span>
            </div>
          </div>
          {/* Finish button */}
          {(done || taskIdx >= 5) && (
            <button onClick={()=>onFinish({score,hints:totalHints})}
              style={{width:'100%',marginTop:8,padding:'8px 0',background:'linear-gradient(135deg,#22c55e,#16a34a)',
                color:'white',border:'none',borderRadius:8,cursor:'pointer',fontSize:13,fontWeight:700,fontFamily:SEG}}
              onMouseOver={e=>e.currentTarget.style.filter='brightness(1.1)'}
              onMouseOut={e=>e.currentTarget.style.filter='brightness(1)'}>
              К тесту →
            </button>
          )}
        </div>
      )}

      {/* ══ NEW FOLDER MODAL ══ */}
      <AnimatePresence>
        {newFolderModal && (
          <motion.div key="modal" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            style={{position:'fixed',inset:0,zIndex:300,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.5)'}}>
            <motion.div initial={{scale:0.9,opacity:0}} animate={{scale:1,opacity:1}}
              onClick={e=>e.stopPropagation()}
              style={{background:'white',borderRadius:4,padding:24,width:320,boxShadow:'0 16px 60px rgba(0,0,0,0.5)',fontFamily:SEG}}>
              <h3 style={{fontSize:15,fontWeight:600,marginBottom:12,color:'#1a1a1a'}}>Создать новую папку</h3>
              <input autoFocus value={newFolderName} onChange={e=>setNewFolderName(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&confirmFolder()}
                placeholder="Новая папка"
                style={{width:'100%',border:'1px solid #c0c0c0',borderRadius:3,padding:'6px 10px',fontSize:13,outline:'none',marginBottom:16,boxSizing:'border-box'}}/>
              <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
                <button onClick={()=>setNewFolderModal(false)}
                  style={{padding:'6px 16px',border:'1px solid #c0c0c0',borderRadius:3,cursor:'pointer',background:'white',fontSize:13}}>
                  Отмена
                </button>
                <button onClick={confirmFolder}
                  style={{padding:'6px 16px',background:'#0078d4',color:'white',border:'none',borderRadius:3,cursor:'pointer',fontSize:13}}>
                  Создать
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ TOAST ══ */}
      <AnimatePresence>
        {toast && <Toast key="toast" msg={toast.msg} type={toast.type}/>}
      </AnimatePresence>
    </div>
  )
}
