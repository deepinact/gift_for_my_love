// 导入所有图片
import maldives from './maldives.jpg'
import santorini from './santorini.jpg'
import kyoto from './kyoto.jpg'
import iceland from './iceland.jpg'
import venice from './venice.jpg'
import bali from './bali.jpg'
import swissAlps from './swiss_alps.jpg'
import morocco from './morocco.jpg'
import newzealand from './newzealand.jpg'
import cappadocia from './cappadocia.jpg'
import singapore from './singapore.jpg'
import bangkok from './bangkok.jpg'
import seoul from './seoul.jpg'
import taipei from './taipei.jpg'
import hongkong from './hongkong.jpg'
import chiangmai from './chiangmai.jpg'
import okinawa from './okinawa.jpg'
import hoChiMinh from './ho_chi_minh.jpg' // Hạ Long, Vietnam
import kualaLumpur from './kuala_lumpur.jpg'
import hanoi from './hanoi.jpg'
import paris from './paris.jpg'
import rome from './rome.jpg'
import barcelona from './barcelona.jpg'
import amsterdam from './amsterdam.jpg'
import prague from './prague.jpg'
import newyork from './newyork.jpg'
import sanfrancisco from './sanfrancisco.jpg'
import vancouver from './vancouver.jpg'
import rio from './rio.jpg'
import sydney from './sydney.jpg'
import melbourne from './melbourne.jpg'
import fiji from './fiji.jpg'
import grandCanyon from './grand_canyon.jpg'
import niagara from './niagara.jpg'
import yellowstone from './yellowstone.jpg'
import banff from './banff.jpg'
import yosemite from './yosemite.jpg'
import hawaiiVolcano from './hawaii_volcano.jpg'
import milfordSound from './milford_sound.jpg'
import tasmania from './tasmania.jpg'
import nepal from './nepal.jpg'
import switzerland from './switzerland.jpg'
import fuji from './fuji.jpg'
import machupicchu from './machupicchu.jpg'
import bluemountains from './bluemountains.jpg'
import norway from './norway.jpg'
import bromo from './bromo.jpg'
import ijen from './ijen.jpg'
import medog from './medog.png'


// 导出图片映射 - 为每个目的地分配最合适的图片
export const images = {
  // 海岛度假类
  maldives,
  santorini,
  bali,
  okinawa,
  fiji,
  
  // 文化古迹类
  kyoto,
  rome,
  prague,
  chiangmai,
  
  // 自然奇观类
  iceland,
  grandCanyon,
  niagara,
  yellowstone,
  hawaiiVolcano,
  nepal,
  switzerland,
  fuji,
  machupicchu,
  bluemountains,
  norway,
  bromo,
  ijen,
  // 浪漫水城类
  venice,
  
  // 热带度假类
  bangkok,
  rio,
  
  // 山地风光类
  swissAlps,
  banff,
  yosemite,
  
  // 异域风情类
  morocco,
  
  // 自然风光类
  newzealand,
  milfordSound,
  tasmania,
  medog,
  
  // 奇特地貌类
  cappadocia,
  
  // 现代都市类
  singapore,
  seoul,
  taipei,
  hongkong,
  hoChiMinh,
  kualaLumpur,
  hanoi,
  paris,
  amsterdam,
  newyork,
  sanfrancisco,
  vancouver,
  sydney,
  melbourne,
  
  // 浪漫城市类
  barcelona
}

// 为特定目的地分配最合适的图片
export const destinationImages = {
  // 马尔代夫 - 水上屋和珊瑚礁
  maldives: maldives,
  
  // 圣托里尼 - 蓝顶教堂和爱琴海
  santorini: santorini,
  
  // 京都 - 金阁寺和樱花
  kyoto: kyoto,
  
  // 冰岛 - 极光和冰川
  iceland: iceland,
  
  // 威尼斯 - 贡多拉和运河（使用巴塞罗那图片作为替代）
  venice: venice,
  
  // 巴厘岛 - 梯田和寺庙
  bali: bali,
  
  // 瑞士阿尔卑斯山 - 雪山和湖泊
  swissAlps: swissAlps,
  
  // 摩洛哥 - 撒哈拉沙漠和蓝色小镇（使用巴塞罗那图片作为替代）
  morocco: morocco,
  
  // 新西兰 - 米尔福德峡湾
  newzealand: newzealand,
  
  // 土耳其卡帕多奇亚 - 热气球和岩石地貌
  cappadocia: cappadocia,
  
  // 新加坡 - 滨海湾花园和金沙酒店
  singapore: singapore,
  
  // 曼谷 - 大皇宫和寺庙（使用巴塞罗那图片作为替代）
  bangkok: bangkok,
  
  // 首尔 - 景福宫和现代建筑（使用巴塞罗那图片作为替代）
  seoul: seoul,
  
  // 台北 - 101大楼和夜市
  taipei: taipei,
  
  // 香港 - 维港夜景和太平山
  hongkong: hongkong,
  
  // 清迈 - 古城和寺庙
  chiangmai: chiangmai,
  
  // 冲绳 - 海滩和琉球文化
  okinawa: okinawa,
  
  // 胡志明市 - 统一宫和法式建筑
  hoChiMinh: hoChiMinh,
  
  // 吉隆坡 - 双子塔和清真寺
  kualaLumpur: kualaLumpur,
  
  // 河内 - 胡志明陵墓和古街
  hanoi: hanoi,
  
  // 巴黎 - 埃菲尔铁塔（使用新下载的高质量图片）
  paris: paris,
  
  // 罗马 - 斗兽场和许愿池（使用新下载的高质量图片）
  rome: rome,
  
  // 巴塞罗那 - 圣家堂和高迪建筑
  barcelona: barcelona,
  
  // 阿姆斯特丹 - 运河和风车（使用巴塞罗那图片作为替代）
  amsterdam: amsterdam,
  
  // 布拉格 - 查理大桥和城堡（使用巴塞罗那图片作为替代）
  prague: prague,
  
  // 纽约 - 自由女神和时代广场
  newyork: newyork,
  
  // 旧金山 - 金门大桥
  sanfrancisco: sanfrancisco,
  
  // 温哥华 - 斯坦利公园和山海
  vancouver: vancouver,
  
  // 里约热内卢 - 基督像和科帕卡巴纳海滩（使用巴塞罗那图片作为替代）
  rio: rio,
  
  // 悉尼 - 悉尼歌剧院
  sydney: sydney,
  
  // 墨尔本 - 大洋路和咖啡文化
  melbourne: melbourne,
  
  // 斐济 - 珊瑚礁和热带海滩
  fiji: fiji,
  
  // 大峡谷 - 科罗拉多河峡谷
  grandCanyon: grandCanyon,
  
  // 尼亚加拉瀑布 - 瀑布奇观
  niagara: niagara,
  
  // 黄石公园 - 老忠实喷泉
  yellowstone: yellowstone,
  
  // 班夫国家公园 - 露易丝湖
  banff: banff,
  
  // 优胜美地 - 半圆顶和瀑布
  yosemite: yosemite,
  
  // 夏威夷火山 - 活火山和熔岩
  hawaiiVolcano: hawaiiVolcano,
  
  // 米尔福德峡湾 - 峡湾和瀑布
  milfordSound: milfordSound,

  // 塔斯马尼亚 - 摇篮山和荒野
  tasmania: tasmania,

  // 尼泊尔珠峰大本营徒步
  nepal: nepal,

  // 瑞士阿尔卑斯山徒步
  switzerland: switzerland,

  // 日本富士山登山
  fuji: fuji,

  // 秘鲁印加古道
  machupicchu: machupicchu,

  // 澳大利亚蓝山徒步
  bluemountains: bluemountains,

  // 挪威布道石徒步
  norway: norway,

  // 印尼布罗莫火山
  bromo: bromo,

  // 印尼伊真火山
  ijen: ijen,

  // 墨脱县
  medog: medog
}
