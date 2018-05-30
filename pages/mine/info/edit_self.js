let app = getApp();
let util = require('../../../utils/util.js');
let careerTimeList = ['1-3年', '3-5年', '5-10年', '10年以上'];
Page({

  /**
   * 页面的初始数据
   */
  data: {
    info: {},
    userInfo: {},
    provinceList: [],
    tradeList: [],
    cityList: [],
    countryIndex: 0,//省份index
    cityIndex: 0,
    tradeIndex: 0,//行业index
    isInit: false,
    showLoading: true,
    tagViews: '',
    backurl: '',
    self_info: null,
    id: null,
    nickname: null,
    one:null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      id: options.id,
      self_info: options.info,
      nickname: options.nick
    })
    var that = this;
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo) {
      //更新数据
      if (userInfo) {
        that.setData({
          userInfo: userInfo,
          backurl: typeof (options.backurl) == 'undefined' ? '' : options.backurl
        })
        that.init();
        wx.removeStorageSync('selUserTaglist');
      } else {
        that.setData({
          isInit: true
        })
        that.init();
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
    wx.removeStorageSync('selUserTaglist');
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
          console.info(res.data.data);
          that.setData({
            one: res.data.data
          })
          console.info(that.data.one)
          
          if (res.data.data.birthday) {
            res.data.data.birthday = util.formatDate(new Date(res.data.data.birthday));
          }
          /**临时 */

          that.setData({
            info: res.data.data,
            // tagViews: tagViews.join(';'),
            isInit: true,
            self_info: res.data.data.info
          })
         
          setTimeout(function () {
            that.setData({
              showLoading: false
            })
          }, 300)
          that.getTrade();
          that.getProvince();
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
          let provinceId = res.data.data[0].provinceId;
          if (that.data.info.cityView && that.data.info.cityView.provinceView) {
            provinceId = that.data.info.cityView.provinceView.provinceId
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
          if (that.data.info.cityView) {
            let cityId = that.data.info.cityView.cityId
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
          if (that.data.info.tradeView) {
            let tradeId = that.data.info.tradeView.tradeId
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
  // 文本框事件
  bindTextAreaBlur: function (e) {
    this.setData({
      self_info: e.detail.value
    })

  },
  /**
   * 保存
   */
  formSubmit: function (e) {
    let that = this;
    that.setData({
      showTopTips: ''
    })
    let reqData = that.data.one;

    console.info(reqData)
    console.info(that.data.one)
    // delete reqData.cityView;
    // delete reqData.tradeView;
    let showTopTips = '';

    // reqData.nickname = that.data.nickname;
    console.info(that.data.nickname)
    console.info(reqData)
    if (e.detail.value.email) {
      reqData.email = e.detail.value.email;
    } else {
      delete reqData.email
    }
    
    if (e.detail.value.jobNature) {
      reqData.jobNature = e.detail.value.jobNature;
    } else {
      delete reqData.jobNature
    }
    if (e.detail.value.companyNature) {
      reqData.companyNature = e.detail.value.companyNature;
    } else {
      delete reqData.companyNature
    }
    
    delete reqData.birthday;
    if (reqData.birthday) {
      reqData.birthday+=' 00:00:00';
      reqData.birthday = new Date(reqData.birthday).getTime();
    } 
    
    if (e.detail.value.transactionCycle) {
      reqData.transactionCycle = e.detail.value.transactionCycle;
    } else {
      delete reqData.transactionCycle
    }
    if (e.detail.value.annualTurnover) {
      reqData.annualTurnover = e.detail.value.annualTurnover;
    } else {
      delete reqData.annualTurnover
    }
    
    if (e.detail.value.customerCooperationInfo) {
      reqData.customerCooperationInfo = e.detail.value.customerCooperationInfo;
    } else {
      delete reqData.customerCooperationInfo
    }
    if (e.detail.value.self_info) {
      reqData.info = e.detail.value.self_info;
    } else {
      delete reqData.info
    }
  
    reqData.sex = that.data.info.sex;
    reqData.maritalStatus = that.data.info.maritalStatus;
    reqData.tradeId = that.data.tradeList[that.data.tradeIndex].tradeId;
    reqData.cityId = that.data.cityList[that.data.cityIndex].cityId;

  
    if (showTopTips) {
      that.setData({
        showTopTips: showTopTips
      })
    } else {
      // reqData.tagViews = that.data.info.tagViews;
      wx.request({
        url: app.globalData.javahost + '/user/base/edit/selfInfo',
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
            wx.showModal({
              content: res.data.errorMsg,
              showCancel: false,
              confirmText: "确定"
            })
          }
        }
      })
    }





  },
  /**
* 选择标签
*/
  choiseTag: function () {
    wx.navigateTo({
      url: '/pages/my/tagList'
    })
  },
  // 选择性别
  choiseSex: function (e) {
    let that = this
    wx.showActionSheet({
      itemList: ['未知', '男', '女'],
      success: function (e) {
        that.setData({
          "info.sex": e.tapIndex
        })
      }
    })
  },
  // 选择性别
  choiseMaritalStatus: function (e) {
    let that = this
    wx.showActionSheet({
      itemList: ['未知', '未婚', '已婚'],
      success: function (e) {
        that.setData({
          "info.maritalStatus": e.tapIndex
        })
      }
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
   * 生日选择
   */
  bindDateChange: function (e) {
    this.setData({
      "info.birthday": e.detail.value
    })
  },
  /**
   * 电话显隐切换
   */
  phoneVisibleChange: function (e) {
    this.setData({
      "info.phoneVisible": e.detail.value == 'true' ? true : false
    })
  },
  /**
   * 从业年限
   */
  choiseCareerTime: function (e) {
    let that = this;
    wx.showActionSheet({
      itemList: careerTimeList,
      success: function (e) {
        that.setData({
          "info.careerTime": careerTimeList[e.tapIndex]
        })
      }
    })
  },
  // 文本框事件
  bindTextAreaBlur: function (e) {
    this.setData({
      self_info: e.detail.value
    })

  }
  
})