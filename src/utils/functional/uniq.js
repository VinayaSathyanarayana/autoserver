import { includes } from './includes.js'

// Like Lodash uniq(), but deep equal, and can use mapper functions
export const uniq = function(arr, mapper) {
  const mappedArr = mapper === undefined ? arr : arr.map(mapper)
  return arr.filter((val, index) => isUnique(mappedArr, index))
}

// Returns first duplicate
export const findDuplicate = function(arr, mapper) {
  const mappedArr = mapper === undefined ? arr : arr.map(mapper)
  return arr.find((val, index) => !isUnique(mappedArr, index))
}

const isUnique = function(mappedArr, index) {
  const nextVals = mappedArr.slice(index + 1)
  return !includes(nextVals, mappedArr[index])
}
