import React, { useState, useMemo } from 'react'
import { X } from 'lucide-react'

const defaultForm = {
  name: '',
  country: '',
  latitude: '',
  longitude: '',
  category: '自然风光',
  description: '',
  bestTime: '',
  image: '',
  notes: '',
  visited: false,
  wishlist: false
}

const AddDestinationModal = ({ categories, onClose, onSubmit }) => {
  const [form, setForm] = useState(defaultForm)
  const [errors, setErrors] = useState({})
  const [uploading, setUploading] = useState(false)

  const categoryOptions = useMemo(() => categories.filter(c => c !== '全部'), [categories])

  const validate = () => {
    const next = {}
    if (!form.name.trim()) next.name = '请输入名称'
    if (!form.country.trim()) next.country = '请输入国家/地区'
    const lat = parseFloat(form.latitude)
    const lng = parseFloat(form.longitude)
    if (Number.isNaN(lat) || lat < -90 || lat > 90) next.latitude = '纬度需在 -90 到 90'
    if (Number.isNaN(lng) || lng < -180 || lng > 180) next.longitude = '经度需在 -180 到 180'
    if (!categoryOptions.includes(form.category)) next.category = '请选择分类'
    // 图片为可选：如果填写了链接需是大致有效的 URL 或 dataURL（简单校验），否则允许留空
    if (form.image && !/^data:image\//.test(form.image) && !/^https?:\/\//.test(form.image)) {
      next.image = '请输入以 http(s) 开头的图片链接或使用上传'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = () => {
    if (!validate()) return
    const payload = {
      name: form.name.trim(),
      country: form.country.trim(),
      coordinates: [parseFloat(form.latitude), parseFloat(form.longitude)],
      category: form.category,
      description: form.description.trim(),
      bestTime: form.bestTime.trim(),
      image: form.image.trim(),
      notes: form.notes.trim(),
      visited: !!form.visited,
      wishlist: !!form.wishlist,
      plans: []
    }
    onSubmit(payload)
  }

  const handleImageFileChange = (e) => {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, image: '请选择图片文件' }))
      return
    }
    setErrors(prev => ({ ...prev, image: undefined }))
    setUploading(true)
    const reader = new FileReader()
    reader.onload = () => {
      setForm(prev => ({ ...prev, image: String(reader.result) }))
      setUploading(false)
    }
    reader.onerror = () => {
      setUploading(false)
      setErrors(prev => ({ ...prev, image: '图片读取失败，请重试' }))
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>新增目的地</h2>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          <div className="plans-section">
            <div className="plan-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>名称 *</label>
                  <input name="name" value={form.name} onChange={handleChange} placeholder="例如：乌鲁鲁" />
                  {errors.name && <small style={{ color: '#dc2626' }}>{errors.name}</small>}
                </div>
                <div className="form-group">
                  <label>国家/地区 *</label>
                  <input name="country" value={form.country} onChange={handleChange} placeholder="例如：澳大利亚" />
                  {errors.country && <small style={{ color: '#dc2626' }}>{errors.country}</small>}
                </div>
                <div className="form-group">
                  <label>纬度 *</label>
                  <input 
                    name="latitude" 
                    value={form.latitude} 
                    onChange={handleChange} 
                    placeholder="-90 到 90" 
                    inputMode="decimal"
                  />
                  {errors.latitude && <small style={{ color: '#dc2626' }}>{errors.latitude}</small>}
                </div>
                <div className="form-group">
                  <label>经度 *</label>
                  <input 
                    name="longitude" 
                    value={form.longitude} 
                    onChange={handleChange} 
                    placeholder="-180 到 180" 
                    inputMode="decimal"
                  />
                  {errors.longitude && <small style={{ color: '#dc2626' }}>{errors.longitude}</small>}
                </div>
                <div className="form-group">
                  <label>分类 *</label>
                  <select 
                    name="category" 
                    value={form.category} 
                    onChange={handleChange}
                    className="category-select"
                  >
                    {categoryOptions.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  {errors.category && <small style={{ color: '#dc2626' }}>{errors.category}</small>}
                </div>
                <div className="form-group full-width">
                  <label>图片</label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input 
                      name="image" 
                      value={form.image} 
                      onChange={handleChange} 
                      placeholder="粘贴图片URL，或右侧上传" 
                      style={{ flex: 1 }}
                    />
                    <label 
                      className="btn-secondary" 
                      style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >
                      {uploading ? '上传中...' : '上传图片'}
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageFileChange} 
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>
                  {errors.image && <small style={{ color: '#dc2626' }}>{errors.image}</small>}
                  {form.image && (
                    <div style={{ marginTop: 8 }}>
                      <img 
                        src={form.image} 
                        alt="预览" 
                        style={{ width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
                      />
                    </div>
                  )}
                </div>
                <div className="form-group full-width">
                  <label>最佳时间</label>
                  <input name="bestTime" value={form.bestTime} onChange={handleChange} placeholder="例如：4-10月" />
                </div>
                <div className="form-group full-width">
                  <label>描述</label>
                  <textarea name="description" rows="3" value={form.description} onChange={handleChange} placeholder="简单描述一下这个目的地..." />
                </div>
                <div className="form-group full-width">
                  <label>备注</label>
                  <textarea name="notes" rows="2" value={form.notes} onChange={handleChange} placeholder="可选" />
                </div>
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="checkbox" name="visited" checked={form.visited} onChange={handleChange} /> 标记为已访问
                  </label>
                </div>
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="checkbox" name="wishlist" checked={form.wishlist} onChange={handleChange} /> 加入愿望清单
                  </label>
                </div>
              </div>
              <div className="form-actions">
                <button className="btn-primary" onClick={handleSubmit}>添加目的地</button>
                <button className="btn-secondary" onClick={onClose}>取消</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddDestinationModal


