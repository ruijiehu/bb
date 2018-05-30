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
    edu: null,
    is_worked: null,
    work_one: null,
    countryIndex: 0,//省份index
    cityIndex: 0,
    tradeIndex: 0,//行业index
    pointIndx: 0,
    pointList: [
      // { "id": "请选择角色", "name": "请选择角色" },
      { "id": "外贸人", "name": "外贸人" },
      { "id": "企业主", "name": "企业主" }],
    dates: "开始时间",
    dates_end: "请选择",
    // showBindInfo: false
    erweima: null,
    image: null,
    showPoint: false
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
    that.setData({
      flowID: options.manid,
      dates_end: y + '-' + m + '-' + d
    })
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
    // 定时几天获取访问人

    let one;
    one = setInterval(() => {
      wx.request({
        url: app.globalData.javahost + '/user/base/get/visit/remind',
        method: 'POST',
        data: null,
        header: {
          'content-type': 'application/json',
          'cookie': 'JSESSIONID=' + app.globalData.session
        },
        success: function (res) {
          console.info(res)
          if (res.data.success) {
            if (res.data.data) {
              that.setData({
                showPoint: true
              })
            } else {
              that.setData({
                showPoint: false
              })
            }

            clearInterval(one)
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

      });
    }, 3600 * 24 * 3)
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
    }else{
      // this.init();
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
        // 产生二维码
          wx.request({
            url: 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wxb213b66d98321b8b&secret=e322b271ddeb827d34d6249f76ac9a35',
            method: 'get',
            success(_res) {
              wx.request({
                url: app.globalData.javahost + '/user/base/get/invite/code',
                method: 'POST',
                data: {
                  "getAccess_token": _res.data.access_token,
                  "path": "pages/mine/card_detail/card_detail_other?scan=1&&manid=",
                  "id": res.data.data.userId
                },
                header: {
                  'content-type': 'application/json',
                  'cookie': 'JSESSIONID=' + app.globalData.session
                },
                success: function (res) {
                  if (res.data.success) {
                    console.info(res)
                    that.setData({
                      image: res.data.data
                    })
                  }
                }

              })
            }
          })
          
        // 产生二维码
          res.data.data.acceptAnswerPercent = res.data.data.acceptAnswerPercent ? (res.data.data.acceptAnswerPercent * 100).toFixed(2) + '%' : 0;
            that.setData({
              selfInfo: res.data.data,
              showBindInfo: true,
              info: res.data.data,
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

    });
   
      
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
        "conditons": [{ "field": "userId", "value": that.data.userInfo.userId }]
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
  goVerify: function (e) {
    wx.navigateTo({
      url: '/pages/my/verify?id=' + e.currentTarget.dataset.id
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
  gotoDetail: function (e) {

    console.info(this.data.info)
    if (this.data.info.identityType == '企业主') {
      wx.navigateTo({
        url: '/pages/mine/detail/detail_com'
        // url: '/pages/mine/detail/detail'
      })
    } else {
      wx.navigateTo({
        // url: '/pages/mine/detail/detail_com'
        url: '/pages/mine/detail/detail'
      })
    }
  },
  to_fabu(e) {
    wx.navigateTo({
      url: '/pages/mine/fabu/fabu'
    })
  },
  to_zan(e) {
    wx.navigateTo({
      url: '/pages/mine/zan/zan'
    })
  },
  to_share(e) {
    let that = this;
    // if (this.data.selfInfo.verifyYn) {
      wx.navigateTo({
        url: '/pages/mine/share/share'
      })
    
    
  },
  to_attend(e) {
    console.info(121221)
    wx.navigateTo({
      url: '/pages/mine/follow/follow'
    })
  },
  to_attender() {
    wx.navigateTo({
      url: '/pages/mine/follow_by/follow_by'
    })
  },
  to_pinlun(e) {
    wx.navigateTo({
      url: '/pages/mine/pinlun/pinlun'
    })
  },
  to_shoucang() {
    wx.navigateTo({
      url: '/pages/my/favorList'
    })
  },
  /**
   * 企业认证
   */
  to_renzhen_com (e) {
    wx.navigateTo({
            url: '/pages/mine/company/company'
          })
    
  },
  /**
   * 外贸人认真
   */
  to_renzhen_man(e) {
    wx.navigateTo({
      // url: '/pages/my/verify'
      url: '/pages/mine/beijin_list/beijin_list'
    })
  },
  get_edulist () {
    let that = this;
    let arr = [];
    console.info(that.data.edu)

    for (var i = 0; i < that.data.edu.length;i++){
      if (that.data.edu[i].type==1){
        arr.push(that.data.edu[i])
      }
    }
    that.setData({
      work_one: arr[0]
    })
    console.info(that.data.work_one)
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
          console.info(res)
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
  bindSubmit: function () {
    let that = this;
    let error = '';
    if (that.data.tradeIndex <= 0) {
      error = '您还没有选择行业';
    }
    if (that.data.countryIndex <= 0) {
      error = '您还没有选择省份城市';
    }
    
    if (error) {
      wx.showModal({
        content: error,
        showCancel: false,
        confirmText: "确定"
      })
    } else {
     
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
      
    }
  },
  /**
   * 去邀请页面
   */
  to_yaoqing (e) {
    wx.navigateTo({
      url: '/pages/mine/yaoqing/yaoqing?id=' + e.currentTarget.dataset.id
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
  * 去供应链
  */
  goGoodsList: function () {
    let that = this;
    wx.navigateTo({
      url: '/pages/my/goodsList'
    })
  },
  /**
   * 去名片夹
   */
  to_cardbag () {
    wx.navigateTo({
      url: '/pages/mine/card_bag/car_bag'
    })
  },
  /**
   * 去生成名片或查看名片
   */
  to_setCard () {
    if(this.data.info.logo){
      wx.navigateTo({
        url: '/pages/mine/card_detail/card_detail_my',
      })
    } else {
      wx.navigateTo({
        url: '/pages/mine/my_card/my_card',
      })
    }
  },
  /**
   * 去访客页面
   */
  goFangke () {
    wx.navigateTo({
      url: '/pages/mine/fangke/fangke',
    })
  }
})