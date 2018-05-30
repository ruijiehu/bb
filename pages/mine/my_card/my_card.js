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
    email: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
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
     * 添加图片
     */
  chooseImage: function (e) {
    var that = this;
    let imgList = that.data.imageList;
    if (!that.data.imgUpload && that.data.imageList.length < that.data.imgCount) {
      wx.chooseImage({
        sourceType: ['album', 'camera'],
        sizeType: ['original', 'compressed'],
        count: that.data.imgCount - that.data.imageList.length,
        success: function (res) {
          that.setData({
            imgUpload: true
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
        _res.data = JSON.parse(_res.data);
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
    reqData.content = e.detail.value.content;
    reqData.homePage = true;
    reqData.logo = that.data.imageList.join(';');
    // console.info(e.detail.value.phone_check)
    if (e.detail.value.phone_check) {
      reqData.phone = e.detail.value.phone_check
    }
    // reqData.video = that.data.videoUrl;
    // reqData.height = that.data.videoHeight;
    console.log(that.data.videoUrl)
    console.log(that.data.videoImg)
    
      reqData.company = e.detail.value.company;
      reqData.position = e.detail.value.position;
      reqData.realname = e.detail.value.realName;
      reqData.email = e.detail.value.email;
   
    reqData.email = e.detail.value.email;
    console.info(reqData.email == true)
    console.info(e.detail.value.company)
    console.info(e.detail.value.position)
    console.info(e.detail.value.realName)
    console.info(e.detail.value.email)

    console.info(reqData)
    if (reqData.email && reqData.company && reqData.position && reqData.phone && reqData.logo) {
      wx.request({
        url: app.globalData.javahost + '/user/base/set/card',
        method: 'POST',
        data: reqData,
        header: {
          'content-type': 'application/json',
          'cookie': 'JSESSIONID=' + app.globalData.session
        },
        success: function (res) {
          if (res.data.success) {
            wx.redirectTo({
              url: '/pages/mine/card_detail/card_detail_my',
            })
          } else {

          }
        }
      })

    } else {
      wx.showModal({
          title: '请填写完整信息',
          content: '',
        })
    }
    // 发布视频
    console.info(6666666666666666666)
    

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
* 删除图片
*/
  remove: function (e) {
    let index = e.currentTarget.dataset.index;
    this.data.imageList.splice(index, 1);
    this.setData({
      imageList: this.data.imageList
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
        success: function (res) { }
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
            success(res) {
              console.info(res)
              if(!res.data.success){
                wx.showModal({
                  title: '提示',
                  content: res.data.errorMsg +'请重新输入号码'
                })
              }
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
             

            }
          })
        }
      })
    }
   
  }
})