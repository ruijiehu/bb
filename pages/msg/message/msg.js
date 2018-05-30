//获取应用实例  
var app = getApp()
Page({
  data: {
    /** 
        * 页面配置 
        */
    winWidth: 0,
    // winHeight: 0,
    // tab切换  
    currentTabB: 0,
    followList: [],
    syslist: []
  },
  onLoad: function () {
    var that = this;

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

    this.getFollowlist(); //调用关注的人动态
    this.getSyslist();
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
   * 获取我关注的人的动态
   */
  getFollowlist () {
    let that = this;
    wx.request({
      url: app.globalData.javahost + '/user/operate/follow/share/list',
      method: 'POST',
      data: {},
      header: {
        'content-type': 'application/json',
        'cookie': 'JSESSIONID=' + app.globalData.session
      },
      success: function (res) {
        console.info(res)
        if(res.data.success){
          
          that.setData({
            followList : res.data.data
          })
        }
        
      }

    })
  },
  getSyslist () {
    let that = this;
    wx.request({
      url: app.globalData.javahost + '/user/base/sysMsg/page',
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
            syslist: res.data.data.list
          })
        }

      }

    })
  }
 
}) 