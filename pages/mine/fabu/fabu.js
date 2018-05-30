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
    sharelist: null,
    cglist: null
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
            that.verifyApplyCheck();
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
    that.getShareList();
    that.getCglist();
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
   * 我发布的交流
   */
  getShareList () {
    let that = this;
    wx.request({
      url: app.globalData.javahost + '/user/question/page/own',
      method: 'POST',
      data: {
       
        "currentPage": 1,
        "orderBys": [
          {
            "field": "createTime",
            "orderType": "DESC"
          }
        ],
        "pageSize": 100},
        header: {
          'content-type': 'application/json',
          'cookie': 'JSESSIONID=' + app.globalData.session
        },
        success: function (res) {
          console.info(res)
          if (res.data.success) {
            var array = [];
            for (let i = 0; i < res.data.data.list.length; i++) {
              cache = res.data.data.list[i];
              cache.createTime = util.getDateDiff(cache.createTime);
              array.push(cache);
            }
            that.setData({
              sharelist: array
            })
          }
        }

      })
   
  },
  /**
   * 获取我的采购列表
   */
  getCglist () {
    
    let that = this;
    wx.request({
      url: app.globalData.javahost + '/user/purchase/get/list',
      method: 'POST',
      data: null,
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
            cache.releaseTime = util.getDateDiff(cache.releaseTime);
            array.push(cache);
          }
          that.setData({
            cglist: array
          })
        }
      }

    })
  },
  /**
   * 去交流详情页
   */
  to_detail (e) {
    wx.navigateTo({
      url: '/pages/circle/exchange_show/exchange_show?id=' + e.currentTarget.dataset.id
    })
  },
  /**
   * 去采购详情也
   */
  to_cgdetail(e) {
    wx.navigateTo({
      url: '/pages/circle/pur_show/pur_show?purid=' + e.currentTarget.dataset.id
    })
  },
})