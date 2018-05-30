let app = getApp();
var util = require('../../utils/util.js')
var formatLocation = util.formatLocation
var sourceType = [['camera'], ['album'], ['camera', 'album']]
var sizeType = [['compressed'], ['original'], ['compressed', 'original']]
let cacheData = { "images": "../images/logo0.png", "content": '', "rewardAmount": 0 };
let reqData;
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
Page({
  data: {
    showBindPhone: false,
    sendTxt: 0,
    hasLocation: false,
    imgUpload: false,//标记当前是否在传图
    imageList: [],
    imgCount: 1,
    currentInputCount: 0,
    accountIndex: 0,
    phone:'',
    accounts: ['选择身份', '外贸人', '企业主'],
    renzhenid: null,
    ttype: null
  },
  onLoad: function (options) {
    console.info(options)
    this.setData({
      renzhenid: options.id,
      ttype: options.type
    })
    var that = this;
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo) {
      //更新数据
      if (userInfo) {
        that.setData({
          userInfo: userInfo
        })
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
              that.setData({
                info: res.data.data
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
          isInit: true
        })
      }

    })

  },
  /**
 * 添加图片
 */
  chooseImage: function (e) {
    var that = this;
    let imgList = []
    if (!that.data.imgUpload) {
      wx.chooseImage({
        sourceType: ['album', 'camera'],
        sizeType: ['original', 'compressed'],
        count: that.data.imgCount,
        success: function (res) {

          that.setData({
            imgUpload: true,
            showTopTips: ""
          });
          var tempFilePaths = res.tempFilePaths;
          if (tempFilePaths.length > 0) {
            that.unloadImg(tempFilePaths, [], tempFilePaths.length, function (_res) {
              for (let i = 0; i < _res.length; i++) {
                imgList.push(_res[i]);
              }
              that.setData({
                imageList: imgList,
                imgUpload: false
              })
            })
          } else {
            that.setData({
              imgUpload: false
            })
          }
        }
      })
    }
  },
  unloadImg: function (urls, list, length, cb) {//图片上传 上传数组 结果数组 长度 回调
    let that = this;
    let url = urls[0];
    wx.uploadFile({
      url: app.globalData.javahost + '/user/commons/upload/image',
      filePath: url,
      header: {
        'content-type': 'multipart/form-data',
        'cookie': 'JSESSIONID=' + app.globalData.session
      },
      name: 'file',
      success: function (_res) {
        // _res.data = JSON.parse(_res.data);
        if (_res.data.success) {

          list.push(_res.data.data)
        }
        if (length > 1) {
          urls.shift();
          that.unloadImg(urls, list, length - 1, cb);
        } else {
          typeof cb == "function" && cb(list)
        }

      },
      fail: function (r) {
        if (length > 1) {
          urls.shift();
          that.unloadImg(urls, list, length - 1, cb);
        } else {
          typeof cb == "function" && cb(list)
        }
      }
    })
  },
  /**
   * 提交认证
   */
  formSubmit: function (e) {
    let that = this;
    that.data.showTopTips = '';
    reqData = {
      "images": that.data.imageList.join(';'),
      "userInfoId": that.data.renzhenid
      // "identityType": that.data.accounts[that.data.accountIndex]
    }
    if (reqData.images.length <= 0) {
      // that.data.showTopTips = '忘记上传名片了哦';
      wx.showModal({
        title: '提示',
        content: '请添加图片',
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击确定')
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    } else {
      that.apply(reqData);
    }
  },
  /**
   * 提交认证
   */
  apply: function (data) {
    let that = this;
    wx.request({
      url: app.globalData.javahost + '/user/verify/apply',
      method: 'POST',
      data: data,
      header: {
        'content-type': 'application/json',
        'cookie': 'JSESSIONID=' + app.globalData.session
      },
      success: function (res) {
        console.info(res)
        if (res.data.success) {
          wx.showModal({
            content: '申请已提交,请静待审核',
            showCancel: false,
            confirmText: "确定",
            success: function (res) {
              if (res.confirm) {
                wx.navigateBack({
                  delta: 1
                })
              } else if (res.cancel) {
                wx.navigateBack({
                  delta: 1
                })
              }
            }
          })

        } else {
          // app.errorMsg(res.data.errorCode, res.data.errorMsg, function (userInfo) {
          //   //更新数据
          //   that.setData({
          //     userInfo: userInfo
          //   })
          //   that.init();
          // })
          wx.showModal({
            content: '申请已提交,请静待审核',
            showCancel: false,
            confirmText: "确定",
            success: function (res) {
              if (res.confirm) {
                wx.navigateBack({
                  delta: 1
                })
              } else if (res.cancel) {
                wx.navigateBack({
                  delta: 1
                })
              }
            }
          })
        }

      }
    })
  },
  /**
   * 鼠标聚焦的时候处罚
   */
  inputfocus: function () {
    this.setData({
      showTopTips: ""
    })
  },
  /**
* 验证码获取倒计时
*/
  getCode: function (e) {
    let that = this;
    let phone = that.data.phone
    if (util.isPhoneNo(phone)) {
      wx.request({
        url: app.globalData.javahost + '/user/base/send/vercode',
        method: 'POST',
        data: {
          "phone": phone,
          "vercodeOperation": "BIND"
        },
        header: {
          'content-type': 'application/json',
          'cookie': 'JSESSIONID=' + app.globalData.session
        },
        success: function (res) {
          if (res.data.success) {
            wx.showToast({
              title: "已发送",
              duration: 2000
            })
            that.setData({
              sendTxt: 60,
              sendPhone: phone
            });
            countdown(that);
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
      wx.showModal({
        content: '手机号码不正确',
        showCancel: false,
        confirmText: "确定"
      })
    }

  },
  /**
   * 绑定手机
   */
  bindPhone: function (e) {
    let that = this
    let error = '';
    let bindPhoneInfo = {
      // "nickname": e.detail.value.nickname,
      "phone": that.data.phone,
      "vercode": e.detail.value.vercode
    }
    if (bindPhoneInfo.vercode) {

    } else {
      error = '请输入验证码';
    }
    // if (bindPhoneInfo.nickname) {

    // } else {
    //   error = '请输入姓名';
    // }
    if (error) {
      wx.showModal({
        content: error,
        showCancel: false,
        confirmText: "确定"
      })
    } else {
      wx.request({
        url: app.globalData.javahost + '/user/base/bind/phone',
        method: 'POST',
        data: bindPhoneInfo,
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
              showBindPhone: false,
              'info.phone': bindPhoneInfo.phone
            });

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
   * 手机号码输入
   */
  inputPhone: function (e) {
    this.setData({
      phone: e.detail.value
    })
  },
  /**
   * 选择身份
   */
  bindAccountChange: function (e) {
    this.setData({
      accountIndex: e.detail.value
    })
  },
})
