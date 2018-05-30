let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showBindInfo: false,
    showLoading: true,
    iii: '../../images/taohuafu.jpg',
    ruijie: null,
    images:null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;


    // setTimeout(function(){
    that.getSelfInfo();
    // },4000)

    wx.request({
      url: app.globalData.javahost + '/user/operate/get/images',
      method: 'POST',
      data: {
        "activeId": 1
      },
      header: {
        'content-type': 'application/json',
        'cookie': 'JSESSIONID=' + app.globalData.session
      },
      success: function (res) {
        console.info(res)
        if (res.data.success) {
          that.setData({
            images:res.data.data
          })
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
        console.info(res)
        if (res.data.success) {
          // if (res.data.data.tradeView && res.data.data.tradeView.tradeId && res.data.data.cityView && res.data.data.cityView.cityId) {

            that.setData({
              selfInfo: res.data.data,
              infoid: res.data.data.userId,
              showBindInfo: false,
              allBind: true,
              listLoading: false
            })
            setTimeout(function () {
              that.setData({
                showLoading: false
              })
            }, 3000)
            // that.setData({
            //   selfInfo: res.data.data,
            //   infoid: res.data.data.userId,
            //   showBindInfo: false,
            //   allBind: true,
            //   listLoading: false,
            //   showLoading: false
            // })
            //直接生成护身符
          } else {
            // wx.navigateTo({
            //   url: '/pages/home_page/hushenfu/first_born',
            // })
            // that.getTrade();
            // that.getProvince();
            // that.setData({
            //   selfInfo: res.data.data,
            //   showBindInfo: true,
            //   listLoading: false
            // })

          }
        // } else {
        //   app.errorMsg(res.data.errorCode, res.data.errorMsg, function (userInfo) {
        //     //更新数据
        //     // that.getTrade();
        //     // that.getProvince();
        //     that.setData({
        //       userInfo: userInfo
        //     })
        //     // that.init();
        //   })
        // }
      }
    })
  },
  /**
   * 保存图片
   */
  save_pic(e) {
    console.info(e)
    // wx.saveImageToPhotosAlbum({
    //   filePath:'',
    //   success(res) {
    //   }
    // })
    wx.getImageInfo({
      src: e.currentTarget.dataset.src,
      success: function (ret) {
        var path = ret.path;
        wx.saveImageToPhotosAlbum({
          filePath: path,
          success(result) {
            console.log(result)
            wx.showToast({
              title: '保存成功',
            })
          }
        })
      }
    })
  }
})