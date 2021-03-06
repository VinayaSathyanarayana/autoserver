// Like array.sort() but does not mutate argument
export const sortArray = function(array, func) {
  // eslint-disable-next-line fp/no-mutating-methods
  return [...array].sort(func)
}

// Like Lodash order() but faster, and using the same format we use in `order`
export const sortBy = function(array, order) {
  return sortArray(array, (objA, objB) => sortByFunc({ objA, objB, order }))
}

const sortByFunc = function({ objA, objB, order }) {
  const orderPart = order.find(
    ({ attrName: attrNameA }) => objA[attrNameA] !== objB[attrNameA],
  )

  if (orderPart === undefined) {
    return 0
  }

  const { attrName, dir } = orderPart
  const compResult = objA[attrName] < objB[attrName] ? -1 : 1
  const compResultA = dir === 'desc' ? compResult * -1 : compResult
  return compResultA
}

// Compare two arrays, element by element
export const compareArrays = function(arrA, arrB, index = 0) {
  const result = compareLengths(arrA, arrB, index)

  if (result !== undefined) {
    return result
  }

  if (arrA[index] > arrB[index]) {
    return 1
  }

  if (arrA[index] < arrB[index]) {
    return -1
  }

  return compareArrays(arrA, arrB, index + 1)
}

const compareLengths = function(arrA, arrB, index) {
  const isEmptyA = arrA.length < index
  const isEmptyB = arrB.length < index

  if (isEmptyA) {
    return isEmptyB ? 0 : -1
  }

  if (isEmptyB) {
    return 1
  }
}
