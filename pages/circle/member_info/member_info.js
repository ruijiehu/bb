// pages/circle/member_info/member_info.js
let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    uid: null,    //用户id
    userInfo: {}  //用户信息
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      console.info(options.uid)
      this.setData({
        uid: options.uid
      })
      this.getinfo(); //调用获取信息
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

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },
  /**
   * 通过id获取用户信息
   */
  getinfo () {
    let that = this;
    wx.request({
      url: app.globalData.javahost + '/user/base/get/userInfo',
      method: 'POST',
      data: {
        "userId": that.data.uid
      },
      header: {
        'content-type': 'application/json',
        'cookie': 'JSESSIONID=' + app.globalData.session
      },
      success: function (res) {
        console.info(res)
        if (res.data.success){
          that.setData({
            userInfo: res.data.data
          })
        }

      }
    })
  },
  /**
   * 关注
   */
  guanzhu (e) {
      let id = e.currentTarget.dataset.id;
      wx.showActionSheet({
        itemList: ['关注', '不关注'],
        success: function (res) {
          if (res.tapIndex == 0) {
            wx.request({
              url: app.globalData.javahost + '/user/operate/follow',
              method: 'POST',
              data: {
                "userId": id
              },
              header: {
                'content-type': 'application/json',
                'cookie': 'JSESSIONID=' + app.globalData.session
              },
              success: function (res) {
                console.info(res)
                if (res.data.success) {
                  // that.setData({
                  //   userInfo: res.data.data
                  // })
                }

              }
            })
          } else {

          }
      
            
        },
        fail: function (res) {
          console.log(res.errMsg)
        }
      })
  }
 
})