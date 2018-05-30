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
    pinlunlist: []
  },

  onLoad: function () {
    var that = this;

    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo) {
      //更新数据
      if (userInfo) {
        that.setData({
          userInfo: userInfo
        })
        that.init();
      } else {
        that.setData({
          isInit: true
        })
      }

    }),
      /** 
       * 获取系统信息 
       */
      wx.getSystemInfo({

        success: function (res) {
          var clientHeight = res.windowHeight,
            clientWidth = res.windowWidth,
            rpxR = 750 / clientWidth;
          var calc = clientHeight * rpxR - 180;

          that.setData({
            winWidth: res.windowWidth,
            winHeight: res.windowHeight,
            winHeight: calc
          });
        }

      });

  },
  /**
* 初始化
*/
  init: function () {
    let that = this;
    that.data.allList = [];
    wx.request({
      url: app.globalData.javahost + '/user/base/get/selfInfo',
      method: 'POST',
      data: null,
      header: {
        'content-type': 'application/json',
        'cookie': 'JSESSIONID=' + app.globalData.session
      },
      success: function (res) {
        console.info(res)
        if (res.data.success) {
          res.data.data.acceptAnswerPercent = res.data.data.acceptAnswerPercent ? (res.data.data.acceptAnswerPercent * 100).toFixed(2) + '%' : 0;
          that.setData({
            info: res.data.data,
            isInit: true
          })
          if (!res.data.data.verifyYn) {
            // that.verifyApplyCheck();
          }
          setTimeout(function () {
            that.setData({
              showLoading: false
            })
          }, 300)
        } else {
          app.errorMsg(res.data.errorCode, res.data.errorMsg, function (userInfo) {
            //更新数据
            that.setData({
              userInfo: userInfo
            })
            that.init();
          })
        }
      },

    })
    // that.countRemind();
    // that.getNewMoment();
    // that.getShareList();
    that.pinlunList();
  },
  /** 
     * 滑动切换tab 
     */
  bindChange: function (e) {

    var that = this;
    that.setData({ currentTabB: e.detail.current });

  },
  /** 
   * 点击tab切换 
   */
  swichNav: function (e) {

    var that = this;

    if (this.data.currentTabB === e.target.dataset.current) {
      return false;

    } else {
      that.setData({
        currentTabB: e.target.dataset.current
      })

    }
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
   * 获取关注的用户的分享
   */
  
  /**
   * 获取我品论的
   */
  pinlunList () {
    let that = this;
    console.info(this.data.userInfo.userId)
    wx.request({
      url: app.globalData.javahost + '/user/operate/comment/get/list',
      method: 'POST',
      data: { "userId": that.data.userInfo.userId},
      header: {
        'content-type': 'application/json',
        'cookie': 'JSESSIONID=' + app.globalData.session
      },
      success: function (res) {
        console.info(res)
        if (res.data.success) {
          var array = [];
          for (let i = 0; i < res.data.data.length; i++) {
            cache = res.data.data[i];
            cache.createTime = util.getDateDiff(cache.createTime);
            array.push(cache);
          }
          // pinlist:
          that.setData({
            pinlunlist: array
          })
        }
      },

    })
  },
  /**
   * 去详情
   */
  to_news (e) {
    wx.navigateTo({
      url: '/pages/home_page/detail_page/detail_page?newsId=' + e.currentTarget.dataset.id
    })
  },
  to_pur (e) {
    wx.navigateTo({
      url: '/pages/circle/pur_show/pur_show?purid=' + e.currentTarget.dataset.id
    })
  },
  /**
 * 去交流详情页
 */
  to_jl(e) {
    wx.navigateTo({
      url: '/pages/circle/exchange_show/exchange_show?id=' + e.currentTarget.dataset.id
    })
  },
  /**
 * 分享的详情页
 */
  to_fx_detail(e) {
    console.info(123)
    let that = this;
    console.info(e.currentTarget.dataset.id)
    
    wx.navigateTo({
      url: '/pages/home_page/fenxiang_detail/fenxiang_detail?id=' + e.currentTarget.dataset.id + '&nick=' + e.currentTarget.dataset.nick + '&con=' + e.currentTarget.dataset.con
    })
  },
})