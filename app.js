//app.js
App({
  onLaunch: function () {
    //调用API从本地缓存中获取数据
    let that = this;
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    //调用登录接口
    wx.login({
      success: function (data) {
        if (data.code) {
          // console.info(data)
          wx.request({
            url: that.globalData.javahost + '/user/base/wechatMp/session/get',
            method: 'POST',
            data: {
              "code": data.code
            },
            header: {
              'content-type': 'application/json'
            },
            success: function (res) {
              console.info(res.data)
              if (res.data.success) {
                wx.setStorageSync('session', res.data.data);
                that.globalData.session = res.data.data;
                wx.getUserInfo({
                  success: function (_res) {
                    console.info(_res)
                    wx.request({
                      url: that.globalData.javahost + '/user/base/wechatMp/login',
                      method: 'POST',
                      data: {
                        "encryptedData": _res.encryptedData,
                        "iv": _res.iv,
                        "rawData": _res.rawData,
                        "signature": _res.signature
                      },
                      header: {
                        'content-type': 'application/json',
                        'cookie': 'JSESSIONID=' + that.globalData.session
                      },
                      success: function (__res) {
                        console.info(__res)
                        that.globalData.userInfo = _res.userInfo
                        console.info(__res.data.data)
                        that.globalData.userInfo.userId = __res.data.data.userId
                        typeof cb == "function" && cb(that.globalData.userInfo)
                      },
                      fail: function (fail) {
                        console.info(fail)
                      }
                    })
                  },
                  fail: function (fail) {
                    console.info(fail)
                    that.globalData.userInfo = null
                    typeof cb == "function" && cb(that.globalData.userInfo)
                  }
                })
              } else {
                wx.showModal({
                  content: res.data.errorMsg,
                  showCancel: false,
                  confirmText: "确定"
                })
              }
            },
            fail: function (fail) {
              typeof cb == "function" && cb(null)
            },
          })
        } else {
          console.log('获取用户登录态失败！' + data.errMsg)
        }

      },
      fail: function (fail) {
        console.info(fail)
      }
    })
  },
  getUserInfo: function (cb) {
    var that = this
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      //调用登录接口
      wx.login({
        success: function (data) {
          if (data.code) {
            wx.request({
              url: that.globalData.javahost + '/user/base/wechatMp/session/get',
              method: 'POST',
              data: {
                "code": data.code
              },
              header: {
                'content-type': 'application/json'
              },
              success: function (res) {
                console.info(res.data)
                if (res.data.success) {
                  wx.setStorageSync('session', res.data.data);
                  that.globalData.session = res.data.data;
                  wx.getUserInfo({
                    success: function (_res) {
                      console.info(_res)
                      wx.request({
                        url: that.globalData.javahost + '/user/base/wechatMp/login',
                        method: 'POST',
                        data: {
                          "encryptedData": _res.encryptedData,
                          "iv": _res.iv,
                          "rawData": _res.rawData,
                          "signature": _res.signature
                        },
                        header: {
                          'content-type': 'application/json',
                          'cookie': 'JSESSIONID=' + that.globalData.session
                        },
                        success: function (__res) {
                          console.info(__res)
                          that.globalData.userInfo = _res.userInfo
                          console.info(__res.data.data)
                          that.globalData.userInfo.userId = __res.data.data.userId
                          typeof cb == "function" && cb(that.globalData.userInfo)
                          /* ------1-31尝试调用个人信息，因为需要是否认证和头像等数据-------- */
                          wx.request({
                            url: that.globalData.javahost + '/user/base/get/selfInfo',
                            method: 'POST',
                            data: null,
                            header: {
                              'content-type': 'application/json',
                              'cookie': 'JSESSIONID=' + that.globalData.session
                            },
                            success: function (res) {
                              if (res.data.success) {
                                console.info(res.data)
                                that.globalData.userInfo = res.data.data
                              } else {
                              }
                            }
                          })
                        },
                        fail: function (fail) {
                          console.info(fail)
                        }
                      })
                    },
                    fail: function (fail) {
                      console.info(fail)
                      that.globalData.userInfo = null
                      typeof cb == "function" && cb(that.globalData.userInfo)
                    }
                  })
                } else {
                  wx.showModal({
                    content: res.data.errorMsg,
                    showCancel: false,
                    confirmText: "确定"
                  })
                }
              },
              fail: function (fail) {
                typeof cb == "function" && cb(null)
              },
            })
          } else {
            console.log('获取用户登录态失败！' + data.errMsg)
          }

        },
        fail: function (fail) {
          console.info(fail)
        }
      })
    }
  },
  errorMsg: function (code, msg, cb) {
    console.info(code);
    let that = this;
    if (code == 1001) {
      wx.login({
        success: function (data) {
          wx.request({
            url: that.globalData.javahost + '/user/base/wechatMp/session/get',
            method: 'POST',
            data: {
              "code": data.code
            },
            header: {
              'content-type': 'application/json'
            },
            success: function (res) {
              if (res.data.success) {
                wx.setStorageSync('session', res.data.data);
                that.globalData.session = res.data.data;
                wx.getUserInfo({
                  success: function (_res) {
                    wx.request({
                      url: that.globalData.javahost + '/user/base/wechatMp/login',
                      method: 'POST',
                      data: {
                        "encryptedData": _res.encryptedData,
                        "iv": _res.iv,
                        "rawData": _res.rawData,
                        "signature": _res.signature
                      },
                      header: {
                        'content-type': 'application/json',
                        'cookie': 'JSESSIONID=' + that.globalData.session
                      },
                      success: function (__res) {
                        // console.info(__res)
                        that.globalData.userInfo = _res.userInfo
                        that.globalData.userInfo.userId = __res.data.data.userId
                        typeof cb == "function" && cb(that.globalData.userInfo)
                      }
                    })
                  },
                  fail: function (fail) {
                    that.globalData.userInfo = null
                    typeof cb == "function" && cb(that.globalData.userInfo)
                  }
                })
              } else {
                wx.showModal({
                  content: res.data.errorMsg,
                  showCancel: false,
                  confirmText: "确定"
                })
              }
            },
            fail: function (fail) {
            }
          })
        }
      })
      console.info('1001了')
      // wx.showModal({
      //   content: "您还未登入,请点此登入？",
      //   confirmText: "登入",
      //   cancelText: "取消",
      //   success: function (res) {
      //     if (res.confirm) {
      //       wx.login({
      //         success: function (data) {
      //           // console.log(data)
      //           wx.request({
      //             url: that.globalData.javahost + '/user/base/wechatMp/session/get',
      //             method: 'POST',
      //             data: {
      //               "code": data.code
      //             },
      //             header: {
      //               'content-type': 'application/json'
      //             },
      //             success: function (res) {
      //               if (res.data.success) {
      //                 wx.setStorageSync('session', res.data.data);
      //                 that.globalData.session = res.data.data;

      //                 // 重新申请授权
      //                 // 老的微信版本openSetting调用没效果
      //                 wx.openSetting({
      //                   success: function (res) {
      //                     if (res.authSetting['scope.userInfo']) {
      //                       // 获得授权后再调用getUserInfo
      //                       wx.getUserInfo({
      //                         success: function (_res) {
      //                           wx.request({
      //                             url: that.globalData.javahost + '/user/base/wechatMp/login',
      //                             method: 'POST',
      //                             data: {
      //                               "encryptedData": _res.encryptedData,
      //                               "iv": _res.iv,
      //                               "rawData": _res.rawData,
      //                               "signature": _res.signature
      //                             },
      //                             header: {
      //                               'content-type': 'application/json',
      //                               'cookie': 'JSESSIONID=' + that.globalData.session
      //                             },
      //                             success: function (__res) {
      //                               // console.info(__res)
      //                               that.globalData.userInfo = _res.userInfo
      //                               that.globalData.userInfo.userId = __res.data.data.userId
      //                               typeof cb == "function" && cb(that.globalData.userInfo)
      //                             }
      //                           })
      //                         },
      //                         fail: function (fail) {
      //                           that.globalData.userInfo = null
      //                           typeof cb == "function" && cb(that.globalData.userInfo)
      //                         }
      //                       })
      //                     }
      //                   }
      //                 })
      //               } else {
      //                 wx.showModal({
      //                   content: res.data.errorMsg,
      //                   showCancel: false,
      //                   confirmText: "确定"
      //                 })
      //               }


      //             },
      //             fail: function (fail) {
      //               // console.info(fail)
      //               // console.info(123)
      //             }
      //           })
      //         }
      //       })
      //     }
      //   }

      // })
    } else {
      wx.showModal({
        content: msg,
        showCancel: false,
        confirmText: "确定"
      })
    }
  },
  userSignOut: function (cb) {
    let that = this;
    wx.request({
      url: that.globalData.javahost + '/user/base/logout',
      method: 'POST',
      data: null,
      header: {
        'content-type': 'application/json',
        'cookie': 'JSESSIONID=' + that.globalData.session
      },
      success: function (__res) {
        if (__res.data.success) {
          that.globalData.userInfo = null
        }
        typeof cb == "function" && cb(that.globalData.userInfo)
      }
    })
  },
  userApply: function (cb) {
    this.globalData.merchantAuthority = true;
    typeof cb == "function" && cb()
  },
  globalData: {
    userInfo: '',
    session: wx.getStorageSync('session') ? wx.getStorageSync('session') : '',
    visvy: '',
    hasNew: false,
    javahost: 'https://www.waimaobb.com',
    // javahost: 'http://47.100.200.2:7888',
    // javahost: 'http://192.168.1.91:7888',
    pageSize: 15
  }
})

