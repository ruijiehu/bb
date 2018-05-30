// pages/home_page/search/search.js
let app = getApp();
let util = require('../../../utils/util.js');
let cache = null;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    value: null,
    listAll: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
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
  bindconfirm (e) {
    let that = this;
    this.setData({
      value: e.detail.value
    })
    console.info(this.data.value)
    wx.request({
      url: app.globalData.javahost + '/user/news/page',
      method: 'POST',
      data: {
        "conditons": [
          {
            "field": "search",
            "value": that.data.value
          }
        ],
        "currentPage": 0,
        // "orderBys": [
        //   {
        //     "field": "create_time",
        //     "orderType": "DESC"
        //   }
        // ],
        "pageSize": 10
      },
      header: {
        'content-type': 'application/json',
        'cookie': 'JSESSIONID=' + app.globalData.session
      },
      success: function (res) {
        if (res.data.success) {
          console.info(res)
          var array = []
          for (let i = 0; i < res.data.data.list.length; i++) {
            cache = res.data.data.list[i];
            cache.releaseTime = util.getDateDiff(cache.releaseTime);
            array.push(cache)
            }
          that.setData({
            listAll: array
          })
        } else {
        }

      }
    })
  },
  /**
   * 精选
   */
  // 跳去详情文章
  to_detail(e) {
    console.info(123)
    wx.navigateTo({
      url: '/pages/home_page/detail_page/detail_page?newsId=' + e.currentTarget.dataset.id
    })
  },
})