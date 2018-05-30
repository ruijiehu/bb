let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userId: '',
    userInfo: {},
    provinceList: [],
    tradeList: [],
    countryIndex: 0,//省份index
    tradeIndex: 0,//行业index
    isInit: false,
    showLoading:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo) {
      //更新数据
      if (userInfo) {
        that.setData({
          userInfo: userInfo
        })
        if (typeof options.userId != 'undefined') {
          that.setData({
            userId: parseInt(options.userId)
          })
          that.init();
          that.getProvince();
          that.getTrade();
        }
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
      this.init();
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

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function () {

  // },
  /**
 * 初始化
 */

  init: function () {
    let that = this;
    if (that.data.userId) {
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
              userInfo: res.data.data,
              isInit: true
            })
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
    }

  },
  moreInfo: function (e) {
    wx.navigateTo({
      url: '/pages/my/userDetail?userId=' + e.currentTarget.dataset.id
    })
  },
  /**
   * 获取省份
   */
  getProvince: function () {
    let that = this;
    wx.request({
      url: app.globalData.javahost + '/user/location/province/list',
      method: 'POST',
      data: null,
      header: {
        'content-type': 'application/json',
        'cookie': 'JSESSIONID=' + app.globalData.session
      },
      success: function (res) {
        if (res.data.success) {
          that.setData({
            provinceList: res.data.data
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
   * 获取行业
   */
  getTrade: function () {
    let that = this;
    wx.request({
      url: app.globalData.javahost + '/user/trade/get/all',
      method: 'POST',
      data: null,
      header: {
        'content-type': 'application/json',
        'cookie': 'JSESSIONID=' + app.globalData.session
      },
      success: function (res) {
        if (res.data.success) {
          that.setData({
            tradeList: res.data.data
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
/**错误提示 */
  showTopTips: function () {
    var that = this;
    this.setData({
      showTopTips: true
    });
    setTimeout(function () {
      that.setData({
        showTopTips: false
      });
    }, 3000);
  },
  /**
   * 保存
   */
  save:function(){
    let that = this;
    wx.request({
      url: app.globalData.javahost + '/user/base/edit/selfInfo',
      method: 'POST',
      data: this.data.userInfo,
      header: {
        'content-type': 'application/json',
        'cookie': 'JSESSIONID=' + app.globalData.session
      },
      success: function (res) {
        if (res.data.success) {
          wx.showToast({
            title: "修改成功",
            duration: 2000
          })
          wx.navigateBack();
        } else {
          wx.showModal({
            content: res.data.errorMsg,
            showCancel: false,
            confirmText: "确定"
          })
        }
      }
    })
  }
})