let app = getApp();
var sourceType = [['camera'], ['album'], ['camera', 'album']]
var sizeType = [['compressed'], ['original'], ['compressed', 'original']]
let cacheData = { "images": "../images/logo0.png", "content": '', "rewardAmount": 0 };
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
    info: { "title": '', "content": '' },
    circleIds: [],
    questionId: '',
    circleid: null, //获取发布再哪个圈子的id
    isc: true,
    fabu: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.info(options.id)
    this.setData({
      circleid: options.id
    })
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
        if (res.data.success) {
          cacheCircleList = res.data.data;
          for (let i = 0; i < cacheCircleList.length; i++) {
            if (that.data.circleIds.indexOf(cacheCircleList[i].circleId) > -1) {
              cacheCircleList[i].checked = true;
            } else {
              cacheCircleList[i].checked = false;
            }
          }
          that.setData({
            circleList: cacheCircleList,
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
          console.info(res)


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
  * 是否选中判断
  */
  checkboxChange: function (e) {
    console.log('checkbox发生change事件，携带value值为：', e.detail.value)
    let that = this;
    if (e.detail.value[0] == 'true') {
      console.info('发布')
      that.setData({
        fabu: true
      })
    } else {
      console.info('不发布')
      that.setData({
        fabu: false
      })
    }
  },
  /**
   * 保存问题
   */
  formSubmit: function (e) {
    let that = this;
    // if (that.data.circleIds.length == 0) {
    //   wx.showModal({
    //     content: '请至少选择一个圈子',
    //     showCancel: false,
    //     confirmText: "确定"
    //   })
    // } else {

    let reqData = cacheData;
    reqData.questionId = parseInt(reqData.questionId);
    // reqData.title = e.detail.value.title.replace('\n', '');

    reqData.content = e.detail.value.content;
    reqData.tagViews = that.data.info.tagViews;
    reqData.images = that.data.imageList.join(';');
    reqData.circleViews = [];
    for (let i = 0; i < that.data.circleIds.length; i++) {
      reqData.circleViews.push({ "circleId": that.data.circleIds[i] });
    }
    reqData.circleId = that.data.circleid;
    reqData.homePage = true;
    reqData.type = 'SUPPLY';
    console.info(reqData)

    // var title = e.detail.value.title.replace('\n', '');
    var con = e.detail.value.content;
    console.info(con)
    // var imsg = that.data.imageList.join(';');
    if (e.detail.value.content) {
      if (reqData.images.length==0){
        wx.showModal({
          content: '图片不能为空',
          showCancel: false,
          confirmText: "确定"
        })
      } else {
        wx.request({
          url: app.globalData.javahost + '/user/question/add',
          method: 'POST',
          data: reqData,
          header: {
            'content-type': 'application/json',
            'cookie': 'JSESSIONID=' + app.globalData.session
          },
          success: function (res) {
            console.info(res)
            if (res.data.success) {
              // wx.showToast({
              //   title: "添加成功",
              //   duration: 2000
              // })
              app.globalData.hasNew = true;
              let id = res.data.data;
              // wx.switchTab({
              //   url: '/pages/home_page/index/index',
              // })
              // console.info(122)
              wx.redirectTo({
                url: '/pages/home_page/activity/detail_show?id=' + res.data.data
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
      // if (that.data.isAdd) {
     
    } else {
      wx.showModal({
        content: '内容不能为空',
        showCancel: false,
        confirmText: "确定"
      })
    }
    // }


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
   * 显隐圈子
   */
  hiddenCircle: function (e) {
    this.setData({
      hiddenCircle: !this.data.hiddenCircle
    })
  }
})