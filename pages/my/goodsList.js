let util = require('../../utils/util.js');
let app = getApp();
let reqData = {}, cache;
let allList = [];

Page({
  data: {
    userInfo: {},
    allList: [],
    listHasMore: true,
    listLoading: true,
    isInit: false,
    showLoading: true
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
        if (typeof options.userId != 'undefined') {
          that.setData({
            userId: parseInt(options.userId)            
          })
          that.init();
        } else {
          that.setData({
            userId: userInfo.userId
          })
          that.init();
        }
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
    if (this.data.userInfo && this.data.isInit) {
      this.init();
    }
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
    this.init();
    wx.stopPullDownRefresh()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    reqData.currentPage = reqData.currentPage + 1;
    this.getList();
  },

  /**
   * 初始
   */
  init: function () {
    let that = this;
    allList = [];
    reqData = {
      "currentPage": 1,
      "pageSize": app.globalData.pageSize,
      "conditons": [{ "field": "userId", "value": that.data.userId }]
    }
    this.setData({
      listHasMore: true
    })
    this.getList();
  },
  /**
   * 获取列表
   */
  getList: function () {
    let that = this;
    if (that.data.listHasMore) {
      that.setData({
        listLoading: true
      });
      wx.request({
        url: app.globalData.javahost + '/user/product/page',
        method: 'POST',
        data: reqData,
        header: {
          'content-type': 'application/json',
          'cookie': 'JSESSIONID=' + app.globalData.session
        },
        success: function (res) {
          if (res.data.success) {
            for (let i = 0; i < res.data.data.list.length; i++) {
              cache = res.data.data.list[i];
              cache.createTime = util.getDateDiff(cache.createTime);
              cache.images= cache.images ? cache.images.split(";") : [],
              allList.push(cache);
            }
            that.setData({
              allList: allList,
              listHasMore: res.data.data.currentPage >= res.data.data.pageCount ? false : true,
              loadingHidden: true,
              listLoading: false,
              isInit: true
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
      this.setData({
        listLoading: false
      });
    }

  },
  /**
   * 去编辑
   */
  goEdit:function(e){
    wx.navigateTo({
      url: '/pages/my/setGoods?productId=' + e.currentTarget.dataset.id
    })
  },
  /**
 * 删除商品
 */
  remove: function (e) {
    let that = this;
    let id = parseInt(e.currentTarget.dataset.id)
    let index = parseInt(e.currentTarget.dataset.index)
    wx.showModal({
      content: '确认删除吗？',
      success: function (res) {
        if (res.confirm) {
          wx.request({
            url: app.globalData.javahost + '/user/product/delete',
            method: 'POST',
            data: {
              "productIds": [id]
            },
            header: {
              'content-type': 'application/json',
              'cookie': 'JSESSIONID=' + app.globalData.session
            },
            success: function (res) {
              console.info(res)
              if (res.data.success) {
                that.data.allList.splice(index, 1);
                that.setData({
                  allList: that.data.allList
                })
                wx.showToast({
                  title: "删除成功",
                  duration: 2000
                })
              } else {
                wx.showModal({
                  content: res.data.errorMsg,
                  showCancel: false,
                  confirmText: "确定"
                })
              }
            }
          })
        } else if (res.cancel) {

        }
      }
    })
   

  },
  /*
添加足迹 */
  addGoodsList: function () {
    wx.navigateTo({
      url: '/pages/my/setGoods'
    })
  },
  /**
* 查看大图
*/
  previewImage: function (e) {
    var current = e.target.dataset.src;
    let urls = e.target.dataset.urls;
    wx.previewImage({
      current: current,
      urls: urls
    })
  },
  toVideo(e) {
    console.info(e)
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/home_page/video/video?id=' + id,
    })
  }
})