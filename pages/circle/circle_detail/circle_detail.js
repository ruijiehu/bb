let util = require('../../../utils/util.js');
const sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置
let app = getApp();
let reqData = {}, cache;
let allList = [], momentList = [];
let topCount = 0;
function countdown(that) {
  var sendTxt = that.data.sendTxt
  if (sendTxt == 0) {
    that.setData({
      sendTxt: 0
    });
    return;
  }
  var time = setTimeout(function () {
    that.setData({
      sendTxt: sendTxt - 1
    });
    countdown(that);
  }
    , 1000)
}
/**
 * 排序
 */
function compare(property) {
  return function (a, b) {
    var value1 = a[property];
    var value2 = b[property];
    return value1 - value2;
  }
}
Page({
  data: {
    userInfo: {},
    allList: [],
    userList: [],
    momentList: [],
    joinList: [],
    circleId: '',
    circleInfo: {},
    sendTxt: 0,
    hiddenTop: true,
    showBindPhone: false,
    countryIndex: 0,//省份index
    cityIndex: 0,
    tradeIndex: 0,//行业index
    phone: '',
    listHasMore: true,
    listLoading: true,
    showLoading: true,
    isJoin: false,
    isInit: false,
    tabs: ["显示全部", "只显示我加入的"],
    activeIndex: 0,
    offsetRight: '32rpx',
    circleList: [],
    totalCount: 0,   //消息计数
    circleIDS: [],    //圈子id数组
    cirInfo: [],    //圈子信息
    cgInfo: [],    //采购信息
    quanziID: null,  //单个圈子id，用来点击采购信息中的更多和成员列表
    quanziDetail: {},  //圈子详情
    circle_length: null
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    that.setData({
      quanziID: options.cirid,
      cirlce_length: options.length
    })
    
    
    // if (app.globalData.userInfo){
    //   this.getCircle();
    // }else{
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo) {
      //更新数据
      if (userInfo) {
        that.setData({
          userInfo: userInfo,
        })
        that.init();
        // that.getCircle();
      } else {
        that.setData({
          isInit: true
        })
      }
    })
    // }


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
      this.countRemind();
      // this.getJoinList();
      this.getMyInfo();
      if (app.globalData.hasNew) {
        app.globalData.hasNew = false;
        allList = [];
        momentList = [];
        reqData = {
          "currentPage": 1,
          "pageSize": app.globalData.pageSize,
          "orderBys": [{ "field": "topYn", "orderType": "DESC" }, { "field": "createTime", "orderType": "DESC" }]
        }
        this.data.listHasMore = true;
        this.data.allList = [];
        this.data.momentList = [];
        this.data.showLoading = true;
        this.getList();
      }
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
    reqData.currentPage = reqData.currentPage + 1;
    this.getList();
  },

  /**
   * 用户点击右上角分享
   
  onShareAppMessage: function () {
    let shareData = {
      title: this.data.circleInfo.name,
      desc: this.data.circleInfo.notice,
      path: '/pages/connection/detail?circleId=' + this.data.circleId
    };
    return shareData;
  },*/
  /**
   * 初始
   */
  init: function () {
    allList = [];
    momentList = [];
    reqData = {
      "currentPage": 1,
      "pageSize": app.globalData.pageSize,
      "orderBys": [{ "field": "topYn", "orderType": "DESC" }, { "field": "createTime", "orderType": "DESC" }]
    }
    this.data.listHasMore = true;
    this.data.userList = [];
    this.data.allList = [];
    this.data.showLoading = true;
    this.getList();
    // this.getJoinList();
    this.countRemind();
    // 临时
    this.getMyInfo();

    this.getDetail();  //获取圈子详情
    // this.firstCir();//先获取第一个圈子的信息
    this.select_cir(); //获取圈子信息

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
          that.data.totalCount = 0;
          if (res.data.data.friendApplyVerifyCount) {
            that.data.totalCount += res.data.data.friendApplyVerifyCount;
          }
          if (res.data.data.sysMsgUnreadCount) {
            that.data.totalCount += res.data.data.sysMsgUnreadCount;
          }
          if (res.data.data.userTriggerMsgUnreadCount) {
            that.data.totalCount += res.data.data.userTriggerMsgUnreadCount;
          }
          that.setData({
            totalCount: that.data.totalCount
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
   * 获取列表
   */
  getList: function () {
    let that = this;
    if (that.data.listHasMore) {
      that.setData({
        listLoading: true
      });
      if (that.data.activeIndex == 1) {
        wx.request({
          url: app.globalData.javahost + '/user/circle/question/page',
          method: 'POST',
          data: reqData,
          header: {
            'content-type': 'application/json',
            'cookie': 'JSESSIONID=' + app.globalData.session
          },
          success: function (res) {
            if (res.data.success) {
              for (let i = 0; i < res.data.data.list.length; i++) {
                cache = res.data.data.list[i];
                cache.createTime = util.getDateDiff(cache.createTime);
                allList.push(cache);
              }
              that.setData({
                allList: allList,
                listHasMore: res.data.data.currentPage >= res.data.data.pageCount ? false : true,
                loadingHidden: true,
                listLoading: false,
                isInit: true
              })
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
      } else {
        wx.request({
          url: app.globalData.javahost + '/user/question/page',
          method: 'POST',
          data: reqData,
          header: {
            'content-type': 'application/json',
            'cookie': 'JSESSIONID=' + app.globalData.session
          },
          success: function (res) {
            if (res.data.success) {
              for (let i = 0; i < res.data.data.list.length; i++) {
                cache = res.data.data.list[i];
                cache.createTime = util.getDateDiff(cache.createTime);
                allList.push(cache);
              }
              that.setData({
                allList: allList,
                listHasMore: res.data.data.currentPage >= res.data.data.pageCount ? false : true,
                loadingHidden: true,
                listLoading: false,
                isInit: true
              })
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
      }


    } else {
      this.setData({
        listLoading: false
      });
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
          if (res.data.data.tradeView && res.data.data.tradeView.tradeId && res.data.data.cityView && res.data.data.cityView.cityId) {
            that.setData({
              selfInfo: res.data.data,
              showBindInfo: false,
              allBind: true,
              listLoading: false
            })
          } else {
            // that.getTrade();
            // that.getProvince();
            that.setData({
              selfInfo: res.data.data,
              showBindInfo: true,
              listLoading: false
            })

          }
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
   * 关闭绑定弹框
   */
  closeBind: function () {
    this.setData({
      showBindInfo: false
    });
  },
  /**
   * 查看问题
   */
  showQuestion: function (e) {

    wx.navigateTo({
      url: '/pages/dynamic/detail?questionId=' + e.currentTarget.dataset.id
    })

  },
  /**
 * 查看动态
 */
  showMoment: function (e) {
    wx.navigateTo({
      url: '/pages/my/momentInfo?momentId=' + e.currentTarget.dataset.id
    })
  },


  /**
  * 点赞
  */
  praiseItem: function (e) {

    let that = this;
    let id = e.currentTarget.dataset.id;
    let index = e.currentTarget.dataset.index;
    wx.request({
      url: app.globalData.javahost + '/user/moment/praise',
      method: 'POST',
      data: { "momentId": id },
      header: {
        'content-type': 'application/json',
        'cookie': 'JSESSIONID=' + app.globalData.session
      },
      success: function (res) {
        if (res.data.success) {
          if (that.data.momentList[index].praiseYn) {
            that.data.momentList[index].praiseCount = that.data.momentList[index].praiseCount - 1;
          } else {
            that.data.momentList[index].praiseCount = that.data.momentList[index].praiseCount + 1;
          }
          that.data.momentList[index].praiseYn = !that.data.momentList[index].praiseYn;

          that.setData({
            momentList: that.data.momentList
          })
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
  },


 
  // 跳去采购页面,采购信息更多
  toCGlist(e) {
    // console.info(e.currentTarget.dataset.cirid)
    wx.navigateTo({
      url: '/pages/circle/cg_list/cg_list?cirid=' + e.currentTarget.dataset.cirid
    })
  },
 
 /**
  * // 获取圈子详情
  */
  getDetail () {
    let that = this;
    wx.request({
      url: app.globalData.javahost + '/user/circle/get',
      method: 'POST',
      data: {
        "circleId": that.data.quanziID
      },
      header: {
        'content-type': 'application/json',
        'cookie': 'JSESSIONID=' + app.globalData.session
      },
      success(res) {
        console.info(res)
        
        if (res.data.success) {
          let quanzidetail = res.data.data;
          that.setData({
            quanziDetail: quanzidetail
          })
          console.info(that.data.quanziDetail)
        }

      },
      fail: function (res) {
        console.log(res.errMsg)
      }
    })
  },
  


  /**
   * 圈子获取数据下面渲染
   */

  select_cir() {
    let that = this;
    // console.info(e.currentTarget.dataset.cirid)
    // let cirid = e.currentTarget.dataset.cirid;
    //获取圈子内容
    wx.request({
      url: app.globalData.javahost + '/user/circle/question/page',
      method: 'POST',
      data: {
        "circleId": that.data.quanziID
      },
      header: {
        'content-type': 'application/json',
        'cookie': 'JSESSIONID=' + app.globalData.session
      },
      success(res) {
        console.info(res)
        if (res.data.success) {
          let cirInfo = res.data.data;
          var cirInfo = [];
          for (let i = 0; i < res.data.data.length; i++) {
            // 返回1是未关注，返回0是已关注
            // if(that.panduan(res.data.data.list[i].userView.userId)==1){
            //   res.data.data.list[i].is_guanzhu = 1
            // } else if (that.panduan(res.data.data.list[i].userView.userId) == 1){
            //   res.data.data.list[i].is_guanzhu = 0
            // }
            cache = res.data.data[i];
            cache.createTime = util.getDateDiff(cache.createTime);
            cirInfo.push(cache);
            }
          that.setData({
            cirInfo: cirInfo
          })
        }

      },
      fail: function (res) {
        console.log(res.errMsg)
      }
    }),
      /**
           * 获取圈子采购信息
           */
      wx.request({
        url: app.globalData.javahost + '/user/circle/purchase/info',
        method: 'POST',
        data: {
          "circleId": that.data.quanziID
        },
        header: {
          'content-type': 'application/json',
          'cookie': 'JSESSIONID=' + app.globalData.session
        },
        success(res) {
          console.info(res)
          if (res.data.success) {
            var array = [];
            for (let i = 0; i < res.data.data.length; i++) {

              cache = res.data.data[i];
              cache.createTime = util.getDateDiff(cache.createTime);
              if(cache.images!=undefined){
                cache.images.split(';')
              }
              
              array.push(cache);
            }
            // var cgInfo = res.data.data;
            that.setData({
              cgInfo: array
            })
          }

        },
        fail: function (res) {
          console.log(res.errMsg)
        }
      })
  },
 /**
  * 申请加入圈子
  */
  want_attend (e) {
    let that = this;
    let id = e.currentTarget.dataset.cirid
    if (that.data.selfInfo.verifyYn) {
      console.info(that.data.cirlce_length)
      if (that.data.cirlce_length == 3) {
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
                  "circleId": id
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
                  "circleId": id
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


  to_cgDetail () {
    wx.showModal({
      title: '提示',
      content: '你还未加入该圈子，加入后才能查看',
    })
  }
})