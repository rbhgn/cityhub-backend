export const getShortCode = (loc) => {
  if (loc === 'amsterdam')  {return 'AMS'}
  if (loc === 'rotterdam')  {return 'RTM'}
}    

export const checkIfUnique = (currentMediaIds, mediaId) => {
  const some = currentMediaIds.some(e => e=== mediaId)
  const filter = currentMediaIds.filter(c => c === mediaId).length > 0
  if (!some && !filter) {
    return true
  } else {
    return false
  }
}

export const getPaths = (item, type) => {
  if (type === 'locationSearch') {
    const recentMedia = item.edge_location_to_media.edges
    const topPosts = item.edge_location_to_top_posts.edges
    const items = topPosts.concat(recentMedia)
    return items
  }
  if (type === 'hashtagSearch') {
      const recentMedia = item.edge_hashtag_to_media.edges
      const topPosts = item.edge_hashtag_to_top_posts.edges
      const items = topPosts.concat(recentMedia)
      return items
  }
  if (type === 'ownerSearch') {
    const items = item.edge_owner_to_timeline_media
    return items
  }
}