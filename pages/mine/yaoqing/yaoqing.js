// pages/mine/follow/follow.js
let util = require('../../../utils/util.js');
let app = getApp();
let cache;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    winWidth: 0,
    // winHeight: 0,
    // tab切换  
    currentTabB: 0,
    userInfo: {},
    isInit: false,
    showLoading: true,
    info: {},
    countList: {},
    verifyApplying: false,
    allList: [],
    byers: null,
    id: null,
    image: null
  },

  onLoad: function (options) {
    var that = this;
    that.setData({
      id: options.id
    })

    wx.request({
      url: 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wxb213b66d98321b8b&secret=e322b271ddeb827d34d6249f76ac9a35',
      method: 'get',
      success(_res) {
        wx.request({
          url: app.globalData.javahost + '/user/base/get/invite/code',
          method: 'POST',
          data: {
            "getAccess_token": _res.data.access_token,
            "path": "pages/home_page/index/index?manid=",
            "id": that.data.id
          },
          header: {
            'content-type': 'application/json',
            'cookie': 'JSESSIONID=' + app.globalData.session
          },
          success: function (res) {
            if (res.data.success) {
              console.info(res)
              that.setData({
                image: res.data.data
              })
            }
          }

        })
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
    // this.getShareList();
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
    this.getShareList();
    wx.stopPullDownRefresh()
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
   * 保存图片
   */
  save_pic(e) {
    console.info(e)
    wx.getImageInfo({
      src: e.currentTarget.dataset.src,
      success: function (ret) {
        var path = ret.path;
        console.info(123)
        wx.saveImageToPhotosAlbum({
          filePath: path,
          success(result) {
            console.log(result)
            wx.showToast({
              title: '保存成功',
            })
          }
        })
      },
      fail: function (err) {
        console.info(err)
      }
    })
  }


})