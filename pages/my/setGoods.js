let app = getApp();
var sourceType = [['camera'], ['album'], ['camera', 'album']]
var sizeType = [['compressed'], ['original'], ['compressed', 'original']]
let info = {
  "images": "../images/logo0.png", "content": '', "productPriceViews": [{
    "price": 0,
    "startCount": 0,
    "unit":''
  }]};
let productPriceViews=[];
// pages/dynamic/info.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUpload: false,//标记当前是否在传图
    imageList: [],
    imgCount:3,
    currentTitleCount: 0,
    currentContentCount: 0,
    selTaglist: [],
    isAdd: true,//是否新加
    showLoading: true,
    Android:false,
    info: {"images": "../images/logo0.png", "content": '', "productPriceViews": [{
        "price": null,
        "startCount": null,
        "unit":''
      }]},
    productId: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo) {
      //更新数据
      if (userInfo) {
        that.setData({
          userInfo: userInfo
        })
        if (typeof (options.productId) == 'undefined') {
          info.isAdd = true;
          wx.removeStorageSync('selTaglist');         

          that.setData({
            showLoading: false
          })

        } else {
          info.isAdd = false;
          info.productId = options.productId;
          that.setData({
            productId: options.productId,
            isAdd: false
          })
          that.init()
        }

        that.setData({
          selTaglist: []
        })
      } else {
        that.setData({
          isInit: true
        })
      }

    })
    wx.getSystemInfo({
      success: function (res) {
        if (res.system.indexOf('Android') > -1) {
          that.setData({
            isAndroid: true,
          });
        }

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
    if (wx.getStorageSync('selTaglist').length <= 0) {
      this.data.info.tagViews = []
    } else {
      this.data.info.tagViews = wx.getStorageSync('selTaglist')
    }
    this.setData({
      "info.tagViews": this.data.info.tagViews
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
    wx.removeStorageSync('selTaglist');
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
    if (that.data.productId) {
      wx.request({
        url: app.globalData.javahost + '/user/product/get',
        method: 'POST',
        data: { "productId": that.data.productId },
        header: {
          'content-type': 'application/json',
          'cookie': 'JSESSIONID=' + app.globalData.session
        },
        success: function (res) {
          if (res.data.success) {
            wx.setStorageSync('selTaglist', res.data.data.tagViews)
            that.setData({
              info: res.data.data,
              imageList: res.data.data.images ? res.data.data.images.split(";") : [],
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
    } else {
      setTimeout(function () {
        that.setData({
          showLoading: false
        })
      }, 300)
    }
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
   * 保存问题
   */
  formSubmit: function (e) {
    let that = this;
    if (e.detail.value.content && that.data.imageList.length>0) {
      let reqData = that.data.info;
      productPriceViews = [];
      reqData.content = e.detail.value.content;
      reqData.tagViews = that.data.info.tagViews;
      reqData.images = that.data.imageList.join(';');  
      for (let i = 0; i < reqData.productPriceViews.length;i++){
        if (reqData.productPriceViews[i].startCount && reqData.productPriceViews[i].price && reqData.productPriceViews[i].unit){
          productPriceViews.push({
            "startCount": parseInt(reqData.productPriceViews[i].startCount),
            "price": parseInt(reqData.productPriceViews[i].price),
            "unit": reqData.productPriceViews[i].unit
          })
        }        
      }     
      if (productPriceViews.length>0){
        reqData.productPriceViews = productPriceViews;
        if (that.data.isAdd) {
          delete reqData.isAdd;
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
                // wx.showToast({
                //   title: "添加成功",
                //   duration: 2000
                // })
                wx.navigateBack({
                  delta: 1
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
            url: app.globalData.javahost + '/user/product/set',
            method: 'POST',
            data: reqData,
            header: {
              'content-type': 'application/json',
              'cookie': 'JSESSIONID=' + app.globalData.session
            },
            success: function (res) {
              if (res.data.success) {
                // wx.showToast({
                //   title: "修改成功",
                //   duration: 2000
                // })
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
      }else{
        wx.showModal({
          content: '请完善价格区间',
          showCancel: false,
          confirmText: "确定"
        })
      }
     
    } else {
      wx.showModal({
        content: '描述和产品图片不能为空',
        showCancel: false,
        confirmText: "确定"
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
  addPriceView:function(){
    this.data.info.productPriceViews.push({
      "price": null,
      "startCount": null,
      "nuit":''
    })
    this.setData({
      "info.productPriceViews": this.data.info.productPriceViews
    })
  },
  /**
   * 删除价格区间
   */
  removePriceView:function(e){
    let index = parseInt(e.currentTarget.dataset.index);
    this.data.info.productPriceViews.splice(index, 1);
    this.setData({
      "info.productPriceViews": this.data.info.productPriceViews
    })
  },
  /**
   * 删除商品
   */
  formRemove:function(e){
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
  inputCount:function(e){    
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
  }
})