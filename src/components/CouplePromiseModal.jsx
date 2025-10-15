import React, { useEffect, useState } from 'react'
import { X, HeartHandshake } from 'lucide-react'
import './CouplePromiseModal.css'

const CouplePromiseModal = ({ promise, onClose, onSave, onRemove }) => {
  const [mantra, setMantra] = useState('')
  const [ritual, setRitual] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    setMantra(promise?.mantra || '')
    setRitual(promise?.ritual || '')
    setError('')
  }, [promise])

  const handleSubmit = (event) => {
    event.preventDefault()
    const nextMantra = mantra.trim()
    const nextRitual = ritual.trim()

    if (!nextMantra && !nextRitual) {
      setError('请至少写下一句宣言或一个下一步约定。')
      return
    }

    if (onSave) {
      onSave({ mantra: nextMantra, ritual: nextRitual })
    }
  }

  const handleClear = () => {
    if (onRemove) {
      onRemove()
    } else if (onSave) {
      onSave({ mantra: '', ritual: '' })
    }
  }

  return (
    <div className="promise-modal" role="dialog" aria-modal="true">
      <button
        type="button"
        className="promise-backdrop"
        onClick={onClose}
        aria-label="关闭旅程约定弹窗"
      />
      <div className="promise-panel">
        <header className="promise-panel-header">
          <div className="promise-panel-title">
            <HeartHandshake size={20} />
            <div>
              <h2>旅程约定</h2>
              <p>写下一句你们的约定，让彼此的步伐保持同步。</p>
            </div>
          </div>
          <button type="button" className="promise-close" onClick={onClose} aria-label="关闭">
            <X size={18} />
          </button>
        </header>

        <form className="promise-form" onSubmit={handleSubmit}>
          <label>
            <span>我们的旅程宣言</span>
            <input
              type="text"
              value={mantra}
              onChange={(event) => setMantra(event.target.value)}
              placeholder="例：无论世界多大，我们一起慢慢走完。"
              maxLength={120}
            />
          </label>

          <label>
            <span>下一步想做的事情</span>
            <textarea
              value={ritual}
              onChange={(event) => setRitual(event.target.value)}
              placeholder="例：下次旅行前写封手写信给彼此。"
              rows={3}
              maxLength={240}
            />
          </label>

          {error && <p className="promise-error">{error}</p>}

          <div className="promise-actions">
            <button type="button" className="promise-secondary" onClick={handleClear}>
              清空约定
            </button>
            <button type="submit" className="promise-primary">
              保存约定
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CouplePromiseModal
