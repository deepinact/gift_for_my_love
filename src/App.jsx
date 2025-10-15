import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import { Icon } from 'leaflet'
import { destinations, categories } from './data/destinations'
import Sidebar from './components/Sidebar'
import AddDestinationModal from './components/AddDestinationModal'
import DestinationModal from './components/DestinationModal'
import MusicPlayer from './components/MusicPlayer'
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
  const [selectedDestination, setSelectedDestination] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [destinationsData, setDestinationsData] = useState(destinations)
  const [selectedCategory, setSelectedCategory] = useState('全部')
  const [searchTerm, setSearchTerm] = useState('')
  const [showVisited, setShowVisited] = useState(false)
  const [showWishlist, setShowWishlist] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)

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
    // 更新本地存储中的计划
    if (updatedDestination.plans) {
      localStorage.setItem(`plans_${updatedDestination.id}`, JSON.stringify(updatedDestination.plans))
    }
    
    // 更新目的地数据状态
    setDestinationsData(prevDestinations => 
      prevDestinations.map(dest =>
        dest.id === updatedDestination.id ? updatedDestination : dest
      )
    )
    
    setShowModal(false)
  }, [])

  // 新增目的地
  const handleAddDestination = useCallback((payload) => {
    const nextId = Math.max(...destinationsData.map(d => d.id), 0) + 1
    const newDestination = {
      id: nextId,
      ...payload
    }
    setDestinationsData(prev => [newDestination, ...prev])
    // 持久化（简单本地备份）
    try {
      const saved = JSON.parse(localStorage.getItem('custom_destinations') || '[]')
      localStorage.setItem('custom_destinations', JSON.stringify([newDestination, ...saved]))
    } catch {}
    setShowAddModal(false)
    setSelectedDestination(newDestination)
    setShowModal(true)
  }, [destinationsData])

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
    const achievements = [
      {
        id: 'first-dream',
        title: '旅行起步',
        description: '已经收藏了第一个心动目的地。',
        achieved: destinationsData.length > 0
      },
      {
        id: 'wishlist-collector',
        title: '梦想收藏家',
        description: '愿望清单里拥有 10 个目的地。',
        achieved: stats.wishlistCount >= 10
      },
      {
        id: 'footprint-explorer',
        title: '足迹拓荒者',
        description: '标记 3 个已访问的地方，留下爱的足迹。',
        achieved: stats.visitedCount >= 3
      },
      {
        id: 'plan-master',
        title: '规划大师',
        description: '为至少 2 个目的地创建了详细旅行计划。',
        achieved: stats.plannedCount >= 2
      },
      {
        id: 'story-keeper',
        title: '回忆保管员',
        description: '在目的地备注里写下了浪漫的旅行心情。',
        achieved: stats.noteRichCount >= 1
      }
    ]
    return achievements
  }, [destinationsData, stats])

  const visitedPath = useMemo(() => {
    const visited = destinationsData.filter((destination) => destination.visited)
    return visited.map((destination) => destination.coordinates)
  }, [destinationsData])

  // 初次加载合并自定义目的地
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('custom_destinations') || '[]')
      if (Array.isArray(saved) && saved.length) {
        // 去重合并（按 id）
        setDestinationsData(prev => {
          const existingIds = new Set(prev.map(d => d.id))
          const toAdd = saved.filter(d => !existingIds.has(d.id))
          return [...prev, ...toAdd]
        })
      }
    } catch {}
  }, [])

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
      />

      <div className="map-container">
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

        <div className="map-overlay-card">
          <div className="map-overlay-header">
            <div>
              <span className="overlay-eyebrow">旅程进度</span>
              <h4>{stats.progress}% 完成度</h4>
            </div>
            <div className="overlay-counts">
              <span>{stats.visitedCount}/{stats.total}</span>
              <small>已访问</small>
            </div>
          </div>
          <div className="overlay-progress">
            <div className="overlay-progress-bar">
              <div
                className="overlay-progress-fill"
                style={{ width: `${stats.progress}%` }}
              />
            </div>
            <div className="overlay-progress-meta">
              <span>愿望 {stats.wishlistCount}</span>
              <span>计划 {stats.plannedCount}</span>
            </div>
          </div>

          {heroHighlight && (
            <div className="overlay-highlight">
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
            <div className="overlay-next">
              <span className="overlay-badge secondary">下一站</span>
              <div className="overlay-next-body">
                <strong>{upcomingPlans[0].destinationName}</strong>
                {upcomingPlans[0].title && <span> · {upcomingPlans[0].title}</span>}
              </div>
              {upcomingPlans[0].date && (
                <small className="overlay-subtle">出发日 {upcomingPlans[0].date}</small>
              )}
            </div>
          )}
        </div>
      </div>

      {showModal && selectedDestination && (
        <DestinationModal
          destination={selectedDestination}
          onClose={() => setShowModal(false)}
          onUpdate={handleUpdateDestination}
        />
      )}

      {showAddModal && (
        <AddDestinationModal 
          categories={categories}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddDestination}
        />
      )}

      {/* 音乐播放器 - 自动循环播放 */}
      <MusicPlayer />
    </div>
  )
}

export default App
