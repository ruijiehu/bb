let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showBindInfo:false,
    showLoading: true,
    countryIndex: 0,//省份index
    cityIndex: 0,
    tradeIndex: 0,//行业index
    pointIndx: 0,
    pointList: [
      { "id": "请选择角色", "name": "请选择角色" },
      { "id": "外贸人", "name": "外贸人" },
      { "id": "企业主", "name": "企业主" }
    ],
    iii:'../../images/taohuafu.jpg',
    // iii: null,
    ruijie: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;


    // setTimeout(function(){
      that.getSelfInfo();
      // wx.request({
      //   url: app.globalData.javahost + '/user/operate/get/images',
      //   method: 'POST',
      //   data: {
      //     "type": 1
      //   },
      //   header: {
      //     'content-type': 'application/json',
      //     'cookie': 'JSESSIONID=' + app.globalData.session
      //   },
      //   success: function (res) {
      //     console.info(res)
      //     if (res.data.success) {
      //       that.setData({
      //         iii: res.data.data
      //       })
      //     }

      //   }
      // })
    // },4000)
    
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
	this.getSelfInfo();  
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
  
  },
  /**
   * 获取个人资料
   */
  getSelfInfo: function () {
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
          if (res.data.data.tradeView && res.data.data.tradeView.tradeId && res.data.data.cityView && res.data.data.cityView.cityId) {
            // setTimeout(function(){
              that.setData({
                selfInfo: res.data.data,
                infoid: res.data.data.userId,
                showBindInfo: false,
                allBind: true,
                listLoading: false,
                showLoading: false
              })
            // },3000)
            // that.setData({
            //   selfInfo: res.data.data,
            //   infoid: res.data.data.userId,
            //   showBindInfo: false,
            //   allBind: true,
            //   listLoading: false,
            //   showLoading: false
            // })
           //直接生成护身符
          } else {
            wx.navigateTo({
              url: '/pages/home_page/hushenfu/first_born',
            })
            // that.getTrade();
            // that.getProvince();
            // that.setData({
            //   selfInfo: res.data.data,
            //   showBindInfo: true,
            //   listLoading: false
            // })

          }
        } else {
          app.errorMsg(res.data.errorCode, res.data.errorMsg, function (userInfo) {
            //更新数据
            // that.getTrade();
            // that.getProvince();
            that.setData({
              userInfo: userInfo
            })
            // that.init();
          })
        }
      }
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
  * 提交绑定
  */
  bindSubmit: function () {
    let that = this;
    let error = '';
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
        data: { "cityId": that.data.cityList[that.data.cityIndex].cityId, "tradeId": that.data.tradeList[that.data.tradeIndex].tradeId, "identityType": that.data.pointList[that.data.pointIndex].id },
        header: {
          'content-type': 'application/json',
          'cookie': 'JSESSIONID=' + app.globalData.session
        },
        success: function (res) {
          if (res.data.success) {
            wx.showToast({
              title: "确定",
              duration: 2000
            })
            // that.setData({
            //   showBindInfo: false,
            //   allBind: true
            // });
            // that.getAll();
          } else {
            app.errorMsg(res.data.errorCode, res.data.errorMsg, function (userInfo) {
              //更新数据
              // this.setData({
              //   userInfo: userInfo
              // })
              // this.init();
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
  /**
   * 保存图片
   */
  save_pic (e) {
    console.info(e)
    // wx.saveImageToPhotosAlbum({
    //   filePath:'',
    //   success(res) {
    //   }
    // })
    wx.getImageInfo({
      src: e.currentTarget.dataset.src,
      success: function (ret) {
        var path = ret.path;
        wx.saveImageToPhotosAlbum({
          filePath: path,
          success(result) {
            console.log(result)
            wx.showToast({
              title: '保存成功',
            })
          }
        })
      }
    })
  },
  /**
   * 去生成符的页面
   */
  to_bornPic () {
    wx.navigateTo({
      url: '/pages/home_page/hushenfu/save_pic',
    })
  }
})