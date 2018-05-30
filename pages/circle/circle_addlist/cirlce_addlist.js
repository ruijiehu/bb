// pages/circle/circle_addlist/cirlce_addlist.js
let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    circleLIST: null,
    isShow: false,
    attendID: null,
    verifyApplying: false,
    height: null,
    circle_length: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    that.setData({
      circle_length: options.length
    })
    console.info(options.length)
    console.info(that.data.circle_length)
    wx.getSystemInfo({
      success: function (res) {
        console.log(res.model)
        console.log(res.pixelRatio)
        console.log(res.windowWidth)
        console.log(res.windowHeight)
        console.log(res.language)
        console.log(res.version)
        that.setData({
          height: res.windowHeight
        })
      }
    })

    this.getMyInfo();

    /**
     * 获取所有圈子列表
     */
    wx.request({
      url: app.globalData.javahost + '/user/circle/get/circle/list',
      method: 'POST',
      data: {},
      header: {
        'content-type': 'application/json',
        'cookie': 'JSESSIONID=' + app.globalData.session
      },
      success(res) {
        console.info(res)
        if (res.data.success) {
          var circleLIST = res.data.data;
          that.setData({
            circleLIST: circleLIST
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
   * 去圈子详情
   */
  toCircle(e) {
    let that = this;
    wx.navigateTo({
      url: '/pages/circle/circle_detail/circle_detail?cirid=' + e.currentTarget.dataset.cirid + '&length=' + that.data.circle_length
    })
  },
  /**
   * 点击申请加入
   */
  want_attend(e) {
    let that = this;
    let cirid = e.currentTarget.dataset.cirid;
    // that.setData({
    //   isShow: true,
    //   attendID: cirid
    // })
    console.info(cirid)
    if (that.data.UserInfo.verifyYn) {
      console.info(that.data.circle_length)
      if (that.data.circle_length == 3) {
        wx.showModal({
          title: '提示',
          content: '当前只能加入3个圈子',
          success: function (res) {
            if (res.confirm) {
              console.log('用户点击确定')
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        })
      } else {
        wx.showModal({
          title: '提示',
          content: '您已成功申请该圈子请耐心等候审核',
          success: function (res) {
            if (res.confirm) {
              console.log('用户点击确定')
              // 申请加入圈子
              wx.request({
                url: app.globalData.javahost + '/user/circle/apply/add',
                method: 'POST',
                data: {
                  "circleId": cirid
                },
                header: {
                  'content-type': 'application/json',
                  'cookie': 'JSESSIONID=' + app.globalData.session
                },
                success(res) {
                  console.info(res)
                  wx.showToast({
                    title: '操作成功',
                    icon: 'success',
                    duration: 2000
                  })

                },
                fail: function (res) {
                  console.log(res.errMsg)
                }
              })
            } else if (res.cancel) {
              wx.request({
                url: app.globalData.javahost + '/user/circle/apply/add',
                method: 'POST',
                data: {
                  "circleId": cirid
                },
                header: {
                  'content-type': 'application/json',
                  'cookie': 'JSESSIONID=' + app.globalData.session
                },
                success(res) {
                  console.info(res)


                },
                fail: function (res) {
                  console.log(res.errMsg)
                }
              })
            }
          }
        })
      }
    } else {
      wx.showModal({
        title: '提示',
        content: '未认证用户无法加入圈子,点击确定去认证',
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击确定')
            wx.navigateTo({
              url: '/pages/mine/beijin_list/beijin_list'
            })
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    }

    
  },

  /**
* 临时加入接口获取当前用户信息
*/
  getMyInfo: function () {
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
          console.info(res.data)
          that.setData({
            UserInfo: res.data.data,
            verifyApplying: res.data.data.verifyYn
          })
        } else {

        }
      },

    })
  },

})
