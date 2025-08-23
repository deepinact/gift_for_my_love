#!/usr/bin/env python3
"""
地图瓦片下载脚本
下载指定区域和缩放级别的地图瓦片到本地
"""

import os
import requests
import time
from urllib.parse import urljoin
import math

def deg2num(lat_deg, lon_deg, zoom):
    """将经纬度转换为瓦片坐标"""
    lat_rad = math.radians(lat_deg)
    n = 2.0 ** zoom
    xtile = int((lon_deg + 180.0) / 360.0 * n)
    ytile = int((1.0 - math.asinh(math.tan(lat_rad)) / math.pi) / 2.0 * n)
    return xtile, ytile

def download_tile(z, x, y, tile_dir):
    """下载单个瓦片"""
    # 创建目录
    os.makedirs(f"{tile_dir}/{z}/{x}", exist_ok=True)
    
    # 瓦片文件路径
    tile_path = f"{tile_dir}/{z}/{x}/{y}.png"
    
    # 如果文件已存在，跳过
    if os.path.exists(tile_path):
        return True
    
    # 下载瓦片
    url = f"https://tile.openstreetmap.org/{z}/{x}/{y}.png"
    
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            with open(tile_path, 'wb') as f:
                f.write(response.content)
            print(f"✅ 下载成功: z{z}/x{x}/y{y}.png")
            return True
        else:
            print(f"❌ 下载失败: z{z}/x{x}/y{y}.png (状态码: {response.status_code})")
            return False
    except Exception as e:
        print(f"❌ 下载错误: z{z}/x{x}/y{y}.png ({str(e)})")
        return False

def download_area(min_lat, max_lat, min_lon, max_lon, min_zoom, max_zoom, tile_dir):
    """下载指定区域和缩放级别的地图瓦片"""
    print(f"🗺️ 开始下载地图瓦片...")
    print(f"📍 区域: {min_lat:.2f}°N, {min_lon:.2f}°E 到 {max_lat:.2f}°N, {max_lon:.2f}°E")
    print(f"🔍 缩放级别: {min_zoom} - {max_zoom}")
    
    total_tiles = 0
    downloaded_tiles = 0
    
    for zoom in range(min_zoom, max_zoom + 1):
        print(f"\n📐 处理缩放级别 {zoom}...")
        
        # 计算瓦片范围
        min_x, max_y = deg2num(min_lat, min_lon, zoom)
        max_x, min_y = deg2num(max_lat, max_lon, zoom)
        
        # 确保坐标顺序正确
        min_x, max_x = min(min_x, max_x), max(min_x, max_x)
        min_y, max_y = min(min_y, max_y), max(min_y, max_y)
        
        zoom_tiles = (max_x - min_x + 1) * (max_y - min_y + 1)
        total_tiles += zoom_tiles
        
        print(f"   📊 瓦片范围: x({min_x}-{max_x}), y({min_y}-{max_y})")
        print(f"   📈 本级别瓦片数量: {zoom_tiles}")
        
        # 下载瓦片
        for x in range(min_x, max_x + 1):
            for y in range(min_y, max_y + 1):
                if download_tile(zoom, x, y, tile_dir):
                    downloaded_tiles += 1
                
                # 添加延迟避免请求过快
                time.sleep(0.1)
    
    print(f"\n🎉 下载完成!")
    print(f"📊 总计瓦片: {total_tiles}")
    print(f"✅ 成功下载: {downloaded_tiles}")
    print(f"❌ 失败数量: {total_tiles - downloaded_tiles}")
    print(f"💾 保存位置: {tile_dir}")

if __name__ == "__main__":
    # 配置参数
    TILE_DIR = "public/tiles"  # 瓦片保存目录
    
    # 全球主要区域配置
    AREAS = {
        "全球概览": {
            "min_lat": -60, "max_lat": 80,
            "min_lon": -180, "max_lon": 180,
            "min_zoom": 0, "max_zoom": 3
        },
        "亚洲": {
            "min_lat": 10, "max_lat": 55,
            "min_lon": 60, "max_lon": 140,
            "min_zoom": 2, "max_zoom": 6
        },
        "欧洲": {
            "min_lat": 35, "max_lat": 70,
            "min_lon": -10, "max_lon": 40,
            "min_zoom": 2, "max_zoom": 6
        },
        "美洲": {
            "min_lat": -60, "max_lat": 70,
            "min_lon": -180, "max_lon": -30,
            "min_zoom": 2, "max_zoom": 6
        },
        "大洋洲": {
            "min_lat": -50, "max_lat": 0,
            "min_lon": 110, "max_lon": 180,
            "min_zoom": 2, "max_zoom": 6
        }
    }
    
    print("🗺️ 地图瓦片下载工具")
    print("=" * 50)
    
    # 选择下载区域
    print("请选择要下载的区域:")
    for i, (name, _) in enumerate(AREAS.items(), 1):
        print(f"{i}. {name}")
    print("6. 自定义区域")
    
    try:
        choice = input("\n请输入选择 (1-6): ").strip()
        
        if choice == "6":
            # 自定义区域
            print("\n请输入自定义区域参数:")
            min_lat = float(input("最小纬度 (如: -60): "))
            max_lat = float(input("最大纬度 (如: 80): "))
            min_lon = float(input("最小经度 (如: -180): "))
            max_lon = float(input("最大经度 (如: 180): "))
            min_zoom = int(input("最小缩放级别 (如: 0): "))
            max_zoom = int(input("最大缩放级别 (如: 6): "))
            
            area_config = {
                "min_lat": min_lat, "max_lat": max_lat,
                "min_lon": min_lon, "max_lon": max_lon,
                "min_zoom": min_zoom, "max_zoom": max_zoom
            }
            area_name = "自定义区域"
        else:
            # 预设区域
            choice_idx = int(choice) - 1
            area_name = list(AREAS.keys())[choice_idx]
            area_config = AREAS[area_name]
        
        print(f"\n🎯 选择区域: {area_name}")
        
        # 确认下载
        confirm = input("确认开始下载? (y/N): ").strip().lower()
        if confirm in ['y', 'yes']:
            download_area(**area_config, tile_dir=TILE_DIR)
        else:
            print("❌ 取消下载")
            
    except (ValueError, IndexError):
        print("❌ 输入无效")
    except KeyboardInterrupt:
        print("\n❌ 用户中断")
    except Exception as e:
        print(f"❌ 发生错误: {str(e)}")
