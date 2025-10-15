import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import { Icon } from 'leaflet'
import { destinations, categories } from './data/destinations'
import Sidebar from './components/Sidebar'
import AddDestinationModal from './components/AddDestinationModal'
import DestinationModal from './components/DestinationModal'
import MusicPlayer from './components/MusicPlayer'
import CoupleAuthOverlay from './components/CoupleAuthOverlay'
import CouplePromiseModal from './components/CouplePromiseModal'
import './App.css'

const parseMonthRanges = (text) => {
  if (!text) return []
  const matches = text.match(/\d{1,2}/g)
  if (!matches) return []

  const values = matches
    .map((value) => {
      const monthNumber = Number.parseInt(value, 10)
      if (Number.isNaN(monthNumber)) return null
      if (monthNumber < 1 || monthNumber > 12) return null
      return monthNumber
    })
    .filter((value) => value !== null)

  if (!values.length) return []

  const ranges = []
  for (let index = 0; index < values.length; index += 2) {
    const start = values[index]
    if (typeof start !== 'number') continue
    let end = values[index + 1]
    if (typeof end !== 'number') {
      end = start
    }
    ranges.push({ start, end })
  }
  return ranges
}

const isMonthInRange = (month, range) => {
  if (!range || typeof range.start !== 'number' || typeof range.end !== 'number') {
    return false
  }
  if (range.start <= range.end) {
    return month >= range.start && month <= range.end
  }
  return month >= range.start || month <= range.end
}

const isGoodSeasonNow = (bestTime, month) => {
  const ranges = parseMonthRanges(bestTime)
  if (!ranges.length) return false
  return ranges.some((range) => isMonthInRange(month, range))
}

const ACCOUNTS_KEY = 'couple_accounts_v1'
const ACTIVE_SESSION_KEY = 'couple_active_session_v1'

const normalizeName = (value) => {
  if (typeof value !== 'string') return ''
  return value.trim().toLowerCase()
}

const clonePlans = (plans) => {
  if (!Array.isArray(plans)) return []
  return plans.map((plan) => ({ ...plan }))
}

const cloneDestinationsList = (list) =>
  list.map((destination) => ({
    ...destination,
    plans: clonePlans(destination.plans)
  }))

// 自定义缩放控件组件
const CustomZoomControl = () => {
  const map = useMap()

  const zoomIn = () => {
    map.zoomIn()
  }

  const zoomOut = () => {
    map.zoomOut()
  }

  return (
    <div className="custom-zoom-control">
      <button 
        className="zoom-btn zoom-in"
        onClick={zoomIn}
        title="放大"
      >
        +
      </button>
      <button 
        className="zoom-btn zoom-out"
        onClick={zoomOut}
        title="缩小"
      >
        −
      </button>
    </div>
  )
}

// 美观的地图标记图标 - 平衡大小和美观
const customIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyQzIgMTcuNTIgNi40OCAyMiAxMiAyMkMxNy41MiAyMiAyMiAxNy41MiAyMiAxMkMyMiA2LjQ4IDE3LjUyIDIgMTIgMloiIGZpbGw9IiM2NjdFRUEiLz4KPHBhdGggZD0iTTEyIDE2QzE0LjIwOTEgMTYgMTYgMTQuMjA5MSAxNiAxMkMxNiA5Ljc5MDg2IDE0LjIwOTEgOCAxMiA4QzkuNzkwODYgOCA4IDkuNzkwODYgOCAxMkM4IDE0LjIwOTEgOS43OTA4NiAxNiAxMiAxNloiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=',
  iconSize: [24, 24], // 适中的图标尺寸
  iconAnchor: [12, 24],
  popupAnchor: [0, -24]
})

const visitedIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyQzIgMTcuNTIgNi40OCAyMiAxMiAyMkMxNy41MiAyMiAyMiAxNy41MiAyMiAxMkMyMiA2LjQ4IDE3LjUyIDIgMTIgMloiIGZpbGw9IiM0Q0Y1OTkiLz4KPHBhdGggZD0iTTEwIDE2LjE3TDE2LjU5IDkuNTlMMTggMTEuMDFMMTAgMTkuMDFMNiAxNUwxLjQxIDE5LjU5TDIuODMgMjFMMTAgMTYuMTdaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K',
  iconSize: [24, 24], // 适中的图标尺寸
  iconAnchor: [12, 24],
  popupAnchor: [0, -24]
})

function App() {
  const [session, setSession] = useState(null)
  const [isAuthReady, setIsAuthReady] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [authGlobalError, setAuthGlobalError] = useState('')
  const [pinnedAchievements, setPinnedAchievements] = useState([])
  const [connectionProgress, setConnectionProgress] = useState({})
  const [selectedDestination, setSelectedDestination] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [destinationsData, setDestinationsData] = useState(() => cloneDestinationsList(destinations))
  const [selectedCategory, setSelectedCategory] = useState('全部')
  const [searchTerm, setSearchTerm] = useState('')
  const [showVisited, setShowVisited] = useState(false)
  const [showWishlist, setShowWishlist] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [sharedPromise, setSharedPromise] = useState(null)
  const [showPromiseModal, setShowPromiseModal] = useState(false)
  const [showMapInsights, setShowMapInsights] = useState(false)

  const activeStorageKey = useMemo(() => (session ? session.storageKey : null), [session])

  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const accountsRaw = localStorage.getItem(ACCOUNTS_KEY)
      let accounts = []
      if (accountsRaw) {
        try {
          const parsed = JSON.parse(accountsRaw)
          if (Array.isArray(parsed)) {
            accounts = parsed
          }
        } catch {}
      }

      const activeRaw = localStorage.getItem(ACTIVE_SESSION_KEY)
      if (activeRaw) {
        try {
          const active = JSON.parse(activeRaw)
          if (active?.accountId) {
            const account = accounts.find((item) => item.id === active.accountId)
            if (account) {
              const members = Array.isArray(account.members) ? account.members : []
              const activeMember = members.find((member) => member.normalized === active.activeMember) || members[0]
              const partnerMember = members.find((member) => member.normalized !== activeMember?.normalized) || members[1] || members[0]
              if (activeMember) {
                setSession({
                  accountId: account.id,
                  myUsername: activeMember.displayName,
                  partnerUsername: partnerMember?.displayName || activeMember.displayName,
                  members: members.length ? members.map((member) => member.displayName) : undefined,
                  storageKey: account.storageKey
                })
              }
            }
          }
        } catch {}
      }
    } catch (error) {
      console.warn('读取账号信息失败', error)
    } finally {
      setIsAuthReady(true)
    }
  }, [])

  useEffect(() => {
    if (!session) {
      setDestinationsData(cloneDestinationsList(destinations))
      setPinnedAchievements([])
      setConnectionProgress({})
      setSharedPromise(null)
      setShowPromiseModal(false)
      setShowMapInsights(false)
      return
    }

    if (typeof window === 'undefined') return

    let nextData = cloneDestinationsList(destinations)
    try {
      const stored = localStorage.getItem(`${session.storageKey}_destinations_state`)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length) {
          nextData = cloneDestinationsList(parsed)
        }
      } else {
        const legacy = localStorage.getItem('custom_destinations')
        if (legacy) {
          try {
            const legacyParsed = JSON.parse(legacy)
            if (Array.isArray(legacyParsed) && legacyParsed.length) {
              nextData = cloneDestinationsList([...destinations, ...legacyParsed])
            }
          } catch {}
        }
      }
    } catch (error) {
      console.warn('加载目的地数据失败', error)
      nextData = cloneDestinationsList(destinations)
    }

    setDestinationsData(nextData)

    try {
      const savedPinsRaw = localStorage.getItem(`${session.storageKey}_pinned_achievements`)
      if (savedPinsRaw) {
        const parsedPins = JSON.parse(savedPinsRaw)
        if (Array.isArray(parsedPins)) {
          setPinnedAchievements(parsedPins)
        } else {
          setPinnedAchievements([])
        }
      } else {
        setPinnedAchievements([])
      }
    } catch {
      setPinnedAchievements([])
    }

    try {
      const savedConnectionRaw = localStorage.getItem(`${session.storageKey}_connection_prompts`)
      if (savedConnectionRaw) {
        const parsed = JSON.parse(savedConnectionRaw)
        if (parsed && typeof parsed === 'object') {
          setConnectionProgress(parsed)
        } else {
          setConnectionProgress({})
        }
      } else {
        setConnectionProgress({})
      }
    } catch {
      setConnectionProgress({})
    }

    try {
      const savedPromiseRaw = localStorage.getItem(`${session.storageKey}_shared_promise`)
      if (savedPromiseRaw) {
        const parsedPromise = JSON.parse(savedPromiseRaw)
        if (parsedPromise && typeof parsedPromise === 'object') {
          setSharedPromise({
            mantra: parsedPromise.mantra || '',
            ritual: parsedPromise.ritual || '',
            savedAt: parsedPromise.savedAt || null
          })
        } else {
          setSharedPromise(null)
        }
      } else {
        setSharedPromise(null)
      }
    } catch {
      setSharedPromise(null)
    }
  }, [session])

  useEffect(() => {
    if (!session || !activeStorageKey) return
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(`${activeStorageKey}_destinations_state`, JSON.stringify(destinationsData))
    } catch (error) {
      console.warn('保存目的地数据失败', error)
    }
  }, [activeStorageKey, destinationsData, session])

  useEffect(() => {
    if (!session || !activeStorageKey) return
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(`${activeStorageKey}_pinned_achievements`, JSON.stringify(pinnedAchievements))
    } catch (error) {
      console.warn('保存奖章收藏失败', error)
    }
  }, [activeStorageKey, pinnedAchievements, session])

  useEffect(() => {
    if (!session || !activeStorageKey) return
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(`${activeStorageKey}_connection_prompts`, JSON.stringify(connectionProgress))
    } catch (error) {
      console.warn('保存心动互动状态失败', error)
    }
  }, [activeStorageKey, connectionProgress, session])

  useEffect(() => {
    if (!session || !activeStorageKey) return
    if (typeof window === 'undefined') return

    try {
      if (!sharedPromise || (!sharedPromise.mantra && !sharedPromise.ritual)) {
        localStorage.removeItem(`${activeStorageKey}_shared_promise`)
      } else {
        localStorage.setItem(`${activeStorageKey}_shared_promise`, JSON.stringify(sharedPromise))
      }
    } catch (error) {
      console.warn('保存旅程约定失败', error)
    }
  }, [activeStorageKey, session, sharedPromise])

  useEffect(() => {
    setSelectedDestination(null)
    setShowModal(false)
    setShowAddModal(false)
  }, [session])

  useEffect(() => {
    if (!showMapInsights) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setShowMapInsights(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [showMapInsights])

  const baseDestinationIdSet = useMemo(() => new Set(destinations.map(dest => dest.id)), [])

  // 使用useMemo优化过滤逻辑
  const filteredDestinationsMemo = useMemo(() => {
    let filtered = destinationsData

    if (selectedCategory !== '全部') {
      filtered = filtered.filter(dest => dest.category === selectedCategory)
    }

    if (searchTerm) {
      filtered = filtered.filter(dest => 
        dest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dest.country.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // 愿望清单筛选逻辑：勾选时只显示愿望清单，不勾选时显示所有
    if (showWishlist) {
      filtered = filtered.filter(dest => dest.wishlist)
    }

    // 已访问筛选逻辑：勾选时只显示已访问，不勾选时显示所有
    if (showVisited) {
      filtered = filtered.filter(dest => dest.visited)
    }

    return filtered
  }, [destinationsData, selectedCategory, searchTerm, showVisited, showWishlist])

  const totalPlansCount = useMemo(() => {
    return destinationsData.reduce((sum, destination) => {
      if (!Array.isArray(destination.plans)) return sum
      return sum + destination.plans.length
    }, 0)
  }, [destinationsData])

  const sharedPlanNotesCount = useMemo(() => {
    return destinationsData.reduce((sum, destination) => {
      if (!Array.isArray(destination.plans)) return sum
      const noted = destination.plans.filter((plan) => {
        return [plan.notes, plan.description, plan.activities]
          .some((field) => typeof field === 'string' && field.trim().length > 0)
      })
      return sum + noted.length
    }, 0)
  }, [destinationsData])

  const engagedCategoryCount = useMemo(() => {
    const categorySet = new Set()
    destinationsData.forEach((destination) => {
      if (!destination?.category) return
      const hasEngagement = destination.visited || destination.wishlist || (Array.isArray(destination.plans) && destination.plans.length > 0)
      if (hasEngagement) {
        categorySet.add(destination.category)
      }
    })
    return categorySet.size
  }, [destinationsData])

  const customDestinationsCount = useMemo(() => {
    return destinationsData.filter((destination) => !baseDestinationIdSet.has(destination.id)).length
  }, [baseDestinationIdSet, destinationsData])

  // 使用useCallback优化事件处理函数
  const handleMarkerClick = useCallback((destination) => {
    setSelectedDestination(destination)
    setShowModal(true)
  }, [])

  // 处理侧边栏目的地点击
  const handleSidebarDestinationClick = useCallback((destination) => {
    setSelectedDestination(destination)
    setShowModal(true)
  }, [])

  const handleUpdateDestination = useCallback((updatedDestination) => {
    setDestinationsData(prevDestinations =>
      prevDestinations.map(dest =>
        dest.id === updatedDestination.id
          ? { ...updatedDestination, plans: clonePlans(updatedDestination.plans) }
          : dest
      )
    )

    setSelectedDestination(prev =>
      prev && prev.id === updatedDestination.id
        ? { ...updatedDestination, plans: clonePlans(updatedDestination.plans) }
        : prev
    )

    setShowModal(false)
  }, [])

  // 新增目的地
  const handleAddDestination = useCallback((payload) => {
    if (!session) return

    const nextId = Math.max(...destinationsData.map(d => d.id), 0) + 1
    const newDestination = {
      id: nextId,
      createdAt: new Date().toISOString(),
      createdBy: session.myUsername,
      sharedWith: session.partnerUsername,
      ...payload,
      plans: clonePlans(payload.plans)
    }
    setDestinationsData(prev => [newDestination, ...prev])
    setShowAddModal(false)
    setSelectedDestination(newDestination)
    setShowModal(true)
  }, [destinationsData, session])

  const handleAuthenticate = useCallback(async ({ mode, myUsername, partnerUsername, password }) => {
    if (typeof window === 'undefined') {
      return { success: false, message: '当前环境暂不支持登录。' }
    }

    if (authLoading) {
      return { success: false }
    }

    setAuthLoading(true)
    setAuthGlobalError('')

    try {
      let accounts = []
      try {
        const raw = localStorage.getItem(ACCOUNTS_KEY)
        if (raw) {
          const parsed = JSON.parse(raw)
          if (Array.isArray(parsed)) {
            accounts = parsed
          }
        }
      } catch {}

      const normalizedMy = normalizeName(myUsername)
      const normalizedPartner = normalizeName(partnerUsername)
      const pairKey = [normalizedMy, normalizedPartner].sort().join('__')

      if (!normalizedMy || !normalizedPartner) {
        return { success: false, message: '请填写旅伴的名字。' }
      }

      if (mode === 'register' && password.length < 6) {
        return { success: false, message: '密码至少需要 6 位字符。' }
      }

      let account = accounts.find((item) => item.storageKey === pairKey)

      if (mode === 'register') {
        if (account) {
          return { success: false, message: '这个组合已经创建过共享账号啦，可以直接登录。' }
        }

        account = {
          id: `acc_${Date.now()}`,
          storageKey: pairKey,
          members: [
            { displayName: myUsername, normalized: normalizedMy },
            { displayName: partnerUsername, normalized: normalizedPartner }
          ],
          password,
          createdAt: new Date().toISOString()
        }
        accounts = [...accounts, account]
        localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
      } else {
        if (!account) {
          return { success: false, message: '未找到对应的双人账号，请确认彼此的昵称。' }
        }

        if (account.password !== password) {
          return { success: false, message: '密码不正确，请再试一次。' }
        }
      }

      const members = Array.isArray(account.members) ? account.members : []
      const selfMember = members.find((member) => member.normalized === normalizedMy) || {
        displayName: myUsername,
        normalized: normalizedMy
      }
      const partnerMember = members.find((member) => member.normalized === normalizedPartner) || {
        displayName: partnerUsername,
        normalized: normalizedPartner
      }

      if (!members.length) {
        account.members = [selfMember, partnerMember]
        const nextAccounts = accounts.map((item) => (item.id === account.id ? account : item))
        localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(nextAccounts))
      }

      localStorage.setItem(
        ACTIVE_SESSION_KEY,
        JSON.stringify({ accountId: account.id, activeMember: selfMember.normalized })
      )

      setSession({
        accountId: account.id,
        myUsername: selfMember.displayName,
        partnerUsername: partnerMember.displayName,
        members: (account.members || [selfMember, partnerMember]).map((member) => member.displayName),
        storageKey: account.storageKey
      })
      setAuthGlobalError('')

      return { success: true }
    } catch (error) {
      console.warn('账号操作失败', error)
      const message = '暂时无法处理请求，请稍后再试。'
      setAuthGlobalError(message)
      return { success: false, message }
    } finally {
      setAuthLoading(false)
    }
  }, [authLoading])

  const handleLogout = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(ACTIVE_SESSION_KEY)
      } catch {}
    }
    setSession(null)
    setPinnedAchievements([])
    setSelectedDestination(null)
    setShowModal(false)
    setShowAddModal(false)
    setSharedPromise(null)
    setShowPromiseModal(false)
    setAuthGlobalError('')
  }, [])

  const handleSavePromise = useCallback(({ mantra, ritual }) => {
    const nextMantra = (mantra || '').trim()
    const nextRitual = (ritual || '').trim()

    if (!nextMantra && !nextRitual) {
      setSharedPromise(null)
      setShowPromiseModal(false)
      return
    }

    setSharedPromise({
      mantra: nextMantra,
      ritual: nextRitual,
      savedAt: new Date().toISOString()
    })
    setShowPromiseModal(false)
  }, [])

  const handleRemovePromise = useCallback(() => {
    setSharedPromise(null)
    setShowPromiseModal(false)
  }, [])

  const toggleAchievementPin = useCallback((achievementId) => {
    setPinnedAchievements((prev) => {
      if (prev.includes(achievementId)) {
        return prev.filter((id) => id !== achievementId)
      }
      const next = [...prev, achievementId]
      if (next.length > 6) {
        next.shift()
      }
      return next
    })
  }, [])

  const toggleConnectionPrompt = useCallback((promptId) => {
    setConnectionProgress((prev) => {
      const next = { ...prev }
      if (next[promptId]) {
        delete next[promptId]
      } else {
        next[promptId] = true
      }
      return next
    })
  }, [])

  // 使用useMemo优化统计数据
  const stats = useMemo(() => {
    const visitedCount = destinationsData.filter(dest => dest.visited).length
    const wishlistCount = destinationsData.filter(dest => dest.wishlist).length
    const plannedCount = destinationsData.filter(dest => Array.isArray(dest.plans) && dest.plans.length > 0).length
    const noteRichCount = destinationsData.filter(dest => dest.notes && dest.notes.trim().length > 0).length
    const total = destinationsData.length
    const progress = total ? Math.round((visitedCount / total) * 100) : 0
    return { visitedCount, wishlistCount, plannedCount, noteRichCount, total, progress }
  }, [destinationsData])

  const dailyMood = useMemo(() => {
    const moodList = [
      {
        title: '海风恋人',
        message: '想象一下在柔软沙滩上看星星，让心意被海浪轻轻诉说。',
        tip: '挑一个海岛，写下你想和TA做的第一件事。'
      },
      {
        title: '城市心跳',
        message: '夜幕下的霓虹和咖啡香气，是属于两人的都市烟火。',
        tip: '在愿望清单里添加一个想尝试的城市体验。'
      },
      {
        title: '山谷耳语',
        message: '去山谷里听风吹过树林，感受世界最温柔的回声。',
        tip: '选择一个徒步目的地，计划一个慢节奏的清晨。'
      },
      {
        title: '文化漫步',
        message: '在博物馆或古街散步，让爱情在时光中慢慢生长。',
        tip: '挑一座城市，搜集三件想看的艺术珍藏。'
      },
      {
        title: '浪漫列车',
        message: '坐上一列开往未知的列车，把每个窗外风景都存成纪念。',
        tip: '在计划里加入一段长途列车或公路旅程。'
      }
    ]
    const todayKey = new Date().toISOString().slice(0, 10)
    const seed = todayKey.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return moodList[seed % moodList.length]
  }, [])

  const seasonalHighlights = useMemo(() => {
    const month = new Date().getMonth() + 1
    const matches = destinationsData.filter((destination) =>
      isGoodSeasonNow(destination.bestTime, month)
    )
    const scored = matches
      .map((destination) => {
        const wishlistScore = destination.wishlist ? 2 : 0
        const planScore = Array.isArray(destination.plans) && destination.plans.length > 0 ? 1 : 0
        const visitedPenalty = destination.visited ? -1 : 0
        const score = wishlistScore + planScore + visitedPenalty
        return { destination, score }
      })
      .sort((a, b) => b.score - a.score)

    return scored.slice(0, 3).map((item) => item.destination)
  }, [destinationsData])

  const wishlistSpotlights = useMemo(() => {
    const wishlistOnly = destinationsData.filter((destination) => destination.wishlist && !destination.visited)
    const sorted = wishlistOnly
      .map((destination) => {
        const planScore = Array.isArray(destination.plans) ? destination.plans.length : 0
        return { destination, score: planScore }
      })
      .sort((a, b) => b.score - a.score)
    return sorted.slice(0, 3).map((item) => item.destination)
  }, [destinationsData])

  const memoryLane = useMemo(() => {
    const visitedWithNotes = destinationsData.filter(
      (destination) => destination.visited && destination.notes && destination.notes.trim().length > 0
    )
    return visitedWithNotes.slice(0, 3)
  }, [destinationsData])

  const upcomingPlans = useMemo(() => {
    const planEntries = []
    destinationsData.forEach((destination) => {
      if (!Array.isArray(destination.plans)) return
      destination.plans.forEach((plan) => {
        if (!plan) return
        const timestamp = plan.date ? Date.parse(plan.date) : Number.NaN
        planEntries.push({
          ...plan,
          destinationName: destination.name,
          destinationId: destination.id,
          timestamp
        })
      })
    })

    const validPlans = planEntries.filter((plan) => !Number.isNaN(plan.timestamp))
    validPlans.sort((a, b) => a.timestamp - b.timestamp)

    const fallbackPlans = planEntries.filter((plan) => Number.isNaN(plan.timestamp))
    const combined = [...validPlans, ...fallbackPlans]
    return combined.slice(0, 4)
  }, [destinationsData])

  const travelAchievements = useMemo(() => {
    const achievementBlueprints = [
      {
        id: 'duo-signed-in',
        title: '心意同步',
        description: '双人账号成功登录，开启共享旅程空间。',
        current: session ? 1 : 0,
        target: 1,
        reward: '解锁共享旅行日志与同步计划。'
      },
      {
        id: 'first-dream',
        title: '旅行起步',
        description: '已经收藏了第一个心动目的地。',
        current: Math.min(stats.wishlistCount, 1),
        target: 1,
        reward: '获得第一颗心愿徽章。'
      },
      {
        id: 'wishlist-collector',
        title: '梦想收藏家',
        description: '愿望清单里拥有 10 个目的地。',
        current: stats.wishlistCount,
        target: 10,
        reward: '灵感面板解锁特别推荐槽位。'
      },
      {
        id: 'footprint-explorer',
        title: '足迹拓荒者',
        description: '标记 3 个已访问的地方，留下爱的足迹。',
        current: stats.visitedCount,
        target: 3,
        reward: '旅程路线将拥有星光轨迹。'
      },
      {
        id: 'plan-master',
        title: '规划大师',
        description: '为至少 5 个旅行计划写下细节。',
        current: totalPlansCount,
        target: 5,
        reward: '行程卡片可自定义主题色。'
      },
      {
        id: 'story-keeper',
        title: '回忆保管员',
        description: '在目的地备注里写下 3 段旅行心情。',
        current: stats.noteRichCount,
        target: 3,
        reward: '回忆胶囊开启柔光滤镜。'
      },
      {
        id: 'category-explorer',
        title: '风格冒险家',
        description: '走过或计划 4 种不同风格的旅程。',
        current: engagedCategoryCount,
        target: 4,
        reward: '地图支持多彩类别徽标。'
      },
      {
        id: 'custom-dreamer',
        title: '梦想设计师',
        description: '添加 3 个属于你们的自定义目的地。',
        current: customDestinationsCount,
        target: 3,
        reward: '自定义目的地卡片可添加专属背景。'
      },
      {
        id: 'shared-journalist',
        title: '共写日记',
        description: '在旅行计划中记录 4 条行程备注或活动安排。',
        current: sharedPlanNotesCount,
        target: 4,
        reward: '行程计划可以添加情侣贴纸。'
      }
    ]

    return achievementBlueprints.map((achievement) => {
      const progressValue = achievement.target > 0
        ? Math.min(1, achievement.current / achievement.target)
        : achievement.current > 0 ? 1 : 0
      return {
        ...achievement,
        achieved: progressValue >= 1,
        progress: progressValue,
        progressPercent: Math.round(progressValue * 100),
        status:
          progressValue >= 1
            ? 'completed'
            : achievement.current > 0
              ? 'in-progress'
              : 'locked',
        pinned: pinnedAchievements.includes(achievement.id)
      }
    })
  }, [customDestinationsCount, engagedCategoryCount, pinnedAchievements, session, sharedPlanNotesCount, stats, totalPlansCount])

  useEffect(() => {
    if (!session) return
    setPinnedAchievements((prev) => {
      const valid = prev.filter((id) => travelAchievements.some((achievement) => achievement.id === id))
      if (valid.length === prev.length) {
        return prev
      }
      return valid
    })
  }, [session, travelAchievements])

  const baseConnectionPrompts = useMemo(() => {
    if (!session) return []

    const partnerName = session.partnerUsername || '旅伴'
    const highlight = seasonalHighlights[0]
    const wish = wishlistSpotlights[0]
    const memory = memoryLane[0]
    const nextPlan = upcomingPlans[0]

    const prompts = [
      {
        id: 'share-wish',
        title: '心愿交换',
        description: `各自挑一个愿望清单里的地点，告诉彼此为什么想去那里，并在备注里写下对方的心动理由。`,
        microCopy: '互相分享一个愿望地，并记录对方的理由。'
      },
      {
        id: 'map-toast',
        title: '地图庆祝',
        description: `在地图上放大已访问的任意地点，重温一段回忆，并新增一句彼此想说的话。`,
        microCopy: '挑一个已访问地点，写下一句新的祝福。',
        disabled: stats.visitedCount === 0
      },
      {
        id: 'memory-quiz',
        title: '回忆问答',
        description: memory
          ? `回忆一下在「${memory.name}」最打动你的一幕，将答案写进目的地备注，共同留下甜蜜答案。`
          : '回想最近的旅行，用一句话记录彼此最难忘的瞬间。',
        microCopy: memory
          ? `为「${memory.name}」写下一句新的记忆。`
          : '写下你们最近旅程里最难忘的瞬间。'
      },
      {
        id: 'next-surprise',
        title: '下一站惊喜',
        description: nextPlan
          ? `围绕「${nextPlan.destinationName}」计划一个小惊喜，并把它添加进行程备注中，保留神秘感。`
          : '挑一个想去的地方，约定一个惊喜环节并记录在行程备注里。',
        microCopy: nextPlan
          ? `为「${nextPlan.destinationName}」准备一个小惊喜。`
          : '为下一段旅程约定一个惊喜。'
      },
      {
        id: 'seasonal-stroll',
        title: '当季想象',
        description: highlight
          ? `想象和${partnerName}一同走在「${highlight.name}」的最佳季节，互相描述想做的第一件事。`
          : `互相挑选一处目的地，描述到达后想做的第一件事，让画面先在心里发生。`,
        microCopy: highlight
          ? `聊聊去「${highlight.name}」时最想做的第一件事。`
          : '描述抵达心仪目的地时最想做的第一件事。'
      },
      {
        id: 'wish-keeper',
        title: '心愿守护',
        description: wish
          ? `为「${wish.name}」写下一段互相鼓励的话，提醒彼此一定要去实现这段旅程。`
          : '挑一个心愿地，写下一段互相鼓励的话，让它成为旅程的动力。',
        microCopy: wish
          ? `为「${wish.name}」写下一段互相鼓励的话。`
          : '为一个心愿地写下互相鼓励的话。'
      }
    ]

    return prompts.filter((prompt) => !prompt.disabled)
  }, [memoryLane, upcomingPlans, seasonalHighlights, session, stats.visitedCount, wishlistSpotlights])

  useEffect(() => {
    if (!session) return
    setConnectionProgress((prev) => {
      const validIds = new Set(baseConnectionPrompts.map((prompt) => prompt.id))
      const filtered = Object.keys(prev).reduce((acc, key) => {
        if (validIds.has(key)) {
          acc[key] = true
        }
        return acc
      }, {})
      if (Object.keys(filtered).length === Object.keys(prev).length) {
        return prev
      }
      return filtered
    })
  }, [baseConnectionPrompts, session])

  const connectionPrompts = useMemo(() => {
    return baseConnectionPrompts.map((prompt) => ({
      ...prompt,
      completed: Boolean(connectionProgress[prompt.id])
    }))
  }, [baseConnectionPrompts, connectionProgress])

  const connectionHighlights = useMemo(() => connectionPrompts.slice(0, 2), [connectionPrompts])

  const visitedPath = useMemo(() => {
    const visited = destinationsData.filter((destination) => destination.visited)
    return visited.map((destination) => destination.coordinates)
  }, [destinationsData])

  // 简化的弹窗内容
  const renderPopupContent = useCallback((destination) => (
    <div className="custom-popup">
      <h3>{destination.name}</h3>
      <p><strong>国家:</strong> {destination.country}</p>
      <p><strong>类型:</strong> {destination.category}</p>
      {destination.bestTime && (
        <p><strong>最佳时间:</strong> {destination.bestTime}</p>
      )}
      <button
        className="btn-primary"
        onClick={() => handleMarkerClick(destination)}
      >
        查看详情
      </button>
    </div>
  ), [handleMarkerClick])

  const heroHighlight = seasonalHighlights[0] || wishlistSpotlights[0] || null
  const bondNudge = connectionPrompts.find((prompt) => !prompt.completed) || connectionPrompts[0] || null

  if (!isAuthReady) {
    return null
  }

  if (!session) {
    return (
      <div className="app auth-only">
        <CoupleAuthOverlay
          onAuthenticate={handleAuthenticate}
          isLoading={authLoading}
          errorMessage={authGlobalError}
        />
      </div>
    )
  }

  return (
    <div className="app">
      <Sidebar
        destinations={filteredDestinationsMemo}
        allDestinations={destinationsData}
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        showVisited={showVisited}
        setShowVisited={setShowVisited}
        showWishlist={showWishlist}
        setShowWishlist={setShowWishlist}
        stats={stats}
        seasonalHighlights={seasonalHighlights}
        wishlistSpotlights={wishlistSpotlights}
        upcomingPlans={upcomingPlans}
        achievements={travelAchievements}
        memoryLane={memoryLane}
        dailyMood={dailyMood}
        onDestinationClick={handleSidebarDestinationClick}
        onAddDestination={() => setShowAddModal(true)}
        session={session}
        pinnedAchievements={pinnedAchievements}
        onToggleAchievementPin={toggleAchievementPin}
        connectionPrompts={connectionPrompts}
        connectionHighlights={connectionHighlights}
        onToggleConnectionPrompt={toggleConnectionPrompt}
        sharedPromise={sharedPromise}
        onEditPromise={() => setShowPromiseModal(true)}
        onLogout={handleLogout}
      />

      <div className="map-container">
        <div className="map-stage">
          <MapContainer
            className="map-canvas"
            center={[20, 0]}
            zoom={2}
            // 适中的性能优化
            preferCanvas={true}
            zoomControl={false} // 禁用默认的左上角缩放控件
            attributionControl={false}
            doubleClickZoom={false}
            boxZoom={false}
            keyboard={false}
            wheelPxPerZoomLevel={120}
            touchZoom={true}
            fadeAnimation={false}
            zoomAnimation={false}
          >
            {/* 自定义右侧缩放控件 */}
            <CustomZoomControl />
            {/* 主要地图源 */}
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              maxZoom={14}
              minZoom={2}
              updateWhenZooming={false}
              updateWhenIdle={true}
              tileSize={256}
              keepBuffer={2}
            />

            {/* 备用地图源1 - 如果主要源失败 */}
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              maxZoom={14}
              minZoom={2}
              updateWhenZooming={false}
              updateWhenIdle={true}
              tileSize={256}
              keepBuffer={2}
              opacity={0.8}
              zIndex={-1}
            />

            {/* 备用地图源2 - 最轻量 */}
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              maxZoom={12}
              minZoom={2}
              updateWhenZooming={false}
              updateWhenIdle={true}
              tileSize={256}
              keepBuffer={1}
              opacity={0.6}
              zIndex={-2}
            />

            {filteredDestinationsMemo.map(destination => (
              <Marker
                key={destination.id}
                position={destination.coordinates}
                icon={destination.visited ? visitedIcon : customIcon}
                eventHandlers={{
                  click: () => handleMarkerClick(destination)
                }}
              >
                <Popup>{renderPopupContent(destination)}</Popup>
              </Marker>
            ))}

            {visitedPath.length > 1 && (
              <Polyline
                positions={visitedPath}
                pathOptions={{
                  color: '#f472b6',
                  weight: 3,
                  opacity: 0.8,
                  dashArray: '12 12',
                  lineCap: 'round',
                  lineJoin: 'round'
                }}
              />
            )}
          </MapContainer>
          <div className="map-stage-toolbar">
            <button
              type="button"
              className="map-insights-trigger"
              onClick={() => setShowMapInsights(true)}
              aria-haspopup="dialog"
              aria-label="打开旅程概览"
            >
              <span className="overlay-eyebrow">环球进度</span>
              <span className="map-insights-trigger-value">{stats.progress}%</span>
            </button>
            <MusicPlayer />
          </div>
        </div>
      </div>

      {showMapInsights && (
        <div
          className="map-insights-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="旅程概览"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setShowMapInsights(false)
            }
          }}
        >
          <div className="map-insights-panel">
            <button
              type="button"
              className="map-insights-close"
              onClick={() => setShowMapInsights(false)}
              aria-label="关闭旅程概览"
            >
              ×
            </button>
            <div className="map-dock-progress">
              <div className="map-dock-progress-head">
                <span className="overlay-eyebrow">环球进度</span>
                <strong>{stats.progress}%</strong>
              </div>
              <div className="map-dock-meter">
                <span style={{ width: `${stats.progress}%` }} />
              </div>
              <div className="map-dock-metrics">
                <span>已访问 {stats.visitedCount}</span>
                <span>愿望 {stats.wishlistCount}</span>
                <span>计划 {stats.plannedCount}</span>
              </div>
            </div>

            {heroHighlight && (
              <div className="map-dock-card">
                <span className="overlay-badge">今日灵感</span>
                <p>
                  {heroHighlight.name}
                  {heroHighlight.bestTime && (
                    <span className="overlay-subtle"> · 最佳 {heroHighlight.bestTime}</span>
                  )}
                </p>
              </div>
            )}

            {upcomingPlans.length > 0 && (
              <div className="map-dock-card">
                <span className="overlay-badge secondary">下一站</span>
                <p className="map-card-title">
                  {upcomingPlans[0].destinationName}
                  {upcomingPlans[0].title && <span> · {upcomingPlans[0].title}</span>}
                </p>
                {upcomingPlans[0].date && (
                  <small className="overlay-subtle">出发日 {upcomingPlans[0].date}</small>
                )}
              </div>
            )}

            {bondNudge && (
              <div className="map-dock-card gentle">
                <span className="overlay-badge tertiary">心动互动</span>
                <p className="map-card-title">{bondNudge.title}</p>
                <small className="overlay-subtle">{bondNudge.microCopy}</small>
              </div>
            )}

            <div className="map-promise-card">
              <div className="map-promise-text">
                <span className="map-promise-label">旅程约定</span>
                <p>{sharedPromise?.mantra || '写下一句属于你们的旅程宣言。'}</p>
                {sharedPromise?.ritual && (
                  <small className="overlay-subtle">下一步：{sharedPromise.ritual}</small>
                )}
              </div>
              <button
                type="button"
                className="map-promise-action"
                onClick={() => {
                  setShowPromiseModal(true)
                  setShowMapInsights(false)
                }}
              >
                编辑
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && selectedDestination && (
        <DestinationModal
          destination={selectedDestination}
          onClose={() => setShowModal(false)}
          onUpdate={handleUpdateDestination}
          storageKey={activeStorageKey}
        />
      )}

      {showAddModal && (
        <AddDestinationModal
          categories={categories}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddDestination}
        />
      )}

      {showPromiseModal && (
        <CouplePromiseModal
          promise={sharedPromise}
          onClose={() => setShowPromiseModal(false)}
          onSave={handleSavePromise}
          onRemove={handleRemovePromise}
        />
      )}
    </div>
  )
}

export default App
