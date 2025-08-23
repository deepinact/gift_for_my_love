#!/usr/bin/env python3
# -*- coding: utf-8 -*-

# 图片引用映射
image_refs = {
    "images.maldives": "destinationImages.maldives",
    "images.santorini": "destinationImages.santorini",
    "images.kyoto": "destinationImages.kyoto",
    "images.iceland": "destinationImages.iceland",
    "images.venice": "destinationImages.venice",
    "images.bali": "destinationImages.bali",
    "images.swissAlps": "destinationImages.swissAlps",
    "images.morocco": "destinationImages.morocco",
    "images.newzealand": "destinationImages.newzealand",
    "images.cappadocia": "destinationImages.cappadocia",
    "images.singapore": "destinationImages.singapore",
    "images.bangkok": "destinationImages.bangkok",
    "images.seoul": "destinationImages.seoul",
    "images.taipei": "destinationImages.taipei",
    "images.hongkong": "destinationImages.hongkong",
    "images.chiangmai": "destinationImages.chiangmai",
    "images.okinawa": "destinationImages.okinawa",
    "images.hoChiMinh": "destinationImages.hoChiMinh",
    "images.kualaLumpur": "destinationImages.kualaLumpur",
    "images.hanoi": "destinationImages.hanoi",
    "images.paris": "destinationImages.paris",
    "images.rome": "destinationImages.rome",
    "images.barcelona": "destinationImages.barcelona",
    "images.amsterdam": "destinationImages.amsterdam",
    "images.prague": "destinationImages.prague",
    "images.newyork": "destinationImages.newyork",
    "images.sanfrancisco": "destinationImages.sanfrancisco",
    "images.vancouver": "destinationImages.vancouver",
    "images.rio": "destinationImages.rio",
    "images.sydney": "destinationImages.sydney",
    "images.melbourne": "destinationImages.melbourne",
    "images.fiji": "destinationImages.fiji",
    "images.grandCanyon": "destinationImages.grandCanyon",
    "images.niagara": "destinationImages.niagara",
    "images.yellowstone": "destinationImages.yellowstone",
    "images.banff": "destinationImages.banff",
    "images.yosemite": "destinationImages.yosemite",
    "images.hawaiiVolcano": "destinationImages.hawaiiVolcano",
    "images.milfordSound": "destinationImages.milfordSound",
    "images.tasmania": "destinationImages.tasmania"
}

# 读取文件
with open('src/data/destinations.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 替换所有图片引用
for old_ref, new_ref in image_refs.items():
    content = content.replace(old_ref, new_ref)

# 写回文件
with open('src/data/destinations.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("图片引用更新完成！")
