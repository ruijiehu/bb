let app = getApp();
var sourceType = [['camera'], ['album'], ['camera', 'album']]
var sizeType = [['compressed'], ['original'], ['compressed', 'original']]
let cacheData = { "images": "../images/logo0.png", "content": '', "rewardAmount": 0 };
let info = {
  "images": "../images/logo0.png", "content": '', "productPriceViews": [{
    "price": 0,
    "startCount": 0,
    "unit": ''
  }]
};
let productPriceViews = [];
let cacheCircleList, cacheId, cacheIndex, cacheItemIndex;
// pages/dynamic/info.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUpload: false,//标记当前是否在传图
    imageList: [],
    imgCount: 3,
    currentTitleCount: 0,
    currentContentCount: 0,
    priceList: [0.00, 0.49, 0.99, 1.99, 5.99],
    selTaglist: [],
    isAdd: true,//是否新加
    showLoading: false,
    hiddenCircle: true,
    info: {
      "title": '', "content": '', "number": '', "price": '', "country": '', "productPriceViews": [{
        "price": 0,
        "startCount": 0,
        "unit": ''
      }]
    },
    circleIds: [],
    questionId: '',
    items: [],
    which_cir: null,
    which_type: 4,
    timearray: ['三天', '一周', '一个月'],
    timeIndex: 0,
    p_index: 0,
    payarray: ['请选择', '信用证', '汇付', '托收', '其他'],
    countryIndex: 0,//省份index
    cityIndex: 0,
    provinceId: null,
    videoSrc: null,
    phone_number: null,  //手机号
    phone_check: null,    //验证码
    videoUrl: null,
    videoImg: null,
    videoHeight: null,
    items: [
      
    ],
    tags: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    //调用应用实例的方法获取全局数据
    // app.getUserInfo(function (userInfo) {
    //   //更新数据
    //   if (userInfo) {
    //     that.setData({
    //       userInfo: userInfo
    //     })
    //     console.info(that.data.userInfo)
    //   } else {
    //   }

    // })
    wx.request({
      url: app.globalData.javahost + '/user/base/get/selfInfo',
      method: 'POST',
      data: {},
      header: {
        'content-type': 'application/json',
        'cookie': 'JSESSIONID=' + app.globalData.session
      },
      success: function (res) {
        if (res.data.success) {
          console.info(res)
          that.setData({
            userInfo: res.data.data
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
    /**获取标签 */
    wx.request({
      url: app.globalData.javahost + '/user/product/get/tags',
      method: 'POST',
      data: {},
      header: {
        'content-type': 'application/json',
        'cookie': 'JSESSIONID=' + app.globalData.session
      },
      success: function (res) {
        if (res.data.success) {
          console.info(res)
          var data = res.data.data;
          var arr = [];
          data.forEach( (val, index)=>{
            arr.push({
              name: val.tagName, value: val.tagName
            })
          })
          that.setData({
            items: arr
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
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this;
    wx.request({
      url: app.globalData.javahost + '/user/base/get/selfInfo',
      method: 'POST',
      data: {},
      header: {
        'content-type': 'application/json',
        'cookie': 'JSESSIONID=' + app.globalData.session
      },
      success: function (res) {
        if (res.data.success) {
          console.info(res)
          that.setData({
            userInfo: res.data.data
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
    wx.stopPullDownRefresh();
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
      data: {},
      header: {
        'content-type': 'application/json',
        'cookie': 'JSESSIONID=' + app.globalData.session
      },
      success: function (res) {
        if (res.data.success) {
          console.info(res)
          that.setData({
            userInfo: res.data.data
          })
        } else {
          app.errorMsg(res.data.errorCode, res.data.errorMsg, function (userInfo) {
            //更新数据
            that.setData({
              userInfo: userInfo
            })
            // that.init();
          })
        }

      },

    })
  },
  /**
   * 添加视频
   */
  chooseImage: function (e) {
    var that = this;
    let imgList = that.data.imageList;
    if (!that.data.imgUpload && that.data.imageList.length < that.data.imgCount) {
      wx.chooseVideo({
        sourceType: ['album', 'camera'],
        maxDuration: 15,
        camera: 'back',
        success: function (res) {
          console.info(res)
          var bili = res.height / res.width
          that.setData({
            videoSrc: res.tempFilePath,
            v_height: bili
          })
          console.info(bili)
          wx.uploadFile({
            url: app.globalData.javahost + '/user/commons/upload/video', //仅为示例，非真实的接口地址
            filePath: res.tempFilePath,
            header: {
              'content-type': 'multipart/form-data',
              'cookie': 'JSESSIONID=' + app.globalData.session
            },
            name: 'file',
            success: function (_res) {
              console.info(_res)
              // _res.data = JSON.parse(_res.data);
              var data = _res.data.data
              var arr = _res.data.split(';')
              console.log(arr)
              console.log(arr[0])
              console.log(arr[1])
              console.log(arr[2])
              that.setData({
                videoUrl: arr[0],
                videoImg: arr[1],
                videoHeight: arr[2]
              })
              //do something
              console.log(that.data.videoUrl)
              console.info(_res)
            }
          })
        }
      })
    }
  },
  unloadImg: function (urls, list, length, cb) {//图片上传 上传数组 结果数组 长度 回调
    let that = this;
    let url = urls[0];
    wx.uploadFile({
      url: app.globalData.javahost + '/user/commons/upload/video',
      filePath: url,
      header: {
        'content-type': 'multipart/form-data',
        'cookie': 'JSESSIONID=' + app.globalData.session
      },
      name: 'file',
      success: function (_res) {
        console.info(_res)
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
   * 保存问题
   */
  formSubmit: function (e) {
    let that = this;
    let user = that.data.userInfo;
    let reqData = cacheData;
    let tags = [];
    reqData.content = e.detail.value.content;
    // reqData.homePage = true;
    that.data.tags.forEach( (val, i) => {
        tags.push({
          "tagName": val
        })
    })
    console.info(tags)
    if (tags.length != 0 ){
      reqData.tagUViews = tags;
    } else {
      wx.showModal({
        content: '请选择标签',
        showCancel: false,
        confirmText: "确定"
      })
    }
   
    // console.info(e.detail.value.phone_check)
    if (e.detail.value.phone_check) {
      reqData.phone = e.detail.value.phone_check
    }
    reqData.video = that.data.videoUrl;
    reqData.height = that.data.videoHeight;
    console.log(that.data.videoUrl)
    console.log(that.data.videoImg)
    reqData.images = that.data.videoImg;
    reqData.height = that.data.v_height;
    if (user.company && user.position && user.nickname) {
      reqData.company = user.company;
      reqData.position = user.position;
      reqData.realName = user.nickname;
    } else {
      reqData.company = e.detail.value.company;
      reqData.position = e.detail.value.position;
      reqData.realName = e.detail.value.realName;
    }


    console.info(e.detail.value.company)
    console.info(e.detail.value.position)
    console.info(e.detail.value.realName)

    console.info(reqData)
    if (e.detail.value.content) {

      if (that.data.which_type == 4) {
        // 发布视频
        console.info(6666666666666666666)
        console.info(that.data.videoSrc)
        var myreg = /^[1][3,4,5,7,8][0-9]{9}$/;
        if (that.data.videoSrc) {
          //如果已经绑定手机号
          if (that.data.userInfo.phone != undefined) {
            console.info(reqData)
            if (reqData.company && reqData.position && reqData.realName) {
              if (that.data.currentContentCount>11){
                wx.request({
                  url: app.globalData.javahost + '/user/product/set',
                  method: 'POST',
                  data: reqData,
                  header: {
                    'content-type': 'application/json',
                    'cookie': 'JSESSIONID=' + app.globalData.session
                  },
                  success: function (res) {
                    if (res.data.success) {
                      app.globalData.hasNew = true;
                      wx.showToast({
                        title: "发布成功",
                        duration: 2000
                      })
                      setTimeout(function () {
                        wx.navigateBack({});
                      }, 2000)

                    } else {
                      wx.showModal({
                        content: res.data.errorMsg,
                        showCancel: false,
                        confirmText: "确定"
                      })
                    }
                  }
                })
              } else {
                wx.showModal({
                  title: '提示',
                  content: '描述内容太少，请完善',
                })
              }
              
            } else {
              wx.showModal({
                title: '请填写公司职位和姓名',
                content: '',
              })
            }

          } else {
            console.info(reqData)
            if (reqData.phone) {
              if (that.data.currentContentCount>11){
                wx.request({
                  url: app.globalData.javahost + '/user/product/set',
                  method: 'POST',
                  data: reqData,
                  header: {
                    'content-type': 'application/json',
                    'cookie': 'JSESSIONID=' + app.globalData.session
                  },
                  success: function (res) {
                    if (res.data.success) {
                      app.globalData.hasNew = true;
                      wx.showToast({
                        title: "发布成功",
                        duration: 2000
                      })
                      setTimeout(function () {
                        wx.navigateBack({});
                      }, 2000)

                    } else {
                      wx.showModal({
                        content: res.data.errorMsg,
                        showCancel: false,
                        confirmText: "确定"
                      })
                    }
                  }
                })
              } else {
                wx.showModal({
                  title: '提示',
                  content: '描述内容太少，请完善',
                })
              }
              
            } else {
              wx.showModal({
                title: '请完善手机号',
                content: '',
              })
            }
          }

        } else {
          wx.showModal({
            title: '请添加视频',
            content: '',
          })
        }


        console.info(6666666666666666666)
      } else {
        wx.showModal({
          content: '发布类型不能为空',
          showCancel: false,
          confirmText: "确定"
        })
      }
    } else {
      wx.showModal({
        content: '内容不能为空',
        showCancel: false,
        confirmText: "确定"
      })

    }

  },

  /**
   * 输入
   */
  inputTitle: function (e) {
    this.setData({
      currentTitleCount: e.detail.value.length
    })
  },
  inputContent: function (e) {
    this.setData({
      currentContentCount: e.detail.value.length
    })
  },


  /**
   * 视频
   */
  bindButtonTap: function () {
    var that = this
    wx.chooseVideo({
      sourceType: ['album', 'camera'],
      maxDuration: 10,
      camera: 'back',
      success: function (res) {
        that.setData({
          videoSrc: res.tempFilePath
        })
        wx.uploadFile({
          url: app.globalData.javahost + '/user/common/video/upload', //仅为示例，非真实的接口地址
          filePath: res.tempFilePath,
          name: 'file',
          success: function (_res) {
            var data = _res.data
            //do something
            console.info(_res)
          }
        })
      }
    })
  },
  /**
   * 输入手机号
   */
  inputNumber(e) {

    console.log(e.detail.value)
    this.setData({
      phone_number: e.detail.value
    })
  },
  /**
   * 输入验证码
   */
  inputNumber_check(e) {
    console.log(e.detail.value)
    this.setData({
      phone_check: e.detail.value
    })
  },
  // 获取验证码
  sendBindCode() {
    let that = this;
    var phone = that.data.phone_number;
    console.info(that.data.phone_number)
    if (phone) {
      var myreg = /^[1][3,4,5,7,8][0-9]{9}$/;
      if (!myreg.test(phone)) {
        wx.showModal({
          title: '手机号码格式不正确',
          content: '',
        })

      } else {
        console.info(12)
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
              console.log(res)
              wx.showToast({
                title: '获取成功',
              })
            } else {
            }
          },

        })
      }


    } else {
      wx.showModal({
        title: '请输入手机号',
        content: '',
      })
    }

  },
  tochangeNumber() {
    wx.navigateTo({
      url: '/pages/home_page/send_jl/change_phone',
    })
  },
  getPhoneNumber: function (e) {
    console.info(e)
    let that = this;
    console.log(e.detail.errMsg)
    console.log(e.detail.iv)
    console.log(e.detail.encryptedData)
    if (e.detail.errMsg != "getPhoneNumber:ok") {
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '未授权，请自己填写手机号',
        success: function (res) {
          console.info(res)
        }
      })
    } else {
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '同意授权',
        success: function (res) {
          console.info(wx.getStorageSync('session'))
          wx.request({
            url: app.globalData.javahost + '/user/base/wechatMp/bind/phone',
            method: 'POST',
            data: {
              "encryptedData": e.detail.encryptedData,
              "iv": e.detail.iv
            },
            header: {
              'content-type': 'application/json',
              'cookie': 'JSESSIONID=' + app.globalData.session
            },
            success (res) {
              console.info(res)
              // if(res.data.success){
                wx.request({
                  url: app.globalData.javahost + '/user/base/get/selfInfo',
                  method: 'POST',
                  data: {},
                  header: {
                    'content-type': 'application/json',
                    'cookie': 'JSESSIONID=' + app.globalData.session
                  },
                  success: function (res) {
                    if (res.data.success) {
                      console.info(res)
                      that.setData({
                        userInfo: res.data.data
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
              // } else {
              //   wx.showModal({
              //     title: '该账号已绑定手机',
              //     content: '',
              //   })
              // }
              
            }
          })
         }
      })
    }
   
  },
  checkboxChange: function (e) {
    console.log('checkbox发生change事件，携带value值为：', e.detail.value)
    this.setData({
      tags: e.detail.value
    })
  }
})