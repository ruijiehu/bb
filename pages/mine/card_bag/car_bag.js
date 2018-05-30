// pages/mine/card_bag/car_bag.js
let util = require('../../../utils/util.js');
let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cardList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getCards();
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
    this.getCards();
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
    this.getCards();
    wx.stopPullDownRefresh();
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
   * 点击去我的名片
   */
  to_mycard () {
    wx.navigateTo({
      url: '/pages/mine/card_detail/card_detail_my',
    })
  },
  /**
   * 去他人名片
   */
  to_otherCard (e) {
    console.info(e)
    wx.navigateTo({
      url: '/pages/mine/card_detail/card_detail_other?manid=' + e.currentTarget.dataset.manid + '&&cardId=' + e.currentTarget.dataset.cardid
    })
  },
  /**
   * 获得名片
   */
  getCards () {
    let that = this;
    wx.request({
      url: app.globalData.javahost + '/user/base/get/card',
      method: 'POST',
      data: {},
      header: {
        'content-type': 'application/json',
        'cookie': 'JSESSIONID=' + app.globalData.session
      },
      success: function (res) {
        console.info(res)
        if (res.data.success) {
          that.setData({
            cardList: res.data.data
          })
        } else {
          app.errorMsg(res.data.errorCode, res.data.errorMsg, function (userInfo) {
            //更新数据
            that.setData({
              userInfo: userInfo
            })
            that.getCards();
          })
        }

      }
    })
  }
})