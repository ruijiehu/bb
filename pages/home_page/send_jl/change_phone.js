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
    videoSrc: null,
    phone_number: null,  //手机号
    phone_check: null,    //验证码
    videoUrl: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    //调用应用实例的方法获取全局数据
    wx.request({
      url: app.globalData.javahost + '/user/base/get/selfInfo',
      method: 'POST',
      data: {},
      header: {
        'content-type': 'application/json',
        'cookie': 'JSESSIONID=' + app.globalData.session
      },
      success: function (res) {
        console.info(res)
        that.setData({
          userInfo: res.data.data
        })
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
    if (that.data.questionId) {
      
    } else {
      setTimeout(function () {
        that.getCircleList();
        that.setData({
          showLoading: false
        })
      }, 300)
    }
  },
  /**
   * 获取已经加入的圈子
   */
  getCircleList: function () {
    let that = this;
    wx.request({
      url: app.globalData.javahost + '/user/circle/join/list',
      method: 'POST',
      data: null,
      header: {
        'content-type': 'application/json',
        'cookie': 'JSESSIONID=' + app.globalData.session
      },
      success: function (res) {
        console.info(res)
        if (res.data.success) {
          cacheCircleList = res.data.data;
          var arr = [];
          for (let i = 0; i < cacheCircleList.length; i++) {
            if (i == 0) {
              arr.push({ "name": cacheCircleList[0].circleId, "value": cacheCircleList[0].name, "checked": "true" })
            } else {
              arr.push({ "name": cacheCircleList[i].circleId, "value": cacheCircleList[i].name })
            }


            if (that.data.circleIds.indexOf(cacheCircleList[i].circleId) > -1) {
              cacheCircleList[i].checked = true;
            } else {
              cacheCircleList[i].checked = false;
            }
          }
          that.setData({
            circleList: cacheCircleList,
            items: arr,
            which_cir: arr[0].name
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
   * 添加视频
   */
  chooseImage: function (e) {
    var that = this;
    let imgList = that.data.imageList;
    if (!that.data.imgUpload && that.data.imageList.length < that.data.imgCount) {
      
      wx.chooseVideo({
        sourceType: ['album', 'camera'],
        maxDuration: 10,
        camera: 'back',
        success: function (res) {
          that.setData({
            videoSrc: res.tempFilePath
          })
          wx.uploadFile({
            url: app.globalData.javahost + '/user/common/image/upload', //仅为示例，非真实的接口地址
            filePath: res.tempFilePath,
            header: {
              'content-type': 'multipart/form-data',
              'cookie': 'JSESSIONID=' + app.globalData.session
            },
            name: 'file',
            success: function (_res) {
              _res.data = JSON.parse(_res.data);
              var data = _res.data.data
              that.setData({
                videoUrl: data
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
      url: app.globalData.javahost + '/user/common/image/upload',
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
 * 选择标签
 */
  choiseTag: function () {
    wx.navigateTo({
      url: '/pages/dynamic/tagList'
    })
  },
  previewImage: function (e) {
    var current = e.target.dataset.src
    wx.previewImage({
      current: current,
      urls: this.data.imageList
    })
  },
  /**
 * 圈子选择
 */
  checkboxChange: function (e) {
    cacheId = e.currentTarget.dataset.id;
    cacheIndex = this.data.circleIds.indexOf(cacheId);
    cacheItemIndex = e.currentTarget.dataset.index;
    if (cacheIndex > -1) {
      this.data.circleList[cacheItemIndex].checked = false;
      this.data.circleIds.splice(cacheIndex, 1);
    } else {
      this.data.circleList[cacheItemIndex].checked = true;
      this.data.circleIds.push(cacheId);
    }
    this.setData({
      circleList: this.data.circleList
    })

    // console.info(this.data.circleList)
  },
  /**
   * 保存问题
   */
  formSubmit: function (e) {
    let that = this;
    var myreg = /^[1][3,4,5,7,8][0-9]{9}$/;
    console.info(that.data.phone_number)
    console.info(myreg.test(that.data.phone_number))
    console.info(that.data.phone_check)
    
    let reqData = cacheData;
    if (myreg.test(that.data.phone_number) && that.data.phone_check) {
      wx.request({
        url: app.globalData.javahost + '/user/base/bind/phone',
        method: 'POST',
        data: {
          "phone": that.data.phone_number,
          "vercode": that.data.phone_check
        },
        header: {
          'content-type': 'application/json',
          'cookie': 'JSESSIONID=' + app.globalData.session
        },
        success: function (res) {
          if (res.data.success) {
            wx.showModal({
              content: '修改成功',
              showCancel: false,
              confirmText: "确定"
            })
            wx.showToast({
              title: '修改成功',
            })
            setTimeout(()=>{
              wx.navigateBack({})
            },1000)
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
        title: '请填写正确手机号和验证码',
        content: '',
      })
    }

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
 * 添加价格区间
 */
  addPriceView: function () {
    this.data.info.productPriceViews.push({
      "price": null,
      "startCount": null,
      "nuit": ''
    })
    this.setData({
      "info.productPriceViews": this.data.info.productPriceViews
    })
  },
  /**
   * 删除价格区间
   */
  removePriceView: function (e) {
    let index = parseInt(e.currentTarget.dataset.index);
    this.data.info.productPriceViews.splice(index, 1);
    this.setData({
      "info.productPriceViews": this.data.info.productPriceViews
    })
  },
  /**
   * 删除商品
   */
  formRemove: function (e) {
    let that = this;
    if (that.data.productId) {
      wx.request({
        url: app.globalData.javahost + '/user/product/delete',
        method: 'POST',
        data: {
          "productIds": [that.data.productId]
        },
        header: {
          'content-type': 'application/json',
          'cookie': 'JSESSIONID=' + app.globalData.session
        },
        success: function (res) {
          if (res.data.success) {
            wx.showToast({
              title: "删除成功",
              duration: 2000
            })
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
   * 输入数量
   */
  inputCount: function (e) {
    this.data.info.productPriceViews[e.currentTarget.dataset.index].startCount = e.detail.value
  },
  /**
  * 输入价格
  */
  inputPrice: function (e) {
    this.data.info.productPriceViews[e.currentTarget.dataset.index].price = e.detail.value
  },
  /**
* 输入单位
*/
  inputUnit: function (e) {
    this.data.info.productPriceViews[e.currentTarget.dataset.index].unit = e.detail.value
  },
  /**
   * 显隐圈子
   */
  hiddenCircle: function (e) {
    this.setData({
      hiddenCircle: !this.data.hiddenCircle
    })
  },
  /**
   * 选择哪个圈子
   */
  radioChange: function (e) {
    console.log('radio发生change事件，携带value值为：', e.detail.value)
    this.setData({
      which_cir: e.detail.value
    })
  },
  /**
  * 选择发交流还是采购还是供应
  */
  sendChange: function (e) {
    let that = this;
    console.log('radio发生change事件，携带value值为：', e.detail.value)
    if (e.detail.value == 3) {
      that.getProvince()
      that.getCity()
    }
    this.setData({
      which_type: e.detail.value
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
          url: app.globalData.javahost + '/user/common/image/upload', //仅为示例，非真实的接口地址
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

  }
})