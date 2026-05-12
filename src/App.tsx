declare global {
  interface Window {
    electron: {
      resizeWindow: (height: number) => void
    }
  }
}

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Step {
  title: string
  explanation: string
  command: string
}

interface QueryResult {
  summary: string
  steps: Step[]
  source: string
  warning: string | null
}

export default function App() {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState<QueryResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState<number | null>(null)
  const [errorMode, setErrorMode] = useState(false)
  const [errorText, setErrorText] = useState('')
  const [aiStatus, setAiStatus] = useState<'gemini' | 'ollama' | 'offline'>('gemini')
  const inputRef = useRef<HTMLInputElement>(null)
  const errorRef = useRef<HTMLTextAreaElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    checkAiStatus()
  }, [])

  useEffect(() => {
    if (errorMode) errorRef.current?.focus()
  }, [errorMode])

  useEffect(() => {
    if (!containerRef.current) return
    const height = containerRef.current.scrollHeight + 64
    window.electron.resizeWindow(height)
  }, [result, errorMode])

  const checkAiStatus = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8765/status')
      const data = await res.json()
      setAiStatus(data.provider)
    } catch {
      setAiStatus('offline')
    }
  }

  const handleSubmit = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter' || !query.trim()) return
    await runQuery()
  }

  const runQuery = async () => {
    setLoading(true)
    setResult(null)
    setErrorMode(false)

    try {
      const res = await fetch('http://127.0.0.1:8765/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          error_context: errorText || null,
        }),
      })
      const data = await res.json()
      setResult(data)
      setErrorText('')
    } catch {
      setResult({
        summary: 'Could not reach backend',
        steps: [],
        source: 'error',
        warning: 'Make sure the Python backend is running.',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleErrorSubmit = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      await runQuery()
    }
  }

  const copyCommand = (command: string, index: number) => {
    navigator.clipboard.writeText(command)
    setCopied(index)
    setTimeout(() => setCopied(null), 2000)
  }

const statusLabel = {
  gemini: 'gemini connected',
  ollama: 'ollama local',
  offline: 'offline',
  cache: 'instant · cached',
  recipe: 'verified recipe',
}[aiStatus] ?? 'gemini connected'

const statusColor = {
  gemini: '#34c759',
  ollama: '#a78bfa',
  offline: '#ff3b30',
  cache: '#38bdf8',
  recipe: '#34c759',
}[aiStatus] ?? '#34c759'

  const sourceLabel = {
    official: '✓ Official source',
    community: '⚬ Community',
    ai: '✦ AI generated',
    error: '⚠ Error',
  }[result?.source ?? 'ai'] ?? '✦ AI generated'

  const sourceBg = {
    official: 'rgba(52,199,89,0.12)',
    community: 'rgba(255,255,255,0.08)',
    ai: 'rgba(167,139,250,0.12)',
    error: 'rgba(255,59,48,0.12)',
  }[result?.source ?? 'ai'] ?? 'rgba(167,139,250,0.12)'

  const sourceColor = {
    official: '#34c759',
    community: 'rgba(255,255,255,0.5)',
    ai: '#a78bfa',
    error: '#ff3b30',
  }[result?.source ?? 'ai'] ?? '#a78bfa'

  const sourceBorder = {
    official: 'rgba(52,199,89,0.25)',
    community: 'rgba(255,255,255,0.1)',
    ai: 'rgba(167,139,250,0.25)',
    error: 'rgba(255,59,48,0.25)',
  }[result?.source ?? 'ai'] ?? 'rgba(167,139,250,0.25)'

  return (
    <div ref={containerRef} style={{
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '0px 20px',
      paddingTop: '0px',
      background: 'transparent',
    }}>
      <motion.div
        initial={{ opacity: 0, y: -16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        style={{
          width: '100%',
          maxWidth: '640px',
          borderRadius: '20px',
          overflow: 'hidden',
          background: 'rgba(28, 28, 32, 0.97)',
          border: '0.5px solid rgba(255,255,255,0.1)',
          boxShadow: '0 40px 120px rgba(0,0,0,0.8), 0 0 0 0.5px rgba(255,255,255,0.05) inset',
        }}
      >
        {/* Search bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px 20px',
          borderBottom: '0.5px solid rgba(255,255,255,0.07)',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="rgba(255,255,255,0.3)" strokeWidth="2" style={{ flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleSubmit}
            placeholder="Ask anything Linux..."
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'rgba(255,255,255,0.88)',
              fontSize: '15px',
              width: '100%',
              fontFamily: 'Inter, sans-serif',
              caretColor: '#a78bfa',
            }}
          />
          {loading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
              style={{
                width: 15, height: 15, flexShrink: 0,
                border: '1.5px solid rgba(255,255,255,0.08)',
                borderTop: '1.5px solid #a78bfa',
                borderRadius: '50%',
              }}
            />
          ) : (
            <span style={{
              background: 'rgba(255,255,255,0.06)',
              border: '0.5px solid rgba(255,255,255,0.1)',
              borderRadius: '6px',
              color: 'rgba(255,255,255,0.25)',
              fontSize: '11px',
              padding: '3px 8px',
              fontFamily: 'Inter, sans-serif',
              flexShrink: 0,
            }}>esc</span>
          )}
        </div>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Source + summary */}
              <div style={{
                padding: '14px 20px 12px',
                borderBottom: '0.5px solid rgba(255,255,255,0.06)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '7px' }}>
                  <span style={{
                    background: sourceBg,
                    border: `0.5px solid ${sourceBorder}`,
                    borderRadius: '999px',
                    padding: '3px 10px',
                    fontSize: '11px',
                    color: sourceColor,
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                  }}>
                    {sourceLabel}
                  </span>
                </div>
                <p style={{
                  color: 'rgba(255,255,255,0.65)',
                  fontSize: '13px',
                  fontFamily: 'Inter, sans-serif',
                  margin: 0,
                  lineHeight: 1.6,
                }}>
                  {result.summary}
                </p>
              </div>

              {/* Warning */}
              {result.warning && (
                <div style={{
                  margin: '12px 20px 0',
                  borderRadius: '10px',
                  background: 'rgba(255,149,0,0.07)',
                  border: '0.5px solid rgba(255,149,0,0.2)',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                    stroke="#ff9500" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <span style={{
                    fontSize: '12px',
                    color: 'rgba(255,149,0,0.9)',
                    fontFamily: 'Inter, sans-serif',
                    lineHeight: 1.5,
                  }}>
                    {result.warning}
                  </span>
                </div>
              )}

              {/* Steps */}
              <div style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {result.steps.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.18 }}
                    style={{
                      borderRadius: '12px',
                      overflow: 'hidden',
                      border: '0.5px solid rgba(255,255,255,0.07)',
                      background: 'rgba(255,255,255,0.02)',
                    }}
                  >
                    <div style={{
                      padding: '12px 14px',
                      borderBottom: '0.5px solid rgba(255,255,255,0.06)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                        <span style={{
                          width: 20, height: 20,
                          borderRadius: '50%',
                          background: 'rgba(255,255,255,0.07)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '10px', fontWeight: 600,
                          color: 'rgba(255,255,255,0.4)',
                          fontFamily: 'Inter, sans-serif',
                          flexShrink: 0,
                        }}>
                          {i + 1}
                        </span>
                        <span style={{
                          fontSize: '13px',
                          fontWeight: 500,
                          color: 'rgba(255,255,255,0.85)',
                          fontFamily: 'Inter, sans-serif',
                        }}>
                          {step.title}
                        </span>
                      </div>
                      <p style={{
                        fontSize: '12px',
                        color: 'rgba(255,255,255,0.32)',
                        fontFamily: 'Inter, sans-serif',
                        margin: '0 0 0 28px',
                        lineHeight: 1.55,
                      }}>
                        {step.explanation}
                      </p>
                    </div>

                    {/* Command row */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      background: 'rgba(0,0,0,0.22)',
                    }}>
                      <code style={{
                        fontSize: '13px',
                        color: '#7dd3a8',
                        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                        flex: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        letterSpacing: '-0.01em',
                      }}>
                        {step.command}
                      </code>
                      <motion.button
                        whileTap={{ scale: 0.94 }}
                        onClick={() => copyCommand(step.command, i)}
                        style={{
                          background: copied === i ? 'rgba(52,199,89,0.12)' : 'rgba(255,255,255,0.06)',
                          border: `0.5px solid ${copied === i ? 'rgba(52,199,89,0.3)' : 'rgba(255,255,255,0.1)'}`,
                          borderRadius: '7px',
                          color: copied === i ? '#34c759' : 'rgba(255,255,255,0.4)',
                          fontSize: '11px',
                          padding: '5px 12px',
                          cursor: 'pointer',
                          marginLeft: '12px',
                          flexShrink: 0,
                          fontFamily: 'Inter, sans-serif',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          transition: 'all 0.15s',
                        }}
                      >
                        {copied === i ? (
                          <>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                            Copied
                          </>
                        ) : (
                          <>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="9" y="9" width="13" height="13" rx="2"/>
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                            </svg>
                            Copy
                          </>
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Error context section */}
              <div style={{ padding: '0 20px 14px' }}>
                {!errorMode ? (
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setErrorMode(true)}
                    style={{
                      width: '100%',
                      background: 'rgba(255,149,0,0.06)',
                      border: '0.5px solid rgba(255,149,0,0.18)',
                      borderRadius: '10px',
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      cursor: 'pointer',
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                      stroke="#ff9500" strokeWidth="2" style={{ flexShrink: 0 }}>
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="12"/>
                      <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <span style={{
                      fontSize: '12px',
                      color: 'rgba(255,149,0,0.8)',
                      fontFamily: 'Inter, sans-serif',
                      flex: 1,
                      textAlign: 'left',
                    }}>
                      Hit an error? Paste it here and I'll fix the steps.
                    </span>
                    <span style={{
                      fontSize: '11px',
                      color: 'rgba(255,255,255,0.2)',
                      fontFamily: 'Inter, sans-serif',
                      background: 'rgba(255,255,255,0.06)',
                      borderRadius: '5px',
                      padding: '2px 7px',
                    }}>E</span>
                  </motion.button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    style={{
                      background: 'rgba(255,149,0,0.05)',
                      border: '0.5px solid rgba(255,149,0,0.2)',
                      borderRadius: '10px',
                      overflow: 'hidden',
                    }}
                  >
                    <textarea
                      ref={errorRef}
                      value={errorText}
                      onChange={e => setErrorText(e.target.value)}
                      onKeyDown={handleErrorSubmit}
                      placeholder="Paste your error here, then press Enter..."
                      rows={3}
                      style={{
                        width: '100%',
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        color: 'rgba(255,149,0,0.9)',
                        fontSize: '12px',
                        fontFamily: "'JetBrains Mono', monospace",
                        padding: '12px 14px',
                        resize: 'none',
                        boxSizing: 'border-box',
                        lineHeight: 1.6,
                      }}
                    />
                    <div style={{
                      padding: '8px 14px',
                      borderTop: '0.5px solid rgba(255,149,0,0.15)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                      <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', fontFamily: 'Inter, sans-serif' }}>
                        ↵ to retry • esc to cancel
                      </span>
                      <button
                        onClick={() => setErrorMode(false)}
                        style={{
                          background: 'none', border: 'none',
                          color: 'rgba(255,255,255,0.25)',
                          fontSize: '11px', cursor: 'pointer',
                          fontFamily: 'Inter, sans-serif',
                        }}
                      >
                        cancel
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div style={{
          padding: '10px 20px 14px',
          borderTop: result ? '0.5px solid rgba(255,255,255,0.05)' : 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{
            fontSize: '11px',
            color: 'rgba(255,255,255,0.18)',
            fontFamily: 'Inter, sans-serif',
          }}>
            {result ? '↵ new query' : 'Type a Linux question and press Enter'}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              width: 6, height: 6,
              borderRadius: '50%',
              background: statusColor,
              display: 'inline-block',
            }} />
            <span style={{
              fontSize: '11px',
              color: 'rgba(255,255,255,0.18)',
              fontFamily: 'Inter, sans-serif',
            }}>
              {statusLabel}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}