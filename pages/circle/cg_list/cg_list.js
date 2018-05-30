// pages/circle/cg_list/cg_list.js
let util = require('../../../utils/util.js');
let app = getApp();
let cache;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cgInfo: [] //圈子采购信息
   
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.info(options.cirid);
    let that = this;
   
    /**
         * 获取圈子采购信息
         */
    wx.request({
      url: app.globalData.javahost + '/user/circle/purchase/info',
      method: 'POST',
      data: {
        "circleId": options.cirid
      },
      header: {
        'content-type': 'application/json',
        'cookie': 'JSESSIONID=' + app.globalData.session
      },
      success(res) {
        console.info(res)
        if (res.data.success) {
          // var cgInfo = res.data.data;
          var arr = [];
          for (let i = 0; i < res.data.data.length; i++) {
            cache = res.data.data[i];
            cache.createTime = util.getDateDiff(cache.createTime);
            arr.push(cache);
          }
          that.setData({
            cgInfo: arr
          })
        }

      },
      fail: function (res) {
        console.log(res.errMsg)
      }
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
   * 去采购详情页面
   */
  tocgDetail(e) {
    console.info(e)
    wx.navigateTo({
      url: '/pages/circle/pur_show/pur_show?id=' + e.currentTarget.dataset.purid
    })
  }


})