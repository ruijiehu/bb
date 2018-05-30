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
    isOpen: null,
    com: null,
    bindposition: null,
    dates: "开始时间",
    dates_end: "请选择",
    showMen: true
  },
  onLoad: function (options) {
    var that = this;
   
    // this.getMemberList();//获取推荐用户
    app.getUserInfo(function (userInfo) {
      //更新数据
      if (userInfo) {
        that.setData({
          userInfo: userInfo,
        })
        that.init();
      } else {
        that.setData({
          isInit: true
        })
      }
    })
  },
  onShow() {
    var that = this;
    app.getUserInfo(function (userInfo) {
      //更新数据
      if (userInfo) {
        that.setData({
          userInfo: userInfo,
        })
        that.init();
      } else {
        that.setData({
          isInit: true
        })
      }
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
    reqData.currentPage = 1;
    this.data.allList = [];
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
    reqData.currentPage = reqData.currentPage + 1;
    // this.getList();
  },

  /**
 * 初始
 */
  init: function () {
    let that = this;

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
    this.data.allList = [];

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
    * 获取交流
    */
  getAll() {
    let that = this;

    wx.request({
      url: app.globalData.javahost + '/user/question/get/active/question',
      method: 'POST',
      data: {"showYn": false},
      header: {
        'content-type': 'application/json',
        'cookie': 'JSESSIONID=' + app.globalData.session
      },
      success: function (res) {
        console.info(res);
        if (res.data.success) {
          var array = [];
          for (let i = 0; i < res.data.data.length; i++) {
            cache = res.data.data[i];
            cache.createTime = util.getDateDiff(cache.createTime);
           
              cache.images = cache.images ? cache.images.split(";") : [];
           
         
            array.push(cache);
          }

          that.setData({
            ListAll: array,
            listHasMore: res.data.data.currentPage >= res.data.data.pageCount ? false : true,
            loadingHidden: true,
            listLoading: false,
            isInit: true
          })
          console.info(that.data.ListAll)
          setTimeout(function () {
            that.setData({
              showLoading: false
            })
          }, 300)
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


}) 
