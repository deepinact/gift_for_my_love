import React, { useMemo, useState, useCallback } from 'react'
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
  BookOpen,
  XCircle,
  LogOut,
  Star,
  Users,
  HeartHandshake
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
  onAddDestination,
  session,
  pinnedAchievements = [],
  onToggleAchievementPin,
  connectionPrompts = [],
  connectionHighlights = [],
  onToggleConnectionPrompt,
  onLogout
}) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [isCollapsed, setIsCollapsed] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false)
  const [activePanel, setActivePanel] = useState(null)
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
  const handleDestinationClick = useCallback((destination) => {
    if (onDestinationClick) {
      onDestinationClick(destination)
    }
  }, [onDestinationClick])

  // 切换侧边栏状态
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  const openPanel = useCallback((panelId) => {
    setActivePanel(panelId)
  }, [])

  const closePanel = useCallback(() => {
    setActivePanel(null)
  }, [])

  const completedBondingCount = useMemo(
    () => connectionPrompts.filter(item => item.completed).length,
    [connectionPrompts]
  )

  const panelButtons = useMemo(() => {
    const completedAchievements = achievements.filter(item => item.status === 'completed').length
    return [
      {
        id: 'inspiration',
        icon: Sun,
        title: '灵感空间',
        subtitle: '当季推荐与愿望聚焦',
        badge: seasonalHighlights.length + wishlistSpotlights.length,
        empty: seasonalHighlights.length === 0 && wishlistSpotlights.length === 0
      },
      {
        id: 'plans',
        icon: CalendarDays,
        title: '旅程计划',
        subtitle: '查看下一段旅程安排',
        badge: upcomingPlans.length,
        empty: upcomingPlans.length === 0
      },
      {
        id: 'memory',
        icon: BookOpen,
        title: '回忆胶囊',
        subtitle: '重温已走过的故事',
        badge: memoryLane.length,
        empty: memoryLane.length === 0
      },
      {
        id: 'achievements',
        icon: Award,
        title: '旅程成就',
        subtitle: '记录我们的旅程里程碑',
        badge: `${completedAchievements}/${achievements.length || 1}`,
        empty: achievements.length === 0
      },
      {
        id: 'bonding',
        icon: HeartHandshake,
        title: '心动互动',
        subtitle: '完成双人的甜蜜小任务',
        badge: `${completedBondingCount}/${connectionPrompts.length || 1}`,
        empty: connectionPrompts.length === 0
      }
    ]
  }, [achievements, completedBondingCount, connectionPrompts, memoryLane, upcomingPlans, seasonalHighlights, wishlistSpotlights])

  const pinnedCards = useMemo(() => {
    if (!Array.isArray(pinnedAchievements) || pinnedAchievements.length === 0) return []
    return pinnedAchievements
      .map(id => achievements.find(achievement => achievement.id === id))
      .filter(Boolean)
      .slice(0, 4)
  }, [achievements, pinnedAchievements])

  const renderPanelContent = useCallback(() => {
    switch (activePanel) {
      case 'inspiration':
        return (
          <div className="overlay-section">
            {seasonalHighlights.length > 0 && (
              <div className="overlay-block">
                <div className="overlay-block-header">
                  <Sun size={16} />
                  <h4>当季精选</h4>
                  <span>{seasonalHighlights.length}</span>
                </div>
                <div className="overlay-cards">
                  {seasonalHighlights.map(destination => (
                    <button
                      key={`season-${destination.id}`}
                      type="button"
                      className="overlay-card-item"
                      onClick={() => {
                        closePanel()
                        handleDestinationClick(destination)
                      }}
                    >
                      <div className="overlay-thumb" style={{ backgroundImage: `url(${destination.image})` }} />
                      <div className="overlay-info">
                        <strong>{destination.name}</strong>
                        <span>{destination.bestTime || destination.category}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {wishlistSpotlights.length > 0 && (
              <div className="overlay-block">
                <div className="overlay-block-header">
                  <Compass size={16} />
                  <h4>愿望聚焦</h4>
                  <span>{wishlistSpotlights.length}</span>
                </div>
                <ul className="overlay-list">
                  {wishlistSpotlights.map(destination => (
                    <li key={`wish-${destination.id}`}>
                      <button
                        type="button"
                        onClick={() => {
                          closePanel()
                          handleDestinationClick(destination)
                        }}
                      >
                        <span>{destination.name}</span>
                        <small>{destination.category}</small>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {seasonalHighlights.length === 0 && wishlistSpotlights.length === 0 && (
              <p className="overlay-empty">稍等片刻，让我们为下一段旅程寻找灵感。</p>
            )}
          </div>
        )
      case 'plans':
        return (
          <div className="overlay-section">
            <div className="overlay-block">
              <div className="overlay-block-header">
                <CalendarDays size={16} />
                <h4>下一段旅程</h4>
                <span>{upcomingPlans.length}</span>
              </div>
              {upcomingPlans.length > 0 ? (
                <ul className="overlay-list">
                  {upcomingPlans.map(plan => (
                    <li key={`${plan.destinationId}-${plan.id || plan.title}` }>
                      <button
                        type="button"
                        onClick={() => {
                          const destination = allDestinations.find(dest => dest.id === plan.destinationId)
                          if (destination) {
                            closePanel()
                            handleDestinationClick(destination)
                          }
                        }}
                      >
                        <div className="overlay-plan-main">
                          <strong>{plan.destinationName}</strong>
                          {plan.date && <span>{plan.date}</span>}
                        </div>
                        {plan.title && <small>{plan.title}</small>}
                        {plan.notes && <p>{plan.notes}</p>}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="overlay-empty">还没有旅行计划，快来安排一场惊喜之旅。</p>
              )}
            </div>
          </div>
        )
      case 'memory':
        return (
          <div className="overlay-section">
            <div className="overlay-block">
              <div className="overlay-block-header">
                <BookOpen size={16} />
                <h4>回忆胶囊</h4>
                <span>{memoryLane.length}</span>
              </div>
              {memoryLane.length > 0 ? (
                <div className="overlay-cards memory">
                  {memoryLane.map(destination => (
                    <article key={`memory-${destination.id}`} className="overlay-memory-card">
                      <div className="overlay-thumb" style={{ backgroundImage: `url(${destination.image})` }} />
                      <div className="overlay-info">
                        <strong>{destination.name}</strong>
                        <p>{destination.notes}</p>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="overlay-empty">我们还没有记录下回忆，期待第一次旅程的到来。</p>
              )}
            </div>
          </div>
        )
      case 'achievements':
        return (
          <div className="overlay-section">
            <div className="overlay-block">
              <div className="overlay-block-header">
                <Award size={16} />
                <h4>旅程成就</h4>
                <span>{achievements.length}</span>
              </div>
              {achievements.length > 0 ? (
                <div className="overlay-achievement-grid">
                  {achievements.map(achievement => {
                    const statusLabel =
                      achievement.status === 'completed'
                        ? '已点亮'
                        : achievement.status === 'in-progress'
                          ? '进行中'
                          : '待解锁'

                    return (
                      <article
                        key={achievement.id}
                        className={`achievement-card ${achievement.status}`}
                      >
                        <header className="achievement-card-header">
                          <div className="achievement-card-badge">
                            <span className="achievement-medal">
                              <Award size={18} />
                            </span>
                            <div className="achievement-card-headings">
                              <h5>{achievement.title}</h5>
                              <span className="achievement-status-tag">{statusLabel}</span>
                            </div>
                          </div>
                          {onToggleAchievementPin && (
                            <button
                              type="button"
                              className={`achievement-pin ${achievement.pinned ? 'active' : ''}`}
                              onClick={() => onToggleAchievementPin(achievement.id)}
                              aria-label={achievement.pinned ? '取消收藏奖章' : '收藏奖章'}
                            >
                              <Star size={16} />
                            </button>
                          )}
                        </header>
                        <p className="achievement-card-description">{achievement.description}</p>
                        <div className="achievement-card-progress">
                          <div className="achievement-card-progress-bar">
                            <div
                              className="achievement-card-progress-fill"
                              style={{ width: `${achievement.progressPercent}%` }}
                            />
                          </div>
                          <div className="achievement-card-progress-meta">
                            <span>{achievement.progressPercent}%</span>
                            <span>{achievement.current || 0}/{achievement.target}</span>
                          </div>
                        </div>
                        <div className="achievement-card-reward">
                          <span>奖励</span>
                          <strong>{achievement.reward}</strong>
                        </div>
                      </article>
                    )
                  })}
                </div>
              ) : (
                <p className="overlay-empty">暂时还没有成就，和TA一起完成第一个目标吧。</p>
              )}
            </div>
          </div>
        )
      case 'bonding':
        return (
          <div className="overlay-section">
            <div className="overlay-block">
              <div className="overlay-block-header">
                <HeartHandshake size={16} />
                <h4>心动互动</h4>
                <span>{completedBondingCount}/{connectionPrompts.length}</span>
              </div>
              {connectionPrompts.length > 0 ? (
                <ul className="overlay-bonding-list">
                  {connectionPrompts.map(prompt => (
                    <li key={prompt.id}>
                      <button
                        type="button"
                        className={`bonding-card ${prompt.completed ? 'completed' : ''}`}
                        onClick={() => onToggleConnectionPrompt && onToggleConnectionPrompt(prompt.id)}
                      >
                        <div className="bonding-card-header">
                          <strong>{prompt.title}</strong>
                          <span className="bonding-status">{prompt.completed ? '已完成' : '待完成'}</span>
                        </div>
                        <p>{prompt.description}</p>
                        <span className="bonding-card-tip">点击标记为{prompt.completed ? '未完成' : '完成'}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="overlay-empty">稍后我们会为你们准备新的互动灵感。</p>
              )}
            </div>
          </div>
        )
      default:
        return null
    }
  }, [activePanel, achievements, allDestinations, closePanel, completedBondingCount, connectionPrompts, handleDestinationClick, memoryLane, onToggleAchievementPin, onToggleConnectionPrompt, seasonalHighlights, upcomingPlans, wishlistSpotlights])

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

        {session && (
          <div className="account-section">
            <div className="account-info">
              <span className="account-label">双人旅伴</span>
              <div className="account-names">
                <Users size={18} />
                <h2>
                  <span>{session.myUsername}</span>
                  <span className="ampersand">&</span>
                  <span>{session.partnerUsername}</span>
                </h2>
              </div>
              <p>共享灵感、计划与回忆，随时同步。</p>
            </div>
            {onLogout && (
              <button type="button" className="account-logout" onClick={onLogout}>
                <LogOut size={16} /> 安全退出
              </button>
            )}
          </div>
        )}

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

        {connectionHighlights.length > 0 && (
          <div className="bonding-preview">
            <div className="bonding-preview-header">
              <div className="bonding-preview-title">
                <HeartHandshake size={18} />
                <div>
                  <h3>心动互动</h3>
                  <span>{completedBondingCount}/{connectionPrompts.length || 1} 已点亮</span>
                </div>
              </div>
              <button type="button" onClick={() => openPanel('bonding')}>
                查看全部
              </button>
            </div>
            <div className="bonding-preview-grid">
              {connectionHighlights.map(prompt => (
                <button
                  key={prompt.id}
                  type="button"
                  className={`bonding-preview-card ${prompt.completed ? 'completed' : ''}`}
                  onClick={() => onToggleConnectionPrompt && onToggleConnectionPrompt(prompt.id)}
                >
                  <span className="bonding-preview-status">{prompt.completed ? '已完成' : '点击完成'}</span>
                  <strong>{prompt.title}</strong>
                  <p>{prompt.microCopy}</p>
                </button>
              ))}
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

        {pinnedCards.length > 0 && (
          <div className="pinned-section">
            <div className="pinned-header">
              <Award size={16} />
              <h3>奖章陈列柜</h3>
            </div>
            <div className="pinned-grid">
              {pinnedCards.map(card => (
                <button
                  key={card.id}
                  type="button"
                  className={`pinned-card ${card.status}`}
                  onClick={() => openPanel('achievements')}
                >
                  <span className="pinned-card-title">{card.title}</span>
                  <span className="pinned-card-progress">{card.progressPercent}%</span>
                </button>
              ))}
            </div>
          </div>
        )}

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

        <div className="insight-launcher">
          {panelButtons.map(({ id, icon: IconComponent, title, subtitle, badge, empty }) => (
            <button
              key={id}
              type="button"
              className={`insight-button ${empty ? 'empty' : ''}`}
              onClick={() => openPanel(id)}
            >
              <div className="insight-icon">
                <IconComponent size={18} />
              </div>
              <div className="insight-copy">
                <span className="insight-title">{title}</span>
                <span className="insight-subtitle">{subtitle}</span>
              </div>
              <span className={`insight-badge ${empty ? 'muted' : ''}`}>{badge}</span>
            </button>
          ))}
        </div>

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

        <div className="sidebar-footer">
          <p>💕 让我们一起环游世界</p>
        </div>

        {activePanel && (
          <div className="sidebar-overlay" role="dialog" aria-modal="true">
            <button className="overlay-backdrop" type="button" aria-label="关闭浮层" onClick={closePanel} />
            <div className="overlay-container">
              <div className="overlay-header">
                <div className="overlay-title">
                  {(() => {
                    const current = panelButtons.find(panel => panel.id === activePanel)
                    if (!current) return null
                    const Icon = current.icon
                    return <Icon size={18} />
                  })()}
                  <span>{(() => {
                    const current = panelButtons.find(panel => panel.id === activePanel)
                    return current ? current.title : ''
                  })()}</span>
                </div>
                <button type="button" className="overlay-close" onClick={closePanel}>
                  <XCircle size={18} />
                </button>
              </div>
              <p className="overlay-subtitle">
                {(() => {
                  const current = panelButtons.find(panel => panel.id === activePanel)
                  return current ? current.subtitle : ''
                })()}
              </p>
              <div className="overlay-content">
                {renderPanelContent()}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default Sidebar
