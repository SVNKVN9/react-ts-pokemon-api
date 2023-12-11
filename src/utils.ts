export const LS_KEY = 'ListStar'

export const getStarList = (): number[] => JSON.parse(localStorage.getItem(LS_KEY) || "[]") || []