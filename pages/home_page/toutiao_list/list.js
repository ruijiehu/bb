//获取应用实例  
// var app = getApp()
let util = require('../../../utils/util.js');
let app = getApp();
let reqData = {}, cache;
let allList = [];
let topCount = 0;
let reqdata_new = {};
Page({
  data: {

    winWidth: 0,
    // winHeight: 0,
    // tab切换  
    currentTabB: 0,
    //精选内的tab
    winHeight: "",//窗口高度
    currentTab: 0, //预设当前项的值
    scrollLeft: 0, //tab标题的滚动条位置
    tagsArray: [],      //标签数组
    //list中的数据
    userInfo: {},
    selfInfo: {},
    allList: [],
    typeList: [],
    currentTag: 0,
    windowHeight: 1000,
    windowWidth: 375,
    listHasMore: true,
    listLoading: true,
    isInit: false,
    position: "fixed",
    bannerList: [],
    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    tuijianList: [], //推荐列表
    cgfxlist: null,
    jlfxlist: null,
    ListAll: [],
    infoid: null,
    countryIndex: 0,//省份index
    cityIndex: 0,
    tradeIndex: 0,//行业index
    pointIndx: 0,
    pointList: [
      { "id": "请选择角色", "name": "请选择角色" },
      { "id": "外贸人", "name": "外贸人" },
      { "id": "企业主", "name": "企业主" }
    ],
    showLoading: true,
    isInit: false,
    memberList: [],
    is_flow: '关注', //显示页面的字
    is_flow_n: 0, //判断点击数量
    isflow: [], //用来存是否关注的数组
    flowID: null,
    isOpen: false,
    com: null,
    bindposition: null,
    dates: "开始时间",
    dates_end: "请选择",
    showMen: true,
    activityImg: null,
    readDays: 0
  },
  onLoad: function (options) {
    var that = this;
    app.getUserInfo(function (userInfo) {
      //更新数据
      if (userInfo) {
        that.setData({
          userInfo: userInfo,
        })
        that.init();
        // that.getMemberList();
      } else {
        that.setData({
          isInit: true
        })
      }
    })
  },
  onShow() {
    var that = this;
    if (this.data.userInfo && this.data.isInit) {
      if (app.globalData.hasNew) {
        app.globalData.hasNew = false;
        app.getUserInfo(function (userInfo) {
          if (userInfo) {
            that.setData({
              userInfo: app.globalData.userInfo
            })
          }
        })
        // that.setData({
        //   userInfo: app.globalData.userInfo
        // })
        // that.getMemberList();
        that.init();
        console.info('index111111---------------')
      } else {
        console.info('index22222---------------')
      }


    } else {
      that.init();
      console.info('index3333---------------')
    }
    that.getDays();

  },
  /**
   * 隐藏推荐人
   */
  cancelShow() {
    this.setData({
      showMen: false
    })
    console.info(343434)
  },
  // 跳去详情文章
  to_detail(e) {
    console.info(123)
    wx.navigateTo({
      url: '/pages/home_page/detail_page/detail_page?newsId=' + e.currentTarget.dataset.id
    })
  },
  // 去采购详情
  to_cgDetail(e) {
    let that = this;
    console.info(e.currentTarget.dataset.id)
    // if (this.data.selfInfo.verifyYn) {
    wx.navigateTo({
      url: '/pages/circle/pur_show/pur_show?purid=' + e.currentTarget.dataset.id
    })
    
  },
  to_jldetail(e) {
    let that = this;
    console.info(e.currentTarget.dataset.id)
    wx.navigateTo({
      url: '/pages/circle/exchange_show/exchange_show?id=' + e.currentTarget.dataset.id
    })
  },

  /**
    * 页面相关事件处理函数--监听用户下拉动作
    */
  onPullDownRefresh: function () {
    let that = this;
    app.getUserInfo(function (userInfo) {
      if (userInfo) {
        that.setData({
          userInfo: app.globalData.userInfo
        })
      }
    })
    // reqData.currentPage = 1;
    reqdata_new.currentPage = 1;
    this.data.allList = [];
    that.data.ListAll = [];
    this.data.tuijianList = [];
    this.setData({
      listHasMore: true
    })
    this.init();
    // this.getList();
    // this.getFlow()
    wx.stopPullDownRefresh()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let that = this;
    reqdata_new.currentPage = reqdata_new.currentPage + 1;
    // this.getList();
    wx.showToast({
      title: '加载更多中',
      icon: 'loading',
      duration: 500
    })
    // setTimeout(function () {
    that.getAll();
    // }, 500)
  },

  /**
 * 初始
 */
  init: function () {
    let that = this;
    console.info('inint了')
    allList = [];
    topCount = 0;
    reqData = {
      "currentPage": 1,
      "pageSize": app.globalData.pageSize,
      "orderBys": [{ "field": "createTime", "orderType": "DESC" }]
    }
    this.setData({
      listHasMore: true
    })
    this.getSelfInfo();
    that.data.ListAll = [];

    reqdata_new = {
      "currentPage": 1,
      "orderBys": [
        {
          "field": "createTime",
          "orderType": "DESC"
        }
      ],
      "pageSize": 10
    }
    // this.openActive();
    this.getDays();
    this.getAll();
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
          //如果未认证
         
          if (res.data.data.tradeView && res.data.data.tradeView.tradeId && res.data.data.cityView && res.data.data.cityView.cityId) {
            that.setData({
              selfInfo: res.data.data,
              infoid: res.data.data.userId,
              showBindInfo: false,
              allBind: true,
              listLoading: false
            })
          } else {
            that.getTrade();
            that.getProvince();
            that.setData({
              selfInfo: res.data.data,
              showBindInfo: true,
              listLoading: false
            })

          }
        } else {

        }
      }
    })
  },
  // 关注
  to_flow(e) {
    console.info(e.currentTarget.dataset.typeid)
    wx.request({
      url: app.globalData.javahost + '/user/follow/newsType',
      method: 'POST',
      data: {
        "newsTypeId": e.currentTarget.dataset.typeid
      },
      header: {
        'content-type': 'application/json',
        'cookie': 'JSESSIONID=' + app.globalData.session
      },
      success: function (res) {
        console.info(res)
      },

    })
  },
  /**
   * 点赞分享
   */
  dianzan(e) {
    console.info(e)
    let that = this;
    wx.request({
      url: app.globalData.javahost + '/user/operate/praise',
      method: 'POST',
      data: {
        "id": e.currentTarget.dataset.tid,
        "type": 4
      },
      header: {
        'content-type': 'application/json',
        'cookie': 'JSESSIONID=' + app.globalData.session
      },
      success: function (res) {
        console.info(res);
        wx.showToast({
          title: '成功',
          icon: 'success',
          duration: 2000
        })
      },

    })
  },
  /**
   * 点赞交流
   */
  dianzan_jl(e) {
    let that = this;
    wx.request({
      url: app.globalData.javahost + '/user/operate/praise',
      method: 'POST',
      data: {
        "id": e.currentTarget.dataset.tid,
        "type": 2
      },
      header: {
        'content-type': 'application/json',
        'cookie': 'JSESSIONID=' + app.globalData.session
      },
      success: function (res) {
        console.info(res);
        wx.showToast({
          title: '成功',
          icon: 'success',
          duration: 500
        })
      },

    })
  },
  /**
   * 点赞采购
   */
  dianzan_cg(e) {
    let that = this;
    wx.request({
      url: app.globalData.javahost + '/user/operate/praise',
      method: 'POST',
      data: {
        "id": e.currentTarget.dataset.tid,
        "type": 3
      },
      header: {
        'content-type': 'application/json',
        'cookie': 'JSESSIONID=' + app.globalData.session
      },
      success: function (res) {
        console.info(res);
        wx.showToast({
          title: '成功',
          icon: 'success',
          duration: 2000
        })
      },

    })
  },
  /**
   * 对关注的人和自己的交流与采购的分享
   */
  f_x(e) {
    let that = this;
    console.info(e.currentTarget.dataset.id)
    let id = e.currentTarget.dataset.id;
    let tit = e.currentTarget.dataset.tit;
    let summary = e.currentTarget.dataset.summary;
    let imgs = e.currentTarget.dataset.imgs;
    console.log(e.currentTarget.dataset.imgs);
    let itype = e.currentTarget.dataset.type;
    wx.navigateTo({
      url: '/pages/home_page/share_fen/share_fen?id=' + id + '&tit=' + tit + '&summary=' + summary + '&imgs=' + imgs + '&type=' + itype
    })
  },
  /**
   * 更多
   */
  more_edit(e) {
    let id = e.currentTarget.dataset.id;
    wx.showActionSheet({
      itemList: ['取消关注'],
      success: function (res) {
        console.log(res.tapIndex)
        if (res.tapIndex == 0) {
          // 取消关注
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
              console.info(res);
              wx.showToast({
                title: '取消关注成功',
                icon: 'success',
                duration: 2000
              })
            },

          })


        } else {
          // 举报
        }
      }
    })
  },
  /**
   * 去用户信息页面
   */
  to_man(e) {
    let id = e.currentTarget.dataset.id;
    let that = this;
    console.info(id)
    console.info(that.data.infoid)
    console.info(that.data.infoid == id)
    if (that.data.infoid == id) {
      if (that.data.selfInfo.identityType != undefined) {
        if (that.data.selfInfo.identityType == '企业主') {
          wx.navigateTo({
            url: '/pages/mine/detail/detail_com?uid=' + id
          })
        } else if (that.data.selfInfo.identityType == '外贸人') {
          wx.navigateTo({
            url: '/pages/mine/detail/detail?uid=' + id
          })
        }
      }
    } else {
      // 判断是什么身份，外贸人和企业主

      wx.request({
        url: app.globalData.javahost + '/user/base/get/userInfo',
        method: 'POST',
        data: {
          "userId": id
        },
        header: {
          'content-type': 'application/json',
          'cookie': 'JSESSIONID=' + app.globalData.session
        },
        success: function (res) {
          console.info(res);
          if (res.data.success) {
            let data = res.data.data;
            if (data.identityType != undefined) {
              if (data.identityType == '企业主') {
                wx.navigateTo({
                  url: '/pages/mine/detail/detail_com_other?uid=' + id
                })
              } else if (data.identityType == '外贸人') {
                wx.navigateTo({
                  url: '/pages/mine/detail/detail_other?uid=' + id
                })
              }
            }

          }

        }

      })

    }

  },
  /**
   * 去自己信息
   */
  to_myself(e) {
    let that = this;
    if (that.data.selfInfo.identityType != undefined) {
      console.info(123)
      if (that.data.selfInfo.identityType == '企业主') {
        wx.navigateTo({
          url: '/pages/mine/detail/detail_com?uid=' + e.currentTarget.dataset.id
        })
      } else if (that.data.selfInfo.identityType == '外贸人') {
        wx.navigateTo({
          url: '/pages/mine/detail/detail?uid=' + e.currentTarget.dataset.id
        })
      }
    } else {
      console.info(233333333333)
    }
  },
  /**
    * 首页获取所有
    */
  getAll() {
    let that = this;
    if (that.data.listHasMore) {
      wx.request({
        url: app.globalData.javahost + '/user/news/page',
        method: 'POST',
        data: reqdata_new,
        header: {
          'content-type': 'application/json',
          'cookie': 'JSESSIONID=' + app.globalData.session
        },
        success: function (res) {
          console.info(res);
          if (res.data.success) {
            // if (that.data.listHasMore){
            var alllist = that.data.ListAll;



            var array = [];
            for (let i = 0; i < res.data.data.list.length; i++) {
              cache = res.data.data.list[i];
              cache.releaseTime = util.getDateDiff(cache.releaseTime);
              // cache.images = cache.images ? cache.images.split(";") : [];
              array.push(cache);

            }
           

            that.setData({
              ListAll: alllist.concat(array),
              listHasMore: res.data.data.currentPage >= res.data.data.pageCount ? false : true,
              loadingHidden: true,
              listLoading: false,
              isInit: true
            })
            if (that.data.ListAll.length > 10) {
              if (!that.data.selfInfo.verifyYn && that.data.ListAll[9].t == undefined) {
                that.data.ListAll.splice(9, 0, { t: 2 })
              }
            }

            // }

            console.info(that.data.ListAll)
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


        }

      })
    } else {
      wx.showToast({
        title: '没有更多数据',
        icon: 'loading',
        duration: 500
      })
    }

  },
  /**
   * 第几天阅读
   */
  getDays () {
    let that = this;
    wx.request({
      url: app.globalData.javahost + '/user/news/get/read',
      method: 'POST',
      data: {},
      header: {
        'content-type': 'application/json',
        'cookie': 'JSESSIONID=' + app.globalData.session
      },
      success: function (res) {
        console.info(res);
        if (res.data.success) {
          console.info(res.data.data)
          that.setData({
            readDays: res.data.data
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


      }

    })
  },
  /**
  * 去圈子内容详情,交流
  */
  to_jlDetail(e) {
    let that = this;
    console.info(e.currentTarget.dataset.id)
    // if (this.data.selfInfo.verifyYn) {
    wx.navigateTo({
      url: '/pages/circle/exchange_show/exchange_show?id=' + e.currentTarget.dataset.id
    })
  },
  /**
   * 去首页分享的详情页
   */
  to_fx_detail(e) {
    console.info(123)
    let that = this;
    console.info(e.currentTarget.dataset.id)
    // if (this.data.selfInfo.verifyYn) {
    wx.navigateTo({
      url: '/pages/home_page/fenxiang_detail/fenxiang_detail?id=' + e.currentTarget.dataset.id + '&nick=' + e.currentTarget.dataset.nick + '&con=' + e.currentTarget.dataset.con
    })
  },
  /**
  * 转发关注的人和自己的分享
  */
  zhuanfa(e) {
    let that = this;
    console.info(e.currentTarget.dataset.id)
    // if (this.data.selfInfo.verifyYn) {
    let id = e.currentTarget.dataset.id;
    // let tit = e.currentTarget.dataset.tit;
    // let summary = e.currentTarget.dataset.summary;
    let imgs = e.currentTarget.dataset.imgs;
    let itype = e.currentTarget.dataset.type;
    let msg = e.currentTarget.dataset.msg;
    let content_one = e.currentTarget.dataset.content_one;
    wx.navigateTo({
      url: '/pages/home_page/share_fen/share_zhuanfa?id=' + id + '&msg=' + msg + '&content_one=' + content_one + '&imgs=' + imgs + '&type=' + itype
    })

  },
  /**
   * 转发分享精选
   */
  zhuanfa_jx(e) {
    let that = this;
    console.info(e.currentTarget.dataset.id)

    let id = e.currentTarget.dataset.id;
    let tit = e.currentTarget.dataset.tit;
    let summary = e.currentTarget.dataset.summary;
    let imgs = e.currentTarget.dataset.imgs;
    // let itype = e.currentTarget.dataset.type;
    let itype = 0;
    wx.navigateTo({
      url: '/pages/home_page/share_fen/share_fen_jx?id=' + id + '&tit=' + tit + '&summary=' + summary + '&imgs=' + imgs + '&type=' + itype
    })


  },

  to_send() {
    wx.navigateTo({
      url: '/pages/home_page/send_jl/send_jl'
    })
  },
  /**
* 获取省份
*/
  getProvince: function () {
    let that = this;
    wx.request({
      url: app.globalData.javahost + '/user/location/province/list',
      method: 'POST',
      data: null,
      header: {
        'content-type': 'application/json',
        'cookie': 'JSESSIONID=' + app.globalData.session
      },
      success: function (res) {
        if (res.data.success) {
          res.data.data.unshift({ "provinceId": 0, "name": "请选择省份" })
          let provinceId = res.data.data[0].provinceId;
          if (that.data.selfInfo.cityView && that.data.selfInfo.cityView.provinceView) {
            provinceId = that.data.selfInfo.cityView.provinceView.provinceId
            for (let i = 0; i < res.data.data.length; i++) {
              if (provinceId == res.data.data[i].provinceId) {
                that.data.countryIndex = i;
                break;
              }
            }
          }
          that.getCity(provinceId);
          that.setData({
            provinceList: res.data.data,
            countryIndex: that.data.countryIndex
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
   * 获取城市
   */
  getCity: function (id) {
    let that = this;
    if (id > 0) {
      wx.request({
        url: app.globalData.javahost + '/user/location/province/city/list',
        method: 'POST',
        data: { "provinceId": id },
        header: {
          'content-type': 'application/json',
          'cookie': 'JSESSIONID=' + app.globalData.session
        },
        success: function (res) {
          if (res.data.success) {
            if (that.data.selfInfo.cityView) {
              let cityId = that.data.selfInfo.cityView.cityId
              for (let i = 0; i < res.data.data.length; i++) {
                if (cityId == res.data.data[i].cityId) {
                  that.data.cityIndex = i;
                  break;
                }
              }
            }

            that.setData({
              cityList: res.data.data,
              cityIndex: that.data.cityIndex
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
    } else {
      that.setData({
        cityList: [{ "cityId": 0, "name": "请选择城市" }],
        cityIndex: 0
      })
    }

  },
  /**
   * 获取行业
   */
  getTrade: function () {
    let that = this;
    wx.request({
      url: app.globalData.javahost + '/user/trade/get/all',
      method: 'POST',
      data: null,
      header: {
        'content-type': 'application/json',
        'cookie': 'JSESSIONID=' + app.globalData.session
      },
      success: function (res) {
        if (res.data.success) {
          res.data.data.unshift({ "tradeId": 0, "name": "请选择行业" })
          if (that.data.selfInfo.tradeView) {
            let tradeId = that.data.selfInfo.tradeView.tradeId
            for (let i = 0; i < res.data.data.length; i++) {
              if (tradeId == res.data.data[i].tradeId) {
                that.data.tradeIndex = i;
                break;
              }
            }
          }
          that.setData({
            tradeList: res.data.data,
            tradeIndex: that.data.tradeIndex
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
* 行业选择
*/
  bindTradeChange: function (e) {
    this.setData({
      tradeIndex: parseInt(e.detail.value)
    })
  },
  /**
   * 省份选择
   */
  bindCountryChange: function (e) {
    let id = parseInt(e.detail.value);
    this.getCity(this.data.provinceList[id].provinceId);
    this.setData({
      countryIndex: id,
      cityIndex: 0
    })
  },
  /**
   * 城市选择
   */
  bindcityChange: function (e) {
    this.setData({
      cityIndex: parseInt(e.detail.value)
    })
  },
  /**
 * 身份选择
 */
  bindPointChange: function (e) {

    this.setData({
      pointIndex: parseInt(e.detail.value)
    })
  },
  /**
  * 提交绑定
  */
  bindSubmit: function (e) {
    let that = this;
    let error = '';
    console.info(e)
    console.info(e.detail.value.com)
    // if (e.detail.value.com) {
    //   console.info(e.detail.value.com)
    // } else {
    //   console.info(23232323)
    // }
    console.info(e.detail.value.bindposition)
    console.info(that.data.dates)
    // console.info(that.data.dates_end)
    if (that.data.tradeIndex <= 0) {
      error = '你还没有选择行业';
    }
    if (that.data.countryIndex <= 0) {
      error = '你还没有选择省份城市';
    }
    if (error) {
      wx.showModal({
        content: error,
        showCancel: false,
        confirmText: "确定"
      })
    } else {
      // if (e.detail.value.com && e.detail.value.bindposition && that.data.dates != '请选择' && that.data.dates_end != '请选择') {
      // wx.request({
      //   url: app.globalData.javahost + '/user/base/bind/cityAndTrade',
      //   method: 'POST',
      //   data: {
      //     "cityId": that.data.cityList[that.data.cityIndex].cityId,
      //     "tradeId": that.data.tradeList[that.data.tradeIndex].tradeId,
      //     "identityType": "外贸人",
      //     "company": e.detail.value.com,
      //     "position": e.detail.value.bindposition,
      //     "startTime": that.data.dates,
      //     "endTime": that.data.dates_end
      //   },
      //   header: {
      //     'content-type': 'application/json',
      //     'cookie': 'JSESSIONID=' + app.globalData.session
      //   },
      //   success: function (res) {
      //     if (res.data.success) {
      //       wx.showToast({
      //         title: "已绑定",
      //         duration: 2000
      //       })
      //       that.setData({
      //         showBindInfo: false,
      //         allBind: true
      //       });
      //       that.getMemberList();
      //       that.getAll();
      //     } else {
      //       app.errorMsg(res.data.errorCode, res.data.errorMsg, function (userInfo) {
      //         //更新数据
      //         this.setData({
      //           userInfo: userInfo
      //         })
      //         this.init();
      //       })
      //     }

      //   }
      // })
      // } else if (!e.detail.value.com && !e.detail.value.bindposition) {
      wx.request({
        url: app.globalData.javahost + '/user/base/bind/cityAndTrade',
        method: 'POST',
        data: {
          "cityId": that.data.cityList[that.data.cityIndex].cityId, "tradeId": that.data.tradeList[that.data.tradeIndex].tradeId,
          "identityType": "外贸人"
        },
        header: {
          'content-type': 'application/json',
          'cookie': 'JSESSIONID=' + app.globalData.session
        },
        success: function (res) {
          if (res.data.success) {
            wx.showToast({
              title: "已绑定",
              duration: 2000
            })
            that.setData({
              showBindInfo: false,
              allBind: true
            });
            that.getMemberList();
            that.getDays();
            that.getAll();
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
      // } else {
      // wx.showModal({
      //   content: "请完整填写所有信息",
      //   showCancel: false,
      //   confirmText: "确定"
      // })
      // }


    }
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
   * 获取推荐的人
   */
  getMemberList() {
    let that = this;
    wx.request({
      url: app.globalData.javahost + '/user/base/get/recommend/user',
      method: 'POST',
      data: {},
      header: {
        'content-type': 'application/json',
        'cookie': 'JSESSIONID=' + app.globalData.session
      },
      success: function (res) {
        if (res.data.success) {
          console.info(123323213213213231213123123)
          console.info(res.data)
          var isflow = []
          // for(var i = 0; i<res.data.data.length;i++){
          //   isflow.push({ "index": i, "isflow": res.data.data[i].followYn})
          // }
          that.setData({
            memberList: res.data.data
            // isflow: isflow
          });
          // console.info(that.data.isflow)
        } else {

        }

      }
    })

  },
  /**
   * 随机推荐那里的关注
   */
  to_addAttend(e) {
    let that = this;
    that.setData({
      is_flow_n: that.data.is_flow_n + 1
    })

    let ttype = e.currentTarget.dataset.t;
    let id = e.currentTarget.dataset.id;
    console.info(e.currentTarget.dataset.next)
    //去关注
    wx.request({
      url: app.globalData.javahost + '/user/operate/follow',
      method: 'POST',
      data: { "userId": id },
      header: {
        'content-type': 'application/json',
        'cookie': 'JSESSIONID=' + app.globalData.session
      },
      success: function (res) {
        console.info(res)
        var next = e.currentTarget.dataset.next;
        if (res.data.success) {
          wx.showToast({
            title: '操作成功',
            icon: 'success',
            duration: 2000
          })
          var arr = that.data.memberList
          arr.splice(next, 1)
          that.setData({
            memberList: arr
          })

        }
      },

    })
  },
  /**
   * 进入名片
   */
  to_Man(e) {
    let id = e.currentTarget.dataset.id;
    wx.request({
      url: app.globalData.javahost + '/user/base/get/userInfo',
      method: 'POST',
      data: {
        "userId": id
      },
      header: {
        'content-type': 'application/json',
        'cookie': 'JSESSIONID=' + app.globalData.session
      },
      success: function (res) {
        console.info(res);
        if (res.data.success) {
          let data = res.data.data;
          if (data.identityType != undefined) {
            if (data.identityType == '企业主') {
              wx.navigateTo({
                url: '/pages/mine/detail/detail_com_other?uid=' + id
              })
            } else if (data.identityType == '外贸人') {
              wx.navigateTo({
                url: '/pages/mine/detail/detail_other?uid=' + id
              })
            } else {
              wx.showModal({
                title: '提示',
                content: '该用户不是企业主或外贸人',
                success: function (res) {
                  if (res.confirm) {
                    console.log('用户点击确定')
                  } else if (res.cancel) {
                    console.log('用户点击取消')
                  }
                }
              })
            }
          } else {
            wx.showModal({
              title: '提示',
              content: '该用户不是企业主或外贸人',
              success: function (res) {
                if (res.confirm) {
                  console.log('用户点击确定')
                } else if (res.cancel) {
                  console.log('用户点击取消')
                }
              }
            })
          }

        }

      }

    })
  },
  /**
   * 首页顶部引导认证
   */
  to_verify() {
    let that = this;
    if (that.data.selfInfo.identityType == '外贸人') {
      wx.navigateTo({
        url: '/pages/mine/beijin_list/beijin_list'
      })
    } else {
      wx.navigateTo({
        url: '/pages/mine/company/company'
      })
    }
  },
  to_active() {
    wx.navigateTo({
      url: "/pages/home_page/activity/active_page"
    })
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
  }

}) 
