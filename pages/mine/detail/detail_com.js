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
    dengjixinxi: null,
    showImages: null
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
        that.init();
      } else {
        that.setData({
          isInit: true
        })
      }

    })
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
        if (res.data.success) {
          res.data.data.acceptAnswerPercent = res.data.data.acceptAnswerPercent ? (res.data.data.acceptAnswerPercent * 100).toFixed(2) + '%' : 0;
          that.setData({
            info: res.data.data,
            isInit: true
          })
          if (!res.data.data.verifyYn) {
            that.verifyApplyCheck();
          }
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

    }),
      /**
       * 获取公司信息
       */
      wx.request({
        url: app.globalData.javahost + '/user/verify/get/company/info',
        method: 'POST',
        data: {
          "userId": that.data.userInfo.userId
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
              dengjixinxi: res.data.data
            })
            /**
            * 获取企业展示
            */
            wx.request({
              url: app.globalData.javahost + '/user/verify/company/show',
              method: 'POST',
              data: {
                "companyInfoId": res.data.data.companyInfoId
              },
              header: {
                'content-type': 'application/json',
                'cookie': 'JSESSIONID=' + app.globalData.session
              },
              success: function (_res) {
                console.info(_res)
                if (_res.data.success) {
                  console.info(_res.data)
                  that.setData({
                    showImages: _res.data.data
                  })
                }
              }
            })
          }
        }
      }),

      /**
       * 获取用户评论
       */

      wx.request({
        url: app.globalData.javahost + '/user/operate/byComment/list',
        method: 'POST',
        data: {

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
        "userId": that.data.userInfo.userId
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
          }
          that.setData({
            edu: array
          })
        }
      },

    })
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
        "conditons": [{ "field": "user.userId", "value": that.data.userInfo.userId }]
      },
      header: {
        'content-type': 'application/json',
        'cookie': 'JSESSIONID=' + app.globalData.session
      },
      success: function (res) {
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
添加供应链 */
  addGoodsList: function () {
    if (this.data.info.verifyYn) {
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
  goGoodsList: function () {
    if (this.data.info.verifyYn) {
      wx.navigateTo({
        url: '/pages/my/goodsList'
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
   * 去添加公司展示
   */
  goShowCompany (e) {
    wx.navigateTo({
      url: '/pages/mine/company/com_show?id=' + e.currentTarget.dataset.id
    })
  },
  /**
   * 去编辑自我介绍
   */
  to_editSelf(e) {
    wx.navigateTo({
      url: '/pages/mine/info/edit_self?id=' + e.currentTarget.dataset.id + '&info=' + e.currentTarget.dataset.info
    })
  },
  to_editMore(e) {
    wx.navigateTo({
      url: '/pages/my/userDetail?id=' + e.currentTarget.dataset.id,
    })
  },
  to_morepinlun(e) {
    wx.navigateTo({
      url: '/pages/mine/dianpin/dianpin?id=' + e.currentTarget.dataset.id,
    })
  },
  to_editwork() {
    wx.navigateTo({
      url: '/pages/mine/work_list/work_list',
    })
  },
  to_editeduit() {
    wx.navigateTo({
      url: '/pages/mine/study_list/study_list',
    })
  },
  /**
   * 去编辑公司
   */
  edit_com() {
    // wx.navigateTo({
    //   url: '/pages/mine/company/company'
    // })
  },
  /**
   * 去认证公司
   */
  qurenzhen() {
    wx.navigateTo({
      url: '/pages/mine/company/company'
    })
    // wx.navigateTo({
    //   url: '/pages/my/verify'
    // })
  },
  /**
   * 去编辑公司信息
   */
  to_edit(e) {
    wx.navigateTo({
      url: '/pages/mine/company/com_edit?id=' + e.currentTarget.dataset.id
    })
  }
})