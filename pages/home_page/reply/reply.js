let cache, cacheItem, reqData = {};
let app = getApp();
let AllFriendList = [];
let keys = [];
Page({

  /**
   * 页面的初始数据
   */
  data: {
    inputShowed: false,
    showLoading: false,
    inputVal: "",
    inUser: { userId: 0 },
    friendList: {},
    selId: -1,
    ttype: null,
    iid: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    that.setData({
      ttype:options.type,
      iid: options.id
    })
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo) {
      //更新数据
      if (userInfo) {
        that.setData({
          userInfo: userInfo,
          "inUser.name": typeof options.name == 'undefined' ? '' : options.name,
          newsId: parseInt(options.newsId)
        })

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
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 评论
   */
  answerAdd: function (e) {
    let that = this;
    if(this.data.ttype!=6){
      if (e.detail.value.sendInput) {
        reqData.content = e.detail.value.sendInput;
        reqData.id = that.data.iid;
        reqData.type = that.data.ttype;
        console.info(reqData)
        wx.request({
          url: app.globalData.javahost + '/user/operate/comment',
          method: 'POST',
          data: reqData,
          header: {
            'content-type': 'application/json',
            'cookie': 'JSESSIONID=' + app.globalData.session
          },
          success: function (res) {
            if (res.data.success) {
              wx.navigateBack();
            } else {
              app.errorMsg(res.data.errorCode, res.data.errorMsg, function (userInfo) {
                //更新数据
                this.setData({
                  userInfo: userInfo
                })
                this.init();
              })
            }

          }
        })
      } else {
        wx.showModal({
          content: '回复内容不能为空',
          showCancel: false,
          confirmText: "确定"
        })
      }
    } else{
      if (e.detail.value.sendInput) {
        reqData.content = e.detail.value.sendInput;
        reqData.id = that.data.iid;
        console.info(reqData)
        wx.request({
          url: app.globalData.javahost + '/user/operate/comment',
          method: 'POST',
          data:{
            "content": e.detail.value.sendInput,
            "id": that.data.iid,
            "type": 4
          },
          header: {
            'content-type': 'application/json',
            'cookie': 'JSESSIONID=' + app.globalData.session
          },
          success: function (res) {
            console.info(res)
            if (res.data.success) {
              wx.navigateBack();
            } else {
              app.errorMsg(res.data.errorCode, res.data.errorMsg, function (userInfo) {
                //更新数据
                this.setData({
                  userInfo: userInfo
                })
                this.init();
              })
            }

          }
        })
      } else {
        wx.showModal({
          content: '回复内容不能为空',
          showCancel: false,
          confirmText: "确定"
        })
      }
    }
    
   
  },
  /**
   * 取消
   */
  formReset: function (e) {
    wx.navigateBack();
  }
})