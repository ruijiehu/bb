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
    showLoading: true,
    hiddenCircle: true,
    info: {
      "title": '', "content": '', "number": '', "price": '', "country": '', "productPriceViews": [{
        "price": 0,
        "startCount": 0,
        "unit": ''
      }] },
    circleIds: [],
    questionId: '',
    items: [],
    which_cir: null,
    which_type: 1,
    timearray: ['三天', '一周', '一个月'],
    timeIndex: 0,
    p_index: 0,
    payarray: ['请选择','信用证', '汇付', '托收','其他'],
    countryIndex: 0,//省份index
    cityIndex: 0,
    provinceId: null,
    videoSrc:null
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
        if (typeof (options.questionId) == 'undefined') {

          wx.removeStorageSync('selTaglist');
          if (typeof (options.type) == 'undefined') {
            cacheData.type = 'CONSULT';
          } else {
            cacheData.type = options.type;
          }
          if (typeof (options.circleId) == 'undefined') {
            that.data.circleIds = [];
          } else {
            that.data.circleIds = options.circleId.split(';');
            for (let i = 0; i < that.data.circleIds.length; i++) {
              that.data.circleIds[i] = parseInt(that.data.circleIds[i])
            }
          }
          that.getCircleList();
          that.setData({
            showLoading: false
          })

        } else {
          cacheData.questionId = options.questionId;
          that.setData({
            questionId: parseInt(options.questionId),
            isAdd: false
          })
          that.init()
        }

        for (var i = 0; i < that.data.priceList.length; i++) {
          that.data.priceList[i] = that.data.priceList[i].toFixed(2);
        }
        that.setData({
          priceList: that.data.priceList,
          selTaglist: []
        })
      } else {
        that.setData({
          isInit: true
        })

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
    if (that.data.questionId) {
      wx.request({
        url: app.globalData.javahost + '/user/question/get',
        method: 'POST',
        data: { "questionId": that.data.questionId },
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
              currentTitleCount: res.data.data.title.length,
              currentContentCount: res.data.data.content.length
            })
            if (res.data.data.circleViews.length > 0) {
              that.data.circleIds = [];
              for (let i = 0; i < res.data.data.circleViews.length; i++) {
                that.data.circleIds.push(res.data.data.circleViews[i].circleId);
              }
            }
            console.info(that.data.circleIds)
            that.getCircleList();
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
        console.info(_res)
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
    let reqData = cacheData;
    reqData.content = e.detail.value.content;
    reqData.tagViews = that.data.info.tagViews;
    reqData.images = that.data.imageList.join(';');
    reqData.circleId = that.data.which_cir;
    reqData.homePage = true;
    for (let i = 0; i < that.data.circleIds.length; i++) {
      reqData.circleViews.push({ "circleId": that.data.circleIds[i] });
    }
    // 如果从发采购
    if (that.data.which_type == 2){
      var con = e.detail.value.content;
      var imsg = that.data.imageList.join(';');
      var count = e.detail.value.number;
      var time = that.data.timearray[that.data.timeIndex];
      var ptype = that.data.payarray[that.data.p_index];
      var country = e.detail.value.country;
      var price = e.detail.value.price;
    }



    console.info(reqData)
    if (e.detail.value.content) {

      if (that.data.which_type == 1) {
        // 如果发交流
        wx.request({
          url: app.globalData.javahost + '/user/question/add',
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
              app.errorMsg(res.data.errorCode, res.data.errorMsg, function (userInfo) {
                //更新数据
                this.setData({
                  userInfo: userInfo
                })
                // this.init();
              })
            }

          }
        })
      } else if (that.data.which_type == 2) {
        // 如果发采购
        if(e.detail.value.number){
          if (ptype!='请选择'){
            wx.request({
              url: app.globalData.javahost + '/user/purchase/release',
              method: 'POST',
              data: {
                "count": count,
                "country": country,
                "day": time,
                "images": imsg,
                "msg": con,
                "payMent": ptype,
                "price": price,
                "unit": "1",
                "circleId": that.data.which_cir
                // "homePage": fabu
              },
              header: {
                'content-type': 'application/json',
                'cookie': 'JSESSIONID=' + app.globalData.session
              },
              success: function (res) {
                console.info(res)
                if (res.data.success) {
                  app.globalData.hasNew = true;
                  let id = res.data.data;
                  wx.showToast({
                    title: "发布成功",
                    duration: 2000
                  })
                  setTimeout(function () {
                    wx.navigateBack({});
                  }, 2000)
                } else {
                  app.errorMsg(res.data.errorCode, res.data.errorMsg, function (userInfo) {
                    //更新数据
                    this.setData({
                      userInfo: userInfo
                    })
                    // this.init();
                  })
                }

              }
            })
          } else {
            wx.showModal({
              content: '请选择付款方式',
              showCancel: false,
              confirmText: "确定"
            })
          }
         
        } else {
          wx.showModal({
            content: '请填写采购数量和单位',
            showCancel: false,
            confirmText: "确定"
          })
        }
       
      } else if (that.data.which_type == 3) {
        // 如果发供应
        if (e.detail.value.content && that.data.imageList.length > 0) {
          let reqData = that.data.info;
          productPriceViews = [];
          reqData.content = e.detail.value.content;
          reqData.brand = e.detail.value.brand;
          // reqData.circleId = that.data.which_cir;
          reqData.productAdvantage = e.detail.value.productAdvantage;
          // reqData.provinceId = that.data.provinceId;
          reqData.cityId = that.data.cityList[that.data.cityIndex].cityId;
          reqData.productAdvantage = e.detail.value.productAdvantage;
          reqData.tagViews = that.data.info.tagViews;
          reqData.images = that.data.imageList.join(';');
          for (let i = 0; i < reqData.productPriceViews.length; i++) {
            if (reqData.productPriceViews[i].startCount && reqData.productPriceViews[i].price) {
              productPriceViews.push({
                "startCount": parseInt(reqData.productPriceViews[i].startCount),
                "price": parseInt(reqData.productPriceViews[i].price),
                "unit": reqData.productPriceViews[i].unit
              })
            }
          }
          if (productPriceViews.length > 0) {
            reqData.productPriceViews = productPriceViews;
            console.info(reqData)
            // console.info(that.data.cityList[that.data.cityIndex].cityId)
            // console.info(that.data.provinceId)
            if (that.data.cityList[that.data.cityIndex].cityId!=0){
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
                content: '请填写物流港口',
                showCancel: false,
                confirmText: "确定"
              })
            }
              
            
          } else {
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
      } else if (that.data.which_type == 4){
        console.info(6666666666666666666)
        console.info(that.data.videoSrc)
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
    if (e.detail.value==3){
      that.getProvince()
      that.getCity()
    }
    this.setData({
      which_type: e.detail.value
    })
  },
  /**
   * 发布采购选择
   */
  /**
 * 选择有效期
 */
  bindPickerChange(e) {
    this.setData({
      timeIndex: e.detail.value
    });
  },
  bindPicker(e) {
    this.setData({
      p_index: e.detail.value
    });
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
          res.data.data.unshift({ "provinceId": 0, "name": "省份" })
          let provinceId = res.data.data[0].provinceId;
          // if (that.data.selfInfo.cityView && that.data.selfInfo.cityView.provinceView) {
            // provinceId = that.data.selfInfo.cityView.provinceView.provinceId
            for (let i = 0; i < res.data.data.length; i++) {
              if (provinceId == res.data.data[i].provinceId) {
                that.data.countryIndex = i;
                break;
              }
            }
          // }
          that.getCity(provinceId);
          that.setData({
            provinceList: res.data.data,
            countryIndex: that.data.countryIndex
          })
        } else {
          // app.errorMsg(res.data.errorCode, res.data.errorMsg, function (userInfo) {
          //   //更新数据
          //   that.setData({
          //     userInfo: userInfo
          //   })
          //   // that.init();
          // })
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
            // if (that.data.selfInfo.cityView) {
              // let cityId = that.data.selfInfo.cityView.cityId
              let cityId;
              for (let i = 0; i < res.data.data.length; i++) {
                if (cityId == res.data.data[i].cityId) {
                  that.data.cityIndex = i;
                  break;
                }
              }
            // }

            that.setData({
              cityList: res.data.data,
              cityIndex: that.data.cityIndex
            })
          } else {
            // app.errorMsg(res.data.errorCode, res.data.errorMsg, function (userInfo) {
            //   //更新数据
            //   that.setData({
            //     userInfo: userInfo
            //   })
            //   that.init();
            // })
          }
        },

      })
    } else {
      that.setData({
        cityList: [{ "cityId": 0, "name": "城市" }],
        cityIndex: 0
      })
    }

  },
  /**
 * 省份选择
 */
  bindCountryChange: function (e) {
    let id = parseInt(e.detail.value);
    this.getCity(this.data.provinceList[id].provinceId);
    this.setData({
      countryIndex: id,
      cityIndex: 0,
      provinceId: this.data.provinceList[id].provinceId
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
  }
})