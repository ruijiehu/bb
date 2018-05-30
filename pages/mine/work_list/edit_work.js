// work_list.js
let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dates: '请输入',
    dates_end: '请输入',
    com: '',
    position: '',
    worklist: '',
    userinfo: null,
    id: null,
    isok: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      com: options.company,
      position: options.position,
      id: options.id,
      dates: options.t,
      dates_end: options.e,
      isok: options.isok,
      worklist: options.ex
    })
    let that = this;
    wx.request({
      url: app.globalData.javahost + '/user/base/get/selfInfo',
      method: 'POST',
      data: {

      },
      header: {
        'content-type': 'application/json',
        'cookie': 'JSESSIONID=' + app.globalData.session
      },
      success: function (res) {
        if (res.data.success) {
          console.info(res.data)
          that.setData({
            userinfo: res.data.data
          })
          // that.setData({
          //   pinlunList: res.data.data
          // })

        }
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
   * 日期组件
   */
  bindDateChange: function (e) {
    console.log(e.detail.value)
    this.setData({
      dates: e.detail.value
    })
  },
  bindDateChange_end: function (e) {
    console.log(e.detail.value)
    this.setData({
      dates_end: e.detail.value
    })
  },
  /**
   * 保存
   */

  // 文本框事件
  bindTextAreaBlur: function (e) {
    this.setData({
      worklist: e.detail.value
    })

  },
  formSubmit: function (e) {
    let that = this;
    var com = e.detail.value.com;         //获取input初始值
    var position = e.detail.value.position;         //获取input初始值
    var worklist = e.detail.value.worklist;         //获取input初始值
    console.info(com)
    console.info(position)
    console.info(worklist)
    console.info(that.data.dates)
    console.info(that.data.dates_end)
    // var ID_num2 = e.detail.value.ID_num2; 
    // let that = this;
    // console.info(that.data.worklist)
    console.info(that.data.isok)
    // 如果已经认证
    if (that.data.isok=='true'){
      if (that.data.dates < that.data.dates_end) {
        wx.request({
          url: app.globalData.javahost + '/user/verify/edit/job',
          method: 'POST',
          data: {
            "company": that.data.com,
            "endTime": that.data.dates_end,
            "experience": worklist,
            "id": that.data.id,
            "position": that.data.position,
            "startTime": that.data.dates
          },
          header: {
            'content-type': 'application/json',
            'cookie': 'JSESSIONID=' + app.globalData.session
          },
          success: function (res) {
            if (res.data.success) {
              console.info(res.data)
              // that.setData({
              //   pinlunList: res.data.data
              // })
              // wx.redirectTo({
              //   url: '/pages/mine/detail/detail',
              // })
              wx.navigateBack({})
            } else {
              // wx.redirectTo({
              //   url: '/pages/mine/detail/detail',
              // })
              wx.navigateBack({})
            }
          }

        })
      } else {
        wx.showToast({
          title: '开始时间必须小于结束时间',
          icon: 'success',
          duration: 2000
        })
      }
     
    } else {
      if (that.data.dates < that.data.dates_end) {
        wx.request({
          url: app.globalData.javahost + '/user/verify/edit/job',
          method: 'POST',
          data: {
            "company": com,
            "endTime": that.data.dates_end,
            "experience": worklist,
            "id": that.data.id,
            "position": position,
            "startTime": that.data.dates
          },
          header: {
            'content-type': 'application/json',
            'cookie': 'JSESSIONID=' + app.globalData.session
          },
          success: function (res) {
            if (res.data.success) {
              console.info(res.data)
              // that.setData({
              //   pinlunList: res.data.data
              // })
              // wx.redirectTo({
              //   url: '/pages/mine/detail/detail',
              // })
              wx.navigateBack({})
            }
          }

        })
      }else {
        wx.showToast({
          title: '开始时间必须小于结束时间',
          icon: 'success',
          duration: 2000
        })
      }
      
    }
    
  },
  /**
  * 删除
  */
  del() {
    let that = this;

    wx.request({
      url: app.globalData.javahost + '/user/verify/delete/exp',
      method: 'POST',
      data: {
        "userInfoId": that.data.id
      },
      header: {
        'content-type': 'application/json',
        'cookie': 'JSESSIONID=' + app.globalData.session
      },
      success: function (res) {
        if (res.data.success) {
          console.info(res.data)

          wx.navigateBack({
            delta: 1
          })
        }
      }

    })
  }
})
