import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/* ─── Initial state ─── */
const INIT_FILES = [
  { id:'photo',    name:'photo.png',     icon:'🖼️', ext:'png',  loc:'desktop' },
  { id:'music',    name:'music.mp3',     icon:'🎵', ext:'mp3',  loc:'desktop' },
  { id:'homework', name:'homework.docx', icon:'📝', ext:'docx', loc:'desktop' },
  { id:'old',      name:'old.txt',       icon:'📄', ext:'txt',  loc:'desktop' },
]
const INIT_FOLDERS = [
  { id:'docs',    name:'Документы', icon:'📁' },
  { id:'photos',  name:'Фото',      icon:'📁' },
  { id:'music-f', name:'Музыка',    icon:'📁' },
]

/* ─── Tasks ─── */
const TASKS = [
  {
    id:'click-docs',
    text:'Нажми на папку «Документы»',
    hints:['Папки выглядят как жёлтые 📁','Найди «Документы» на рабочем столе','Просто кликни на иконку 📁 Документы'],
    points:10,
    check:(a) => a.type==='click-folder' && a.id==='docs',
  },
  {
    id:'open-photos',
    text:'Открой папку «Фото» (двойной клик)',
    hints:['Двойной клик — два быстрых нажатия','Найди папку «Фото»','Дважды кликни на 📁 Фото'],
    points:10,
    check:(a) => a.type==='open-folder' && a.id==='photos',
  },
  {
    id:'drag-photo',
    text:'Перетащи «photo.png» в папку «Фото»',
    hints:['Удержи кнопку мыши на файле, потяни к папке','photo.png — иконка 🖼️','Потяни 🖼️ photo.png на папку 📁 Фото'],
    points:15,
    check:(a) => a.type==='drop-folder' && a.fileId==='photo' && a.folderId==='photos',
  },
  {
    id:'drag-music',
    text:'Перетащи «music.mp3» в папку «Музыка»',
    hints:['Нажми, удержи, потяни, отпусти','music.mp3 — иконка 🎵','Потяни 🎵 music.mp3 на 📁 Музыка'],
    points:15,
    check:(a) => a.type==='drop-folder' && a.fileId==='music' && a.folderId==='music-f',
  },
  {
    id:'drag-homework',
    text:'Перетащи «homework.docx» в папку «Документы»',
    hints:['Все .docx — это документы','homework.docx — иконка 📝','Потяни 📝 homework.docx на 📁 Документы'],
    points:15,
    check:(a) => a.type==='drop-folder' && a.fileId==='homework' && a.folderId==='docs',
  },
  {
    id:'drag-trash',
    text:'Перетащи «old.txt» в Корзину',
    hints:['Корзина — иконка 🗑️ внизу рабочего стола','Найди файл old.txt','Потяни 📄 old.txt на 🗑️ Корзина'],
    points:15,
    check:(a) => a.type==='drop-trash' && a.fileId==='old',
  },
  {
    id:'restore-file',
    text:'Открой Корзину и восстанови «old.txt»',
    hints:['Дважды кликни на 🗑️ Корзина','В корзине найди old.txt','Нажми кнопку «Восстановить»'],
    points:15,
    check:(a) => a.type==='restore' && a.fileId==='old',
  },
  {
    id:'create-folder',
    text:'Нажми правой кнопкой мыши и создай папку',
    hints:['Правая кнопка мыши по пустому месту','В меню выбери «Создать папку»','Правый клик → «Создать папку»'],
    points:15,
    check:(a) => a.type==='create-folder',
  },
  {
    id:'ctrl-c',
    text:'Выбери «homework.docx» и нажми Ctrl+C',
    hints:['Сначала нажми на файл homework.docx','Когда выбран — удержи Ctrl и нажми C','Клик на 📝 homework.docx → Ctrl+C'],
    points:10,
    check:(a) => a.type==='copy' && a.fileId==='homework',
  },
  {
    id:'ctrl-s',
    text:'Нажми Ctrl+S чтобы сохранить прогресс',
    hints:['Ctrl+S — это горячая клавиша сохранения','Удержи Ctrl и нажми S','Ctrl + S на клавиатуре'],
    points:10,
    check:(a) => a.type==='save',
  },
]

/* ─── Main Component ─── */
export default function PracticeSimulator({ name, onFinish }) {
  const [files, setFiles]             = useState(INIT_FILES)
  const [folders]                     = useState(INIT_FOLDERS)
  const [customFolders, setCustomFolders] = useState([])
  const [trash, setTrash]             = useState([])
  const [selected, setSelected]       = useState(null)
  const [clipboard, setClipboard]     = useState(null)
  const [openWindow, setOpenWindow]   = useState(null) // {type:'folder'|'trash', id?}
  const [ctxMenu, setCtxMenu]         = useState(null) // {x,y,target:'desktop'|fileId}
  const [taskIdx, setTaskIdx]         = useState(0)
  const [completedTasks, setCompletedTasks] = useState([])
  const [hintIdx, setHintIdx]         = useState(0)
  const [totalHints, setTotalHints]   = useState(0)
  const [totalScore, setTotalScore]   = useState(0)
  const [dragItem, setDragItem]       = useState(null)
  const [dropTarget, setDropTarget]   = useState(null)
  const [toast, setToast]             = useState(null)
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const desktopRef = useRef(null)

  const currentTask = TASKS[taskIdx]
  const done = taskIdx >= TASKS.length

  /* ── dispatch action → check task ── */
  const dispatch = useCallback((action) => {
    if (done) return
    const task = TASKS[taskIdx]
    if (task && task.check(action)) {
      setCompletedTasks(p => [...p, task.id])
      setTotalScore(p => p + task.points)
      showToast(`✅ ${task.text} — Готово! +${task.points} очков`, 'success')
      setTaskIdx(p => p + 1)
      setHintIdx(0)
    }
  }, [taskIdx, done])

  /* ── keyboard shortcuts ── */
  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 's') { e.preventDefault(); dispatch({ type:'save' }); showToast('💾 Прогресс сохранён!') }
        if (e.key === 'c' && selected) { e.preventDefault(); setClipboard({ fileId: selected }); dispatch({ type:'copy', fileId: selected }); showToast('📋 Скопировано!') }
        if (e.key === 'v' && clipboard) { e.preventDefault(); showToast('📌 Вставлено!') }
        if (e.key === 'z') { e.preventDefault(); showToast('↩️ Действие отменено') }
        if (e.key === 'a') { e.preventDefault(); showToast('✳️ Всё выделено') }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [selected, clipboard, dispatch])

  /* ── close context menu on click ── */
  useEffect(() => {
    const close = () => setCtxMenu(null)
    window.addEventListener('click', close)
    return () => window.removeEventListener('click', close)
  }, [])

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2500)
  }

  /* ── drag and drop ── */
  const onDragStart = (e, fileId) => {
    e.dataTransfer.setData('text/plain', fileId)
    setDragItem(fileId)
  }
  const onDragEnd = () => { setDragItem(null); setDropTarget(null) }

  const onDropToFolder = (e, folderId) => {
    e.preventDefault()
    const fileId = e.dataTransfer.getData('text/plain')
    setDropTarget(null); setDragItem(null)
    if (!fileId) return
    setFiles(prev => prev.map(f => f.id === fileId ? { ...f, loc: folderId } : f))
    dispatch({ type:'drop-folder', fileId, folderId })
    showToast(`📁 Файл перемещён в папку!`)
  }

  const onDropToTrash = (e) => {
    e.preventDefault()
    const fileId = e.dataTransfer.getData('text/plain')
    setDropTarget(null); setDragItem(null)
    if (!fileId) return
    const file = files.find(f => f.id === fileId)
    if (!file) return
    setFiles(prev => prev.filter(f => f.id !== fileId))
    setTrash(prev => [...prev, file])
    dispatch({ type:'drop-trash', fileId })
    showToast('🗑️ Файл удалён в корзину')
  }

  const restoreFile = (fileId) => {
    const file = trash.find(f => f.id === fileId)
    if (!file) return
    setTrash(prev => prev.filter(f => f.id !== fileId))
    setFiles(prev => [...prev, { ...file, loc:'desktop' }])
    dispatch({ type:'restore', fileId })
  }

  const clickFolder = (id) => {
    dispatch({ type:'click-folder', id })
  }

  const openFolder = (id) => {
    dispatch({ type:'open-folder', id })
    setOpenWindow({ type:'folder', id })
  }

  const openTrash = () => {
    setOpenWindow({ type:'trash' })
  }

  const handleRightClick = (e, target = 'desktop') => {
    e.preventDefault()
    setCtxMenu({ x: e.clientX, y: e.clientY, target })
  }

  const handleCreateFolder = (e) => {
    e.stopPropagation()
    setCtxMenu(null)
    setNewFolderName('')
    setShowNewFolder(true)
  }

  const confirmNewFolder = () => {
    const n = newFolderName.trim() || 'Новая папка'
    setCustomFolders(prev => [...prev, { id: `cf-${Date.now()}`, name: n, icon:'📁' }])
    setShowNewFolder(false)
    dispatch({ type:'create-folder', name: n })
  }

  const useHint = () => {
    if (!currentTask) return
    const next = Math.min(hintIdx + 1, currentTask.hints.length)
    setHintIdx(next)
    setTotalHints(p => p + 1)
  }

  /* ── derive display items ── */
  const desktopFiles    = files.filter(f => f.loc === 'desktop')
  const allFolders      = [...folders, ...customFolders]

  const getFolderFiles  = (fid) => files.filter(f => f.loc === fid)

  const openedFolder    = openWindow?.type === 'folder'
    ? allFolders.find(f => f.id === openWindow.id)
    : null

  return (
    <div className="min-h-screen pt-16 pb-4 flex flex-col">
      <div className="flex-1 flex gap-3 px-3 max-w-7xl mx-auto w-full">

        {/* ── Desktop ── */}
        <div className="flex-1 flex flex-col gap-3">
          {/* Desktop area */}
          <div
            ref={desktopRef}
            className="flex-1 relative bg-[#1e3a5f] rounded-2xl overflow-hidden border border-white/10 min-h-[420px]"
            onContextMenu={(e) => handleRightClick(e, 'desktop')}
            onClick={() => { setSelected(null); setCtxMenu(null) }}
          >
            {/* Desktop label */}
            <div className="absolute top-2 left-3 text-xs text-white/30 font-bold select-none">Рабочий стол</div>

            {/* Files grid */}
            <div className="pt-8 pb-16 px-4 flex flex-wrap gap-2 content-start">
              {desktopFiles.map(file => (
                <FileIcon key={file.id} file={file}
                  selected={selected === file.id}
                  dragging={dragItem === file.id}
                  onSelect={(id) => { setSelected(id); }}
                  onDragStart={onDragStart}
                  onDragEnd={onDragEnd}
                  onContextMenu={(e) => { e.stopPropagation(); handleRightClick(e, file.id) }}
                />
              ))}
              {customFolders.map(f => (
                <FolderIcon key={f.id} folder={f} isOver={dropTarget === f.id}
                  onSingleClick={() => clickFolder(f.id)}
                  onDoubleClick={() => openFolder(f.id)}
                  onDragOver={(e) => { e.preventDefault(); setDropTarget(f.id) }}
                  onDragLeave={() => setDropTarget(null)}
                  onDrop={(e) => onDropToFolder(e, f.id)}
                />
              ))}
            </div>

            {/* Folders row */}
            <div className="absolute bottom-10 left-0 right-0 flex gap-3 px-4">
              {folders.map(f => (
                <FolderIcon key={f.id} folder={f} isOver={dropTarget === f.id}
                  fileCount={getFolderFiles(f.id).length}
                  onSingleClick={() => clickFolder(f.id)}
                  onDoubleClick={() => openFolder(f.id)}
                  onDragOver={(e) => { e.preventDefault(); setDropTarget(f.id) }}
                  onDragLeave={() => setDropTarget(null)}
                  onDrop={(e) => onDropToFolder(e, f.id)}
                />
              ))}
            </div>

            {/* Taskbar */}
            <div className="absolute bottom-0 left-0 right-0 h-10 bg-black/50 backdrop-blur flex items-center px-3 gap-3">
              <span className="text-xs text-white/60 font-bold">⊞ Пуск</span>
              <div className="flex-1" />
              <button
                className={`flex flex-col items-center cursor-pointer transition-all ${dropTarget==='trash' ? 'scale-125' : ''}`}
                onClick={openTrash}
                onDragOver={(e) => { e.preventDefault(); setDropTarget('trash') }}
                onDragLeave={() => setDropTarget(null)}
                onDrop={onDropToTrash}
              >
                <span className={`text-xl leading-none ${dropTarget==='trash' ? 'text-red-400' : trash.length ? 'opacity-80' : ''}`}>
                  {trash.length ? '🗑️' : '🗑️'}
                </span>
                <span className="text-[9px] text-white/50 font-bold">Корзина{trash.length ? ` (${trash.length})` : ''}</span>
              </button>
              <span className="text-xs text-white/40 font-mono">
                {new Date().toLocaleTimeString('ru', {hour:'2-digit',minute:'2-digit'})}
              </span>
            </div>
          </div>

          {/* Folder / Trash window */}
          <AnimatePresence>
            {openWindow && (
              <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:10}}
                className="bg-[#1a1a2e] border border-white/10 rounded-2xl overflow-hidden">
                {/* Window titlebar */}
                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border-b border-white/10">
                  <div className="flex gap-1.5">
                    <button onClick={() => setOpenWindow(null)}
                      className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <span className="text-xs font-bold text-gray-300 ml-2">
                    {openWindow.type === 'trash' ? '🗑️ Корзина' : `📁 ${openedFolder?.name}`}
                  </span>
                </div>
                {/* Window content */}
                <div className="p-4 min-h-[100px]">
                  {openWindow.type === 'trash' ? (
                    trash.length === 0 ? (
                      <p className="text-gray-500 text-sm font-semibold">Корзина пуста</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {trash.map(f => (
                          <div key={f.id} className="flex flex-col items-center gap-1 bg-white/5 rounded-xl p-2">
                            <span className="text-2xl">{f.icon}</span>
                            <span className="text-xs text-gray-400 font-semibold">{f.name}</span>
                            <button className="text-[10px] bg-[#A3E635] text-black font-black rounded-lg px-2 py-0.5 mt-1"
                              onClick={() => restoreFile(f.id)}>
                              Восстановить
                            </button>
                          </div>
                        ))}
                      </div>
                    )
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {getFolderFiles(openWindow.id).length === 0 ? (
                        <p className="text-gray-500 text-sm font-semibold">Папка пуста</p>
                      ) : (
                        getFolderFiles(openWindow.id).map(f => (
                          <div key={f.id} className="flex flex-col items-center gap-1 bg-white/5 rounded-xl p-2">
                            <span className="text-2xl">{f.icon}</span>
                            <span className="text-xs text-gray-400 font-semibold">{f.name}</span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Task Panel ── */}
        <div className="w-64 flex flex-col gap-3">
          {/* Current task */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Задание</span>
              <span className="text-xs font-black text-[#A3E635]">{taskIdx}/{TASKS.length}</span>
            </div>
            {done ? (
              <div className="text-center py-4">
                <div className="text-4xl mb-2">🏆</div>
                <div className="font-black text-[#A3E635]">Все задания выполнены!</div>
                <div className="text-sm text-gray-400 mt-1">Очки: {totalScore}/130</div>
              </div>
            ) : (
              <>
                <div className="bg-purple-500/15 border border-purple-500/30 rounded-xl p-3 mb-3">
                  <p className="text-sm font-bold text-white leading-snug">{currentTask?.text}</p>
                  <div className="text-xs text-purple-300 mt-1 font-semibold">+{currentTask?.points} очков</div>
                </div>

                {/* Hints */}
                {hintIdx > 0 && (
                  <div className="space-y-1 mb-3">
                    {currentTask?.hints.slice(0, hintIdx).map((h, i) => (
                      <div key={i} className="text-xs text-yellow-300 font-semibold bg-yellow-500/10 rounded-lg px-2 py-1.5">
                        💡 {h}
                      </div>
                    ))}
                  </div>
                )}

                {hintIdx < (currentTask?.hints.length || 0) && (
                  <button className="btn-outline w-full text-sm py-2" onClick={useHint}>
                    💡 Подсказка ({hintIdx}/{currentTask?.hints.length})
                  </button>
                )}
              </>
            )}
          </div>

          {/* Progress */}
          <div className="card p-4">
            <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Прогресс</div>
            <div className="space-y-1">
              {TASKS.map((t, i) => (
                <div key={t.id} className={`flex items-center gap-2 text-xs font-semibold rounded-lg px-2 py-1
                  ${completedTasks.includes(t.id) ? 'text-[#A3E635] bg-[#A3E635]/10' :
                    i === taskIdx ? 'text-purple-300 bg-purple-500/15' : 'text-gray-600'}`}>
                  {completedTasks.includes(t.id) ? '✓' : i === taskIdx ? '▶' : '○'}
                  <span className="truncate">{t.text.slice(0, 28)}…</span>
                </div>
              ))}
            </div>
          </div>

          {/* Score */}
          <div className="card p-3 text-center">
            <div className="text-2xl font-black text-[#A3E635]">{totalScore}</div>
            <div className="text-xs text-gray-400 font-bold">/ 130 очков</div>
          </div>

          {/* Finish button */}
          {(done || taskIdx >= 5) && (
            <button className="btn-green" onClick={() => onFinish({ score: totalScore, hints: totalHints })}>
              К тесту →
            </button>
          )}
        </div>
      </div>

      {/* ── Context Menu ── */}
      {ctxMenu && (
        <div
          style={{ left: ctxMenu.x, top: ctxMenu.y }}
          className="fixed z-50 bg-gray-900 border border-gray-600 rounded-xl shadow-2xl py-1 min-w-[180px]"
          onClick={e => e.stopPropagation()}
        >
          <button className="w-full text-left px-4 py-2 text-sm font-bold text-white hover:bg-purple-500/30 transition-colors flex items-center gap-2"
            onClick={handleCreateFolder}>
            📁 Создать папку
          </button>
          <div className="px-4 py-2 text-sm text-gray-500 font-semibold flex items-center gap-2 cursor-default">
            📄 Создать документ
          </div>
          <div className="border-t border-white/10 mx-2 my-1" />
          {clipboard && (
            <div className="px-4 py-2 text-sm text-gray-400 font-semibold flex items-center gap-2 cursor-default">
              📋 Вставить
            </div>
          )}
          <div className="px-4 py-2 text-sm text-gray-500 font-semibold flex items-center gap-2 cursor-default">
            🔄 Обновить
          </div>
        </div>
      )}

      {/* ── New folder modal ── */}
      {showNewFolder && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="card p-5 w-full max-w-xs pop">
            <h3 className="font-black text-white mb-3">Введи имя папки</h3>
            <input
              autoFocus
              value={newFolderName}
              onChange={e => setNewFolderName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && confirmNewFolder()}
              placeholder="Новая папка"
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white font-bold outline-none focus:border-purple-400 mb-3"
            />
            <div className="flex gap-2">
              <button className="btn-green flex-1" onClick={confirmNewFolder}>Создать</button>
              <button className="btn-outline flex-1" onClick={() => setShowNewFolder(false)}>Отмена</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{opacity:0, y:40}} animate={{opacity:1, y:0}} exit={{opacity:0, y:40}}
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl
              font-bold text-sm shadow-2xl
              ${toast.type === 'success' ? 'bg-[#A3E635] text-black' : 'bg-gray-800 text-white border border-white/20'}`}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── File icon component ── */
function FileIcon({ file, selected, dragging, onSelect, onDragStart, onDragEnd, onContextMenu }) {
  return (
    <div
      draggable
      onClick={(e) => { e.stopPropagation(); onSelect(file.id) }}
      onDragStart={(e) => onDragStart(e, file.id)}
      onDragEnd={onDragEnd}
      onContextMenu={onContextMenu}
      className={`flex flex-col items-center gap-1 p-2 rounded-xl cursor-grab active:cursor-grabbing
        transition-all select-none w-16
        ${dragging ? 'opacity-40' : ''}
        ${selected ? 'selected-item' : 'hover:bg-white/10'}`}
    >
      <span className="text-3xl">{file.icon}</span>
      <span className="text-xs font-bold text-center text-gray-300 leading-tight w-full truncate">
        {file.name}
      </span>
    </div>
  )
}

/* ── Folder icon component ── */
function FolderIcon({ folder, isOver, fileCount, onSingleClick, onDoubleClick, onDragOver, onDragLeave, onDrop }) {
  const [clicks, setClicks]   = useState(0)
  const timerRef              = useRef(null)

  const handleClick = () => {
    const next = clicks + 1
    setClicks(next)
    clearTimeout(timerRef.current)
    if (next >= 2) { setClicks(0); onDoubleClick() }
    else {
      timerRef.current = setTimeout(() => { setClicks(0); onSingleClick() }, 280)
    }
  }

  return (
    <div
      onClick={handleClick}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`flex flex-col items-center gap-1 p-2 rounded-xl cursor-pointer transition-all select-none w-16
        ${isOver ? 'drop-highlight scale-110' : 'hover:bg-white/10'}`}
    >
      <span className="text-3xl">{folder.icon}</span>
      <span className="text-xs font-bold text-center text-gray-300 leading-tight truncate w-full">
        {folder.name}
      </span>
      {fileCount > 0 && (
        <span className="text-[9px] bg-purple-500 text-white rounded-full px-1 font-black -mt-0.5">
          {fileCount}
        </span>
      )}
    </div>
  )
}
