/**
 * Check if an element has a class
 * @param {HTMLElement} elm
 * @param {string} cls
 * @returns {boolean}
 */
export function hasClass(ele, cls) {
  return !!ele.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'))
}

/**
 * Add class to element
 * @param {HTMLElement} elm
 * @param {string} cls
 */
export function addClass(ele, cls) {
  if (!hasClass(ele, cls)) ele.className += ' ' + cls
}

/**
 * Remove class from element
 * @param {HTMLElement} elm
 * @param {string} cls
 */
export function removeClass(ele, cls) {
  if (hasClass(ele, cls)) {
    const reg = new RegExp('(\\s|^)' + cls + '(\\s|$)')
    ele.className = ele.className.replace(reg, ' ')
  }
}

export function createGuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = (Math.random() * 16) | 0
    var v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function deepCopy(obj) {
  var objClone = Array.isArray(obj) ? [] : {}
  if (obj && typeof obj === 'object') {
    for (var key in obj) {
      if (obj.hasOwnProperty(key) && obj[key] != undefined) {
        // 判断ojb子元素是否为对象，如果是，递归复制
        if (obj[key].constructor === RegExp) {
          objClone[key] = new RegExp(obj[key])
        } else if (obj[key] && typeof obj[key] === 'object') {
          objClone[key] = deepCopy(obj[key])
        } else {
          // 如果不是，简单复制
          objClone[key] = obj[key]
        }
      }
    }
  }
  return objClone
}

/** **************** common function begin ********************************/
export function colorToHex(color, trans) {
  color = color == undefined ? 0xffffff00 : color
  trans = trans == undefined ? 'CC' : parseInt(trans).toString(16)
  if (color.substr(0, 1) == '#') {
    color = parseInt('0x' + trans + color.substr(1))
  }
  return color
}

/**
 *只允许输入数字以及小数点后两位
 *@param thisObj 判断的dom对象
 *@param { Boolean } [isPositive] [是否是正数]
 *@param { int } [decimalNum] [小数点后保留位数]
 *@param { num } [maxValue] [最大值限制]
 *@param callback 回调方法
 *@return true：满足 false：不满足
 */
export function checkNum(
  thisValue,
  isPositive,
  decimalNum,
  maxValue,
  callback
) {
  thisValue = thisValue.toString()
  var isInt = false
  if (decimalNum != null && decimalNum == 0) {
    // 是否为整数（小数点后保留0位小数）
    isInt = true
  }
  if (isPositive) {
    // 正数
    if (isInt) {
      // 正整数
      thisValue = thisValue.replace(/[^0-9]/g, '')
    } else {
      // 正数
      thisValue = thisValue.replace(/[^0-9.]/g, '')
    }
  } else {
    if (isInt) {
      // 正负整数
      thisValue = thisValue.replace(/[^0-9-]/g, '')
    } else {
      // 正负数
      thisValue = thisValue.replace(/[^0-9.-]/g, '')
    }

    var isNegative = false // 负数
    if (thisValue.indexOf('-') == 0) {
      // 第一个字母为-号
      isNegative = true
      thisValue = thisValue
        .toString()
        .substr(1)
        .replace(new RegExp(/(-)/g), '') // 删掉除了第一个字符外的所有的“-”号
    } else {
      isNegative = false
      thisValue = thisValue.toString().replace(new RegExp(/(-)/g), '') // 删除所有“-”号
    }
  }

  if (thisValue.indexOf('0') == 0) {
    // 输入第一位为0
    if (isInt) {
      // 为整数时,直接置为0
      thisValue = 0
      return
    }
    var rightValue = thisValue.toString().substr(1)
    if (rightValue.indexOf('.') != 0) {
      // 0后只能输入.
      thisValue = '0'
    }
  } else if (thisValue.indexOf('.') == 0) {
    // 输入值中包括. 且.为第一个字母
    if (isNegative) {
      // 负数
      thisValue = '-'
    } else {
      thisValue = ''
    }
    return
  }

  var valueArr = thisValue.split('.')
  if (valueArr.length > 1) {
    if (
      decimalNum != null &&
      decimalNum > 0 &&
      valueArr[1].length > decimalNum
    ) {
      thisValue = valueArr[0] + '.' + valueArr[1].substr(0, decimalNum)
    } else {
      thisValue = valueArr[0] + '.' + valueArr[1]
    }
  }

  // maxValue不为空时
  if (
    maxValue != undefined &&
    maxValue.toString().indexOf('-') == -1 &&
    parseFloat(thisValue) >= parseFloat(maxValue)
  ) {
    thisValue = maxValue
  }

  if (isNegative) {
    // 负数加上负号
    thisValue = '-' + thisValue
  }

  if (isNaN(thisValue)) {
    if (thisValue.indexOf('.') == 0) {
      thisValue = ''
      return
    }
    var valueArr = thisValue.split('.')
    if (valueArr.length > 1) {
      thisValue = valueArr[0] + '.' + valueArr[1]
    }
  }

  if (callback && typeof callback === 'function') {
    callback(thisValue)
  }
}

export function convertExcelData(filterVal, jsonData) {
  return jsonData.map((v) =>
    filterVal.map((j) => {
      return v[j]
    })
  )
}

export function transformPoint(datum, x, y) {
  if (Math.abs(parseFloat(x)) > 180 || Math.abs(parseFloat(y) > 90)) {
    var coord = datum.src_xy_to_des_BLH(x, y, 0)
  } else {
    var coord = {
      x: x,
      y: y
    }
  }
  return coord
}

export function check2N(num) {
  return num > 0 && (num & (num - 1)) == 0
}

export function colorRgba(sHex, alpha = 204) {
  var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/
  /* 16进制颜色转为RGB格式 */
  let sColor = sHex.toLowerCase()
  if (sColor && reg.test(sColor)) {
    if (sColor.length === 4) {
      var sColorNew = '#'
      for (let i = 1; i < 4; i += 1) {
        sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1))
      }
      sColor = sColorNew
    }
    //  处理六位的颜色值
    var sColorChange = {}
    const colorAlpha = ['r', 'g', 'b']
    let ii = 0
    for (let i = 1; i < 7; i += 2) {
      const rgb = colorAlpha[ii++]
      sColorChange[rgb] = (
        parseInt('0x' + sColor.slice(i, i + 2)) / 255
      ).toFixed(1)
    }
    const a = (alpha / 255).toFixed(1)
    sColorChange['a'] = a
    return sColorChange
  } else {
    return sColor
  }
}

/**
 * 通过url获取图片file对象
 * @param url
 * @param fileName 文件名称(一定要带后缀)
 * @param callback 回调函数
 * @returns {*}
 */
export function getFileFromUrl(url, fileName, fileType) {
  return new Promise((resolve, reject) => {
    var blob = null
    var xhr = new XMLHttpRequest()
    xhr.open('GET', url)
    // xhr.setRequestHeader('Accept', 'image/jpeg')
    xhr.responseType = 'blob'
    xhr.onload = () => {
      if (xhr.status == 200) {
        blob = xhr.response
        const file = new File([blob], fileName)
        resolve(file)
      } else {
        reject()
      }
    }
    xhr.send()
  })
}

// 验证半径的正则表达式:非0开头的正数，小数点之后保留最多三位,小数点之前最多三位
export function regExpValidation(str) {
  const reg = /^(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*))$/
  return reg.test(str)
}

