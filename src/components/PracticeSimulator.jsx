import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Win10Sandbox from './Win10Sandbox'

const BASE = import.meta.env.BASE_URL

/* ══════════════════════════════════════════
   BOOT SCREEN — Windows 10 style
══════════════════════════════════════════ */
function BootScreen({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000)
    return () => clearTimeout(t)
  }, [onDone])

  // 5 spinning dots like Windows 10
  const DOTS = 5
  return (
    <div style={{
      position:'fixed', inset:0, background:'#000',
      display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center',
      zIndex:9999,
    }}>
      {/* Windows logo */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}>
        <svg width="80" height="80" viewBox="0 0 24 24">
          <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" fill="#ffffff"/>
        </svg>
      </motion.div>

      {/* Spinning dots */}
      <div style={{ marginTop: 56, display:'flex', gap:12 }}>
        {Array.from({ length: DOTS }).map((_, i) => (
          <motion.div
            key={i}
            style={{ width:10, height:10, borderRadius:'50%', background:'white' }}
            animate={{ opacity: [0.15, 1, 0.15] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.18,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════
   PRACTICE SIMULATOR — entry point
══════════════════════════════════════════ */
export default function PracticeSimulator({ name, onFinish }) {
  const [booted, setBooted] = useState(false)

  return (
    <>
      <AnimatePresence>
        {!booted && (
          <motion.div key="boot"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}>
            <BootScreen onDone={() => setBooted(true)} />
          </motion.div>
        )}
      </AnimatePresence>

      {booted && (
        <Win10Sandbox name={name} onFinish={onFinish} />
      )}
    </>
  )
}
