import React, { useRef, useEffect, useState } from 'react'
import { Play, Pause } from 'lucide-react'
// 导入音乐文件
import musicFile from '../assets/music/Omnipotent_Youth_Society_2020.mp3'

const MusicPlayer = () => {
  const audioRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasUserInteracted, setHasUserInteracted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // 支持的音乐文件列表 - 按优先级排序
  const musicFiles = [
    musicFile, // 使用导入的音乐文件
    '/music/background-music.mp4',
    '/music/background-music.mp3',
    '/music/background-music.wav',
    '/music/background-music.ogg'
  ]

  const togglePlayPause = () => {
    const audio = audioRef.current
    if (audio) {
      if (isPlaying) {
        audio.pause()
        setIsPlaying(false)
      } else {
        audio.play().then(() => {
          setIsPlaying(true)
          setHasUserInteracted(true)
        }).catch(err => {
          console.log('Play failed:', err)
        })
      }
    }
  }

  // 尝试自动播放的函数
  const attemptAutoplay = () => {
    const audio = audioRef.current
    if (audio && !hasUserInteracted) {
      audio.play().then(() => {
        console.log('Autoplay successful')
        setIsPlaying(true)
      }).catch(err => {
        console.log('Autoplay prevented:', err)
        // 尝试降低音量后再次播放
        audio.volume = 0.1
        audio.play().then(() => {
          console.log('Autoplay successful with low volume')
          setIsPlaying(true)
          audio.volume = 0.7
        }).catch(() => {
          console.log('All autoplay attempts failed')
        })
      })
    }
  }

  useEffect(() => {
    const audio = audioRef.current
    if (audio) {
      const handleError = (e) => {
        console.error('Audio loading error:', e)
        console.log('Current file:', musicFiles[0])
      }
      
      const handleCanPlay = () => {
        console.log('Audio can play, attempting autoplay...')
        attemptAutoplay()
      }
      
      const handlePlay = () => {
        setIsPlaying(true)
      }
      
      const handlePause = () => {
        setIsPlaying(false)
      }
      
      const handleEnded = () => {
        // 音乐结束时自动重新开始播放（循环播放）
        console.log('Music ended, restarting...')
        audio.currentTime = 0
        audio.play().catch(err => {
          console.log('Restart play failed:', err)
        })
      }
      
      // 添加用户交互监听器来启用自动播放
      const enableAutoplay = () => {
        setHasUserInteracted(true)
        attemptAutoplay()
        document.removeEventListener('click', enableAutoplay)
        document.removeEventListener('touchstart', enableAutoplay)
        document.removeEventListener('keydown', enableAutoplay)
      }
      
      audio.addEventListener('canplay', handleCanPlay)
      audio.addEventListener('play', handlePlay)
      audio.addEventListener('pause', handlePause)
      audio.addEventListener('ended', handleEnded)
      audio.addEventListener('error', handleError)
      
      // 监听用户交互来启用自动播放
      document.addEventListener('click', enableAutoplay)
      document.addEventListener('touchstart', enableAutoplay)
      document.addEventListener('keydown', enableAutoplay)
      
      return () => {
        audio.removeEventListener('canplay', handleCanPlay)
        audio.removeEventListener('play', handlePlay)
        audio.removeEventListener('pause', handlePause)
        audio.removeEventListener('ended', handleEnded)
        audio.removeEventListener('error', handleError)
        document.removeEventListener('click', enableAutoplay)
        document.removeEventListener('touchstart', enableAutoplay)
        document.removeEventListener('keydown', enableAutoplay)
      }
    }
  }, [hasUserInteracted])

  useEffect(() => {
    const updateIsMobile = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.matchMedia('(max-width: 768px)').matches)
      }
    }

    updateIsMobile()

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', updateIsMobile)
      return () => window.removeEventListener('resize', updateIsMobile)
    }

    return undefined
  }, [])

  return (
    <>
      {/* 隐藏的音频元素 */}
      <div style={{ display: 'none' }}>
        <audio
          ref={audioRef}
          src={musicFiles[0]}
          preload="auto"
          loop={false}
        />
      </div>
      
      {/* 协调的播放控制按钮 - 位于右下角 */}
      <div
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px'
        }}
      >
        <button
          onClick={togglePlayPause}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '18px',
            border: '1px solid rgba(148, 163, 184, 0.35)',
            background: isPlaying
              ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
              : 'rgba(248, 250, 252, 0.9)',
            color: isPlaying ? 'white' : '#1f2937',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: isPlaying
              ? '0 18px 36px rgba(99, 102, 241, 0.35)'
              : '0 16px 32px rgba(15, 23, 42, 0.18)',
            transition: 'all 0.2s ease',
            fontSize: '18px',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.05)'
            e.target.style.boxShadow = isPlaying
              ? '0 22px 42px rgba(99, 102, 241, 0.4)'
              : '0 20px 36px rgba(15, 23, 42, 0.24)'
            e.target.style.borderColor = 'rgba(99, 102, 241, 0.45)'
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)'
            e.target.style.boxShadow = isPlaying
              ? '0 18px 36px rgba(99, 102, 241, 0.35)'
              : '0 16px 32px rgba(15, 23, 42, 0.18)'
            e.target.style.borderColor = 'rgba(148, 163, 184, 0.35)'
          }}
          onMouseDown={(e) => {
            e.target.style.transform = 'scale(0.95)'
          }}
          onMouseUp={(e) => {
            e.target.style.transform = 'scale(1.05)'
          }}
          title={isPlaying ? '暂停背景音乐' : '播放背景音乐'}
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>
        
        {/* 简洁的提示文字 */}
        {!isPlaying && (
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.72)',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '14px',
              fontSize: '11px',
              fontWeight: '500',
              letterSpacing: '0.04em',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid rgba(148, 163, 184, 0.35)',
              boxShadow: '0 16px 32px rgba(15, 23, 42, 0.22)',
              animation: 'fadeInOut 3s ease-in-out infinite'
            }}
          >
            播放音乐
          </div>
        )}
      </div>
      
      {/* 添加CSS动画 */}
      <style jsx>{`
        @keyframes fadeInOut {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
      `}</style>
    </>
  )
}

export default MusicPlayer