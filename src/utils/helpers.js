/* Shared helpers */

export const PLACEHOLDER_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 420'%3E%3Crect fill='%23181c35' width='300' height='420'/%3E%3Ctext fill='%235c6080' x='150' y='200' text-anchor='middle' font-size='40'%3E%F0%9F%8E%AC%3C/text%3E%3Ctext fill='%233a3f5c' x='150' y='240' text-anchor='middle' font-size='13'%3E%E6%9A%82%E6%97%A0%E6%B5%B7%E6%8A%A5%3C/text%3E%3C/svg%3E"

export function poster(pic) {
  return pic || PLACEHOLDER_IMG
}

export function timeAgo(ts) {
  const diff = Date.now() - ts
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
  if (diff < 604800000) return Math.floor(diff / 86400000) + '天前'
  return new Date(ts).toLocaleDateString('zh-CN')
}

export function safeImgError(e) {
  if (e.target) {
    e.target.src = PLACEHOLDER_IMG
    e.target.onerror = null
  }
}
