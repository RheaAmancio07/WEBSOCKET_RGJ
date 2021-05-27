## Brief words (YouChat)
**Web communication application based on webSocket (compatible with mobile terminal), the background uses node+express to build the basic http service, and socket.io to build the ws service of the communication layer. Some common functions such as group chat for all members, private chat for a member, and new message notification are implemented. The front end is written with native js to realize the functions of sending emoticons and sending local pictures. It also uses some concepts related to manifest, which can be directly accessed through the desktop. **

### Git repository
https://github.com/cp0725/YouChat

### Start the process

`cd/YouChat`

`npm install`

`node server.js`

Local access address http://127.0.0.1:8686/YouChat

(Ignore the above to do dynamic compilation `webpack` is that the build command must be run every time the code is modified)

**Login page**
![](https://upload-images.jianshu.io/upload_images/13130832-21fd678dda16e7f5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

**Group chat and private chat function**
![](https://upload-images.jianshu.io/upload_images/13130832-664251039f05c125.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](https://upload-images.jianshu.io/upload_images/13130832-7456a9a1258013d5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

**Send emoticons to send local pictures**
![](https://upload-images.jianshu.io/upload_images/13130832-051ae2b7535609c1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

**Mobile UI display**

![](https://upload-images.jianshu.io/upload_images/13130832-d039d9d2fd70c9c0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](https://upload-images.jianshu.io/upload_images/13130832-30e02f6d1946555b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](https://upload-images.jianshu.io/upload_images/13130832-3ccb944acd45e328.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

**The performance of h5 Notification**
![](https://upload-images.jianshu.io/upload_images/13130832-7e34c5ecb780061f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](https://upload-images.jianshu.io/upload_images/13130832-cc9feb2241c19539.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

<br/>
<br/>

### In addition, two knowledge points are manifest and Notification
**manifest**
Manifest is a technical point used by PWA. I wanted to learn about PWA for a long time. I didn’t read the official document until recently. We use the link tag to introduce a manifest configuration file in the header of the page, which can be configured in the manifest configuration file. Page icon, startup animation, application name and other attributes, and then send the application to the desktop through the browser. You can enter it directly from the desktop next time. The performance is close to the original app, because some of the browser’s features are hidden. Operation area such as toolbar. The interactive performance is also much better, the following is the relevant performance UI.

homescreen icon

![](https://upload-images.jianshu.io/upload_images/13130832-2926ba0ce5d66fcc.jpeg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

Start animation

![](https://upload-images.jianshu.io/upload_images/13130832-459bc714b244c39d.jpeg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


The main function

![](https://upload-images.jianshu.io/upload_images/13130832-3aba93d39a603bc6.jpeg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](https://upload-images.jianshu.io/upload_images/13130832-8f237dc2546835c1.jpeg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

*Manifest is only a technical point of the PWA related technology stack. PWA also involves many things such as offline loading. This application just uses the manifest to configure the display UI. *


**Notification**
Notification is H5's api function is to trigger message notification based on the browser instead of the page, that is to say, if the page is minimized or switched to another tab page, the notification message of Notification can still be triggered normally. But there is a limitation that must be https protocol in Chrome, while safari does not restrict the protocol. The UI performance has been given above.
