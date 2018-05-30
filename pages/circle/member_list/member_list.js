// pages/circle/member_list/member_list.js
let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cgInfo: null,
    infoid: null,
    cirid: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.info(options.cirid);
    let that = this;
    that.setData({
      cirid: options.cirid
    })
    /**
     * 获取自己的id
     */
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
          console.info(res.data)
          that.setData({
            infoid: res.data.data.userId,
            
          })
         
        }
      },

    })
    /**
     * 获取圈子用户列表
     */
    wx.request({
      url: app.globalData.javahost + '/user/circle/get/user/list',
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
          var cgInfo = res.data.data;
          that.setData({
            cgInfo: cgInfo
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
   * 去用户详情页面
   */
  tomember (e) {
    let that = this;
    // console.info()
    let id = e.currentTarget.dataset.id;
    console.info(id)
    console.info(that.data.infoid)
    console.info(that.data.infoid==id)
    if (id == that.data.infoid){
      console.info(122121212)
      // wx.navigateTo({
      //   url: '/pages/mine/info/info'
      // })
      wx.switchTab({
        // url: '/pages/circle/member_info/member_info?uid=' + e.currentTarget.dataset.userid
        url: '/pages/mine/info/info'
      })
    } else {
      wx.navigateTo({
        // url: '/pages/circle/member_info/member_info?uid=' + e.currentTarget.dataset.userid
        url: '/pages/mine/detail/detail_other?uid=' + id
      })
    }
   
  },
  /**
   * 推出圈子
   */
  tuichu_circle () {
    let id = this.data.cirid;
    wx.showModal({
      title: '提示',
      content: '是否退出该圈子',
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定')
          wx.request({
            url: app.globalData.javahost + '/user/circle/join/quit',
            method: 'POST',
            data: {
              "circleId": id
            },
            header: {
              'content-type': 'application/json',
              'cookie': 'JSESSIONID=' + app.globalData.session
            },
            success(res) {
              console.info(res)
              if (res.data.success) {
                wx.showToast({
                  title: '退出成功',
                })
                setTimeout(function () {
                  wx.navigateBack({})
                }, 1000)

              }

            },
            fail: function (res) {
              console.log(res.errMsg)
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
    
  }
})