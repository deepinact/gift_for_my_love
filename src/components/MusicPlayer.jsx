import React, { useRef, useEffect, useState } from 'react'
import { Play, Pause } from 'lucide-react'
import './MusicPlayer.css'
// 导入音乐文件
import musicFile from '../assets/music/Omnipotent_Youth_Society_2020.mp3'

const MUSIC_FILES = [
  musicFile,
  '/music/background-music.mp4',
  '/music/background-music.mp3',
  '/music/background-music.wav',
  '/music/background-music.ogg'
]

const MusicPlayer = () => {
  const audioRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasUserInteracted, setHasUserInteracted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const togglePlayPause = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
      return
    }

    audio
      .play()
      .then(() => {
        setIsPlaying(true)
        setHasUserInteracted(true)
      })
      .catch((error) => {
        console.log('Play failed:', error)
      })
  }

  const attemptAutoplay = () => {
    const audio = audioRef.current
    if (!audio || hasUserInteracted) return

    audio
      .play()
      .then(() => {
        console.log('Autoplay successful')
        setIsPlaying(true)
      })
      .catch((error) => {
        console.log('Autoplay prevented:', error)
        audio.volume = 0.1
        audio
          .play()
          .then(() => {
            console.log('Autoplay successful with low volume')
            setIsPlaying(true)
            audio.volume = 0.7
          })
          .catch(() => {
            console.log('All autoplay attempts failed')
          })
      })
  }

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return undefined

    const handleError = (event) => {
      console.error('Audio loading error:', event)
      console.log('Current file:', MUSIC_FILES[0])
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
      console.log('Music ended, restarting...')
      audio.currentTime = 0
      audio.play().catch((error) => {
        console.log('Restart play failed:', error)
      })
    }

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
    <div className="music-player" data-playing={isPlaying ? 'true' : 'false'}>
      <audio
        className="music-player-audio"
        ref={audioRef}
        src={MUSIC_FILES[0]}
        preload="auto"
        loop={false}
      />

      <button
        type="button"
        className="music-player-trigger"
        onClick={togglePlayPause}
        aria-pressed={isPlaying}
        aria-label={isPlaying ? '暂停背景音乐' : '播放背景音乐'}
      >
        <span className="music-player-copy">
          <span className="overlay-eyebrow">旅程旋律</span>
          <span className="music-player-state">{isPlaying ? '暂停音乐' : '播放音乐'}</span>
        </span>
        <span className="music-player-icon" aria-hidden="true">
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </span>
      </button>

      {!isPlaying && (
        <span className="music-player-hint">轻触播放，共享氛围</span>
      )}
    </div>
  )
}

export default MusicPlayer
