const sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置
let util = require('../../../utils/util.js');
let app = getApp();
let reqData = {}, cache;
let allList = [],hyList=[],xtList=[];
let topCount = 0;
// 侧滑相关参数
const transitionDescription = 'transition: margin-left 0.2s ease-out;';
const sideMenuItemWidth = 140;  // 是否可能和css进行同步
const showSideMenuThreshold = 50;
const touchMoveThreshold = 20;
const touchMoveGradient = 0.25;
Page({
  data: {
    userInfo: {},
    allList: [],
    hxList:[],
    xtList:[],
    tabs: ["关注", "评论", "通知"],
    counts: [0, 0, 0],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    listHasMore: true,
    listLoading: true,
    isInit: false,
    showLoading: true,
    touch: {
      startX: -1,
      startY: -1,
      offsetX: 0,
      offsetY: 0,
      sideMenu: -1,  // 判定是否开始侧滑显示侧边菜单，-1为未判定，0为非侧滑判定，1为侧滑判定
    },
    countryIndex: 0,//省份index
    cityIndex: 0,
    tradeIndex: 0,//行业index
    pointIndx: 0,
    pointList: [
      { "id": "请选择角色", "name": "请选择角色" },
      { "id": "外贸人", "name": "外贸人" },
      { "id": "企业主", "name": "企业主" }],
    dates: "开始时间",
    dates_end: "请选择"
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
          sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 2,
          sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex
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
      this.countRemind();
    }else{
      // this.init();
    }
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
   * 初始
   */
  init: function () {
    let that = this;
    allList = [];
    hyList=[];
    xtList=[];
    topCount = 0;
    reqData = {
      "currentPage": 1,
      "pageSize": app.globalData.pageSize
    }
    this.data.touch = {
      startX: -1,
      startY: -1,
      offsetX: 0,
      offsetY: 0,
      sideMenu: -1  // 判定是否开始侧滑显示侧边菜单，-1为未判定，0为非侧滑判定，1为侧滑判定
    };
    this.countRemind();
    this.data.listHasMore = true;
    this.data.allList = [];
    this.data.hyList=[];
    this.data.xtList=[];
    this.getList();
    this.getMyInfo();
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
          // if (res.data.data.tradeView && res.data.data.tradeView.tradeId && res.data.data.cityView && res.data.data.cityView.cityId) {
            that.setData({
              selfInfo: res.data.data,
              showBindInfo: false,
              // infoid: res.data.data.userId,
              // allBind: true,
              listLoading: false
            })
          // } else {
          //   that.getTrade();
          //   that.getProvince();
          //   that.setData({
          //     selfInfo: res.data.data,
          //     showBindInfo: true,
          //     listLoading: false
          //   })

          // }
        } else {
          app.errorMsg(res.data.errorCode, res.data.errorMsg, function (userInfo) {
            //更新数据
            that.setData({
              // userInfo: userInfo
            })
            // that.init();
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
      if (that.data.activeIndex == 2) {
        //系统消息
        wx.request({
          url: app.globalData.javahost + '/user/base/sysMsg/page',
          method: 'POST',
          data: reqData,
          header: {
            'content-type': 'application/json',
            'cookie': 'JSESSIONID=' + app.globalData.session
          },
          success: function (res) {
            console.info(res.data.data)
            if (res.data.success) {
              let list = that.data.xtList;
              for (let i = 0; i < res.data.data.list.length; i++) {
                cache = res.data.data.list[i];
                cache.createTime = util.getDateDiff(cache.createTime);
                list.push(cache);
              }
              that.setData({
                xtList: list,
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
      } else if (that.data.activeIndex == 1){
        // 关注和评论
        wx.request({
          url: app.globalData.javahost + '/user/base/userTriggerMsg/page',
          method: 'POST',
          data: reqData,
          header: {
            'content-type': 'application/json',
            'cookie': 'JSESSIONID=' + app.globalData.session
          },
          success: function (res) {
            console.info(res)
            if (res.data.success) {
              let list = that.data.allList;
              for (let i = 0; i < res.data.data.list.length; i++) {
                cache = res.data.data.list[i];
                cache.createTime = util.getDateDiff(cache.createTime);
                list.push(cache);
              }
              that.setData({
                allList: list,
                listHasMore: res.data.data.currentPage >= res.data.data.pageCount ? false : true,
                loadingHidden: true,
                listLoading: false,
                isInit: true
              })
              console.info(that.data.allList)
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
        // 关注和品论
        wx.request({
          url: app.globalData.javahost + '/user/base/userTriggerMsg/page',
          method: 'POST',
          data: reqData,
          header: {
            'content-type': 'application/json',
            'cookie': 'JSESSIONID=' + app.globalData.session
          },
          success: function (res) {
            console.info(res)
            if (res.data.success) {

              let list = that.data.allList;
              for (let i = 0; i < res.data.data.list.length; i++) {
                cache = res.data.data.list[i];
                cache.createTime = util.getDateDiff(cache.createTime);
                list.push(cache);
                // 初始化侧滑相关参数
                cache.sideMenu = false;
                cache.styleOffset = 'margin-left: 0rpx;';
                cache.styleTransition = transitionDescription;
                hyList.push(cache);
              }

              // for (let i = 0; i < res.data.data.list.length; i++) {
              //   cache = res.data.data.list[i];
                // if (typeof cache.acceptYn == 'undefined') {
                //   cache.showBtn = true;
                // } else {
                //   cache.showBtn = false;
                // }
                // 初始化侧滑相关参数
              //   cache.sideMenu = false;
              //   cache.styleOffset = 'margin-left: 0rpx;';
              //   cache.styleTransition = transitionDescription;
              //   hyList.push(cache);
              // }
              that.setData({
                allList: list,
                listHasMore: res.data.data.currentPage >= res.data.data.pageCount ? false : true,
                loadingHidden: true,
                listLoading: false,
                isInit: true
              })
              console.info(that.data.allList)
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
        console.info(res)
        if (res.data.success) {
          that.data.counts[0] = res.data.data.userTriggerMsgUnreadCount;
          that.data.counts[1] = res.data.data.userTriggerMsgUnreadCount;
          that.data.counts[2] = res.data.data.sysMsgUnreadCount;
          that.setData({
            counts: that.data.counts
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
   * 查看详情
   */
  showInfo: function (e) {
    // if (e.currentTarget.dataset.id == this.data.userInfo.userId){
    //   wx.switchTab({
    //     url: '/pages/my/my'
    //   })
    // }else{
      wx.navigateTo({
        url: '/pages/my/userInfo?userId=' + e.currentTarget.dataset.id
      })
    // }
  },
  /**
   * 查看问题
   */
  showQuestion: function (e) {
    if(e.currentTarget.dataset.type!=10){
      wx.navigateTo({
        url: '/pages/dynamic/detail?questionId=' + e.currentTarget.dataset.id
      })
    }

  },
  /**
 * 导航切换
 * /
 */
  tabClick: function (e) {
    // 如果存在侧滑菜单，则收起菜单并不做跳转
    for (let i = 0; i < this.data.hyList.length; ++i) {
      if (this.data.hyList[i].sideMenu) {
        this.hideSideMenu();
        return;
      }
    }
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });
    this.init();
  },
  /**
   * 查看用户详情
   */
  showUserInfo: function (e) {
    // 如果存在侧滑菜单，则收起菜单并不做跳转
    for (let i = 0; i < this.data.hyList.length; ++i) {
      if (this.data.hyList[i].sideMenu) {
        this.hideSideMenu();
        return;
      }
    }
    // if (e.currentTarget.dataset.id == this.data.userInfo.userId){
    //   wx.switchTab({
    //     url: '/pages/my/my'
    //   })
    // }else{
      wx.navigateTo({
        url: '/pages/my/userInfo?userId=' + e.currentTarget.dataset.id
      })
    // }
  },

  /**
   * 删除
   */
  removeClick: function (e) {
    let that = this
    let id = parseInt(e.currentTarget.dataset.id)
    let index = parseInt(e.currentTarget.dataset.index)
    if (id) {
      wx.showModal({
        content: "确定删除吗？",
        confirmText: "确定",
        cancelText: "取消",
        success: function (res) {
          if (res.confirm) {
            wx.request({
              url: app.globalData.javahost + '/user/friend/apply/delete',
              method: 'POST',
              data: { "friendApplyId": id },
              header: {
                'content-type': 'application/json',
                'cookie': 'JSESSIONID=' + app.globalData.session
              },
              success: function (res) {
                if (res.data.success) {
                  wx.showToast({
                    title: "已删除",
                    duration: 2000,
                  })
                  if (that.data.hyList[index].showBtn){
                    that.data.counts[0] = that.data.counts[0] - 1;
                  }
                  that.data.hyList.splice(index, 1);
                  that.setData({
                    hyList: that.data.hyList,
                    counts: that.data.counts
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
          } else {

          }
        }
      })

    }
  },
  // 实现侧滑菜单响应
  onTouchStart: function (e) {
    if (e.touches.length == 1) {
      // 初始化touch数据
      this.setData({
        'touch.startX': e.touches[0].clientX,
        'touch.startY': e.touches[0].clientY,
        'touch.offsetX': 0,
        'touch.offsetY': 0,
        'touch.sideMenu': -1
      });

      // 如果开始滑动后需要禁用transition
      let index = e.currentTarget.dataset.index;
      if (!this.data.hyList[index].sideMenu) {
        let key = 'hyList[' + index + '].styleTransition';
        this.setData({
          [key]: ''
        });
      } else {
        let key = 'hyList[' + index + '].styleOffset';
        this.setData({
          [key]: 'margin-left: 0rpx;'
        });
      }
    }
  },

  onTouchMove: function (e) {
    if (e.touches.length == 1) {
      // 更新touch数据
      this.setData({
        'touch.offsetX': e.touches[0].clientX - this.data.touch.startX,
        'touch.offsetY': e.touches[0].clientY - this.data.touch.startY
      });

      let index = e.currentTarget.dataset.index;
      if (!this.data.hyList[index].sideMenu) {
        // 判定是否为侧滑
        if (this.data.touch.sideMenu == -1) {
          // 只有当想左滑动一定距离并且为水平滑动时才判定为侧滑
          if (this.data.touch.offsetX < -touchMoveThreshold) {
            if (Math.abs(this.data.touch.offsetY) / Math.abs(this.data.touch.offsetX) < touchMoveGradient) {
              this.setData({
                'touch.sideMenu': 1
              });

              // 同一时间只允许为一个item弹出侧边菜单
              this.hideSideMenu(index);
            } else {
              this.setData({
                'touch.sideMenu': 0
              });
            }
          } else if (this.data.touch.offsetX > 0) {
            this.setData({
              'touch.sideMenu': 0
            });
          }
        }

        // 开始侧滑后列表项跟随手指一起滑动
        if (this.data.touch.sideMenu == 1) {
          // 侧边菜单有可能是2项或者3项
          let sideMenuWidth = sideMenuItemWidth;
          // 限定侧滑范围
          let offset = this.data.touch.offsetX + touchMoveThreshold;
          offset = offset > 0 ? 0 : offset;
          offset = offset < -sideMenuWidth ? -sideMenuWidth : offset;

          // 更新styleOffset使列表项滑动
          let key = 'hyList[' + index + '].styleOffset';
          this.setData({
            [key]: 'margin-left: ' + offset + 'rpx;'
          });
        }
      }
    }
  },

  onTouchEnd: function (e) {
    let index = e.currentTarget.dataset.index;
    if (!this.data.hyList[index].sideMenu) {
      // 启用transition
      let key = 'hyList[' + index + '].styleTransition';
      this.setData({
        [key]: transitionDescription
      });

      // 决定是否显示侧边菜单
      if (this.data.touch.sideMenu == 1) {
        // 侧边菜单有可能是2项或者3项
        let sideMenuWidth = sideMenuItemWidth;

        // 根据滑动的当前位置决定是展开菜单还是收起
        let offset = this.data.touch.offsetX + touchMoveThreshold;
        let left = 0;
        if (offset < -showSideMenuThreshold) {
          left = -sideMenuWidth;
        }

        let key = 'hyList[' + index + '].styleOffset';
        this.setData({
          [key]: 'margin-left: ' + left + 'rpx;'
        });

        if (left < 0) {
          key = 'hyList[' + index + '].sideMenu';
          this.setData({
            [key]: true
          });
        }
      }
    } else {
      let key = 'hyList[' + index + '].sideMenu';
      this.setData({
        [key]: false
      });
    }
  },

  // excluded为有效值时该项不做处理
  hideSideMenu: function (excluded) {
    if (!excluded) {
      excluded = -1;
    }

    for (let i = 0; i < this.data.hyList.length; ++i) {
      if (i == excluded) {
        continue;
      }

      if (this.data.hyList[i].sideMenu) {
        let sideMenuKey = 'hyList[' + i + '].sideMenu';
        let styleOffsetKey = 'hyList[' + i + '].styleOffset';
        this.setData({
          [styleOffsetKey]: 'margin-left: 0rpx;',
          [sideMenuKey]: false
        });
      }
    }
  },
  /**
   * 去用户信息页面
   */
  to_man(e) {
    let id = e.currentTarget.dataset.manid;


    let that = this;
    // console.info()

    console.info(id)
    console.info(that.data.infoid)
    console.info(that.data.infoid == id)
    // if (id == that.data.infoid) {
    //   console.info(122121212)
    //   // wx.navigateTo({
    //   //   url: '/pages/mine/info/info'
    //   // })
    //   wx.navigateTo({
    //     // url: '/pages/circle/member_info/member_info?uid=' + e.currentTarget.dataset.userid
    //     url: '/pages/mine/info/info'
    //   })
    // } else {
    wx.navigateTo({
      // url: '/pages/circle/member_info/member_info?uid=' + e.currentTarget.dataset.userid
      url: '/pages/mine/detail/detail_other?uid=' + id
    })
    // }

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
  bindSubmit: function (e) {
    let that = this;
    let error = '';
    if (that.data.tradeIndex <= 0) {
      error = '您还没有选择行业';
    }
    if (that.data.countryIndex <= 0) {
      error = '您还没有选择省份城市';
    }
    // if (that.data.pointIndx <= 0) {
    //   error = '您还没有选择身份';
    // }
    if (error) {
      wx.showModal({
        content: error,
        showCancel: false,
        confirmText: "确定"
      })
    } else {
      // if (e.detail.value.com && e.detail.value.bindposition && that.data.dates != '请选择' && that.data.dates_end != '请选择') {
      //   wx.request({
      //     url: app.globalData.javahost + '/user/base/bind/cityAndTrade',
      //     method: 'POST',
      //     data: {
      //       "cityId": that.data.cityList[that.data.cityIndex].cityId,
      //       "tradeId": that.data.tradeList[that.data.tradeIndex].tradeId,
      //       "identityType": "外贸人",
      //       "company": e.detail.value.com,
      //       "position": e.detail.value.bindposition,
      //       "startTime": that.data.dates,
      //       "endTime": that.data.dates_end
      //     },
      //     header: {
      //       'content-type': 'application/json',
      //       'cookie': 'JSESSIONID=' + app.globalData.session
      //     },
      //     success: function (res) {
      //       if (res.data.success) {
      //         wx.showToast({
      //           title: "已绑定",
      //           duration: 2000
      //         })
      //         that.setData({
      //           showBindInfo: false,
      //           allBind: true
      //         });
      //         that.getMemberList();
      //         that.getAll();
      //       } else {
      //         app.errorMsg(res.data.errorCode, res.data.errorMsg, function (userInfo) {
      //           //更新数据
      //           this.setData({
      //             userInfo: userInfo
      //           })
      //           this.init();
      //         })
      //       }

      //     }
      //   })
      // } else if (!e.detail.value.com && !e.detail.value.bindposition && that.data.dates == '请选择' && that.data.dates_end == '请选择') {
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
      // } else {
      //   wx.showModal({
      //     content: "请完整填写所有信息",
      //     showCancel: false,
      //     confirmText: "确定"
      //   })
      // }
      // wx.request({
      //   url: app.globalData.javahost + '/user/base/bind/cityAndTrade',
      //   method: 'POST',
      //   data: { "cityId": that.data.cityList[that.data.cityIndex].cityId, "tradeId": that.data.tradeList[that.data.tradeIndex].tradeId },
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
      //       // that.getJoinList();
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
    }
  },
  /**
   * 去被评论的详情
   */
  to_detail (e) {
    let that = this;
    let ttype = e.currentTarget.dataset.ttype;
    let id = e.currentTarget.dataset.id;
    if(ttype == 9){
      // 交流
      wx.navigateTo({
        url: '/pages/circle/exchange_show/exchange_show?id=' + id
      })
    } else if (ttype == 7){
      // 采购
      wx.navigateTo({
        url: '/pages/circle/pur_show/pur_show?purid=' + id
      })
    } else if(ttype == 6){
      // 分享
      wx.navigateTo({
        url: '/pages/home_page/fenxiang_detail/fenxiang_detail?id=' + id + '&nick=' + '' + '&con=' + ''
      })
    } else if(ttype == 10){
      //别人分享了你的交流
      wx.navigateTo({
        url: '/pages/circle/exchange_show/exchange_show?id=' + id
      })
    } else if( ttype == 11){
      // 别人分享了你的采购
      wx.navigateTo({
        url: '/pages/circle/pur_show/pur_show?purid=' + id
      })
    }
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