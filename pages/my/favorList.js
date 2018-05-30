let util = require('../../utils/util.js');
let app = getApp();
let reqData = {}, cache, reqCG = {};
let allList = [];
let topCount = 0;

Page({
  data: {
    userInfo: {},
    selfInfo: {},
    allList: [],
    typeList: [],
    currentTag: 0,
    windowHeight: 1000,
    windowWidth: 375,
    listHasMore: true,
    listLoading: true,
    isInit: false,
    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    currentTabB: 0,
    cglist: []
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        if (res.system.indexOf('Android') > -1) {
          that.setData({
            position: "fixed",
            windowHeight: res.windowHeight,
            windowWidth: res.windowWidth
          });
        } else {
          that.setData({
            windowHeight: res.windowHeight,
            windowWidth: res.windowWidth
          });
        }

      }
    });
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
    if (this.data.userInfo && this.data.isInit) {
      // this.countRemind();
    }
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
    this.init();
    wx.stopPullDownRefresh()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    reqData.currentPage = reqData.currentPage + 1;
    reqCG.currentPage = reqCG.currentPage + 1;
    this.getList();
    this.getCGlist();
  },

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function () {
  //   let shareData = {
  //     title: "外贸帮帮",
  //     desc: "外贸帮帮",
  //     path: '/page/dynamic/list'
  //   };
  // },

  /**
   * 初始
   */
  init: function () {
    let that = this;
    allList = [];
    topCount = 0;
    reqData = {
      "currentPage": 1,
      "pageSize": app.globalData.pageSize,
      "orderBys": [{ "field": "createTime", "orderType": "DESC" }]
    },
      reqCG = {
        "currentPage": 1,
        "pageSize": app.globalData.pageSize,
        "orderBys": [{ "field": "createTime", "orderType": "DESC" }]
      },
    this.data.allList=[];
    this.setData({
      listHasMore: true,
      typeList: [],
      selfInfo: {}
    })
    this.getList();
    this.getCGlist();    
    this.getSelfInfo();
  },

  /**
   * 获取精选列表
   */
  getList: function () {
    let that = this;
    if (that.data.listHasMore) {
      that.setData({
        listLoading: true
      });
      wx.request({
        url: app.globalData.javahost + '/user/news/favor/page',
        method: 'POST',
        data: reqData,
        header: {
          'content-type': 'application/json',
          'cookie': 'JSESSIONID=' + app.globalData.session
        },
        success: function (res) {
          console.info(res)
          if (res.data.success) {
            allList = that.data.allList;
            for (let i = 0; i < res.data.data.list.length; i++) {
              cache = res.data.data.list[i];
              cache.releaseTime = util.getDateDiff(cache.releaseTime);
              allList.push(cache);
            }
            that.setData({
              allList: allList,
              listHasMore: res.data.data.currentPage >= res.data.data.pageCount ? false : true,
              loadingHidden: true,
              listLoading: false,
              isInit: true
            })
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

    } else {
      this.setData({
        listLoading: false
      });
    }

  },
  /**
   * 获取采购列表
   */
  getCGlist () {
    let that = this;
    wx.request({
      url: app.globalData.javahost + '/user/purchase/favor/page',
      method: 'POST',
      data: reqCG,
      header: {
        'content-type': 'application/json',
        'cookie': 'JSESSIONID=' + app.globalData.session
      },
      success: function (res) {
        console.info(res)
        if (res.data.success) {
          var cglist = [];
          for (let i = 0; i < res.data.data.list.length; i++) {
            cache = res.data.data.list[i];
            cache.createTime = util.getDateDiff(cache.createTime);
            cglist.push(cache);
          }
          that.setData({
            cglist: cglist
            // listHasMore: res.data.data.currentPage >= res.data.data.pageCount ? false : true,
            // loadingHidden: true,
            // listLoading: false,
            // isInit: true
          })
          console.info(that.data.cglist)
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

  },
  /**
   * 获取个人资料
   */
  getSelfInfo: function () {
    let that = this;
    wx.request({
      url: app.globalData.javahost + '/user/base/get/selfInfo',
      method: 'POST',
      data: null,
      header: {
        'content-type': 'application/json',
        'cookie': 'JSESSIONID=' + app.globalData.session
      },
      success: function (res) {
        if (res.data.success) {
          that.setData({
            selfInfo: res.data.data
          })
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
  },


  /**
   * 查看问题
   */
  showNews: function (e) {
    wx.navigateTo({
      url: '/pages/home_page/detail_page/detail_page?newsId=' + e.currentTarget.dataset.id
    })
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
  * 去采购详情也
  */
  to_cgdetail(e) {
    wx.navigateTo({
      url: '/pages/circle/pur_show/pur_show?purid=' + e.currentTarget.dataset.id
    })
  },
})