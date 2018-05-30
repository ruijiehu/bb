// pages/mine/fangke/fangke.js
let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    men: [],
    objed:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getPerson()
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
    this.getPerson()
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
   * 获取访问的人
   */
  getPerson () {
    let that = this;
    wx.request({
      url: app.globalData.javahost + '/user/base/get/visit',
      method: 'POST',
      data: null,
      header: {
        'content-type': 'application/json',
        'cookie': 'JSESSIONID=' + app.globalData.session
      },
      success: function (res) {
        if (res.data.success) {
          console.info(res.data.data);
          var arr = res.data.data.slice(0,10);

          var newArr = [];
          console.info(newArr);
          var objed = {
            today: [],
            yesterday: [],
            beforeyesterday: [],
            other: []
          }
          var time, yesterday, beforeyesterday;
          var dd = new Date();
          time = dd.getFullYear() + '-' + (dd.getDay()) + '-' + dd.getDate();
          console.info(time)
          yesterday = dd.getFullYear() + '-' + (dd.getDay()) + '-' + (dd.getDate()-1);
          console.info(yesterday)
          beforeyesterday = dd.getFullYear() + '-' + (dd.getDay()) + '-' + (dd.getDate() - 2);
          arr.forEach(function (val, index) {
            console.info(val)
            if(val.date == time){
              objed.today.push(val)
              val.date = '今天'
            } else if (val.date == yesterday){
              objed.yesterday.push(val)
              val.date = '昨天'
            } else if (val.date == beforeyesterday){
              objed.beforeyesterday.push(val)
              val.date = '前天'
            } else{
              objed.other.push(val)
            }
          })
          
          console.info(objed)
          console.info(arr)
          that.setData({
            men: res.data.data,
            objed: objed
          })
         
        } else {
          app.errorMsg(res.data.errorCode, res.data.errorMsg, function (userInfo) {
            //更新数据
            that.setData({
              userInfo: userInfo
            })
          })
        }
      },

    })
  },
  /**
  * 去用户信息页面
  */
  to_Man(e) {
    let id = e.currentTarget.dataset.id;
    let that = this;
    console.info(id)
      // 判断是什么身份，外贸人和企业主
      wx.navigateTo({
        url: '/pages/mine/detail/detail_other?uid=' + id
      })
     

    

  },
})