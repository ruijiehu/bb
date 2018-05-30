// pages/home_page/share_to/share_to.js
let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    atricletype: null,
    atricleid: null,
    imgs: null,
    tit: null,
    summary: null,
    container: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.info(options)
    this.setData({
      atricletype: options.type,
      atricleid: options.id,
      imgs: options.imgs,
      tit: options.tit,
      summary: options.summary
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },
  // 离开文本框
  bindTextAreaBlur: function (event) {
    let that = this;
    that.setData({
      container: event.detail.value
    })
  },
  to_send() {
   
    let that = this;
    // console.info(that.data.container)
    let con = that.data.container;
    console.info(con)
    if(con){
      wx.request({
        url: app.globalData.javahost + '/user/operate/share',
        method: 'POST',
        data: {
          "content": con,
          "id": that.data.atricleid,
          "type": 0
        },
        header: {
          'content-type': 'application/json',
          'cookie': 'JSESSIONID=' + app.globalData.session
        },
        success: function (res) {
          console.info(res)
          setTimeout(function () {

            // wx.navigateBack({
            //   delta: 2
            // })
            wx.switchTab({
              url: '/pages/home_page/index/index',
            })
          }, 200)

        }

      })
    } else {
      wx.showModal({
        title: '提示',
        content: '请填写转发内容',
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击确定')
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    }
    




  }
})