// pages/mine/card_detail/card_detail_other.js
let util = require('../../../utils/util.js');
let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tab_show1: true,
    tab_show2: false,
    manid: null,
    info: null,
    worklist: null,
    allList: null,
    cardId: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      console.info(options.manid)
      console.info(options.scan)
      console.info(options.cardId)
      this.setData({
        manid: options.manid,
        scan: options.scan,
        cardId: parseInt(options.cardId)
      })
      if(this.data.scan==1){
        wx.request({
          url: app.globalData.javahost + '/user/base/set/other/card',
          method: 'POST',
          data: {
            "userId": that.data.manid
          },
          header: {
            'content-type': 'application/json',
            'cookie': 'JSESSIONID=' + app.globalData.session
          },
          success: function (res) {
            console.info(res)
            if (res.data.success) {

            }
          },

        })
      }
      this.init()
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
    wx.stopPullDownRefresh();
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
   * 切换tab
   */
  changeShow1 () {
    this.setData({
      tab_show1: true,
      tab_show2: false,
    })
  },
  changeShow2() {
    this.setData({
      tab_show2: true,
      tab_show1: false,
    })
  },
  /**
 * 初始化
 */
  init: function () {
    let that = this;
    that.data.allList = [];
    /**
     * 获取工作经历和教育经历
     */

    wx.request({
      url: app.globalData.javahost + '/user/verify/get/list',
      method: 'POST',
      data: {
        "userId": that.data.manid
      },
      header: {
        'content-type': 'application/json',
        'cookie': 'JSESSIONID=' + app.globalData.session
      },
      success: function (res) {
        console.info(res)
        if (res.data.success) {
          console.info(res.data)
          var array = []
          var cache = null;
          for (let i = 0; i < res.data.data.length; i++) {
            cache = res.data.data[i];
            // cache.startTime = util.getDateDiff(cache.startTime);
            // cache.endTime = util.getDateDiff(cache.endTime);
            array.push(cache);
            var edu = []; var worklist = [];
            for (var i = 0; i < array.length; i++) {
              if (array[i].type == 0) {
                edu.push(array[i])
              } else if (array[i].type == 1) {
                worklist.push(array[i])
              }
            }
          }
          that.setData({
            edu: edu,
            worklist: worklist
            // work_one: one[0]
          })
          console.info(worklist)
        }
      },

    })
    that.getInfo();
    that.getNewMoment();
  },
  /**
   * 通过id获取他人信息
   */
  getInfo () {
    let that = this;
    wx.request({
      url: app.globalData.javahost + '/user/base/get/userInfo',
      method: 'POST',
      data: {
        "userId": that.data.manid
      },
      header: {
        'content-type': 'application/json',
        'cookie': 'JSESSIONID=' + app.globalData.session
      },
      success: function (res) {
        console.info(res)
        if (res.data.success) {
          that.setData({
            info: res.data.data
          })
        }

      }
    })
  },
 
  /**
 * 获取3条产品
 */
  getNewMoment: function () {
    let that = this;
    wx.request({
      url: app.globalData.javahost + '/user/product/page',
      method: 'POST',
      data: {
        "currentPage": 1,
        "pageSize": 3,
        "conditons": [{ "field": "userId", "value": that.data.manid }]
      },
      header: {
        'content-type': 'application/json',
        'cookie': 'JSESSIONID=' + app.globalData.session
      },
      success: function (res) {
        console.info(res)
        if (res.data.success) {
          var cache;
          let allList = [];
          for (let i = 0; i < res.data.data.list.length; i++) {
            cache = res.data.data.list[i];
            cache.images = cache.images ? cache.images.split(";") : [];
            allList.push(cache);
          }
          that.setData({
            allList: allList,
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
  },
  /**
   * 移除名片
   */
  del_card () {
    let that = this;
    wx.showModal({
      title: '提示',
      content: '确认移除名片吗',
      success: function (res) {
        if (res.confirm) {
          wx.request({
            url: app.globalData.javahost + '/user/base/del/card',
            method: 'POST',
            data: {
              "cardId": that.data.cardId
            },
            header: {
              'content-type': 'application/x-www-form-urlencoded',
              'cookie': 'JSESSIONID=' + app.globalData.session
            },
            success: function (res) {
              console.info(res)
              if (res.data.success) {
                wx.showToast({
                  title: '移除成功',
                })
                setTimeout(() => {
                  wx.navigateBack({})
                }, 1000)

              } else {

              }
            },

          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
    
  }
})