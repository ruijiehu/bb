let util = require('../../../utils/util.js');
const sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置
let app = getApp();
let reqData = {}, cache;
let allList = [], momentList = [];
let topCount = 0;
let r_data = {};

let col1H = 0;
let col2H = 0;
let getData = {

  "currentPage": 1,
  "pageSize": 10
}
let getData_my = {

  "currentPage": 1,
  "orderBys": [
    {
      "field": "createTime",
      "orderType": "DESC"
    }
  ],
  "pageSize": 10
}

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
    pointIndx: 0,
    pointList: [
      { "id": "外贸人", "name": "外贸人" },
      { "id": "企业主", "name": "企业主" }]
    ,
    phone: '',
    listHasMore: true,
    listHasMore_my: true,
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
    c_id: null,  //单个圈子id，用来点击采购信息中的更多和成员列表
    memberlist: [],  //成员列表
    _num: null,
    is_guanzhu: null,
    infoid: null,
    cirlce_length:null,
    dates: "开始时间",
    dates_end: "请选择",
    selected: false,   //tab切换
    selected1: true,
    scrollH: 0,
    imgWidth: 0,
    loadingCount: 0,
    images: [],
    col1: [],
    my_col1: [],
    col2: [],
    my_col2: [],
    persons: [],
    myimg: null, //是否关注的人有东西
    p_0: null,
    p_1: null,
    p_2: null,
    p_3: null,
    p_yn: []
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var day = new Date();
    var y = day.getFullYear();
    var m = day.getMonth() + 1;
    var d = day.getDate();
    // that.setData({
    //   flowID: options.manid,
    //   dates_end: y + '-' + m + '-' + d
    // })

    wx.getSystemInfo({
      success: (res) => {
        let ww = res.windowWidth;
        let wh = res.windowHeight;
        let imgWidth = ww * 0.48;
        let scrollH = wh;

        this.setData({
          scrollH: scrollH,
          imgWidth: imgWidth
        });
      }
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
    let that = this;
    // this.init();
    
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
    getData.currentPage = 1;
    getData_my.currentPage = 1;
    this.data.col1 = [];
    this.data.my_col1 = [];
    this.data.col2 = [];
    this.data.my_col2 = [];
    this.setData({
      images: []
    })
    this.setData({
      listHasMore: true,
      listHasMore_my: true

    })
    this.init();
    wx.stopPullDownRefresh()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    //如果是热门
    if (this.data.selected1){
      getData.currentPage = getData.currentPage + 1;

      wx.showToast({
        title: '加载更多中',
        icon: 'loading',
        duration: 500
      })
      this.getRemen();
    } else if (this.data.selected2){
      getData_my.currentPage = getData_my.currentPage + 1;

      wx.showToast({
        title: '加载更多中',
        icon: 'loading',
        duration: 500
      })
      this.getMyAttend();
    }
  
    
  },

  /*
  /**
   * 初始
   */
  init: function () {
    getData = {

      "currentPage": 1,
      "pageSize": 10
    }
    getData_my = {

      "currentPage": 1,
      "orderBys": [
        {
          "field": "createTime",
          "orderType": "DESC"
        }
      ],
      "pageSize": 10
    }
    this.data.listHasMore = true;
    this.data.listHasMore_my = true;
    this.data.userList = [];
    this.data.allList = [];
    this.data.showLoading = false;
    this.data.col1 = []
    this.data.my_col1 = []
    this.data.col2 = []
    this.data.my_col2 = []
    // this.getList();
    // this.getJoinList();
    // this.countRemind();
    // 临时
    this.getMyInfo();
    
    this.getRemen();
    this.getMyAttend();
    // this.firstCir();//先获取第一个圈子的信息

  },

  /**
   * 获取推荐的人
   */
  getPerson: function () {
    let that = this;
    wx.request({
      url: app.globalData.javahost + '/user/base/get/recommend/user',
      method: 'POST',
      data: null,
      header: {
        'content-type': 'application/json',
        'cookie': 'JSESSIONID=' + app.globalData.session
      },
      success: function (res) {
        if (res.data.success) {
          let cacheList = res.data.data;
          // cacheList.sort(compare('expRequire'));
          // wx.setStorageSync('randomCircleList', cacheList);
          var per = [];
          for(let i = 0; i< cacheList.length; i++){
            per.push(cacheList[i].followYn)
          }
          that.setData({
            persons: cacheList,
            p_0: cacheList[0].followYn,
            p_1: cacheList[1].followYn,
            p_2: cacheList[2].followYn,
            p_3: cacheList[3].followYn,
            p_yn: per
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
        console.info(res)
        if (res.data.success) {
            that.setData({
              selfInfo: res.data.data,
              infoid: res.data.data.userId,
              allBind: true,
              listLoading: false,
              showLoading: false
            })
            that.getPerson();
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
   * 添加提问 
   * 
   */
  addQuestion: function () {
    if (app.globalData.userInfo) {
      wx.showActionSheet({
        itemList: ['供需对接', '咨询问题'],
        success: function (e) {
          if (e.tapIndex == 0) {
            wx.navigateTo({
              url: '/pages/dynamic/info?type=SUPPLY'
            })
          } else if (e.tapIndex == 1) {
            wx.navigateTo({
              url: '/pages/dynamic/info?type=CONSULT'
            })
          }
        }
      })
    } else {
      this.setData({
        showBindPhone: true
      });
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
   * 提交绑定
   */
  // bindSubmit: function (e) {
  //   let that = this;
  //   let error = '';
  //   if (that.data.tradeIndex <= 0) {
  //     error = '你还没有选择行业';
  //   }
  //   if (that.data.countryIndex <= 0) {
  //     error = '你还没有选择省份城市';
  //   }
  //   if (error) {
  //     wx.showModal({
  //       content: error,
  //       showCancel: false,
  //       confirmText: "确定"
  //     })
  //   } else {
  //       wx.request({
  //         url: app.globalData.javahost + '/user/base/bind/cityAndTrade',
  //         method: 'POST',
  //         data: {
  //           "cityId": that.data.cityList[that.data.cityIndex].cityId, "tradeId": that.data.tradeList[that.data.tradeIndex].tradeId,
  //           "identityType": "外贸人"
  //         },
  //         header: {
  //           'content-type': 'application/json',
  //           'cookie': 'JSESSIONID=' + app.globalData.session
  //         },
  //         success: function (res) {
  //           if (res.data.success) {
  //             wx.showToast({
  //               title: "已绑定",
  //               duration: 2000
  //             })
  //             that.setData({
  //               showBindInfo: false,
  //               allBind: true
  //             });
  //             that.getMemberList();
  //             that.getAll();
  //           } else {
  //             app.errorMsg(res.data.errorCode, res.data.errorMsg, function (userInfo) {
  //               //更新数据
  //               this.setData({
  //                 userInfo: userInfo
  //               })
  //               this.init();
  //             })
  //           }

  //         }
  //       })
  //   }
  // },
  /**
   * 绑定手机
   */
//   bindPhone: function (e) {
//     let that = this
//     let error = '';
//     let bindPhoneInfo = {
//       // "nickname": e.detail.value.nickname,
//       "phone": that.data.sendPhone,
//       "vercode": e.detail.value.vercode
//     }
//     if (bindPhoneInfo.vercode) {

//     } else {
//       error = '请输入验证码';
//     }
//     // if (bindPhoneInfo.nickname) {

//     // } else {
//     //   error = '请输入姓名';
//     // }
//     if (error) {
//       wx.showModal({
//         content: error,
//         showCancel: false,
//         confirmText: "确定"
//       })
//     } else {
//       wx.request({
//         url: app.globalData.javahost + '/user/base/bind/phone',
//         method: 'POST',
//         data: bindPhoneInfo,
//         header: {
//           'content-type': 'application/json',
//           'cookie': 'JSESSIONID=' + app.globalData.session
//         },
//         success: function (res) {
//           if (res.data.success) {
//             wx.showToast({
//               title: "已绑定",
//               duration: 2000
//             })
//             that.setData({
//               showBindPhone: false,
//               'selfInfo.phone': bindPhoneInfo.phone
//             });

//           } else {
//             app.errorMsg(res.data.errorCode, res.data.errorMsg, function (userInfo) {
//               //更新数据
//               this.setData({
//                 userInfo: userInfo
//               })
//               this.init();
//             })
//           }

//         }
//       })
//     }

//   },
//   /**
//  * 手机号码输入
//  */
//   inputPhone: function (e) {
//     this.setData({
//       phone: e.detail.value
//     })
//   },

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
   * 发布
   */
  addItem: function (e) {
    if (this.data.selfInfo.verifyYn) {
      wx.navigateTo({
        url: '/pages/dynamic/info?type=SUPPLY'
      })
    } else {
      wx.navigateTo({
        url: '/pages/my/verify'
      })
    }
  },
  /**
 * 查看消息
 */
  showNews: function () {
    wx.navigateTo({
      url: '/pages/my/newsList'
    })
  },

  /**
 * 去完善资料
 */
  extendInfo: function (e) {
    wx.removeStorageSync('selUserTaglist');
    wx.navigateTo({
      url: '/pages/my/tagList?isBind=true'
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
   *  //去圈子成员列表
   */

  to_member(e) {
    wx.navigateTo({
      url: '/pages/circle/member_list/member_list?cirid=' + e.currentTarget.dataset.cirid
    })
  },

  /**
   * 添加圈子
   */
  addcircle() {
    wx.navigateTo({
      url: '/pages/circle/circle_addlist/cirlce_addlist?length=' + this.data.cirlce_length
    })
  },
  // 去采购详情
  to_cgDetail(e) {
    let that = this;
    // if (this.data.selfInfo.verifyYn) {
      wx.navigateTo({
        url: '/pages/circle/pur_show/pur_show?purid=' + e.currentTarget.dataset.purid
      })
    


  },
  
  /**
   * 去圈子内容详情
   */
  to_questionDetail(e) {
    let that = this;
    // if (this.data.selfInfo.verifyYn) {
      wx.navigateTo({
        url: '/pages/circle/exchange_show/exchange_show?id=' + e.currentTarget.dataset.id
      })
    
  },
  /**
   * 关注人
   */
  guanzhuren(e) {
    let id = e.currentTarget.dataset.id;
    wx.showActionSheet({
      itemList: ['关注', '取消'],
      success: function (res) {
        console.log(res.tapIndex)
        if (res.tapIndex == 0) {
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
              if (res.data.success) {
                wx.showToast({
                  title: '成功',
                  icon: 'success',
                  duration: 2000
                })

              }
            },

          })
        } else {

        }
      },
      fail: function (res) {
        console.log(res.errMsg)
      }
    })
  },
  /**
   * 判断是否已经关注这个人
   */
  panduan(s) {

    wx.request({
      url: app.globalData.javahost + '/user/operate/check/follow',
      method: 'POST',
      data: { "userId": s },
      header: {
        'content-type': 'application/json',
        'cookie': 'JSESSIONID=' + app.globalData.session
      },
      success: function (res) {
        // console.info(res)
        console.info(res.data.data)
        // if (res.data.success) {
        //   wx.showToast({
        //     title: '成功',
        //     icon: 'success',
        //     duration: 2000
        //   })

        // }
      },

    })
  },

  /**
   * 点赞
   */
  dianzan(e) {
    console.info(e)
    let that = this;
    wx.request({
      url: app.globalData.javahost + '/user/operate/praise',
      method: 'POST',
      data: {
        "id": e.currentTarget.dataset.id,
        "type": 2
      },
      header: {
        'content-type': 'application/json',
        'cookie': 'JSESSIONID=' + app.globalData.session
      },
      success: function (res) {
        console.info(res);
        // that.setData({
        //   tuijianList: []
        // })
        // this.data.tuijianList = [];
        // that.setData({
        //   tuijianList: []
        // })
        // that.getFlow();
        wx.showToast({
          title: '成功',
          icon: 'success',
          duration: 2000
        })
      },

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
    // wx.navigateTo({
    //   url: '/pages/mine/detail/detail_other?uid=' + id
    // }),
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
      // 是去自己的个人信息
      // wx.switchTab({
      //   url: '/pages/mine/info/info'
      // })
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
   * 分享的交流和采购
   */
  f_x(e) {
    let id = e.currentTarget.dataset.id;
    let tit = e.currentTarget.dataset.tit;
    let summary = e.currentTarget.dataset.summary;
    let imgs = e.currentTarget.dataset.imgs;
    let itype = e.currentTarget.dataset.type;
    wx.navigateTo({
      url: '/pages/home_page/share_fen/share_fen?id=' + id + '&tit=' + tit + '&summary=' + summary + '&imgs=' + imgs + '&type=' + itype
    })
  },
  /**
  * 更多
  */
  more_edit(e) {
    let that = this;
    let id = e.currentTarget.dataset.id;
    wx.showActionSheet({
      itemList: ['关注'],
      success: function (res) {
        console.log(res.tapIndex)
        if (res.tapIndex == 0) {
          // 关注
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
              that.init();
              wx.showToast({
                title: '关注成功',
                icon: 'success',
                duration: 2000
              })
            },

          })


        } else {
          // 举报
        }
      },
      fail: function (res) {
        console.log(res.errMsg)
      }
    })
  },
  /**
 * 取消关注
 */
  more_edit_cancel(e) {
    let that = this;
    let id = e.currentTarget.dataset.id;
    wx.showActionSheet({
      itemList: ['取消关注'],
      success: function (res) {
        console.log(res.tapIndex)
        if (res.tapIndex == 0) {
          // 关注
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
              that.init();
              wx.showToast({
                title: '取消成功',
                icon: 'success',
                duration: 2000
              })
            },

          })


        } else {
          // 举报
        }
      },
      fail: function (res) {
        console.log(res.errMsg)
      }
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
  },
  /**
   * tab栏切换
   */
  selected (e) {
    this.setData({
      selected1: false,
      selected: true
    })
  },
  selected1 (e) {
    this.setData({
      selected: false,
      selected1: true
    })
  },
  /**
   * 去发布视频
   */
  to_fbV () {
    wx.navigateTo({
      url: '/pages/home_page/send_jl/send_video',
    })
  },
  /**
   * 获取热门内容
   */
  getRemen () {
    let that = this;
    if (that.data.listHasMore) {
      wx.request({
        url: app.globalData.javahost + '/user/operate/get/page',
        method: 'POST',
        data: getData,
        header: {
          'content-type': 'application/x-www-form-urlencoded',
          'cookie': 'JSESSIONID=' + app.globalData.session
        },
        success: function (res) {
          console.info(res);
          if (res.data.success) {

            var old_col1 = that.data.col1;//获取原来的数据
            var old_col2 = that.data.col2;

            var arrImg = [];
            var imgs = res.data.data.content;
            var left = [];
            var right = [];
            for (var i = 0; i < imgs.length; i++) {
              if (i % 2 == 0) {
                left.push(imgs[i])
              } else {
                right.push(imgs[i])
              }
            }
            that.setData({
              images: imgs,
              col1: old_col1.concat(left),
              col2: old_col2.concat(right),
              // loadingCount: imgs.length,
              showLoading: false,
              listHasMore: res.data.data.currentPage >= res.data.data.pageCount ? false : true,
              isInit: true
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
   * 获取关注人的内容
   */
  getMyAttend() {
    let that = this;
    if (that.data.listHasMore_my) {
      console.info('在调用获取关注人内容')
      wx.request({
        url: app.globalData.javahost + '/user/operate/get/follow/page',
        method: 'POST',
        data: getData_my,
        header: {
          'content-type': 'application/json',
          'cookie': 'JSESSIONID=' + app.globalData.session
        },
        success: function (res) {
          console.info(res);
          if (res.data.success) {
            var old_col1_my = that.data.my_col1;//获取原来的数据
            var old_col2_my = that.data.my_col2;

            var arrImg = [];
            if(res.data.data!=undefined){
              var imgs = res.data.data.list;
              var left = [];
              var right = [];
              for (let i = 0; i < imgs.length; i++) {
                if (i % 2 == 0) {
                  left.push(imgs[i])
                } else {
                  right.push(imgs[i])
                }
              }
              that.setData({
                myimg: imgs,
                my_col1: old_col1_my.concat(left),
                my_col2: old_col2_my.concat(right),
                // loadingCount: imgs.length,
                showLoading: false,
                listHasMore_my: res.data.data.currentPage >= res.data.data.pageCount ? false : true,
                isInit: true
              })
            } else{
              that.setData({
                myimg: [],
                // my_col1: old_col1_my.concat(left),
                // my_col2: old_col2_my.concat(right),
                // loadingCount: imgs.length,
                showLoading: false,
                isInit: true
              })
            }
            
          } else{
            console.info('调用falsel ')
            app.errorMsg(res.data.errorCode, res.data.errorMsg, function (userInfo) {
              wx.showToast({
                title: '获取数据中',
              })
              //更新数据
              that.setData({
                userInfo: userInfo
              })
              that.init();
            })
          }

        }

      })
      console.info('调用H后了')
    } else {
      wx.showToast({
        title: '没有更多数据',
        icon: 'loading',
        duration: 500
      })
    }

  },
  toVideo (e) {
    console.info(e)
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/home_page/video/video?id=' + id,
    })
  },
  /**
   * 关注人
   */
  clickGuanzhu (e) {
    let that = this;
    console.info(e)
    console.info(e.currentTarget.dataset.in)
    let index = e.currentTarget.dataset.in;
    let id = e.currentTarget.dataset.id;
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
        // var next = e.currentTarget.dataset.next;
        if (res.data.success) {
          wx.showToast({
            title: '操作成功',
            icon: 'success',
            duration: 2000
          })
          var tt = that.data.p_yn;
          console.info(tt)
          tt[index] = res.data.data;
          var ttt = tt;
          console.info(ttt)
          that.setData({
            p_yn: ttt
          })

        }
      },

    })
  },
  /**
   * 去个人信息页
   */
  /**
* 进入名片
*/
  tomember(e) {
    let id = e.currentTarget.dataset.id;
    // let that = this;
 
    wx.navigateTo({
      url: '/pages/mine/detail/detail_other?uid=' + id
    })
  },
  /**
   * 去发布信息
   */
  to_msg () {
    wx.navigateTo({
      url: '/pages/msg/msg/newsList'
    })
  }
})