import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { Icon } from 'leaflet'
import { destinations, categories } from './data/destinations'
import Sidebar from './components/Sidebar'
import AddDestinationModal from './components/AddDestinationModal'
import DestinationModal from './components/DestinationModal'
import MusicPlayer from './components/MusicPlayer'
import './App.css'

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
    return { visitedCount, wishlistCount }
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
        visitedCount={stats.visitedCount}
        wishlistCount={stats.wishlistCount}
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
        </MapContainer>
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
