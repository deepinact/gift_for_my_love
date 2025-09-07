# 音乐播放器设置指南

## 功能特性

✅ **已完成的音乐播放器功能：**
- 🎵 支持多种音频格式（MP4, MP3, WAV, OGG）
- 🔄 自动格式检测和回退
- 🔁 **自动循环播放**（音乐结束后自动重新开始）
- 🎶 **智能自动播放**（页面加载后尝试自动播放）
- 🎮 **简洁控制按钮**（右上角圆形按钮，播放/暂停）

## 如何添加您的MP4音乐文件

### 方法1：使用现有音乐文件
您的音乐文件 `Omnipotent_Youth_Society_2020.mp3` 已经配置为优先播放！

### 方法2：添加其他格式
您可以在以下位置放置音乐文件：
- `src/assets/music/Omnipotent_Youth_Society_2020.mp3` (当前使用)
- `public/music/background-music.mp4` (备用)
- `public/music/background-music.mp3` (备用)
- `public/music/background-music.wav` (备用)
- `public/music/background-music.ogg` (备用)

播放器会按优先级自动选择可用的格式。

## 文件路径结构
```
src/
└── assets/
    └── music/
        └── Omnipotent_Youth_Society_2020.mp3  ← 当前使用的音乐文件

public/
└── music/
    ├── background-music.mp4  ← 可选：MP4格式
    ├── background-music.mp3  ← 可选：MP3格式
    ├── background-music.wav  ← 可选：WAV格式
    └── background-music.ogg  ← 可选：OGG格式
```

## 使用说明

🎵 **智能音乐播放**：
- 页面加载后自动尝试播放音乐
- 如果浏览器阻止自动播放，点击右下角按钮开始播放
- 音乐播放结束后自动循环播放
- 右下角圆形按钮控制播放/暂停（避免与侧边栏和地图控件冲突）
- 按钮颜色：白色=暂停状态，灰色=播放状态（与整体设计协调）
- 暂停时显示"播放音乐"提示文字

## 技术细节

- 使用HTML5 Audio API
- 支持现代浏览器的所有主流音频格式
- 自动错误处理和格式回退
- 智能自动播放（处理浏览器限制）
- 自动循环播放逻辑
- 简洁的圆形控制按钮
- 主要音乐文件通过ES6 import导入（src/assets/music/）
- 备用音乐文件通过URL访问（public/music/）

## 注意事项

⚠️ **重要提醒：**
- 确保您有使用该音乐文件的合法权利
- 建议使用无版权或您拥有版权的音乐
- 文件大小建议不超过10MB
- 音频时长建议在3-10分钟之间

## 故障排除

如果音乐无法播放：
1. 检查文件是否存在于正确路径
2. 确认文件格式是否支持
3. 检查浏览器控制台是否有错误信息
4. 尝试不同的音频格式

## 自定义配置

如需修改音乐文件路径，请编辑：
`/src/components/MusicPlayer.jsx` 第19-24行的 `musicFiles` 数组。
