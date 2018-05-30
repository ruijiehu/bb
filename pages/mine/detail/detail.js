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
    dianpin:null,
    edu: [],
    work_one: null,
    worklist: []
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
        that.init();
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

    })
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
          var array = [];
          var one = [];
          var cache = null;
          for (let i = 0; i < res.data.data.length; i++) {
            cache = res.data.data[i];
            // cache.startTime = util.getDateDiff(cache.startTime);
            // cache.endTime = util.getDateDiff(cache.endTime);
            array.push(cache);
            if(res.data.data[i].type==1){
              one.push(res.data.data[i])
            }
          }
          var edu = []; var worklist = [];
          for(var i = 0; i<array.length; i++){
              if(array[i].type==0){
                edu.push(array[i])
              } else if (array[i].type == 1){
                worklist.push(array[i])
              }
          }
          console.info(one[0])
          that.setData({
            edu: edu,
            worklist: worklist,
            work_one: one[0]
          })
          console.info(that.data.work_one)
          console.info(that.data.worklist)
          console.info(that.data.edu)
          console.info(array)
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
    let that = this
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
        // wx.navigateTo({
        //   url: '/pages/my/verify'
        // })
        wx.showModal({
        title: '提示',
        content: '未认证不能添加，请去认证',
        confirmText: '去认证',
        success: function (res) {
          if (res.confirm) {
            if (that.data.info.identityType == '外贸人') {
              wx.navigateTo({
                url: '/pages/mine/beijin_list/beijin_list'
              })
            } else {
              wx.navigateTo({
                url: '/pages/my/verify'
              })
            }

          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
      }
    }

  },
  /**
   * 去供应链
   */
  goGoodsList: function () {
    let that = this;
      wx.navigateTo({
        url: '/pages/my/goodsList'
      })
  },
  /**
   * 去编辑自我介绍
   */
  to_editSelf(e) {
    wx.navigateTo({
      url: '/pages/mine/info/edit_self?id=' + e.currentTarget.dataset.id + '&info=' + e.currentTarget.dataset.info + '&nick=' + e.currentTarget.dataset.nick
    })
  },
  to_editMore(e) {
    wx.navigateTo({
      url: '/pages/my/userDetail?id=' + e.currentTarget.dataset.id,
    })
  },
  to_morepinlun (e) {
    wx.navigateTo({
      url: '/pages/mine/dianpin/dianpin?id=' + e.currentTarget.dataset.id,
    })
  },
  to_addwork () {
    wx.navigateTo({
      url: '/pages/mine/work_list/work_list',
    })
  },
  to_addedu () {
    wx.navigateTo({
      url: '/pages/mine/study_list/study_list',
    })
  },
  /**
   * 去认证那里,整个经历列表
   */
  torenzhen () {
    wx.navigateTo({
      url: '/pages/mine/beijin_list/beijin_list',
    })
  },
  /**
   * 编辑教育经历
   */
  bianji_edu (e) {
    let id = e.currentTarget.dataset.id;
    let school = e.currentTarget.dataset.school;
    let major = e.currentTarget.dataset.major;
    let education = e.currentTarget.dataset.education;
    wx.navigateTo({
      url: '/pages/mine/study_list/edit_study?id=' + id + '&school=' + school + '&major=' + major + '&education=' + education
    })
  },
  /**
   * 编辑工作经历
   */
  bianji_work (e) {
    let id = e.currentTarget.dataset.id;
    let company = e.currentTarget.dataset.company;
    let position = e.currentTarget.dataset.position;
    
    wx.navigateTo({
      url: '/pages/mine/work_list/edit_work?id=' + id + '&company=' + company + '&position=' + position
    })
  },
  /**
   * 没有工作经历，直接去添加
   */
  to_addwork () {
    wx.navigateTo({
      url: '/pages/mine/work_list/work_list',
    })
  },
  /**
   * 没有教育经历，直接去添加
   */
  to_addedu () {
    wx.navigateTo({
      url: '/pages/mine/study_list/study_list',
    })
  }
})