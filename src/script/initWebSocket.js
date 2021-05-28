import info from './info.js'
import view from './view.js'

export default function(){

  window.socket = io()
  window.socket.on('connect', () => { // connection succeeded
    const userInfo = {
      name: info.name,
      url: info.url,
      id: window.socket.id
    }
    info.setData('id', window.socket.id)
    window.socket.emit('login', userInfo)
  })
  
  // Sign in
  window.socket.on('login', userInfo => {
    view.drawUserList(userInfo)
  })


  // Get the current online list
  window.socket.on('userList', userList => {
    view.drawUserList(userList)
  })


  // drop out
  window.socket.on('quit', id => {
    view.drawUserList(id)
  })


  // Receive group chat messages
  window.socket.on('sendMessageGroup', message => {
    info.groupMessageList.push(message)
    if (info.member == 'group'){
      view.drawMessageList(info.groupMessageList)
    }else{
      // Prompt for new messages in group chat
      $('.top .group').setAttribute('data-new', 'true')

      let nNewNum = $('.top .group').getAttribute('data-message')
      $('.top .group').setAttribute('data-message', Number(nNewNum) + 1)

      new Notification('Receive new news from Brief', {
        body: `${message.name}: ${message.text}`,
        icon: message.url
      })
    }
  })

  // Receive private chat messages
  window.socket.on('sendMessageMember', message => {
    if (message.id == info.id){ // own message return
      if (info[`member__${message.memberId}`] == undefined) {
        info[`member__${message.memberId}`] = []
      }
      info[`member__${message.memberId}`].push(message)
      view.drawMessageList(info[`member__${message.memberId}`])
    }else{ // Private chat messages with friends
      if (info[`member__${message.id}`] == undefined){
        info[`member__${message.id}`] = []
      }
      info[`member__${message.id}`].push(message)
    }

    if (info.member == message.id){
      view.drawMessageList(info[`member__${message.id}`])
    }else{
      // Prompt for new messages in private chat
      if ($(`.item[data-id="${message.id}"]`)){
        $(`.item[data-id="${message.id}"]`).setAttribute('data-new', 'true')

        let nNewNum = $(`.item[data-id="${message.id}"] .item-name`).getAttribute('data-message')
        $(`.item[data-id="${message.id}"] .item-name`).setAttribute('data-message', Number(nNewNum)+1)

        new Notification('Receive new news from Brief', {
          body: `${message.name}: ${message.text}`,
          icon: message.url
        })
      }
    }

    // userList message summary
    if ($(`.item[data-id="${message.id}"]`)){
      $(`.item[data-id="${message.id}"] .item-text`).innerHTML = message.text || `[Receive a new soul]`
    }
  })

}

