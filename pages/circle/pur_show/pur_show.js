// pages/circle/pur_show/pur_show.js
let util = require('../../../utils/util.js');
let app = getApp();
let reqData = {}, cache;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    purid: null,
    info: null,
    answerList: null,
    container: null,
    UserInfo: null,
    verifyApplying: false,
    nocon: null,
    isInit: false,
    show_toindex: false,
    countryIndex: 0,//省份index
    cityIndex: 0,
    tradeIndex: 0,//行业index
    pointIndx: 0,
    pointList: [
      { "id": "请选择角色", "name": "请选择角色" },
      { "id": "外贸人", "name": "外贸人" },
      { "id": "企业主", "name": "企业主" }
    ],
    showLoading: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    console.info(options)
    console.info(options["purid"]+'id是这个')
    if (options.nickname != undefined) {
      this.setData({
        nick: options.nickname,
        show_toindex: true
      })
    }
    if (options.home != undefined) {
      this.setData({
        show_toindex: true
      })
    }
    // console.info(parseInt(options[id]))
    that.setData({
      purid: parseInt(options["purid"]),
      verifyApplying: app.globalData.visvy
    })
    console.info(that.data.purid+'是否赋值data的id')
    this.getMyInfo();
    this.getCGinfo(); //调用方法
    this.getCGcomment(); //调用评论
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function (options) {
    console.info(options)
    if (this.data.UserInfo && this.data.isInit) {
      this.getMyInfo();
      this.getCGinfo(); //调用方法
      this.getCGcomment(); //调用评论
      console.info(this.data.purid + '222222222222')
    } else {
      this.getMyInfo();
      this.getCGinfo(); //调用方法
      this.getCGcomment(); //调用评论
      console.info(this.data.purid + '333333333333')
    }
   
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.getMyInfo();
    this.getCGinfo(); //调用方法
    this.getCGcomment(); //调用评论
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
  onShareAppMessage: function () {
    let that = this;
    let id = that.data.purid;
    let shareData = {
      title: this.data.info.title,
      desc: this.data.info.summary,
      path: '/pages/circle/pur_show/pur_show?purid=' + that.data.purid + '&home=1',
      success: (res) => {
        console.info(res)
        console.info(id)
        console.info(that.data.purid)
      }
    };
    return shareData;
    console.info(shareData)
    console.info('969696')
  },

  /**
   * 采购详情获取
   */

  getCGinfo() {
    let that = this;
    wx.request({
      url: app.globalData.javahost + '/user/purchase/get/detail/page',
      method: 'POST',
      data: {
        "purchaseId": that.data.purid
      },
      header: {
        'content-type': 'application/json',
        'cookie': 'JSESSIONID=' + app.globalData.session
      },
      success: function (res) {
        console.info(res)
        if (res.data.success) {
          let info = res.data.data;
          info.createTime = util.getDateDiff(info.createTime);
          info.images = info.images ? info.images.split(";") : [];
          that.setData({
            info: info
          })
          setTimeout(function () {
            that.setData({
              showLoading: false
            })
          }, 300)
        }else{
          that.setData({
            nocon: '认证用户才能查看采购详情，点击右下角按钮返回首页',
            show_toindex: true
          })
        }
        // setTimeout(function () {
        //   wx.navigateBack({
        //     delta: 1
        //   })
        // }, 200)

      }

    })
  },
  /**
   * 获取采购评论
   */
  getCGcomment() {

    let that = this;
    wx.request({
      url: app.globalData.javahost + '/user/purchase/get/purchase/Comment',
      method: 'POST',
      data: {
        "purchaseId": that.data.purid
      },
      header: {
        'content-type': 'application/json',
        'cookie': 'JSESSIONID=' + app.globalData.session
      },
      success: function (res) {
        console.info(res)
        if (res.data.success) {
          var array = [];
          for (let i = 0; i < res.data.data.length; i++) {
            cache = res.data.data[i];
            cache.createTime = util.getDateDiff(cache.createTime);
            array.push(cache);
          }
          that.setData({
            answerList: array
          })
        }
        // setTimeout(function () {
        //   wx.navigateBack({
        //     delta: 1
        //   })
        // }, 200)

      }

    })
  },
  // 分享
  toShare(e) {
    // console.info(e)
    wx.navigateTo({
      url: '/pages/home_page/share_cg/share_cg?id=' + e.currentTarget.dataset.atrid + '&type=' + e.currentTarget.dataset.type + '&imgs=' + e.currentTarget.dataset.img + '&tit=' + e.currentTarget.dataset.tit + '&summary=' + e.currentTarget.dataset.summary
    })
  },
  // 离开文本框
  bindTextAreaBlur: function (e) {
    console.info(e)
    this.setData({
      container: e.detail.value
    })
    console.info(this.data.container)
  },
  /**
   * 发送评论
   */
  to_send() {
    let that = this;
    console.info(that.data.container)
    // console.info(that.data.atricleid)

    let con = that.data.container;
    // console.info(con)
    if(con){
      wx.request({
        url: app.globalData.javahost + '/user/operate/comment',
        method: 'POST',
        data: {
          "content": con,
          "id": that.data.purid,
          "type": 1
        },
        header: {
          'content-type': 'application/json',
          'cookie': 'JSESSIONID=' + app.globalData.session
        },
        success: function (res) {
          console.info(res)
          setTimeout(function () {
            that.data.container = ''
            // that.init();
            that.getCGcomment();
            that.getCGinfo();
            wx.showToast({
              title: '评论成功',
              icon: 'success',
              duration: 2000
            })
          }, 200)

        }

      })

    }else{
      wx.showToast({
        title: '评论不能为空',
        icon: 'success',
        duration: 2000
      })
    }
  



  },
  /**
   * 点赞
   */
  dianzan() {
    let that = this;
    wx.request({
      url: app.globalData.javahost + '/user/operate/praise',
      method: 'POST',
      data: {
        "id": that.data.purid,
        "type": 3
      },
      header: {
        'content-type': 'application/json',
        'cookie': 'JSESSIONID=' + app.globalData.session
      },
      success: function (res) {
        console.info(res)
        if (res.data.success) {
          that.getCGinfo();
          wx.showToast({
            title: '成功',
            icon: 'success',
            duration: 2000
          })
        }

      }

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

                // that.setData({
                //   userInfo: userInfo
                // })


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
        // if (res.data.success) {
        //   console.info(res.data)
        //   that.setData({
        //     UserInfo: res.data.data,
        //     verifyApplying: res.data.data.verifyYn
        //   })
        // } else {

        // }
        console.info(res)
        if (res.data.success) {
            if (res.data.data.tradeView != undefined && res.data.data.tradeView.tradeId != undefined && res.data.data.cityView != undefined && res.data.data.cityView.cityId != undefined) {
              
              that.setData({
                UserInfo: res.data.data,
                // infoid: res.data.data.userId,
                showBindInfo: false,
                allBind: true,
                listLoading: false
              })
            } else {
              that.getTrade();
              that.getProvince();
              that.setData({
                UserInfo: res.data.data,
                showBindInfo: true,
                listLoading: false
              })
            }
          
        } else {

        }
      },

    })
  },
  /**
   * 去人的信息页面
   */
  to_person (e) {
    let id = e.currentTarget.dataset.id;
    let myid = this.data.UserInfo.userId;
    if (parseInt(id) == parseInt(myid)) {
      console.info(122121212)
      wx.navigateTo({
        url: '/pages/mine/detail/detail'
      })
    } else {
      wx.navigateTo({
        url: '/pages/mine/detail/detail_other?uid=' + id
      })
    }
  },
  /**
  * 更多
  */
  more_edit(e) {
    // let id = e.currentTarget.dataset.id;
    let that = this;
    let id = that.data.purid;
    wx.showActionSheet({
      itemList: ['删除'],
      success: function (res) {
        console.log(res.tapIndex)
        if (res.tapIndex == 0) {
          // 删除
          wx.request({
            url: app.globalData.javahost + '/user/purchase/delete/purchase',
            method: 'POST',
            data: {
              "purchaseId": id
            },
            header: {
              'content-type': 'application/json',
              'cookie': 'JSESSIONID=' + app.globalData.session
            },
            success: function (res) {
              console.info(res);
              wx.showToast({
                title: '删除成功',
                icon: 'success',
                duration: 2000
              })
              setTimeout(
                function () {
                  wx.switchTab({
                    url: '/pages/home_page/index/index'
                  })
                }, 100)
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
 * 查看大图
 */
  previewImage: function (e) {
    var current = e.target.dataset.src
    wx.previewImage({
      current: current,
      urls: this.data.info.images
    })
  },
  /**
   * 评论
   */
  answerAdd: function (e) {
    let that = this;
    // if (that.data.selfInfo.phone) {
    wx.navigateTo({
      // url: '/pages/home_page/reply/reply?newsId=' + that.data.newsId
      url: '/pages/home_page/reply/reply?id=' + that.data.purid + '&type=1'
    })
  },
  /**
 * 对交流的分享
 */
  f_x(e) {
    let that = this;
    
    let id = that.data.purid;
    let tit = '';
    let summary = that.data.info.msg;
    let imgs = '';
    // console.log(e.currentTarget.dataset.imgs);
    let itype = 2;
    wx.navigateTo({
      url: '/pages/home_page/share_fen/share_fen?id=' + id + '&tit=' + tit + '&summary=' + summary + '&imgs=' + imgs + '&type=' + itype
    })
  },
  /**
  * 收藏
  */
  saveClick: function (e) {
    let that = this;
    if (this.data.info.favorYn) {
      wx.request({
        url: app.globalData.javahost + '/user/purchase/favor/set',
        method: 'POST',
        data: {
          "purchaseId": that.data.purid,
          "favorYn": false
        },
        header: {
          'content-type': 'application/json',
          'cookie': 'JSESSIONID=' + app.globalData.session
        },
        success: function (res) {
          if (res.data.success) {
            wx.showToast({
              title: "取消",
              duration: 2000,
            })
            that.setData({
              'info.favorYn': false
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
      wx.request({
        url: app.globalData.javahost + '/user/purchase/favor/set',
        method: 'POST',
        data: {
          "purchaseId": that.data.purid,
          "favorYn": true
        },
        header: {
          'content-type': 'application/json',
          'cookie': 'JSESSIONID=' + app.globalData.session
        },
        success: function (res) {
          if (res.data.success) {
            wx.showToast({
              title: "收藏",
              duration: 2000,
            })
            that.setData({
              'info.favorYn': true
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
    }
  },
  /**
* 进入名片
*/
  to_Man(e) {
    let id = e.currentTarget.dataset.id;
    let that = this;
    let uid = that.data.UserInfo.userId
    console.info(id)
    console.info(that.data.UserInfo.userId)
    console.info(that.data.infoid == id)
    if (uid == id) {
      if (that.data.UserInfo.identityType != undefined) {
        if (that.data.UserInfo.identityType == '企业主') {
          wx.navigateTo({
            url: '/pages/mine/detail/detail_com?uid=' + id
          })
        } else if (that.data.UserInfo.identityType == '外贸人') {
          wx.navigateTo({
            url: '/pages/mine/detail/detail?uid=' + id
          })
        }
      }
    } else {
      // 判断是什么身份，外贸人和企业主
      wx.navigateTo({
        url: '/pages/mine/detail/detail_other?uid=' + id
      })
    

    }

  },
  to_home() {
    wx.switchTab({
      url: '/pages/home_page/index/index',
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
          if (that.data.UserInfo.cityView && that.data.UserInfo.cityView.provinceView) {
            provinceId = that.data.UserInfo.cityView.provinceView.provinceId
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
            if (that.data.UserInfo.cityView) {
              let cityId = that.data.UserInfo.cityView.cityId
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
          if (that.data.UserInfo.tradeView) {
            let tradeId = that.data.UserInfo.tradeView.tradeId
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
            // that.getMemberList();
            // that.getAll();
            that.getMyInfo();
            that.getCGinfo(); //调用方法
            that.getCGcomment(); //调用评论
          } else {
            app.errorMsg(res.data.errorCode, res.data.errorMsg, function (userInfo) {
              //更新数据
              that.setData({
                userInfo: userInfo
              })
              that.getMyInfo();
              that.getCGinfo(); //调用方法
              that.getCGcomment(); //调用评论
            })
          }

        }
      })
     


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
})
