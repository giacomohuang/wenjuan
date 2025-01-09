const cleanupScoreRanges = (qItems) => {
  qItems.forEach((item) => {
    if (item.scoreRanges) {
      item.scoreRanges = item.scoreRanges.filter((range) => {
        return range.min >= item.minScore && range.max <= item.maxScore
      })
    }
    // 删除item.condition中的fromPortId在item.scoreRanges中不存在的condition
    if (item.logic && item.logic.conditions) {
      item.logic.conditions = item.logic.conditions.filter((conn) => {
        return item.scoreRanges?.some((range) => range.id === conn.fromPortId)
      })
    }
  })
}

const cleanupOptions = (qItems) => {
  qItems.forEach((item) => {
    if (item.options?.length > 0 && item.logic?.conditions) {
      item.logic.conditions = item.logic?.conditions?.filter((conn) => {
        return item.options?.some((opt) => opt.id == conn.fromPortId)
      })
    }
  })
}

const cleanupConditions = (qItems) => {
  console.log('cleanupConditions')
  qItems.forEach((item, index) => {
    if (!item.logic || !item.logic.conditions) return
    // 删除conditions中不存在的fromPortId

    // 删除conditions中不合理的连接, 只保留连接到更大索引题目的连接
    item.logic.conditions = item.logic?.conditions?.filter((conn) => {
      const targetIndex = qItems.findIndex((q) => q.id === conn.toLogicId)
      return targetIndex > index
    })
  })
}

export { cleanupScoreRanges, cleanupConditions, cleanupOptions }
