let util = require('../../../utils/util.js');
let app = getApp();
let cache;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    isInit: false,
    showLoading: true,
    info: {},
    countList: {},
    verifyApplying: false,
    allList: [],
    isAndroid: true,
    defaultImgList: ["../images/product1.png", "../images/product2.png", "../images/product3.png"],
    pinlunList: [],
    dianpin: null,
    edu: null,
    uid: null,
    myinfo: null,
    worklist: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      uid: options.uid
    })
    // this.getinfo(); //调用获取信息
    var that = this;
    this.init();
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          isAndroid: res.system.indexOf('Android') > -1 ? true : false
        });
      }
    });
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
    this.init();
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
  // onShareAppMessage: function () {

  // },
  /**
 * 初始化
 */
  init: function () {
    let that = this;
    that.data.allList = [];
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
        that.setData({
          myinfo: res.data.data
        })
        console.info(that.data.myinfo)
      
      },

    })
    /**
     * 获取用户评论
     */

    wx.request({
      url: app.globalData.javahost + '/user/operate/comment/get/list',
      method: 'POST',
      data: {
        "userId": that.data.uid
      },
      header: {
        'content-type': 'application/json',
        'cookie': 'JSESSIONID=' + app.globalData.session
      },
      success: function (res) {
        console.info(res)
        if (res.data.success) {
          console.info(res.data)
          that.setData({
            dianpin: res.data.data
          })
        }
      },

    })
    /**
     * 获取工作经历和教育经历
     */

    wx.request({
      url: app.globalData.javahost + '/user/verify/get/list',
      method: 'POST',
      data: {
        "userId": that.data.uid
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
        }
      },

    })
    that.getinfo();
    that.countRemind();
    that.getNewMoment();
  },
  /**
   * 获取计数
   */
  countRemind: function () {
    let that = this;
    wx.request({
      url: app.globalData.javahost + '/user/base/get/countRemind',
      method: 'POST',
      data: null,
      header: {
        'content-type': 'application/json',
        'cookie': 'JSESSIONID=' + app.globalData.session
      },
      success: function (res) {
        if (res.data.success) {
          that.setData({
            countList: res.data.data
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
        "conditons": [{ "field": "user.userId", "value": that.data.uid}]
      },
      header: {
        'content-type': 'application/json',
        'cookie': 'JSESSIONID=' + app.globalData.session
      },
      success: function (res) {
        console.info(res)
        if (res.data.success) {
          let allList = [];
          for (let i = 0; i < res.data.data.list.length; i++) {
            cache = res.data.data.list[i];
            cache.images = cache.images ? cache.images.split(";") : [];
            allList.push(cache);
          }
          that.setData({
            allList: allList,
            listHasMore: res.data.data.currentPage >= res.data.data.pageCount ? false : true,
            loadingHidden: true,
            listLoading: false,
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
   * 查看资料
   */
  showInfo: function () {
    wx.navigateTo({
      url: '/pages/my/userDetail'
    })
  },
  /**
   * 去认证
   */
  goVerify: function () {
    wx.navigateTo({
      url: '/pages/my/verify'
    })
  },
  /**
* 查看大图
*/
  previewImage: function (e) {
    var current = e.target.dataset.src;
    let urls = e.target.dataset.urls;
    wx.previewImage({
      current: current,
      urls: urls
    })
  },
  /**
   * 校验用户是否在审核
   */
  verifyApplyCheck: function () {
    let that = this;
    wx.request({
      url: app.globalData.javahost + '/user/base/verify/apply/check',
      method: 'POST',
      data: null,
      header: {
        'content-type': 'application/json',
        'cookie': 'JSESSIONID=' + app.globalData.session
      },
      success: function (res) {
        if (res.data.success) {
          that.setData({
            verifyApplying: res.data.data
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
  /*
添加足迹 */
  addGoodsList: function () {
    if (this.data.myinfo.verifyYn) {
      wx.navigateTo({
        url: '/pages/my/setGoods'
      })
    } else {
      if (this.data.verifyApplying) {
        wx.showModal({
          content: '认证还未通过审核,请耐心等待',
          showCancel: false,
          confirmText: "确定"
        })
      } else {
        wx.navigateTo({
          url: '/pages/my/verify'
        })
      }
    }

  },
  /**
   * 去足迹
   */
  goGoodsList: function (e) {
    let that = this;
    // let id = e.currentTarget.data.id;
    if (this.data.myinfo.verifyYn) {
      wx.navigateTo({
        url: '/pages/my/goodsList?userId=' + that.data.uid
      })
    } else {
      if (this.data.verifyApplying) {
        wx.showModal({
          content: '认证还未通过审核,请耐心等待',
          showCancel: false,
          confirmText: "确定"
        })
      } else {
        wx.showModal({
          title: '提示',
          content: '未认证不能查看，请去认证',
          confirmText:'去认证',
          success: function (res) {
            if (res.confirm) {
              wx.navigateTo({
                url: '/pages/mine/beijin_list/beijin_list'
              })
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        })
        
      }
    }
  },
  to_morepinlun(e) {
    wx.navigateTo({
      url: '/pages/mine/dianpin/dianpin?id=' + e.currentTarget.dataset.id,
    })
  },
   /**
   * 通过id获取用户信息
   */
  getinfo () {
    let that = this;
    wx.request({
      url: app.globalData.javahost + '/user/base/get/userInfo',
      method: 'POST',
      data: {
        "userId": that.data.uid
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
  * 关注
  */
  guanzhu(e) {
    let that = this;
    let id = e.currentTarget.dataset.id;
            wx.request({
              url: app.globalData.javahost + '/user/operate/follow',
              method: 'POST',
              data: {
                "userId": id
              },
              header: {
                'content-type': 'application/json',
                'cookie': 'JSESSIONID=' + app.globalData.session
              },
              success: function (res) {
                console.info(res)
                if (res.data.success) {
                  // that.setData({
                  //   userInfo: res.data.data
                  // })
                  that.getinfo();
                  wx.showToast({
                    title: '成功',
                    icon: 'success',
                    duration: 2000
                  })
                }

              }
            })
  },
  to_tzRenzheng () {
    let that = this;
    if (that.data.myinfo.identityType == '外贸人') {
      wx.navigateTo({
        url: '/pages/mine/beijin_list/beijin_list'
      })
    } else {
      wx.navigateTo({
        url: '/pages/my/verify'
      })
    }
  }
})