import React, { useMemo, useState } from 'react'
import { Search, MapPin, Heart, CheckCircle, Filter, Globe, ChevronLeft, ChevronRight, Menu, X } from 'lucide-react'
import './Sidebar.css'

const Sidebar = ({
  destinations,
  allDestinations,
  categories,
  selectedCategory,
  setSelectedCategory,
  searchTerm,
  setSearchTerm,
  showVisited,
  setShowVisited,
  showWishlist,
  setShowWishlist,
  visitedCount,
  wishlistCount,
  onDestinationClick
}) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const itemsPerPage = 10

  // 使用useMemo优化目的地列表渲染
  const destinationsList = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return destinations.slice(startIndex, endIndex)
  }, [destinations, currentPage])

  // 计算总页数
  const totalPages = Math.ceil(destinations.length / itemsPerPage)

  // 分页导航
  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1))
  }

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1))
  }

  // 当筛选条件改变时，重置到第一页
  React.useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory, searchTerm, showVisited, showWishlist])

  // 处理目的地点击
  const handleDestinationClick = (destination) => {
    if (onDestinationClick) {
      onDestinationClick(destination)
    }
  }

  // 切换侧边栏状态
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  return (
    <>
      {/* 侧边栏切换按钮 */}
      <button 
        className={`sidebar-toggle ${isCollapsed ? 'collapsed' : ''}`}
        onClick={toggleSidebar}
        title={isCollapsed ? '展开侧边栏' : '隐藏侧边栏'}
      >
        {isCollapsed ? <Menu size={20} /> : <X size={20} />}
      </button>

      {/* 侧边栏主体 */}
      <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <Globe className="sidebar-icon" />
          <h1>全球旅行地图</h1>
          <p>记录我们的旅行足迹</p>
        </div>

        <div className="search-section">
          <div className="search-box">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="搜索目的地或国家..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="stats-section">
          <div className="stat-item">
            <CheckCircle className="stat-icon visited" />
            <div className="stat-info">
              <span className="stat-number">{visitedCount}</span>
              <span className="stat-label">已去过</span>
            </div>
          </div>
          <div className="stat-item">
            <Heart className="stat-icon wishlist" />
            <div className="stat-info">
              <span className="stat-number">{wishlistCount}</span>
              <span className="stat-label">愿望清单</span>
            </div>
          </div>
          <div className="stat-item">
            <MapPin className="stat-icon total" />
            <div className="stat-info">
              <span className="stat-number">{allDestinations.length}</span>
              <span className="stat-label">总目的地</span>
            </div>
          </div>
        </div>

        <div className="filter-section">
          <h3><Filter className="filter-icon" /> 筛选</h3>
          
          <div className="filter-group">
            <label className="filter-label">
              <input
                type="checkbox"
                checked={showVisited}
                onChange={(e) => setShowVisited(e.target.checked)}
              />
              只显示已去过的地方
            </label>
          </div>

          <div className="filter-group">
            <label className="filter-label">
              <input
                type="checkbox"
                checked={showWishlist}
                onChange={(e) => setShowWishlist(e.target.checked)}
              />
              只显示愿望清单
            </label>
          </div>

          <div className="filter-group">
            <label className="filter-label">分类筛选:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="category-select"
            >
              <option value="全部">🌍 全部分类</option>
              <option value="海岛度假">🏝️ 海岛度假</option>
              <option value="浪漫海岛">💕 浪漫海岛</option>
              <option value="文化古迹">🏛️ 文化古迹</option>
              <option value="自然奇观">🌋 自然奇观</option>
              <option value="浪漫水城">🚣 浪漫水城</option>
              <option value="热带度假">🌴 热带度假</option>
              <option value="山地风光">⛰️ 山地风光</option>
              <option value="异域风情">🕌 异域风情</option>
              <option value="自然风光">🌿 自然风光</option>
              <option value="奇特地貌">🏔️ 奇特地貌</option>
              <option value="现代都市">🏙️ 现代都市</option>
              <option value="浪漫城市">💝 浪漫城市</option>
              <option value="艺术建筑">🎨 艺术建筑</option>
              <option value="徒步路线">🥾 徒步路线</option>
            </select>
          </div>
        </div>

        <div className="destinations-list">
          <div className="list-header">
            <h3><MapPin className="list-icon" /> 目的地列表</h3>
            <span className="list-count">共 {allDestinations.length} 个目的地</span>
          </div>
          
          <div className="destinations-list-single">
            {destinationsList.map(destination => (
              <div 
                key={destination.id} 
                className={`destination-item ${destination.visited ? 'visited' : ''} ${destination.wishlist ? 'wishlist' : ''}`}
                onClick={() => handleDestinationClick(destination)}
              >
                <div className="destination-item-image">
                  <img src={destination.image} alt={destination.name} loading="lazy" />
                  {destination.visited && <CheckCircle className="visited-badge" />}
                  {destination.wishlist && <Heart className="wishlist-badge" />}
                </div>
                <div className="destination-item-info">
                  <h4>{destination.name}</h4>
                  <p className="destination-country">{destination.country}</p>
                  <p className="destination-category">{destination.category}</p>
                </div>
              </div>
            ))}
          </div>

          {/* 分页导航 */}
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                className="pagination-btn"
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} />
              </button>
              
              <div className="page-numbers">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    className={`page-btn ${page === currentPage ? 'active' : ''}`}
                    onClick={() => goToPage(page)}
                  >
                    {page}
                  </button>
                ))}
              </div>
              
              <button 
                className="pagination-btn"
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
          
          <div className="page-info">
            <span>第 {currentPage} 页，共 {totalPages} 页</span>
            <span>显示 {destinationsList.length} 个目的地</span>
          </div>
        </div>

        <div className="sidebar-footer">
          <p>💕 让我们一起环游世界</p>
        </div>
      </div>
    </>
  )
}

export default Sidebar
