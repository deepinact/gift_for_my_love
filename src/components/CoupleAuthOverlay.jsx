import React, { useState } from 'react'
import { Heart, Lock, UserPlus, LogIn, RefreshCw } from 'lucide-react'
import './CoupleAuthOverlay.css'

const initialFormState = {
  myUsername: '',
  partnerUsername: '',
  password: '',
  confirmPassword: ''
}

const CoupleAuthOverlay = ({ onAuthenticate, isLoading = false, errorMessage = '' }) => {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState(initialFormState)
  const [localError, setLocalError] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLocalError('')

    if (!form.myUsername.trim() || !form.partnerUsername.trim() || !form.password.trim()) {
      setLocalError('请填写完整信息，让我们知道是谁要一起旅行。')
      return
    }

    if (mode === 'register' && form.password.trim().length < 6) {
      setLocalError('为了安全起见，请设置至少 6 位数的密码。')
      return
    }

    if (mode === 'register' && form.password.trim() !== form.confirmPassword.trim()) {
      setLocalError('两次输入的密码不一致，请再确认一次。')
      return
    }

    if (form.myUsername.trim().toLowerCase() === form.partnerUsername.trim().toLowerCase()) {
      setLocalError('请输入两位不同旅伴的名字，这样我们才能把你们配对在一起。')
      return
    }

    try {
      const result = await onAuthenticate({
        mode,
        myUsername: form.myUsername.trim(),
        partnerUsername: form.partnerUsername.trim(),
        password: form.password.trim()
      })
      if (!result?.success) {
        setLocalError(result?.message || '操作未成功，请稍后再试。')
      }
    } catch (error) {
      setLocalError('操作未成功，请稍后再试。')
    }
  }

  const activeError = localError || errorMessage

  return (
    <div className="couple-auth-overlay">
      <div className="couple-auth-backdrop" />
      <div className="couple-auth-card">
        <div className="auth-header">
          <Heart size={24} />
          <h1>我们的旅行计划</h1>
          <p>登录共享空间，彼此随时查看对方的旅行灵感、计划和日记。</p>
        </div>

        <div className="auth-mode-switch">
          <button
            type="button"
            className={mode === 'login' ? 'active' : ''}
            onClick={() => {
              setMode('login')
              setForm(initialFormState)
              setLocalError('')
            }}
          >
            <LogIn size={16} /> 已有账号登录
          </button>
          <button
            type="button"
            className={mode === 'register' ? 'active' : ''}
            onClick={() => {
              setMode('register')
              setForm(initialFormState)
              setLocalError('')
            }}
          >
            <UserPlus size={16} /> 创建双人账号
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            <span>你的名字</span>
            <input
              name="myUsername"
              placeholder="请输入你的昵称"
              autoComplete="username"
              value={form.myUsername}
              onChange={handleChange}
              disabled={isLoading}
            />
          </label>

          <label className="auth-field">
            <span>另一位旅伴的名字</span>
            <input
              name="partnerUsername"
              placeholder="对方的昵称"
              autoComplete="off"
              value={form.partnerUsername}
              onChange={handleChange}
              disabled={isLoading}
            />
          </label>

          <label className="auth-field">
            <span>共享密码</span>
            <div className="auth-input-with-icon">
              <Lock size={16} />
              <input
                type="password"
                name="password"
                placeholder={mode === 'register' ? '设置一个专属密码' : '输入共享密码'}
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                value={form.password}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
          </label>

          {mode === 'register' && (
            <label className="auth-field">
              <span>再次确认密码</span>
              <input
                type="password"
                name="confirmPassword"
                placeholder="请再次输入密码"
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={handleChange}
                disabled={isLoading}
              />
            </label>
          )}

          {activeError && <p className="auth-error">{activeError}</p>}

          <button type="submit" className="auth-submit" disabled={isLoading}>
            {isLoading ? (
              <span className="auth-loading">
                <RefreshCw size={16} className="spin" />
                <span>处理中...</span>
              </span>
            ) : (
              <span>
                {mode === 'login' ? '进入我们的旅程' : '创建共享旅程'}
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default CoupleAuthOverlay
