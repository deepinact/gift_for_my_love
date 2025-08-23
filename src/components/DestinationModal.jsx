import React, { useState, useEffect } from 'react'
import { X, Plus, Edit2, Trash2, Calendar, MapPin, Users, DollarSign } from 'lucide-react'
import './DestinationModal.css'

const DestinationModal = ({ destination, onClose, onUpdate }) => {
  const [plans, setPlans] = useState(destination.plans || [])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingPlan, setEditingPlan] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    duration: '',
    budget: '',
    participants: '',
    description: '',
    activities: '',
    accommodation: '',
    transportation: '',
    notes: ''
  })

  // 从本地存储加载计划
  useEffect(() => {
    const savedPlans = localStorage.getItem(`plans_${destination.id}`)
    if (savedPlans) {
      setPlans(JSON.parse(savedPlans))
    }
  }, [destination.id])

  // 保存计划到本地存储
  const savePlansToStorage = (newPlans) => {
    localStorage.setItem(`plans_${destination.id}`, JSON.stringify(newPlans))
  }

  // 添加新计划
  const handleAddPlan = () => {
    if (!formData.title.trim()) return

    const newPlan = {
      id: Date.now(),
      ...formData,
      createdAt: new Date().toISOString()
    }

    const updatedPlans = [...plans, newPlan]
    setPlans(updatedPlans)
    savePlansToStorage(updatedPlans)
    
    // 更新目的地数据
    const updatedDestination = {
      ...destination,
      plans: updatedPlans
    }
    onUpdate(updatedDestination)

    // 重置表单
    setFormData({
      title: '',
      date: '',
      duration: '',
      budget: '',
      participants: '',
      description: '',
      activities: '',
      accommodation: '',
      transportation: '',
      notes: ''
    })
    setShowAddForm(false)
  }

  // 编辑计划
  const handleEditPlan = (plan) => {
    setEditingPlan(plan)
    setFormData({
      title: plan.title,
      date: plan.date,
      duration: plan.duration,
      budget: plan.budget,
      participants: plan.participants,
      description: plan.description,
      activities: plan.activities,
      accommodation: plan.accommodation,
      transportation: plan.transportation,
      notes: plan.notes
    })
    setShowAddForm(true)
  }

  // 更新计划
  const handleUpdatePlan = () => {
    if (!formData.title.trim()) return

    const updatedPlans = plans.map(plan =>
      plan.id === editingPlan.id
        ? { ...plan, ...formData, updatedAt: new Date().toISOString() }
        : plan
    )

    setPlans(updatedPlans)
    savePlansToStorage(updatedPlans)
    
    // 更新目的地数据
    const updatedDestination = {
      ...destination,
      plans: updatedPlans
    }
    onUpdate(updatedDestination)

    // 重置表单
    setFormData({
      title: '',
      date: '',
      duration: '',
      budget: '',
      participants: '',
      description: '',
      activities: '',
      accommodation: '',
      transportation: '',
      notes: ''
    })
    setEditingPlan(null)
    setShowAddForm(false)
  }

  // 删除计划
  const handleDeletePlan = (planId) => {
    if (window.confirm('确定要删除这个旅行计划吗？')) {
      const updatedPlans = plans.filter(plan => plan.id !== planId)
      setPlans(updatedPlans)
      savePlansToStorage(updatedPlans)
      
      // 更新目的地数据
      const updatedDestination = {
        ...destination,
        plans: updatedPlans
      }
      onUpdate(updatedDestination)
    }
  }

  // 取消编辑
  const handleCancelEdit = () => {
    setFormData({
      title: '',
      date: '',
      duration: '',
      budget: '',
      participants: '',
      description: '',
      activities: '',
      accommodation: '',
      transportation: '',
      notes: ''
    })
    setEditingPlan(null)
    setShowAddForm(false)
  }

  // 处理表单输入变化
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{destination.name}</h2>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          <div className="destination-info">
            <img src={destination.image} alt={destination.name} className="destination-image" />
            <div className="info-details">
              <p><strong>国家:</strong> {destination.country}</p>
              <p><strong>类型:</strong> {destination.category}</p>
              <p><strong>最佳时间:</strong> {destination.bestTime}</p>
              <p><strong>描述:</strong> {destination.description}</p>
              {destination.notes && <p><strong>备注:</strong> {destination.notes}</p>}
            </div>
          </div>

          {/* 旅行计划部分 */}
          <div className="plans-section">
            <div className="plans-header">
              <h3>旅行计划 ({plans.length})</h3>
              <button 
                className="btn-primary"
                onClick={() => setShowAddForm(true)}
              >
                <Plus size={16} />
                添加计划
              </button>
            </div>

            {/* 添加/编辑计划表单 */}
            {showAddForm && (
              <div className="plan-form">
                <h4>{editingPlan ? '编辑计划' : '添加新计划'}</h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label>计划标题 *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="例如：2024年春季马尔代夫之旅"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>出发日期</label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>行程天数</label>
                    <input
                      type="text"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      placeholder="例如：7天6晚"
                    />
                  </div>

                  <div className="form-group">
                    <label>预算</label>
                    <input
                      type="text"
                      name="budget"
                      value={formData.budget}
                      onChange={handleInputChange}
                      placeholder="例如：人均8000元"
                    />
                  </div>

                  <div className="form-group">
                    <label>参与人数</label>
                    <input
                      type="text"
                      name="participants"
                      value={formData.participants}
                      onChange={handleInputChange}
                      placeholder="例如：2人"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>计划描述</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="详细描述你的旅行计划..."
                      rows="3"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>主要活动</label>
                    <textarea
                      name="activities"
                      value={formData.activities}
                      onChange={handleInputChange}
                      placeholder="例如：浮潜、看日落、SPA..."
                      rows="2"
                    />
                  </div>

                  <div className="form-group">
                    <label>住宿安排</label>
                    <input
                      type="text"
                      name="accommodation"
                      value={formData.accommodation}
                      onChange={handleInputChange}
                      placeholder="例如：水上屋"
                    />
                  </div>

                  <div className="form-group">
                    <label>交通方式</label>
                    <input
                      type="text"
                      name="transportation"
                      value={formData.transportation}
                      onChange={handleInputChange}
                      placeholder="例如：飞机+快艇"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>其他备注</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="其他重要信息..."
                      rows="2"
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button 
                    className="btn-primary"
                    onClick={editingPlan ? handleUpdatePlan : handleAddPlan}
                  >
                    {editingPlan ? '更新计划' : '添加计划'}
                  </button>
                  <button 
                    className="btn-secondary"
                    onClick={handleCancelEdit}
                  >
                    取消
                  </button>
                </div>
              </div>
            )}

            {/* 计划列表 */}
            {plans.length > 0 ? (
              <div className="plans-list">
                {plans.map(plan => (
                  <div key={plan.id} className="plan-card">
                    <div className="plan-header">
                      <h4>{plan.title}</h4>
                      <div className="plan-actions">
                        <button 
                          className="btn-icon"
                          onClick={() => handleEditPlan(plan)}
                          title="编辑计划"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          className="btn-icon delete"
                          onClick={() => handleDeletePlan(plan.id)}
                          title="删除计划"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="plan-details">
                      {plan.date && (
                        <div className="plan-info">
                          <Calendar size={16} />
                          <span>{plan.date}</span>
                        </div>
                      )}
                      {plan.duration && (
                        <div className="plan-info">
                          <MapPin size={16} />
                          <span>{plan.duration}</span>
                        </div>
                      )}
                      {plan.budget && (
                        <div className="plan-info">
                          <DollarSign size={16} />
                          <span>{plan.budget}</span>
                        </div>
                      )}
                      {plan.participants && (
                        <div className="plan-info">
                          <Users size={16} />
                          <span>{plan.participants}</span>
                        </div>
                      )}
                    </div>

                    {plan.description && (
                      <p className="plan-description">{plan.description}</p>
                    )}

                    {plan.activities && (
                      <div className="plan-activities">
                        <strong>主要活动:</strong> {plan.activities}
                      </div>
                    )}

                    {plan.accommodation && (
                      <div className="plan-accommodation">
                        <strong>住宿:</strong> {plan.accommodation}
                      </div>
                    )}

                    {plan.transportation && (
                      <div className="plan-transportation">
                        <strong>交通:</strong> {plan.transportation}
                      </div>
                    )}

                    {plan.notes && (
                      <div className="plan-notes">
                        <strong>备注:</strong> {plan.notes}
                      </div>
                    )}

                    <div className="plan-meta">
                      <small>创建时间: {new Date(plan.createdAt).toLocaleDateString()}</small>
                      {plan.updatedAt && (
                        <small>更新时间: {new Date(plan.updatedAt).toLocaleDateString()}</small>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-plans">
                <p>还没有旅行计划，点击"添加计划"开始规划你的旅程吧！</p>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button 
            className="btn-secondary"
            onClick={() => {
              const updatedDestination = {
                ...destination,
                visited: !destination.visited
              }
              onUpdate(updatedDestination)
            }}
          >
            {destination.visited ? '标记为未访问' : '标记为已访问'}
          </button>
          <button 
            className="btn-secondary"
            onClick={() => {
              const updatedDestination = {
                ...destination,
                wishlist: !destination.wishlist
              }
              onUpdate(updatedDestination)
            }}
          >
            {destination.wishlist ? '从愿望清单移除' : '添加到愿望清单'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DestinationModal
