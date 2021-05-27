window.$ = (tag, all) => {
  if (!tag){
    console.warn('Please check if the passed css selector is correct')
    return null
  }
  if (!document.querySelector) {
    console.warn('The browser does not support querySelector')
    return null
  }
  if (all){
    return document.querySelectorAll(tag)
  }else{
    return document.querySelector(tag)
  }
}
window.tool = {
  addEveArr(domArr, eventName, fun){
    if (domArr.__proto__.constructor.name == 'NodeList'){
      for (let i = 0; i < domArr.length; i++) {
        domArr[i].addEventListener(eventName, e => {
          fun(e, domArr[i])
        })
      }
    }else{
      domArr.addEventListener(eventName, e => {
        fun(e, domArr)
      })
    }
  },
  ajax(type, url, data, fun){
    const ajax = new XMLHttpRequest()
    ajax.open(type, url, true)
    ajax.send(data)
    ajax.onreadystatechange = function () {
      if (ajax.readyState == 4 && ajax.status == 200) {
        const res = JSON.parse(ajax.responseText)
        if (ajax.responseText && res && res.ret == 1) {
          fun(res.data)
        } else {
          alert('Network request failure, please try again! ')
        }
      }
    }
  }
}
