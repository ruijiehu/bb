let app = getApp();
var sourceType = [['camera'], ['album'], ['camera', 'album']]
var sizeType = [['compressed'], ['original'], ['compressed', 'original']]
let cacheData = { "images": "../images/logo0.png" };
let cacheCircleList, cacheId, cacheIndex, cacheItemIndex;
let arr = [], _num = 0, is_jishu = null;
// pages/dynamic/info.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUpload: false,//标记当前是否在传图
    imageList: [],
    imgCount: 12,
    currentTitleCount: 0,
    currentContentCount: 0,
    priceList: [0.00, 0.49, 0.99, 1.99, 5.99],
    selTaglist: [],
    isAdd: true,//是否新加
    showLoading: false,
    hiddenCircle: true,
    info: { "title": '', "content": '' },
    circleIds: [],
    questionId: '',
    circleid: null, //获取发布再哪个圈子的id
    isc: true,
    fabu: true,
    conmpanyid: null,//公司id
    showImages: null,
    imgArr: [],
    num: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.info(options.id)
    this.setData({
      conmpanyid: options.id
    })
    var that = this;
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo) {
      //更新数据
      if (userInfo) {
        that.setData({
          userInfo: userInfo
        })
        that.init()
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
    arr = []
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
    if (that.data.conmpanyid) {
      /**
           * 获取企业展示
           */
      wx.request({
        url: app.globalData.javahost + '/user/verify/company/show',
        method: 'POST',
        data: {
          "companyInfoId": that.data.conmpanyid
        },
        header: {
          'content-type': 'application/json',
          'cookie': 'JSESSIONID=' + app.globalData.session
        },
        success: function (_res) {
          console.info(_res)
          if (_res.data.success) {
            console.info(_res.data)
            that.setData({
              showImages: _res.data.data
            })
          }
        }
      })

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
              that.formSubmit();//保存
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
   * 保存问题
   */
  formSubmit: function (e) {
    let that = this;
    let reqData = cacheData;
    reqData.companyInfoId = parseInt(that.data.conmpanyid);
    // reqData.images = that.data.imageList.join(';');
    reqData.images = that.data.imageList;
    console.info(reqData)
    // wx.request({
    //   url: app.globalData.javahost + '/user/verify/up/images',
    //   method: 'POST',
    //   data: reqData,
    //   header: {
    //     'content-type': 'application/json',
    //     'cookie': 'JSESSIONID=' + app.globalData.session
    //   },
    //   success: function (res) {
    //     console.info(res)
    //     if (res.data.success) {
    //       wx.showToast({
    //         title: "添加成功",
    //         duration: 2000
    //       })
    //       setTimeout(function () {
    //         // wx.navigateBack({})
    //       }, 2000)
    //     } else {

    //     }

    //   }
    // })

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
   * 取消删除
   */
  to_cancel() {
    wx.navigateBack({})
  },
  /**
   * 选择删除图片
   */
  chooseImg(e) {
    let id = e.currentTarget.dataset.id
    _num += 1;
    is_jishu = _num % 2;
    this.setData({
      num: is_jishu
    })
    for (var i = 0; i < arr.length + 1; i++) {
      console.info(arr.indexOf(id))
      if (arr.indexOf(id) < 0) {
        arr.push(id)
      }
    }
    this.setData({
      imgArr: arr
    })
    console.info(this.data.imgArr)
    console.info(this.data.num)
  },
  /**
   * 删除图片
   */
  to_deleteImg() {
    let that = this;
    if (that.data.imgArr.length != 0) {
      wx.request({
        url: app.globalData.javahost + '/user/verify/del/company/images',
        method: 'POST',
        data: { "companyImagesIds": that.data.imgArr },
        header: {
          'content-type': 'application/json',
          'cookie': 'JSESSIONID=' + app.globalData.session
        },
        success: function (res) {
          console.info(res)
          if (res.data.success) {
            wx.showToast({
              title: "删除成功",
              duration: 2000
            })
            setTimeout(function () {
              wx.navigateBack({})
            }, 2000)
          } else {

          }

        }
      })
    } else {
      wx.showToast({
        title: '请选择图片',
      })
    }

  }
})