// pages/mine/company/com_edit.js
let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    phone: null,
    site: null,
    email: null,
    place: null,
    comid: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      this.setData({
        comid: options.id
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
 * 保存
 */
  formSubmit: function (e) {
    let that = this;
    var phone = e.detail.value.phone;         //获取input初始值
    var site = e.detail.value.site;         //获取input初始值
    var email = e.detail.value.email;         //获取input初始值
    var place = e.detail.value.place;         //获取input初始值
    
    console.info(phone)
    console.info(site)
    console.info(email)
    console.info(place)
    console.info(that.data.comid)
    // var ID_num2 = e.detail.value.ID_num2; 
    // let that = this;
    // console.info(that.data.worklist)
    wx.request({
      url: app.globalData.javahost + '/user/verify/edit/company',
      method: 'POST',
      data: {
        "companyInfoId": that.data.comid,
        "companyPlace": place,
        "email": email,
        "netSite": site,
        "phone": phone
      },
      header: {
        'content-type': 'application/json',
        'cookie': 'JSESSIONID=' + app.globalData.session
      },
      success: function (res) {
        if (res.data.success) {
          console.info(res.data)
          // wx.navigateTo({
          //   url: '/pages/mine/detail/detail',
          // })
          wx.navigateBack({
            delta: 1
          })
        }
      }

    })
  }
})