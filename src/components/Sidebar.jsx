import React, { useMemo, useState } from 'react'
import {
  Search,
  MapPin,
  Heart,
  CheckCircle,
  Filter,
  Globe,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Plus,
  Sparkles,
  Sun,
  CalendarDays,
  Compass,
  Award,
  BookOpen
} from 'lucide-react'
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
  stats,
  seasonalHighlights = [],
  wishlistSpotlights = [],
  upcomingPlans = [],
  achievements = [],
  memoryLane = [],
  dailyMood,
  onDestinationClick,
  onAddDestination
}) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [isCollapsed, setIsCollapsed] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false)
  const itemsPerPage = 10

  // 获取类别表情符号的函数
  const getCategoryEmoji = (category) => {
    const emojiMap = {
      '现代都市': '🏙️',
      '浪漫城市': '💝',
      '艺术建筑': '🎨',
      '自然风光': '🌿',
      '徒步路线': '🥾'
    }
    return emojiMap[category] || '📍'
  }

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

  // 小屏默认折叠，并在尺寸变化时同步
  React.useEffect(() => {
    const onResize = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(true)
      }
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

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

        {dailyMood && (
          <div className="mood-section">
            <div className="mood-card">
              <Sparkles className="mood-icon" />
              <div className="mood-content">
                <span className="mood-title">{dailyMood.title}</span>
                <p className="mood-message">{dailyMood.message}</p>
                <span className="mood-tip">今日提案：{dailyMood.tip}</span>
              </div>
            </div>
          </div>
        )}

        <div className="stats-section">
          <div className="stat-item">
            <CheckCircle className="stat-icon visited" />
            <div className="stat-info">
              <span className="stat-number">{stats.visitedCount}</span>
              <span className="stat-label">已去过</span>
            </div>
          </div>
          <div className="stat-item">
            <Heart className="stat-icon wishlist" />
            <div className="stat-info">
              <span className="stat-number">{stats.wishlistCount}</span>
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
          <div className="stat-progress">
            <div className="stat-progress-bar">
              <div className="stat-progress-fill" style={{ width: `${stats.progress}%` }} />
            </div>
            <span className="stat-progress-text">环球计划已完成 {stats.progress}%</span>
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
              {categories.filter(cat => cat !== '全部').map(category => {
                const categoryCount = allDestinations.filter(dest => dest.category === category).length
                if (categoryCount > 0) {
                  return (
                    <option key={category} value={category}>
                      {getCategoryEmoji(category)} {category} ({categoryCount})
                    </option>
                  )
                }
                return null
              })}
            </select>
          </div>
        </div>

        {(seasonalHighlights.length > 0 || wishlistSpotlights.length > 0 || upcomingPlans.length > 0) && (
          <div className="insights-section">
            <div className="section-heading">
              <Sun className="section-icon" />
              <div>
                <h3>旅途灵感实验室</h3>
                <p>根据季节和计划，为我们挑选下一站灵感</p>
              </div>
            </div>

            {seasonalHighlights.length > 0 && (
              <div className="highlight-group">
                <div className="group-title">
                  <Sun size={16} />
                  <span>当季精选</span>
                </div>
                <div className="highlights-grid">
                  {seasonalHighlights.map(destination => (
                    <button
                      key={`season-${destination.id}`}
                      type="button"
                      className="highlight-card"
                      onClick={() => handleDestinationClick(destination)}
                    >
                      <div
                        className="highlight-image"
                        style={{ backgroundImage: `url(${destination.image})` }}
                      />
                      <div className="highlight-info">
                        <span className="highlight-name">{destination.name}</span>
                        <span className="highlight-meta">{destination.bestTime || destination.category}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {wishlistSpotlights.length > 0 && (
              <div className="highlight-group wishlist-group">
                <div className="group-title">
                  <Compass size={16} />
                  <span>梦想聚焦</span>
                </div>
                <ul className="wishlist-spotlights">
                  {wishlistSpotlights.map(destination => (
                    <li key={`wish-${destination.id}`}>
                      <button type="button" onClick={() => handleDestinationClick(destination)}>
                        <span className="spotlight-name">{destination.name}</span>
                        <span className="spotlight-tag">{destination.category}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="highlight-group upcoming-group">
              <div className="group-title">
                <CalendarDays size={16} />
                <span>下一段旅程</span>
              </div>
              {upcomingPlans.length > 0 ? (
                <ul className="upcoming-plans">
                  {upcomingPlans.map(plan => (
                    <li key={`${plan.destinationId}-${plan.id}`}>
                      <button type="button" onClick={() => {
                        const destination = allDestinations.find(dest => dest.id === plan.destinationId)
                        if (destination) handleDestinationClick(destination)
                      }}>
                        <div className="plan-primary">
                          <span className="plan-destination">{plan.destinationName}</span>
                          {plan.date && <span className="plan-date">{plan.date}</span>}
                        </div>
                        {plan.title && <span className="plan-title">{plan.title}</span>}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="empty-insight">还没有旅行计划，快去添加一条心动旅程吧！</p>
              )}
            </div>
          </div>
        )}

        <div className="destinations-list">
          <div className="list-header">
            <h3><MapPin className="list-icon" /> 目的地列表</h3>
            <span className="list-count">共 {allDestinations.length} 个目的地</span>
            {onAddDestination && (
              <button 
                className="btn-primary" 
                onClick={onAddDestination}
                title="新增目的地"
                style={{ marginLeft: 'auto' }}
              >
                <Plus size={16} /> 新增
              </button>
            )}
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

        {memoryLane.length > 0 && (
          <div className="memory-section">
            <div className="section-heading">
              <BookOpen className="section-icon" />
              <div>
                <h3>回忆胶囊</h3>
                <p>那些我们已经一起走过的城市瞬间</p>
              </div>
            </div>
            <div className="memory-grid">
              {memoryLane.map(destination => (
                <div key={`memory-${destination.id}`} className="memory-card">
                  <div className="memory-image" style={{ backgroundImage: `url(${destination.image})` }} />
                  <div className="memory-body">
                    <h4>{destination.name}</h4>
                    <p>{destination.notes}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {achievements.length > 0 && (
          <div className="achievement-section">
            <div className="section-heading">
              <Award className="section-icon" />
              <div>
                <h3>旅程成就墙</h3>
                <p>解锁里程碑，让旅行故事更闪耀</p>
              </div>
            </div>
            <div className="achievement-grid">
              {achievements.map(achievement => (
                <div
                  key={achievement.id}
                  className={`achievement-card ${achievement.achieved ? 'achieved' : ''}`}
                >
                  <div className="achievement-status">
                    <Award size={16} />
                    <span>{achievement.achieved ? '已解锁' : '待解锁'}</span>
                  </div>
                  <h4>{achievement.title}</h4>
                  <p>{achievement.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="sidebar-footer">
          <p>💕 让我们一起环游世界</p>
        </div>
      </div>
    </>
  )
}

export default Sidebar
